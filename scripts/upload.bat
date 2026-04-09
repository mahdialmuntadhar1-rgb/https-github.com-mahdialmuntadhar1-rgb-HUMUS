@echo off
echo ============================================
echo UPLOAD CSV TO SUPABASE
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install required packages if not present
echo Checking required packages...
pip show supabase >nul 2>&1
if errorlevel 1 (
    echo Installing supabase package...
    pip install supabase
)

echo.
echo Starting upload...
echo.

REM Run the upload script
python "%~dp0upload_csv_to_supabase.py"

echo.
pause
