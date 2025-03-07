const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    video: {
        fullVideoId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', required: true }, // Full video file ID from GridFS
        previewVideoId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', required: true }, // Preview video file ID from GridFS
        fullVideoDuration: { type: Number, required: true }, // Duration of full video (in seconds)
        previewVideoDuration: { type: Number, required: true } // Duration of preview video (in seconds)
    },
    purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of users who purchased the course
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Optional: Middleware to update the `updatedAt` field whenever the course is updated
CourseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Course", CourseSchema);
