const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getMe);
router.post('/register-employee', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.registerEmployee);
router.get('/employees', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.getAllEmployees);
router.put('/employee/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.updateEmployee);
router.delete('/employee/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.deleteEmployee);

module.exports = router;
