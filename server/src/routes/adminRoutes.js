const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/auth');

// Protect all admin routes
router.use(requireAdmin);

// System & Dashboard
router.get('/stats', adminController.getSystemStats);

// Users Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Opportunities Management
router.get('/opportunities/reported', adminController.getReportedOpportunities);
router.patch('/opportunities/:id', adminController.updateOpportunityAdmin);
router.delete('/opportunities/:id', adminController.deleteOpportunityAdmin);

module.exports = router;
