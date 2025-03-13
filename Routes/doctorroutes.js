const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const JobApplication = require("../Models/Doctor"); // Your Doctor model
const nodemailer = require("nodemailer");

const router = express.Router();

// Initialize GridFSBucket after connection
let gridfsBucket;
mongoose.connection.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads"  // Specify the 'uploads' collection for GridFS
    });
});

// Custom Multer storage handler to upload files to memory (for GridFS)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for both resume and image
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "resume" && !file.mimetype.includes("pdf")) {
            return cb(new Error("Only PDF resumes are allowed"), false);
        }
        if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    }
});

// Handle Job Application Submission
router.post("/applyDoctor", upload.fields([{ name: "resume" }, { name: "image" }]), async (req, res) => {
    try {
        const { fullName, email, phone, position, educationQualification, message } = req.body;

        // Check if files are uploaded
        if (!req.files || !req.files["resume"] || !req.files["image"]) {
            return res.status(400).send("Both resume and image upload are required.");
        }

        const resumeFile = req.files["resume"][0];  // Get resume file (in memory)
        const imageFile = req.files["image"][0];    // Get image file (in memory)

        // Upload the resume to GridFS
        const resumeFilename = `${Date.now()}-${resumeFile.originalname}`;
        const resumeStream = gridfsBucket.openUploadStream(resumeFilename);
        resumeStream.write(resumeFile.buffer);
        resumeStream.end();

        resumeStream.on("finish", async () => {
            const resumeFileId = resumeStream.id;

            // Upload the image to GridFS
            const imageFilename = `${Date.now()}-${imageFile.originalname}`;
            const imageStream = gridfsBucket.openUploadStream(imageFilename);
            imageStream.write(imageFile.buffer);
            imageStream.end();

            imageStream.on("finish", async () => {
                const imageFileId = imageStream.id;

                // Save application to database with GridFS file references
                const newApplication = new JobApplication({
                    fullName,
                    email,
                    phone,
                    position,  // Ensure this is received from the form
                    educationQualification,  // Ensure this is received from the form
                    message,  // Ensure this is received from the form
                    resume: resumeFileId,    // Save GridFS file ID for resume
                    image: imageFileId       // Save GridFS file ID for image
                });

                await newApplication.save();
                res.redirect("/apply-success");
            });

            imageStream.on("error", (err) => {
                console.error("Error uploading image:", err);
                res.status(500).send("Error uploading image.");
            });
        });

        resumeStream.on("error", (err) => {
            console.error("Error uploading resume:", err);
            res.status(500).send("Error uploading resume.");
        });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).send("Error submitting application.");
    }
});

// Route to fetch resume (PDF) from GridFS
router.get("/resume/:id", async (req, res) => {
    try {
        const fileId = new ObjectId(req.params.id);  // Get the file ID from the URL parameter
        const downloadStream = gridfsBucket.openDownloadStream(fileId);  // Open a stream to download the file

        // Set the content type (application/pdf for resumes)
        res.setHeader('Content-Type', 'application/pdf');

        downloadStream.pipe(res);  // Pipe the download stream to the response
    } catch (error) {
        console.error("Error with resume retrieval:", error);
        res.status(500).send("Error fetching resume.");
    }
});

// Route to fetch image from GridFS
router.get("/image/:id", async (req, res) => {
    try {
        const fileId = new ObjectId(req.params.id);  // Get the file ID from the URL parameter
        const downloadStream = gridfsBucket.openDownloadStream(fileId);  // Open a stream to download the file

        // Set appropriate content-type based on the file extension (image/* for images)
        res.setHeader("Content-Type", "image/jpeg"); // Assume JPEG images, can be adjusted

        downloadStream.pipe(res);  // Pipe the download stream to the response
    } catch (error) {
        console.error("Error with image retrieval:", error);
        res.status(500).send("Error fetching image.");
    }
});

// Approve application
router.post("/admin/applications/:id/approve", async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await JobApplication.findById(applicationId);

        // Make sure the application exists
        if (!application) {
            req.flash('error', 'Application not found!');
            return res.redirect('/admin');
        }

        // Logic to approve the application (e.g., updating the application status)
        application.status = 'Approved'; // Example update
        await application.save();

        req.flash('success', 'Application approved successfully!');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error approving application:', error);
        req.flash('error', 'An error occurred while approving the application.');
        res.redirect('/admin');
    }
});

// Reject application and delete
router.post("/applications/:id/reject", async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await JobApplication.findById(applicationId);

        if (!application) {
            return res.status(404).send("Application not found.");
        }

        // Send email to the user (email sending function)
        await sendRejectionEmail(application.email);

        // Delete the application from the database
        await JobApplication.findByIdAndDelete(applicationId);

        res.redirect("/admin"); // Redirect back to the dashboard
    } catch (error) {
        console.error("Error rejecting application:", error);
        res.status(500).send("Error rejecting application.");
    }
});

// Helper function to send the approval email
async function sendApprovalEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    await transporter.sendMail({
        from: 'no-reply@yourdomain.com',
        to: email,
        subject: 'Your Application has been Approved',
        text: 'Congratulations! Your application has been approved.',
    });
}

// Helper function to send the rejection email
async function sendRejectionEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    await transporter.sendMail({
        from: 'no-reply@yourdomain.com',
        to: email,
        subject: 'Your Application has been Rejected',
        text: 'Sorry, your application has been rejected. Please try again later.',
    });
}

module.exports = router;
