const mongoose = require("mongoose");
const Team = require("./models/Team");
const Hackathon = require("./models/Hackathon");
require("dotenv").config();

const INITIAL_TEAMS = [
  {
    title: "Waste-Wise",
    tagline: "Smart AI waste sorting platform & automated recycling logistics",
    description:
      "Waste-Wise leverages computer vision models deployed on edge devices to automatically classify municipal waste streams and route recyclable materials efficiently, cutting landfill contamination by 40%.",
    category: "AI / Sustainability",
    membersCount: 3,
    maxMembers: 5,
    matchScore: "96%",
    rolesNeeded: ["Computer Vision Specialist", "Fullstack Dev"],
    hackathonName: "EcoTech Global Hack",
    leaderName: "Elena Rostova",
    leaderAvatar: "ER",
  },
  {
    title: "Breathing Prism",
    tagline:
      "Interactive AR/VR bio-feedback relaxation experience & light sculpture",
    description:
      "Breathing Prism synthesizes real-time heart rate variability (HRV) bio-feedback into interactive WebXR spatial geometry, guiding users into calm meditative states through generative soundscapes.",
    category: "AR/VR / Health",
    membersCount: 2,
    maxMembers: 4,
    matchScore: "94%",
    rolesNeeded: ["Unity / 3D Developer", "Audio Engineer"],
    hackathonName: "Metaverse Health Hack 2026",
    leaderName: "Marcus Vance",
    leaderAvatar: "MV",
  },
  {
    title: "CodeFlow AI",
    tagline:
      "Autonomous multi-agent code reviewer & architectural documentation pipeline",
    description:
      "CodeFlow orchestrates specialized AI coding subagents to perform static security analysis, generate automated unit tests, and maintain living diagrammatic documentation on every pull request.",
    category: "DevTools / Open Source",
    membersCount: 2,
    maxMembers: 3,
    matchScore: "98%",
    rolesNeeded: ["TypeScript Specialist", "LLM Prompt Architect"],
    hackathonName: "DevCon AI Builder Sprint",
    leaderName: "Sarah Chen",
    leaderAvatar: "SC",
  },
  {
    title: "ChainPulse",
    tagline:
      "Zero-knowledge cross-chain liquidity aggregator for decentralized finance",
    description:
      "ChainPulse uses Succinct ZK proofs to verify state across L1/L2 networks asynchronously, enabling gas-optimized liquidity rebalancing with zero slippage.",
    category: "Web3 / Blockchain",
    membersCount: 4,
    maxMembers: 5,
    matchScore: "92%",
    rolesNeeded: ["Solidity Audit Lead", "Rust Backend Developer"],
    hackathonName: "ETH Global Hackathon",
    leaderName: "Devon Wright",
    leaderAvatar: "DW",
  },
  {
    title: "HealthSync",
    tagline:
      "Privacy-first federated medical data analytics & patient trial matching",
    description:
      "HealthSync allows clinical research institutions to train diagnostic models securely across encrypted hospital nodes without centralizing sensitive patient records.",
    category: "HealthTech",
    membersCount: 3,
    maxMembers: 4,
    matchScore: "95%",
    rolesNeeded: ["Privacy Preserving ML Eng", "UI/UX Designer"],
    hackathonName: "BioMed AI Hack",
    leaderName: "Priya Sharma",
    leaderAvatar: "PS",
  },
  {
    title: "EcoSprint",
    tagline: "Real-time carbon footprint tracker with gamified community rewards",
    description:
      "EcoSprint calculates commuting and consumption carbon metrics via connected IoT data streams, rewarding eco-friendly micro-habits with verified community badges.",
    category: "Sustainability",
    membersCount: 1,
    maxMembers: 4,
    matchScore: "90%",
    rolesNeeded: ["React Native Developer", "Data Analyst"],
    hackathonName: "Climate Tech Challenge",
    leaderName: "Lucas Dubois",
    leaderAvatar: "LD",
  },
];

const INITIAL_HACKATHONS = [
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

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas Connected");

    // Clear existing test/duplicate teams first (keep only seeded ones)
    await Team.deleteMany({});
    console.log("Cleared existing teams");

    const insertedTeams = await Team.insertMany(INITIAL_TEAMS);
    console.log(`\n✅ Successfully seeded ${insertedTeams.length} teams to MongoDB Atlas:\n`);
    insertedTeams.forEach((team, i) => {
      console.log(`  ${i + 1}. ${team.title} (_id: ${team._id})`);
    });

    // Seed hackathons
    await Hackathon.deleteMany({});
    console.log("Cleared existing hackathons");

    const insertedHackathons = await Hackathon.insertMany(INITIAL_HACKATHONS);
    console.log(`\n✅ Successfully seeded ${insertedHackathons.length} hackathons to MongoDB Atlas:\n`);
    insertedHackathons.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.name} (_id: ${h._id})`);
    });

    await mongoose.disconnect();
    console.log("\n🎉 Done! Check MongoDB Atlas → Browse Collections → teams & hackathons");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedDB();
