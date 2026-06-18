const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI-Powered LMS backend API!',
  });
});

// Database health check
app.get('/api/health', async (req, res) => {
  const db = require('./config/db.config');

  try {
    await db.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Routes
const taskRoutes = require('./routes/task.routes');
app.use('/api/tasks', taskRoutes);

const quizRoutes = require('./routes/quiz.routes');
app.use('/api/quizzes', quizRoutes);

const assignmentRoutes = require('./routes/assignment.routes');
app.use('/api/assignments', assignmentRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

const attendanceRoutes = require('./routes/attendance.routes');
app.use('/api/attendance', attendanceRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});