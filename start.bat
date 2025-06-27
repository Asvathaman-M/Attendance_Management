@echo off
echo 🚀 Starting AttendEase Attendance Management System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js found
    
    REM Check if http-server is installed
    http-server --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ http-server found
        echo 🌐 Starting server on http://localhost:8080
        http-server -p 8080 -o
    ) else (
        echo 📦 Installing http-server...
        npm install -g http-server
        echo 🌐 Starting server on http://localhost:8080
        http-server -p 8080 -o
    )
) else (
    REM Check if Python is installed
    python --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Python found
        echo 🌐 Starting server on http://localhost:8080
        python -m http.server 8080
    ) else (
        echo ❌ Neither Node.js nor Python found
        echo Please install Node.js or Python to run the server
        echo Or simply open index.html in your browser
        pause
    )
)
