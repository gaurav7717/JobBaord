// backend/routes/jobs.js
import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ Timestamp: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err); // Added error logging
    res.status(500).json({ message: err.message });
  }
});

export default router;