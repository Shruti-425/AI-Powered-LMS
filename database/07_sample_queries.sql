-- ============================================================
-- COLLEGE LMS — SAMPLE QUERIES
-- ============================================================
-- Copy-paste these into your MySQL client for testing.
-- ============================================================

USE college_lms;

-- -------------------------------------------------------
-- Q1. List all students with their enrolled courses
-- -------------------------------------------------------
SELECT
    u.name   AS student_name,
    u.email,
    GROUP_CONCAT(c.code ORDER BY c.code SEPARATOR ', ') AS enrolled_courses
FROM users u
JOIN enrollment e ON e.student_id = u.user_id
JOIN courses    c ON c.course_id  = e.course_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name, u.email
ORDER BY u.name;

-- -------------------------------------------------------
-- Q2. Course-wise student count
-- -------------------------------------------------------
SELECT
    c.code,
    c.course_name,
    COUNT(e.student_id) AS total_students
FROM courses c
LEFT JOIN enrollment e ON e.course_id = c.course_id
GROUP BY c.course_id, c.code, c.course_name
ORDER BY total_students DESC;

-- -------------------------------------------------------
-- Q3. Upcoming assignments (not yet past due)
-- -------------------------------------------------------
SELECT
    a.title,
    c.code          AS course,
    a.due_date,
    a.max_marks,
    DATEDIFF(a.due_date, NOW()) AS days_remaining
FROM assignments a
JOIN courses c ON c.course_id = a.course_id
WHERE a.due_date > NOW()
ORDER BY a.due_date;

-- -------------------------------------------------------
-- Q4. Ungraded submissions (instructor view)
-- -------------------------------------------------------
SELECT
    a.title         AS assignment,
    c.code          AS course,
    u.name          AS student,
    s.submitted_at,
    CASE
        WHEN s.submitted_at > a.due_date THEN 'LATE'
        ELSE 'ON TIME'
    END             AS timing
FROM submissions s
JOIN assignments a ON a.assignment_id = s.assignment_id
JOIN courses     c ON c.course_id     = a.course_id
JOIN users       u ON u.user_id       = s.student_id
WHERE s.marks_obtained IS NULL
ORDER BY s.submitted_at;

-- -------------------------------------------------------
-- Q5. Top 5 students by average marks in DSA (CS301)
-- -------------------------------------------------------
SELECT
    u.name          AS student,
    ROUND(AVG(s.marks_obtained), 2) AS avg_marks,
    COUNT(s.submission_id)          AS submissions
FROM submissions s
JOIN assignments a ON a.assignment_id = s.assignment_id
JOIN users       u ON u.user_id       = s.student_id
WHERE a.course_id = 1                                  -- CS301
  AND s.marks_obtained IS NOT NULL
GROUP BY u.user_id, u.name
ORDER BY avg_marks DESC
LIMIT 5;

-- -------------------------------------------------------
-- Q6. Students with attendance below 75% (any course)
-- -------------------------------------------------------
SELECT * FROM vw_attendance_report
WHERE attendance_pct < 75
ORDER BY attendance_pct;

-- -------------------------------------------------------
-- Q7. Quiz pass/fail summary per quiz
-- -------------------------------------------------------
SELECT
    q.title          AS quiz,
    c.code           AS course,
    COUNT(qr.response_id) AS total_attempts,
    SUM(CASE WHEN qr.marks >= q.passing_marks THEN 1 ELSE 0 END) AS passed,
    SUM(CASE WHEN qr.marks <  q.passing_marks THEN 1 ELSE 0 END) AS failed,
    ROUND(AVG(qr.marks), 2) AS avg_marks
FROM quizzes q
JOIN courses c ON c.course_id = q.course_id
LEFT JOIN quiz_responses qr ON qr.quiz_id = q.quiz_id
GROUP BY q.quiz_id, q.title, c.code
ORDER BY q.quiz_id;

-- -------------------------------------------------------
-- Q8. Instructor workload summary
-- -------------------------------------------------------
SELECT * FROM vw_instructor_workload;

-- -------------------------------------------------------
-- Q9. Student transcript (using stored procedure)
-- -------------------------------------------------------
CALL sp_get_transcript(5);   -- Aarav Patel

-- -------------------------------------------------------
-- Q10. Enroll a new student (using stored procedure)
-- -------------------------------------------------------
-- CALL sp_enroll_student(10, 5, @result);   -- Neha → ML course
-- SELECT @result;

-- -------------------------------------------------------
-- Q11. Calculate grade (using stored procedure)
-- -------------------------------------------------------
-- CALL sp_calculate_grade(5, 1, @marks, @grade);
-- SELECT @marks AS final_marks, @grade AS letter_grade;

-- -------------------------------------------------------
-- Q12. Full student dashboard stats
-- -------------------------------------------------------
SELECT
    u.name,
    ds.enrolled_count,
    ds.quiz_count,
    ds.assignment_count,
    CONCAT(ds.avg_attendance, '%') AS attendance,
    ds.last_updated
FROM dashboard_stats ds
JOIN users u ON u.user_id = ds.student_id
ORDER BY u.name;

-- ============================================================
-- END OF SAMPLE QUERIES
-- ============================================================
