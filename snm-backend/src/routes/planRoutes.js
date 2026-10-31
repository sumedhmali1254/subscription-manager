const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', planController.list);
router.post('/', requireStaffOrAdmin, planController.create);
router.get('/:id', planController.getById);
router.put('/:id', requireStaffOrAdmin, planController.update);
router.delete('/:id', requireAdmin, planController.delete);
router.patch('/:id/toggle-status', requireAdmin, planController.toggleStatus);

module.exports = router;

