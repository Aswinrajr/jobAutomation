const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String],
    location: String,
    applyUrl: { type: String, required: true },
    source: { type: String, default: 'Manual' },
    keywords: [String], // Extracted from title/description for matching
    postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
