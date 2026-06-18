const db = require('../config/db.config');

const decodeFile = (fileData) => {
  if (!fileData) return null;
  const base64 = fileData.includes(',') ? fileData.split(',').pop() : fileData;
  return Buffer.from(base64, 'base64');
};

// GET /api/assignments - Get assignments for authenticated student or instructor
exports.getAssignments = async (req, res) => {
  const { role, user_id: userId } = req.user;

  try {
    let query = `
      SELECT 
        a.assignment_id, 
        a.course_id, 
        a.title, 
        a.description, 
        a.due_date, 
        a.max_marks,
        c.course_name, 
        c.code, 
        s.submission_id, 
        s.submitted_at, 
        s.marks_obtained,
        sf.file_name, 
        sf.file_size, 
        sf.file_type
      FROM assignments a
      INNER JOIN courses c ON c.course_id = a.course_id
    `;

    let params = [];

    if (role === 'student') {
      query += `
        INNER JOIN enrollment e ON e.course_id = a.course_id AND e.student_id = ?
        LEFT JOIN submissions s ON s.assignment_id = a.assignment_id AND s.student_id = ?
        LEFT JOIN submission_files sf ON sf.submission_id = s.submission_id
        WHERE 1=1
        ORDER BY a.due_date ASC
      `;
      params = [userId, userId];
    } else {
      query = `
        SELECT 
          a.assignment_id, 
          a.course_id, 
          a.title, 
          a.description, 
          a.due_date, 
          a.max_marks,
          c.course_name, 
          c.code,
          (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.assignment_id) AS submission_count
        FROM assignments a
        INNER JOIN courses c ON c.course_id = a.course_id
        WHERE c.instructor_id = ?
        ORDER BY a.due_date ASC
      `;
      params = [userId];
    }

    const [assignments] = await db.query(query, params);
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error retrieving assignments:', error);
    res.status(500).json({ message: 'Error retrieving assignments', error: error.message });
  }
};

// POST /api/assignments - Create new assignment (Faculty)
exports.createAssignment = async (req, res) => {
  const instructorId = req.user.user_id;
  const { course_id, title, description, due_date, max_marks } = req.body;

  if (!course_id || !title || !due_date || !max_marks) {
    return res.status(400).json({ message: 'Course, title, due date, and max marks are required' });
  }

  try {
    const [[course]] = await db.query(
      'SELECT course_id FROM courses WHERE course_id = ? AND instructor_id = ?',
      [course_id, instructorId]
    );

    if (!course) {
      return res.status(403).json({ message: 'You can only create assignments for your own courses' });
    }

    const [result] = await db.query(
      `INSERT INTO assignments (course_id, title, description, due_date, max_marks)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, title, description || null, due_date, max_marks]
    );

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// POST /api/assignments/:id/submit - Submit assignment with file
exports.submitAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const student_id = req.user.user_id;
  const { file_name, file_type, file_size, file_data } = req.body;
  const fileContent = decodeFile(file_data);

  if (!student_id || !file_name || !fileContent) {
    return res.status(400).json({ message: 'Student ID and file are required' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if student is enrolled
    const [enrollmentCheck] = await connection.query(
      `SELECT e.* FROM enrollment e
       JOIN assignments a ON a.course_id = e.course_id
       WHERE e.student_id = ? AND a.assignment_id = ?`,
      [student_id, assignmentId]
    );

    if (enrollmentCheck.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Insert or update submission
    await connection.query(
      `INSERT INTO submissions (assignment_id, student_id, submitted_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE submitted_at = CURRENT_TIMESTAMP`,
      [assignmentId, student_id]
    );

    // Get submission_id
    const [[submission]] = await connection.query(
      'SELECT submission_id FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, student_id]
    );

    // Delete old file if exists
    await connection.query('DELETE FROM submission_files WHERE submission_id = ?', [submission.submission_id]);

    // Insert new file
    await connection.query(
      `INSERT INTO submission_files
         (submission_id, file_name, file_path, file_size, file_type, file_content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [submission.submission_id, file_name, `database:${file_name}`, file_size || fileContent.length, file_type || '', fileContent]
    );

    // Update submission with file info
    await connection.query(
      `UPDATE submissions
       SET file_name = ?, file_path = ?, file_size = ?, file_type = ?
       WHERE submission_id = ?`,
      [file_name, `database:${file_name}`, file_size || fileContent.length, file_type || '', submission.submission_id]
    );

    // Refresh dashboard stats (optional — don't fail submit if procedure missing)
    try {
      await connection.query('CALL sp_refresh_dashboard_stats(?)', [student_id]);
    } catch (statsError) {
      console.warn('Dashboard stats refresh skipped:', statsError.message);
    }

    await connection.commit();
    res.status(201).json({ 
      message: 'Assignment submitted successfully',
      submission_id: submission.submission_id
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Error submitting assignment', error: error.message });
  } finally {
    connection.release();
  }
};

// GET /api/assignments/:id/submissions - Get all submissions (Faculty)
exports.getSubmissions = async (req, res) => {
  const assignmentId = req.params.id;
  const instructorId = req.user.user_id;

  try {
    const [[assignment]] = await db.query(
      `SELECT a.assignment_id
       FROM assignments a
       INNER JOIN courses c ON c.course_id = a.course_id
       WHERE a.assignment_id = ? AND c.instructor_id = ?`,
      [assignmentId, instructorId]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    const [rows] = await db.query(
      `SELECT s.submission_id, s.student_id, s.submitted_at, s.marks_obtained,
              u.name AS student_name, u.email,
              sf.file_name, sf.file_size, sf.file_type
       FROM submissions s
       JOIN users u ON u.user_id = s.student_id
       LEFT JOIN submission_files sf ON sf.submission_id = s.submission_id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const instructorId = req.user.user_id;
  const { title, description, due_date, max_marks } = req.body;

  try {
    const [[assignment]] = await db.query(
      `SELECT a.assignment_id
       FROM assignments a
       INNER JOIN courses c ON c.course_id = a.course_id
       WHERE a.assignment_id = ? AND c.instructor_id = ?`,
      [assignmentId, instructorId]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    await db.query(
      `UPDATE assignments
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           due_date = COALESCE(?, due_date),
           max_marks = COALESCE(?, max_marks)
       WHERE assignment_id = ?`,
      [title, description, due_date, max_marks, assignmentId]
    );

    res.status(200).json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const instructorId = req.user.user_id;

  try {
    const [[assignment]] = await db.query(
      `SELECT a.assignment_id
       FROM assignments a
       INNER JOIN courses c ON c.course_id = a.course_id
       WHERE a.assignment_id = ? AND c.instructor_id = ?`,
      [assignmentId, instructorId]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    await db.query('DELETE FROM assignments WHERE assignment_id = ?', [assignmentId]);
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
};

// GET /api/assignments/file/:id - Download file
exports.downloadFile = async (req, res) => {
  const submissionId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT sf.file_content, sf.file_name, sf.file_type
       FROM submission_files sf
       WHERE sf.submission_id = ?`,
      [submissionId]
    );

    if (rows.length === 0 || !rows[0].file_content) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = rows[0];
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    res.send(file.file_content);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};