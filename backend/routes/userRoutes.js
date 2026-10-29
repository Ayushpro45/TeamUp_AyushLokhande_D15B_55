const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ─── USER + ADMIN: GET / POST /api/user/dashboard ───────────────────────────
router.all("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard",
    user: req.user,
  });
});

// ─── ADMIN ONLY: GET / POST /api/user/admin ─────────────────────────────────
router.all("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin! You can access this page.",
  });
});

module.exports = router;
