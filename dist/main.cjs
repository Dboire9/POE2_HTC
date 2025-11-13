"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron2 = require("electron");
var import_path = __toESM(require("path"), 1);
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"), 1);

// node_modules/electron-is-dev/index.js
var import_electron = __toESM(require("electron"), 1);
if (typeof import_electron.default === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
var { env } = process;
var isEnvSet = "ELECTRON_IS_DEV" in env;
var getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
var isDev = isEnvSet ? getFromEnv : !import_electron.default.app.isPackaged;
var electron_is_dev_default = isDev;

// electron/main.ts
var mainWindow = null;
var javaProcess = null;
import_electron2.app.disableHardwareAcceleration();
import_electron2.app.commandLine.appendSwitch("disable-gpu");
import_electron2.app.commandLine.appendSwitch("disable-accelerated-video-decode");
import_electron2.app.commandLine.appendSwitch("vmodule", "*/vaapi*=0,*/gpu*=0");
var createWindow = () => {
  const preloadPath = import_path.default.join(import_electron2.app.getAppPath(), "electron", "preload.js");
  mainWindow = new import_electron2.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  const startUrl = electron_is_dev_default ? "http://localhost:5173" : `file://${import_path.default.join(__dirname, "../dist/index.html")}`;
  mainWindow.loadURL(startUrl);
  if (electron_is_dev_default) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (javaProcess) {
      javaProcess.kill();
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      import_electron2.shell.openExternal(url);
    }
    return { action: "deny" };
  });
};
var startJavaBackend = () => {
  const javaCmd = "java";
  const jarPath = import_path.default.join(import_electron2.app.getAppPath(), "target", "poe-crafter-1.0-SNAPSHOT-jar-with-dependencies.jar");
  const javafxModules = import_path.default.join(process.env.HOME || process.env.USERPROFILE || "~", "javafx-modules");
  if (!import_fs.default.existsSync(jarPath)) {
    console.error("Java backend jar not found:", jarPath);
    console.error("Tip: run 'mvn clean package' at project root to build the fat JAR.");
    return false;
  }
  const args = [
    "--module-path",
    javafxModules,
    "--add-modules",
    "javafx.controls,javafx.fxml",
    "-jar",
    jarPath
  ];
  javaProcess = (0, import_child_process.spawn)(javaCmd, args, {
    stdio: "inherit"
  });
  javaProcess.on("error", (err) => {
    console.error("Failed to start Java process:", err);
  });
  return true;
};
async function waitForBackend(url = "http://localhost:8080/health", attempts = 40, delayMs = 250) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (_) {
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}
import_electron2.app.on("ready", async () => {
  const started = startJavaBackend();
  if (started) {
    const ok = await waitForBackend();
    if (!ok) console.warn("Backend health check timed out, opening UI anyway\u2026");
  }
  createWindow();
});
import_electron2.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron2.app.quit();
  }
});
import_electron2.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
import_electron2.ipcMain.handle("api:crafting", async (event, data) => {
  try {
    const response = await fetch("http://localhost:8080/api/crafting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
});
import_electron2.ipcMain.handle("api:items", async (event) => {
  try {
    const response = await fetch("http://localhost:8080/api/items");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
});
import_electron2.ipcMain.handle("api:modifiers", async (event, data) => {
  try {
    const { itemId } = data;
    const response = await fetch(`http://localhost:8080/api/modifiers?itemId=${itemId}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
});
