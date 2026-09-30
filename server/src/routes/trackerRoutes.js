const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const { requireAuth } = require('../middlewares/auth');

// All tracker routes require authentication
router.use(requireAuth);

router.get('/', trackerController.getMyOpportunities);
router.post('/', trackerController.trackOpportunity);
router.patch('/:id', trackerController.updateTrackedOpportunity);
router.delete('/:id', trackerController.deleteTrackedOpportunity);

module.exports = router;
