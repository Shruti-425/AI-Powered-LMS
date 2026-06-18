const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
  '/',
  authenticate,
  authorize('student', 'instructor'),
  assignmentController.getAssignments
);

router.post(
  '/',
  authenticate,
  authorize('instructor'),
  assignmentController.createAssignment
);

router.post(
  '/:id/submit',
  authenticate,
  authorize('student'),
  assignmentController.submitAssignment
);

router.get(
  '/:id/submissions',
  authenticate,
  authorize('instructor'),
  assignmentController.getSubmissions
);

router.put(
  '/:id',
  authenticate,
  authorize('instructor'),
  assignmentController.updateAssignment
);

router.delete(
  '/:id',
  authenticate,
  authorize('instructor'),
  assignmentController.deleteAssignment
);

router.get('/file/:id', authenticate, assignmentController.downloadFile);

module.exports = router;