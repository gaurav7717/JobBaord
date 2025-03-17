// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";
import cron from "node-cron";
import { exec } from "child_process";

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
app.use("/api/jobs", jobRoutes);

mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  dbName:'job_board'
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Job Board API is running...");
});

// Schedule the Python script to run at 2:00 AM
// cron.schedule("0 2 * * *", () => {
//     console.log("Running Python script at 2:00 AM");
//     exec("python scraper\\scraper.py", (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//       }
//       console.log(`stdout: ${stdout}`);
//       console.error(`stderr: ${stderr}`);
//     });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// http://localhost:3000/
// https://job-baord.vercel.app/
// include these urls in cors origin to allow accessing the backend deployed in a render container