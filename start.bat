@echo off
SETLOCAL EnableDelayedExpansion

echo ============================================
echo POE2 HTC - Path of Exile 2 Crafting Helper
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version ^(20.x or higher^)
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    echo.
    echo npm usually comes with Node.js. Please reinstall Node.js.
    pause
    exit /b 1
)

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found: v%NPM_VERSION%

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed!
    echo.
    echo Please install Java 21 or higher from:
    echo https://adoptium.net/temurin/releases/
    echo.
    pause
    exit /b 1
)

REM Check Java version
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%i
    set JAVA_VERSION=!JAVA_VERSION:"=!
)
echo [OK] Java found: !JAVA_VERSION!

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven is not installed!
    echo.
    echo Please install Maven from: https://maven.apache.org/download.cgi
    echo Or use: winget install Maven.Maven
    echo.
    pause
    exit /b 1
)

REM Check Maven version
for /f "tokens=3" %%i in ('mvn --version ^| findstr /i "Apache Maven"') do set MVN_VERSION=%%i
echo [OK] Maven found: %MVN_VERSION%
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [SETUP] Installing npm dependencies...
    echo This may take a few minutes on first run...
    echo.
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ============================================
echo Starting POE2 HTC...
echo ============================================
echo.
echo Backend will start on: http://localhost:8080
echo Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C to stop the application
echo.

REM Launch the electron app in dev mode
call npm run electron:dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Application failed to start!
    pause
    exit /b 1
)

ENDLOCAL
