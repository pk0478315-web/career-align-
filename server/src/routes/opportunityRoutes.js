const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, opportunityController.listOpportunities);
router.get('/:id', optionalAuth, opportunityController.getOpportunityById);
router.post('/', optionalAuth, opportunityController.createOpportunity);
router.post('/capture-url', optionalAuth, opportunityController.captureUrl);

module.exports = router;
