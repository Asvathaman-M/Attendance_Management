#!/bin/bash

echo "🚀 Starting AttendEase Attendance Management System..."

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js found"
    
    # Check if http-server is installed
    if command -v http-server &> /dev/null; then
        echo "✅ http-server found"
        echo "🌐 Starting server on http://localhost:8080"
        http-server -p 8080 -o
    else
        echo "📦 Installing http-server..."
        npm install -g http-server
        echo "🌐 Starting server on http://localhost:8080"
        http-server -p 8080 -o
    fi
    
# Check if Python is installed
elif command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "🌐 Starting server on http://localhost:8080"
    python3 -m http.server 8080
    
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "🌐 Starting server on http://localhost:8080"
    python -m SimpleHTTPServer 8080
    
else
    echo "❌ Neither Node.js nor Python found"
    echo "Please install Node.js or Python to run the server"
    echo "Or simply open index.html in your browser"
fi
