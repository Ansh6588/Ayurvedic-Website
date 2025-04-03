const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, 'Patient name is required']
    },
    patientEmail: {
        type: String,
        required: [true, 'Email is required'],
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    patientPhone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    patientDOB: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    healthConcerns: {
        type: String,
        required: [true, 'Health concerns description is required'],
        minlength: [20, 'Health concerns should be at least 20 characters']
    },
    appointmentDateTime: {
        type: Date,
        required: [true, 'Appointment date and time is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Appointment date must be in the future'
        }
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor selection is required']
    },
    consultationType: {
        type: String,
        required: [true, 'Consultation type is required'],
        enum: {
            values: ['General Consultation', 'Eye Consultation', 'Skin Consultation'],
            message: 'Invalid consultation type'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    bookedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid','failed', 'paid', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// (Keep all the existing virtuals and query helpers)

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;