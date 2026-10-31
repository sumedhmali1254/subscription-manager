const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', taxController.list);
router.post('/', requireAdmin, taxController.create);
router.get('/:id', taxController.getById);
router.put('/:id', requireAdmin, taxController.update);
router.delete('/:id', requireAdmin, taxController.delete);
router.post('/calculate', taxController.calculate);

module.exports = router;

