import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { UpdateInfo, DownloadProgress } from '../types/electron';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    // Check if running in Electron
    if (!window.electronAPI) return;

    // Get current version
    window.electronAPI.getAppVersion().then((version: string) => {
      setCurrentVersion(version);
    });

    // Listen for update available
    window.electronAPI.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateAvailable(info);
    });

    // Listen for download progress
    window.electronAPI.onUpdateDownloadProgress((progress: DownloadProgress) => {
      setDownloadProgress(progress);
    });

    // Listen for update downloaded
    window.electronAPI.onUpdateDownloaded(() => {
      setIsDownloading(false);
      setUpdateReady(true);
    });

    // Check for updates on mount
    window.electronAPI.checkForUpdates();
  }, []);

  const handleDownload = async () => {
    if (!window.electronAPI) return;

    setIsDownloading(true);
    await window.electronAPI.downloadUpdate();
  };

  const handleInstall = () => {
    if (!window.electronAPI) return;

    window.electronAPI.installUpdate();
  };

  const handleDismiss = () => {
    setUpdateAvailable(null);
    setUpdateReady(false);
  };

  // Don't show anything if no update available or ready
  if (!updateAvailable && !updateReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {updateReady ? '🎉 Update Ready!' : '🔔 Update Available'}
          </CardTitle>
          <CardDescription>
            {updateReady ? (
              <>
                Version {updateAvailable?.version} has been downloaded and is ready to install.
              </>
            ) : (
              <>
                A new version ({updateAvailable?.version}) is available. You're currently running version {currentVersion}.
              </>
            )}
          </CardDescription>
        </CardHeader>

        {isDownloading && downloadProgress && (
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Downloading update... {Math.round(downloadProgress.percent)}%
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB / {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex gap-2">
          {updateReady ? (
            <>
              <Button onClick={handleInstall} className="flex-1">
                Restart & Install
              </Button>
              <Button onClick={handleDismiss} variant="outline">
                Later
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="flex-1"
              >
                {isDownloading ? 'Downloading...' : 'Download Now'}
              </Button>
              <Button onClick={handleDismiss} variant="outline">
                Skip
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
