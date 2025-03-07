const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Decimal128, required: true },
    stock: { type: Number, required: true, min: 0 },
    image: { type: mongoose.Schema.Types.ObjectId }, // Store ObjectId reference for GridFS
    ingredients: { type: [String], required: false },
    benefits: { type: [String], required: false },
    usageInstructions: { type: String, required: false },
    manufacturer: { type: String, required: false },
    ratings: [{ user: String, rating: Number, review: String }],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;