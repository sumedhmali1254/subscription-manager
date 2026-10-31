const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

// Handles /api/billing/runs and /api/billing-runs
router.get('/', billingController.list);
router.get('/runs', billingController.list);

// Handles /api/billing/run and /api/billing-runs
router.post('/', requireStaffOrAdmin, billingController.trigger);
router.post('/run', requireStaffOrAdmin, billingController.trigger);

router.get('/:id', billingController.getById);
router.get('/runs/:id', billingController.getById);

router.post('/:id/retry', requireStaffOrAdmin, billingController.retry);
router.post('/runs/:id/retry', requireStaffOrAdmin, billingController.retry);

router.post('/:id/cancel', requireStaffOrAdmin, billingController.cancel);
router.post('/runs/:id/cancel', requireStaffOrAdmin, billingController.cancel);

module.exports = router;
