export {}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>
      on: (channel: string, callback: (data: any) => void) => void
    }
  }
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SENTRY_DSN?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
