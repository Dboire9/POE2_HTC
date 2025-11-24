# POE2 How To Craft

<div align="center">

![CI](https://github.com/Dboire9/POE2_HTC/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/Dboire9/POE2_HTC/actions/workflows/build-release.yml/badge.svg)
![Version](https://img.shields.io/github/v/release/Dboire9/POE2_HTC?label=version)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?logo=apachemaven&logoColor=white)

![Downloads](https://img.shields.io/github/downloads/Dboire9/POE2_HTC/total)
![Stars](https://img.shields.io/github/stars/Dboire9/POE2_HTC?style=social)
![Issues](https://img.shields.io/github/issues/Dboire9/POE2_HTC)
![Last Commit](https://img.shields.io/github/last-commit/Dboire9/POE2_HTC)
![Auto-Update](https://img.shields.io/badge/Auto--Update-Enabled-success?logo=electronbuilder)

</div>

A powerful desktop application that calculates optimal crafting paths for **Path of Exile 2** items. Find the most efficient way to craft your dream items using advanced algorithms and probability calculations.

<div style="display: flex; gap: 10px;">
  <img src="screenshots/Full_initial_screen.PNG" alt="PoE2 Pathfinder" width="400"/>
  <img src="screenshots/Bow_result.PNG" alt="PoE2 Pathfinder final result" width="400"/>
</div>

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
  - [For Users](#for-users)
  - [For Developers](#for-developers)
- [📖 How Does It Work?](#-how-does-it-work)
  - [Step-by-Step Guide](#step-by-step-guide)
  - [Understanding Results](#understanding-results)
  - [Beam Search Algorithm](#beam-search-algorithm)
  - [Probability Calculation](#probability-calculation)
- [💻 Development](#-development)
  - [Project Structure](#project-structure)
  - [Backend Development](#backend-development)
  - [Frontend Development](#frontend-development)
  - [Full Stack Development](#full-stack-development)
- [🤝 Contributing](#-contributing)
- [📝 API Documentation](#-api-documentation)
- [🐛 Known Issues](#-known-issues)
- [🗺️ Roadmap](#️-roadmap)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Contact](#-contact)

## ✨ Features

- 🎯 **Optimal Crafting Paths** - Find the best sequence of currencies to craft your desired item
- 📊 **Probability Calculations** - See exact success rates for each crafting step
- 💎 **Full Currency Support** - All crafting currencies, essences, and omens included
- ⚡ **Fast Computation** - Multithreaded beam search algorithm for quick results
- 🖥️ **Desktop App** - Run locally with Electron or in your browser

## 🚀 Quick Start

### Windows Users

**Download the installer:**

1. Go to [Releases](https://github.com/Dboire9/POE2_HTC/releases/latest)
2. Download `POE2HTC-Setup-X.X.X.exe`
3. Run the installer
4. Launch POE2 HTC from your Start Menu or Desktop

The app runs in your browser at `http://localhost:5173`

**Requirements:**
- Windows 10/11
- The installer includes everything you need!

### Linux/macOS Users

**Prerequisites**: Java 17+, Node.js 20+, Maven 3.8+

```bash
# Clone and setup
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install --legacy-peer-deps

# Run the Electron desktop app
npm run electron:dev
```

The app will automatically start:
- Backend server on `http://localhost:8080`
- Frontend dev server on `http://localhost:5173`
- Electron window with the app

---

## 📖 How Does It Work?

### Step-by-Step Guide

**1. Select Your Item Type**

- Choose the base item category (e.g., Wands, Helmets, Body Armours)
- If applicable, select the specific subcategory (e.g., ES/Armor Hybrid)
- The application will load all available modifiers for that item type

**2. Choose Your Desired Modifiers**

- Browse through available **Prefixes** (up to 3) and **Suffixes** (up to 3)
- Filter modifiers by source:
  - **Normal Crafting**: Standard modifiers obtainable through regular currencies
  - **Perfect Essences**: Special modifiers from perfect essences
  - **Desecrated Currency**: Unique modifiers from desecrated orbs
- Each modifier shows its **family** (e.g., "WeaponCasterDamagePrefix")
  - ⚠️ **Important**: You cannot select two modifiers with the same family on one item
  - The application will prevent you from selecting conflicting modifiers
- Select the **tier** for each modifier
- Click on modifiers to add them to your crafting target

**3. Start Crafting Simulation**

- Click "Start Simulation" to begin the calculation
- The algorithm will search for optimal crafting paths

**4. Review Results**

- View multiple crafting paths sorted by success probability
- Each path shows:
  - **Success Probability**: Chance of achieving your desired modifiers
  - **Step-by-Step Instructions**: Exact sequence of currencies to use

## 💻 Development

### Project Structure

```
POE2_HTC/
├── src/                          # Frontend source (React + TypeScript)
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities
├── src/main/java/               # Java backend
│   └── core/
│       ├── Crafting/           # Crafting algorithm and logic
│       ├── Currency/           # Currency implementations
│       ├── Items/              # Item base types
│       └── Item_modifiers/     # Modifier definitions
├── target/                      # Maven build output
└── dist/                        # Vite build output
```

### Backend Development

The backend uses a **Beam Search algorithm** to efficiently explore the crafting space and find optimal paths.

```bash
# Compile Java backend
mvn compile

# Run backend server standalone
mvn exec:java -Dexec.mainClass="core.ServerMain"

# Run tests
mvn test
```

The backend exposes a REST API on `http://localhost:8080`:
- `GET /api/modifiers?itemId={itemId}` - Get available modifiers for an item
- `POST /api/crafting` - Calculate optimal crafting paths

### Frontend Development

```bash
# Start Vite dev server (with hot reload)
npm run dev

# Build frontend for production
npm run build

# Type check
npm run type-check
```

### Full Stack Development

```bash
# Start backend (Terminal 1)
mvn exec:java -Dexec.mainClass="core.ServerMain"

# Start frontend dev server (Terminal 2)
npm run dev
```

### Beam Search Algorithm

The crafting algorithm uses a modified **Beam Search** to efficiently explore the massive space of possible crafting sequences:

1. **State Space**: Each state represents an item with its current modifiers  
2. **Actions**: Crafting currencies and omens that can be applied  
3. **Scoring**: Evaluates paths based on probability and progress toward desired modifiers  
4. **Pruning**: Discards low-probability paths to maintain performance  

This approach finds near-optimal solutions while maintaining reasonable computation time, even for complex crafting scenarios with 6+ desired modifiers.

> For a detailed explanation and pseudocode, see [ALGORITHM.md](ALGORITHM.md).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs** - Open an issue with reproduction steps
2. **Suggest Features** - Share your ideas for improvements
3. **Submit Pull Requests** - Fix bugs or add features
4. **Update Data** - Help keep modifier data current with game patches

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines and code style.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests as needed
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 API Documentation

See [API_EXAMPLES.md](docs/API_EXAMPLES.md) for detailed API usage and examples.

## 🔄 Auto-Update System

The desktop application includes automatic update notifications:
- Checks for updates automatically on launch
- Download updates in the background
- Install with a single click
- No need to manually download new versions

See [AUTO_UPDATE.md](docs/AUTO_UPDATE.md) for technical details.

## 🐛 Known Issues

- Some rare edge cases with essence combinations may not be fully optimized

See the [Issues](https://github.com/Dboire9/POE2_HTC/issues) page for a complete list.

## 🗺️ Roadmap

- [x] Desktop application with Electron
- [x] Auto-update system
- [x] Multi-platform support (Windows, Linux)
- [ ] Add crafting cost estimation
- [ ] Crafting simulator with step-by-step execution
- [ ] Integration with trade API for cost optimization

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Grinding Gear Games for creating Path of Exile 2
- The PoE community and POE2db for modifier data and crafting knowledge
- [@traylorre](https://github.com/traylorre) and [@fZpHr](https://github.com/fZpHr) for the help and advices.

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)

---

**Note**: This is a third-party tool and is not affiliated with or endorsed by Grinding Gear Games.
