const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', productController.list);
router.post('/', requireStaffOrAdmin, productController.create);
router.get('/:id', productController.getById);
router.put('/:id', requireStaffOrAdmin, productController.update);
router.delete('/:id', requireAdmin, productController.delete);

// Variants sub-routes
router.get('/:id/variants', productController.getVariants);
router.post('/:id/variants', requireStaffOrAdmin, productController.addVariant);
router.put('/:id/variants/:vid', requireStaffOrAdmin, productController.updateVariant);
router.delete('/:id/variants/:vid', requireAdmin, productController.deleteVariant);

module.exports = router;

