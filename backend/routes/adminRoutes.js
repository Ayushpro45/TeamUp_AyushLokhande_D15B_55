const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Team = require("../models/Team");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All admin routes require: protect + restrictTo('admin')
router.use(protect, restrictTo("admin"));

// ─── GET /api/admin/users — List all users ─────────────────────────────────────
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().select("name email avatar role bio skills createdAt").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/teams — List all teams with creator info ───────────────────
router.get("/teams", async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/teams/:id — Force-delete any team ──────────────────────
router.delete("/teams/:id", async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });
    res.status(200).json({ success: true, message: `Team "${team.title}" deleted by admin.` });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/users/:id — Delete a user from platform ─────────────────
router.delete("/users/:id", async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Safety guard: Admin cannot delete their own active session
    if (targetUser._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account while logged in.",
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    // Clean up user references in teams
    await Promise.all([
      // Delete any teams created by this user
      Team.deleteMany({ createdBy: req.params.id }),
      // Remove user from team memberships and decrement member count
      Team.updateMany(
        { members: req.params.id },
        { $pull: { members: req.params.id }, $inc: { membersCount: -1 } }
      ),
      // Remove any join requests submitted by this user
      Team.updateMany({}, { $pull: { joinRequests: { user: req.params.id } } }),
    ]);

    res.status(200).json({
      success: true,
      message: `User "${targetUser.name}" (${targetUser.email}) and associated data deleted by admin.`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
