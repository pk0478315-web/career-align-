const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, opportunityController.listOpportunities);
router.get('/:id', optionalAuth, opportunityController.getOpportunityById);
router.post('/', requireAuth, opportunityController.createOpportunity);
router.post('/capture-url', requireAuth, opportunityController.captureUrl);

module.exports = router;
