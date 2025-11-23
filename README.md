# POE2 How To Craft

![CI](https://github.com/Dboire9/POE2_HTC/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue)
![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![React](https://img.shields.io/badge/React-19-blue?logo=react)

A powerful web application that calculates optimal crafting paths for **Path of Exile 2** items. Find the most efficient way to craft your dream items using advanced algorithms and probability calculations.

![Application Screenshot](screenshots/main-interface.png)

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
- 🎨 **Modern UI** - Clean, intuitive interface built with React and shadcn/ui
- 🖥️ **Desktop App** - Native desktop application with Electron (no browser needed)

## 🚀 Quick Start

### For Users

**📥 [Download from GitHub Releases](https://github.com/Dboire9/POE2_HTC/releases/latest)** | **📖 [Download Guide](docs/DOWNLOAD.md)**

**Desktop Application (Recommended)**

1. Go to [Releases](https://github.com/Dboire9/POE2_HTC/releases/latest)
2. Download for your operating system:
   - **🐧 Linux**: `POE2HTC-X.X.X.AppImage` - Just download and run
   - **🪟 Windows**: `POE2HTC-Setup-X.X.X.exe` - Run installer
   - **🍎 macOS**: `POE2HTC-X.X.X.dmg` - Drag to Applications
3. Launch the app!

**First Release Coming Soon:**
To create the first release, run: `./scripts/create-release.sh`

### For Developers

**Prerequisites**: Java 21+, Node.js 20+, Maven 3.8+

```bash
# Clone and setup
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install

# Option 1: Run as Electron desktop app (development mode)
npm run electron:dev

# Option 2: Run as web app
mvn clean package && npm run dev
```

**Build Desktop Application:**

```bash
# Build for all platforms
npm run electron:build

# Build for specific platform only
npm run electron:build:win    # Windows (.exe installer + portable)
npm run electron:build:mac    # macOS (.dmg + .zip)
npm run electron:build:linux  # Linux (.AppImage + .deb)

# Output will be in the 'release' directory
```

**Note:** To build for macOS or Windows from Linux, you may need additional dependencies. Building for the current platform always works out of the box.

Backend runs on `http://localhost:8080`, frontend on `http://localhost:5173`

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
  - **Perfect Essences**: Special high-tier modifiers from perfect essences
  - **Desecrated Currency**: Unique modifiers from desecrated orbs
- Each modifier shows its **family** (e.g., "WeaponCasterDamagePrefix")
  - ⚠️ **Important**: You cannot select two modifiers with the same family on one item
  - The application will prevent you from selecting conflicting modifiers
- Select the **tier** for each modifier (higher tiers = better stats)
- Click on modifiers to add them to your crafting target

**3. Configure Simulation Settings**

- Set the number of **iterations** (recommended: 100-1000)
  - More iterations = more thorough search but longer computation time
  - Default 100 is usually sufficient for most cases
- Choose which currencies and omens you want to use
- Adjust the beam width (advanced users only)

**4. Start Crafting Simulation**

- Click "Start Simulation" to begin the calculation
- The algorithm will search for optimal crafting paths
- Progress bar shows the current computation status

**5. Review Results**

- View multiple crafting paths sorted by success probability
- Each path shows:
  - **Success Probability**: Chance of achieving your desired modifiers
  - **Step-by-Step Instructions**: Exact sequence of currencies to use
  - **Currency Costs**: Total amount of each currency needed
  - **Expected Actions**: What each step should accomplish

### Understanding Results

**Crafting Paths**
Each path represents a different approach to crafting your item:
- **Higher probability paths** are more likely to succeed but may use more expensive currencies
- **Lower cost paths** use cheaper currencies but have lower success rates
- Compare paths to find the balance between cost and reliability

**Currency Usage**
The tool shows which currencies to use and in what order:
- **Chaos Orbs**: Reroll all modifiers
- **Exalted Orbs**: Add a new modifier
- **Augmentation Orbs**: Add modifier of specific type
- **Annulment Orbs**: Remove a random modifier
- **Regal Orbs**: Add modifier to magic item
- **Essences**: Guarantee specific modifier
- **Omens**: Modify currency behavior (e.g., filter by tags)

**Family Conflicts**
If you try to select two modifiers with the same family:
- ❌ A popup will immediately warn you about the conflict
- 🔍 The popup shows which modifier conflicts and the shared family name
- ✅ Deselect one modifier to choose another from the same family

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
3. **Beam Width**: Keeps top N most promising paths at each step
4. **Scoring**: Evaluates paths based on probability and progress toward desired modifiers
5. **Pruning**: Discards low-probability paths to maintain performance

This approach finds near-optimal solutions while maintaining reasonable computation time, even for complex crafting scenarios with 6+ desired modifiers.

### Probability Calculation

- **Modifier Weights**: Each modifier has tier-specific weights based on item level
- **Tag Matching**: Omens filter modifiers by matching tags
- **Family Exclusion**: Prevents duplicate modifier families
- **Tier Selection**: Calculates probability for desired tier or better

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

## 🐛 Known Issues

- Some rare edge cases with essence combinations may not be fully optimized
- Memory usage can be high for very complex crafting scenarios (6+ mods)
- UI may freeze briefly during intensive calculations

See the [Issues](https://github.com/Dboire9/POE2_HTC/issues) page for a complete list.

## 🗺️ Roadmap

- [ ] Add crafting cost estimation
- [ ] Support for influenced items
- [ ] Export/import crafting plans
- [ ] Crafting simulator with step-by-step execution
- [ ] Integration with trade API for cost optimization
- [ ] Mobile companion app

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Grinding Gear Games for creating Path of Exile 2
- The PoE community for modifier data and crafting knowledge
- All contributors and testers

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)

---

**Note**: This is a third-party tool and is not affiliated with or endorsed by Grinding Gear Games.
