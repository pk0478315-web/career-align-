const express = require('express');
const router = express.Router();
const exportImportController = require('../controllers/exportImportController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/export', exportImportController.exportData);
router.post('/import/preview', exportImportController.previewImport);
router.post('/import/confirm', exportImportController.confirmImport);

module.exports = router;
