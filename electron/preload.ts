import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (channel: string, data?: any) => {
    return ipcRenderer.invoke(channel, data)
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (event, data) => callback(data))
  },
})

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>
      on: (channel: string, callback: Function) => void
    }
  }
}
