const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, roadmapController.getRoadmap);
router.post('/generate', requireAuth, roadmapController.generateRoadmap);
router.put('/progress', requireAuth, roadmapController.updateProgress);

module.exports = router;
