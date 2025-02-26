import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Not Applied', 'Applied', 'No Response', 'Rejected', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted', 'Declined'],
    default: 'Not Applied'
  },
  salary: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  applicationDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  jobUrl: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
}, {
  timestamps: true
});

export default mongoose.models.Job || mongoose.model("Job", jobSchema);