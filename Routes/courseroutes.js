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
        }
        else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
            cb(null, true);
          } 
        
        else {
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
    { name: "previewVideo", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Validate required fields
      const { title, description, price, fullVideoDuration, previewVideoDuration } = req.body;
      if (!title || !description || !price || !fullVideoDuration || !previewVideoDuration) {
        req.flash('error', 'All fields are required');
        return res.redirect('/admin');
      }
  
      // Validate files
      if (!req.files?.fullVideo?.[0] || !req.files?.previewVideo?.[0]) {
        req.flash('error', 'Both videos are required');
        return res.redirect('/admin');
      }
  
      // Helper function for GridFS upload
      const uploadToGridFS = (file) => {
        return new Promise((resolve, reject) => {
          const filename = `${Date.now()}-${file.originalname}`;
          const uploadStream = gridfsBucket.openUploadStream(filename);
          
          uploadStream.on('finish', () => resolve(uploadStream.id));
          uploadStream.on('error', reject);
          uploadStream.end(file.buffer);
        });
      };
  
      // Upload all files in parallel
      const [fullVideoId, previewVideoId, thumbnailId] = await Promise.all([
        uploadToGridFS(req.files.fullVideo[0]),
        uploadToGridFS(req.files.previewVideo[0]),
        req.files.thumbnail?.[0] ? uploadToGridFS(req.files.thumbnail[0]) : null
      ]);
  
      // Create and save course
      const newCourse = new Course({
        title,
        description,
        price: parseFloat(price),
        video: {
          fullVideoId,
          previewVideoId,
          fullVideoDuration: parseInt(fullVideoDuration),
          previewVideoDuration: parseInt(previewVideoDuration)
        },
        thumbnail: thumbnailId || undefined
      });
  
      await newCourse.save();
      
      // SUCCESS MESSAGE - This will show on admin page
      req.flash('success', 'Course uploaded successfully!');
      res.redirect('/admin');
  
    } catch (error) {
      console.error("Upload error:", error);
      
      // Handle specific error cases
      let errorMessage = "Failed to upload course";
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          errorMessage = "File size too large (max 100MB)";
        } else if (error.message.includes("video files")) {
          errorMessage = "Only video files are allowed for videos";
        }
      }
      
      req.flash('error', errorMessage);
      res.redirect('/admin');
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
