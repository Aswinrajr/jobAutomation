const { processAutomationForUser } = require('../services/automationService');
const Application = require('../models/Application');

// @desc    Run automated job scraping and applying
// @route   POST /api/automation/run
// @access  Private
exports.runAutomation = async (req, res) => {
    try {
        const user = req.user;
        const results = await processAutomationForUser(user._id, user.name);

        if (results.error) {
            return res.status(400).json({ message: results.error });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Automation failed: " + error.message });
    }
};

// @desc    Get Daily Stats
// @route   GET /api/automation/stats
// @access  Private
exports.getDailyStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayApps = await Application.find({
            user: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('job', 'title company');

        res.json({
            count: todayApps.length,
            applications: todayApps
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all jobs and applications (Reset)
// @route   DELETE /api/automation/purge
// @access  Private
exports.purgeJobs = async (req, res) => {
    try {
        await Application.deleteMany({ user: req.user._id });
        res.json({ message: "Your application history has been cleared. Starting fresh." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
