const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/password', authMiddleware, authController.changePassword);
router.post('/connect-shop', authMiddleware, authController.connectToShop);

module.exports = router;


