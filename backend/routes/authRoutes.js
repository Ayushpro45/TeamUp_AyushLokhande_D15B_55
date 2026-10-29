const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");

const router = express.Router();

// ─── Helper: sign a JWT (includes role) ───────────────────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const loginRules = [
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", registerRules, validate, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: name.substring(0, 2).toUpperCase(),
      role: role === "admin" ? "admin" : "user",
    });

    const token = signToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", loginRules, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/profile ─────────────────────────────────────────────────────
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/auth/profile — Update bio, skills & name ─────────────────────────
router.put("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { bio, skills, name } = req.body;

    if (name && typeof name === "string" && name.trim().length >= 2) {
      user.name = name.trim();
      user.avatar = user.name.substring(0, 2).toUpperCase();
    }

    if (typeof bio === "string") {
      if (bio.length > 300) {
        return res.status(400).json({ success: false, message: "Bio cannot exceed 300 characters." });
      }
      user.bio = bio.trim();
    }

    if (Array.isArray(skills)) {
      const cleanedSkills = Array.from(
        new Set(
          skills
            .filter((s) => typeof s === "string" && s.trim().length > 0)
            .map((s) => s.trim().substring(0, 30))
        )
      );
      user.skills = cleanedSkills;
    } else if (typeof skills === "string") {
      const parsed = Array.from(
        new Set(
          skills
            .split(",")
            .map((s) => s.trim().substring(0, 30))
            .filter((s) => s.length > 0)
        )
      );
      user.skills = parsed;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
