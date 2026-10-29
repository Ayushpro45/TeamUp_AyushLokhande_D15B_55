const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: "",
    },
    userAvatar: {
      type: String,
      default: "",
    },
    userRole: {
      type: String,
      default: "user",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isLeader: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

