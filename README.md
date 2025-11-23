# POE2 How To Craft

![CI](https://github.com/Dboire9/POE2_HTC/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue)
![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![React](https://img.shields.io/badge/React-19-blue?logo=react)

A powerful web application that calculates optimal crafting paths for **Path of Exile 2** items. Find the most efficient way to craft your dream items using advanced algorithms and probability calculations.

![Application Screenshot](screenshots/main-interface.png)

## ✨ Features

- 🎯 **Optimal Crafting Paths** - Find the best sequence of currencies to craft your desired item
- 📊 **Probability Calculations** - See exact success rates for each crafting step
- 💎 **Full Currency Support** - All crafting currencies, essences, and omens included
- ⚡ **Fast Computation** - Multithreaded beam search algorithm for quick results
- 🎨 **Modern UI** - Clean, intuitive interface built with React and shadcn/ui

## 🚀 Quick Start

### For Users

**Download and Run** (3 simple steps):

1. Download the latest release from [Releases](https://github.com/Dboire9/POE2_HTC/releases)
2. Extract the archive
3. Run `start.bat` (Windows) or `start.sh` (Linux/Mac)

That's it! The application will open in your browser at `http://localhost:3000`

### For Developers

**Prerequisites**: Java 21+, Node.js 20+, Maven 3.8+

```bash
# Clone and setup
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install

# Build and start (one command)
mvn clean package && npm run dev
```

Backend runs on `http://localhost:8080`, frontend on `http://localhost:3000`

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

## 🧮 How It Works

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

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and code style.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests as needed
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 API Documentation

See [API_EXAMPLES.md](API_EXAMPLES.md) for detailed API usage and examples.

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
