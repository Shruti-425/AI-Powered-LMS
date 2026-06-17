-- ============================================================
-- COLLEGE LMS — DATABASE VIEWS
-- ============================================================
-- Reusable read-only queries for dashboards, reports & APIs.
-- ============================================================

USE college_lms;

-- -------------------------------------------------------
-- V1. STUDENT DASHBOARD — enrolled courses overview
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_dashboard AS
SELECT
    u.user_id           AS student_id,
    u.name              AS student_name,
    c.course_id,
    c.course_name,
    c.code              AS course_code,
    c.semester,
    e.enrolled_date,
    ins.name            AS instructor_name
FROM enrollment e
JOIN users   u   ON u.user_id  = e.student_id
JOIN courses c   ON c.course_id = e.course_id
JOIN users   ins ON ins.user_id = c.instructor_id
WHERE u.role = 'student';

-- -------------------------------------------------------
-- V2. COURSE ROSTER — students enrolled per course
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_course_roster AS
SELECT
    c.course_id,
    c.course_name,
    c.code              AS course_code,
    c.semester,
    u.user_id           AS student_id,
    u.name              AS student_name,
    u.email             AS student_email,
    e.enrolled_date
FROM courses c
JOIN enrollment e ON e.course_id = c.course_id
JOIN users      u ON u.user_id   = e.student_id
ORDER BY c.course_id, u.name;

-- -------------------------------------------------------
-- V3. ATTENDANCE REPORT — per student per course
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_attendance_report AS
SELECT
    u.user_id          AS student_id,
    u.name             AS student_name,
    c.course_id,
    c.course_name,
    COUNT(a.attendance_id)                              AS total_classes,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)  AS classes_present,
    SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END)  AS classes_absent,
    SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END)  AS classes_late,
    ROUND(
        SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END)
        / NULLIF(COUNT(a.attendance_id), 0) * 100, 2
    )                                                   AS attendance_pct
FROM attendance  a
JOIN classes     cl ON cl.class_id  = a.class_id
JOIN courses     c  ON c.course_id  = cl.course_id
JOIN users       u  ON u.user_id    = a.student_id
GROUP BY u.user_id, u.name, c.course_id, c.course_name;

-- -------------------------------------------------------
-- V4. ASSIGNMENT TRACKER — submissions with grading status
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_assignment_tracker AS
SELECT
    a.assignment_id,
    a.title             AS assignment_title,
    a.due_date,
    a.max_marks,
    c.course_id,
    c.course_name,
    u.user_id           AS student_id,
    u.name              AS student_name,
    s.submission_id,
    s.submitted_at,
    s.marks_obtained,
    CASE
        WHEN s.submission_id IS NULL              THEN 'Not Submitted'
        WHEN s.marks_obtained IS NULL             THEN 'Pending Grading'
        ELSE                                           'Graded'
    END                 AS grading_status,
    CASE
        WHEN s.submitted_at > a.due_date          THEN 'Late'
        WHEN s.submitted_at IS NOT NULL           THEN 'On Time'
        ELSE                                           'N/A'
    END                 AS submission_timing
FROM assignments  a
JOIN courses      c  ON c.course_id    = a.course_id
JOIN enrollment   e  ON e.course_id    = c.course_id
JOIN users        u  ON u.user_id      = e.student_id
LEFT JOIN submissions s ON s.assignment_id = a.assignment_id
                        AND s.student_id   = u.user_id;

-- -------------------------------------------------------
-- V5. QUIZ RESULTS — student performance on quizzes
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_quiz_results AS
SELECT
    q.quiz_id,
    q.title             AS quiz_title,
    q.duration,
    q.total_questions,
    q.passing_marks,
    c.course_id,
    c.course_name,
    u.user_id           AS student_id,
    u.name              AS student_name,
    qr.marks            AS marks_obtained,
    qr.attempted_at,
    CASE
        WHEN qr.marks >= q.passing_marks THEN 'Passed'
        WHEN qr.marks IS NOT NULL        THEN 'Failed'
        ELSE                                  'Not Attempted'
    END                 AS result_status
FROM quizzes         q
JOIN courses         c  ON c.course_id  = q.course_id
JOIN enrollment      e  ON e.course_id  = c.course_id
JOIN users           u  ON u.user_id    = e.student_id
LEFT JOIN quiz_responses qr ON qr.quiz_id    = q.quiz_id
                             AND qr.student_id = u.user_id;

-- -------------------------------------------------------
-- V6. GRADE SHEET — final grades with letter grade
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_grade_sheet AS
SELECT
    u.user_id           AS student_id,
    u.name              AS student_name,
    c.course_id,
    c.course_name,
    c.code              AS course_code,
    c.credits,
    c.semester,
    g.final_marks,
    g.grade,
    ins.name            AS instructor_name
FROM grades  g
JOIN users   u   ON u.user_id   = g.student_id
JOIN courses c   ON c.course_id = g.course_id
JOIN users   ins ON ins.user_id = c.instructor_id
ORDER BY u.name, c.semester, c.course_name;

-- -------------------------------------------------------
-- V7. INSTRUCTOR WORKLOAD — courses, classes, assignments
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_instructor_workload AS
SELECT
    u.user_id              AS instructor_id,
    u.name                 AS instructor_name,
    COUNT(DISTINCT c.course_id)     AS courses_taught,
    COUNT(DISTINCT cl.class_id)     AS total_classes,
    COUNT(DISTINCT a.assignment_id) AS total_assignments,
    COUNT(DISTINCT qz.quiz_id)      AS total_quizzes
FROM users       u
LEFT JOIN courses     c  ON c.instructor_id  = u.user_id
LEFT JOIN classes     cl ON cl.instructor_id = u.user_id
LEFT JOIN assignments a  ON a.course_id      = c.course_id
LEFT JOIN quizzes     qz ON qz.course_id     = c.course_id
WHERE u.role = 'instructor'
GROUP BY u.user_id, u.name;

-- -------------------------------------------------------
-- V8. TODAY'S TIMETABLE — classes scheduled today
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_todays_timetable AS
SELECT
    cl.class_id,
    c.course_name,
    c.code          AS course_code,
    cl.class_date,
    cl.time,
    cl.room,
    ins.name        AS instructor_name
FROM classes  cl
JOIN courses  c   ON c.course_id  = cl.course_id
JOIN users    ins ON ins.user_id  = cl.instructor_id
WHERE cl.class_date = CURRENT_DATE
ORDER BY cl.time;

-- ============================================================
-- END OF VIEWS
-- ============================================================
