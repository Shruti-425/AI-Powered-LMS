-- ============================================================
-- COLLEGE LMS — FILE UPLOADS FOR ASSIGNMENTS
-- ============================================================

USE college_lms;

-- Add file columns to submissions table
ALTER TABLE submissions
  ADD COLUMN file_name VARCHAR(255) NULL AFTER marks_obtained,
  ADD COLUMN file_path VARCHAR(500) NULL AFTER file_name,
  ADD COLUMN file_size INT NULL AFTER file_path,
  ADD COLUMN file_type VARCHAR(100) NULL AFTER file_size;

-- Create a separate table for assignment files (optional, for multiple files)
CREATE TABLE IF NOT EXISTS submission_files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_submission_files_submission
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    INDEX idx_submission_files (submission_id)
) ENGINE=InnoDB;

-- Create assignment_requirements table for file type restrictions
CREATE TABLE IF NOT EXISTS assignment_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    allowed_file_types VARCHAR(255) NOT NULL DEFAULT '.pdf,.doc,.docx,.zip',
    max_file_size INT NOT NULL DEFAULT 10485760, -- 10MB in bytes
    max_files INT NOT NULL DEFAULT 5,
    
    CONSTRAINT fk_requirements_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    UNIQUE KEY uq_requirements_assignment (assignment_id)
) ENGINE=InnoDB;

-- Insert default requirements for existing assignments
INSERT INTO assignment_requirements (assignment_id, allowed_file_types, max_file_size, max_files)
SELECT assignment_id, '.pdf,.doc,.docx,.zip', 10485760, 5
FROM assignments
ON DUPLICATE KEY UPDATE
    allowed_file_types = VALUES(allowed_file_types);