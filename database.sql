-- =====================================================
-- Department-Wise Authentication System
-- Database Script (MySQL)
-- =====================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS dept_auth_system;
USE dept_auth_system;

-- 2. Table: departments
-- Stores the list of departments in the organization
CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(50) NOT NULL UNIQUE,
);

-- 3. Table: users
-- Stores login credentials and role/department info for each user
-- role can be 'admin' or 'employee'
-- dept_id is NULL for admin (admin belongs to no single department)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- stored as a hashed password
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    dept_id INT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 4. Table: tasks
-- Stores tasks assigned to a particular department
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_title VARCHAR(150) NOT NULL,
    task_description TEXT,
    dept_id INT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- =====================================================
-- Sample Data
-- =====================================================

-- 5. Insert Departments
INSERT INTO departments (dept_name) VALUES
('HR'),
('IT'),
('Finance')
('Management');

-- 6. Insert Users
-- NOTE: All passwords below are the plain word "password123" hashed using PHP's password_hash() (bcrypt).
-- The hash shown here corresponds to "password123" for EVERY user, so you can log in
-- to all four accounts using the same password during testing.
--
-- Email                  | Password      | Role
-- admin@company.com      | password123   | admin
-- hr@company.com         | password123   | employee (HR)
-- it@company.com         | password123   | employee (IT)
-- finance@company.com    | password123   | employee (Finance)

INSERT INTO users (full_name, email, password, role, dept_id) VALUES
('Alice Admin',    'admin@company.com',   '$2y$10$cQrH/ZVvtDZmA0HL9dSpMeq1GvAVe4gkib6Cu43ySpI5kUCwkaY26', 'admin', NULL),
('Hina HR',         'hr@company.com',      '$2y$10$cQrH/ZVvtDZmA0HL9dSpMeq1GvAVe4gkib6Cu43ySpI5kUCwkaY26', 'employee', 1),
('Ivan IT',          'it@company.com',      '$2y$10$cQrH/ZVvtDZmA0HL9dSpMeq1GvAVe4gkib6Cu43ySpI5kUCwkaY26', 'employee', 2),
('Fiona Finance',    'finance@company.com', '$2y$10$cQrH/ZVvtDZmA0HL9dSpMeq1GvAVe4gkib6Cu43ySpI5kUCwkaY26', 'employee', 3)
('Megha',  'varshakashyap707811@gmail.com', '$2y$10$cQrH/ZVvtDZmA0HL9dSpMeq1GvAVe4gkib6Cu43ySpI5kUCwkaY26', 'employee',4);
-- 7. Insert Sample Tasks
INSERT INTO tasks (task_title, task_description, dept_id) VALUES
('Conduct Interview',       'Schedule and conduct interviews for the new hiring drive.', 1),
('Update Employee Records', 'Update leave and attendance records for all staff.',        1),
('Fix Server Downtime',     'Investigate and resolve the recent server downtime issue.', 2),
('Upgrade Office Wi-Fi',    'Upgrade the office Wi-Fi routers to support more devices.',  2),
('Prepare Monthly Budget',  'Prepare and review the budget report for this month.',      3),
('Audit Expense Reports',   'Audit the expense reports submitted by all departments.',   3);