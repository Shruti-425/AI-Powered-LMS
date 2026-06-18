const db = require('../config/db.config');

const parseOptions = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const normalizeAnswer = (value) => String(value || '').trim().toLowerCase();

const verifyInstructorOwnsQuiz = async (quizId, instructorId) => {
  const [[quiz]] = await db.query(
    `SELECT q.quiz_id
     FROM quizzes q
     INNER JOIN courses c ON c.course_id = q.course_id
     WHERE q.quiz_id = ? AND c.instructor_id = ?`,
    [quizId, instructorId]
  );
  return quiz;
};

// GET /api/quizzes/courses - Get courses for dropdown
exports.getCourses = async (req, res) => {
  try {
    const [courses] = await db.query(
      'SELECT course_id, course_name, code FROM courses ORDER BY course_name'
    );
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

// GET /api/quizzes - Get quizzes for student or instructor
exports.getQuizzes = async (req, res) => {
  const { studentId, instructorId } = req.query;

  try {
    let query = `
      SELECT 
        q.quiz_id, 
        q.course_id, 
        q.title, 
        q.duration, 
        q.total_questions,
        q.passing_marks, 
        q.total_marks,
        q.is_published,
        c.course_name, 
        c.code,
        qr.response_id, 
        qr.marks, 
        qr.attempted_at
      FROM quizzes q
      INNER JOIN courses c ON c.course_id = q.course_id
    `;
    
    let params = [];

    if (studentId) {
      query += `
        INNER JOIN enrollment e ON e.course_id = q.course_id AND e.student_id = ?
        LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id AND qr.student_id = ?
        WHERE q.is_published = TRUE
        ORDER BY q.quiz_id DESC
      `;
      params = [studentId, studentId];
    } else if (instructorId) {
      query += `
        LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id
        WHERE c.instructor_id = ?
        ORDER BY q.quiz_id DESC
      `;
      params = [instructorId];
    } else {
      query += `
        LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id
        ORDER BY q.quiz_id DESC
      `;
    }

    const [quizzes] = await db.query(query, params);
    res.status(200).json(quizzes);
    
  } catch (error) {
    console.error('Error retrieving quizzes:', error);
    res.status(500).json({ message: 'Error retrieving quizzes', error: error.message });
  }
};

// GET /api/quizzes/:id - Get single quiz with questions
exports.getQuiz = async (req, res) => {
  const { includeAnswers } = req.query;

  try {
    const [[quiz]] = await db.query(
      `SELECT q.*, c.course_name, c.code
       FROM quizzes q
       INNER JOIN courses c ON c.course_id = q.course_id
       WHERE q.quiz_id = ?`,
      [req.params.id]
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.query.publishedOnly === 'true' && !quiz.is_published) {
      return res.status(403).json({ message: 'This quiz is not published yet' });
    }

    const [questions] = await db.query(
      `SELECT question_id, question_text, type, question_options, correct_answer, marks
       FROM questions
       WHERE quiz_id = ?
       ORDER BY question_id`,
      [req.params.id]
    );

    quiz.questions = questions.map((question) => {
      const mapped = {
        ...question,
        options: parseOptions(question.question_options)
      };
      delete mapped.question_options;
      if (includeAnswers !== 'true') {
        delete mapped.correct_answer;
      }
      return mapped;
    });

    res.status(200).json(quiz);
    
  } catch (error) {
    console.error('Error retrieving quiz:', error);
    res.status(500).json({ message: 'Error retrieving quiz', error: error.message });
  }
};

// POST /api/quizzes - Create new quiz (Faculty)
exports.createQuiz = async (req, res) => {
  const { course_id, title, duration, passing_marks, questions = [] } = req.body;

  if (!course_id || !title || !duration || questions.length === 0) {
    return res.status(400).json({ 
      message: 'Course, title, duration, and questions are required' 
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 1), 0);
    
    const [quizResult] = await connection.query(
      `INSERT INTO quizzes (course_id, title, duration, total_questions, passing_marks, total_marks, is_published)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [course_id, title, duration, questions.length, passing_marks || 0, totalMarks]
    );

    for (const question of questions) {
      await connection.query(
        `INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quizResult.insertId,
          question.question_text,
          question.type || 'mcq',
          JSON.stringify(question.options || []),
          question.correct_answer,
          question.marks || 1
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ 
      message: 'Quiz created successfully', 
      quiz_id: quizResult.insertId 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  } finally {
    connection.release();
  }
};

// PUT /api/quizzes/:id - Update quiz and questions (Faculty)
exports.updateQuiz = async (req, res) => {
  const quizId = req.params.id;
  const instructorId = req.user?.user_id;
  const { course_id, title, duration, passing_marks, questions = [] } = req.body;

  if (!instructorId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!title || !duration || questions.length === 0) {
    return res.status(400).json({ message: 'Title, duration, and questions are required' });
  }

  const connection = await db.getConnection();

  try {
    const owned = await verifyInstructorOwnsQuiz(quizId, instructorId);
    if (!owned) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 1), 0);

    await connection.beginTransaction();

    await connection.query(
      `UPDATE quizzes
       SET course_id = ?, title = ?, duration = ?, total_questions = ?, passing_marks = ?, total_marks = ?
       WHERE quiz_id = ?`,
      [course_id, title, duration, questions.length, passing_marks || 0, totalMarks, quizId]
    );

    await connection.query('DELETE FROM questions WHERE quiz_id = ?', [quizId]);

    for (const question of questions) {
      await connection.query(
        `INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          question.question_text,
          question.type || 'mcq',
          JSON.stringify(question.options || []),
          question.correct_answer,
          question.marks || 1,
        ]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Quiz updated successfully', quiz_id: quizId });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  } finally {
    connection.release();
  }
};

// DELETE /api/quizzes/:id - Delete quiz (Faculty)
exports.deleteQuiz = async (req, res) => {
  const quizId = req.params.id;
  const instructorId = req.user?.user_id;

  if (!instructorId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const owned = await verifyInstructorOwnsQuiz(quizId, instructorId);
    if (!owned) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    await db.query('DELETE FROM quizzes WHERE quiz_id = ?', [quizId]);
    res.status(200).json({ message: 'Quiz deleted successfully', quiz_id: quizId });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
};

// PUT /api/quizzes/:id/publish - Publish or unpublish quiz (Faculty)
exports.publishQuiz = async (req, res) => {
  const quizId = req.params.id;
  const instructorId = req.user?.user_id;
  const { is_published } = req.body;

  if (!instructorId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const owned = await verifyInstructorOwnsQuiz(quizId, instructorId);
    if (!owned) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    await db.query('UPDATE quizzes SET is_published = ? WHERE quiz_id = ?', [
      Boolean(is_published),
      quizId,
    ]);

    res.status(200).json({
      message: is_published ? 'Quiz published successfully' : 'Quiz unpublished',
      quiz_id: quizId,
      is_published: Boolean(is_published),
    });
  } catch (error) {
    console.error('Error publishing quiz:', error);
    res.status(500).json({ message: 'Error updating publish status', error: error.message });
  }
};

// POST /api/quizzes/:id/submit - Submit quiz responses
exports.submitQuiz = async (req, res) => {
  const quizId = req.params.id;
  const { student_id, answers = {} } = req.body;

  if (!student_id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  const connection = await db.getConnection();

  try {
    // Check if student is enrolled
    const [enrollmentCheck] = await connection.query(
      `SELECT e.* FROM enrollment e
       JOIN quizzes q ON q.course_id = e.course_id
       WHERE e.student_id = ? AND q.quiz_id = ?`,
      [student_id, quizId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Get quiz questions
    const [questions] = await connection.query(
      'SELECT question_id, correct_answer, marks FROM questions WHERE quiz_id = ?',
      [quizId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Quiz questions not found' });
    }

    // Calculate marks
    let marks = 0;
    const gradedAnswers = questions.map((question) => {
      const answer = answers[question.question_id] || '';
      const isCorrect = normalizeAnswer(answer) === normalizeAnswer(question.correct_answer);
      if (isCorrect) marks += Number(question.marks);
      return { questionId: question.question_id, answer, isCorrect };
    });

    await connection.beginTransaction();

    // Insert or update quiz response
    await connection.query(
      `INSERT INTO quiz_responses (quiz_id, student_id, marks, attempted_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE marks = VALUES(marks), attempted_at = CURRENT_TIMESTAMP`,
      [quizId, student_id, marks]
    );

    // Get response_id
    const [[response]] = await connection.query(
      'SELECT response_id FROM quiz_responses WHERE quiz_id = ? AND student_id = ?',
      [quizId, student_id]
    );

    // Delete old answers
    await connection.query('DELETE FROM quiz_response_answers WHERE response_id = ?', [response.response_id]);

    // Insert new answers
    for (const item of gradedAnswers) {
      await connection.query(
        `INSERT INTO quiz_response_answers (response_id, question_id, answer_text, is_correct)
         VALUES (?, ?, ?, ?)`,
        [response.response_id, item.questionId, item.answer, item.isCorrect]
      );
    }

    // Refresh dashboard stats
    await connection.query(`CALL sp_refresh_dashboard_stats(?)`, [student_id]);

    await connection.commit();
    
    res.status(201).json({ 
      message: 'Quiz submitted successfully', 
      marks,
      total_marks: questions.reduce((sum, q) => sum + Number(q.marks), 0)
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  } finally {
    connection.release();
  }
};

// GET /api/quizzes/:id/responses - Get all responses (Faculty)
exports.getResponses = async (req, res) => {
  const quizId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT qr.*, u.name as student_name, u.email
       FROM quiz_responses qr
       JOIN users u ON u.user_id = qr.student_id
       WHERE qr.quiz_id = ?
       ORDER BY qr.marks DESC`,
      [quizId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Error fetching responses', error: error.message });
  }
};