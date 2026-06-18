-- ============================================================
-- COLLEGE LMS — SEED ASSIGNMENTS & QUIZZES DATA
-- ============================================================

USE college_lms;

-- ============================================================
-- INSERT ASSIGNMENTS
-- ============================================================
INSERT INTO assignments (course_id, title, description, due_date, max_marks) VALUES
(1, 'Linked List Implementation', 'Implement singly & doubly linked lists in C++ with proper memory management.', '2026-08-10 23:59:00', 100),
(1, 'Binary Tree Traversals', 'Implement in-order, pre-order, and post-order traversals for a binary tree.', '2026-08-25 23:59:00', 100),
(1, 'Graph Algorithms Project', 'Implement BFS, DFS, and Dijkstra algorithm on a real-world dataset.', '2026-09-15 23:59:00', 150),
(2, 'ER Diagram Design', 'Design a complete ER diagram for a hospital management system.', '2026-08-12 23:59:00', 50),
(2, 'SQL Queries Practice', 'Write 20 complex SQL queries on the sample database schema.', '2026-08-28 23:59:00', 80),
(2, 'Database Project', 'Full RDBMS project with normalization, stored procedures, and triggers.', '2026-09-20 23:59:00', 200),
(3, 'AWS EC2 Lab Report', 'Deploy a web application on AWS EC2 and document the complete process.', '2026-08-15 23:59:00', 50),
(4, 'Process Scheduling Simulation', 'Simulate FCFS, SJF, and Round Robin scheduling algorithms.', '2026-08-18 23:59:00', 100);

-- ============================================================
-- INSERT QUIZZES
-- ============================================================
INSERT INTO quizzes (course_id, title, duration, total_questions, passing_marks, total_marks) VALUES
(1, 'DSA Quiz 1 — Arrays & Strings', 30, 15, 40, 75),
(1, 'DSA Quiz 2 — Trees & Graphs', 45, 20, 50, 100),
(2, 'DBMS Quiz 1 — Normalization', 30, 15, 35, 75),
(3, 'Cloud Quiz 1 — AWS Fundamentals', 25, 10, 25, 50),
(4, 'OS Quiz 1 — Process Management', 30, 15, 40, 75);

-- ============================================================
-- INSERT QUESTIONS FOR QUIZZES
-- ============================================================

-- DSA Quiz 1 (quiz_id = 1)
INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks) VALUES
(1, 'What is the time complexity of binary search?', 'mcq', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 'O(log n)', 5),
(1, 'An array is a linear data structure.', 'true_false', '["True", "False"]', 'True', 3),
(1, 'What is the worst-case time complexity of quicksort?', 'mcq', '["O(n)", "O(log n)", "O(n²)", "O(n log n)"]', 'O(n²)', 5),
(1, 'Explain the difference between stack and queue.', 'short_answer', '[]', 'Stack is LIFO, Queue is FIFO', 7),
(1, 'Which sorting algorithm is stable by default?', 'mcq', '["Quick Sort", "Merge Sort", "Selection Sort", "Heap Sort"]', 'Merge Sort', 5);

-- DSA Quiz 2 (quiz_id = 2)
INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks) VALUES
(2, 'What is the height of a balanced binary tree with n nodes?', 'mcq', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 'O(log n)', 5),
(2, 'Dijkstra algorithm works on which type of graph?', 'mcq', '["Unweighted", "Weighted", "Both", "None"]', 'Weighted', 5),
(2, 'BFS uses which data structure?', 'mcq', '["Stack", "Queue", "Priority Queue", "Array"]', 'Queue', 5),
(2, 'DFS uses which data structure?', 'mcq', '["Stack", "Queue", "Priority Queue", "Array"]', 'Stack', 5),
(2, 'What is the time complexity of Dijkstra algorithm?', 'mcq', '["O(n)", "O(log n)", "O(n²)", "O(n log n)"]', 'O(n log n)', 5);

-- DBMS Quiz 1 (quiz_id = 3)
INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks) VALUES
(3, 'What is 3NF normalization?', 'short_answer', '[]', 'Eliminate transitive dependencies', 7),
(3, 'A primary key can contain NULL values.', 'true_false', '["True", "False"]', 'False', 3),
(3, 'What does ACID stand for in DBMS?', 'short_answer', '[]', 'Atomicity Consistency Isolation Durability', 7),
(3, 'Which SQL keyword is used to retrieve data?', 'mcq', '["INSERT", "UPDATE", "SELECT", "DELETE"]', 'SELECT', 5),
(3, 'What is the difference between DELETE and TRUNCATE?', 'short_answer', '[]', 'DELETE is DML, TRUNCATE is DDL', 5);

-- Cloud Quiz 1 (quiz_id = 4)
INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks) VALUES
(4, 'EC2 stands for Elastic Compute Cloud.', 'true_false', '["True", "False"]', 'True', 5),
(4, 'What is the difference between IaaS and PaaS?', 'short_answer', '[]', 'IaaS provides infrastructure, PaaS provides platform', 10),
(4, 'Which AWS service is used for object storage?', 'mcq', '["EC2", "S3", "RDS", "Lambda"]', 'S3', 5),
(4, 'What is a VPC in AWS?', 'short_answer', '[]', 'Virtual Private Cloud', 5),
(4, 'AWS Lambda is a serverless compute service.', 'true_false', '["True", "False"]', 'True', 3);

-- OS Quiz 1 (quiz_id = 5)
INSERT INTO questions (quiz_id, question_text, type, question_options, correct_answer, marks) VALUES
(5, 'What is a process?', 'short_answer', '[]', 'A program in execution', 5),
(5, 'Round Robin scheduling is preemptive.', 'true_false', '["True", "False"]', 'True', 5),
(5, 'What is deadlock in OS?', 'short_answer', '[]', 'Two or more processes waiting for each other', 5),
(5, 'Which scheduling algorithm has the lowest average waiting time?', 'mcq', '["FCFS", "SJF", "Round Robin", "Priority"]', 'SJF', 5),
(5, 'What is the purpose of a semaphore?', 'short_answer', '[]', 'Process synchronization', 5);

-- ============================================================
-- INSERT SUBMISSIONS (Sample student submissions)
-- ============================================================
INSERT INTO submissions (assignment_id, student_id, submitted_at, marks_obtained, views) VALUES
(1, 5, '2026-08-09 21:30:00', 88, 3),
(1, 6, '2026-08-10 22:15:00', 92, 2),
(1, 7, '2026-08-10 23:50:00', 75, 1),
(1, 9, '2026-08-08 14:00:00', 95, 4),
(1, 10, '2026-08-10 18:00:00', 80, 2),
(2, 5, '2026-08-24 20:00:00', 90, 2),
(2, 6, '2026-08-25 10:00:00', 85, 1),
(2, 7, '2026-08-26 01:00:00', NULL, 0),
(4, 5, '2026-08-11 15:00:00', 45, 2),
(4, 6, '2026-08-12 20:00:00', 48, 1),
(4, 8, '2026-08-12 22:00:00', 42, 1),
(4, 9, '2026-08-10 10:00:00', 50, 3),
(4, 10, '2026-08-11 09:00:00', 47, 2),
(7, 5, '2026-08-14 16:00:00', 40, 1),
(7, 7, '2026-08-15 20:00:00', 35, 1),
(7, 8, '2026-08-15 23:00:00', NULL, 0),
(8, 6, '2026-08-17 12:00:00', 78, 2),
(8, 7, '2026-08-18 20:00:00', 82, 1),
(8, 8, '2026-08-18 23:55:00', 70, 1),
(8, 10, '2026-08-16 10:00:00', 90, 3);

-- ============================================================
-- INSERT QUIZ RESPONSES
-- ============================================================
INSERT INTO quiz_responses (quiz_id, student_id, marks, attempted_at) VALUES
(1, 5, 42, '2026-08-05 10:30:00'),
(1, 6, 48, '2026-08-05 10:45:00'),
(1, 7, 38, '2026-08-05 11:00:00'),
(1, 9, 50, '2026-08-05 10:15:00'),
(1, 10, 44, '2026-08-05 10:50:00'),
(3, 5, 40, '2026-08-15 14:00:00'),
(3, 6, 32, '2026-08-15 14:30:00'),
(3, 8, 38, '2026-08-15 14:15:00'),
(3, 9, 45, '2026-08-15 14:10:00'),
(3, 10, 42, '2026-08-15 14:20:00'),
(4, 5, 28, '2026-08-20 11:00:00'),
(4, 7, 22, '2026-08-20 11:20:00'),
(4, 8, 30, '2026-08-20 11:10:00');

-- ============================================================
-- VERIFY DATA
-- ============================================================
SELECT 
    (SELECT COUNT(*) FROM assignments) AS total_assignments,
    (SELECT COUNT(*) FROM quizzes) AS total_quizzes,
    (SELECT COUNT(*) FROM questions) AS total_questions,
    (SELECT COUNT(*) FROM submissions) AS total_submissions,
    (SELECT COUNT(*) FROM quiz_responses) AS total_quiz_responses;

-- ============================================================
-- END
-- ============================================================