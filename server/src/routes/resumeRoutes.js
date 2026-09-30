const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middlewares/auth');
const { requireFeature } = require('../middlewares/entitlementMiddleware');
const { FEATURES } = require('../config/entitlements');
const multer = require('multer');

// Configure multer for local temporary uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit at middleware level too
});

router.use(requireAuth);
router.use(requireFeature(FEATURES.RESUME_INTELLIGENCE));

router.get('/', resumeController.getResume);
router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.put('/confirm', resumeController.confirmResume);
router.post('/align', resumeController.alignResume);
router.post('/improve', resumeController.improveResume);

module.exports = router;
