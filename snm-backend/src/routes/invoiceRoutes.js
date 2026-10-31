const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', invoiceController.list);
router.post('/', requireStaffOrAdmin, invoiceController.create);
router.get('/:id', invoiceController.getById);
router.put('/:id', requireStaffOrAdmin, invoiceController.update);
router.post('/:id/confirm', requireStaffOrAdmin, invoiceController.confirm);
router.post('/:id/cancel', requireAdmin, invoiceController.cancel);
router.post('/:id/send', requireStaffOrAdmin, invoiceController.send);
router.post('/:id/void', requireAdmin, invoiceController.void);
router.get('/:id/download', invoiceController.download);
router.post('/:id/payments', invoiceController.recordPayment);

module.exports = router;

