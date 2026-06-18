-- ============================================================
-- COLLEGE LMS — QUIZ PUBLISH FLAG
-- ============================================================

USE college_lms;

ALTER TABLE quizzes
  ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE AFTER total_marks;

-- Publish existing seed quizzes so students can see them
UPDATE quizzes SET is_published = TRUE;
