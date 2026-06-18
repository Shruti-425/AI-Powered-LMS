const db = require('../config/db.config');

exports.getTeacherDashboard = async (req, res) => {
  const instructorId = req.user.user_id;

  try {
    const [[workload]] = await db.query(
      `SELECT courses_taught, total_assignments, total_quizzes
       FROM vw_instructor_workload
       WHERE instructor_id = ?`,
      [instructorId]
    );

    const [[studentStats]] = await db.query(
      `SELECT COUNT(DISTINCT e.student_id) AS total_students
       FROM enrollment e
       INNER JOIN courses c ON c.course_id = e.course_id
       WHERE c.instructor_id = ?`,
      [instructorId]
    );

    const [[attendanceStats]] = await db.query(
      `SELECT
         COUNT(a.attendance_id) AS total_marked,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count
       FROM attendance a
       INNER JOIN classes cl ON cl.class_id = a.class_id
       WHERE cl.instructor_id = ? AND a.date = CURRENT_DATE`,
      [instructorId]
    );

    const [[scoreStats]] = await db.query(
      `SELECT ROUND(AVG(qr.marks), 1) AS average_score
       FROM quiz_responses qr
       INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
       INNER JOIN courses c ON c.course_id = q.course_id
       WHERE c.instructor_id = ?`,
      [instructorId]
    );

    const [recentActivities] = await db.query(
      `SELECT
         u.name AS student_name,
         q.title AS activity_title,
         qr.marks,
         qr.attempted_at AS activity_date,
         'quiz' AS activity_type
       FROM quiz_responses qr
       INNER JOIN users u ON u.user_id = qr.student_id
       INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
       INNER JOIN courses c ON c.course_id = q.course_id
       WHERE c.instructor_id = ?
       ORDER BY qr.attempted_at DESC
       LIMIT 5`,
      [instructorId]
    );

    const totalMarked = Number(attendanceStats?.total_marked || 0);
    const presentCount = Number(attendanceStats?.present_count || 0);
    const todayAttendance =
      totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    res.status(200).json({
      stats: {
        totalStudents: Number(studentStats?.total_students || 0),
        todayAttendance,
        totalTests: Number(workload?.total_quizzes || 0),
        totalAssignments: Number(workload?.total_assignments || 0),
        totalCourses: Number(workload?.courses_taught || 0),
        averageScore: Number(scoreStats?.average_score || 0),
      },
      recentActivities,
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({
      message: 'Failed to load teacher dashboard',
      error: error.message,
    });
  }
};

exports.getStudentDashboard = async (req, res) => {
  const studentId = req.user.user_id;

  try {
    const [[statsRow]] = await db.query(
      `SELECT enrolled_count, quiz_count, assignment_count, avg_attendance
       FROM dashboard_stats
       WHERE student_id = ?`,
      [studentId]
    );

    const [[upcomingTests]] = await db.query(
      `SELECT COUNT(*) AS upcoming_tests
       FROM quizzes q
       INNER JOIN enrollment e ON e.course_id = q.course_id AND e.student_id = ?
       LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id AND qr.student_id = ?
       WHERE qr.response_id IS NULL`,
      [studentId, studentId]
    );

    const [[completedTests]] = await db.query(
      `SELECT COUNT(*) AS completed_tests
       FROM quiz_responses
       WHERE student_id = ?`,
      [studentId]
    );

    const [[scoreRow]] = await db.query(
      `SELECT ROUND(AVG(marks), 1) AS average_score
       FROM quiz_responses
       WHERE student_id = ?`,
      [studentId]
    );

    const [recentAssignments] = await db.query(
      `SELECT a.title, a.due_date, c.code AS course_code, c.course_name
       FROM assignments a
       INNER JOIN enrollment e ON e.course_id = a.course_id
       INNER JOIN courses c ON c.course_id = a.course_id
       WHERE e.student_id = ?
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [studentId]
    );

    const [upcomingClasses] = await db.query(
      `SELECT c.course_name, c.code AS course_code, cl.time, cl.room
       FROM classes cl
       INNER JOIN courses c ON c.course_id = cl.course_id
       INNER JOIN enrollment e ON e.course_id = c.course_id
       WHERE e.student_id = ? AND cl.class_date = CURRENT_DATE
       ORDER BY cl.time
       LIMIT 5`,
      [studentId]
    );

    const [recentQuizResults] = await db.query(
      `SELECT q.title, qr.marks, q.total_marks, qr.attempted_at
       FROM quiz_responses qr
       INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
       WHERE qr.student_id = ?
       ORDER BY qr.attempted_at DESC
       LIMIT 5`,
      [studentId]
    );

    res.status(200).json({
      stats: {
        enrolledCourses: Number(statsRow?.enrolled_count || 0),
        assignments: Number(statsRow?.assignment_count || 0),
        attendancePercent: Number(statsRow?.avg_attendance || 0),
        upcomingTests: Number(upcomingTests?.upcoming_tests || 0),
        completedTests: Number(completedTests?.completed_tests || 0),
        averageScore: Number(scoreRow?.average_score || 0),
      },
      recentAssignments,
      upcomingClasses,
      recentQuizResults,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      message: 'Failed to load student dashboard',
      error: error.message,
    });
  }
};

exports.getStudentCourses = async (req, res) => {
  const studentId = req.user.user_id;

  try {
    const [courses] = await db.query(
      `SELECT
         c.course_id,
         c.course_name,
         c.code,
         u.name AS instructor_name,
         COALESCE(ROUND(
           (SELECT COUNT(*) FROM quiz_responses qr
            INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
            WHERE q.course_id = c.course_id AND qr.student_id = e.student_id) * 100.0
           / NULLIF((SELECT COUNT(*) FROM quizzes q
            WHERE q.course_id = c.course_id AND q.is_published = TRUE
              AND EXISTS (SELECT 1 FROM questions qu WHERE qu.quiz_id = q.quiz_id)), 0)
         ), 0) AS progress
       FROM enrollment e
       INNER JOIN courses c ON c.course_id = e.course_id
       INNER JOIN users u ON u.user_id = c.instructor_id
       WHERE e.student_id = ?
       ORDER BY c.course_name`,
      [studentId]
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Student courses error:', error);
    res.status(500).json({ message: 'Failed to load courses', error: error.message });
  }
};
