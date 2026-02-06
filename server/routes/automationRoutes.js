const express = require('express');
const router = express.Router();
const { runAutomation, purgeJobs, getDailyStats } = require('../controllers/automationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/run', protect, runAutomation);
router.get('/stats', protect, getDailyStats);
router.delete('/purge', protect, purgeJobs);

module.exports = router;
