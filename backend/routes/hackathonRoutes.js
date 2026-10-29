const express = require("express");
const router = express.Router();
const Hackathon = require("../models/Hackathon");

// 1. CREATE HACKATHON (POST /api/hackathons)
router.post("/", async (req, res) => {
  try {
    const hackathon = await Hackathon.create(req.body);
    res.status(201).json(hackathon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. GET ALL HACKATHONS (GET /api/hackathons)
router.get("/", async (req, res) => {
  try {
    const hackathons = await Hackathon.find();
    res.status(200).json(hackathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET HACKATHON BY ID (GET /api/hackathons/:id)
router.get("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. UPDATE HACKATHON (PUT /api/hackathons/:id)
router.put("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE HACKATHON (DELETE /api/hackathons/:id)
router.delete("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.status(200).json({ message: "Hackathon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
