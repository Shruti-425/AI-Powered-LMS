# Setup college_lms tasks table for the Task Manager feature.
# Usage: .\scripts\setup-database.ps1 -Password "your_mysql_password"

param(
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schema = Join-Path $PSScriptRoot "..\database\09_tasks_schema.sql"

if (-not (Test-Path $mysql)) {
    Write-Error "MySQL client not found at: $mysql"
    exit 1
}

if (-not (Test-Path $schema)) {
    Write-Error "Schema file not found at: $schema"
    exit 1
}

Write-Host "Applying tasks schema to college_lms..."
& $mysql -u root "-p$Password" < $schema

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Tasks table created and seeded."
    Write-Host "Update Backend/.env with DB_PASS=$Password then restart the backend."
} else {
    Write-Error "Migration failed. Check your MySQL password and that college_lms exists."
    exit 1
}
