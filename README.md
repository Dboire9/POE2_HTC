# POE2 How To Craft

<div align="center">

![CI](https://github.com/Dboire9/POE2_HTC/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/Dboire9/POE2_HTC/actions/workflows/build-release.yml/badge.svg)
![Version](https://img.shields.io/github/v/release/Dboire9/POE2_HTC?label=version)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)

![Downloads](https://img.shields.io/github/downloads/Dboire9/POE2_HTC/total)
![Stars](https://img.shields.io/github/stars/Dboire9/POE2_HTC?style=social)
![Issues](https://img.shields.io/github/issues/Dboire9/POE2_HTC)
![Last Commit](https://img.shields.io/github/last-commit/Dboire9/POE2_HTC)

</div>

A powerful application that calculates optimal crafting paths for **Path of Exile 2** items. Find the most efficient way to craft your dream items using exact probability math and cost optimization — now running as a single pure-TypeScript engine, entirely in your browser or the desktop app (no server required).

## 🌐 Web Application

**Try it now at [poe2htc.com](https://poe2htc.com)** - No installation required!

<a href="https://buymeacoffee.com/dboire" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

*If you find this tool helpful, consider supporting its development!*

<div style="display: flex; gap: 10px;">
  <img src="screenshots/Full_initial_screen.PNG" alt="PoE2 Pathfinder" width="400"/>
  <img src="screenshots/Bow_result.PNG" alt="PoE2 Pathfinder final result" width="400"/>
</div>

## Join us on [Discord](https://discord.gg/RvxCWyFF3D).

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [👤 About Me & the Project](#-about-me--the-project)
- [📖 How Does It Work?](#-how-does-it-work)
- [💻 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📝 API Documentation](#-api-documentation)
- [🐛 Known Issues](#-known-issues)
- [🗺️ Roadmap](#️-roadmap)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Contact](#-contact)

## ✨ Features

- 🎯 **Optimal Crafting Paths** - Find the best sequence of currencies to craft your desired item
- 📊 **Exact Probability Math** - Analytic weight-pool calculations give precise success rates for each step
- 💰 **Cost ↔ Success Trade-off** - A Pareto frontier of plans, from cheapest to surest
- ⚡ **Instant, Offline** - The engine runs client-side; results are computed locally with no network round-trip
- 🌐 **Web App** - Access instantly at [poe2htc.com](https://poe2htc.com)

## 🚀 Quick Start

### Web Application (Recommended)

**Visit [poe2htc.com](https://poe2htc.com)** - Start crafting immediately with no installation!

### Desktop Application

#### Windows Users

**Download the installer:**

1. Go to [Releases](https://github.com/Dboire9/POE2_HTC/releases/latest)
2. Download `POE2HTC-Setup-X.X.X.exe`
3. Run the installer
4. Launch POE2 HTC from your Start Menu or Desktop

**⚠️ Important:** The application is currently **not signed** (I'm working on getting a code signing certificate). Windows will show a security warning when you run the installer. You'll need to click "More info" and then "Run anyway" to proceed with the installation. This is normal for unsigned applications and doesn't indicate any security risk. You can review the source code on GitHub if you have any concerns.

- The installer includes everything you need!

#### Linux/macOS Users

**Prerequisites**: Node.js 20+ (that's it — no Java, no backend)

```bash
# Clone and setup
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install --legacy-peer-deps

# Build the static site
npm run build
```

---

## 👤 About Me & the Project

Hi! I'm **Dorian**, a former student at **42 Paris**.

I built this project while actively searching for an internship, both to strengthen my skills and to add a meaningful, technical project to my portfolio. As someone passionate about both gaming and software development, combining Path of Exile 2's complex crafting system with algorithm optimization was the perfect challenge.

**Why this project?**
- 🎓 Demonstrates end-to-end product skills (React, TypeScript, Web Workers) — and a full engine rewrite from a Java backend to a pure-TS client-side engine
- 🧠 Showcases algorithm design (exact weight-pool probability, Pareto cost/success optimization, Monte-Carlo validation)
- 🎮 Solves a real problem for the PoE2 community
- 📈 Continuous learning through community feedback

**📘 For more about my journey, motivation, and project philosophy, see [About Me & the Project](docs/ABOUT.md).**

---

## 📖 How Does It Work?

This tool models Path of Exile 2 crafting to find the most efficient paths to your desired item:

1. **Select** your base item type and desired modifiers (prefixes/suffixes) and tiers
2. **Compute** — the engine solves each candidate plan with exact weight-pool probability math (no simulation, no sampling noise)
3. **Review** a Pareto frontier of plans, from cheapest to highest-probability, with step-by-step instructions and per-step odds
4. **Craft** in-game following the chosen currency sequence

The engine accounts for item rarity transitions, modifier weights, currency behaviors, omens, family conflicts, item-level gates, and slot limitations to produce accurate probability and expected-cost figures. Monte-Carlo simulation is used only to validate the analytic math.

**📘 For detailed usage instructions with screenshots and examples, see the [User Guide](docs/USER_GUIDE.md).** 

---

## 💻 Development

**Quick Start:**
```bash
# Clone and install dependencies
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install --legacy-peer-deps

# Run the web app (Vite dev server)
npm run dev

# ...or build the static site
npm run build
```

**Architecture (pure client-side — no server):**
- **App**: React 19 + TypeScript + Vite (web only); the UI is the Engine Lab (`src/features/engine/`), driven by the browser facade `src/lib/engine.ts`
- **Engine**: `packages/engine` — a pure-TS crafting engine (no I/O, no DOM) doing exact weight-pool probability math per currency
- **Optimizer**: `packages/optimizer` — computes the cost ↔ success Pareto frontier, with Monte-Carlo self-checks
- **Data**: `data/patches/<patch>/*.json` — versioned mod/base/price data (the app ships `0.5.0`)

**📘 For detailed setup instructions, project structure, and contribution guidelines, see the [Development Guide](docs/DEVELOPMENT.md).**

### How the engine finds paths

The optimizer evaluates candidate crafting sequences and returns a **Pareto frontier** — the set of plans where no other plan is both cheaper *and* likelier. Each plan's probability is computed **analytically** from the modifier weight pools (exact rational math over the affix pools at each step), not by sampling. A Monte-Carlo simulator cross-checks the analytic numbers to within tolerance.

**Key properties:**
- Exact, sampling-noise-free probability for each step and the plan as a whole
- Expected-cost estimates in exalt-equivalents, so plans can be ranked by cost as well as odds
- Full PoE2 semantics: rarity transitions, omens, family exclusion, item-level gates, currency tier floors
- Runs locally in milliseconds — no backend, no network

> 📖 **[Read the full algorithm explanation →](docs/ALGORITHM.md)**

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs** - Open an issue with reproduction steps  
2. **Suggest Features** - Share your ideas for improvements  
3. **Submit Pull Requests** - Fix bugs or add features  
4. **Update Data** - Help keep modifier data current with game patches

**📘 For detailed contribution guidelines, development setup, and code style, see the [Contributing Guide](docs/CONTRIBUTING.md).**

---

## 📝 API Documentation

See [API_EXAMPLES.md](docs/API_EXAMPLES.md) for detailed API usage and examples.

## 🐛 Known Issues

- Some rare edge cases with essence combinations may not be fully optimized

See the [Issues](https://github.com/Dboire9/POE2_HTC/issues) page for a complete list.

## 🗺️ Roadmap

### Completed
- [x] Pure-TypeScript engine (retired the Java/Maven backend — the app is now fully client-side)
- [x] Cost ↔ success Pareto optimizer with Monte-Carlo validation
- [x] "I already have this item" flow (per-currency odds + from-item planner)
- [x] Heavy solves moved off the main thread into a Web Worker
- [x] Auto-update system
- [x] Multi-platform support (Windows, Linux)

### Short-Term (Next Release)
- [ ] Omen of Greater Exaltation support
- [ ] Belt item type support
- [ ] Add crafting cost estimation
- [ ] Crafting simulator with step-by-step execution

### Long-Term
- [ ] Integration with trade API for cost optimization

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Grinding Gear Games for creating Path of Exile 2
- The PoE community and POE2db for modifier data and crafting knowledge
- [@fZpHr](https://github.com/fZpHr) for the help and advices.
- [farmer](https://www.twitch.tv/xthefarmerx) for giving me this idea through his streams and his discord (Modikin, Bad Architect).

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)

---

**Note**: This is a third-party tool and is not affiliated with or endorsed by Grinding Gear Games.
