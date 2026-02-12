@echo off
color 0A
title QdeehAi - Complete Automatic Setup
cls

echo.
echo  ██████╗ ██████╗ ███████╗███████╗██╗  ██╗ █████╗ ██╗
echo ██╔═══██╗██╔══██╗██╔════╝██╔════╝██║  ██║██╔══██╗██║
echo ██║   ██║██║  ██║█████╗  █████╗  ███████║███████║██║
echo ██║▄▄ ██║██║  ██║██╔══╝  ██╔══╝  ██╔══██║██╔══██║██║
echo ╚██████╔╝██████╔╝███████╗███████╗██║  ██║██║  ██║██║
echo  ╚══▀▀═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
echo.
echo ========================================
echo   AUTOMATIC INSTALLATION SCRIPT
echo ========================================
echo.
echo This will set up everything automatically!
echo.
echo Your PostgreSQL Settings:
echo   Password: qdeeh059ai
echo   Port: 5432
echo   Database: qdeeh_ai
echo.
echo ========================================
echo.
pause

cls
echo ========================================
echo STEP 1: Creating Database
echo ========================================
echo.

REM Set PostgreSQL password
set PGPASSWORD=qdeeh059ai

echo Connecting to PostgreSQL...
echo Creating database 'qdeeh_ai'...
echo.

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE qdeeh_ai;" 2>nul

if %errorlevel% equ 0 (
    echo ✓ Database created successfully!
) else (
    echo ⚠ Database might already exist. Continuing...
)

echo.
echo Verifying database exists...
psql -U postgres -h localhost -p 5432 -l | findstr qdeeh_ai >nul
if %errorlevel% equ 0 (
    echo ✓ Database 'qdeeh_ai' confirmed!
) else (
    echo ✗ Could not verify database. Please check PostgreSQL is running.
    echo.
    echo Make sure:
    echo   1. PostgreSQL is installed
    echo   2. PostgreSQL service is running
    echo   3. Password is: qdeeh059ai
    echo   4. Port is: 5432
    echo.
    pause
    exit /b 1
)

echo.
pause

cls
echo ========================================
echo STEP 2: Installing Dependencies
echo ========================================
echo.
echo This may take 2-5 minutes...
echo Please wait...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ✗ Failed to install dependencies!
    echo Make sure Node.js is installed.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies installed successfully!
echo.
pause

cls
echo ========================================
echo STEP 3: Setting Up Database Schema
echo ========================================
echo.

echo Generating Prisma Client...
call npm run db:generate

if %errorlevel% neq 0 (
    echo ✗ Failed to generate Prisma Client!
    pause
    exit /b 1
)

echo ✓ Prisma Client generated!
echo.

echo Creating database tables...
call npm run db:push

if %errorlevel% neq 0 (
    echo ✗ Failed to create tables!
    echo Check your database connection.
    pause
    exit /b 1
)

echo ✓ Database tables created!
echo.
pause

cls
echo ========================================
echo STEP 4: Adding Test Data
echo ========================================
echo.

call npm run db:seed

if %errorlevel% neq 0 (
    echo ✗ Failed to seed database!
    pause
    exit /b 1
)

echo.
pause

cls
color 0B
echo.
echo  ███████╗██╗   ██╗ ██████╗ ██████╗███████╗███████╗███████╗██╗
echo  ██╔════╝██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝██║
echo  ███████╗██║   ██║██║     ██║     █████╗  ███████╗███████╗██║
echo  ╚════██║██║   ██║██║     ██║     ██╔══╝  ╚════██║╚════██║╚═╝
echo  ███████║╚██████╔╝╚██████╗╚██████╗███████╗███████║███████║██╗
echo  ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝╚═╝
echo.
echo ========================================
echo   INSTALLATION COMPLETE!
echo ========================================
echo.
echo ✓ Database created
echo ✓ Dependencies installed
echo ✓ Tables created
echo ✓ Test data added
echo.
echo ========================================
echo   LOGIN CREDENTIALS
echo ========================================
echo.
echo 🔐 ADMIN (Super Admin):
echo    URL: http://localhost:3000/auth/admin-signin
echo    Email: admin@example.com
echo    Password: admin123
echo.
echo 👨‍🎓 STUDENT:
echo    URL: http://localhost:3000/auth/signin
echo    Email: student@example.com
echo    Password: student123
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo To start the development server:
echo    Double-click: start-dev.bat
echo.
echo Or run manually:
echo    npm run dev
echo.
echo Then visit: http://localhost:3000
echo.
echo ========================================
echo.
echo Press any key to start the server now...
pause >nul

cls
echo Starting development server...
echo.
echo Server will run on: http://localhost:3000
echo.
echo ADMIN: http://localhost:3000/auth/admin-signin
echo STUDENT: http://localhost:3000/auth/signin
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
