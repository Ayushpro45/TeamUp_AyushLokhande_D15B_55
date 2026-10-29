const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware — Protect routes
 * Expects: Authorization: Bearer <token>
 * Attaches decoded user (id, email, name, role) to req.user on success
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // Attach full user info including role
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware factory — Restrict access to specific roles
 * Usage: restrictTo('admin') or restrictTo('admin', 'user')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }
    next();
  };
};

const authorize = restrictTo;

module.exports = { protect, restrictTo, authorize };
