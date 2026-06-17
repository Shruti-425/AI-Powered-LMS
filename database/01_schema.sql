-- ============================================================
-- COLLEGE LEARNING MANAGEMENT SYSTEM (LMS) — DATABASE SCHEMA
-- ============================================================
-- Author  : Database Developer
-- Created : 2026-06-17
-- Engine  : MySQL 8.0+
-- Charset : utf8mb4 (full Unicode support)
-- ============================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS college_lms
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE college_lms;

-- ============================================================
-- 1. USERS — students and instructors
-- ============================================================
CREATE TABLE users (
    user_id       INT           AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,               -- store bcrypt / argon2 hash
    name          VARCHAR(100)  NOT NULL,
    role          ENUM('student', 'instructor', 'admin')
                                NOT NULL DEFAULT 'student',
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- 2. COURSES — DSA, DBMS, Cloud Computing, etc.
-- ============================================================
CREATE TABLE courses (
    course_id      INT           AUTO_INCREMENT PRIMARY KEY,
    course_name    VARCHAR(150)  NOT NULL,
    code           VARCHAR(20)   NOT NULL UNIQUE,        -- e.g. CS301
    instructor_id  INT           NOT NULL,
    credits        TINYINT       NOT NULL DEFAULT 3 CHECK (credits BETWEEN 1 AND 6),
    semester       VARCHAR(20)   NOT NULL,               -- e.g. 'Fall 2026'

    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_courses_semester (semester),
    INDEX idx_courses_instructor (instructor_id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. ENROLLMENT — student ↔ course mapping
-- ============================================================
CREATE TABLE enrollment (
    enrollment_id  INT       AUTO_INCREMENT PRIMARY KEY,
    student_id     INT       NOT NULL,
    course_id      INT       NOT NULL,
    enrolled_date  DATE      NOT NULL DEFAULT (CURRENT_DATE),

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- A student can enroll in a course only once
    UNIQUE KEY uq_enrollment (student_id, course_id),

    INDEX idx_enrollment_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 4. ASSIGNMENTS — homework, projects, lab work
-- ============================================================
CREATE TABLE assignments (
    assignment_id  INT            AUTO_INCREMENT PRIMARY KEY,
    course_id      INT            NOT NULL,
    title          VARCHAR(200)   NOT NULL,
    description    TEXT,
    due_date       DATETIME       NOT NULL,
    max_marks      DECIMAL(5,2)   NOT NULL CHECK (max_marks > 0),

    CONSTRAINT fk_assignments_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_assignments_course (course_id),
    INDEX idx_assignments_due (due_date)
) ENGINE=InnoDB;

-- ============================================================
-- 5. SUBMISSIONS — student work for assignments
-- ============================================================
CREATE TABLE submissions (
    submission_id   INT            AUTO_INCREMENT PRIMARY KEY,
    assignment_id   INT            NOT NULL,
    student_id      INT            NOT NULL,
    submitted_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    marks_obtained  DECIMAL(5,2)   DEFAULT NULL,         -- NULL until graded
    views           INT            NOT NULL DEFAULT 0,

    CONSTRAINT fk_submissions_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_submissions_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- One submission per student per assignment
    UNIQUE KEY uq_submission (assignment_id, student_id),

    INDEX idx_submissions_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- 6. QUIZZES — timed assessments per course
-- ============================================================
CREATE TABLE quizzes (
    quiz_id          INT            AUTO_INCREMENT PRIMARY KEY,
    course_id        INT            NOT NULL,
    title            VARCHAR(200)   NOT NULL,
    duration         INT            NOT NULL CHECK (duration > 0),  -- minutes
    total_questions  INT            NOT NULL CHECK (total_questions > 0),
    passing_marks    DECIMAL(5,2)   NOT NULL CHECK (passing_marks >= 0),
    total_marks      DECIMAL(6,2)   NOT NULL DEFAULT 100.00,

    CONSTRAINT fk_quizzes_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_quizzes_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. QUESTIONS — quiz content (MCQ, short-answer, etc.)
-- ============================================================
CREATE TABLE questions (
    question_id    INT            AUTO_INCREMENT PRIMARY KEY,
    quiz_id        INT            NOT NULL,
    question_text  TEXT           NOT NULL,
    type           ENUM('mcq', 'true_false', 'short_answer', 'descriptive')
                                  NOT NULL DEFAULT 'mcq',
    correct_answer VARCHAR(500)   NOT NULL,
    marks          DECIMAL(5,2)   NOT NULL CHECK (marks > 0),

    CONSTRAINT fk_questions_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_questions_quiz (quiz_id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. QUIZ_RESPONSES — student attempts on quizzes
-- ============================================================
CREATE TABLE quiz_responses (
    response_id   INT            AUTO_INCREMENT PRIMARY KEY,
    quiz_id       INT            NOT NULL,
    student_id    INT            NOT NULL,
    marks         DECIMAL(5,2)   DEFAULT NULL,
    attempted_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qr_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_qr_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- One attempt per student per quiz (remove if re-attempts allowed)
    UNIQUE KEY uq_quiz_response (quiz_id, student_id),

    INDEX idx_qr_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- 9. CLASSES — scheduled lectures / labs
-- ============================================================
CREATE TABLE classes (
    class_id       INT           AUTO_INCREMENT PRIMARY KEY,
    course_id      INT           NOT NULL,
    class_date     DATE          NOT NULL,
    time           TIME          NOT NULL,
    room           VARCHAR(50)   NOT NULL,                -- e.g. 'Room 204'
    instructor_id  INT           NOT NULL,

    CONSTRAINT fk_classes_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_classes_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_classes_course (course_id),
    INDEX idx_classes_date (class_date),
    INDEX idx_classes_instructor (instructor_id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. ATTENDANCE — per-class student attendance
-- ============================================================
CREATE TABLE attendance (
    attendance_id  INT         AUTO_INCREMENT PRIMARY KEY,
    class_id       INT         NOT NULL,
    student_id     INT         NOT NULL,
    status         ENUM('present', 'absent', 'late', 'excused')
                               NOT NULL DEFAULT 'absent',
    date           DATE        NOT NULL,

    CONSTRAINT fk_attendance_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- One attendance record per student per class
    UNIQUE KEY uq_attendance (class_id, student_id),

    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_date (date)
) ENGINE=InnoDB;

-- ============================================================
-- 11. GRADES — final course performance
-- ============================================================
CREATE TABLE grades (
    grade_id      INT           AUTO_INCREMENT PRIMARY KEY,
    student_id    INT           NOT NULL,
    course_id     INT           NOT NULL,
    final_marks   DECIMAL(5,2)  NOT NULL CHECK (final_marks >= 0),
    grade         VARCHAR(5)    NOT NULL,                  -- A+, A, B+, B, C, F etc.

    CONSTRAINT fk_grades_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_grades_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- One grade per student per course
    UNIQUE KEY uq_grade (student_id, course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 12. DASHBOARD_STATS — pre-computed analytics cache
-- ============================================================
CREATE TABLE dashboard_stats (
    stat_id           INT           AUTO_INCREMENT PRIMARY KEY,
    student_id        INT           NOT NULL,
    enrolled_count    INT           NOT NULL DEFAULT 0,
    quiz_count        INT           NOT NULL DEFAULT 0,
    assignment_count  INT           NOT NULL DEFAULT 0,
    avg_attendance    DECIMAL(5,2)  NOT NULL DEFAULT 0.00,  -- percentage
    last_updated      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_stats_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    UNIQUE KEY uq_stats_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
