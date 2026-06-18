const db = require('../config/db.config');

const normalizeTask = (task) => ({
  ...task,
  completed: Boolean(task.completed),
});

const verifyTaskOwner = async (taskId, userId) => {
  const [[task]] = await db.query(
    'SELECT task_id FROM tasks WHERE task_id = ? AND user_id = ?',
    [taskId, userId]
  );
  return task;
};

exports.getTasks = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC',
      [userId]
    );

    res.status(200).json(rows.map(normalizeTask));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      message: 'Error retrieving tasks',
      error: error.message,
    });
  }
};

exports.createTask = async (req, res) => {
  const userId = req.user.user_id;
  const { title, description, due_date, priority, category } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO tasks
       (user_id, title, description, due_date, priority, category, completed)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [
        userId,
        title,
        description || null,
        due_date || null,
        priority || 'medium',
        category || 'General',
      ]
    );

    const [newTasks] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Task created successfully',
      task: normalizeTask(newTasks[0]),
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      message: 'Error creating task',
      error: error.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.user_id;
  const { title, description, due_date, priority, category, completed } = req.body;

  try {
    const owned = await verifyTaskOwner(taskId, userId);
    if (!owned) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const [[existing]] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);

    await db.query(
      `UPDATE tasks
       SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, completed = ?
       WHERE task_id = ? AND user_id = ?`,
      [
        title !== undefined ? title : existing.title,
        description !== undefined ? description : existing.description,
        due_date !== undefined ? due_date : existing.due_date,
        priority !== undefined ? priority : existing.priority,
        category !== undefined ? category : existing.category,
        completed !== undefined ? completed : existing.completed,
        taskId,
        userId,
      ]
    );

    const [updatedTask] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);

    res.status(200).json({
      message: 'Task updated successfully',
      task: normalizeTask(updatedTask[0]),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      message: 'Error updating task',
      error: error.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.user_id;

  try {
    const owned = await verifyTaskOwner(taskId, userId);
    if (!owned) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await db.query('DELETE FROM tasks WHERE task_id = ? AND user_id = ?', [taskId, userId]);

    res.status(200).json({
      message: 'Task deleted successfully',
      task_id: taskId,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      message: 'Error deleting task',
      error: error.message,
    });
  }
};
