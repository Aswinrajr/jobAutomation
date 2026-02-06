const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { uploadResume, getResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');

const upload = multer({ storage });

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);

module.exports = router;
