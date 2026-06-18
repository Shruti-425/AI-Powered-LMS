const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// GET /api/quizzes/courses - Get courses for dropdown
router.get('/courses', quizController.getCourses);

// GET /api/quizzes - Get quizzes (student or instructor)
router.get('/', quizController.getQuizzes);

// POST /api/quizzes - Create new quiz (Faculty)
router.post('/', quizController.createQuiz);

// GET /api/quizzes/:id - Get single quiz with questions
router.get('/:id', quizController.getQuiz);

// POST /api/quizzes/:id/submit - Submit quiz responses
router.post('/:id/submit', quizController.submitQuiz);

// GET /api/quizzes/:id/responses - Get all responses (Faculty)
router.get('/:id/responses', quizController.getResponses);

module.exports = router;