# Quickstart: Simplified Modifier Selector

**Feature**: 001-simplified-modifier-selector  
**For**: Developers implementing this feature  
**Updated**: 2025-11-21

## Overview

This guide helps you implement the simplified modifier selector feature from scratch. Follow these steps in order for a smooth implementation aligned with the project constitution.

## Prerequisites

✅ Node.js 20+ installed  
✅ Java 21+ installed (for backend)  
✅ Project cloned: `git clone https://github.com/Dboire9/POE2_HTC.git`  
✅ Branch checked out: `git checkout 001-simplified-modifier-selector`  
✅ Dependencies installed: `pnpm install` (or `npm install`)

## Step 1: Review Documentation (15 min)

Read in this order:

1. **spec.md** - Understand user stories and requirements
2. **data-model.md** - Learn all TypeScript interfaces
3. **research.md** - See technical decisions and rationale
4. **contracts/api.md** - Understand backend API
5. **This file (quickstart.md)** - Implementation guide

## Step 2: Set Up Type Definitions (30 min)

Create all TypeScript interfaces in `src/types/index.ts`:

```bash
# Edit src/types/index.ts
code src/types/index.ts
```

Copy interfaces from `data-model.md`:
- Item, ItemType enum
- Modifier, ModifierType, ModifierSource enum, StatRange
- ModifierExclusion
- CraftingPath, CraftingStep, CurrencyCost
- SimulationRequest, SimulationResult
- ItemsState, ModifiersState, SimulationState
- Type guards: isValidItem, isValidModifier, isValidSimulationRequest

**Validation**: Run `npm run type-check` - should pass with no errors.

## Step 3: Create Utility Functions (30 min)

### 3.1 Modifier Validation

Create `src/lib/modifierValidation.ts`:

```typescript
import { Modifier, ModifierExclusion } from '../types';

export function buildExclusionMap(
  exclusions: ModifierExclusion[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  exclusions.forEach(rule => {
    map.set(rule.modifierId, new Set(rule.excludes));
  });
  return map;
}

export function isModifierDisabled(
  modifierId: string,
  selectedModifiers: Modifier[],
  exclusionMap: Map<string, Set<string>>
): boolean {
  return selectedModifiers.some(selected =>
    exclusionMap.get(selected.id)?.has(modifierId)
  );
}
```

### 3.2 Results Sorting

Create `src/lib/resultsSorting.ts`:

```typescript
import { CraftingPath } from '../types';

export function sortPathsByProbability(
  paths: CraftingPath[]
): CraftingPath[] {
  return [...paths].sort((a, b) => b.probability - a.probability);
}
```

### 3.3 Error Messages

Create `src/lib/errorMessages.ts`:

```typescript
export enum ErrorCode {
  BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE',
  INVALID_MODIFIERS = 'INVALID_MODIFIERS',
  NO_VALID_PATH = 'NO_VALID_PATH',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export const errorMessages: Record<ErrorCode, string> = {
  BACKEND_UNAVAILABLE: 'Cannot connect to crafting engine. Please restart.',
  INVALID_MODIFIERS: 'Selected modifiers are invalid. Try different combinations.',
  NO_VALID_PATH: 'No crafting path exists. Try removing a modifier.',
  TIMEOUT: 'Simulation taking longer than expected. Try simpler combinations.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};
```

## Step 4: Build Contexts (2 hours)

### 4.1 ItemsContext

Create `src/contexts/ItemsContext.tsx` - see `data-model.md` for ItemsState structure.

Key implementation:
- `loadItems()` - Call `window.electronAPI.invoke('api:items')`
- `selectItem()` - Update selectedItem
- Export `useItems()` hook

### 4.2 ModifiersContext

Create `src/contexts/ModifiersContext.tsx` - see `data-model.md` for ModifiersState.

Key implementation:
- `loadModifiers(itemId)` - Fetch modifiers and exclusions
- `selectModifier(modifier)` - Check limit (3), show toast if exceeded
- `isModifierDisabled(modifierId)` - Use buildExclusionMap helper
- Export `useModifiers()` hook

**Important**: Add toast for selection limits using shadcn/ui Toast.

### 4.3 SimulationContext

Create `src/contexts/SimulationContext.tsx` - see `data-model.md` for SimulationState.

Key implementation:
- `startSimulation(request)` - Call `window.electronAPI.invoke('api:crafting')`
- Add debouncing (500ms) and AbortController for cancellation
- Sort results with `sortPathsByProbability()`
- Export `useSimulation()` hook

## Step 5: Build UI Components (3 hours)

### 5.1 Items Feature

```bash
mkdir -p src/features/items
```

Create in order:
1. `ItemCard.tsx` - Display single item with React.memo()
2. `ItemList.tsx` - Grid of ItemCards
3. `ItemSelector.tsx` - Main component using useItems()

### 5.2 Modifiers Feature

```bash
mkdir -p src/features/modifiers
```

Create in order:
1. `SelectionCounter.tsx` - Badge showing "X/3 selected"
2. `ModifierCard.tsx` - Single modifier with tooltip for disabled state
3. `ModifierList.tsx` - Scrollable list with sections (Prefixes/Suffixes)
4. `ModifierSelector.tsx` - Main component using useModifiers()

**Key**: Use Tooltip component for disabled modifiers (FR-018).

### 5.3 Simulation Feature

```bash
mkdir -p src/features/simulation
```

Create in order:
1. `SimulationTrigger.tsx` - Button with validation (disabled if no modifiers)
2. `SimulationProgress.tsx` - Loading spinner during simulation
3. `CraftingPathCard.tsx` - Single path display with steps
4. `ResultsDisplay.tsx` - List of paths using useSimulation()

## Step 6: Compose Application (30 min)

Update `src/App.tsx`:

```typescript
import { ItemsProvider } from './contexts/ItemsContext';
import { ModifiersProvider } from './contexts/ModifiersContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { Toaster } from './components/ui/toast';
import ItemSelector from './features/items/ItemSelector';
import ModifierSelector from './features/modifiers/ModifierSelector';
import SimulationTrigger from './features/simulation/SimulationTrigger';
import ResultsDisplay from './features/simulation/ResultsDisplay';

export default function App() {
  return (
    <ItemsProvider>
      <ModifiersProvider>
        <SimulationProvider>
          <div className="app-container">
            <ItemSelector />
            <ModifierSelector />
            <SimulationTrigger />
            <ResultsDisplay />
          </div>
          <Toaster />
        </SimulationProvider>
      </ModifiersProvider>
    </ItemsProvider>
  );
}
```

## Step 7: Testing & Validation (1 hour)

### 7.1 Manual Testing Checklist

- [ ] Select an item → modifiers load
- [ ] Select 3 prefixes → 4th selection shows toast
- [ ] Select conflicting modifier → incompatible ones disabled
- [ ] Click disabled modifier → tooltip shows reason
- [ ] Click "Start Simulation" → loading appears
- [ ] Results display → paths sorted by probability (highest first)
- [ ] Backend unavailable → error message shows

### 7.2 Performance Validation

Open React DevTools Profiler:
- [ ] Selecting modifiers: < 16ms re-render time
- [ ] Simulation results load: < 100ms to display
- [ ] No unnecessary re-renders (check Profiler flamegraph)

### 7.3 Constitution Compliance

- [ ] All components wrapped in React.memo()
- [ ] All event handlers use useCallback()
- [ ] No console.logs in code
- [ ] All types defined, no `any` types
- [ ] ESLint warnings resolved

## Step 8: Commit & Document

```bash
git add src/
git commit -m "feat(001): implement simplified modifier selector

- Add ItemsContext, ModifiersContext, SimulationContext
- Build item selection, modifier selection, simulation UI
- Implement incompatibility checking and selection limits
- Sort results by probability (descending)
- Add toast notifications and tooltips
- All components memoized per constitution"
```

## Common Issues & Solutions

### Issue: window.electronAPI undefined

**Solution**: Check `electron/preload.ts` exposes all IPC channels. Run in Electron, not browser.

### Issue: Modifiers not loading

**Solution**: Verify backend is running on localhost:8080. Check network tab for IPC calls.

### Issue: Toast not appearing

**Solution**: Ensure `<Toaster />` component is rendered in App.tsx. Check shadcn/ui setup.

### Issue: Performance degradation

**Solution**: Verify React.memo() on all components. Check useCallback dependencies. Use React DevTools Profiler.

## Next Steps

After completing implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Follow task list for systematic implementation
3. Use `/speckit.implement` for guided execution with validation

## Resources

- [Constitution](../../.specify/memory/constitution.md) - Architecture principles
- [shadcn/ui Docs](https://ui.shadcn.com/) - Component library
- [React 19 Docs](https://react.dev/) - Framework documentation
- [Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-renderer) - Communication protocol

---

**Estimated Time**: 7-8 hours for experienced React + TypeScript developer

**Difficulty**: Moderate - requires understanding of Context API, memoization, and IPC
