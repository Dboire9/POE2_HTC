<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                          SYNC IMPACT REPORT                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

VERSION CHANGE: Initial → 1.0.0
RATIFICATION DATE: 2025-11-21
LAST AMENDED: 2025-11-21

MODIFIED PRINCIPLES:
  ✓ All 8 principles newly established (Initial constitution)

ADDED SECTIONS:
  + Core Principles (8 principles)
    1. Type-Safe TypeScript (NON-NEGOTIABLE)
    2. Context-Based State Management
    3. Feature-Based Organization
    4. Performance Optimization (NON-NEGOTIABLE)
    5. Electron-Desktop Integration
    6. Modern UI with Tailwind & shadcn/ui
    7. Real-Time User Feedback
    8. Separation of Concerns
  + Technical Architecture
  + Development Standards
  + Governance

REMOVED SECTIONS:
  - None (Initial constitution)

TEMPLATE ALIGNMENT STATUS:
  ✅ plan-template.md - Reviewed, aligned with constitution
  ✅ spec-template.md - Reviewed, aligned with constitution
  ✅ tasks-template.md - Reviewed, aligned with constitution
  ✅ README.md - Reviewed, no updates needed (already describes architecture)

AGENT-SPECIFIC REFERENCES CHECK:
  ✅ No "CLAUDE" or agent-specific references found in templates

PLACEHOLDER TOKENS:
  ✅ All placeholders filled with concrete values
  ✅ No remaining [BRACKET_TOKENS] except in template examples

FOLLOW-UP TODOS:
  - None. Constitution is complete and validated.

NEXT STEPS:
  1. Use /speckit.specify to create feature specifications
  2. Use /speckit.plan to generate implementation plans
  3. Use /speckit.tasks to break down into actionable tasks
  4. Use /speckit.implement to execute implementations

VALIDATION CHECKLIST:
  ✅ No unexplained bracket tokens
  ✅ Version line matches report
  ✅ Dates in ISO format (YYYY-MM-DD)
  ✅ Principles are declarative and testable
  ✅ All sections complete with concrete content
  ✅ Templates reviewed for consistency
  ✅ Agent instructions followed precisely
-->

# POE2 How To Craft (POE2_HTC) Frontend Constitution

## Core Principles

### I. Type-Safe TypeScript (NON-NEGOTIABLE)

**All code MUST be written in strict TypeScript with complete type coverage.**

- No `any` types except where explicitly unavoidable and documented
- All component props MUST have explicit interfaces
- All API responses MUST have typed interfaces in `src/types/`
- All function parameters and return values MUST be typed
- Enable strict mode in `tsconfig.json` with `noImplicitAny`, `strictNullChecks`
- Type guards MUST be used for runtime validation where needed

**Rationale**: Type safety catches errors at compile time, provides excellent IDE support, serves as living documentation, and prevents runtime bugs that could affect crafting calculations.

### II. Context-Based State Management

**Global state MUST use React Context API; props drilling is FORBIDDEN.**

- Each domain (Items, Crafting, UI) MUST have its own context
- Contexts MUST export custom hooks (`useItems()`, `useCrafting()`)
- Components MUST access state via hooks, never direct context consumption
- Context providers MUST be composed in a clear hierarchy in `App.tsx`
- Local component state is acceptable for UI-only concerns (toggles, form inputs)
- State updates MUST use `useCallback` to prevent unnecessary re-renders

**Rationale**: Eliminates props drilling, reduces coupling, makes state flow explicit, enables easy testing via mock contexts, and scales better than Redux for this application size.

### III. Feature-Based Organization

**Code MUST be organized by feature, not by technical role.**

Structure:
```
src/
├── features/           # Feature modules
│   ├── items/         # Item selection feature
│   ├── modifiers/     # Modifier selection feature
│   ├── crafting/      # Crafting operations
│   └── results/       # Results display
├── contexts/          # Global state contexts
├── components/        # Shared UI components
│   └── ui/           # shadcn/ui components
├── lib/              # Utility functions
├── types/            # TypeScript definitions
└── constants/        # Configuration constants
```

**Rationale**: Feature-based organization scales better, makes code location predictable, enables parallel development, and naturally enforces separation of concerns.

### IV. Performance Optimization (NON-NEGOTIABLE)

**All components MUST be performance-optimized to prevent unnecessary re-renders.**

- All feature components MUST be wrapped with `React.memo()`
- Event handlers MUST use `useCallback()` with correct dependencies
- Expensive calculations MUST use `useMemo()` with correct dependencies
- Lists MUST use proper `key` props (stable, unique identifiers)
- Heavy components SHOULD use lazy loading: `React.lazy()`
- Avoid inline object/array creation in render methods

**Rationale**: Crafting simulations can be CPU-intensive; unnecessary re-renders degrade user experience. Performance must be built-in from the start, not added later.

### V. Electron-Desktop Integration

**The application MUST function as an Electron desktop app with IPC communication.**

- Frontend MUST communicate with Java backend via `window.electronAPI`
- All API calls MUST go through the `window.electronAPI.invoke()` interface
- Backend runs on `localhost:8080` (HTTP server)
- Electron main process handles IPC bridging between renderer and Java
- Graceful degradation: check for `window.electronAPI` existence
- Handle backend startup delays and connection errors gracefully

**Rationale**: Desktop app provides better performance, native OS integration, and offline capability. IPC ensures secure, type-safe communication between processes.

### VI. Modern UI with Tailwind & shadcn/ui

**UI MUST use Tailwind CSS and shadcn/ui component library exclusively.**

- Use Tailwind utility classes for all styling
- NO custom CSS files except `index.css` for global styles and CSS variables
- Use shadcn/ui components from `src/components/ui/`
- Customize via CSS variables in `index.css` (HSL color system)
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Follow shadcn/ui patterns for component variants (CVA)
- Maintain dark theme with Path of Exile aesthetic

**Rationale**: Tailwind provides consistency and rapid development. shadcn/ui gives high-quality, accessible components. This combination ensures maintainability and visual consistency.

### VII. Real-Time User Feedback

**All asynchronous operations MUST provide immediate, clear user feedback.**

- Loading states: Show skeletons or spinners, never blank screens
- Success states: Provide clear confirmation (visual indicators, animations)
- Error states: Display user-friendly messages with recovery actions
- Progress indicators for long-running operations (crafting simulations)
- Disable interactive elements during processing to prevent double-submission
- Use ErrorBoundary components to catch and display React errors gracefully

**Rationale**: Crafting simulations can take several seconds. Users must always know the application state. Good feedback builds trust and prevents user frustration.

### VIII. Separation of Concerns

**Business logic, UI logic, and presentation MUST be strictly separated.**

- **Contexts**: Manage state and business logic only
- **Hooks**: Extract reusable logic patterns
- **Components**: Focus on presentation and user interaction
- **Lib utilities**: Pure functions for formatting, validation, calculations
- **Types**: Centralized type definitions, never inline
- No API calls directly in components (use contexts)
- No business logic in JSX (extract to functions/hooks)

**Rationale**: Separation enables testing, reusability, and maintainability. Each module has a single responsibility, making the codebase easier to understand and modify.

## Technical Architecture

### Backend Communication Protocol

- **Primary**: IPC via `window.electronAPI.invoke(channel, data)`
- **Channels**: 
  - `api:items` - Fetch available items
  - `api:modifiers` - Fetch modifiers for an item
  - `api:crafting` - Submit crafting request
- **Data Format**: JSON for all requests and responses
- **Error Handling**: Errors thrown from IPC must be caught and displayed to user
- **Timeout**: 30-second timeout for crafting operations

### Technology Stack

- **Framework**: React 19 with TypeScript 5.6+
- **Build Tool**: Vite 7+ (fast HMR, optimized builds)
- **Desktop**: Electron 32+
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui components
- **State**: React Context API (no Redux/Zustand)
- **Routing**: Not required (single-page application)
- **Testing**: Reserved for future implementation

### File Naming Conventions

- Components: PascalCase (e.g., `ItemSelector.tsx`)
- Utilities: camelCase (e.g., `formatting.ts`)
- Contexts: PascalCase with Context suffix (e.g., `ItemsContext.tsx`)
- Types: `index.ts` in `types/` folder
- Constants: camelCase files with UPPER_CASE exports

## Development Standards

### Code Quality

- **No console.logs in production**: Use proper logging or remove
- **Meaningful variable names**: Descriptive, not abbreviated
- **Function length**: Max 50 lines; extract if longer
- **Component size**: Max 200 lines; split into sub-components if longer
- **Comments**: Only for complex logic; code should be self-documenting
- **ESLint**: All warnings must be resolved before commit
- **Prettier**: Code must be formatted consistently

### Git Workflow

- **Branch naming**: `feature/description` or `fix/description`
- **Commits**: Descriptive messages following conventional commits
- **Pull requests**: Required for all changes to main branch
- **Code review**: All PRs must be reviewed before merge

### Testing Strategy (Future)

- Unit tests for utilities (`lib/` functions)
- Integration tests for context providers
- E2E tests for critical user flows (item selection → crafting → results)
- Test coverage target: 80%+ for utilities and contexts

### Performance Benchmarks

- Time to Interactive (TTI): < 2 seconds
- First Contentful Paint (FCP): < 1 second
- Bundle size: < 500KB (gzipped)
- Re-render time: < 16ms (60fps)

## Governance

**This constitution supersedes all other development practices and guidelines.**

### Amendment Process

1. Propose change with rationale in pull request
2. Discuss impact on existing code and future development
3. Update version according to semantic versioning
4. Update all dependent templates and documentation
5. Merge only after team approval

### Compliance Requirements

- All pull requests MUST be reviewed against these principles
- Violations MUST be justified in PR description or rejected
- New features MUST consider all principles during design
- Refactoring to align with principles is encouraged and prioritized

### Version History

- **1.0.0** (2025-11-21): Initial constitution establishing frontend architecture principles

**Version**: 1.0.0 | **Ratified**: 2025-11-21 | **Last Amended**: 2025-11-21
