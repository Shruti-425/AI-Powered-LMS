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
