const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Fake database (Replace with actual DB logic)
const subscribers = [];

router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.render("newsletter", { messages: { error: "⚠️ Please enter a valid email address." } });
    }

    // Check if already subscribed
    if (subscribers.includes(email)) {
        return res.render("newsletter", { messages: { info: "ℹ️ You're already subscribed to our newsletter!" } });
    }

    subscribers.push(email); // Store the email

    // Nodemailer transporter setup (Directly use credentials here)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "pranav007ss@gmail.com", // Replace with your email
            pass: "zekw ryqe aknh mnsx", // Replace with your app password
        },
    });

    const mailOptions = {
        from: "pranav007ss@gmail.com", // Your email
        to: email, // Subscriber email
        subject: "🎉 Welcome to Our Newsletter!",
        html: `
            <h2>Congratulations! 🎉</h2>
            <p>You've successfully subscribed to our Ayurvedic Newsletter. Stay tuned for exclusive tips, offers, and updates!</p>
            <p>🌿 <strong>Ayurveda Care Team</strong></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Newsletter confirmation email sent to ${email}`);
        res.render("newsletter", { messages: { success: "✅ Thank you for subscribing! Check your email." } });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.render("newsletter", { messages: { error: "❌ Failed to send confirmation email. Please try again later." } });
    }
});

// Ensure GET request also passes `messages`
router.get("/newsletter", (req, res) => {
    res.render("newsletter", { messages: {} });
});

module.exports = router;
