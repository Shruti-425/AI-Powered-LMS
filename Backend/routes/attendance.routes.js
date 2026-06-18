const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
  '/teacher/classes',
  authenticate,
  authorize('instructor'),
  attendanceController.getTeacherClasses
);

router.get(
  '/class/:classId/roster',
  authenticate,
  authorize('instructor'),
  attendanceController.getClassRoster
);

router.post(
  '/mark',
  authenticate,
  authorize('instructor'),
  attendanceController.markAttendance
);

router.put(
  '/:id',
  authenticate,
  authorize('instructor'),
  attendanceController.updateAttendance
);

router.get(
  '/student',
  authenticate,
  authorize('student'),
  attendanceController.getStudentAttendance
);

module.exports = router;
