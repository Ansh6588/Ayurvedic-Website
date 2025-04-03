const express = require('express');
const router = express.Router();
const Consultation = require('../Models/Consultation');
const Doctor = require('../Models/Doctor');


// GET consultation page
router.get('/', async (req, res) => {
    try {
        console.log('Fetching approved doctors...'); // Debug log
        const approvedDoctors = await Doctor.find({ status: "Approved" });
        console.log('Doctors found:', approvedDoctors.length); // Debug log
        
        res.render('consultation', {
            title: 'Book Consultation',
            approvedDoctors,
            error: null,
            formData: null,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Error loading consultation page:', error);
        res.status(500).render('consultation', {
            title: 'Book Consultation',
            approvedDoctors: [],
            error: 'Failed to load page. Please try again.',
            formData: null,
            messages: req.flash()
        });
    }
});


// POST handle booking
// POST handle booking - Modified to show confirmation first
router.post('/book', async (req, res) => {
    try {
        const {
            doctor,
            consultationType,
            patientName,
            patientEmail,
            patientPhone,
            patientDOB,
            healthConcerns,
            appointmentDateTime
        } = req.body;

        // Validate required fields
        if (!doctor || !consultationType) {
            const approvedDoctors = await Doctor.find({ approved: true });
            req.flash('error', 'Please select both doctor and consultation type');
            return res.render('consultation', {
                approvedDoctors,
                formData: req.body
            });
        }

        // Create and save consultation
        const newConsultation = new Consultation({
            doctor,
            consultationType,
            patientName,
            patientEmail,
            patientPhone,
            patientDOB: new Date(patientDOB),
            healthConcerns,
            appointmentDateTime: new Date(appointmentDateTime),
            status: 'pending',
            paymentStatus: 'unpaid'
        });

        await newConsultation.save();
        
        // Store booking in session
        req.session.lastBooking = {
            id: newConsultation._id,
            type: newConsultation.consultationType
        };
        
        // Redirect to confirmation page first
        res.redirect(`/consultation/confirmation/${newConsultation._id}`);
        
    } catch (error) {
        console.error('Booking error:', error);
        req.flash('error', 'Booking failed. Please try again.');
        res.redirect('/consultation');
    }
});

// GET confirmation page - Modified to include payment link
router.get('/confirmation/:id', async (req, res) => {
    try {
        const booking = await Consultation.findById(req.params.id)
            .populate('doctor', 'fullName specialty');
            
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/consultation');
        }

        // Calculate amount based on consultation type
        const amount = booking.consultationType.includes('General') ? 50 : 
                      booking.consultationType.includes('Eye') ? 60 : 70;

        res.render('confirmation', { 
            title: 'Booking Confirmation',
            booking: {
                ...booking.toObject(),
                amount: amount
            },
            user: req.user
        });
    } catch (error) {
        console.error('Confirmation error:', error);
        req.flash('error', 'Error loading booking details');
        res.redirect('/consultation');
    }
});

module.exports = router;