@echo off
echo ========================================
echo   CLEAN START - Clear Everything
echo ========================================
echo.
echo This will:
echo   1. Clear Next.js cache
echo   2. Clear node modules cache
echo   3. Regenerate Prisma client
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/3] Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo [OK] Cache cleared
) else (
    echo [SKIP] No cache found
)

echo.
echo [2/3] Clearing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo [OK] Module cache cleared
) else (
    echo [SKIP] No module cache found
)

echo.
echo [3/3] Regenerating Prisma client...
call npm run db:generate
if errorlevel 1 (
    echo [ERROR] Prisma generate failed
    pause
    exit /b 1
) else (
    echo [OK] Prisma client generated
)

echo.
echo ========================================
echo   CLEAN START COMPLETE!
echo ========================================
echo.
echo Your project is now clean and ready.
echo.
echo To start development:
echo   npm run dev
echo.
pause
