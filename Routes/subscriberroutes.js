const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../Models/Subscriber');

// Handle newsletter subscription
router.post('/subscribe', async (req, res) => {
    try {
        const user = req.session.user; // Check if user is logged in

        if (!user) {
            const { email } = req.body;
            
            // Check if the email is already subscribed
            const existingSubscriber = await NewsletterSubscriber.findOne({ email });

            if (existingSubscriber) {
                return res.render('newsletter', { message: "You are already subscribed!" });
            }

            // Store email in the database
            await NewsletterSubscriber.create({ email });

            return res.render('newsletter', { message: "You have successfully registered!" });
        }

        return res.render('newsletter', { message: "You're already a registered user!" });
    } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
