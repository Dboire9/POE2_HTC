# Data Model: Simplified Modifier Selector

**Feature**: 001-simplified-modifier-selector  
**Date**: 2025-11-21  
**Purpose**: Define all data entities and their relationships for type-safe implementation

## Core Entities

### Item

Represents a craftable item type in Path of Exile 2.

**Properties**:
- `id`: string - Unique identifier (e.g., "bow_001")
- `name`: string - Display name (e.g., "Crude Bow")
- `type`: ItemType - Category enum
- `iconPath`?: string - Optional path to item icon
- `baseStats`: Record<string, number> - Base stat values

**Relationships**:
- Has many allowed Modifiers (prefixes and suffixes)

**TypeScript Interface**:
```typescript
enum ItemType {
  BOW = 'bow',
  HELMET = 'helmet',
  BODY_ARMOUR = 'body_armour',
  GLOVES = 'gloves',
  BOOTS = 'boots',
  AMULET = 'amulet',
  RING = 'ring',
  BELT = 'belt',
  QUIVER = 'quiver',
  SHIELD = 'shield',
  ONE_HAND_WEAPON = 'one_hand_weapon',
  TWO_HAND_WEAPON = 'two_hand_weapon',
}

interface Item {
  id: string;
  name: string;
  type: ItemType;
  iconPath?: string;
  baseStats: Record<string, number>;
}
```

**Validation Rules**:
- id must be non-empty and unique
- name must be non-empty
- type must be valid ItemType enum value

---

### Modifier

Represents a stat modifier (prefix or suffix) that can be rolled on an item.

**Properties**:
- `id`: string - Unique identifier (e.g., "mod_phys_damage_t3")
- `text`: string - Display text (e.g., "Adds # to # Physical Damage")
- `type`: ModifierType - 'prefix' or 'suffix'
- `tier`: number - Tier level (0-5, where 0 is highest/perfect)
- `statRanges`: StatRange[] - Min/max values for each stat
- `tags`: string[] - Searchable tags (e.g., ["physical", "damage"])
- `source`: ModifierSource - How it can be obtained

**Relationships**:
- Belongs to one or more Items
- May exclude other Modifiers (incompatibility rules)

**TypeScript Interface**:
```typescript
type ModifierType = 'prefix' | 'suffix';

enum ModifierSource {
  NORMAL = 'normal',           // Regular crafting
  ESSENCE = 'essence',         // Essence-only
  PERFECT_ESSENCE = 'perfect', // Perfect essence
  DESECRATED = 'desecrated',   // Desecrated currency
}

interface StatRange {
  stat: string;        // Stat name (e.g., "Physical Damage")
  min: number;
  max: number;
}

interface Modifier {
  id: string;
  text: string;
  type: ModifierType;
  tier: number;
  statRanges: StatRange[];
  tags: string[];
  source: ModifierSource;
}
```

**Validation Rules**:
- id must be unique
- text must be non-empty
- tier must be 0-5 inclusive
- statRanges must have at least one entry
- type must be 'prefix' or 'suffix'

---

### ModifierExclusion

Represents incompatibility rules between modifiers (used for FR-017, FR-018).

**Properties**:
- `modifierId`: string - The modifier that excludes others
- `excludes`: string[] - Array of modifier IDs that cannot coexist

**Relationships**:
- References Modifiers by ID

**TypeScript Interface**:
```typescript
interface ModifierExclusion {
  modifierId: string;
  excludes: string[];
}

// Computed helper for fast lookup
type ExclusionMap = Map<string, Set<string>>;
```

**Validation Rules**:
- modifierId must reference a valid Modifier
- excludes array can be empty (no exclusions)
- Exclusion should be bidirectional: if A excludes B, B should exclude A

---

### CraftingPath

Represents one possible sequence of crafting steps to achieve desired modifiers.

**Properties**:
- `id`: string - Unique path identifier
- `steps`: CraftingStep[] - Ordered sequence of crafting actions
- `probability`: number - Success chance (0.0 to 1.0)
- `totalCost`: CurrencyCost - Total currency required

**Relationships**:
- Contains multiple CraftingSteps
- Part of SimulationResult

**TypeScript Interface**:
```typescript
interface CurrencyCost {
  [currencyName: string]: number; // e.g., { "Exalted Orb": 2, "Regal Orb": 5 }
}

interface CraftingStep {
  order: number;
  action: string;           // e.g., "Use Exalted Orb"
  currencyUsed: string;     // Currency name
  targetModifier?: string;  // Expected modifier result
  probability: number;      // Step-specific probability
}

interface CraftingPath {
  id: string;
  steps: CraftingStep[];
  probability: number;
  totalCost: CurrencyCost;
}
```

**Validation Rules**:
- steps must be ordered by `order` field (ascending)
- probability must be 0.0-1.0
- steps array must not be empty

---

### SimulationRequest

Data package sent to backend to request crafting simulation (FR-012).

**Properties**:
- `itemId`: string - Selected item ID
- `desiredModifiers`: string[] - Array of selected modifier IDs (1-6 total)

**TypeScript Interface**:
```typescript
interface SimulationRequest {
  itemId: string;
  desiredModifiers: string[]; // 1-6 modifier IDs (1-3 prefixes + 1-3 suffixes)
}
```

**Validation Rules**:
- itemId must be non-empty and valid
- desiredModifiers must have 1-6 elements
- Modifiers must be compatible with the item type

---

### SimulationResult

Response from backend containing all crafting paths (FR-014).

**Properties**:
- `itemId`: string - Item that was simulated
- `requestedModifiers`: string[] - Modifiers that were requested
- `paths`: CraftingPath[] - All possible crafting paths
- `computationTime`: number - Time taken in milliseconds
- `warnings`: string[] - Any warnings (e.g., extremely low probability)

**TypeScript Interface**:
```typescript
interface SimulationResult {
  itemId: string;
  requestedModifiers: string[];
  paths: CraftingPath[];
  computationTime: number;
  warnings: string[];
}
```

**Validation Rules**:
- paths array may be empty (no valid path found)
- paths must be sortable by probability
- computationTime should be < 30000ms (30 seconds) per requirement

---

## State Management Models

### ItemsState (ItemsContext)

```typescript
interface ItemsState {
  items: Item[];                  // All available items
  selectedItem: Item | null;      // Currently selected item
  loading: boolean;               // Fetching items from backend
  error: string | null;           // Error message if fetch fails
}

interface ItemsActions {
  loadItems: () => Promise<void>;
  selectItem: (itemId: string) => void;
  clearSelection: () => void;
}
```

---

### ModifiersState (ModifiersContext)

```typescript
interface ModifiersState {
  prefixes: Modifier[];           // Available prefixes for selected item
  suffixes: Modifier[];           // Available suffixes for selected item
  selectedPrefixes: Modifier[];   // Selected prefixes (max 3)
  selectedSuffixes: Modifier[];   // Selected suffixes (max 3)
  exclusionRules: ModifierExclusion[]; // Incompatibility rules
  loading: boolean;
  error: string | null;
}

interface ModifiersActions {
  loadModifiers: (itemId: string) => Promise<void>;
  selectModifier: (modifier: Modifier) => void;
  deselectModifier: (modifierId: string) => void;
  isModifierDisabled: (modifierId: string) => boolean;
  clearSelections: () => void;
}
```

---

### SimulationState (SimulationContext)

```typescript
interface SimulationState {
  result: SimulationResult | null;   // Current simulation results
  loading: boolean;                   // Simulation in progress
  progress: number | null;            // Progress percentage (if available)
  error: string | null;               // Error message
}

interface SimulationActions {
  startSimulation: (request: SimulationRequest) => Promise<void>;
  cancelSimulation: () => void;
  clearResults: () => void;
}
```

---

## Relationships Diagram

```
┌─────────────┐
│    Item     │
│  (selected) │
└──────┬──────┘
       │
       │ has allowed
       ↓
┌──────────────┐         ┌─────────────────────┐
│   Modifier   │◄────────│ ModifierExclusion   │
│ (prefixes/   │ excludes│   (incompatibility  │
│  suffixes)   │         │        rules)       │
└──────┬───────┘         └─────────────────────┘
       │
       │ selected (1-6)
       ↓
┌──────────────────┐
│ SimulationRequest│
│                  │
└──────┬───────────┘
       │
       │ generates
       ↓
┌──────────────────┐
│ SimulationResult │
│                  │
└──────┬───────────┘
       │
       │ contains
       ↓
┌──────────────────┐      ┌────────────────┐
│  CraftingPath    │──────►│ CraftingStep   │
│  (sorted by      │ has  │   (ordered)    │
│   probability)   │      └────────────────┘
└──────────────────┘
```

---

## Type Guards & Validators

```typescript
// Runtime type validation
export function isValidModifier(obj: unknown): obj is Modifier {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Partial<Modifier>;
  return (
    typeof m.id === 'string' &&
    typeof m.text === 'string' &&
    (m.type === 'prefix' || m.type === 'suffix') &&
    typeof m.tier === 'number' &&
    m.tier >= 0 && m.tier <= 5 &&
    Array.isArray(m.statRanges) &&
    m.statRanges.length > 0
  );
}

export function isValidItem(obj: unknown): obj is Item {
  if (typeof obj !== 'object' || obj === null) return false;
  const i = obj as Partial<Item>;
  return (
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.type === 'string' &&
    Object.values(ItemType).includes(i.type as ItemType)
  );
}

export function isValidSimulationRequest(obj: unknown): obj is SimulationRequest {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Partial<SimulationRequest>;
  return (
    typeof r.itemId === 'string' &&
    r.itemId.length > 0 &&
    Array.isArray(r.desiredModifiers) &&
    r.desiredModifiers.length >= 1 &&
    r.desiredModifiers.length <= 6 &&
    r.desiredModifiers.every(m => typeof m === 'string')
  );
}
```

---

## Notes

- All IDs are strings for flexibility (backend uses various formats)
- Probabilities are decimals (0.0-1.0), displayed as percentages in UI
- Exclusion rules are bidirectional but stored once per modifier
- Currency costs use Record for flexibility (backend determines currency types)
- Type guards enable runtime validation of API responses (defense against backend changes)
