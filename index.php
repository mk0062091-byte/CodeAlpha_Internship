<?php
session_start();

/* Use shared database connection */
require_once __DIR__ . '/connection.php';

/* Logout */
if(isset($_GET['logout'])){
    session_destroy();
    header("Location:index.php");
    exit();
}

/* Login */
$error="";
if(isset($_POST['login'])){

    $email=trim(strtolower($_POST['email']));
    $password=$_POST['password'];
    $result = null;
    $stmt=$conn->prepare("SELECT * FROM users WHERE email=?");
    if($stmt){
        $stmt->bind_param("s",$email);
        $stmt->execute();
        $result=$stmt->get_result();
        $stmt->close();
    }else{
        $error = "Database error";
    }
    if($result && $result->num_rows==1){

        $user=$result->fetch_assoc();

        if(password_verify($password,$user['password'])){

            $_SESSION['user_id']=$user['user_id'];
            $_SESSION['full_name']=$user['full_name'];
            $_SESSION['role']=$user['role'];
            $_SESSION['dept_id']=$user['dept_id'];

        }else{
            $error="Wrong Password";
        }

    }else{
        $error="User Not Found";
    }
}
?>

<!DOCTYPE html>
<html>
<head>

<title>Department Authentication</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
    body{
    background: linear-gradient(135deg,#0f4c81,#3b82f6);
    height:100vh;
}
.card{
    border-radius:20px;
    box-shadow:0 15px 30px rgba(0,0,0,.2);
}
.btn-primary{
    border-radius:10px;
}
</style>
</head>

<body class="bg-light">

<div class="container mt-5">

<?php

if(!isset($_SESSION['user_id'])){

?>

<div class="card mx-auto" style="max-width:450px;">
<div class="card-body">

<h3 class="text-center">Department Login</h3>

<?php
if($error!=""){
echo "<div class='alert alert-danger'>$error</div>";
}
?>
<h3> Authentication System in THDC </h3>

<form method="post">

<div class="mb-3">
<label>Email</label>
<input type="email" name="email" class="form-control" required>
</div>

<div class="mb-3">
<label>Password</label>
<input type="password" name="password" class="form-control" required>
</div>

<input type="submit" name="login" value="Login" class="btn btn-primary w-100">

</form>

<hr>

<b>Sample Login</b>

<ul>
<li>admin@company.com</li>
<li>hr@company.com</li>
<li>it@company.com</li>
<li>finance@company.com</li>
</ul>


</div>
</div>

<?php

}else{

echo "<h2>Welcome ".$_SESSION['full_name']."</h2>";

echo "<p><b>Role : </b>".$_SESSION['role']."</p>";

echo "<p><b>Department ID : </b>".$_SESSION['dept_id']."</p>";

echo "<a href='?logout=1' class='btn btn-danger mb-3'>Logout</a>";

if($_SESSION['role']=="admin"){

$sql="SELECT tasks.task_title,tasks.task_description,departments.dept_name
FROM tasks
JOIN departments
ON tasks.dept_id=departments.dept_id";

$result=$conn->query($sql);

}else{

$stmt=$conn->prepare("SELECT task_title,task_description
FROM tasks
WHERE dept_id=?");

$stmt->bind_param("i",$_SESSION['dept_id']);

$stmt->execute();

$result=$stmt->get_result();

}

?>

<table class="table table-bordered">

<tr>
<th>Task</th>
<th>Description</th>

<?php
if($_SESSION['role']=="admin"){
echo "<th>Department</th>";
}
?>

</tr>

<?php

while($row=$result->fetch_assoc()){

echo "<tr>";

echo "<td>".$row['task_title']."</td>";

echo "<td>".$row['task_description']."</td>";

if($_SESSION['role']=="admin"){

echo "<td>".$row['dept_name']."</td>";

}

echo "</tr>";

}

?>

</table>

<?php
}
?>

</div>

</body>
</html>