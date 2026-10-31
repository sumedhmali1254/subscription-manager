const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', settingsController.get);
router.put('/', settingsController.update);
router.post('/logo', settingsController.uploadLogo);
router.get('/api-keys', settingsController.getApiKeys);
router.post('/api-keys/rotate', settingsController.rotateApiKey);

module.exports = router;

