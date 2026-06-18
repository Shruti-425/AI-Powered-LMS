const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');

// GET /api/assignments - Get assignments (student or instructor)
router.get('/', assignmentController.getAssignments);

// POST /api/assignments - Create new assignment (Faculty)
router.post('/', assignmentController.createAssignment);

// POST /api/assignments/:id/submit - Submit assignment with file
router.post('/:id/submit', assignmentController.submitAssignment);

// GET /api/assignments/:id/submissions - Get all submissions (Faculty)
router.get('/:id/submissions', assignmentController.getSubmissions);

// GET /api/assignments/file/:id - Download file
router.get('/file/:id', assignmentController.downloadFile);

module.exports = router;