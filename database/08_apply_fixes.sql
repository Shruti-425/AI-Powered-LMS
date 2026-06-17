-- Migration: apply fixes from code review
-- 1) Add `total_marks` to `quizzes` (if missing) and populate reasonable defaults
-- 2) Optional: drop redundant index `idx_users_email` if present

-- Run these statements on your `college_lms` database (MySQL 8+ recommended).

USE college_lms;

-- Add column if it doesn't exist
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS total_marks DECIMAL(6,2) NOT NULL DEFAULT 100.00;

-- Populate total_marks based on total_questions (fallback to 100)
UPDATE quizzes
SET total_marks = CASE
  WHEN total_questions = 20 THEN 100.00
  WHEN total_questions = 15 THEN 75.00
  WHEN total_questions = 10 THEN 50.00
  ELSE 100.00
END;

-- Drop redundant index on users.email (safe to run; it will error if index doesn't exist)
-- If you prefer not to risk an error, run this manually after checking indexes.
DROP INDEX idx_users_email ON users;

-- Note: to update stored procedures and triggers, run the updated
-- files: 04_stored_procedures.sql and 05_triggers.sql (they replace definitions).
-- You can execute them with your MySQL client (source file.sql) or admin tool.
