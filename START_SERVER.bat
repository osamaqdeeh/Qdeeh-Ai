@echo off
echo ========================================
echo Starting QdeehAi Development Server
echo ========================================
echo.

REM Kill any existing node processes on port 3000
echo Checking for existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting development server...
echo.
echo The server will be available at: http://localhost:3000
echo.
echo Login credentials:
echo   Admin: http://localhost:3000/admin-dashboard-secret
echo          Email: admin@example.com
echo          Password: admin123
echo.
echo   Student: Email: student@example.com
echo            Password: student123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
