const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/list', auth, reportController.getReports);
router.get('/download/high_risk_list', auth, reportController.downloadHighRiskCSV);
router.get('/download/pdf/:id', auth, reportController.downloadPDF);
router.post('/create', auth, reportController.createReport);

module.exports = router;
