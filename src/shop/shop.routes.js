// shopRoutes.js
const express = require('express');
const ShopController = require('./shop.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware');
const router = express.Router();

// GET routes can be accessed without auth (for shop selection), but POST/PUT/DELETE require auth
// Routes for basic shop operations
router.get('/', optionalAuthMiddleware, ShopController.getAllShops);
router.get('/:id', optionalAuthMiddleware, ShopController.getShopById);
router.post('/', authMiddleware, ShopController.createShop);
router.put('/:id', authMiddleware, ShopController.updateShop);
router.delete('/:id', authMiddleware, ShopController.deleteShop);
router.get('/verify/:name', optionalAuthMiddleware, ShopController.verifyShopByName);



// Route to get all users belonging to a shop (require auth)
router.get('/:shopId/users', authMiddleware, ShopController.getShopUsers);
router.get('/:shopId/users/accepted/yes', authMiddleware, ShopController.getShopAcceptedUsers);
router.get('/:shopId/users/accepted/no', authMiddleware, ShopController.getShopUnacceptedUsers);


module.exports = router;