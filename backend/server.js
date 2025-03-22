// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";
import cron from "node-cron";
import { exec } from "child_process";
import fs from 'fs'; // Import the 'fs' module for file system operations

dotenv.config();
const app = express();

// Configure CORS to allow requests from specified origins
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://job-baord.vercel.app",
  ],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/", jobRoutes);

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'job_board'
})
  .then(() => {
    console.log("MongoDB Connected");

    // Fetch and save skills on server start
    const Job = mongoose.model('Job'); // Assuming your job model is named 'Job'

    Job.find({}, 'skills') // Fetch only the 'skills' field from all documents
      .exec()
      .then(jobs => {
        const newSkillsSet = new Set();
        jobs.forEach(job => {
          if (job.skills && Array.isArray(job.skills)) {
            job.skills.forEach(skill => newSkillsSet.add(skill));
          }
        });

        // Read existing skills from skills.json if it exists
        const skillsFilePath = './predict/skills.json';
        let existingData = {
          technologies: [],
          tools: [],
          certifications: []
        };

        if (fs.existsSync(skillsFilePath)) {
          try {
            const data = fs.readFileSync(skillsFilePath, 'utf8');
            existingData = JSON.parse(data);
          } catch (readErr) {
            console.error("Error reading or parsing skills.json:", readErr);
          }
        }

        // Merge the new skills with the existing "technologies"
        const combinedTechnologiesSet = new Set([
          ...existingData.technologies,
          ...Array.from(newSkillsSet)
        ]);

        // Update only the "technologies" field while preserving "tools" and "certifications"
        const updatedData = {
          ...existingData,
          technologies: Array.from(combinedTechnologiesSet)
        };

        // Write the updated data back to skills.json
        fs.writeFile(skillsFilePath, JSON.stringify(updatedData, null, 4), (err) => {
          if (err) {
            console.error('Error saving skills to skills.json:', err);
          } else {
            console.log('Successfully updated technologies in skills.json');
          }
        });
      })
      .catch(err => {
        console.error('Error fetching job skills:', err);
      });
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Job Board API is running...");
});

// Schedule the Python script to run at 2:00 AM (commented out)
// cron.schedule("0 2 * * *", () => {
//   console.log("Running Python script at 2:00 AM");
//   exec("python scraper\\scraper.py", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.error(`stderr: ${stderr}`);
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// http://localhost:3000/
// https://job-baord.vercel.app/
// Include these URLs in CORS origin to allow accessing the backend deployed in a render container
