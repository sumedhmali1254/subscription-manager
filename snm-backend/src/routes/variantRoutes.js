const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaffOrAdmin, requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', (req, res, next) => {
  req.params.id = req.query.productId;
  productController.getVariants(req, res, next);
});
router.post('/', requireStaffOrAdmin, (req, res, next) => {
  req.params.id = req.body.productId;
  productController.addVariant(req, res, next);
});
router.put('/:id', requireStaffOrAdmin, (req, res, next) => {
  req.params.vid = req.params.id;
  productController.updateVariant(req, res, next);
});
router.delete('/:id', requireAdmin, (req, res, next) => {
  req.params.vid = req.params.id;
  productController.deleteVariant(req, res, next);
});

module.exports = router;

