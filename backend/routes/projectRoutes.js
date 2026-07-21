const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Protect all routes
router.use(authMiddleware.protect);

// Projects listing & individual fetches (Admin and Employees)
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Admin-only endpoints
router.use(authMiddleware.restrictTo('admin'));

router.get('/meta/employees', projectController.getEmployeesList);
router.post('/', projectController.createProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/resources', upload.single('file'), projectController.uploadResource);

module.exports = router;
