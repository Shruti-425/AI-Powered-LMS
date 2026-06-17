-- ============================================================
-- COLLEGE LMS — TRIGGERS
-- ============================================================
-- Automate side-effects and enforce business rules.
-- ============================================================

USE college_lms;

DELIMITER $$

-- -------------------------------------------------------
-- T1. After a student enrolls → refresh dashboard stats
-- -------------------------------------------------------
CREATE TRIGGER trg_after_enrollment_insert
AFTER INSERT ON enrollment
FOR EACH ROW
BEGIN
    CALL sp_refresh_dashboard_stats(NEW.student_id);
END$$

-- -------------------------------------------------------
-- T2. After a submission is graded → refresh dashboard stats
-- -------------------------------------------------------
CREATE TRIGGER trg_after_submission_update
AFTER UPDATE ON submissions
FOR EACH ROW
BEGIN
    IF OLD.marks_obtained IS NULL AND NEW.marks_obtained IS NOT NULL THEN
        CALL sp_refresh_dashboard_stats(NEW.student_id);
    END IF;
END$$

-- -------------------------------------------------------
-- T3. After a new submission → refresh dashboard stats
-- -------------------------------------------------------
CREATE TRIGGER trg_after_submission_insert
AFTER INSERT ON submissions
FOR EACH ROW
BEGIN
    CALL sp_refresh_dashboard_stats(NEW.student_id);
END$$

-- -------------------------------------------------------
-- T4. After attendance is recorded → refresh dashboard stats
-- -------------------------------------------------------
CREATE TRIGGER trg_after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    CALL sp_refresh_dashboard_stats(NEW.student_id);
END$$

-- -------------------------------------------------------
-- T5. After quiz response → refresh dashboard stats
-- -------------------------------------------------------
CREATE TRIGGER trg_after_quiz_response_insert
AFTER INSERT ON quiz_responses
FOR EACH ROW
BEGIN
    CALL sp_refresh_dashboard_stats(NEW.student_id);
END$$

-- -------------------------------------------------------
-- T6. Before enrollment — validate student role
-- -------------------------------------------------------
CREATE TRIGGER trg_before_enrollment_validate
BEFORE INSERT ON enrollment
FOR EACH ROW
BEGIN
    DECLARE v_role VARCHAR(20);
    SELECT role INTO v_role FROM users WHERE user_id = NEW.student_id;

    IF v_role <> 'student' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only users with role "student" can enroll in courses.';
    END IF;
END$$

-- -------------------------------------------------------
-- T7. Before course creation — validate instructor role
-- -------------------------------------------------------
CREATE TRIGGER trg_before_course_validate
BEFORE INSERT ON courses
FOR EACH ROW
BEGIN
    DECLARE v_role VARCHAR(20);
    SELECT role INTO v_role FROM users WHERE user_id = NEW.instructor_id;

    IF v_role <> 'instructor' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only users with role "instructor" can be assigned to a course.';
    END IF;
END$$

-- -------------------------------------------------------
-- T8. Prevent marks exceeding max_marks on submission
-- -------------------------------------------------------
CREATE TRIGGER trg_before_submission_grade
BEFORE UPDATE ON submissions
FOR EACH ROW
BEGIN
    DECLARE v_max DECIMAL(5,2);

    IF NEW.marks_obtained IS NOT NULL THEN
        SELECT max_marks INTO v_max
        FROM assignments
        WHERE assignment_id = NEW.assignment_id;

        IF NEW.marks_obtained > v_max THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Marks obtained cannot exceed max marks for the assignment.';
        END IF;

        IF NEW.marks_obtained < 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Marks obtained cannot be negative.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- END OF TRIGGERS
-- ============================================================
