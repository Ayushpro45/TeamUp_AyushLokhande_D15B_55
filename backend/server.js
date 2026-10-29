const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Team = require("./models/Team");
const Message = require("./models/Message");
require("dotenv").config();

const teamRoutes = require("./routes/teamRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// ─── Socket.IO Real-Time WebSockets (Exp 8 & Auth Restricted) ───────────────
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Enforce authentication on Socket.IO connection: only registered users who signed in can connect
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);

    if (!token) {
      return next(
        new Error("Authentication required: Please register or sign in to your profile to join squad chat.")
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(
        new Error("Registered account not found. Please register or sign in again.")
      );
    }

    // Attach verified user profile to the socket session
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
    };
    next();
  } catch (err) {
    return next(
      new Error("Invalid or expired session. Please sign in to your profile.")
    );
  }
});

// Helper to check if a user is enrolled in a squad (as leader or accepted member)
async function isUserEnrolledInTeam(userId, userRole, teamId) {
  if (userRole === "admin") return true; // Admins have platform-wide moderation access
  if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) return false;

  const team = await Team.findById(teamId);
  if (!team) return false;

  const uid = userId.toString();
  const isLeader = Boolean(team.createdBy && team.createdBy.toString() === uid);
  const isMember = Boolean(
    Array.isArray(team.members) &&
    team.members.some((m) => (m?._id ? m._id.toString() : m.toString()) === uid)
  );

  return isLeader || isMember;
}

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  console.log(`💬 User connected to Squad Chat: ${socket.user?.name} (${socket.user?.email}) [Socket ID: ${socket.id}]`);

  // Join a team-specific squad chat room (Enforces enrollment check)
  socket.on("joinTeam", async (teamId) => {
    if (!teamId) return;

    const allowed = await isUserEnrolledInTeam(socket.user.id, socket.user.role, teamId);
    if (!allowed) {
      console.warn(`Blocked socket ${socket.id} (${socket.user?.name}) from joining squad room ${teamId} (not enrolled)`);
      socket.emit("chatError", {
        message: "Access restricted: You can only join squad chat rooms where you are an enrolled member or leader.",
      });
      return;
    }

    socket.join(teamId);
    console.log(`Socket ${socket.id} (${socket.user?.name}) joined team room: ${teamId}`);
  });

  // Receive and broadcast chat messages (Strictly authenticated + Enrolled only)
  socket.on("chatMessage", async (data) => {
    if (!socket.user) {
      socket.emit("chatError", { message: "Unauthorized. Please sign in to chat." });
      return;
    }

    const messageData = typeof data === "string" ? { message: data } : data;
    if (!messageData.message || !messageData.message.trim()) return;

    const teamId = messageData.teamId;
    if (!teamId) {
      socket.emit("chatError", { message: "Team ID is required to send messages." });
      return;
    }

    const allowed = await isUserEnrolledInTeam(socket.user.id, socket.user.role, teamId);
    if (!allowed) {
      socket.emit("chatError", {
        message: "Forbidden: You are not enrolled in this squad. You can only chat in teams where you are a member.",
      });
      return;
    }

    const payload = {
      teamId: messageData.teamId,
      message: messageData.message.trim(),
      username: socket.user.name,
      userId: socket.user.id,
      userEmail: socket.user.email,
      userAvatar: socket.user.avatar,
      userRole: socket.user.role,
      isLeader: Boolean(messageData.isLeader),
      time: messageData.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Save message permanently to MongoDB Atlas
    try {
      const savedMsg = await Message.create({
        teamId: payload.teamId,
        sender: socket.user.id,
        username: socket.user.name,
        userEmail: socket.user.email,
        userAvatar: socket.user.avatar,
        userRole: socket.user.role,
        message: payload.message,
        isLeader: payload.isLeader,
        time: payload.time,
      });
      payload._id = savedMsg._id.toString();
    } catch (dbErr) {
      console.error("❌ Failed to save message in DB:", dbErr.message);
    }

    io.to(payload.teamId).emit("chatMessage", payload);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected from Squad Chat: ${socket.user?.name} (${socket.id})`);
  });
});

// ─── Security Headers (helmet) ─────────────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ─── Body Parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks

// ─── Rate Limiting ─────────────────────────────────────────────────────────
// Global limiter — 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints — 100 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// ─── Database Connection ───────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

// ─── Routes ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "TeamUp API is Running 🚀" });
});

app.use("/api/auth", authLimiter, authRoutes); // Auth routes
app.use("/api/users", authLimiter, authRoutes); // Alias for users endpoints
app.use("/api/user", userRoutes); // Exp 6 protected user & admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/hackathons", hackathonRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
// Must have 4 parameters for Express to treat it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("🔴 Error:", err.message);

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: origin not allowed.",
    });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error. Please try again later.",
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⚡ WebSocket Socket.IO active on port ${PORT}`);
});
