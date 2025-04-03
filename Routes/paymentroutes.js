const express = require("express");
const router = express.Router();
const Consultation = require("../Models/Consultation");
const Product = require("../Models/Product");
const Course = require("../Models/Course");
const mongoose = require("mongoose");

router.get('/', async (req, res) => {
    try {
        const { bookingId, productId, courseId, amount } = req.query;
        
        // Validate amount
        if (!amount || isNaN(amount)) {
            req.flash('error', 'Invalid payment amount');
            return res.redirect('/');
        }

        // Prepare data object
        const data = {
            title: 'Complete Payment',
            amount: parseFloat(amount).toFixed(2),
            user: req.user || null,
            booking: null,
            product: null,
            course: null
        };

        // Check what type of purchase this is
        if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
            data.booking = await Consultation.findById(bookingId)
                .populate('doctor', 'fullName specialty');
        } 
        else if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            data.product = await Product.findById(productId);
        }
        else if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
            data.course = await Course.findById(courseId);
        }

        console.log('Rendering payment with:', data);
        res.render('payment', data);
        
    } catch (error) {
        console.error('Payment error:', error);
        req.flash('error', 'System error loading payment page');
        res.redirect('/');
    }
});
// Handle payment success
router.get('/success', async (req, res) => {
    try {
        console.log('--- PAYMENT SUCCESS ROUTE STARTED ---');
        console.log('Success route query params:', req.query);
        
        const { bookingId } = req.query;
        
        console.log('Processing payment success for booking:', bookingId);
        
        if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
            // Update payment status
            console.log('Updating payment status to paid for booking:', bookingId);
            await Consultation.findByIdAndUpdate(bookingId, {
                paymentStatus: 'paid',
                status: 'confirmed'
            });
            
            console.log('Redirecting to confirmation page');
            return res.redirect(`/consultation/confirmation/${bookingId}?payment=success`);
        }
        
        console.log('No valid bookingId, redirecting to consultation');
        res.redirect('/consultation');
    } catch (error) {
        console.error('!!! PAYMENT SUCCESS ERROR !!!');
        console.error('Error:', error);
        console.error('Error stack:', error.stack);
        res.redirect('/consultation');
    }
});

module.exports = router;