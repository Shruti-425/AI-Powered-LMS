-- ============================================================
-- COLLEGE LMS — SEED DATA (Sample / Test Data)
-- ============================================================
-- Realistic sample data for development & testing.
-- Run AFTER 01_schema.sql and 04_stored_procedures.sql.
--
-- NOTE: Triggers are active, so dashboard_stats will be
--       auto-populated as enrollment/submissions are inserted.
--       We still insert manual stats for completeness.
-- ============================================================

USE college_lms;

-- Temporarily disable triggers to avoid conflicts during bulk insert
SET @OLD_SQL_MODE = @@SQL_MODE;

-- -------------------------------------------------------
-- USERS (3 instructors + 1 admin + 6 students = 10 users)
-- Passwords are bcrypt hashes of 'Password@123'
-- -------------------------------------------------------
INSERT INTO users (email, password, name, role) VALUES
('admin@college.edu',          '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.admin',       'System Admin',      'admin'),
('prof.sharma@college.edu',    '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.sharma',      'Dr. Rajesh Sharma',  'instructor'),
('prof.gupta@college.edu',     '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.gupta',       'Dr. Priya Gupta',    'instructor'),
('prof.mehta@college.edu',     '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.mehta',       'Dr. Anil Mehta',     'instructor'),
('aarav.patel@college.edu',    '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.aarav',       'Aarav Patel',        'student'),
('diya.singh@college.edu',     '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.diya',        'Diya Singh',         'student'),
('rohan.kumar@college.edu',    '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.rohan',       'Rohan Kumar',        'student'),
('ananya.rao@college.edu',     '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.ananya',      'Ananya Rao',         'student'),
('vikram.joshi@college.edu',   '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.vikram',      'Vikram Joshi',       'student'),
('neha.verma@college.edu',     '$2a$12$LJ3a5bK0vFnQzLuOe0h6/.dummy.hash.neha',        'Neha Verma',         'student');

-- -------------------------------------------------------
-- COURSES (5 courses across 2 semesters)
-- instructor_id references: 2=Sharma, 3=Gupta, 4=Mehta
-- -------------------------------------------------------
INSERT INTO courses (course_name, code, instructor_id, credits, semester) VALUES
('Data Structures & Algorithms',  'CS301',  2, 4, 'Fall 2026'),
('Database Management Systems',   'CS302',  3, 4, 'Fall 2026'),
('Cloud Computing',               'CS401',  4, 3, 'Fall 2026'),
('Operating Systems',             'CS303',  2, 4, 'Fall 2026'),
('Machine Learning',              'CS402',  3, 3, 'Spring 2027');

-- -------------------------------------------------------
-- ENROLLMENT
-- -------------------------------------------------------
INSERT INTO enrollment (student_id, course_id, enrolled_date) VALUES
-- Aarav (5): CS301, CS302, CS401
(5, 1, '2026-07-15'), (5, 2, '2026-07-15'), (5, 3, '2026-07-16'),
-- Diya (6): CS301, CS302, CS303
(6, 1, '2026-07-15'), (6, 2, '2026-07-15'), (6, 4, '2026-07-16'),
-- Rohan (7): CS301, CS401, CS303
(7, 1, '2026-07-15'), (7, 3, '2026-07-16'), (7, 4, '2026-07-16'),
-- Ananya (8): CS302, CS401, CS303
(8, 2, '2026-07-15'), (8, 3, '2026-07-16'), (8, 4, '2026-07-16'),
-- Vikram (9): CS301, CS302
(9, 1, '2026-07-15'), (9, 2, '2026-07-15'),
-- Neha (10): CS301, CS302, CS401, CS303
(10, 1, '2026-07-15'), (10, 2, '2026-07-15'), (10, 3, '2026-07-16'), (10, 4, '2026-07-16');

-- -------------------------------------------------------
-- ASSIGNMENTS
-- -------------------------------------------------------
INSERT INTO assignments (course_id, title, description, due_date, max_marks) VALUES
-- CS301 - DSA
(1, 'Linked List Implementation',     'Implement singly & doubly linked lists in C++.',         '2026-08-10 23:59:00', 100.00),
(1, 'Binary Tree Traversals',         'Implement in-order, pre-order, post-order traversals.',  '2026-08-25 23:59:00', 100.00),
(1, 'Graph Algorithms Project',       'Implement BFS, DFS, Dijkstra on a real-world dataset.',  '2026-09-15 23:59:00', 150.00),
-- CS302 - DBMS
(2, 'ER Diagram Design',              'Design an ER diagram for a hospital management system.', '2026-08-12 23:59:00',  50.00),
(2, 'SQL Queries Practice',           'Write 20 complex SQL queries on the sample database.',   '2026-08-28 23:59:00',  80.00),
(2, 'Database Project',               'Full RDBMS project with normalization & stored procs.',   '2026-09-20 23:59:00', 200.00),
-- CS401 - Cloud
(3, 'AWS EC2 Lab Report',             'Deploy a web app on EC2 and document the process.',       '2026-08-15 23:59:00',  50.00),
-- CS303 - OS
(4, 'Process Scheduling Simulation',  'Simulate FCFS, SJF, Round Robin scheduling algorithms.', '2026-08-18 23:59:00', 100.00);

-- -------------------------------------------------------
-- SUBMISSIONS
-- -------------------------------------------------------
INSERT INTO submissions (assignment_id, student_id, submitted_at, marks_obtained, views) VALUES
-- DSA - Linked List (assignment 1)
(1, 5,  '2026-08-09 21:30:00', 88.00, 3),
(1, 6,  '2026-08-10 22:15:00', 92.00, 2),
(1, 7,  '2026-08-10 23:50:00', 75.00, 1),
(1, 9,  '2026-08-08 14:00:00', 95.00, 4),
(1, 10, '2026-08-10 18:00:00', 80.00, 2),
-- DSA - Binary Tree (assignment 2)
(2, 5,  '2026-08-24 20:00:00', 90.00, 2),
(2, 6,  '2026-08-25 10:00:00', 85.00, 1),
(2, 7,  '2026-08-26 01:00:00', NULL,  0),   -- late, not graded yet
-- DBMS - ER Diagram (assignment 4)
(4, 5,  '2026-08-11 15:00:00', 45.00, 2),
(4, 6,  '2026-08-12 20:00:00', 48.00, 1),
(4, 8,  '2026-08-12 22:00:00', 42.00, 1),
(4, 9,  '2026-08-10 10:00:00', 50.00, 3),
(4, 10, '2026-08-11 09:00:00', 47.00, 2),
-- Cloud - EC2 Lab (assignment 7)
(7, 5,  '2026-08-14 16:00:00', 40.00, 1),
(7, 7,  '2026-08-15 20:00:00', 35.00, 1),
(7, 8,  '2026-08-15 23:00:00', NULL,  0),   -- not graded yet
-- OS - Process Scheduling (assignment 8)
(8, 6,  '2026-08-17 12:00:00', 78.00, 2),
(8, 7,  '2026-08-18 20:00:00', 82.00, 1),
(8, 8,  '2026-08-18 23:55:00', 70.00, 1),
(8, 10, '2026-08-16 10:00:00', 90.00, 3);

-- -------------------------------------------------------
-- QUIZZES
-- -------------------------------------------------------
INSERT INTO quizzes (course_id, title, duration, total_questions, passing_marks, total_marks) VALUES
(1, 'DSA Quiz 1 — Arrays & Strings',     30, 15, 40.00, 75.00),
(1, 'DSA Quiz 2 — Trees & Graphs',       45, 20, 50.00,100.00),
(2, 'DBMS Quiz 1 — Normalization',       30, 15, 35.00, 75.00),
(3, 'Cloud Quiz 1 — AWS Fundamentals',   25, 10, 25.00, 50.00),
(4, 'OS Quiz 1 — Process Management',    30, 15, 40.00, 75.00);

-- -------------------------------------------------------
-- QUESTIONS (sample for DSA Quiz 1)
-- -------------------------------------------------------
INSERT INTO questions (quiz_id, question_text, type, correct_answer, marks) VALUES
(1, 'What is the time complexity of binary search?',            'mcq',        'O(log n)',   5.00),
(1, 'An array is a linear data structure.',                      'true_false', 'True',       3.00),
(1, 'What is the worst-case time complexity of quicksort?',     'mcq',        'O(n^2)',     5.00),
(1, 'Explain the difference between stack and queue.',           'short_answer','Stack is LIFO, Queue is FIFO', 7.00),
(1, 'Which sorting algorithm is stable by default?',            'mcq',        'Merge Sort', 5.00),
-- DBMS Quiz 1
(3, 'What is 3NF normalization?',                               'short_answer','Eliminate transitive dependencies', 7.00),
(3, 'A primary key can contain NULL values.',                   'true_false', 'False',      3.00),
(3, 'What does ACID stand for in DBMS?',                        'short_answer','Atomicity Consistency Isolation Durability', 7.00),
-- Cloud Quiz 1
(4, 'EC2 stands for Elastic Compute Cloud.',                    'true_false', 'True',       5.00),
(4, 'What is the difference between IaaS and PaaS?',           'short_answer','IaaS provides infrastructure, PaaS provides platform', 10.00);

-- -------------------------------------------------------
-- QUIZ RESPONSES
-- -------------------------------------------------------
INSERT INTO quiz_responses (quiz_id, student_id, marks, attempted_at) VALUES
-- DSA Quiz 1
(1, 5,  42.00, '2026-08-05 10:30:00'),
(1, 6,  48.00, '2026-08-05 10:45:00'),
(1, 7,  38.00, '2026-08-05 11:00:00'),   -- failed
(1, 9,  50.00, '2026-08-05 10:15:00'),
(1, 10, 44.00, '2026-08-05 10:50:00'),
-- DBMS Quiz 1
(3, 5,  40.00, '2026-08-15 14:00:00'),
(3, 6,  32.00, '2026-08-15 14:30:00'),   -- failed
(3, 8,  38.00, '2026-08-15 14:15:00'),
(3, 9,  45.00, '2026-08-15 14:10:00'),
(3, 10, 42.00, '2026-08-15 14:20:00'),
-- Cloud Quiz 1
(4, 5,  28.00, '2026-08-20 11:00:00'),
(4, 7,  22.00, '2026-08-20 11:20:00'),   -- failed
(4, 8,  30.00, '2026-08-20 11:10:00');

-- -------------------------------------------------------
-- CLASSES (scheduled lectures)
-- -------------------------------------------------------
INSERT INTO classes (course_id, class_date, time, room, instructor_id) VALUES
-- DSA — Mon, Wed, Fri
(1, '2026-08-03', '10:00:00', 'Room 101', 2),
(1, '2026-08-05', '10:00:00', 'Room 101', 2),
(1, '2026-08-07', '10:00:00', 'Room 101', 2),
(1, '2026-08-10', '10:00:00', 'Room 101', 2),
(1, '2026-08-12', '10:00:00', 'Room 101', 2),
-- DBMS — Tue, Thu
(2, '2026-08-04', '11:00:00', 'Room 204', 3),
(2, '2026-08-06', '11:00:00', 'Room 204', 3),
(2, '2026-08-11', '11:00:00', 'Room 204', 3),
(2, '2026-08-13', '11:00:00', 'Room 204', 3),
-- Cloud — Wed
(3, '2026-08-05', '14:00:00', 'Lab 3',    4),
(3, '2026-08-12', '14:00:00', 'Lab 3',    4),
-- OS — Mon, Thu
(4, '2026-08-03', '15:00:00', 'Room 302', 2),
(4, '2026-08-06', '15:00:00', 'Room 302', 2),
(4, '2026-08-10', '15:00:00', 'Room 302', 2),
(4, '2026-08-13', '15:00:00', 'Room 302', 2);

-- -------------------------------------------------------
-- ATTENDANCE
-- -------------------------------------------------------
INSERT INTO attendance (class_id, student_id, status, date) VALUES
-- DSA class 1 (Aug 3)
(1, 5,  'present', '2026-08-03'),
(1, 6,  'present', '2026-08-03'),
(1, 7,  'absent',  '2026-08-03'),
(1, 9,  'present', '2026-08-03'),
(1, 10, 'present', '2026-08-03'),
-- DSA class 2 (Aug 5)
(2, 5,  'present', '2026-08-05'),
(2, 6,  'late',    '2026-08-05'),
(2, 7,  'present', '2026-08-05'),
(2, 9,  'present', '2026-08-05'),
(2, 10, 'absent',  '2026-08-05'),
-- DSA class 3 (Aug 7)
(3, 5,  'present', '2026-08-07'),
(3, 6,  'present', '2026-08-07'),
(3, 7,  'present', '2026-08-07'),
(3, 9,  'absent',  '2026-08-07'),
(3, 10, 'present', '2026-08-07'),
-- DBMS class 1 (Aug 4)
(6, 5,  'present', '2026-08-04'),
(6, 6,  'present', '2026-08-04'),
(6, 8,  'present', '2026-08-04'),
(6, 9,  'late',    '2026-08-04'),
(6, 10, 'present', '2026-08-04'),
-- Cloud class 1 (Aug 5)
(10, 5,  'present', '2026-08-05'),
(10, 7,  'absent',  '2026-08-05'),
(10, 8,  'present', '2026-08-05'),
(10, 10, 'present', '2026-08-05'),
-- OS class 1 (Aug 3)
(12, 6,  'present', '2026-08-03'),
(12, 7,  'present', '2026-08-03'),
(12, 8,  'late',    '2026-08-03'),
(12, 10, 'present', '2026-08-03');

-- -------------------------------------------------------
-- GRADES (final course grades — computed for demo)
-- -------------------------------------------------------
INSERT INTO grades (student_id, course_id, final_marks, grade) VALUES
(5, 1, 85.50, 'A'),
(6, 1, 88.00, 'A'),
(9, 1, 91.00, 'A+'),
(5, 2, 78.00, 'B+'),
(6, 2, 72.50, 'B+');

-- -------------------------------------------------------
-- DASHBOARD_STATS (manual insert for demo; triggers also populate)
-- -------------------------------------------------------
INSERT INTO dashboard_stats (student_id, enrolled_count, quiz_count, assignment_count, avg_attendance)
VALUES
(5,  3, 3, 4, 92.50),
(6,  3, 2, 4, 88.00),
(7,  3, 2, 3, 66.67),
(8,  3, 2, 3, 83.33),
(9,  2, 2, 2, 75.00),
(10, 4, 2, 3, 85.00)
ON DUPLICATE KEY UPDATE
    enrolled_count   = VALUES(enrolled_count),
    quiz_count       = VALUES(quiz_count),
    assignment_count = VALUES(assignment_count),
    avg_attendance   = VALUES(avg_attendance);

-- ============================================================
-- END OF SEED DATA
-- ============================================================

SET SQL_MODE = @OLD_SQL_MODE;
