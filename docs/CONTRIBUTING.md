# Contributing to POE2 How To Craft

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/POE2_HTC.git
   cd POE2_HTC
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Setup

> The app is now **pure client-side TypeScript** — the Java/Maven backend has been retired. There is
> no server to build or run. See [DEVELOPMENT.md](DEVELOPMENT.md) for the full architecture.

### Prerequisites
- Node.js 20+
- npm 9+

### Installation
```bash
npm install --legacy-peer-deps
```

### Running Locally
```bash
# Web app with hot reload — http://localhost:5173
npm run dev

# ...or build the static site
npm run build
```

## 📝 Code Style

- **Strict TypeScript** — no `any` in `packages/engine` or `packages/optimizer`.
- Use functional React components with hooks; keep them focused on a single responsibility.
- Probabilities are `f64` in `[0,1]` internally; format `%` only at the UI edge. Prices in
  exalt-equivalents.
- **Data lives in JSON, never in source.** Fix wrong probabilities in `data/patches/<patch>/` (or
  `weights_overrides.json`, which wins over base weights) — not in engine logic. Data edits are
  surgical raw-text edits with a source comment.
- Use descriptive names; comment non-obvious probability math.

## 🧪 Testing

Everything runs under **Vitest**:

```bash
npm test                 # watch mode
npm run test:engine      # packages/engine
npm run test:optimizer   # packages/optimizer
npm run type-check       # strict type-check, no emit
```

When you add or change a currency rule, add a unit test on a tiny synthetic pool (3–5 fake mods) with
a **hand-computed** expected probability. Keep the differential fixture tests
(`packages/engine/src/__fixtures__/*-java.json`) green — a divergence means investigate, don't average.

## 📋 Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature-name
   git rebase main
   ```

2. **Make your changes** with clear, atomic commits:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what was changed and why
   - Screenshots/videos if UI changes
   - Reference any related issues

5. **Wait for review** - maintainers will review your PR and may request changes

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**: OS, Node version, and whether you're on the web app or the desktop build
- **Logs** if available (browser devtools console)

## 💡 Suggesting Features

Feature suggestions are welcome! Please:

- **Check existing issues** to avoid duplicates
- **Clearly describe** the feature and its benefits
- **Explain use cases** where this would be helpful
- Be open to discussion and feedback

## 🔧 Areas Where We Need Help

- **Data updates**: Keeping modifier data current with game patches
- **Testing**: Finding and reporting edge cases
- **Documentation**: Improving guides and API docs
- **UI/UX**: Design improvements and user experience enhancements
- **Performance**: Optimizing algorithm and rendering performance
- **Translations**: Multi-language support (future)

## 📚 Project Structure

```
POE2_HTC/
├── src/                      # React app (Vite)
│   ├── features/engine/     # The Engine Lab (the only view)
│   ├── lib/engine.ts        # Browser facade over the engine
│   └── components/          # shadcn/ui kit
├── packages/
│   ├── engine/              # Pure-TS crafting engine (probability math)
│   └── optimizer/           # Pareto cost/success optimizer + MC validation
├── data/patches/            # Versioned game data (JSON) — app ships 0.5.0
├── tools/refresh/           # `npm run update-data` (refresh from poe2db)
└── .github/                 # CI/CD workflows
```

## 📜 Code of Conduct

- Be respectful and constructive
- Focus on the issue, not the person
- Accept feedback gracefully
- Help others learn and grow

## ❓ Questions?

- Open an issue for general questions
- Use GitHub Discussions for broader topics
- Tag maintainers if you need specific guidance

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

Thank you for helping make POE2 How To Craft better!
