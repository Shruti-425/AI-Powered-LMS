const bcrypt = require('bcryptjs');
const db = require('../config/db.config');

exports.getDashboard = async (req, res) => {
  try {
    const [[counts]] = await db.query(
      `SELECT
         SUM(role = 'student') AS total_students,
         SUM(role = 'instructor') AS total_faculty,
         SUM(role = 'admin') AS total_admins
       FROM users`
    );

    const [[courseCount]] = await db.query('SELECT COUNT(*) AS total_courses FROM courses');
    const [[enrollmentCount]] = await db.query('SELECT COUNT(*) AS total_enrollments FROM enrollment');
    const [[quizStats]] = await db.query(
      `SELECT COUNT(*) AS quiz_submissions, ROUND(AVG(marks), 1) AS average_score
       FROM quiz_responses`
    );

    const [recentEnrollments] = await db.query(
      `SELECT u.name AS student_name, c.code, c.course_name, e.enrolled_date
       FROM enrollment e
       INNER JOIN users u ON u.user_id = e.student_id
       INNER JOIN courses c ON c.course_id = e.course_id
       ORDER BY e.enrolled_date DESC, e.enrollment_id DESC
       LIMIT 5`
    );

    res.status(200).json({
      stats: {
        totalStudents: Number(counts?.total_students || 0),
        totalFaculty: Number(counts?.total_faculty || 0),
        totalCourses: Number(courseCount?.total_courses || 0),
        totalEnrollments: Number(enrollmentCount?.total_enrollments || 0),
        quizSubmissions: Number(quizStats?.quiz_submissions || 0),
        averageQuizScore: Number(quizStats?.average_score || 0),
      },
      recentEnrollments,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load admin dashboard', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  const { role, search } = req.query;

  try {
    let query = `
      SELECT u.user_id, u.name, u.email, u.role, u.created_at,
        (SELECT COUNT(*) FROM enrollment e WHERE e.student_id = u.user_id) AS enrolled_count,
        (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.user_id) AS courses_taught
      FROM users u
      WHERE u.role <> 'admin'
    `;
    const params = [];

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += ' ORDER BY u.created_at DESC';

    const [users] = await db.query(query, params);
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to load users', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  if (!['student', 'instructor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or instructor' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { user_id: result.insertId, name, email, role },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, role } = req.body;

  try {
    const [[user]] = await db.query(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin accounts' });
    }

    if (role && !['student', 'instructor'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or instructor' });
    }

    if (email) {
      const [duplicate] = await db.query(
        'SELECT user_id FROM users WHERE email = ? AND user_id <> ?',
        [email, userId]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }

    const fields = [];
    const values = [];

    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (role) {
      fields.push('role = ?');
      values.push(role);
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      fields.push('password = ?');
      values.push(await bcrypt.hash(password, 12));
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(userId);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.user.user_id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  try {
    const [[user]] = await db.query(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    if (user.role === 'instructor') {
      const [[courseCheck]] = await db.query(
        'SELECT COUNT(*) AS count FROM courses WHERE instructor_id = ?',
        [userId]
      );
      if (Number(courseCheck?.count) > 0) {
        return res.status(409).json({
          message: 'Cannot delete instructor assigned to courses. Reassign courses first.',
        });
      }
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  const { search } = req.query;

  try {
    let query = `
      SELECT c.course_id, c.course_name, c.code, c.instructor_id, c.credits, c.semester,
        u.name AS instructor_name,
        (SELECT COUNT(*) FROM enrollment e WHERE e.course_id = c.course_id) AS enrollment_count
      FROM courses c
      INNER JOIN users u ON u.user_id = c.instructor_id
    `;
    const params = [];

    if (search) {
      query += ' WHERE c.course_name LIKE ? OR c.code LIKE ? OR u.name LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY c.semester DESC, c.code ASC';

    const [courses] = await db.query(query, params);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to load courses', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const { course_name, code, instructor_id, credits, semester } = req.body;

  if (!course_name || !code || !instructor_id || !semester) {
    return res.status(400).json({ message: 'Course name, code, instructor, and semester are required' });
  }

  try {
    const [[instructor]] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'instructor'",
      [instructor_id]
    );

    if (!instructor) {
      return res.status(400).json({ message: 'Invalid instructor selected' });
    }

    const [result] = await db.query(
      `INSERT INTO courses (course_name, code, instructor_id, credits, semester)
       VALUES (?, ?, ?, ?, ?)`,
      [course_name, code, instructor_id, credits || 3, semester]
    );

    res.status(201).json({
      message: 'Course created successfully',
      course_id: result.insertId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Course code already exists' });
    }
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { course_name, code, instructor_id, credits, semester } = req.body;

  try {
    const [[course]] = await db.query('SELECT course_id FROM courses WHERE course_id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (instructor_id) {
      const [[instructor]] = await db.query(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'instructor'",
        [instructor_id]
      );
      if (!instructor) {
        return res.status(400).json({ message: 'Invalid instructor selected' });
      }
    }

    await db.query(
      `UPDATE courses
       SET course_name = COALESCE(?, course_name),
           code = COALESCE(?, code),
           instructor_id = COALESCE(?, instructor_id),
           credits = COALESCE(?, credits),
           semester = COALESCE(?, semester)
       WHERE course_id = ?`,
      [course_name, code, instructor_id, credits, semester, courseId]
    );

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Course code already exists' });
    }
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    const [[course]] = await db.query('SELECT course_id FROM courses WHERE course_id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.query('DELETE FROM courses WHERE course_id = ?', [courseId]);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const [enrollmentByCourse] = await db.query(
      `SELECT c.code, c.course_name, COUNT(e.enrollment_id) AS student_count
       FROM courses c
       LEFT JOIN enrollment e ON e.course_id = c.course_id
       GROUP BY c.course_id, c.code, c.course_name
       ORDER BY student_count DESC`
    );

    const [quizPerformance] = await db.query(
      `SELECT c.code, c.course_name,
         COUNT(qr.response_id) AS attempts,
         ROUND(AVG(qr.marks), 1) AS average_marks
       FROM courses c
       LEFT JOIN quizzes q ON q.course_id = c.course_id
       LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id
       GROUP BY c.course_id, c.code, c.course_name
       ORDER BY attempts DESC`
    );

    const [attendanceSummary] = await db.query(
      `SELECT c.code, c.course_name,
         COUNT(a.attendance_id) AS records,
         ROUND(100 * SUM(a.status = 'present') / NULLIF(COUNT(a.attendance_id), 0), 1) AS attendance_rate
       FROM courses c
       LEFT JOIN classes cl ON cl.course_id = c.course_id
       LEFT JOIN attendance a ON a.class_id = cl.class_id
       GROUP BY c.course_id, c.code, c.course_name`
    );

    res.status(200).json({ enrollmentByCourse, quizPerformance, attendanceSummary });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({ message: 'Failed to load reports', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [enrollmentChart] = await db.query(
      `SELECT c.code AS label, COUNT(e.enrollment_id) AS students
       FROM courses c
       LEFT JOIN enrollment e ON e.course_id = c.course_id
       GROUP BY c.course_id, c.code
       ORDER BY students DESC`
    );

    const [[roleDistribution]] = await db.query(
      `SELECT
         SUM(role = 'student') AS students,
         SUM(role = 'instructor') AS faculty,
         SUM(role = 'admin') AS admins
       FROM users`
    );

    const [quizTrend] = await db.query(
      `SELECT DATE_FORMAT(attempted_at, '%Y-%m') AS label,
         COUNT(*) AS submissions,
         ROUND(AVG(marks), 1) AS average_score
       FROM quiz_responses
       GROUP BY DATE_FORMAT(attempted_at, '%Y-%m')
       ORDER BY label ASC`
    );

    res.status(200).json({
      enrollmentChart,
      roleDistribution: {
        students: Number(roleDistribution?.students || 0),
        faculty: Number(roleDistribution?.faculty || 0),
        admins: Number(roleDistribution?.admins || 0),
      },
      quizTrend,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics', error: error.message });
  }
};
