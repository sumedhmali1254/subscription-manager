const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', userController.list);
router.post('/', userController.create);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/toggle-status', userController.toggleStatus);
router.patch('/:id/status', userController.toggleStatus);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;

