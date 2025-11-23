@echo off
setlocal enabledelayedexpansion

echo ================================
echo   POE2 How To Craft - Startup
echo ================================
echo.

REM Check if Java is installed
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [91mError: Java is not installed or not in PATH[0m
    echo Please install Java 21 or higher from: https://adoptium.net/
    pause
    exit /b 1
)

REM Check Java version
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%g
)
set JAVA_VERSION=%JAVA_VERSION:"=%
for /f "delims=. tokens=1" %%v in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%v
if %JAVA_MAJOR% lss 21 (
    echo [91mError: Java version must be 21 or higher (found: %JAVA_VERSION%)[0m
    echo Please install Java 21 or higher from: https://adoptium.net/
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [91mError: Node.js is not installed or not in PATH[0m
    echo Please install Node.js 20 or higher from: https://nodejs.org/
    pause
    exit /b 1
)

echo [92mJava %JAVA_VERSION%[0m
for /f "tokens=*" %%i in ('node -v') do echo [92mNode.js %%i[0m
echo.

REM Check if backend is already built
if not exist "target\classes\core\ServerMain.class" (
    echo [96mBuilding backend (first time only)...[0m
    call mvn clean package -q
    if %errorlevel% neq 0 (
        echo [91mBackend build failed[0m
        pause
        exit /b 1
    )
    echo [92mBackend built successfully[0m
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [96mInstalling frontend dependencies (first time only)...[0m
    call npm install
    if %errorlevel% neq 0 (
        echo [91mFrontend dependencies installation failed[0m
        pause
        exit /b 1
    )
    echo [92mFrontend dependencies installed[0m
    echo.
)

echo [96mStarting backend server...[0m
start /B mvn exec:java -Dexec.mainClass="core.ServerMain" > backend.log 2>&1

REM Wait for backend to start
echo [93mWaiting for backend to be ready...[0m
set /a count=0
:wait_loop
timeout /t 1 /nobreak >nul
curl -s http://localhost:8080/api/modifiers?itemId=test >nul 2>&1
if %errorlevel% equ 0 (
    echo [92mBackend is ready![0m
    goto backend_ready
)
set /a count+=1
if %count% geq 30 (
    echo [91mBackend failed to start. Check backend.log for details.[0m
    pause
    exit /b 1
)
goto wait_loop

:backend_ready
echo.
echo [96mStarting frontend...[0m
start /B npm run dev

echo.
echo ================================
echo [92mApplication started![0m
echo ================================
echo.
echo [96mFrontend: http://localhost:5173[0m
echo [96mBackend:  http://localhost:8080[0m
echo.
echo Press Ctrl+C to stop the application
echo.

REM Keep window open
pause >nul
