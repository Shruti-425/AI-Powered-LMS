-- ============================================================
-- COLLEGE LMS — QUIZ AND ASSIGNMENT STORAGE SUPPORT
-- ============================================================

USE college_lms;

ALTER TABLE questions
  ADD COLUMN question_options JSON NULL AFTER type;

ALTER TABLE submission_files
  ADD COLUMN file_content LONGBLOB NULL AFTER file_type;

CREATE TABLE IF NOT EXISTS quiz_response_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qra_response
        FOREIGN KEY (response_id) REFERENCES quiz_responses(response_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_qra_question
        FOREIGN KEY (question_id) REFERENCES questions(question_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_qra_response (response_id),
    INDEX idx_qra_question (question_id)
) ENGINE=InnoDB;
