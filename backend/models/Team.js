const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    membersCount: { type: Number, default: 1 },
    maxMembers: { type: Number, required: true },
    matchScore: { type: String, default: "90%" },
    rolesNeeded: { type: [String], default: [] },
    hackathonName: { type: String, required: true },
    // Legacy string fields kept for backward compat with seed data
    leaderName: { type: String },
    leaderAvatar: { type: String, default: "TU" },

    // ── Real user references ──────────────────────────────────────────────
    // Who created / leads this team (ref to User)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Confirmed team members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Join requests from users wanting to join
    joinRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          default: "",
        },
        note: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
