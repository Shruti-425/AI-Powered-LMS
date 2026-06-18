const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const adminOnly = [authenticate, authorize('admin')];

router.get('/dashboard', adminOnly, adminController.getDashboard);
router.get('/users', adminOnly, adminController.getUsers);
router.post('/users', adminOnly, adminController.createUser);
router.put('/users/:id', adminOnly, adminController.updateUser);
router.delete('/users/:id', adminOnly, adminController.deleteUser);
router.get('/courses', adminOnly, adminController.getCourses);
router.post('/courses', adminOnly, adminController.createCourse);
router.put('/courses/:id', adminOnly, adminController.updateCourse);
router.delete('/courses/:id', adminOnly, adminController.deleteCourse);
router.get('/reports', adminOnly, adminController.getReports);
router.get('/analytics', adminOnly, adminController.getAnalytics);

module.exports = router;
