// userRoutes.js
const express = require('express');
const UserController = require('./user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Routes for basic user operations
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

router.get('/:id/de-accept', UserController.deacceptUser);
router.get('/:id/accept', UserController.acceptUser);

router.get('/getUserByUid/:uid', UserController.getUserByUid);

router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
