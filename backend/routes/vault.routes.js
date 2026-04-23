const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const { authenticate } = require('../middlewares/auth');
const { validate, vaultItemSchema, updateVaultItemSchema } = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(authenticate);

router.get('/', vaultController.getAllItems);
router.get('/:id', vaultController.getItemById);
router.post('/', validate(vaultItemSchema), vaultController.createItem);
router.put('/:id', validate(updateVaultItemSchema), vaultController.updateItem);
router.delete('/:id', vaultController.deleteItem);

module.exports = router;
