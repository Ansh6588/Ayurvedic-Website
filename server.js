const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require("./Models/User");
const Consultation = require("./Models/Consultation"); // Add this line for consultation model
const app = express();
const flash = require("connect-flash");

// Set up views and static files
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(flash());

// Session Middleware
app.use(session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true
}));

// Pass user session data to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ayurveda", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.get("/", (req, res) => {
    const userName = req.session.user ? req.session.user.name : null;
    res.render("home", { message: null, userName: userName });
});
const userRoutes = require("./Routes/userRoutes"); 
app.use("/", userRoutes);
const productroutes = require("./Routes/productroutes"); 
app.use("/", productroutes);
const courseroutes = require("./Routes/courseroutes"); 
app.use("/", courseroutes);
const wholesaleroutes = require("./Routes/wholesaleroutes"); 
app.use("/", wholesaleroutes);
const doctorroutes = require("./Routes/doctorroutes"); 
const JobApplication = require('./Models/Doctor');
app.use("/", doctorroutes);
const consultationroutes = require('./Routes/consultationroute');
app.use('/consultation', consultationroutes);
const paymentroutes=require("./Routes/paymentroutes");
app.use("/",paymentroutes); 
const newsletterroutes=require("./Routes/consultationroute");
app.use("/",newsletterroutes)

// Page Routes


const ADMIN_EMAIL = "ansh@ayurveda.com"; 
const ADMIN_PASSWORD = "test123";





// Success Page
// Update your success route to include booking and doctor data


// Other Page Routes
app.get('/aboutus', (req, res) => res.render("aboutUs"));
app.get('/payment', (req, res) => res.render("payment"));
app.get('/apply-success', (req, res) => res.render("apply-success"));
app.get('/doctorapply', (req, res) => res.render("doctorapply"));
app.get('/wholesale', (req, res) => res.render("wholesale"));
app.get('/softwaredeveloper', (req, res) => res.render("softwaredeveloper"));

app.get('/community', (req, res) => res.render("community"));
app.get('/jobOpportunities', (req, res) => res.render("jobOpportunities"));
app.get('/location', (req, res) => res.render("location"));
app.get('/register', (req, res) => res.render("register"));
app.get('/register-success', (req, res) => res.render("register-success")); 

// Admin Route
app.get("/admin", async (req, res) => {
    try {
        if (!req.session.user || req.session.user.email !== ADMIN_EMAIL) {
            return res.redirect("/");
        }

        const users = await User.find();
        const applications = await JobApplication.find();
        const consultations = await Consultation.find().populate('doctor'); // Get all consultations
        
        res.render("admin", { 
            users, 
            applications, 
            consultations,
            messages: req.flash() 
        });

    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.render("admin", { 
            users: [], 
            applications: [],
            consultations: [],
            messages: req.flash() 
        });
    }
});

// Newsletter Routes
const newsletterRoutes = require('./Routes/newsletter');
app.use('/', newsletterRoutes);

// Start Server
const port = 5050;
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));