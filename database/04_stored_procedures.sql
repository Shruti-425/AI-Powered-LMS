-- ============================================================
-- COLLEGE LMS — STORED PROCEDURES
-- ============================================================
-- Encapsulate common business-logic operations.
-- ============================================================

USE college_lms;

DELIMITER $$

-- -------------------------------------------------------
-- SP1. ENROLL STUDENT IN A COURSE
-- -------------------------------------------------------
CREATE PROCEDURE sp_enroll_student (
    IN p_student_id  INT,
    IN p_course_id   INT,
    OUT p_result     VARCHAR(100)
)
BEGIN
    DECLARE v_role VARCHAR(20);
    DECLARE v_exists INT DEFAULT 0;

    -- Validate user is a student
    SELECT role INTO v_role FROM users WHERE user_id = p_student_id;
    IF v_role IS NULL THEN
        SET p_result = 'ERROR: Student not found';
    ELSEIF v_role <> 'student' THEN
        SET p_result = 'ERROR: User is not a student';
    ELSE
        -- Check duplicate enrollment
        SELECT COUNT(*) INTO v_exists
        FROM enrollment
        WHERE student_id = p_student_id AND course_id = p_course_id;

        IF v_exists > 0 THEN
            SET p_result = 'ERROR: Already enrolled';
        ELSE
            INSERT INTO enrollment (student_id, course_id, enrolled_date)
            VALUES (p_student_id, p_course_id, CURRENT_DATE);

            SET p_result = 'SUCCESS: Student enrolled';
        END IF;
    END IF;
END$$

-- -------------------------------------------------------
-- SP2. SUBMIT ASSIGNMENT
-- -------------------------------------------------------
CREATE PROCEDURE sp_submit_assignment (
    IN p_assignment_id  INT,
    IN p_student_id     INT,
    OUT p_result        VARCHAR(100)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_course_id INT;

    -- Verify the assignment exists and retrieve its course
    SELECT course_id INTO v_course_id
    FROM assignments
    WHERE assignment_id = p_assignment_id;

    IF v_course_id IS NULL THEN
        SET p_result = 'ERROR: Assignment not found';
        LEAVE sp_submit_assignment;
    END IF;

    -- Verify student is enrolled in the course
    SELECT COUNT(*) INTO v_exists
    FROM enrollment
    WHERE student_id = p_student_id AND course_id = v_course_id;

    IF v_exists = 0 THEN
        SET p_result = 'ERROR: Student not enrolled in the course';
        LEAVE sp_submit_assignment;
    END IF;

    -- Check if already submitted
    SELECT COUNT(*) INTO v_exists
    FROM submissions
    WHERE assignment_id = p_assignment_id AND student_id = p_student_id;

    IF v_exists > 0 THEN
        SET p_result = 'ERROR: Assignment already submitted';
    ELSE
        INSERT INTO submissions (assignment_id, student_id, submitted_at)
        VALUES (p_assignment_id, p_student_id, NOW());

        SET p_result = 'SUCCESS: Assignment submitted';
    END IF;
END$$

-- -------------------------------------------------------
-- SP3. GRADE A SUBMISSION
-- -------------------------------------------------------
CREATE PROCEDURE sp_grade_submission (
    IN p_submission_id   INT,
    IN p_marks_obtained  DECIMAL(5,2),
    OUT p_result         VARCHAR(100)
)
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);
    DECLARE v_assignment_id INT;

    -- Fetch the assignment's max marks
    SELECT a.max_marks, s.assignment_id
    INTO v_max_marks, v_assignment_id
    FROM submissions s
    JOIN assignments a ON a.assignment_id = s.assignment_id
    WHERE s.submission_id = p_submission_id;

    IF v_assignment_id IS NULL THEN
        SET p_result = 'ERROR: Submission not found';
    ELSEIF p_marks_obtained < 0 OR p_marks_obtained > v_max_marks THEN
        SET p_result = CONCAT('ERROR: Marks must be between 0 and ', v_max_marks);
    ELSE
        UPDATE submissions
        SET marks_obtained = p_marks_obtained
        WHERE submission_id = p_submission_id;

        SET p_result = 'SUCCESS: Submission graded';
    END IF;
END$$

-- -------------------------------------------------------
-- SP4. MARK ATTENDANCE FOR A CLASS (bulk)
-- -------------------------------------------------------
-- Accepts a comma-separated list of student IDs who are present.
-- All other enrolled students are marked absent.
-- -------------------------------------------------------
CREATE PROCEDURE sp_mark_attendance (
    IN p_class_id          INT,
    IN p_present_student_ids TEXT     -- comma-separated: '1,3,5,8'
)
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_class_date DATE;

    SELECT course_id, class_date INTO v_course_id, v_class_date
    FROM classes WHERE class_id = p_class_id;

    -- Insert attendance for all enrolled students
    INSERT INTO attendance (class_id, student_id, status, date)
    SELECT
        p_class_id,
        e.student_id,
        CASE
            WHEN FIND_IN_SET(e.student_id, p_present_student_ids) > 0
                THEN 'present'
            ELSE 'absent'
        END,
        v_class_date
    FROM enrollment e
    WHERE e.course_id = v_course_id
    ON DUPLICATE KEY UPDATE
        status = VALUES(status);
END$$

-- -------------------------------------------------------
-- SP5. CALCULATE FINAL GRADE FOR A STUDENT IN A COURSE
-- -------------------------------------------------------
-- Weightage: Assignments 40%, Quizzes 30%, Attendance 30%
-- -------------------------------------------------------
CREATE PROCEDURE sp_calculate_grade (
    IN p_student_id  INT,
    IN p_course_id   INT,
    OUT p_final_marks DECIMAL(5,2),
    OUT p_grade       VARCHAR(5)
)
BEGIN
    DECLARE v_assignment_pct DECIMAL(5,2) DEFAULT 0;
    DECLARE v_quiz_pct       DECIMAL(5,2) DEFAULT 0;
    DECLARE v_attend_pct     DECIMAL(5,2) DEFAULT 0;

    -- Assignment average percentage (40% weight)
    SELECT IFNULL(
        AVG(s.marks_obtained / a.max_marks * 100), 0
    ) INTO v_assignment_pct
    FROM submissions s
    JOIN assignments a ON a.assignment_id = s.assignment_id
    WHERE s.student_id = p_student_id
      AND a.course_id  = p_course_id
      AND s.marks_obtained IS NOT NULL;

        -- Quiz average percentage (30% weight)
        -- Use quiz `total_marks` as denominator (fall back to 0 when absent)
        SELECT IFNULL(
                AVG(CASE WHEN q.total_marks > 0 THEN qr.marks / q.total_marks * 100 ELSE 0 END), 0
        ) INTO v_quiz_pct
        FROM quiz_responses qr
        JOIN quizzes q ON q.quiz_id = qr.quiz_id
        WHERE qr.student_id = p_student_id
            AND q.course_id   = p_course_id;

    -- Attendance percentage (30% weight)
    SELECT IFNULL(
        SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0) * 100, 0
    ) INTO v_attend_pct
    FROM attendance a
    JOIN classes cl ON cl.class_id = a.class_id
    WHERE a.student_id = p_student_id
      AND cl.course_id = p_course_id;

    -- Weighted final marks
    SET p_final_marks = ROUND(
        (v_assignment_pct * 0.40) +
        (v_quiz_pct       * 0.30) +
        (v_attend_pct     * 0.30),
        2
    );

    -- Map to letter grade
    SET p_grade = CASE
        WHEN p_final_marks >= 90 THEN 'A+'
        WHEN p_final_marks >= 80 THEN 'A'
        WHEN p_final_marks >= 70 THEN 'B+'
        WHEN p_final_marks >= 60 THEN 'B'
        WHEN p_final_marks >= 50 THEN 'C'
        WHEN p_final_marks >= 40 THEN 'D'
        ELSE                          'F'
    END;

    -- Upsert into grades table
    INSERT INTO grades (student_id, course_id, final_marks, grade)
    VALUES (p_student_id, p_course_id, p_final_marks, p_grade)
    ON DUPLICATE KEY UPDATE
        final_marks = p_final_marks,
        grade       = p_grade;
END$$

-- -------------------------------------------------------
-- SP6. REFRESH DASHBOARD STATS FOR A STUDENT
-- -------------------------------------------------------
CREATE PROCEDURE sp_refresh_dashboard_stats (
    IN p_student_id INT
)
BEGIN
    DECLARE v_enrolled   INT DEFAULT 0;
    DECLARE v_quizzes    INT DEFAULT 0;
    DECLARE v_assignments INT DEFAULT 0;
    DECLARE v_attend     DECIMAL(5,2) DEFAULT 0;

    SELECT COUNT(*) INTO v_enrolled
    FROM enrollment WHERE student_id = p_student_id;

    SELECT COUNT(*) INTO v_quizzes
    FROM quiz_responses WHERE student_id = p_student_id;

    SELECT COUNT(*) INTO v_assignments
    FROM submissions WHERE student_id = p_student_id;

    SELECT IFNULL(
        SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0) * 100, 0
    ) INTO v_attend
    FROM attendance WHERE student_id = p_student_id;

    INSERT INTO dashboard_stats
        (student_id, enrolled_count, quiz_count, assignment_count, avg_attendance)
    VALUES
        (p_student_id, v_enrolled, v_quizzes, v_assignments, v_attend)
    ON DUPLICATE KEY UPDATE
        enrolled_count   = v_enrolled,
        quiz_count       = v_quizzes,
        assignment_count = v_assignments,
        avg_attendance   = v_attend,
        last_updated     = NOW();
END$$

-- -------------------------------------------------------
-- SP7. GET STUDENT TRANSCRIPT
-- -------------------------------------------------------
CREATE PROCEDURE sp_get_transcript (
    IN p_student_id INT
)
BEGIN
    SELECT
        u.name          AS student_name,
        u.email,
        c.code          AS course_code,
        c.course_name,
        c.credits,
        c.semester,
        g.final_marks,
        g.grade
    FROM grades g
    JOIN users   u ON u.user_id   = g.student_id
    JOIN courses c ON c.course_id = g.course_id
    WHERE g.student_id = p_student_id
    ORDER BY c.semester, c.course_name;
END$$

DELIMITER ;

-- ============================================================
-- END OF STORED PROCEDURES
-- ============================================================
