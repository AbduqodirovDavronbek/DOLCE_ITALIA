#!/bin/bash
# Backend startup script

echo "Starting Dolce Italia Backend..."
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "✗ Error: .env file not found!"
    echo "Please copy .env.example to .env and update the configuration"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python init_db.py

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation available at http://localhost:8000/docs"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
