import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from "express";
import Job from "../models/Job.js";
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({ dest: path.join(__dirname, '../uploads') });
const router = express.Router();

// Get all jobs
router.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ Timestamp: -1 });
        res.json(jobs);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ message: "Failed to fetch jobs." });
    }
});

// Prediction endpoint using multer
router.post('/api/predict', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const resume = req.file;
    const uploadPath = path.join(__dirname, '..', 'uploads', `${Date.now()}_${resume.originalname}`);

    try {
        console.log(`Renaming file from ${resume.path} to ${uploadPath}`);
        await fs.rename(resume.path, uploadPath);
        console.log(`File renamed successfully: ${uploadPath}`);

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
            console.log(`Python process exited with code: ${code}`);

            if (code !== 0 || error) {
                console.error(`Python process error: ${error}`);
                // Include python error in the response.
                return res.status(500).json({ error: `Prediction failed. Python process error: ${error}` });
            }

            try {
                const prediction = JSON.parse(result);
                console.log("Prediction from python script:", prediction);
                res.json(prediction);
            } catch (e) {
                console.error("Error parsing prediction:", e);
                return res.status(500).json({ error: 'Invalid prediction response from python script.' });
            }
        });

        pythonProcess.on('error', (err) => {
            console.error("Failed to start python process:", err);
            return res.status(500).json({ error: 'Failed to start prediction process.' });
        });

    } catch (err) {
        console.error("Error processing upload:", err);
        res.status(500).json({ error: `File upload or processing failed: ${err.message}` });
    }
});

export default router;