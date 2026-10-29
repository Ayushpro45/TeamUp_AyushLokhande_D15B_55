const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const Message = require("../models/Message");
const Hackathon = require("../models/Hackathon");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// ─── GET /api/teams — Public ───────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate("createdBy", "name email avatar bio skills")
      .populate("members", "name email avatar bio skills")
      .populate("joinRequests.user", "name email avatar bio skills");
    res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/teams/:id — Public ──────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "name email avatar bio skills")
      .populate("members", "name email avatar bio skills")
      .populate("joinRequests.user", "name email avatar bio skills");
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/teams — Protected (logged-in users only) ───────────────────────
router.post("/", protect, async (req, res, next) => {
  try {
    const teamData = {
      ...req.body,
      createdBy: req.user.id,
      members: [req.user.id],
      leaderName: req.user.name,
      leaderAvatar: req.user.avatar || req.user.name.substring(0, 2).toUpperCase(),
    };
    const team = await Team.create(teamData);

    // Keep hackathons collection in sync with hackathonName
    if (teamData.hackathonName) {
      const trimmedHackathon = teamData.hackathonName.trim();
      const existingHackathon = await Hackathon.findOne({ name: trimmedHackathon });
      if (!existingHackathon) {
        await Hackathon.create({
          name: trimmedHackathon,
          organizer: "Community Organizer",
          theme: teamData.category || "General",
          registrationDeadline: "TBD",
          maxTeamSize: teamData.maxMembers || 4,
          mode: "Online",
          isOpen: true,
        });
      }
    }

    const populated = await team.populate("createdBy", "name email avatar");
    res.status(201).json({ success: true, team: populated });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/teams/:id — Protected (team creator only) ───────────────────────
router.put("/:id", protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    // Only team creator or admin can edit
    if (
      team.createdBy?.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "You can only edit your own team." });
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email avatar");

    res.status(200).json({ success: true, team: updated });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/teams/:id — Admin only ───────────────────────────────────────
router.delete("/:id", protect, restrictTo("admin"), async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });
    res.status(200).json({ success: true, message: "Team deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/teams/:id/join — Protected (request to join) ───────────────────
router.post("/:id/join", protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    // Prevent creator from requesting to join their own team
    if (team.createdBy?.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You are already the team leader." });
    }

    // Check if already a member
    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "You are already a member of this team." });
    }

    // Check if already requested
    const alreadyRequested = team.joinRequests.some(
      (r) => r.user.toString() === req.user.id.toString() && r.status === "pending"
    );
    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: "You already have a pending join request." });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ success: false, message: "This team is already full." });
    }

    const { role, note } = req.body;
    team.joinRequests.push({
      user: req.user.id,
      role: role || "",
      note: note || "",
      status: "pending",
    });
    await team.save();

    // Populate user details for response
    await team.populate("joinRequests.user", "name email avatar bio skills");

    res.status(200).json({ success: true, message: "Join request sent successfully.", team });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/teams/:id/join/:userId — Creator accepts/rejects ────────────────
router.put("/:id/join/:userId", protect, async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'." });
    }

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    // Only team creator or admin can manage requests
    if (
      team.createdBy?.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Only the team leader can manage join requests." });
    }

    const request = team.joinRequests.find(
      (r) => (r.user?._id?.toString() || r.user?.toString()) === req.params.userId
    );
    if (!request) {
      return res.status(404).json({ success: false, message: "Join request not found." });
    }

    request.status = status;

    if (status === "accepted") {
      const userObjectId = request.user?._id || request.user;
      if (!team.members.some((m) => (m._id?.toString() || m?.toString()) === userObjectId.toString())) {
        team.members.push(userObjectId);
        team.membersCount = team.members.length;
      }
    }

    await team.save();
    const updatedTeam = await Team.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar")
      .populate("joinRequests.user", "name email avatar bio skills");

    res.status(200).json({ success: true, message: `Join request ${status}.`, team: updatedTeam });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/teams/:id/members — Team Leader or Admin ─────────────────────────
router.get("/:id/members", protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "name email avatar bio skills role createdAt")
      .populate("members", "name email avatar bio skills role createdAt")
      .populate("joinRequests.user", "name email avatar bio skills");

    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    const uid = req.user.id.toString();
    const isLeader = team.createdBy?._id?.toString() === uid || team.createdBy?.toString() === uid;
    const isMember = Array.isArray(team.members) && team.members.some(m => (m._id ? m._id.toString() : m.toString()) === uid);

    if (!isLeader && !isMember && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Only squad members and leaders can view full member details." });
    }

    res.status(200).json({
      success: true,
      team: {
        id: team._id,
        title: team.title,
        createdBy: team.createdBy,
        members: team.members,
        joinRequests: team.joinRequests,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/teams/:id/members/:userId — Team Leader or Admin removes a member ───
router.delete("/:id/members/:userId", protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    const uid = req.user.id.toString();
    const isLeader = team.createdBy?.toString() === uid;
    const isAdmin = req.user.role === "admin";

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the team leader or an admin can remove squad members.",
      });
    }

    const memberIdToRemove = req.params.userId.toString();

    // Prevent removing the team creator/leader themselves
    if (team.createdBy?.toString() === memberIdToRemove) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the team leader from the squad.",
      });
    }

    // Check if member is in team.members
    const isEnrolled = Array.isArray(team.members) && team.members.some(
      (m) => (m._id ? m._id.toString() : m.toString()) === memberIdToRemove
    );

    if (!isEnrolled) {
      return res.status(404).json({
        success: false,
        message: "Member is not currently in this squad.",
      });
    }

    // Remove from team.members
    team.members = team.members.filter(
      (m) => (m._id ? m._id.toString() : m.toString()) !== memberIdToRemove
    );
    team.membersCount = team.members.length;

    // Update any accepted join request for this user to rejected
    if (Array.isArray(team.joinRequests)) {
      team.joinRequests.forEach((r) => {
        const rUid = r.user?._id ? r.user._id.toString() : r.user ? r.user.toString() : "";
        if (rUid === memberIdToRemove && r.status === "accepted") {
          r.status = "rejected";
        }
      });
    }

    await team.save();

    const updatedTeam = await Team.findById(req.params.id)
      .populate("createdBy", "name email avatar bio skills role createdAt")
      .populate("members", "name email avatar bio skills role createdAt")
      .populate("joinRequests.user", "name email avatar bio skills");

    res.status(200).json({
      success: true,
      message: "Teammate successfully removed from squad.",
      team: updatedTeam,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/teams/:id/messages — Load Squad Chat History ───────────────────
router.get("/:id/messages", protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });

    const uid = req.user.id.toString();
    const isLeader = team.createdBy?.toString() === uid;
    const isMember =
      Array.isArray(team.members) &&
      team.members.some((m) => (m?._id ? m._id.toString() : m.toString()) === uid);

    if (!isLeader && !isMember && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not enrolled in this squad.",
      });
    }

    const messages = await Message.find({ teamId: req.params.id })
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
