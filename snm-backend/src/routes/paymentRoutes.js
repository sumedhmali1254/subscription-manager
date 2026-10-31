const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', paymentController.list);
router.post('/', paymentController.create);
router.get('/:id', paymentController.getById);
router.post('/:id/refund', requireAdmin, paymentController.refund);
router.post('/reconcile', requireAdmin, paymentController.reconcile);

module.exports = router;

