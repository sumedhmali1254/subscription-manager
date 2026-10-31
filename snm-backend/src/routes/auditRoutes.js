const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', auditController.list);
router.get('/:id', auditController.getById);

module.exports = router;

