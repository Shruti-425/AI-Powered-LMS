const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/courses', quizController.getCourses);
router.get('/', quizController.getQuizzes);
router.post('/', authenticate, authorize('instructor'), quizController.createQuiz);

router.put('/:id/publish', authenticate, authorize('instructor'), quizController.publishQuiz);
router.put('/:id', authenticate, authorize('instructor'), quizController.updateQuiz);
router.delete('/:id', authenticate, authorize('instructor'), quizController.deleteQuiz);

router.get('/:id', quizController.getQuiz);
router.post('/:id/submit', quizController.submitQuiz);
router.get('/:id/responses', authenticate, authorize('instructor'), quizController.getResponses);

module.exports = router;
