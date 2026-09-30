const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middlewares/auth');
const multer = require('multer');

// Configure multer for local temporary uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit at middleware level too
});

router.get('/', requireAuth, resumeController.getResume);
router.post('/upload', requireAuth, upload.single('resume'), resumeController.uploadResume);
router.put('/confirm', requireAuth, resumeController.confirmResume);
router.post('/align', requireAuth, resumeController.alignResume);
router.post('/improve', requireAuth, resumeController.improveResume);

module.exports = router;
