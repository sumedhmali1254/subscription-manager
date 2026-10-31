const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, customerController.list);
router.post('/', requireStaffOrAdmin, customerController.create);
router.get('/:id', customerController.getById);
router.put('/:id', requireStaffOrAdmin, customerController.update);
router.delete('/:id', requireAdmin, customerController.delete);
router.get('/:id/subscriptions', customerController.getSubscriptions);
router.get('/:id/invoices', customerController.getInvoices);

module.exports = router;

