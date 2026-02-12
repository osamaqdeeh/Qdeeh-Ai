@echo off
echo ========================================
echo QdeehAi - Database Setup Script
echo ========================================
echo.
echo This script will create the database for you.
echo Password: qdeeh059ai
echo Port: 5432
echo.

REM Set PostgreSQL password
set PGPASSWORD=qdeeh059ai

echo Creating database 'qdeeh_ai'...
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE qdeeh_ai;"

if %errorlevel% equ 0 (
    echo [OK] Database 'qdeeh_ai' created successfully!
) else (
    echo Note: Database might already exist or there was an error.
    echo This is normal if you're running this script again.
)

echo.
echo Verifying database...
psql -U postgres -h localhost -p 5432 -c "\l" | findstr qdeeh_ai

echo.
echo ========================================
echo Database setup complete!
echo.
echo Database details:
echo   Name: qdeeh_ai
echo   User: postgres
echo   Password: qdeeh059ai
echo   Host: localhost
echo   Port: 5432
echo ========================================
echo.
echo Next step: Run setup.bat to complete the installation
pause
