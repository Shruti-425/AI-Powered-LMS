# 🎓 College LMS — Database

A production-ready MySQL database for a **Learning Management System (LMS)** designed for college use. Contains 12 fully normalized tables with foreign keys, constraints, triggers, stored procedures, views, and sample data.

---

## 📁 Folder Structure

```
college-lms-database/
├── 01_schema.sql              # CREATE TABLE statements (12 tables)
├── 02_indexes.sql             # Additional composite & covering indexes
├── 03_views.sql               # 8 reusable views for dashboards & reports
├── 04_stored_procedures.sql   # 7 stored procedures for business logic
├── 05_triggers.sql            # 8 triggers for validation & automation
├── 06_seed_data.sql           # Realistic sample data (10 users, 5 courses, etc.)
├── 07_sample_queries.sql      # 12 ready-to-run test queries
└── README.md                  # This file
```

---

## 🗂️ Database Schema (12 Tables)

| # | Table              | Purpose                             | Key Relationships                |
|---|-------------------|-------------------------------------|----------------------------------|
| 1 | `users`           | Students, Instructors, Admins       | Referenced by almost all tables  |
| 2 | `courses`         | DSA, DBMS, Cloud, OS, ML            | FK → `users` (instructor)       |
| 3 | `enrollment`      | Student ↔ Course mapping            | FK → `users`, `courses`         |
| 4 | `assignments`     | Homework, projects, labs            | FK → `courses`                  |
| 5 | `submissions`     | Student work for assignments        | FK → `assignments`, `users`     |
| 6 | `quizzes`         | Timed assessments per course        | FK → `courses`                  |
| 7 | `questions`       | MCQ, true/false, short-answer       | FK → `quizzes`                  |
| 8 | `quiz_responses`  | Student quiz attempts & marks       | FK → `quizzes`, `users`         |
| 9 | `classes`         | Scheduled lectures & labs           | FK → `courses`, `users`         |
|10 | `attendance`      | Per-class student attendance        | FK → `classes`, `users`         |
|11 | `grades`          | Final course grades (A+, A, B, ...) | FK → `users`, `courses`         |
|12 | `dashboard_stats` | Pre-computed analytics cache        | FK → `users`                    |

---

## 🚀 Quick Setup

### Prerequisites
- **MySQL 8.0+** (or MariaDB 10.5+)
- A MySQL client (MySQL Workbench, DBeaver, CLI, phpMyAdmin)

### Installation (run in order)

```bash
# Step 1: Create schema & tables
mysql -u root -p < 01_schema.sql

# Step 2: Add performance indexes
mysql -u root -p college_lms < 02_indexes.sql

# Step 3: Create views
mysql -u root -p college_lms < 03_views.sql

# Step 4: Create stored procedures
mysql -u root -p college_lms < 04_stored_procedures.sql

# Step 5: Create triggers
mysql -u root -p college_lms < 05_triggers.sql

# Step 6: Load sample data
mysql -u root -p college_lms < 06_seed_data.sql
```

Or run everything at once:

```bash
mysql -u root -p < 01_schema.sql && \
mysql -u root -p college_lms < 02_indexes.sql && \
mysql -u root -p college_lms < 03_views.sql && \
mysql -u root -p college_lms < 04_stored_procedures.sql && \
mysql -u root -p college_lms < 05_triggers.sql && \
mysql -u root -p college_lms < 06_seed_data.sql
```

---

## 📊 Views Available

| View                        | Description                                    |
|----------------------------|------------------------------------------------|
| `vw_student_dashboard`     | Student's enrolled courses overview            |
| `vw_course_roster`         | All students enrolled in each course           |
| `vw_attendance_report`     | Attendance % per student per course            |
| `vw_assignment_tracker`    | Submissions with grading & timing status       |
| `vw_quiz_results`          | Quiz performance with pass/fail status         |
| `vw_grade_sheet`           | Final grades with letter grades                |
| `vw_instructor_workload`   | Courses, classes, assignments per instructor   |
| `vw_todays_timetable`      | Today's scheduled classes                      |

---

## ⚙️ Stored Procedures

| Procedure                     | Purpose                                       |
|------------------------------|-----------------------------------------------|
| `sp_enroll_student()`        | Enroll a student with validation              |
| `sp_submit_assignment()`     | Submit assignment with duplicate check        |
| `sp_grade_submission()`      | Grade a submission with max-marks validation  |
| `sp_mark_attendance()`       | Bulk attendance marking for a class           |
| `sp_calculate_grade()`       | Weighted grade calc (40% assign, 30% quiz, 30% attend) |
| `sp_refresh_dashboard_stats()` | Recompute dashboard analytics cache        |
| `sp_get_transcript()`        | Retrieve full student transcript              |

---

## 🔥 Triggers

| Trigger                         | Event              | Action                                    |
|--------------------------------|--------------------|-----------------------------------------|
| `trg_after_enrollment_insert`  | After enrollment   | Refresh dashboard stats                  |
| `trg_after_submission_insert`  | After submission   | Refresh dashboard stats                  |
| `trg_after_submission_update`  | After grading      | Refresh dashboard stats                  |
| `trg_after_attendance_insert`  | After attendance   | Refresh dashboard stats                  |
| `trg_after_quiz_response_insert` | After quiz attempt | Refresh dashboard stats               |
| `trg_before_enrollment_validate` | Before enrollment | Validate user role is 'student'          |
| `trg_before_course_validate`  | Before course add  | Validate user role is 'instructor'       |
| `trg_before_submission_grade` | Before grading     | Ensure marks ≤ max_marks and ≥ 0        |

---

## 🧪 Sample Data Summary

| Entity        | Count | Notes                               |
|--------------|-------|--------------------------------------|
| Users         | 10    | 1 admin, 3 instructors, 6 students  |
| Courses       | 5     | CS301–CS402 across 2 semesters      |
| Enrollments   | 20    | 3–4 courses per student             |
| Assignments   | 8     | Across DSA, DBMS, Cloud, OS         |
| Submissions   | 20    | Mix of graded, pending, late        |
| Quizzes       | 5     | 10–20 questions each                |
| Questions     | 10    | MCQ, true/false, short answer       |
| Quiz Responses| 13    | Mix of pass/fail results            |
| Classes       | 15    | Mon–Fri schedules                   |
| Attendance    | 27    | Present, absent, late statuses      |
| Grades        | 5     | Final grades for demo               |

---

## 📝 License

Free to use for educational and college project purposes.
