-- ============================================================
-- COLLEGE LMS — ADDITIONAL PERFORMANCE INDEXES
-- ============================================================
-- These supplement the inline indexes defined in 01_schema.sql.
-- Run AFTER schema creation.
-- ============================================================

USE college_lms;

-- -------------------------------------------------------
-- ENROLLMENT: fast lookups for "my courses" & "course roster"
-- -------------------------------------------------------
CREATE INDEX idx_enrollment_student_date
    ON enrollment (student_id, enrolled_date);

CREATE INDEX idx_enrollment_course_date
    ON enrollment (course_id, enrolled_date);

-- -------------------------------------------------------
-- ASSIGNMENTS: filter by course + due date (upcoming work)
-- -------------------------------------------------------
CREATE INDEX idx_assignments_course_due
    ON assignments (course_id, due_date);

-- -------------------------------------------------------
-- SUBMISSIONS: grading dashboard — ungraded first
-- -------------------------------------------------------
CREATE INDEX idx_submissions_assignment_marks
    ON submissions (assignment_id, marks_obtained);

CREATE INDEX idx_submissions_student_submitted
    ON submissions (student_id, submitted_at);

-- -------------------------------------------------------
-- ATTENDANCE: attendance report per student per date range
-- -------------------------------------------------------
CREATE INDEX idx_attendance_student_date
    ON attendance (student_id, date);

CREATE INDEX idx_attendance_class_status
    ON attendance (class_id, status);

-- -------------------------------------------------------
-- CLASSES: timetable queries (date + time ordering)
-- -------------------------------------------------------
CREATE INDEX idx_classes_course_date_time
    ON classes (course_id, class_date, time);

CREATE INDEX idx_classes_instructor_date
    ON classes (instructor_id, class_date);

-- -------------------------------------------------------
-- QUIZ_RESPONSES: leaderboard & analytics
-- -------------------------------------------------------
CREATE INDEX idx_qr_quiz_marks
    ON quiz_responses (quiz_id, marks DESC);

CREATE INDEX idx_qr_student_attempted
    ON quiz_responses (student_id, attempted_at);

-- -------------------------------------------------------
-- QUESTIONS: quiz rendering (ordered fetch)
-- -------------------------------------------------------
CREATE INDEX idx_questions_quiz_type
    ON questions (quiz_id, type);

-- -------------------------------------------------------
-- GRADES: transcript & GPA calculation
-- -------------------------------------------------------
CREATE INDEX idx_grades_student_course
    ON grades (student_id, course_id, final_marks);

-- -------------------------------------------------------
-- DASHBOARD_STATS: fast dashboard load
-- -------------------------------------------------------
CREATE INDEX idx_stats_student_updated
    ON dashboard_stats (student_id, last_updated);

-- ============================================================
-- END OF INDEXES
-- ============================================================
