# Department-Wise Authentication System (PHP + MySQL)

A simple beginner-friendly B.Tech mini project. Users log in and see only
their own department's tasks. Admin can see tasks from every department.

## Folder Structure

```
dept-auth-system/
│
├── connection.php     -> MySQLi database connection
├── index.php          -> Login page (entry point)
├── dashboard.php       -> Dashboard shown after login (department-wise tasks)
├── logout.php          -> Destroys session and logs the user out
├── database.sql        -> SQL script: creates DB, tables, and sample data
├── css/
│   └── style.css        -> Small custom styling on top of Bootstrap
└── README.md            -> This file
```

## Tech Stack
- **Frontend:** HTML, CSS, Bootstrap 5 (via CDN)
- **Backend:** PHP (MySQLi, procedural + prepared statements)
- **Database:** MySQL

## How the Department-Wise Access Works
1. Every user row in the `users` table has a `dept_id` (foreign key to `departments`).
   Admin's `dept_id` is `NULL` because they are not tied to one department.
2. Every task in the `tasks` table also has a `dept_id`.
3. On `dashboard.php`:
   - If `role == 'admin'` → query fetches **all** tasks (joined with department name).
   - If `role == 'employee'` → query fetches tasks **WHERE dept_id = [logged-in user's dept_id]**.
   This single `WHERE` condition is what enforces department-level isolation.
4. `dashboard.php` also checks `$_SESSION['user_id']` at the very top — if a user
   is not logged in, they're redirected back to `index.php`. This stops people
   from directly opening `dashboard.php` without logging in.

## Sample Login Credentials
All sample users share the same password for easy testing.

| Role     | Email                  | Password     | Department |
|----------|-------------------------|--------------|------------|
| Admin    | admin@company.com       | password123  | (All)      |
| Employee | hr@company.com          | password123  | HR         |
| Employee | it@company.com          | password123  | IT         |
| Employee | finance@company.com     | password123  | Finance    |

## Step-by-Step: Running on XAMPP

1. **Install & start XAMPP**
   - Download from https://www.apachefriends.org/ if not already installed.
   - Open the XAMPP Control Panel and click **Start** next to **Apache** and **MySQL**.

2. **Copy the project into htdocs**
   - Copy the entire `dept-auth-system` folder into your XAMPP `htdocs` directory.
     - Windows: `C:\xampp\htdocs\dept-auth-system`
     - macOS: `/Applications/XAMPP/htdocs/dept-auth-system`
     - Linux: `/opt/lampp/htdocs/dept-auth-system`

3. **Create the database**
   - Open your browser and go to `http://localhost/phpmyadmin`.
   - Click **New** on the left sidebar to create a database (or just run the script below — it creates the DB itself).
   - Click the **SQL** tab, open `database.sql` from the project folder, copy all its contents,
     paste into the SQL box, and click **Go**.
   - This will create the `dept_auth_system` database along with the `departments`,
     `users`, and `tasks` tables, and insert all sample data automatically.

4. **Check database credentials**
   - Open `connection.php`.
   - Default XAMPP settings are already filled in:
     - Host: `localhost`
     - User: `root`
     - Password: `` (empty)
     - Database: `dept_auth_system`
   - If your MySQL setup uses a different username/password, update these values.

5. **Run the project**
   - Open your browser and visit: `http://localhost/dept-auth-system/index.php`
   - Log in using any of the sample credentials listed above.
   - You'll be redirected to the dashboard showing your name, department, role,
     and only the tasks that belong to your department (or all tasks, if Admin).

6. **Log out**
   - Click the **Logout** button on the dashboard's top navbar — this destroys
     the session and sends you back to the login page.

## Notes for Viva / Presentation
- Passwords are stored using PHP's `password_hash()` (bcrypt) and checked
  using `password_verify()` — never stored in plain text.
- All database queries use **prepared statements** (`bind_param`) to prevent
  SQL Injection.
- `session_start()` + `$_SESSION` array is used to keep the user logged in
  across pages, and `session_destroy()` on logout clears it.
- The department restriction is enforced **server-side** in `dashboard.php`
  (in the SQL `WHERE dept_id = ?` clause) — not just hidden in the UI —
  so it can't be bypassed by editing the page.
