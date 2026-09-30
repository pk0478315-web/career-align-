const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoints generally do NOT require authentication 
// because they are called by the payment provider (e.g. Stripe)
router.post('/payment', webhookController.handlePaymentWebhook);

module.exports = router;
