# Development Guide - POE2 How To Craft

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Development Setup](#development-setup)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Full Stack Development](#full-stack-development)
6. [Building and Packaging](#building-and-packaging)
7. [Testing](#testing)
8. [Code Style and Conventions](#code-style-and-conventions)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## Project Architecture

### Technology Stack

**Frontend:**
- **React 19.0** - UI library
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 7.0** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Electron 33** - Desktop app framework

**Backend:**
- **Java 17** - Programming language
- **Maven 3.9** - Build automation
- **JSON** - Data format for modifier databases
- **Multithreading** - Parallel execution for performance

**DevOps:**
- **Vitest 4.0** - Testing framework
- **ESLint** - JavaScript linter
- **Git** - Version control
- **GitHub Actions** - CI/CD (planned)

### Project Structure

```
POE2_HTC/
├── src/                          # Frontend React source
│   ├── components/              # React components
│   │   ├── CraftingSimulator.tsx  # Main application component
│   │   ├── ItemSelector.tsx      # Item type selection
│   │   ├── ModifierSelector.tsx  # Modifier selection interface
│   │   ├── CurrencySelector.tsx  # Currency options
│   │   ├── Results.tsx          # Result display
│   │   └── ui/                  # Reusable UI components (shadcn)
│   ├── hooks/                   # Custom React hooks
│   │   └── useApi.ts           # API communication hook
│   ├── lib/                    # Utility functions
│   │   └── utils.ts           # Helper functions
│   ├── App.tsx                 # App root component
│   └── main.tsx               # React entry point
│
├── electron/                    # Electron desktop app
│   ├── main.ts                 # Main process (Node.js)
│   ├── preload.ts             # Security bridge
│   └── preload.js             # Preload script
│
├── src/main/java/              # Java backend source
│   └── core/
│       ├── ServerMain.java    # REST API server (port 8080)
│       ├── ItemManager.java   # Item data management
│       │
│       ├── Crafting/          # Core crafting logic
│       │   ├── Crafting_Action.java      # Currency actions
│       │   ├── Crafting_Algorithm.java   # Beam Search implementation
│       │   ├── Crafting_Candidate.java   # Path candidates
│       │   ├── Crafting_Item.java        # Item state representation
│       │   ├── CraftingExecutor.java     # Multithreaded execution
│       │   │
│       │   ├── Probabilities/           # Probability calculations
│       │   │   ├── ExaltAndRegalProbability.java
│       │   │   ├── EssenceProbability.java
│       │   │   └── ...
│       │   │
│       │   └── Utils/                   # Helper classes
│       │       ├── Heuristics.java
│       │       └── ...
│       │
│       ├── Currency/          # Currency implementations
│       │   ├── AnnulmentOrb.java
│       │   ├── AugmentationOrb.java
│       │   ├── ExaltedOrb.java
│       │   ├── Essence_currency.java
│       │   └── ...
│       │
│       ├── Items/             # Item base types
│       │   ├── Amulets/
│       │   ├── Body_Armours/
│       │   ├── Helmets/
│       │   ├── Wands/
│       │   └── ...
│       │
│       └── Item_modifiers/    # Modifier definitions (JSON data)
│           ├── Body_Armours_Item_modifiers/
│           ├── Helmets_Item_modifiers/
│           ├── Wands_Item_modifiers/
│           └── ...
│
├── target/                     # Maven build output
│   ├── classes/               # Compiled Java classes
│   └── POE2_HTC-1.0.0.jar    # Packaged JAR
│
├── dist/                       # Vite build output
│   └── electron/              # Electron packaged app
│
├── docs/                       # Documentation
│   ├── ALGORITHM.md           # Algorithm deep-dive
│   ├── USER_GUIDE.md          # Usage instructions
│   ├── DEVELOPMENT.md         # This file
│   ├── API_EXAMPLES.md        # API reference
│   └── CONTRIBUTING.md        # Contribution guidelines
│
├── package.json               # NPM dependencies and scripts
├── pom.xml                    # Maven configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.js        # TailwindCSS configuration
```

---

## Development Setup

### Prerequisites

**Required:**
- **Node.js 18+** (LTS recommended)
- **npm 9+** or **pnpm 8+**
- **Java JDK 17+** (OpenJDK or Oracle JDK)
- **Maven 3.9+**
- **Git**

**Optional:**
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Java Extension Pack
  - TypeScript Vue Plugin

### Installation

**1. Clone the Repository:**
```bash
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
```

**2. Install Dependencies:**
```bash
# Using npm
npm install --legacy-peer-deps

# Or using pnpm (recommended)
pnpm install
```

**Why `--legacy-peer-deps`?**
- React 19 has peer dependency conflicts with some libraries
- This flag allows installation despite warnings
- All libraries work correctly despite peer dependency mismatches

**3. Verify Java Setup:**
```bash
# Check Java version
java -version
# Should output: java version "17.x.x" or higher

# Check Maven version
mvn -version
# Should output: Apache Maven 3.9.x or higher
```

**4. Build Backend:**
```bash
# Compile Java code
mvn clean compile

# Package as JAR (optional)
mvn package
```

**5. Start Development:**
```bash
# Option A: Full stack with Electron
npm run electron:dev

# Option B: Frontend only
npm run dev
# Then start backend manually in another terminal:
mvn exec:java -Dexec.mainClass="core.ServerMain"
```

### Environment Configuration

**Create `.env` file** (optional):
```bash
# Backend
BACKEND_PORT=8080
JAVA_HOME=/path/to/jdk-17

# Frontend
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_DEBUG=true

# Electron
ELECTRON_ENABLE_LOGGING=true
```

---

## Backend Development

### Running the Backend

**Method 1: Using Maven (recommended):**
```bash
mvn exec:java -Dexec.mainClass="core.ServerMain"
```

**Method 2: Using compiled JAR:**
```bash
mvn package
java -jar target/POE2_HTC-1.0.0.jar
```

**Method 3: Using IDE:**
- Open `src/main/java/core/ServerMain.java`
- Right-click → Run 'ServerMain.main()'

### Backend Architecture

**REST API Server:**
- Runs on `http://localhost:8080`
- Uses `com.sun.net.httpserver.HttpServer`
- Handles CORS for frontend communication
- Single endpoint: `POST /api/crafting`

**Request Format:**
```json
{
  "itemName": "Gnarled Branch",
  "itemCategory": "Wands",
  "targetModifiers": [
    {
      "name": "+# to Cold Damage",
      "tier": "T1",
      "family": "WeaponColdDamagePrefix",
      "type": "prefix"
    },
    {
      "name": "#% increased Cast Speed",
      "tier": "T1",
      "family": "WeaponCastSpeedSuffix",
      "type": "suffix"
    }
  ]
}
```

**Response Format:**
```json
{
  "paths": [
    {
      "probability": 0.00002359,
      "steps": [
        {
          "currency": "Transmutation Orb",
          "modifier": "+15-20 Cold Damage (T1)",
          "stepProbability": 0.0125
        },
        {
          "currency": "Augmentation Orb",
          "modifier": "+30% Cast Speed (T1)",
          "stepProbability": 0.025
        }
      ]
    }
  ]
}
```

### Adding New Item Types

**Step 1: Create Item Class**
```java
// src/main/java/core/Items/NewItemType/NewItem.java
package core.Items.NewItemType;

import core.Items.Item;
import java.util.ArrayList;

public class NewItem extends Item {
    public NewItem(String name, String itemClass, String modifierDirectory, int itemLevel) {
        super(name, itemClass, modifierDirectory, itemLevel);
    }
}
```

**Step 2: Create Modifier JSON Files**
```bash
# Create directory
mkdir -p src/main/java/core/Item_modifiers/NewItemType_Item_modifiers

# Create modifier files
touch src/main/java/core/Item_modifiers/NewItemType_Item_modifiers/NewItemType_Prefix_modifiers.json
touch src/main/java/core/Item_modifiers/NewItemType_Item_modifiers/NewItemType_Suffix_modifiers.json
```

**Step 3: Populate Modifier Data**
```json
// NewItemType_Prefix_modifiers.json
[
  {
    "name": "+# to maximum Life",
    "family": "LifePrefix",
    "tiers": [
      {"tier": "T1", "weight": 100, "values": [80, 100]},
      {"tier": "T2", "weight": 150, "values": [70, 79]},
      {"tier": "T3", "weight": 200, "values": [60, 69]}
    ],
    "source": "normal"
  }
]
```

**Step 4: Register in ItemManager**
```java
// Add to ItemManager.java loadItems() method
items.add(new NewItem("Example Item", "NewItemType", "NewItemType_Item_modifiers", 86));
```

### Adding New Currencies

**Step 1: Create Currency Class**
```java
// src/main/java/core/Currency/NewCurrency.java
package core.Currency;

import core.Crafting.Crafting_Item;
import java.util.List;

public class NewCurrency extends CurrencyBase {
    
    @Override
    public List<Crafting_Item> apply(Crafting_Item item) {
        // Implement currency logic
        // Return list of possible outcomes
        
        List<Crafting_Item> results = new ArrayList<>();
        
        // Example: Add a random modifier
        Modifier randomMod = selectRandomModifier(item);
        Crafting_Item newItem = item.copy();
        newItem.addModifier(randomMod);
        newItem.addAction("NewCurrency", randomMod);
        
        results.add(newItem);
        return results;
    }
    
    @Override
    public double calculateProbability(Crafting_Item item, Modifier target) {
        // Calculate probability of getting target modifier
        int totalWeight = getTotalWeight(item);
        int targetWeight = target.getWeight();
        return (double) targetWeight / totalWeight;
    }
}
```

**Step 2: Register in CraftingExecutor**
```java
// Add to available currencies list
availableCurrencies.add(new NewCurrency());
```

### Debugging Backend

**Enable Debug Logging:**
```java
// In ServerMain.java
private static final boolean DEBUG = true;

if (DEBUG) {
    System.out.println("Request received: " + requestBody);
    System.out.println("Processing crafting simulation...");
}
```

**Common Issues:**

**Port Already in Use:**
```bash
# Find process using port 8080
lsof -i :8080  # Linux/Mac
netstat -ano | findstr :8080  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**Out of Memory:**
```bash
# Increase heap size
mvn exec:java -Dexec.mainClass="core.ServerMain" -Dexec.args="-Xmx4g"
```

**Modifier Loading Errors:**
- Check JSON syntax in modifier files
- Verify file paths match directory structure
- Ensure UTF-8 encoding

---

## Frontend Development

### Running the Frontend

**Development Mode:**
```bash
# Hot reload enabled
npm run dev

# Opens at http://localhost:5173
```

**Production Build:**
```bash
# Build for web
npm run build

# Preview production build
npm run preview
```

**Type Checking:**
```bash
# Check TypeScript types without building
npm run type-check
```

### Frontend Architecture

**Component Hierarchy:**
```
App.tsx (root)
  └─ CraftingSimulator.tsx (main container)
      ├─ ItemSelector.tsx (item type selection)
      ├─ ModifierSelector.tsx (modifier selection)
      │   ├─ Tabs (Prefixes/Suffixes)
      │   ├─ ModifierList
      │   └─ TierSelector
      ├─ CurrencySelector.tsx (optional currency filters)
      └─ Results.tsx (result display)
          ├─ PathCard (each path)
          └─ StepDisplay (each step)
```

**State Management:**
- React hooks (useState, useEffect)
- Custom hook: `useApi` for backend communication
- Local state for UI interactions
- No Redux/MobX needed (simple state requirements)

### Adding New Components

**Step 1: Create Component File**
```tsx
// src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

**Step 2: Add Styles (if not using TailwindCSS)**
```css
/* src/components/NewComponent.css */
.new-component {
  padding: 1rem;
  border: 1px solid #ccc;
}
```

**Step 3: Use in Parent Component**
```tsx
import { NewComponent } from './components/NewComponent';

function App() {
  return (
    <NewComponent 
      title="Example" 
      onAction={() => console.log('Clicked')} 
    />
  );
}
```

### Custom Hooks

**Example: useLocalStorage**
```tsx
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

**Usage:**
```tsx
const [settings, setSettings] = useLocalStorage('craftingSettings', {
  threshold: 0.0001,
  beamWidth: 100
});
```

---

## Full Stack Development

### Running Both Servers

**Terminal 1 (Backend):**
```bash
mvn exec:java -Dexec.mainClass="core.ServerMain"
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Or use Electron (starts both automatically):**
```bash
npm run electron:dev
```

### API Communication

**Frontend → Backend:**
```typescript
// src/hooks/useApi.ts
export const useApi = () => {
  const craftItem = async (request: CraftingRequest) => {
    const response = await fetch('http://localhost:8080/api/crafting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  return { craftItem };
};
```

**Usage in Component:**
```typescript
const { craftItem } = useApi();

const handleSimulate = async () => {
  try {
    const result = await craftItem({
      itemName: selectedItem,
      itemCategory: category,
      targetModifiers: selectedModifiers
    });
    
    setResults(result.paths);
  } catch (error) {
    console.error('Simulation failed:', error);
  }
};
```

### CORS Configuration

**Backend (ServerMain.java):**
```java
// Add CORS headers
exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

// Handle OPTIONS preflight
if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
    exchange.sendResponseHeaders(200, -1);
    return;
}
```

---

## Building and Packaging

### Building for Production

**Frontend:**
```bash
# Create optimized production build
npm run build

# Output: dist/ folder
# - index.html (entry point)
# - assets/ (JS/CSS bundles)
```

**Backend:**
```bash
# Create executable JAR
mvn clean package

# Output: target/POE2_HTC-1.0.0.jar
```

### Packaging Desktop App

**Build Electron App:**
```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build -- --win
npm run electron:build -- --mac
npm run electron:build -- --linux
```

**Output:**
- Windows: `dist/POE2HTC-Setup-1.0.0.exe`
- macOS: `dist/POE2HTC-1.0.0.dmg`
- Linux: `dist/POE2HTC-1.0.0.AppImage`

### Release Process

**1. Update Version:**
```json
// package.json
{
  "version": "1.1.0"
}
```

```xml
<!-- pom.xml -->
<version>1.1.0</version>
```

**2. Update CHANGELOG:**
```markdown
## [1.1.0] - 2025-01-15

### Added
- New item types: Quarterstaves, Foci
- Export crafting paths as images

### Fixed
- Modifier family conflicts not detected
- Probability calculation for essences
```

**3. Build and Test:**
```bash
# Run all tests
npm test
mvn test

# Build production bundles
npm run build
mvn package

# Test Electron app
npm run electron:dev
```

**4. Create GitHub Release:**
```bash
git tag v1.1.0
git push origin v1.1.0

# Upload built artifacts:
# - POE2HTC-Setup-1.1.0.exe
# - POE2HTC-1.1.0.dmg
# - POE2HTC-1.1.0.AppImage
```

---

## Testing

### Frontend Tests

**Run Tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- CraftingSimulator.test.tsx
```

**Writing Tests:**
```typescript
// src/components/__tests__/CraftingSimulator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CraftingSimulator } from '../CraftingSimulator';

describe('CraftingSimulator', () => {
  it('renders item selector', () => {
    render(<CraftingSimulator />);
    expect(screen.getByText('Select Item Category')).toBeInTheDocument();
  });

  it('simulates crafting when button clicked', async () => {
    render(<CraftingSimulator />);
    const button = screen.getByText('Start Simulation');
    
    await button.click();
    
    // Assert results are displayed
    expect(screen.getByText(/Crafting Paths/i)).toBeInTheDocument();
  });
});
```

### Backend Tests

**Run Tests:**
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=CraftingAlgorithmTest

# Run with debugging
mvn test -X
```

**Writing Tests:**
```java
// src/test/java/core/Crafting/CraftingAlgorithmTest.java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CraftingAlgorithmTest {
    
    @Test
    public void testBeamSearchFindsPath() {
        Crafting_Item item = new Crafting_Item("Test Wand");
        List<Modifier> targets = Arrays.asList(
            new Modifier("ColdDamage", "T1"),
            new Modifier("CastSpeed", "T1")
        );
        
        Crafting_Algorithm algo = new Crafting_Algorithm();
        List<Crafting_Candidate> paths = algo.findPaths(item, targets);
        
        assertFalse(paths.isEmpty(), "Should find at least one path");
        assertTrue(paths.get(0).getProbability() > 0, "Path should have positive probability");
    }
}
```

---

## Code Style and Conventions

### TypeScript/React

**Naming:**
- Components: PascalCase (`ItemSelector.tsx`)
- Hooks: camelCase with "use" prefix (`useApi.ts`)
- Utilities: camelCase (`formatProbability.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_MODIFIERS`)

**File Organization:**
```typescript
// 1. Imports
import React from 'react';
import { Button } from './ui/button';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  // Hooks first
  const [state, setState] = useState();
  
  // Functions
  const handleClick = () => {};
  
  // Render
  return <div>{title}</div>;
};
```

**React Best Practices:**
- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Avoid inline styles (use TailwindCSS)
- Extract reusable logic into custom hooks
- Keep components small and focused

### Java

**Naming:**
- Classes: PascalCase (`CraftingAlgorithm.java`)
- Methods: camelCase (`calculateProbability()`)
- Constants: UPPER_SNAKE_CASE (`MAX_BEAM_WIDTH`)
- Packages: lowercase (`core.crafting`)

**File Organization:**
```java
// 1. Package declaration
package core.Crafting;

// 2. Imports
import java.util.*;
import core.Items.Item;

// 3. Class documentation
/**
 * Implements beam search for crafting path optimization.
 */
public class Crafting_Algorithm {
    
    // 4. Constants
    private static final int MAX_DEPTH = 10;
    
    // 5. Fields
    private int beamWidth;
    private List<Modifier> targets;
    
    // 6. Constructor
    public Crafting_Algorithm(int beamWidth) {
        this.beamWidth = beamWidth;
    }
    
    // 7. Public methods
    public List<Crafting_Candidate> findPaths() {
        // Implementation
    }
    
    // 8. Private methods
    private double calculateHeuristic() {
        // Implementation
    }
}
```

**Java Best Practices:**
- Follow Oracle Java conventions
- Use meaningful variable names
- Comment complex algorithms
- Prefer composition over inheritance
- Handle exceptions appropriately

---

## Contributing Guidelines

### Before Contributing

1. **Check existing issues** - Avoid duplicates
2. **Discuss major changes** - Open an issue first
3. **Read CONTRIBUTING.md** - Detailed guidelines
4. **Follow code style** - Use provided linters

### Pull Request Process

**1. Fork and Clone:**
```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/POE2_HTC.git
cd POE2_HTC
git remote add upstream https://github.com/Dboire9/POE2_HTC.git
```

**2. Create Feature Branch:**
```bash
git checkout -b feature/my-new-feature
```

**3. Make Changes:**
- Write clean, documented code
- Add tests for new features
- Update documentation

**4. Test Thoroughly:**
```bash
# Run all tests
npm test
mvn test

# Build without errors
npm run build
mvn package
```

**5. Commit Changes:**
```bash
# Use semantic commit messages
git commit -m "feat: add new item type support"
git commit -m "fix: resolve modifier conflict detection"
git commit -m "docs: update API examples"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance tasks

**6. Push and Open PR:**
```bash
git push origin feature/my-new-feature
```

Then open a Pull Request on GitHub with:
- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Test results

### Code Review

Expect feedback on:
- Code quality and style
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations

---

## Troubleshooting

### Common Development Issues

**"npm install fails with peer dependency errors"**
```bash
# Use --legacy-peer-deps flag
npm install --legacy-peer-deps

# Or use pnpm (handles peers better)
pnpm install
```

**"Maven build fails with 'package does not exist'"**
```bash
# Clean and rebuild
mvn clean compile

# If still failing, check JAVA_HOME
echo $JAVA_HOME
# Should point to JDK 17+
```

**"Vite dev server not starting"**
```bash
# Check if port 5173 is in use
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows

# Use different port
npm run dev -- --port 3000
```

**"Backend returns 500 Internal Server Error"**
- Check server console for stack traces
- Verify JSON request format
- Check modifier data files exist
- Enable debug logging in ServerMain.java

**"Electron app won't open external links"**
- WSL users: Use `cmd.exe /c start` fallback (already implemented)
- Linux: Install `xdg-open`
- macOS: Should work by default with `shell.openExternal`

**"Tests fail with 'module not found'"**
```bash
# Clear Vitest cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install --legacy-peer-deps
```

**"TypeScript errors in IDE but build succeeds"**
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Verify tsconfig.json is correct
npm run type-check
```

---

## Performance Optimization

### Frontend

**Code Splitting:**
```typescript
// Lazy load heavy components
const Results = lazy(() => import('./components/Results'));

<Suspense fallback={<Loading />}>
  <Results paths={paths} />
</Suspense>
```

**Memoization:**
```typescript
// Memoize expensive calculations
const sortedModifiers = useMemo(() => {
  return modifiers.sort((a, b) => a.name.localeCompare(b.name));
}, [modifiers]);
```

**Debouncing:**
```typescript
// Debounce search input
const debouncedSearch = useDebouncedCallback(
  (value) => setSearchTerm(value),
  300
);
```

### Backend

**Multithreading:**
```java
// Already implemented in CraftingExecutor
ExecutorService executor = Executors.newFixedThreadPool(4);
List<Future<Result>> futures = executor.invokeAll(tasks);
```

**Caching:**
```java
// Cache probability calculations
private Map<String, Double> probabilityCache = new HashMap<>();

public double getProbability(String key) {
    return probabilityCache.computeIfAbsent(key, k -> calculateProbability(k));
}
```

**Beam Width Tuning:**
```java
// Balance speed vs accuracy
int beamWidth = isComplexCraft ? 100 : 50;
```

---

## Additional Resources

**Documentation:**
- [User Guide](USER_GUIDE.md) - Usage instructions
- [Algorithm Deep Dive](ALGORITHM.md) - How it works
- [API Examples](API_EXAMPLES.md) - API reference
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

**External Resources:**
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Maven Guide](https://maven.apache.org/guides/)
- [Electron Documentation](https://www.electronjs.org/docs)

**Community:**
- [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues) - Bug reports
- [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions) - Q&A
- [PoE Wiki](https://www.poewiki.net) - Game mechanics

---

## Maintainer Notes

### Release Checklist

- [ ] Update version in `package.json` and `pom.xml`
- [ ] Update CHANGELOG.md
- [ ] Run all tests (`npm test`, `mvn test`)
- [ ] Build production bundles (`npm run build`, `mvn package`)
- [ ] Test Electron app on all platforms
- [ ] Create Git tag (`git tag v1.x.x`)
- [ ] Push tag (`git push origin v1.x.x`)
- [ ] Create GitHub Release with artifacts
- [ ] Update documentation if needed

### Dependency Updates

**Check for updates:**
```bash
# Frontend
npm outdated

# Backend
mvn versions:display-dependency-updates
```

**Update dependencies:**
```bash
# Frontend (carefully, test after each)
npm update

# Backend
mvn versions:use-latest-releases
```

**Test after updates:**
- Run full test suite
- Manual smoke testing
- Check for breaking changes in changelogs
