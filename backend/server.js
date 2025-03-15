import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";
import cron from "node-cron";
import { exec } from "child_process";
import winston from "winston"; // For logging

dotenv.config();
const app = express();

// Winston Logging Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'job-board-backend' },
  transports: [
    new winston.transports.Console(),
    // Add file transports for persistent logging if needed:
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// CORS Configuration (Corrected Origin)
// CORS Configuration
const allowedOrigins = [
  "https://job-board.vercel.app", // Your Vercel URL
  "http://localhost:3000", // Your local frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use("/api/jobs", jobRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'job_board',
})
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error(`MongoDB Connection Error: ${err}`));

// Basic API Route
app.get("/", (req, res) => {
  res.send("Job Board API is running...");
});

// Scheduled Python Script (Commented Out for Deployment Considerations)
// cron.schedule("0 2 * * *", () => {
//   logger.info("Running Python script at 2:00 AM");
//   exec("python scraper\\scraper.py", (error, stdout, stderr) => {
//     if (error) {
//       logger.error(`exec error: ${error}`);
//       return;
//     }
//     logger.info(`stdout: ${stdout}`);
//     logger.error(`stderr: ${stderr}`);
//   });
// });

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server Start (Using PORT from Environment or 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});