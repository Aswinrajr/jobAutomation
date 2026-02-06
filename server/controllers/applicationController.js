const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
    try {
        const apps = await Application.find({ user: req.user._id })
            .populate('job', 'title company location description source applyUrl')
            .sort({ updatedAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for a job (Safe Mode / Tracking)
// @route   POST /api/applications/apply
// @access  Private
exports.applyForJob = async (req, res) => {
    const { jobId, notes } = req.body;

    try {
        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ user: req.user._id, job: jobId });
        if (existingApp) {
            return res.status(400).json({ message: 'Already applied/tracking this job' });
        }

        const app = await Application.create({
            user: req.user._id,
            job: jobId,
            status: req.body.status || 'Applied',
            notes,
            history: [{ status: req.body.status || 'Applied', timestamp: Date.now() }]
        });

        res.status(201).json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
    const { status, notes } = req.body;

    try {
        const app = await Application.findOne({ _id: req.params.id, user: req.user._id });

        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }

        app.status = status || app.status;
        if (notes) app.notes = notes;

        // Add to history if status changed
        if (status && status !== app.status) {
            app.history.push({ status, timestamp: Date.now() });
        }

        await app.save();
        res.json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Cover Letter
// @route   POST /api/applications/generate-cover-letter
// @access  Private
exports.generateCoverLetter = async (req, res) => {
    const { jobId } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ message: "AI Service Not Configured" });
    }

    try {
        const job = await Job.findById(jobId);
        const resume = await Resume.findOne({ user: req.user._id, isActive: true });

        if (!job || !resume) {
            return res.status(404).json({ message: "Job or Resume not found" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Switching back to flash-1.5 but with safety settings allowed
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { maxOutputTokens: 1000 }
        });

        const resumeSummary = {
            skills: resume.parsedContent.keywords || resume.parsedContent.skills || [],
            experience: (resume.parsedContent.experience || []).slice(0, 3).map(e => ({
                title: e.title,
                company: e.company,
                description: e.description?.substring(0, 300)
            }))
        };

        const prompt = `
        Write a professional and persuasive cover letter for the following job application.
        Focus on how my skills match the requirements.

        MY EXPERIENCE:
        ${JSON.stringify(resumeSummary)}

        JOB TO APPLY FOR:
        Title: ${job.title}
        Company: ${job.company}
        Description: ${job.description?.substring(0, 2000)}

        INSTRUCTIONS:
        - Concise, professional, and convincing.
        - Under 300 words.
        - Use modern business formatting.
        - Output the letter text ONLY.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ coverLetter: text });

    } catch (error) {
        console.error("Cover Letter Gen Error:", error);
        res.status(500).json({
            message: "Failed to generate cover letter",
            error: error.message,
            stack: error.stack
        });
    }
};
