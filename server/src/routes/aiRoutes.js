const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/auth');
const { checkAiUsageLimit, requireFeature } = require('../middlewares/entitlementMiddleware');
const { FEATURES } = require('../config/entitlements');

router.use(requireAuth);
router.use(checkAiUsageLimit);

// Base AI usage
router.post('/summarize', aiController.summarizeOpportunity);
router.post('/eligibility-check', aiController.checkEligibility);
router.post('/checklist', aiController.generateChecklist);
router.post('/chat', aiController.copilotChat);

// Advanced AI usage requires ADVANCED_MATCHING entitlement
router.post('/align', requireFeature(FEATURES.ADVANCED_MATCHING), aiController.alignCareer);

module.exports = router;
