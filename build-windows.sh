#!/bin/bash

# Build Windows .exe for POE2_HTC from Linux
# This script builds the Electron app and Java backend into a Windows executable

set -e  # Exit on error

echo "=========================================="
echo "Building POE2 HTC for Windows (from Linux)"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed (need Java 21+)"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed"
    echo "Install with: sudo apt install maven"
    exit 1
fi

# Check for Wine (needed for Windows builds on Linux)
if ! command -v wine &> /dev/null; then
    echo "❌ Wine is not installed (needed to build Windows apps from Linux)"
    echo ""
    echo "Installing Wine..."
    sudo dpkg --add-architecture i386
    sudo apt update
    sudo apt install -y wine wine32 wine64
    echo "✅ Wine installed"
    echo ""
fi

echo "✅ All prerequisites found"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

# Build Java backend
echo "Building Java backend..."
mvn clean package -DskipTests
echo ""

# Build Electron app for Windows
echo "Building Electron app for Windows..."
echo "This will create a Windows installer even from Linux"
npm run electron:build:win

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo "=========================================="
echo ""
echo "Your Windows executable is in:"
echo "  ./release/"
echo ""
echo "Files created:"
ls -lh release/*.exe release/*.zip 2>/dev/null || echo "  (check release/ directory)"
echo ""
echo "Transfer these files to Windows and double-click to install!"
echo ""
