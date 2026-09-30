<?php
/*
    connection.php
    ----------------
    This file creates a single MySQLi connection that is
    reused by every other page (index.php, dashboard.php, logout.php).
    Change the values below to match your own XAMPP / MySQL setup.
*/

$db_host = "localhost";      // Database server (default for XAMPP)
$db_user = "root";           // Default XAMPP MySQL username
$db_pass = "Mysql@123";               // Default XAMPP MySQL password (empty)
$db_name = "dept_auth_system"; // Database name created using database.sql

// Create connection using MySQLi (object-oriented style)
$conn = new mysqli("localhost", "root", "", "thdc_project");

// Check connection and stop the script if it fails
if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}
?>
