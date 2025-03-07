const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Course = require("../Models/Course"); // Your Course model
const router = express.Router();

// Initialize GridFSBucket after connection
let gridfsBucket;
mongoose.connection.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads"  // Specify the 'uploads' collection for GridFS
    });
});

// Custom Multer storage handler to upload files to GridFS
const storage = multer.memoryStorage(); // Store the file in memory temporarily

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only accept video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error("Only video files are allowed"), false);
        }
    }
});
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
// Populate the previewVideoId
        res.render("courses", { courses }); // Render courses page with data
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Route for uploading course videos (both full and preview videos)
router.post("/upload-course", upload.fields([
    { name: "fullVideo", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files.fullVideo || !req.files.previewVideo) {
            return res.status(400).send("Both full video and preview video must be uploaded");
        }

        const fullVideoFile = req.files.fullVideo[0];  // Get full video file
        const previewVideoFile = req.files.previewVideo[0];  // Get preview video file

        // Upload the full video to GridFS
        const fullVideoFilename = `${Date.now()}-${fullVideoFile.originalname}`;
        const fullVideoStream = gridfsBucket.openUploadStream(fullVideoFilename);
        fullVideoStream.write(fullVideoFile.buffer);
        fullVideoStream.end();

        fullVideoStream.on("finish", async () => {
            const fullVideoId = fullVideoStream.id;

            // Upload the preview video to GridFS
            const previewVideoFilename = `${Date.now()}-${previewVideoFile.originalname}`;
            const previewVideoStream = gridfsBucket.openUploadStream(previewVideoFilename);
            previewVideoStream.write(previewVideoFile.buffer);
            previewVideoStream.end();

            previewVideoStream.on("finish", async () => {
                const previewVideoId = previewVideoStream.id;

                const { title, description, price, fullVideoDuration, previewVideoDuration } = req.body;

                // Create the course with the uploaded video files' IDs
                const newCourse = new Course({
                    title,
                    description,
                    price: parseFloat(price),
                    video: {
                        fullVideoId,
                        previewVideoId,  // Store preview video ID
                        fullVideoDuration: parseInt(fullVideoDuration),
                        previewVideoDuration: parseInt(previewVideoDuration)
                    }
                });

                await newCourse.save();
                req.flash("success", "Course uploaded successfully!");
                res.redirect("/admin");  // Redirect after saving the course
            });

            previewVideoStream.on("error", (err) => {
                console.error("Error uploading preview video:", err);
                res.status(500).send("Error uploading preview video");
            });
        });

        fullVideoStream.on("error", (err) => {
            console.error("Error uploading full video:", err);
            res.status(500).send("Error uploading full video");
        });
    } catch (error) {
        console.error("Error uploading course:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Serve Course Preview Video (if applicable)
router.get("/courses/:courseId/preview", async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course || !course.video.previewVideoId) {
            return res.status(404).send("Preview video not found");
        }

        const fileId = course.video.previewVideoId; // ✅ Use directly

        const fileStream = gridfsBucket.openDownloadStream(fileId);
        res.set("Content-Type", "video/mp4"); // Adjust MIME type if needed
        fileStream.pipe(res);
    } catch (error) {
        console.error("Error fetching preview video:", error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;
