# POE2 How To Craft

![License](https://img.shields.io/badge/license-GPLv3-blue)
![Java](https://img.shields.io/badge/Java-21+-green)
![Build](https://img.shields.io/badge/build-Maven-brightgreen)
![Electron](https://img.shields.io/badge/Electron-latest-blue)
![React](https://img.shields.io/badge/React-19-blue)

POE2 How To Craft is a modern desktop application that computes the most deterministic paths to craft desired items in **Path of Exile 2**.

Built with **Electron + React + shadcn/ui** frontend and **Java** backend for high-performance crafting calculations.

**Status:** Work in progress (~80% complete), functional but still lacks some features and polishing before releasing it in 1.0.  
This project will continue to be updated alongside new content from GGG, with updates expected each league/season, making it a long-term project.  
Contributions to this project are very welcome!

---

## 👥 Contributors

- **[Dboire](https://github.com/Dboire9)** - Backend & Algorithm (Java, Crafting Logic, Beam Search)
- **[fZpHr](https://github.com/fZpHr)** - Frontend & Integration (React, Electron, UI/UX)

---
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Development](#development)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [Bug Reporting](#bug-reporting)
- [License](#license)
- [Contact](#contact)

---

## Features

- Determine the optimal crafting paths for items  
- Compute modifier probabilities and best paths  
- Support all currencies and omens  
- Multithreaded computation for faster processing
- Modern, responsive UI with dark mode support
- Real-time simulation and probability calculation
- Cross-platform desktop application (Windows, macOS, Linux)

---

## Architecture

The application uses a modern architecture separating concerns:

```
┌─────────────────────────────────────────┐
│  Frontend: Electron + React + shadcn/ui │
│  - Item Selection                       │
│  - Currency Management                  │
│  - Results Visualization                │
└────────────┬────────────────────────────┘
             │ IPC / HTTP
┌────────────▼────────────────────────────┐
│  Backend: Java (POE2_HTC)               │
│  - Beam Search Algorithm                │
│  - Crafting Logic                       │
│  - Probability Calculation              │
└─────────────────────────────────────────┘
```

---

## Requirements

**Frontend:**
- Node.js 18+ (recommended: 20+)
- pnpm (recommended) or npm
- Git

**Backend:**
- Java 21+  
- Apache Maven 3.8+
- JavaFX modules (for GUI - optional)

---

## Getting Started

### 🚀 Quick Start (Recommended)

#### 1. Clone the repository
```bash
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
```

#### 2. Install frontend dependencies
Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

#### 3. Build the Java backend
Build the backend with all dependencies included:
```bash
mvn clean package
```

This creates `target/poe-crafter-1.0-SNAPSHOT-jar-with-dependencies.jar` which includes all required libraries.

#### 4. Run the application
Start both frontend and backend in development mode:
```bash
npm run dev
```

This command will:
- ✅ Build the Electron main process
- ✅ Start the Vite dev server on `http://localhost:5173`
- ✅ Launch the Java backend server on `http://localhost:8080`
- ✅ Open the Electron desktop application

The backend will automatically start when you run `npm run dev` - no need to start it separately!

---

### 📦 Alternative: Manual Backend Start

If you prefer to run the backend separately:

```bash
# Terminal 1 - Start Java backend
java -jar target/poe-crafter-1.0-SNAPSHOT-jar-with-dependencies.jar

# Terminal 2 - Start frontend
npm run dev
```

---

### 🏗️ Build for Production

To create a distributable application:

```bash
# Build frontend
npm run build

# The application will be packaged in the dist folder
```

---

## Development

Start the development environment with hot reload:

```bash
npm run dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron with the app
- Start Java backend on http://localhost:8080

### Build for Production
```bash
npm run build
```

Creates distributable executables in the `dist` folder.

---

## Troubleshooting

### ❌ Backend fails to start
- **Check Java version:** Run `java -version` (needs Java 21+)
- **Rebuild backend:** Run `mvn clean package` again
- **Check port 8080:** Make sure port 8080 is not already in use

### ❌ Frontend can't connect to backend
- **Wait for backend:** The backend takes a few seconds to start
- **Check logs:** Look for "Backend health check" in the console
- **Manual start:** Try starting the backend manually (see Alternative section above)

### ❌ Electron window doesn't open
- **Node version:** Run `node -v` (needs Node 18+)
- **Reinstall deps:** Delete `node_modules` and run `pnpm install` again
- **Check logs:** Look for errors in the terminal

### ❌ Build errors with Maven
- **Maven version:** Run `mvn -v` (needs Maven 3.8+)
- **Clean build:** Run `mvn clean` then `mvn package`
- **Dependencies:** Make sure all Maven dependencies download correctly

---

## How It Works

The software uses a **beam search algorithm**:

1. Score all possible modifier outcomes (desired modifiers = 1000 points, undesired modifiers with relevant tags = 250 points).
2. Keep top candidates at each step: Transmute → Augment → Regal → etc...  
3. Calculate probabilities for each path.  
4. Continue until 6-modifier items are found and sorted by probability.  

Special handling for Normal mods obtained by desecrations is implemented with approximations.  

---

## Project Structure

\`\`\`
├── electron/              # Electron main process
│   ├── main.ts           # Main process & IPC handlers
│   └── preload.ts        # Preload script for secure IPC
├── src/
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main application
│   └── main.tsx         # React entry point
├── java/                # Java POE2_HTC backend
│   ├── src/main/java/
│   └── pom.xml
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
\`\`\`

---

## Contributing

1. Fork the repository  
2. Clone your fork locally  
3. Make changes, add features, fix bugs  
4. Create a pull request  

If you're new, start with:
- Adding new React components
- Improving the UI/UX
- Fixing bugs in the backend algorithm
- Optimizing performance

Please follow coding standards and add JSDoc/JavaDoc where possible.

---

## Bug Reporting

If you find a bug or encounter unexpected behavior:

1. Go to the [Issues](https://github.com/Dboire9/POE2_HTC/issues) tab.
2. Click **New Issue** and describe the problem clearly.
3. Include steps to reproduce, screenshots, and system info.
4. We'll track and fix it as soon as possible!

---

## License

This project is licensed under **GPLv3**. See the LICENSE file for details.

---

## Contact

If you have questions or want to contribute:  
- Discord: .doboy9
