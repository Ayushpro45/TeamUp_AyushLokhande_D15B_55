/**
 * seed-hackathons.js
 * Populates the Hackathon collection in MongoDB Atlas.
 * Safe to run multiple times (checks for existing hackathons by name).
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Hackathon = require("./models/Hackathon");

const HACKATHONS = [
  {
    name: "EcoTech Global Hack",
    organizer: "EcoTech Foundation",
    theme: "AI / Sustainability",
    description:
      "Build scalable AI solutions addressing climate change, municipal waste sorting, and circular economy challenges.",
    prizePool: "$25,000",
    registrationDeadline: "2026-11-15",
    maxTeamSize: 5,
    mode: "Online",
    isOpen: true,
  },
  {
    name: "ETH Global Hackathon",
    organizer: "ETHGlobal",
    theme: "Web3 / Blockchain",
    description:
      "The premier global hackathon for decentralized finance, zero-knowledge proofs, and Web3 infrastructure.",
    prizePool: "$50,000",
    registrationDeadline: "2026-11-20",
    maxTeamSize: 5,
    mode: "Hybrid",
    isOpen: true,
  },
  {
    name: "Global AI Sprint",
    organizer: "TechSprint Alliance",
    theme: "AI / ML",
    description:
      "Accelerate autonomous AI agents, LLM applications, and generative AI workflows for real-world impact.",
    prizePool: "$30,000",
    registrationDeadline: "2026-12-01",
    maxTeamSize: 4,
    mode: "Online",
    isOpen: true,
  },
];

async function seedHackathons() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    for (const data of HACKATHONS) {
      const existing = await Hackathon.findOne({ name: data.name });
      if (!existing) {
        await Hackathon.create(data);
        console.log(`+ Added hackathon: ${data.name}`);
      } else {
        console.log(`ℹ️  Already exists: ${data.name}`);
      }
    }

    const total = await Hackathon.countDocuments();
    console.log(`\n🎉 Done! Total hackathons in Atlas: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed hackathons:", err.message);
    process.exit(1);
  }
}

seedHackathons();
