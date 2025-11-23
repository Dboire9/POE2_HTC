# POE2 HTC Launcher Scripts

## Windows (`start.bat`)

Double-click `start.bat` to automatically:
1. Check if Node.js, npm, Java, and Maven are installed
2. Install npm dependencies (only on first run)
3. Launch the Electron app

### Prerequisites

Before running `start.bat`, install:

1. **Node.js 20+** (includes npm)
   - Download: https://nodejs.org/
   - Or via winget: `winget install OpenJS.NodeJS.LTS`

2. **Java 21+**
   - Download: https://adoptium.net/temurin/releases/
   - Or via winget: `winget install EclipseAdoptium.Temurin.21.JDK`

3. **Maven 3.8+**
   - Download: https://maven.apache.org/download.cgi
   - Or via winget: `winget install Maven.Maven`

### Usage

1. Install the prerequisites above
2. Double-click `start.bat`
3. Wait for the app to launch
4. The Electron window will open automatically

The script will:
- Verify all required tools are installed
- Run `npm install` if `node_modules` doesn't exist
- Start the backend server (Java) on `http://localhost:8080`
- Start the frontend server (Vite) on `http://localhost:5173`
- Open the Electron desktop window

### Troubleshooting

**"Node.js is not installed"**
- Install Node.js from the link above
- After installation, restart your terminal/command prompt

**"Java is not installed"**
- Install Java 21 or higher
- Make sure `java` is in your PATH

**"Maven is not installed"**
- Install Maven from the link above
- Make sure `mvn` is in your PATH
- Alternative: use `winget install Maven.Maven`

**Dependencies fail to install**
- Check your internet connection
- Try running manually: `npm install --legacy-peer-deps`

**App fails to start**
- Make sure ports 8080 and 5173 are not in use by other applications
- Check that Java and Maven are properly configured

## Linux/macOS

Use the terminal commands from the README:

```bash
npm run electron:dev
```

Or create a similar shell script if needed.
