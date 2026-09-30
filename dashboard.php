<?php
/*
    dashboard.php
    ----------------
    This page is shown only to logged-in users.
    - Admin  -> sees tasks from ALL departments.
    - Employee -> sees tasks ONLY from their own department.
    This is the core "Department-Wise Authentication" logic.
*/

session_start();
require "connection.php";

// STEP 1: Protect this page - if user is not logged in, send back to login page
if (!isset($_SESSION["user_id"])) {
    header("Location: index.php");
    exit();
}

// STEP 2: Read logged-in user's details from the session
$full_name = $_SESSION["full_name"];
$role      = $_SESSION["role"];
$dept_id   = $_SESSION["dept_id"]; // NULL if admin

// STEP 3: Find the department name of the logged-in user (not applicable for admin)
$dept_name = "All Departments (Admin)";

if ($role !== "admin") {
    $stmt = $conn->prepare("SELECT dept_name FROM departments WHERE dept_id = ?");
    $stmt->bind_param("i", $dept_id);
    $stmt->execute();
    $deptResult = $stmt->get_result();
    if ($deptRow = $deptResult->fetch_assoc()) {
        $dept_name = $deptRow["dept_name"];
    }
    $stmt->close();
}

// STEP 4: Fetch tasks based on role
// - Admin sees every task, joined with department name
// - Employee sees only tasks matching their own dept_id
if ($role === "admin") {
    $sql = "SELECT tasks.task_title, tasks.task_description, departments.dept_name
            FROM tasks
            JOIN departments ON tasks.dept_id = departments.dept_id
            ORDER BY departments.dept_name";
    $tasksResult = $conn->query($sql);
} else {
    $stmt = $conn->prepare("SELECT task_title, task_description FROM tasks WHERE dept_id = ?");
    $stmt->bind_param("i", $dept_id);
    $stmt->execute();
    $tasksResult = $stmt->get_result();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Department Authentication System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="navbar navbar-dark bg-primary">
    <div class="container-fluid">
        <span class="navbar-brand">🏢 THDC Authentication System</span>

        <a href="logout.php" class="btn btn-light">Logout</a>
    </div>
</nav>
<!-- Top navigation bar -->
<nav class="navbar navbar-dark bg-dark px-3">
    <span class="navbar-brand mb-0 h1">Department Task Dashboard</span>
    <a href="logout.php" class="btn btn-outline-light btn-sm">Logout</a>
</nav>

<div class="container mt-4">
<div class="row mb-4">

    <div class="col-md-4">
        <div class="card text-bg-primary">
            <div class="card-body text-center">
                <h3>4</h3>
                <p>Total Users</p>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card text-bg-success">
            <div class="card-body text-center">
                <h3>6</h3>
                <p>Total Tasks</p>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card text-bg-warning">
            <div class="card-body text-center">
                <h3>3</h3>
                <p>Departments</p>
            </div>
        </div>
    </div>

</div>
    <!-- User info card -->
    <div class="card shadow-sm mb-4">
        <h4 class="text-primary">

👋 Welcome,

<?php echo htmlspecialchars($full_name); ?>

</h4>

<hr>
        <div class="card-body">
            <h5 class="card-title mb-3">Welcome, <?php echo htmlspecialchars($full_name); ?> 👋</h5>
            <div class="row">
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">User Name</p>
                    <p class="fw-bold"><?php echo htmlspecialchars($full_name); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">Department</p>
                    <p class="fw-bold"><?php echo htmlspecialchars($dept_name); ?></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">Role</p>
                    <p class="fw-bold text-capitalize"><?php echo htmlspecialchars($role); ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Tasks section -->
    <h5 class="mb-3">
        <?php echo $role === "admin" ? "All Department Tasks" : "Your Department Tasks"; ?>
    </h5>

    <div class="table-responsive">
        <table class="table table-hover table-striped table-bordered shadow">
                <thead class="table-primary">
                <tr>
                    <th>Task Title</th>
                    <th>Description</th>
                    <th>
                    <?php if ($role === "admin"): ?>
                        <th>Department</th>
                    <?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if ($tasksResult && $tasksResult->num_rows > 0): ?>
                    <?php while ($task = $tasksResult->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($task["task_title"]); ?></td>
                            <td><?php echo htmlspecialchars($task["task_description"]); ?></td>
                            <?php if ($role === "admin"): ?>
                                <td><?php echo htmlspecialchars($task["dept_name"]); ?></td>
                            <?php endif; ?>
                        </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="<?php echo $role === 'admin' ? 3 : 2; ?>" class="text-center text-muted">No tasks found.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<footer class="text-center mt-5">

<hr>

<p>

© 2026 THDC Department Authentication System

</p>

</footer>
</body>
</html>
