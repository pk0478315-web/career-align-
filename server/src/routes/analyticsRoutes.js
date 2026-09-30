const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', analyticsController.getAnalytics);

module.exports = router;
