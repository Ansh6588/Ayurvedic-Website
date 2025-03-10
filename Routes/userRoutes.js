const express = require("express");
const router = express.Router();
const User = require("../Models/User");

const ADMIN_EMAIL = "ansh@ayurveda.com"; 
const ADMIN_PASSWORD = "test123";

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

        // Save user to database (storing password as plaintext ⚠️)
        const user = new User({ fullName, email, password });
        await user.save();

        // Redirect to success page
        res.redirect("/register-success");

    } catch (error) {
        console.error(error);
        res.render("register", { message: "Something went wrong, try again!" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        

        // Check if admin is logging in
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            req.session.user = { name: "Admin", email: ADMIN_EMAIL };
            
            return res.redirect("/admin");
        }

        // Find user by email in the database
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found in database.");
            return res.render("home", { message: "Invalid email or password" });
        }

        console.log(`User found: ${user.email}, Stored Password: ${user.password}, Entered Password: ${password}`);

        if (user.password !== password) {
            console.log("Password mismatch.");
            return res.render("home", { message: "Invalid email or password" });
        }

        // Store user session
        req.session.user = {
            name: user.fullName,
            email: user.email,
        };

        console.log("User logged in successfully!");
        res.redirect("/");

    } catch (error) {
        console.error("Error during login:", error);
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
