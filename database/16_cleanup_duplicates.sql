-- Remove duplicate seed rows and empty published quizzes
USE college_lms;

-- Duplicate assignments from partial re-seed (ids 9+)
DELETE FROM submissions WHERE assignment_id >= 9;
DELETE FROM assignments WHERE assignment_id >= 9;

-- Empty duplicate quizzes (ids 6-10 have no questions)
DELETE FROM quiz_responses WHERE quiz_id >= 6;
DELETE FROM questions WHERE quiz_id >= 6;
DELETE FROM quizzes WHERE quiz_id >= 6;

-- Sync total_questions with actual question counts
UPDATE quizzes q
SET total_questions = (
  SELECT COUNT(*) FROM questions qu WHERE qu.quiz_id = q.quiz_id
);
