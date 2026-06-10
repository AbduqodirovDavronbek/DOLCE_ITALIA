@echo off
REM Backend startup script for Windows

echo Starting Dolce Italia Backend...
echo ================================

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please copy .env.example to .env and update the configuration
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python init_db.py

REM Start the server
echo Starting FastAPI server on http://localhost:8000
echo API Documentation available at http://localhost:8000/docs
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
