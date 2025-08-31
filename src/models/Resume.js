// models/Resume.js
import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },        
    publicId: { type: String, required: true },   
    originalName: { type: String, required: true },
    fileType: { type: String, default: "application/pdf" },
    size: { type: Number, default: 0 },
    extractedText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "resumes" }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
