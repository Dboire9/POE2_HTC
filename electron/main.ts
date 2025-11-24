import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

// Use NODE_ENV for detection - set by electron:dev script
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '8080', 10);
const FRONTEND_PORT = 5173;

// Setup log file
const LOG_FILE = path.join(app.getPath('userData'), 'poe2htc.log');
let logStream: fs.WriteStream | null = null;

// Ensure log directory exists
try {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  writeLog('='.repeat(80));
  writeLog(`POE2HTC Started at ${new Date().toISOString()}`);
  writeLog(`Version: ${app.getVersion()}`);
  writeLog(`Platform: ${process.platform} ${process.arch}`);
  writeLog(`Log file: ${LOG_FILE}`);
  writeLog('='.repeat(80));
} catch (error) {
  console.error('Failed to setup log file:', error);
}

function writeLog(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  if (logStream) {
    logStream.write(logMessage);
  }
}

function showErrorDialog(title: string, message: string) {
  writeLog(`ERROR DIALOG: ${title} - ${message}`);
  dialog.showErrorBox(title, message);
}

writeLog(`NODE_ENV: ${process.env.NODE_ENV}`);
writeLog(`app.isPackaged: ${app.isPackaged}`);
writeLog(`Running in mode: ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'}`);
writeLog(`App path: ${app.getAppPath()}`);
writeLog(`__dirname: ${__dirname}`);

// Helper to log to both main and renderer console and log file
function logToRenderer(level: string, ...args: any[]) {
  const message = args.join(' ');
  writeLog(`[${level}] ${message}`);
  if (mainWindow?.webContents) {
    mainWindow.webContents.executeJavaScript(
      `console.${level.toLowerCase()}('${message.replace(/'/g, "\\'")}')`
    ).catch(() => {});
  }
}

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = false;
autoUpdater.disableDifferentialDownload = true; // Disable differential updates to avoid checksum issues

// Enable detailed logging
autoUpdater.logger = {
  info: (msg) => logToRenderer('info', '[AutoUpdater INFO]', msg),
  warn: (msg) => logToRenderer('warn', '[AutoUpdater WARN]', msg),
  error: (msg) => logToRenderer('error', '[AutoUpdater ERROR]', msg),
  debug: (msg) => logToRenderer('log', '[AutoUpdater DEBUG]', msg)
};

logToRenderer('log', '[AutoUpdater] Current version:', app.getVersion());
logToRenderer('log', '[AutoUpdater] Feed URL will be:', `https://github.com/Dboire9/POE2_HTC/releases`);
logToRenderer('log', '[AutoUpdater] Platform:', process.platform);
logToRenderer('log', '[AutoUpdater] Arch:', process.arch);

function waitForServer(url: string, timeout = 30000): Promise<void> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          writeLog(`Server ready at ${url}`);
          resolve();
        } else {
          retry();
        }
      }).on('error', (err) => {
        writeLog(`Server check error for ${url}: ${err.message}`);
        retry();
      });
    };

    const retry = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) {
        const error = `Timeout waiting for ${url} (waited ${elapsed}ms)`;
        writeLog(`ERROR: ${error}`);
        reject(new Error(error));
      } else {
        setTimeout(checkServer, 500);
      }
    };

    checkServer();
  });
}

function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    writeLog('========== Starting Java backend ==========');
    // In development we run via Maven (requires mvn).
    // In production the packaged app should start the Java runtime directly
    // using the packaged JAR file.
    const isPackaged = app.isPackaged;
    let cmd: string;
    let args: string[];
    const options: any = { 
      stdio: 'inherit',
      windowsHide: true  // Hide console window on Windows
    };

    if (!isPackaged) {
      // Use mvn to start the backend during development
      const mvnCommand = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
      cmd = mvnCommand;
      args = ['exec:java', '-Dexec.mainClass=core.ServerMain', '-q'];
      options.cwd = app.getAppPath();
      writeLog(`Development mode: Using Maven`);
      writeLog(`Command: ${cmd}`);
      writeLog(`Args: ${args.join(' ')}`);
      writeLog(`Working directory: ${options.cwd}`);
    } else {
      // Production: run the packaged JAR file with bundled JRE
      const jrePath = path.join(process.resourcesPath, 'jre');
      const javaExecutable = process.platform === 'win32' 
        ? path.join(jrePath, 'bin', 'java.exe')
        : path.join(jrePath, 'bin', 'java');
      
      writeLog(`Production mode: Using packaged JAR with bundled JRE`);
      
      // Check if bundled JRE exists
      if (fs.existsSync(javaExecutable)) {
        cmd = javaExecutable;
        writeLog(`Using bundled JRE at: ${javaExecutable}`);
      } else {
        // Fallback to system Java
        cmd = 'java';
        writeLog(`Bundled JRE not found at: ${javaExecutable}`);
        writeLog(`Falling back to system Java`);
      }
      
      const jarPath = path.join(process.resourcesPath, 'backend.jar');
      
      writeLog(`Looking for backend JAR at: ${jarPath}`);
      writeLog(`process.resourcesPath: ${process.resourcesPath}`);
      writeLog(`JAR exists: ${fs.existsSync(jarPath)}`);
      
      // Check if JAR exists
      if (!fs.existsSync(jarPath)) {
        const error = `Backend JAR not found at: ${jarPath}`;
        writeLog(`ERROR: ${error}`);
        
        // List files in resourcesPath to help debug
        try {
          const files = fs.readdirSync(process.resourcesPath);
          writeLog(`Files in resourcesPath: ${files.join(', ')}`);
        } catch (e) {
          writeLog(`ERROR: Could not list resourcesPath: ${e}`);
        }
        
        showErrorDialog(
          'Backend JAR Missing',
          `Could not find backend.jar at:\n${jarPath}\n\nThe application cannot start without this file.\n\nLog file: ${LOG_FILE}`
        );
        reject(new Error('Backend JAR not found'));
        return;
      }
      
      // Check if Java is available (only if not using bundled JRE)
      if (cmd === 'java') {
        try {
          const javaCheck = spawn('java', ['-version'], { windowsHide: true });
          javaCheck.on('error', (err) => {
            writeLog(`ERROR: Java not found: ${err.message}`);
            showErrorDialog(
              'Java Not Found',
              `Java is not installed or not in PATH.\n\nPlease install Java 21 or later from:\nhttps://adoptium.net/\n\nLog file: ${LOG_FILE}`
            );
          });
        } catch (e) {
          writeLog(`ERROR: Could not check Java: ${e}`);
        }
      }
      
      args = ['-jar', jarPath];
      options.cwd = process.resourcesPath;
      writeLog(`Command: ${cmd}`);
      writeLog(`Args: ${args.join(' ')}`);
      writeLog(`Working directory: ${options.cwd}`);
    }

    writeLog(`Spawning backend process...`);
    try {
      backendProcess = spawn(cmd, args, options);
      writeLog(`Backend process spawned successfully (PID: ${backendProcess.pid})`);
    } catch (spawnError: any) {
      writeLog(`ERROR: Failed to spawn backend: ${spawnError.message}`);
      showErrorDialog(
        'Backend Start Failed',
        `Could not start backend process:\n${spawnError.message}\n\nLog file: ${LOG_FILE}`
      );
      reject(spawnError);
      return;
    }

    backendProcess.on('error', (error) => {
      writeLog(`ERROR: Backend process error: ${error.message}`);
      writeLog(`ERROR: Stack: ${error.stack}`);
      showErrorDialog(
        'Backend Process Error',
        `Backend process encountered an error:\n${error.message}\n\nLog file: ${LOG_FILE}`
      );
      reject(error);
    });

    // Wait a bit for backend to start. If the backend exits early we'll reject.
    const startTimeout = setTimeout(() => {
      writeLog('Backend start delay passed (3s), assuming success');
      resolve();
    }, 3000);

    backendProcess.on('exit', (code, signal) => {
      clearTimeout(startTimeout);
      const exitMsg = `Backend process exited with code ${code}, signal ${signal}`;
      writeLog(exitMsg);
      if (code !== 0) {
        showErrorDialog(
          'Backend Process Exited',
          `Backend stopped unexpectedly:\nExit code: ${code}\nSignal: ${signal}\n\nLog file: ${LOG_FILE}`
        );
        reject(new Error(`Backend exited with code ${code}`));
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'POE2HTC - Path of Exile 2 Item Crafting Pathfinder',
    backgroundColor: '#1a1a1a',
    show: false // Don't show until ready-to-show event
  });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the app
  if (isDev) {
    const devUrl = `http://localhost:${FRONTEND_PORT}`;
    writeLog(`Loading DEV URL: ${devUrl}`);
    mainWindow.loadURL(devUrl);
  } else {
    const prodPath = path.join(__dirname, '../dist/index.html');
    writeLog(`Loading PROD file: ${prodPath}`);
    writeLog(`__dirname: ${__dirname}`);
    writeLog(`File exists: ${fs.existsSync(prodPath)}`);
    mainWindow.loadFile(prodPath);
  }

  // Add error handling for loading failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    writeLog(`ERROR: Failed to load page: ${errorCode} - ${errorDescription}`);
    if (isDev) {
      writeLog('Development mode: Retrying in 1 second...');
      setTimeout(() => {
        mainWindow?.reload();
      }, 1000);
    } else {
      showErrorDialog(
        'Page Load Failed',
        `Failed to load application:\nError ${errorCode}: ${errorDescription}\n\nLog file: ${LOG_FILE}`
      );
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    const url = mainWindow?.webContents.getURL();
    writeLog(`Content finished loading. Current URL: ${url}`);
  });

  // Add keyboard shortcut to toggle DevTools (F12 or Ctrl+Shift+I)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') || url.startsWith('https')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  writeLog('========== App Ready ==========');
  try {
    // Start backend first
    writeLog('Step 1: Starting backend...');
    await startBackend();
    writeLog('Backend started successfully');
    
    // Wait for frontend in dev mode
    if (isDev) {
      writeLog('Step 2: Waiting for frontend dev server...');
      await waitForServer(`http://localhost:${FRONTEND_PORT}`);
      writeLog('Frontend dev server ready');
    } else {
      writeLog('Step 2: Skipped (production mode - no dev server)');
    }
    
    // Then create window
    writeLog('Step 3: Creating main window...');
    createWindow();
    writeLog('Main window created');

    // Check for updates (only in production)
    if (!isDev) {
      logToRenderer('log', '[AutoUpdater] Scheduling update check in 3 seconds...');
      setTimeout(() => {
        logToRenderer('log', '[AutoUpdater] Timeout triggered, starting update check...');
        checkForUpdates();
      }, 3000); // Wait 3 seconds after app starts
    } else {
      logToRenderer('log', '[AutoUpdater] Skipping update check (development mode)');
    }

    writeLog('========== Application startup complete ==========');

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        writeLog('Activate event: Creating new window');
        createWindow();
      }
    });
  } catch (error: any) {
    writeLog('========== FATAL ERROR ==========');
    writeLog(`Failed to start application: ${error.message}`);
    writeLog(`Stack trace: ${error.stack}`);
    showErrorDialog(
      'Application Start Failed',
      `POE2HTC could not start:\n${error.message}\n\nPlease check the log file for details:\n${LOG_FILE}`
    );
    app.quit();
  }
});

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  logToRenderer('log', '[AutoUpdater] ===== Checking for updates... =====');
  logToRenderer('log', '[AutoUpdater] Current version:', app.getVersion());
  logToRenderer('log', '[AutoUpdater] Update check started at:', new Date().toISOString());
});

autoUpdater.on('update-available', (info) => {
  logToRenderer('log', '[AutoUpdater] ===== UPDATE AVAILABLE! =====');
  logToRenderer('log', '[AutoUpdater] New version:', info.version);
  logToRenderer('log', '[AutoUpdater] Current version:', app.getVersion());
  logToRenderer('log', '[AutoUpdater] Release date:', info.releaseDate);
  logToRenderer('log', '[AutoUpdater] Release notes:', info.releaseNotes);
  logToRenderer('log', '[AutoUpdater] Files:', JSON.stringify(info.files));
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  logToRenderer('log', '[AutoUpdater] ===== App is up to date =====');
  logToRenderer('log', '[AutoUpdater] Current version:', app.getVersion());
  logToRenderer('log', '[AutoUpdater] Latest version:', info?.version || 'unknown');
  logToRenderer('log', '[AutoUpdater] Check completed at:', new Date().toISOString());
});

autoUpdater.on('download-progress', (progress) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version
    });
  }
});

autoUpdater.on('error', (error) => {
  logToRenderer('error', '[AutoUpdater] ===== ERROR =====');
  logToRenderer('error', '[AutoUpdater] Error message:', error.message);
  logToRenderer('error', '[AutoUpdater] Error stack:', error.stack);
  logToRenderer('error', '[AutoUpdater] Error details:', JSON.stringify(error));
});

// IPC handlers for updates
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { available: false, message: 'Updates disabled in development mode' };
  }
  return checkForUpdates();
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Failed to download update:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

async function checkForUpdates() {
  logToRenderer('log', '[AutoUpdater] ===== checkForUpdates() called =====');
  logToRenderer('log', '[AutoUpdater] isDev:', isDev);
  logToRenderer('log', '[AutoUpdater] app.isPackaged:', app.isPackaged);
  
  if (isDev) {
    logToRenderer('log', '[AutoUpdater] Skipping update check in development mode');
    return { available: false, message: 'Development mode' };
  }
  
  try {
    logToRenderer('log', '[AutoUpdater] Calling autoUpdater.checkForUpdates()...');
    const result = await autoUpdater.checkForUpdates();
    logToRenderer('log', '[AutoUpdater] Check result:', JSON.stringify(result));
    return {
      available: result !== null,
      currentVersion: app.getVersion(),
      updateInfo: result?.updateInfo
    };
  } catch (error) {
    logToRenderer('error', '[AutoUpdater] Error checking for updates:', error);
    logToRenderer('error', '[AutoUpdater] Error type:', typeof error);
    logToRenderer('error', '[AutoUpdater] Error details:', JSON.stringify(error, null, 2));
    return { available: false, error: String(error) };
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process when app quits
  if (backendProcess) {
    writeLog('Stopping backend...');
    backendProcess.kill();
  }
  
  writeLog('========== App Quit ==========');
  if (logStream) {
    logStream.end();
  }
});
