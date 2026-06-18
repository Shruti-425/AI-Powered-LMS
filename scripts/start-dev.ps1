# Start backend and frontend dev servers for local testing.
# Usage: .\scripts\start-dev.ps1

$root = Split-Path $PSScriptRoot -Parent

Write-Host "Starting backend on http://localhost:5000 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://localhost:5173 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Frontend'; npm run dev"

Write-Host ""
Write-Host "Task Manager: http://localhost:5173/student/tasks"
Write-Host "API health:   http://localhost:5000/api/health"
