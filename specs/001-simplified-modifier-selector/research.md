# Research: Simplified Modifier Selector

**Feature**: 001-simplified-modifier-selector  
**Date**: 2025-11-21  
**Purpose**: Resolve technical unknowns and gather best practices for implementation

## Research Tasks

### 1. Modifier Incompatibility Detection Strategy

**Context**: Frontend must disable incompatible modifiers when one is selected (FR-017, FR-018).

**Decision**: Use backend-provided exclusion rules with frontend caching

**Rationale**:
- Backend already knows all modifier exclusion rules (game logic)
- Fetching exclusion data alongside modifiers minimizes API calls
- Frontend caches rules per item type for instant validation
- Single source of truth (backend) prevents desync
- Simple lookup: `Map<modifierId, Set<incompatibleModifierIds>>`

**Alternatives Considered**:
- Hardcode rules in frontend: Rejected - duplicates logic, requires updates for game patches
- Backend validates on selection: Rejected - slower UX, requires round-trip for each click

**Implementation**:
```typescript
// Type definition
interface ModifierExclusion {
  modifierId: string;
  excludes: string[]; // IDs of incompatible modifiers
}

// Usage in ModifiersContext
const exclusionMap = useMemo(() => {
  const map = new Map<string, Set<string>>();
  exclusions.forEach(rule => {
    map.set(rule.modifierId, new Set(rule.excludes));
  });
  return map;
}, [exclusions]);

const isModifierDisabled = useCallback((modifierId: string) => {
  return selectedModifiers.some(selected => 
    exclusionMap.get(selected.id)?.has(modifierId)
  );
}, [selectedModifiers, exclusionMap]);
```

---

### 2. Toast Notification System for Selection Limits

**Context**: Must show warning toast when user tries to select 4th prefix/suffix (FR-008).

**Decision**: Use shadcn/ui Toast component with Sonner library

**Rationale**:
- shadcn/ui provides pre-built Toast component using Sonner
- Follows constitution Principle VI (use shadcn/ui exclusively)
- Accessible, customizable, supports stacking
- Simple API: `toast.warning("Maximum 3 prefixes selected")`

**Alternatives Considered**:
- Custom toast implementation: Rejected - violates constitution, reinvents wheel
- Alert dialogs: Rejected - too intrusive, blocks workflow

**Implementation**:
```typescript
// In ModifiersContext
const selectModifier = useCallback((modifier: Modifier) => {
  const isPrefix = modifier.type === 'prefix';
  const currentCount = selectedModifiers.filter(m => m.type === modifier.type).length;
  
  if (currentCount >= 3) {
    toast.warning(`Maximum 3 ${isPrefix ? 'prefixes' : 'suffixes'} selected`, {
      description: 'Deselect one to add another',
      duration: 3000,
    });
    return;
  }
  
  // Add modifier...
}, [selectedModifiers]);
```

---

### 3. Results Sorting Algorithm (Probability-First)

**Context**: Crafting paths must be sorted by success probability descending (FR-014, Clarification Q3).

**Decision**: Simple Array.sort() on probability field with memoization

**Rationale**:
- Backend returns paths with probability already calculated
- Frontend just needs to sort: `paths.sort((a, b) => b.probability - a.probability)`
- useMemo prevents re-sorting on every render
- O(n log n) is acceptable for typical result set (< 100 paths)

**Alternatives Considered**:
- Server-side sorting: Rejected - adds latency, frontend needs sorting anyway for potential filters
- Complex scoring algorithm: Rejected - clarification confirmed probability-only sorting

**Implementation**:
```typescript
// In SimulationContext
const sortedResults = useMemo(() => {
  if (!simulationResults) return [];
  return [...simulationResults].sort((a, b) => 
    b.probability - a.probability
  );
}, [simulationResults]);
```

---

### 4. Simulation Cancellation & Debouncing Strategy

**Context**: Handle rapid selection changes before simulation completes (Edge Case).

**Decision**: Use AbortController + debounce for simulation triggers

**Rationale**:
- AbortController cancels in-flight IPC requests
- 500ms debounce prevents request spam
- User sees immediate visual feedback even while debounced
- Electron IPC supports cancellation via controller

**Implementation**:
```typescript
// In SimulationContext
const simulationController = useRef<AbortController | null>(null);

const startSimulation = useMemo(
  () => debounce(async (itemId: string, modifierIds: string[]) => {
    // Cancel previous simulation
    simulationController.current?.abort();
    simulationController.current = new AbortController();
    
    try {
      const result = await window.electronAPI.invoke('api:crafting', {
        itemId,
        modifierIds,
        signal: simulationController.current.signal,
      });
      setSimulationResults(result);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  }, 500),
  []
);
```

---

### 5. Component Memoization Best Practices for React 19

**Context**: All components must be wrapped in React.memo() (Principle IV).

**Decision**: Use React.memo() with custom equality functions for complex props

**Rationale**:
- React 19 improves memo performance with auto-memoization hints
- Custom equality functions prevent unnecessary re-renders for array/object props
- Constitution mandates memoization for all feature components

**Best Practices**:
```typescript
// For simple props
export const ItemCard = React.memo(({ item, selected, onClick }: Props) => {
  // Component implementation
});

// For array/object props, use custom equality
export const ModifierList = React.memo(
  ({ modifiers, selectedIds, onSelect }: Props) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return (
      prevProps.modifiers.length === nextProps.modifiers.length &&
      prevProps.selectedIds.length === nextProps.selectedIds.length &&
      prevProps.modifiers.every((m, i) => m.id === nextProps.modifiers[i].id)
    );
  }
);
```

---

### 6. Electron IPC Error Handling Patterns

**Context**: Must handle backend errors gracefully (FR-015, Principle V).

**Decision**: Typed error responses + ErrorBoundary + user-friendly messages

**Rationale**:
- Backend returns structured errors: `{ code, message, recoverable }`
- ErrorBoundary catches React errors (crashes)
- User-friendly mapping in lib/errorMessages.ts
- Follows constitution Principle VII (real-time feedback)

**Error Categories**:
```typescript
enum ErrorCode {
  BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE',
  INVALID_MODIFIERS = 'INVALID_MODIFIERS',
  NO_VALID_PATH = 'NO_VALID_PATH',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

const errorMessages: Record<ErrorCode, string> = {
  BACKEND_UNAVAILABLE: 'Cannot connect to crafting engine. Please restart the application.',
  INVALID_MODIFIERS: 'Selected modifiers are invalid. Please try different combinations.',
  NO_VALID_PATH: 'No crafting path exists for these modifiers. Try removing one and retrying.',
  TIMEOUT: 'Simulation taking longer than expected. The combination may be extremely complex.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};
```

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Incompatibility Detection | Backend rules + frontend cache | Single source of truth, fast lookups |
| Toast Notifications | shadcn/ui Toast (Sonner) | Constitution-compliant, accessible |
| Results Sorting | Array.sort() on probability | Simple, memoized, meets requirements |
| Simulation Cancellation | AbortController + debounce | Prevents request spam, smooth UX |
| Component Memoization | React.memo() with custom equality | Optimizes React 19 performance |
| Error Handling | Typed errors + ErrorBoundary | Graceful degradation, clear feedback |

All research findings support rapid development while maintaining constitution compliance.
