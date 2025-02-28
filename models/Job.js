import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
    default: "Full-time"
  },
  status: {
    type: String,
    enum: [
      "Not Applied", 
      "Applied", 
      "No Response", 
      "Phone Screen", 
      "Interview", 
      "Final Round", 
      "Offer", 
      "Accepted", 
      "Rejected", 
      "Declined"
    ],
    default: "Not Applied"
  },
  jobUrl: {
    type: String,
    trim: true
  },
  applicationDate: {
    type: Date,
    default: null
  },
  applicationSource: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  nextActionDate: {
    type: Date
  },
  nextActionStep: {  // Added this field
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Job || mongoose.model("Job", jobSchema);