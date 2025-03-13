const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', required: true }, // Store image as GridFS file ID
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', required: true }, // Store resume as GridFS file ID
    educationQualification: { type: [String], required: true }, // Now it's an array to allow multiple qualifications
    experience: { type: String, required: false }, // Professional experience (optional)
    skills: { type: [String], required: false }, // List of skills (optional)
    coverLetter: { type: String, required: false }, // Cover letter (optional)
    dateOfBirth: { type: Date, required: false }, // Date of birth (optional)
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
module.exports = JobApplication;
