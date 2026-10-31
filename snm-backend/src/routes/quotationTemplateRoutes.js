const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', quotationController.listTemplates);
router.post('/', requireStaffOrAdmin, quotationController.createTemplate);

module.exports = router;

