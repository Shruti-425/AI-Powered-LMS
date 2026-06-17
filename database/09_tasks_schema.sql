-- ============================================================
-- COLLEGE LEARNING MANAGEMENT SYSTEM (LMS) — TASKS TABLE
-- ============================================================
-- Author  : Antigravity AI
-- Created : 2026-06-17
-- ============================================================

USE college_lms;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    task_id     INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    title       VARCHAR(150)  NOT NULL,
    description TEXT          NULL,
    due_date    DATETIME      NULL,
    priority    ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    category    VARCHAR(50)   NOT NULL DEFAULT 'General',
    completed   BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    INDEX idx_tasks_user (user_id)
) ENGINE=InnoDB;

-- Seed sample tasks (User IDs 5, 6 are students in seed data)
INSERT INTO tasks (user_id, title, description, due_date, priority, category, completed) VALUES
(5, 'Review Database ER Diagram', 'Review the database relationships and constraints for the upcoming LMS milestone.', DATE_ADD(NOW(), INTERVAL 2 DAY), 'high', 'Study', FALSE),
(5, 'Prepare Cloud Quiz', 'Study AWS EC2 and S3 documentation for Cloud Computing quiz.', DATE_ADD(NOW(), INTERVAL 4 DAY), 'medium', 'Exam', FALSE),
(5, 'Complete React Tutorial', 'Finish reading documentation for React Router and Context API.', DATE_ADD(NOW(), INTERVAL -1 DAY), 'low', 'Personal', TRUE),
(6, 'Solve OS Lab Questions', 'Solve questions related to CPU scheduling and deadlocks.', DATE_ADD(NOW(), INTERVAL 1 DAY), 'high', 'Study', FALSE),
(6, 'Buy reference books', 'Get the textbook for Design and Analysis of Algorithms.', DATE_ADD(NOW(), INTERVAL 5 DAY), 'low', 'Personal', FALSE);
