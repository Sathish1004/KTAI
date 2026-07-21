const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Guarded admin-only stats endpoint
router.get('/stats', authMiddleware.protect, authMiddleware.restrictTo('admin'), adminController.getAdminStats);

module.exports = router;
