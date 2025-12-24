# Release v0.9.7

## 🔥 Critical Fixes

- **Fixed connection leak causing server crashes** - Backend server would crash with "Address already in use" due to improper HttpExchange cleanup. Added `safeCloseExchange` helper to prevent CLOSE_WAIT state buildup.
- **Removed non-existent omens**: "Omen of Homogenising Exaltation" and "Omen of Homogenising Coronation" were not actually in the game.

## ✨ New Features

### Slow Request Monitoring System
- Automatic logging of requests taking longer than 2 seconds
- JSON request body capture for debugging and replay
- Metadata files with timestamp, duration, and endpoint information
- Deployment scripts for easy server updates
- See `docs/SLOW_REQUEST_MONITORING.md` for details

### Crafting Guide Page
- Strategic advice for new and profit-focused players
- Navigation system with anchor links for quick access
- Separate sections for different experience levels
- General crafting principles and economy considerations

## 🐛 Bug Fixes

- Fixed perfect essence behavior and probability calculations
- Fixed desecrated currency percentage calculation (x3 multiplier)
- Fixed frontend compatibility with backend responses using 'results' vs 'paths'
- Fixed essence naming: "Essence of Hysteria" → "Perfect Essence of Hysteria"
- Updated React dependency to 19.2.1

## 🔄 Changes

- Removed total cost display from crafting results UI for cleaner interface
- Updated scoring mechanism to use second-to-last candidate's modifier count for perfect essences
- Improved resource management with variables moved outside try blocks
- Enhanced test coverage with TestWands and TestBoots classes

## 🖥️ Backend Improvements

- SlowRequestMonitor utility class for performance tracking
- Proper Grafana monitoring integration after server restarts
- Improved systemd service management and recovery procedures
- Better connection handling and resource cleanup

## 📥 Installation

### Linux
- **AppImage**: Download `POE2HTC-0.9.7.AppImage`, make it executable, and run
- **Debian/Ubuntu**: Download `poe2-htc_0.9.7_amd64.deb` and install with `sudo dpkg -i`

### Auto-Update
If you're using v0.9.5 or later, the app will automatically notify you of this update.

---

**Full Changelog**: https://github.com/Dboire9/POE2_HTC/blob/main/CHANGELOG.md
