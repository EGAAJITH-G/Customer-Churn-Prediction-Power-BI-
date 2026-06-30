const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/analytics', auth, dashboardController.getAnalyticsStats);

module.exports = router;
