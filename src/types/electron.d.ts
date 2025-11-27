export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface UpdateCheckResult {
  available: boolean;
  currentVersion?: string;
  updateInfo?: any;
  message?: string;
  error?: string;
}

export interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
}

export interface ElectronAPI {
  // Generic IPC invoke method (for backward compatibility)
  invoke: (channel: string, data?: any) => Promise<any>;
  
  // Open external URL in system browser
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  
  // Update-specific methods
  checkForUpdates: () => Promise<UpdateCheckResult>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => void;
  getAppVersion: () => Promise<string>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
