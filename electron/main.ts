import { app, BrowserWindow, shell, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

// Use NODE_ENV for detection - set by electron:dev script
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 8080;
const FRONTEND_PORT = 5173;

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('app.isPackaged:', app.isPackaged);
console.log('Running in mode:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('App path:', app.getAppPath());
console.log('__dirname:', __dirname);

// Helper to log to both main and renderer console
function logToRenderer(level: string, ...args: any[]) {
  const message = args.join(' ');
  console.log(`[${level}]`, ...args);
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
          console.log(`Server ready at ${url}`);
          resolve();
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for ${url}`));
      } else {
        setTimeout(checkServer, 500);
      }
    };

    checkServer();
  });
}

function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting Java backend...');
    // In development we run via Maven (requires mvn).
    // In production the packaged app should start the Java runtime directly
    // using the packaged JAR file.
    const isPackaged = app.isPackaged;
    let cmd: string;
    let args: string[];
    const options: any = { stdio: 'inherit' };

    if (!isPackaged) {
      // Use mvn to start the backend during development
      const mvnCommand = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
      cmd = mvnCommand;
      args = ['exec:java', '-Dexec.mainClass=core.ServerMain', '-q'];
      options.cwd = app.getAppPath();
    } else {
      // Production: run the packaged JAR file
      cmd = 'java';
      const jarPath = path.join(process.resourcesPath, 'backend.jar');
      
      console.log('Looking for backend JAR at:', jarPath);
      
      // Check if JAR exists
      if (!fs.existsSync(jarPath)) {
        console.error('Backend JAR not found at:', jarPath);
        reject(new Error('Backend JAR not found'));
        return;
      }
      
      args = ['-jar', jarPath];
      options.cwd = process.resourcesPath;
    }

    console.log('Running command:', cmd, args.join(' '));
    backendProcess = spawn(cmd, args, options);

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    // Wait a bit for backend to start. If the backend exits early we'll reject.
    const startTimeout = setTimeout(() => {
      console.log('Backend start delay passed');
      resolve();
    }, 3000);

    backendProcess.on('exit', (code, signal) => {
      clearTimeout(startTimeout);
      if (code !== 0) {
        console.error('Backend process exited with code', code, 'signal', signal);
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
    console.log('Loading DEV URL:', devUrl);
    mainWindow.loadURL(devUrl);
  } else {
    const prodPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading PROD file:', prodPath);
    mainWindow.loadFile(prodPath);
  }

  // Add error handling for loading failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (isDev) {
      setTimeout(() => {
        mainWindow?.reload();
      }, 1000);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content finished loading. Current URL:', mainWindow?.webContents.getURL());
  });

  // Log when page loads successfully
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
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
  try {
    // Start backend first
    await startBackend();
    
    // Wait for frontend in dev mode
    if (isDev) {
      console.log('Waiting for frontend dev server...');
      await waitForServer(`http://localhost:${FRONTEND_PORT}`);
    }
    
    // Then create window
    createWindow();

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

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
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
  console.log('Update downloaded:', info.version);
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
    console.log('Stopping backend...');
    backendProcess.kill();
  }
});
