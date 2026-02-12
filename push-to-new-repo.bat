@echo off
echo ========================================
echo   PUSH TO NEW GITHUB REPOSITORY
echo ========================================
echo.
echo First, create a NEW repository on GitHub:
echo 1. Go to: https://github.com/new
echo 2. Login as: osamaqdeeh (email: osamaqdeeh2010@gmail.com)
echo 3. Repository name: Qdeeh-AI (or any name)
echo 4. DO NOT add README, .gitignore, or license
echo 5. Click "Create repository"
echo.
echo ========================================
echo.
set /p REPO_URL="Paste your new repository URL here (e.g., https://github.com/osamaqdeeh/Qdeeh-AI.git): "
echo.
echo Adding remote repository...
git remote add origin %REPO_URL%
echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main
echo.
echo ========================================
if %errorlevel% equ 0 (
    echo SUCCESS! Your code is on GitHub!
    echo.
    echo NEXT STEP: Deploy to Vercel
    echo 1. Go to: https://vercel.com
    echo 2. Sign in with GitHub (use osamaqdeeh2010@gmail.com)
    echo 3. Click "Add New Project"
    echo 4. Select your repository
    echo 5. Click "Deploy"
    echo.
    echo Your website will be live in 2-3 minutes!
) else (
    echo FAILED! Please check the error above.
    echo.
    echo Common issues:
    echo - Wrong repository URL
    echo - Repository already has content
    echo - Authentication needed (browser will open)
)
echo ========================================
pause
