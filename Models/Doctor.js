const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    image: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'fs.files', 
        required: true 
    },
    resume: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'fs.files', 
        required: true 
    },
    educationQualification: { 
        type: [String], 
        required: true 
    },
    specialty: {  // Added this field which is referenced in your routes
        type: String,
        required: false
    },
    experience: { 
        type: String, 
        required: false 
    },
    skills: { 
        type: [String], 
        required: false 
    },
    coverLetter: { 
        type: String, 
        required: false 
    },
    dateOfBirth: { 
        type: Date, 
        required: false 
    },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create the Doctor model using DoctorSchema
const Doctor = mongoose.model("Doctor", DoctorSchema,"Doctor");

module.exports = Doctor;