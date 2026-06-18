const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const studentOnly = [authenticate, authorize('student')];

router.get('/', studentOnly, taskController.getTasks);
router.post('/', studentOnly, taskController.createTask);
router.put('/:id', studentOnly, taskController.updateTask);
router.delete('/:id', studentOnly, taskController.deleteTask);

module.exports = router;
