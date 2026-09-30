const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middlewares/auth');

// Allow optional auth so AI uses student profile context if available
router.post('/summarize', optionalAuth, aiController.summarizeOpportunity);
router.post('/eligibility-check', optionalAuth, aiController.checkEligibility);
router.post('/checklist', optionalAuth, aiController.generateChecklist);
router.post('/chat', optionalAuth, aiController.copilotChat);

module.exports = router;
