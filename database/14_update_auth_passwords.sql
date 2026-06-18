-- ============================================================
-- Update seed user passwords to bcrypt hash of: Password@123
-- Run after 06_seed_data.sql
-- ============================================================

USE college_lms;

UPDATE users
SET password = '$2b$12$AoGr/qi7O7AX6/pdyI9IDOXahFxmk3tl8Mf67BVUN.fjGSAV5KTne'
WHERE email IN (
    'admin@college.edu',
    'prof.sharma@college.edu',
    'prof.gupta@college.edu',
    'prof.mehta@college.edu',
    'aarav.patel@college.edu',
    'diya.singh@college.edu',
    'rohan.kumar@college.edu',
    'ananya.rao@college.edu',
    'vikram.joshi@college.edu',
    'neha.verma@college.edu'
);
