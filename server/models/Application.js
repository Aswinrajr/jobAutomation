const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Rejected', 'Offer', 'Pending'],
        default: 'Applied'
    },
    matchScore: { type: Number, default: 0 },
    notes: String,
    trackingId: { type: String, unique: true },
    verificationLog: [{
        step: String,
        status: { type: String, enum: ['OK', 'WARN', 'FAIL'] },
        timestamp: { type: Date, default: Date.now }
    }],
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
