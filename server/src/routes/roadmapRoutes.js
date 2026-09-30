const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { requireAuth } = require('../middlewares/auth');
const { requireFeature } = require('../middlewares/entitlementMiddleware');
const { FEATURES } = require('../config/entitlements');

router.use(requireAuth);
router.use(requireFeature(FEATURES.CAREER_ROADMAP));

router.get('/', roadmapController.getRoadmap);
router.post('/generate', roadmapController.generateRoadmap);
router.put('/progress', roadmapController.updateProgress);

module.exports = router;
