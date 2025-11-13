export {}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>
      on: (channel: string, callback: (data: any) => void) => void
    }
  }
}
