export {}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
      on: (channel: string, callback: (data: any) => void) => void
    }
  }
}
