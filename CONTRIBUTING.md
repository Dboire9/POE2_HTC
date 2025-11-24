# Contributing to POE2 How To Craft

First off, thank you for considering contributing to POE2 HTC! It's people like you that make this tool better for the Path of Exile 2 community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/Dboire9/POE2_HTC/issues) to avoid duplicates.

When you create a bug report, please include:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce**
- **Provide specific examples** - Include screenshots if relevant
- **Describe the behavior you observed** vs. what you expected
- **Include details about your environment**:
  - OS and version
  - Application version
  - Java version (for backend issues)
  - Node.js version (for frontend issues)

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml) when creating issues.

### Suggesting Features

Feature suggestions are tracked as GitHub issues. When creating a feature suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this feature would be useful** to most users
- **Include mockups or examples** if applicable

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).

### Code Contributions

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues for newcomers
- `help wanted` - Issues where we need community help
- `bug` - Known bugs that need fixing

## Development Setup

### Prerequisites

- **Node.js 20+** and **npm**
- **Java 21+**
- **Maven 3.8+**
- **Git**

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork**:
```bash
git clone https://github.com/YOUR_USERNAME/POE2_HTC.git
cd POE2_HTC
```

3. **Add upstream remote**:
```bash
git remote add upstream https://github.com/Dboire9/POE2_HTC.git
```

4. **Install dependencies**:
```bash
npm install --legacy-peer-deps
```

5. **Start development server**:
```bash
npm run electron:dev
```

### Project Structure

```
POE2_HTC/
├── src/                        # Frontend React/TypeScript code
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React Context providers
│   ├── features/               # Feature-specific components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript type definitions
├── src/main/java/              # Backend Java code
│   └── core/
│       ├── Crafting/           # Crafting algorithm
│       ├── Currency/           # Currency definitions
│       ├── Items/              # Item definitions
│       └── Modifier_class/     # Modifier system
├── electron/                   # Electron main process
└── docs/                       # Documentation
```

## Pull Request Process

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make your changes**:
   - Follow the [coding standards](#coding-standards)
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation if needed

3. **Test your changes**:
```bash
# Frontend type checking
npm run type-check

# Backend compilation
mvn compile

# Full application test
npm run electron:dev
```

4. **Commit your changes**:
```bash
git add .
git commit -m "feat: add new feature description"
```

5. **Sync with upstream**:
```bash
git fetch upstream
git rebase upstream/main
```

6. **Push to your fork**:
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template with:
     - Clear description of changes
     - Related issue numbers (if any)
     - Screenshots (for UI changes)
     - Testing steps

8. **Address review feedback**:
   - Make requested changes
   - Push additional commits to your branch
   - Respond to comments

## Coding Standards

### TypeScript/React (Frontend)

- Use **TypeScript** for type safety
- Follow **functional components** with hooks
- Use **proper TypeScript types** (avoid `any`)
- Follow **React best practices**:
  - Extract reusable components
  - Use Context for global state
  - Memoize expensive operations
  - Handle loading and error states

**Example**:
```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
```

### Java (Backend)

- Follow **Java naming conventions**:
  - Classes: `PascalCase`
  - Methods/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- Use **meaningful variable names**
- Add **JavaDoc comments** for public methods
- Keep methods **focused and small**

**Example**:
```java
/**
 * Calculates the probability of rolling a specific modifier tier.
 *
 * @param modifier The modifier to calculate probability for
 * @param tier The desired tier level
 * @return Probability value between 0.0 and 1.0
 */
public double calculateTierProbability(Modifier modifier, int tier) {
    // Implementation
}
```

### Code Style

- **Indentation**: 2 spaces (TypeScript), 4 spaces (Java)
- **Line length**: Max 100 characters
- **Imports**: Organize and remove unused
- **Comments**: Explain "why", not "what"

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(modifiers): add support for perfect essence modifiers

- Added PERFECT_ESSENCE modifier source
- Updated boots modifiers with Hysteria and Horror essences
- Modified frontend to display perfect essence badge

Closes #42
```

```bash
fix(ui): correct tier dropdown values for multi-tier modifiers

Tiers were displaying in wrong order (worst to best instead of best to worst).
Reversed the display order to match PoE convention where Tier 1 is best.

Fixes #56
```

## Questions?

Feel free to:
- Open a [discussion](https://github.com/Dboire9/POE2_HTC/discussions)
- Ask in issue comments
- Contact the maintainers

Thank you for contributing! 🎮✨
