@echo off
echo ========================================
echo QdeehAi - Automatic Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Check if PostgreSQL is running
echo [2/6] Checking PostgreSQL connection...
psql -U postgres -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Cannot connect to PostgreSQL!
    echo Make sure PostgreSQL is running and the password is correct.
    echo Your password: qdeeh059ai
    echo.
)

REM Install dependencies
echo [3/6] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Generate Prisma Client
echo [4/6] Generating Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma Client!
    pause
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Push database schema
echo [5/6] Creating database tables...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database tables!
    echo Make sure PostgreSQL is running and database 'qdeeh_ai' exists.
    pause
    exit /b 1
)
echo [OK] Database tables created
echo.

REM Seed database
echo [6/6] Seeding database with test data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your QdeehAi platform is ready!
echo.
echo ADMIN LOGIN:
echo   URL: http://localhost:3000/auth/admin-signin
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo STUDENT LOGIN:
echo   URL: http://localhost:3000/auth/signin
echo   Email: student@example.com
echo   Password: student123
echo.
echo To start the server, run: npm run dev
echo ========================================
pause
