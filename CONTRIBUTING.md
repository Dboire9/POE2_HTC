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

### Prerequisites
- Java 21+
- Node.js 20+
- Maven 3.8+

### Installation
```bash
# Install frontend dependencies
npm install

# Build Java backend
mvn clean compile
```

### Running Locally
```bash
# Start backend (in one terminal)
mvn exec:java -Dexec.mainClass="core.ServerMain"

# Start frontend (in another terminal)
npm run dev
```

## 📝 Code Style

### Java
- Follow standard Java conventions
- Use descriptive variable names
- Add comments for complex logic
- Keep methods focused and small

### TypeScript/React
- Use functional components with hooks
- Prefer TypeScript types over `any`
- Use descriptive component and variable names
- Keep components focused on single responsibility

## 🧪 Testing

### Java Tests
```bash
mvn test
```

### Frontend Type Checking
```bash
npm run type-check
```

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
- **Environment details**: OS, Java version, Node version
- **Logs** if available (check console output)

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
├── src/                      # React frontend
│   ├── components/          # UI components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities
├── src/main/java/           # Java backend
│   └── core/
│       ├── Crafting/       # Core crafting algorithm
│       ├── Currency/       # Currency implementations
│       ├── Items/          # Item base types
│       └── Item_modifiers/ # Modifier definitions
├── electron/                # Electron main process
└── .github/                # CI/CD workflows
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
