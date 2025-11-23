# Auto-Update System

POE2 HTC includes an automatic update notification system for the desktop application. Users will be notified when new versions are available and can download and install updates with a single click.

## How It Works

### For Users

1. **Automatic Check**: When you launch the desktop app, it automatically checks for updates after 3 seconds
2. **Update Notification**: If a new version is available, a notification card appears in the bottom-right corner
3. **Download**: Click "Download Now" to download the update in the background
4. **Install**: Once downloaded, click "Restart & Install" to install the new version

### Update Notification

The update notification shows:
- Current version you're running
- New version available
- Download progress bar (MB transferred and percentage)
- Options to download, install, or skip the update

### Manual Check

You can manually check for updates by:
1. Opening the developer console (F12)
2. Running: `window.electronAPI.checkForUpdates()`

## For Developers

### Architecture

The auto-update system consists of three main components:

1. **Main Process** (`electron/main.ts`)
   - Uses `electron-updater` package
   - Checks for updates from GitHub Releases
   - Downloads updates in the background
   - Manages IPC communication with renderer

2. **Preload Script** (`electron/preload.js`)
   - Exposes secure `electronAPI` to the renderer process
   - Bridges main and renderer processes safely

3. **React Component** (`src/components/UpdateNotification.tsx`)
   - Displays update notifications to users
   - Shows download progress
   - Handles user interactions

### Configuration

Update settings are configured in `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Dboire9",
      "repo": "POE2_HTC"
    }
  }
}
```

### How Updates Are Published

1. **Create Release**: Use `./scripts/create-release.sh v1.x.x` to tag and push
2. **GitHub Actions**: Automatically builds executables for all platforms
3. **Publish**: electron-builder generates update metadata files automatically
4. **Distribution**: Users receive update notifications on next app launch

### Update Files

electron-builder generates these files for updates:
- **Windows**: `latest.yml` - Update metadata
- **macOS**: `latest-mac.yml` - Update metadata
- **Linux**: `latest-linux.yml` - Update metadata

These files are automatically uploaded to GitHub Releases.

### Testing Updates

To test the update system:

1. **Create Initial Release**:
   ```bash
   ./scripts/create-release.sh v1.0.0
   ```

2. **Wait for Build**: GitHub Actions builds all platforms (~10-15 minutes)

3. **Install v1.0.0**: Download and install from Releases

4. **Create New Release**:
   ```bash
   npm version patch  # Updates to 1.0.1
   ./scripts/create-release.sh v1.0.1
   ```

5. **Test Update**: Launch v1.0.0 app, it should detect v1.0.1 and show notification

### Development Mode

Updates are **disabled** in development mode to prevent conflicts with hot reload. They only work in production builds.

### IPC Events

The update system uses these IPC events:

**From Main to Renderer:**
- `update-available` - New version detected
- `update-download-progress` - Download progress
- `update-downloaded` - Update ready to install

**From Renderer to Main:**
- `check-for-updates` - Manual update check
- `download-update` - Start download
- `install-update` - Install and restart
- `get-app-version` - Get current version

### TypeScript Types

Type definitions are in `src/types/electron.d.ts`:

```typescript
interface ElectronAPI {
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => void;
  getAppVersion: () => Promise<string>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  isElectron: boolean;
}
```

### Security

- Updates are served over HTTPS from GitHub
- Code signing verification is disabled (see `package.json`)
- Updates only install from official GitHub repository
- Preload script uses `contextBridge` for secure IPC

### Troubleshooting

**Update not detected:**
- Check GitHub Releases for published version
- Verify version number is higher than current
- Check developer console for errors

**Download fails:**
- Check internet connection
- Verify GitHub Releases are public
- Check firewall/proxy settings

**Update won't install:**
- Ensure write permissions for app directory
- Check available disk space
- Try manual reinstall from Releases

## Version Numbers

Follow semantic versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

Update version in `package.json` before creating releases.
