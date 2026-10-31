const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', subscriptionController.list);
router.post('/', requireStaffOrAdmin, subscriptionController.create);
router.get('/:id', subscriptionController.getById);
router.put('/:id', requireStaffOrAdmin, subscriptionController.update);
router.post('/:id/status', requireStaffOrAdmin, subscriptionController.updateStatus);
router.post('/:id/pause', requireStaffOrAdmin, subscriptionController.pause);
router.post('/:id/resume', requireStaffOrAdmin, subscriptionController.resume);
router.post('/:id/renew', requireStaffOrAdmin, subscriptionController.renew);
router.post('/:id/change-plan', requireStaffOrAdmin, subscriptionController.changePlan);
router.post('/:id/cancel', subscriptionController.cancel);
router.get('/:id/invoices', subscriptionController.getInvoices);

module.exports = router;

