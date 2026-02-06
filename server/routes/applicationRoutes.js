const express = require('express');
const router = express.Router();
const { getApplications, applyForJob, updateApplicationStatus, generateCoverLetter } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getApplications);

router.post('/apply', protect, applyForJob);
router.post('/generate-cover-letter', protect, generateCoverLetter);
router.patch('/:id', protect, updateApplicationStatus);

module.exports = router;
