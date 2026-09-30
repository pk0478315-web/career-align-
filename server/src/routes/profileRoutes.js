const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, profileController.getProfile);
router.put('/', requireAuth, profileController.updateProfile);

module.exports = router;
