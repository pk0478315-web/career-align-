const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/me', subscriptionController.getMyPlan);
router.post('/upgrade', subscriptionController.createCheckoutSession);

module.exports = router;
