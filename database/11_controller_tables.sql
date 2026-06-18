-- ============================================================
-- COLLEGE LMS — CONTROLLER TABLES & FIXES
-- ============================================================

USE college_lms;

-- 1. Add question_options column to questions (if missing)
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS question_options JSON NULL AFTER question_text;

-- 2. Add file_content column to submission_files (if missing)
ALTER TABLE submission_files 
  ADD COLUMN IF NOT EXISTS file_content LONGBLOB NULL AFTER file_type;

-- 3. Add missing columns to submissions (if missing)
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS file_size INT NULL,
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(100) NULL;

-- 4. Create quiz_response_answers table
CREATE TABLE IF NOT EXISTS quiz_response_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT fk_qra_response
        FOREIGN KEY (response_id) REFERENCES quiz_responses(response_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_qra_question
        FOREIGN KEY (question_id) REFERENCES questions(question_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    INDEX idx_qra_response (response_id),
    INDEX idx_qra_question (question_id)
) ENGINE=InnoDB;

-- 5. Drop UNIQUE constraint on submissions (allow resubmission)
-- Check if constraint exists first
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = 'college_lms' 
    AND TABLE_NAME = 'submissions' 
    AND CONSTRAINT_NAME = 'uq_submission'
);

SET @drop_constraint = IF(@constraint_exists > 0, 
    'ALTER TABLE submissions DROP INDEX uq_submission', 
    'SELECT "Constraint does not exist" AS message'
);
PREPARE stmt FROM @drop_constraint;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_student 
    ON submissions (assignment_id, student_id);

-- 7. Verify all tables
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables 
WHERE table_schema = 'college_lms'
ORDER BY table_name;

-- 8. Show columns in submissions
DESCRIBE submissions;

-- 9. Show columns in questions
DESCRIBE questions;

-- 10. Show columns in submission_files
DESCRIBE submission_files;

-- ============================================================
-- END
-- ============================================================