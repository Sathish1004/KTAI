const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getMe);
router.post('/register-employee', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.registerEmployee);

module.exports = router;
