@echo off
SETLOCAL EnableDelayedExpansion

echo ============================================
echo POE2 HTC - Path of Exile 2 Crafting Helper
echo ============================================
echo.
echo Using WSL (Windows Subsystem for Linux) for best compatibility
echo.

REM Check if WSL is installed
wsl --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] WSL is not installed on your system.
    echo.
    echo WSL allows running Linux applications on Windows seamlessly.
    echo This will provide the best experience for running POE2 HTC.
    echo.
    set /p INSTALL_WSL="Would you like to install WSL now? (Y/N): "
    if /i "!INSTALL_WSL!"=="Y" (
        echo.
        echo Installing WSL...
        echo This requires administrator privileges and may take several minutes.
        echo Your computer may need to restart.
        echo.
        wsl --install -d Ubuntu
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo [ERROR] Failed to install WSL.
            echo Please run this command as administrator:
            echo    wsl --install
            echo.
            pause
            exit /b 1
        )
        echo.
        echo ============================================
        echo WSL Installation Complete!
        echo ============================================
        echo.
        echo IMPORTANT: 
        echo 1. Restart your computer if prompted
        echo 2. After restart, run start-wsl.bat again
        echo 3. Set up your Ubuntu username and password when prompted
        echo.
        pause
        exit /b 0
    ) else (
        echo.
        echo WSL installation cancelled.
        echo Please use start.bat for native Windows installation instead.
        echo.
        pause
        exit /b 1
    )
)

echo [OK] WSL is installed
echo.

REM Get the Windows path and convert to WSL path
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Convert Windows path to WSL path (e.g., C:\Users\... to /mnt/c/Users/...)
set "WSL_PATH=%SCRIPT_DIR:\=/%"
set "WSL_PATH=%WSL_PATH::=%"
set "DRIVE_LETTER=%SCRIPT_DIR:~0,1%"
call :LowerCase DRIVE_LETTER
set "WSL_PATH=/mnt/%DRIVE_LETTER%%WSL_PATH:~2%"

echo Project directory: %SCRIPT_DIR%
echo WSL path: %WSL_PATH%
echo.
echo Checking prerequisites in WSL...
echo.

REM Create a setup script in WSL
wsl bash -c "cd '%WSL_PATH%' && cat > /tmp/poe2htc-setup.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

echo '============================================'
echo 'Checking and installing prerequisites...'
echo '============================================'
echo

# Update package lists
sudo apt-get update -qq

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo '[INSTALL] Installing Node.js...'
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo '[OK] Node.js found:' \$(node --version)
fi

# Check and install Java
if ! command -v java &> /dev/null; then
    echo '[INSTALL] Installing Java 21...'
    sudo apt-get install -y openjdk-21-jdk
else
    echo '[OK] Java found:' \$(java -version 2>&1 | head -n 1)
fi

# Check and install Maven
if ! command -v mvn &> /dev/null; then
    echo '[INSTALL] Installing Maven...'
    sudo apt-get install -y maven
else
    echo '[OK] Maven found:' \$(mvn --version | head -n 1)
fi

echo
echo '============================================'
echo 'Installing npm dependencies...'
echo '============================================'
echo

# Install npm dependencies
npm install --legacy-peer-deps

echo
echo '============================================'
echo 'Starting POE2 HTC...'
echo '============================================'
echo
echo 'Backend will start on: http://localhost:8080'
echo 'Frontend will start on: http://localhost:5173'
echo
echo 'Open your browser and go to: http://localhost:5173'
echo
echo 'Press Ctrl+C to stop the application'
echo

# Run the application
npm run electron:dev

EOFSCRIPT
chmod +x /tmp/poe2htc-setup.sh
/tmp/poe2htc-setup.sh
"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to run in WSL
    echo.
    pause
    exit /b 1
)

ENDLOCAL
exit /b 0

:LowerCase
REM Convert to lowercase
set "%~1=!%~1:A=a!"
set "%~1=!%~1:B=b!"
set "%~1=!%~1:C=c!"
set "%~1=!%~1:D=d!"
set "%~1=!%~1:E=e!"
set "%~1=!%~1:F=f!"
set "%~1=!%~1:G=g!"
set "%~1=!%~1:H=h!"
set "%~1=!%~1:I=i!"
set "%~1=!%~1:J=j!"
set "%~1=!%~1:K=k!"
set "%~1=!%~1:L=l!"
set "%~1=!%~1:M=m!"
set "%~1=!%~1:N=n!"
set "%~1=!%~1:O=o!"
set "%~1=!%~1:P=p!"
set "%~1=!%~1:Q=q!"
set "%~1=!%~1:R=r!"
set "%~1=!%~1:S=s!"
set "%~1=!%~1:T=t!"
set "%~1=!%~1:U=u!"
set "%~1=!%~1:V=v!"
set "%~1=!%~1:W=w!"
set "%~1=!%~1:X=x!"
set "%~1=!%~1:Y=y!"
set "%~1=!%~1:Z=z!"
goto :eof
