const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
  '/teacher',
  authenticate,
  authorize('instructor'),
  dashboardController.getTeacherDashboard
);

router.get(
  '/student',
  authenticate,
  authorize('student'),
  dashboardController.getStudentDashboard
);

router.get(
  '/student/courses',
  authenticate,
  authorize('student'),
  dashboardController.getStudentCourses
);

module.exports = router;
