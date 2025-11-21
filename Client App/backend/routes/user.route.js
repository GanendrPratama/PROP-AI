const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users/register - Register new user
router.post('/register', userController.registerUser);

// POST /api/users/login - Login user
router.post('/login', userController.loginUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
