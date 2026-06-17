const db = require('../config/db.config');

// Get all tasks for a specific user
exports.getTasks = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const { user_id, title, description, due_date, priority, category } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ message: 'User ID and Title are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, category, completed) 
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [user_id, title, description || null, due_date || null, priority || 'medium', category || 'General']
    );

    const insertedId = result.insertId;
    const [newTasks] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [insertedId]);

    res.status(201).json({
      message: 'Task created successfully',
      task: newTasks[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update task details (e.g. toggle completion or edit text)
exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const { title, description, due_date, priority, category, completed } = req.body;

  try {
    // Check if task exists
    const [existing] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const t = existing[0];
    const updatedTitle = title !== undefined ? title : t.title;
    const updatedDesc = description !== undefined ? description : t.description;
    const updatedDueDate = due_date !== undefined ? due_date : t.due_date;
    const updatedPriority = priority !== undefined ? priority : t.priority;
    const updatedCategory = category !== undefined ? category : t.category;
    const updatedCompleted = completed !== undefined ? completed : t.completed;

    await db.query(
      `UPDATE tasks 
       SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, completed = ? 
       WHERE task_id = ?`,
      [updatedTitle, updatedDesc, updatedDueDate, updatedPriority, updatedCategory, updatedCompleted, taskId]
    );

    const [updatedTask] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await db.query('DELETE FROM tasks WHERE task_id = ?', [taskId]);
    res.status(200).json({ message: 'Task deleted successfully', task_id: taskId });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
