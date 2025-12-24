import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { UpdateInfo, DownloadProgress } from '../types/electron';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
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

    // Check for updates on mount
    window.electronAPI.checkForUpdates();
  }, []);

  const handleDownload = () => {
    // Open GitHub releases page in browser
    window.open('https://github.com/Dboire9/POE2_HTC/releases/latest', '_blank');
    handleDismiss();
  };

  const handleDismiss = () => {
    setUpdateAvailable(null);
  };

  // Don't show anything if no update available
  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 Update Available
          </CardTitle>
          <CardDescription>
            A new version ({updateAvailable?.version}) is available. You're currently running version {currentVersion}.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            Download from GitHub
          </Button>
          <Button onClick={handleDismiss} variant="outline">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
