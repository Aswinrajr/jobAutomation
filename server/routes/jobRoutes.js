const express = require('express');
const router = express.Router();
const { getJobs, createJob, getMatchingJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getJobs)
    .post(protect, createJob);

router.get('/match', protect, getMatchingJobs);

module.exports = router;
