// backend/routes/jobRoutes.js
// To use __dirname in ES Modules:
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import express from "express";
import Job from "../models/Job.js";
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises'; // Import the promises API from the fs module

const upload = multer({ dest: path.join(__dirname, '../uploads') }); // Use absolute path for now
const router = express.Router();

// Get all jobs
router.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ Timestamp: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err); // Added error logging
    res.status(500).json({ message: err.message });
  }
});

// Prediction endpoint using multer
router.post('/api/predict', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const resume = req.file; // The uploaded file is now in req.file
  const uploadPath = path.join(__dirname, '..', 'uploads', `${Date.now()}_${resume.originalname}`);

  try {
    // Move file using fs.promises.rename
    // const fs = require('fs').promises; // Removed the require statement
    await fs.rename(resume.path, uploadPath);

    // Use platform-independent path for Python script
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '..', 'predict', 'app.py'),
      uploadPath
    ]);

    let result = '';
    let error = '';

    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 || error) {
        return res.status(500).json({ error: error || 'Prediction failed' });
      }

      try {
        const prediction = JSON.parse(result);
       console.log(prediction)
        res.json(prediction);
      } catch (e) {
        res.status(500).json({ error: 'Invalid prediction response' });
      }
    });
  } catch (err) {
    console.error("Error processing upload:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;