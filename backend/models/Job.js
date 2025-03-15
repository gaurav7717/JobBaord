import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  job_title: String,
  company: String,
  location: String,
  experience: String,
  salary: String,
  URL: String,
  keyword: String,
  // Timestamp: Date, // Add this if you have a timestamp field
});

const Job = mongoose.model("Job", jobSchema, "job_listings"); // Ensure "job_listings" matches your collection name

export default Job;