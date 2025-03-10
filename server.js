const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require("./Models/User"); 
const app = express();
const flash = require("connect-flash");

// Set up views and static files
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(flash());
// Session Middleware (Only Once)
app.use(session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true
}));

// Pass user session data to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // User is accessible in all templates
    next();
});

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ayurveda", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
const userRoutes = require("./Routes/userRoutes"); 
app.use("/", userRoutes);
const productroutes = require("./Routes/productroutes"); 
app.use("/", productroutes);
// Page Routes
const courseroutes = require("./Routes/courseroutes"); 
app.use("/", courseroutes);
const wholesaleroutes = require("./Routes/wholesaleroutes"); 
app.use("/", wholesaleroutes);

app.get("/", (req, res) => {
    // Check if the user is logged in by checking the session
    const userName = req.session.user ? req.session.user.name : null;
    res.render("home", { message: null, userName: userName });
});
const ADMIN_EMAIL = "ansh@ayurveda.com"; 
const ADMIN_PASSWORD = "test123";
app.get('/aboutus', (req, res) => res.render("aboutUs"));
app.get('/wholesale', (req, res) => res.render("wholesale"));
app.get('/softwaredeveloper', (req, res) => res.render("softwaredeveloper"));
app.get('/newsletter', (req, res) => res.render("newsletter"));
app.get('/community', (req, res) => res.render("community"));
app.get('/jobOpportunities', (req, res) => res.render("jobOpportunities"));
app.get('/location', (req, res) => res.render("location"));
app.get('/register', (req, res) => res.render("register"));
app.get('/register-success', (req, res) => res.render("register-success")); 
app.get('/consultation', (req, res) => res.render("consultation"));
app.get("/admin", async (req, res) => {
    try {
        // Check if the user is logged in and is an admin
        if (!req.session.user || req.session.user.email !== ADMIN_EMAIL) {
            return res.redirect("/login"); // Redirect non-admin users to login
        }

        // Fetch all registered users from the database
        const users = await User.find();

        // Render admin.ejs and pass users list and flash messages
        res.render("admin", {
            users,
            messages: req.flash() // Pass flash messages to the template
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        // Render admin page with empty users array if an error occurs
        res.render("admin", { users: [], messages: req.flash() });
    }
});

// Start Server
const port = 5050;
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
