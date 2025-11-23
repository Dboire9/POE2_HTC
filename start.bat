@echo off
SETLOCAL EnableDelayedExpansion

echo ============================================
echo POE2 HTC - Path of Exile 2 Crafting Helper
echo ============================================
echo.

REM Collect missing prerequisites
set MISSING_TOOLS=
set INSTALL_COMMANDS=

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    set MISSING_TOOLS=!MISSING_TOOLS! Node.js
    set INSTALL_COMMANDS=!INSTALL_COMMANDS! winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements ^&^& 
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js found: !NODE_VERSION!
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm found: v!NPM_VERSION!
)

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed
    set MISSING_TOOLS=!MISSING_TOOLS! Java
    set INSTALL_COMMANDS=!INSTALL_COMMANDS! winget install EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements ^&^& 
) else (
    for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do (
        set JAVA_VERSION=%%i
        set JAVA_VERSION=!JAVA_VERSION:"=!
    )
    echo [OK] Java found: !JAVA_VERSION!
)

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven is not installed
    set MISSING_TOOLS=!MISSING_TOOLS! Maven
    REM Try multiple Maven package names in winget
    set INSTALL_COMMANDS=!INSTALL_COMMANDS! (winget install -e --id Apache.Maven --accept-source-agreements --accept-package-agreements ^|^| echo Maven install failed, please install manually) ^&^& 
) else (
    for /f "tokens=3" %%i in ('mvn --version ^| findstr /i "Apache Maven"') do set MVN_VERSION=%%i
    echo [OK] Maven found: !MVN_VERSION!
)

REM If tools are missing, offer batch installation
if defined MISSING_TOOLS (
    echo.
    echo ============================================
    echo Missing prerequisites:!MISSING_TOOLS!
    echo ============================================
    echo.
    echo Would you like to install all missing tools automatically?
    echo ^(Requires winget and may require administrator privileges^)
    echo.
    set /p INSTALL_ALL="Install all missing tools now? (Y/N): "
    if /i "!INSTALL_ALL!"=="Y" (
        echo.
        echo Installing all missing tools...
        echo This may take a few minutes and require administrator privileges.
        echo.
        REM Remove trailing && from command
        set INSTALL_COMMANDS=!INSTALL_COMMANDS:~0,-4!
        echo Running: !INSTALL_COMMANDS!
        echo.
        call !INSTALL_COMMANDS! echo Done
        echo.
        
        REM Check if Maven was actually installed (winget might have failed silently)
        where mvn >nul 2>nul
        if %ERRORLEVEL% NEQ 0 (
            if "!MISSING_TOOLS!" NEQ "!MISSING_TOOLS:Maven=!" (
                echo.
                echo ============================================
                echo Maven installation via winget failed!
                echo ============================================
                echo.
                echo Maven is not available in your winget repository.
                echo.
                echo Option 1: Download and install manually ^(Recommended^)
                echo 1. Visit: https://maven.apache.org/download.cgi
                echo 2. Download apache-maven-3.9.9-bin.zip
                echo 3. Extract to C:\Program Files\Apache\maven
                echo 4. Add C:\Program Files\Apache\maven\bin to your PATH
                echo.
                echo Option 2: Use Chocolatey ^(if installed^)
                echo    choco install maven
                echo.
                echo After installation, close this window and run start.bat again.
                echo.
                pause
                exit /b 1
            )
        )
        
        echo ============================================
        echo Installation complete!
        echo ============================================
        echo.
        echo IMPORTANT: Please close this window and run the script again.
        echo ^(Tools need a fresh terminal to be recognized^)
        echo.
        pause
        exit /b 0
    ) else (
        echo.
        echo Please install the missing tools manually:
        if "!MISSING_TOOLS!" NEQ "!MISSING_TOOLS:Node.js=!" echo - Node.js: https://nodejs.org/
        if "!MISSING_TOOLS!" NEQ "!MISSING_TOOLS:Java=!" echo - Java: https://adoptium.net/temurin/releases/
        if "!MISSING_TOOLS!" NEQ "!MISSING_TOOLS:Maven=!" (
            echo - Maven: Download and extract from https://maven.apache.org/download.cgi
            echo   Then add Maven's bin directory to your PATH
        )
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo All prerequisites installed!
echo ============================================
echo.
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
