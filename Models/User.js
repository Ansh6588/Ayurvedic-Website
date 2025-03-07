const mongoose = require("mongoose");

// Assuming you have a Product and Course model defined elsewhere
const Course = require("./Course");
const Product = require("./Product");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    purchasedCourses: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ], // Stores the courses the user has purchased
    purchasedProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    ], // Stores the products the user has purchased
    // Optionally, you can add other fields such as a profile picture, address, etc.
});

module.exports = mongoose.model("User", UserSchema);
