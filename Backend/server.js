const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI-Powered LMS backend API!' });
});

// Register task routes
const taskRoutes = require('./routes/task.routes');
app.use('/api/tasks', taskRoutes);

const quizRoutes = require('./routes/quiz.routes');
app.use('/api/quizzes', quizRoutes);

const assignmentRoutes = require('./routes/assignment.routes');
app.use('/api/assignments', assignmentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
