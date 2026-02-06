const Job = require('../models/Job');
const Resume = require('../models/Resume');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get matching jobs for user
// @route   GET /api/jobs/match
// @access  Private
exports.getMatchingJobs = async (req, res) => {
    try {
        const resume = await Resume.findOne({ user: req.user._id, isActive: true });

        if (!resume) {
            // If no resume, return all jobs but with 0 match
            const jobs = await Job.find().limit(20);
            return res.json(jobs.map(j => ({ ...j.toObject(), matchScore: 0 })));
        }

        const userKeywords = (resume.parsedContent.keywords || []).map(k => k.toLowerCase());
        const jobs = await Job.find();

        const scoredJobs = jobs.map(job => {
            let matchCount = 0;
            const jobText = (job.title + ' ' + (job.description || '')).toLowerCase();

            userKeywords.forEach(uk => {
                if (jobText.includes(uk)) {
                    matchCount++;
                }
            });

            // Normalize score: 3 keywords = 100% for a match relevance
            let score = Math.min(100, Math.round((matchCount / 3) * 100));

            return { ...job.toObject(), matchScore: score };
        });

        // Filter by threshold (e.g. > 20%) and sort
        const matched = scoredJobs
            .filter(j => j.matchScore > 10)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json(matched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
