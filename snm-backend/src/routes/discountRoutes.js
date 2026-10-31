const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', discountController.list);
router.post('/', requireStaffOrAdmin, discountController.create);
router.get('/:id', discountController.getById);
router.put('/:id', requireStaffOrAdmin, discountController.update);
router.delete('/:id', requireAdmin, discountController.delete);
router.post('/validate', discountController.validate);

module.exports = router;

