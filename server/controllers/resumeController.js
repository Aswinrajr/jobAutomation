const Resume = require('../models/Resume');
const { parseResume } = require('../services/parserService');
const fs = require('fs');

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // When using Cloudinary, req.file.path is the remote URL
        const parsedData = await parseResume(req.file.path, req.file.mimetype);

        // Deactivate previous resumes
        await Resume.updateMany(
            { user: req.user._id },
            { $set: { isActive: false } }
        );

        // Create new active resume
        const resume = await Resume.create({
            user: req.user._id,
            originalFileName: req.file.originalname,
            parsedContent: parsedData,
            isActive: true
        });

        // No need to unlink fs file as we used memory/cloud storage directly

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Error processing resume', error: error.message });
    }
};

// @desc    Get current user's resume
// @route   GET /api/resume
// @access  Private
exports.getResume = async (req, res) => {
    try {
        let activeResume = await Resume.findOne({ user: req.user._id, isActive: true });

        // Fallback: If no active resume, check for ANY recent resume
        if (!activeResume) {
            const latest = await Resume.findOne({ user: req.user._id }).sort({ uploadedAt: -1 });
            if (latest) {
                // Auto-activate the latest found
                latest.isActive = true;
                await latest.save();
                activeResume = latest;
            }
        }

        const history = await Resume.find({
            user: req.user._id,
            _id: { $ne: activeResume?._id } // Exclude the active one
        }).sort({ uploadedAt: -1 });

        if (!activeResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json({
            ...activeResume.toObject(),
            history
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
