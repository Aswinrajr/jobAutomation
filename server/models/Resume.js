const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: { type: String, required: true },
    parsedContent: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
