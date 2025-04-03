const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const NewsletterSubscriber = require("../Models/Subscriber"); // Adjust path as needed

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "pranav007ss@gmail.com", // Your email
        pass: "zekw ryqe aknh mnsx", // Your app password
    },
});

router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.render("newsletter", { 
            messages: { error: "⚠️ Please enter a valid email address." } 
        });
    }

    try {
        // Check if email already exists in database
        const existingSubscriber = await NewsletterSubscriber.findOne({ email });
        
        if (existingSubscriber) {
            return res.render("newsletter", { 
                messages: { error: "⚠️ This email is already subscribed." } 
            });
        }

        // Create new subscriber
        const newSubscriber = new NewsletterSubscriber({ email });
        await newSubscriber.save();

        // Send confirmation email
        const mailOptions = {
            from: "pranav007ss@gmail.com",
            to: email,
            subject: "🎉 Welcome to Our Newsletter!",
            html: `
                <h2>Congratulations! 🎉</h2>
                <p>You've successfully subscribed to our Ayurvedic Newsletter.</p>
                <p>Stay tuned for exclusive tips, offers, and updates!</p>
                <p>🌿 <strong>Ayurveda Care Team</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Newsletter confirmation sent to ${email}`);
        
        res.render("newsletter", { 
            messages: { success: "✅ Thank you for subscribing! Check your email." } 
        });

    } catch (error) {
        console.error("❌ Subscription error:", error);
        
        let errorMessage = "❌ Failed to process subscription. Please try again later.";
        if (error.code === 11000) { // MongoDB duplicate key error
            errorMessage = "⚠️ This email is already subscribed.";
        }
        
        res.render("newsletter", { 
            messages: { error: errorMessage } 
        });
    }
});

// GET route remains the same
router.get("/newsletter", (req, res) => {
    res.render("newsletter", { messages: {} });
});

module.exports = router;