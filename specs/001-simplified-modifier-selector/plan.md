# Implementation Plan: Simplified Modifier Selector

**Branch**: `001-simplified-modifier-selector` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-simplified-modifier-selector/spec.md`

## Summary

This feature removes the currency selection interface from the POE2 How To Craft frontend and simplifies the workflow to: Item Selection → Modifier Selection → Simulate → Results. Users select an item type, choose desired prefixes (1-3) and suffixes (1-3), then launch the crafting simulation to see optimal paths ranked by probability. The frontend will proactively disable incompatible modifiers and prevent selection beyond limits with clear visual feedback. Architecture follows the constitution's principles: strict TypeScript, Context API state management, feature-based organization, React.memo() performance optimization, Electron IPC communication, Tailwind + shadcn/ui styling, and clear separation of concerns.

## Technical Context

**Language/Version**: TypeScript 5.6+ with React 19  
**Primary Dependencies**: Electron 32+, Vite 7+, Tailwind CSS 3.4+, shadcn/ui, React Context API  
**Storage**: None (state managed in-memory via Context API)  
**Testing**: Reserved for future implementation (per constitution)  
**Target Platform**: Electron desktop application (Windows, macOS, Linux)  
**Project Type**: Single-page Electron application with React frontend  
**Performance Goals**: < 100ms UI response, < 2s TTI, < 16ms re-renders (60fps)  
**Constraints**: Must use Electron IPC for backend communication, no props drilling, all components memoized  
**Scale/Scope**: Single-user desktop app, ~10 feature components, 3 contexts, supports 100+ consecutive simulations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - Type-Safe TypeScript (NON-NEGOTIABLE)**: ✅ PASS
- All types will be defined in `src/types/`
- Interfaces for Item, Modifier, CraftingPath, SimulationRequest, ModifierExclusion
- No `any` types except for unavoidable window.electronAPI (documented)
- Strict mode enabled in tsconfig.json

**Principle II - Context-Based State Management**: ✅ PASS
- ItemsContext: manages item selection and available items
- ModifiersContext: manages modifier selection, incompatibility checking, selection limits
- SimulationContext: manages simulation state (loading, results, errors)
- Custom hooks: useItems(), useModifiers(), useSimulation()
- No props drilling between feature components

**Principle III - Feature-Based Organization**: ✅ PASS
- src/features/items/ - Item selection components
- src/features/modifiers/ - Modifier selection and validation
- src/features/simulation/ - Simulation trigger and results display
- Clear separation, no cross-feature dependencies

**Principle IV - Performance Optimization (NON-NEGOTIABLE)**: ✅ PASS
- All feature components wrapped in React.memo()
- useCallback for all event handlers
- useMemo for modifier filtering and incompatibility calculations
- Stable keys for modifier lists (modifier.id)

**Principle V - Electron-Desktop Integration**: ✅ PASS
- All API calls via window.electronAPI.invoke()
- Channels: api:items, api:modifiers, api:crafting
- Graceful degradation with existence check
- 30-second timeout enforcement

**Principle VI - Modern UI with Tailwind & shadcn/ui**: ✅ PASS
- Tailwind utility classes exclusively
- shadcn/ui components: Button, Card, Badge, Select, Tooltip, Toast
- No custom CSS except index.css variables
- Dark theme with POE aesthetic maintained

**Principle VII - Real-Time User Feedback**: ✅ PASS
- Loading states during simulation (Spinner component)
- Toast notifications for selection limits and errors
- Disabled states for buttons and incompatible modifiers
- Tooltips explaining why modifiers are disabled

**Principle VIII - Separation of Concerns**: ✅ PASS
- Contexts handle state and API calls only
- Components focus on presentation
- lib/modifierValidation.ts for incompatibility logic
- lib/resultsSorting.ts for probability sorting
- No business logic in JSX

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── items/
│   │   ├── ItemSelector.tsx        # Main item selection component
│   │   ├── ItemCard.tsx            # Individual item display
│   │   └── ItemList.tsx            # Grid/list of items
│   ├── modifiers/
│   │   ├── ModifierSelector.tsx    # Main modifier selection component
│   │   ├── ModifierList.tsx        # Prefix or suffix list
│   │   ├── ModifierCard.tsx        # Individual modifier with tooltip
│   │   └── SelectionCounter.tsx    # "X/3 selected" badge
│   └── simulation/
│       ├── SimulationTrigger.tsx   # "Start Simulation" button with validation
│       ├── SimulationProgress.tsx  # Loading indicator with progress
│       ├── ResultsDisplay.tsx      # Crafting paths list
│       └── CraftingPathCard.tsx    # Individual path with steps
├── contexts/
│   ├── ItemsContext.tsx            # Item selection state
│   ├── ModifiersContext.tsx        # Modifier selection and validation
│   └── SimulationContext.tsx       # Simulation state and results
├── components/
│   └── ui/
│       ├── toast.tsx               # shadcn/ui Toast (Sonner)
│       ├── tooltip.tsx             # shadcn/ui Tooltip
│       ├── button.tsx              # shadcn/ui Button
│       ├── card.tsx                # shadcn/ui Card
│       ├── badge.tsx               # shadcn/ui Badge
│       └── spinner.tsx             # Loading spinner component
├── lib/
│   ├── modifierValidation.ts      # Incompatibility checking logic
│   ├── resultsSorting.ts          # Probability-based sorting
│   ├── errorMessages.ts           # User-friendly error mapping
│   └── utils.ts                   # Existing utility (cn, etc.)
├── types/
│   └── index.ts                   # All TypeScript interfaces
├── App.tsx                         # Provider composition
├── main.tsx                        # Entry point
└── index.css                       # Global styles, CSS variables
```

**Structure Decision**: Single-project structure selected as this is a frontend-only feature within an existing Electron application. The feature-based organization (Principle III) groups components by domain (items, modifiers, simulation) rather than technical role. Contexts manage global state per domain (Principle II). All UI components use shadcn/ui from `components/ui/` (Principle VI). Utility functions are extracted to `lib/` for reusability (Principle VIII).

## Complexity Tracking

> No constitution violations - all principles satisfied. This section intentionally empty.
