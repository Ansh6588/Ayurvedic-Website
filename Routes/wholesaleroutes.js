    const express = require('express');
    const router = express.Router();
    const Wholesale = require('../Models/Wholesale');

    // Create a new wholesale request
    router.post('/wholesale', async (req, res) => {
        try {
            const { businessName, email } = req.body;

            // Check if a request with the same email or businessName exists
            const existingRequest = await Wholesale.findOne({ email });

            if (existingRequest) {
                return res.render('wholesale', { 
                    message: 'You have already submitted your application. Please wait while our team reviews your request.' 
                });
            }

            // If no existing request, save the new one
            const wholesaleData = new Wholesale(req.body);
            await wholesaleData.save();

            res.render('wholesale', { 
                message: 'Wholesale request submitted successfully. Our team will review and get back to you.', 
                wholesaleData 
            });

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Get all wholesale requests
    router.get('/wholesale', async (req, res) => {
        res.render("wholesale", {
            message: req.query.message || '' // Pass the message if available, or set it to an empty string by default
        });
    });


    // Get a single wholesale request by ID
    router.get('/wholesale/:id', async (req, res) => {
        try {
            const wholesale = await Wholesale.findById(req.params.id);
            if (!wholesale) {
                return res.status(404).json({ message: 'Wholesale request not found' });
            }
            res.status(200).json(wholesale);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update a wholesale request
    router.put('/wholesale/:id', async (req, res) => {
        try {
            const wholesale = await Wholesale.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!wholesale) {
                return res.status(404).json({ message: 'Wholesale request not found' });
            }
            res.status(200).json({ message: 'Wholesale request updated', wholesale });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Delete a wholesale request
    router.delete('/wholesale/:id', async (req, res) => {
        try {
            const wholesale = await Wholesale.findByIdAndDelete(req.params.id);
            if (!wholesale) {
                return res.status(404).json({ message: 'Wholesale request not found' });
            }
            res.status(200).json({ message: 'Wholesale request deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    module.exports = router;
