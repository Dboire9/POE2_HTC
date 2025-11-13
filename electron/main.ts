import { app, BrowserWindow, ipcMain, shell } from "electron"
import path from "path"
// Node ESM helper if needed; keep import to satisfy TS, but prefer app.getAppPath for paths
import { spawn } from "child_process"
import fs from "fs"
import isDev from "electron-is-dev"

let mainWindow: BrowserWindow | null = null
let javaProcess: any = null

// Disable GPU acceleration to avoid VAAPI warnings on some Linux setups
app.disableHardwareAcceleration()
app.commandLine.appendSwitch("disable-gpu")
app.commandLine.appendSwitch("disable-accelerated-video-decode")
app.commandLine.appendSwitch("vmodule", "*/vaapi*=0,*/gpu*=0")

// Paths resolved from app root; no __dirname needed

const createWindow = () => {
  // Resolve preload from app root to avoid ESM __dirname pitfalls in packaged or dev
  const preloadPath = path.join(app.getAppPath(), "electron", "preload.js")
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  const startUrl = isDev ? "http://localhost:5173" : `file://${path.join(__dirname, "../dist/index.html")}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
    if (javaProcess) {
      javaProcess.kill()
    }
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

const startJavaBackend = () => {
  // Utilise la commande globale 'java' et le fat JAR
  const javaCmd = "java"
  const jarPath = path.join(app.getAppPath(), "target", "poe-crafter-1.0-SNAPSHOT-jar-with-dependencies.jar")
  // Dossier temporaire pour les modules JavaFX
  const javafxModules = path.join(process.env.HOME || process.env.USERPROFILE || "~", "javafx-modules")
  if (!fs.existsSync(jarPath)) {
    console.error("Java backend jar not found:", jarPath)
    console.error("Tip: run 'mvn clean package' at project root to build the fat JAR.")
    return false
  }
  const args = [
    "--module-path", javafxModules,
    "--add-modules", "javafx.controls,javafx.fxml",
    "-jar", jarPath
  ]
  javaProcess = spawn(javaCmd, args, {
    stdio: "inherit",
  })
  javaProcess.on("error", (err) => {
    console.error("Failed to start Java process:", err)
  })
  return true
}

async function waitForBackend(url = "http://localhost:8080/health", attempts = 40, delayMs = 250) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch (_) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, delayMs))
  }
  return false
}

app.on("ready", async () => {
  const started = startJavaBackend()
  if (started) {
    const ok = await waitForBackend()
    if (!ok) console.warn("Backend health check timed out, opening UI anyway…")
  }
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle("api:crafting", async (event, data) => {
  try {
    const response = await fetch("http://localhost:8080/api/crafting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
})

ipcMain.handle("api:items", async (event) => {
  try {
    const response = await fetch("http://localhost:8080/api/items")
    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
})

ipcMain.handle("api:modifiers", async (event, data) => {
  try {
    const { itemId } = data
    const response = await fetch(`http://localhost:8080/api/modifiers?itemId=${itemId}`)
    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
})
