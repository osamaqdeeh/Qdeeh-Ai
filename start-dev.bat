@echo off
echo ========================================
echo QdeehAi - Starting Development Server
echo ========================================
echo.
echo Starting server on http://localhost:3000
echo.
echo ADMIN: http://localhost:3000/auth/admin-signin
echo STUDENT: http://localhost:3000/auth/signin
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
