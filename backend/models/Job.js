import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  job_title: String,
  company: String,
  location: String,
  experience: String,
  max_experience: Number,
  Timestamp: { type: Date, default: Date.now }
});

// Add indexes for better performance
jobSchema.index({ job_title: 'text', location: 'text' });
jobSchema.index({ max_experience: 1 });
jobSchema.index({ Timestamp: -1 });

const Job = mongoose.model("Job", jobSchema ,'job_listings');

export default Job;