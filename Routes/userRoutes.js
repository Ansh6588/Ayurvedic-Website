const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User model

// Register User
router.post("/registeruser", async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.render("register", { message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register", { message: "Email already in use" });
        }

        // Save user to database (No hashing)
        const user = new User({ fullName, email, password });
        await user.save();

        // Redirect to success page
        res.redirect("/register-success");

    } catch (error) {
        res.render("register", { message: "Something went wrong, try again!" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password is correct
        if (!user || user.password !== password) {
            return res.render("home", { message: "Invalid email or password" });
        }

        // Store user info in session
        req.session.user = {
            name: user.fullName,
            email: user.email
        };

        // Redirect to home with user session
        res.redirect("/");

    } catch (error) {
        res.render("home", { message: "Something went wrong, try again!" });
    }
});

// Logout User
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/"); // Redirect to home after logout
    });
});

module.exports = router;
