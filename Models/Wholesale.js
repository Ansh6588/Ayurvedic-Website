const mongoose = require('mongoose');

const wholesaleSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    products: [{
        name: String,
        quantity: Number
    }],
    orderQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Wholesale = mongoose.model('Wholesale', wholesaleSchema);
module.exports = Wholesale;
