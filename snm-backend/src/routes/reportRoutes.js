const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin } = require('../middleware/rbac');

router.use(authenticateToken);
router.use(requireStaffOrAdmin);

// Overview metrics & charts
router.get('/overview', reportController.overview);
router.get('/revenue-trends', reportController.revenueTrends);
router.get('/subscription-growth', reportController.subscriptionGrowth);
router.get('/plan-distribution', reportController.planDistribution);

// Analytics & Reports
router.get('/mrr', reportController.mrr);
router.get('/arr', reportController.arr);
router.get('/churn', reportController.churn);
router.get('/revenue', reportController.revenue);
router.get('/subscriptions-by-plan', reportController.subscriptionsByPlan);
router.get('/payment-methods', reportController.paymentMethods);
router.get('/aging', reportController.aging);
router.post('/export', reportController.exportReport);

module.exports = router;
