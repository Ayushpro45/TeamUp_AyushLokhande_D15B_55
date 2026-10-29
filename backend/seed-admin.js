/**
 * seed-admin.js
 * Creates the pre-assigned admin account from .env variables.
 * Safe to run multiple times — skips if admin already exists.
 *
 * Usage: node seed-admin.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function seedAdmin() {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "❌ Missing required env vars: MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD"
    );
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB Connected");

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`ℹ️  Admin account already exists: ${ADMIN_EMAIL}`);
    } else {
      // Upgrade to admin if account exists as regular user
      existing.role = "admin";
      await existing.save();
      console.log(`✅ Existing user upgraded to admin: ${ADMIN_EMAIL}`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      avatar: (ADMIN_NAME || "AD").substring(0, 2).toUpperCase(),
    });
    console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.log("✅ Done. Admin account is ready.");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
