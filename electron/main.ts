import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';

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
    
    // Use mvn to start the backend
    const mvnCommand = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
    backendProcess = spawn(mvnCommand, [
      'exec:java',
      '-Dexec.mainClass=core.ServerMain',
      '-q'
    ], {
      cwd: app.getAppPath(),
      stdio: 'inherit'
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    // Wait a bit for backend to start
    setTimeout(() => {
      console.log('Backend started');
      resolve();
    }, 3000);
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
