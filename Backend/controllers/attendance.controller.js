const db = require('../config/db.config');

exports.getTeacherClasses = async (req, res) => {
  const instructorId = req.user.user_id;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  try {
    const [classes] = await db.query(
      `SELECT cl.class_id, cl.class_date, cl.time, cl.room,
              c.course_id, c.course_name, c.code,
              COUNT(DISTINCT e.student_id) AS student_count
       FROM classes cl
       INNER JOIN courses c ON c.course_id = cl.course_id
       LEFT JOIN enrollment e ON e.course_id = c.course_id
       WHERE cl.instructor_id = ? AND cl.class_date = ?
       GROUP BY cl.class_id, cl.class_date, cl.time, cl.room, c.course_id, c.course_name, c.code
       ORDER BY cl.time`,
      [instructorId, date]
    );

    res.status(200).json(classes);
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Failed to load classes', error: error.message });
  }
};

exports.getClassRoster = async (req, res) => {
  const classId = req.params.classId;
  const instructorId = req.user.user_id;
  const search = (req.query.search || '').trim().toLowerCase();

  try {
    const [[classInfo]] = await db.query(
      `SELECT cl.class_id, cl.class_date, cl.time, cl.room, c.course_name, c.code
       FROM classes cl
       INNER JOIN courses c ON c.course_id = cl.course_id
       WHERE cl.class_id = ? AND cl.instructor_id = ?`,
      [classId, instructorId]
    );

    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    let query = `
      SELECT
        u.user_id AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        a.attendance_id,
        COALESCE(a.status, 'absent') AS status,
        a.date
      FROM classes cl
      INNER JOIN enrollment e ON e.course_id = cl.course_id
      INNER JOIN users u ON u.user_id = e.student_id
      LEFT JOIN attendance a ON a.class_id = cl.class_id AND a.student_id = u.user_id
      WHERE cl.class_id = ?
    `;
    const params = [classId];

    if (search) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.name';

    const [roster] = await db.query(query, params);

    res.status(200).json({ classInfo, roster });
  } catch (error) {
    console.error('Get class roster error:', error);
    res.status(500).json({ message: 'Failed to load class roster', error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { class_id, present_student_ids = [] } = req.body;
  const instructorId = req.user.user_id;

  if (!class_id) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  try {
    const [[classRow]] = await db.query(
      `SELECT class_id FROM classes WHERE class_id = ? AND instructor_id = ?`,
      [class_id, instructorId]
    );

    if (!classRow) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    const presentIds = Array.isArray(present_student_ids)
      ? present_student_ids.join(',')
      : String(present_student_ids);

    await db.query('CALL sp_mark_attendance(?, ?)', [class_id, presentIds]);

    const [students] = await db.query(
      `SELECT DISTINCT e.student_id
       FROM classes cl
       INNER JOIN enrollment e ON e.course_id = cl.course_id
       WHERE cl.class_id = ?`,
      [class_id]
    );

    for (const row of students) {
      await db.query('CALL sp_refresh_dashboard_stats(?)', [row.student_id]);
    }

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  const attendanceId = req.params.id;
  const { status } = req.body;
  const instructorId = req.user.user_id;

  const allowed = ['present', 'absent', 'late', 'excused'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid attendance status' });
  }

  try {
    const [[record]] = await db.query(
      `SELECT a.attendance_id, a.student_id
       FROM attendance a
       INNER JOIN classes cl ON cl.class_id = a.class_id
       WHERE a.attendance_id = ? AND cl.instructor_id = ?`,
      [attendanceId, instructorId]
    );

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found or access denied' });
    }

    await db.query('UPDATE attendance SET status = ? WHERE attendance_id = ?', [
      status,
      attendanceId,
    ]);
    await db.query('CALL sp_refresh_dashboard_stats(?)', [record.student_id]);

    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  const studentId = req.user.user_id;
  const search = (req.query.search || '').trim().toLowerCase();
  const filterDate = req.query.date || '';

  try {
    const [[summary]] = await db.query(
      `SELECT
         COUNT(a.attendance_id) AS total_classes,
         SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) AS present_count,
         ROUND(
           SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)
           / NULLIF(COUNT(a.attendance_id), 0) * 100,
           1
         ) AS attendance_percent
       FROM attendance a
       WHERE a.student_id = ?`,
      [studentId]
    );

    let historyQuery = `
      SELECT
        a.attendance_id,
        a.date,
        a.status,
        c.course_name,
        c.code AS course_code,
        cl.time
      FROM attendance a
      INNER JOIN classes cl ON cl.class_id = a.class_id
      INNER JOIN courses c ON c.course_id = cl.course_id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (filterDate) {
      historyQuery += ' AND a.date = ?';
      params.push(filterDate);
    }

    if (search) {
      historyQuery += ' AND (LOWER(c.course_name) LIKE ? OR LOWER(c.code) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    historyQuery += ' ORDER BY a.date DESC, cl.time DESC LIMIT 50';

    const [history] = await db.query(historyQuery, params);

    const [chartData] = await db.query(
      `SELECT
         DATE_FORMAT(a.date, '%b %d') AS label,
         ROUND(
           SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)
           / NULLIF(COUNT(*), 0) * 100,
           0
         ) AS attendance
       FROM attendance a
       WHERE a.student_id = ?
       GROUP BY a.date
       ORDER BY a.date DESC
       LIMIT 8`,
      [studentId]
    );

    res.status(200).json({
      summary: {
        totalClasses: Number(summary?.total_classes || 0),
        presentCount: Number(summary?.present_count || 0),
        attendancePercent: Number(summary?.attendance_percent || 0),
      },
      history,
      chartData: chartData.reverse(),
    });
  } catch (error) {
    console.error('Student attendance error:', error);
    res.status(500).json({ message: 'Failed to load attendance', error: error.message });
  }
};
