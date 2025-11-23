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

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

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
    // using the compiled classes or a packaged jar (no Maven available).
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
      // Production: try to run the packaged jar if present, otherwise run the classes
      // packaged into `target/classes` which we include via electron-builder extraResources.
      cmd = process.platform === 'win32' ? 'java.exe' : 'java';
      const resourceTargetDir = path.join(process.resourcesPath, 'target');
      const jarCandidates = [] as string[];
      try {
        // look for any jar files in resources/target
        const files = fs.readdirSync(resourceTargetDir);
        for (const f of files) {
          if (f.toLowerCase().endsWith('.jar')) jarCandidates.push(path.join(resourceTargetDir, f));
        }
      } catch (err) {
        // resourceTargetDir might not exist; we'll fall back to classes path
      }

      if (jarCandidates.length > 0) {
        // prefer the first jar found
        args = ['-jar', jarCandidates[0]];
        options.cwd = resourceTargetDir;
      } else {
        // fallback to running classes directly
        const classesPath = path.join(resourceTargetDir, 'classes');
        args = ['-cp', classesPath, 'core.ServerMain'];
        options.cwd = resourceTargetDir;
      }
    }

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
      setTimeout(() => {
        checkForUpdates();
      }, 3000); // Wait 3 seconds after app starts
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
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', () => {
  console.log('App is up to date');
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
  console.error('Update error:', error);
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
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      available: result !== null,
      currentVersion: app.getVersion(),
      updateInfo: result?.updateInfo
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
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
