#!/bin/bash

echo "================================"
echo "  POE2 How To Craft - Startup"
echo "================================"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java is not installed or not in PATH"
    echo "Please install Java 21 or higher from: https://adoptium.net/"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo "❌ Error: Java version must be 21 or higher (found: $JAVA_VERSION)"
    echo "Please install Java 21 or higher from: https://adoptium.net/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js 20 or higher from: https://nodejs.org/"
    exit 1
fi

echo "✅ Java $(java -version 2>&1 | awk -F '"' '/version/ {print $2}')"
echo "✅ Node.js $(node -v)"
echo ""

# Check if backend is already built
if [ ! -f "target/classes/core/ServerMain.class" ]; then
    echo "📦 Building backend (first time only)..."
    mvn clean package -q
    if [ $? -ne 0 ]; then
        echo "❌ Backend build failed"
        exit 1
    fi
    echo "✅ Backend built successfully"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies (first time only)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependencies installation failed"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
    echo ""
fi

echo "🚀 Starting backend server..."
mvn exec:java -Dexec.mainClass="core.ServerMain" &> backend.log &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/modifiers?itemId=test &> /dev/null; then
        echo "✅ Backend is ready!"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check backend.log for details."
        kill $BACKEND_PID 2> /dev/null
        exit 1
    fi
done

echo ""
echo "🚀 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ Application started!"
echo "================================"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Trap Ctrl+C and cleanup
trap "echo ''; echo '🛑 Stopping application...'; kill $BACKEND_PID $FRONTEND_PID 2> /dev/null; echo '✅ Application stopped'; exit 0" INT

# Keep script running
wait
