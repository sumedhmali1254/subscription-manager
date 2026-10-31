const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', quotationController.list);
router.get('/templates', quotationController.listTemplates);
router.post('/', requireStaffOrAdmin, quotationController.create);
router.get('/:id', quotationController.getById);
router.put('/:id', requireStaffOrAdmin, quotationController.update);
router.delete('/:id', requireStaffOrAdmin, quotationController.delete);
router.post('/:id/send', requireStaffOrAdmin, quotationController.send);
router.post('/:id/confirm', quotationController.confirm);
router.post('/:id/reject', quotationController.reject);
router.post('/:id/convert', requireStaffOrAdmin, quotationController.convert);

module.exports = router;

