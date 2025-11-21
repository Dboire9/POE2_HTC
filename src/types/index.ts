// Core Entities - Simplified Modifier Selector Feature
// Feature: 001-simplified-modifier-selector

// ============================================================================
// Item Types
// ============================================================================

export enum ItemType {
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

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  iconPath?: string;
  baseStats: Record<string, number>;
}

// ============================================================================
// Modifier Types
// ============================================================================

export type ModifierType = 'prefix' | 'suffix';

export enum ModifierSource {
  NORMAL = 'normal',           // Regular crafting
  ESSENCE = 'essence',         // Essence-only
  PERFECT_ESSENCE = 'perfect', // Perfect essence
  DESECRATED = 'desecrated',   // Desecrated currency
}

export interface StatRange {
  stat: string;        // Stat name (e.g., "Physical Damage")
  min: number;
  max: number;
}

export interface Modifier {
  id: string;
  text: string;
  type: ModifierType;
  tier: number;
  statRanges: StatRange[];
  tags: string[];
  source: ModifierSource;
}

// ============================================================================
// Modifier Exclusion Rules
// ============================================================================

export interface ModifierExclusion {
  modifierId: string;
  excludes: string[];
}

// Computed helper for fast lookup
export type ExclusionMap = Map<string, Set<string>>;

// ============================================================================
// Crafting Path Types
// ============================================================================

export interface CurrencyCost {
  [currencyName: string]: number; // e.g., { "Exalted Orb": 2, "Regal Orb": 5 }
}

export interface CraftingStep {
  order: number;
  action: string;           // e.g., "Use Exalted Orb"
  currencyUsed: string;     // Currency name
  targetModifier?: string;  // Expected modifier result
  probability: number;      // Step-specific probability
}

export interface CraftingPath {
  id: string;
  steps: CraftingStep[];
  probability: number;
  totalCost: CurrencyCost;
}

// ============================================================================
// Simulation Types
// ============================================================================

export interface SimulationRequest {
  itemId: string;
  desiredModifiers: string[]; // 1-6 modifier IDs (1-3 prefixes + 1-3 suffixes)
}

export interface SimulationResult {
  itemId: string;
  requestedModifiers: string[];
  paths: CraftingPath[];
  computationTime: number;
  warnings: string[];
}

// ============================================================================
// State Management Models
// ============================================================================

export interface ItemsState {
  items: Item[];                  // All available items
  selectedItem: Item | null;      // Currently selected item
  loading: boolean;               // Fetching items from backend
  error: string | null;           // Error message if fetch fails
}

export interface ItemsActions {
  loadItems: () => Promise<void>;
  selectItem: (itemId: string) => void;
  clearSelection: () => void;
}

export interface ModifiersState {
  prefixes: Modifier[];           // Available prefixes for selected item
  suffixes: Modifier[];           // Available suffixes for selected item
  selectedPrefixes: Modifier[];   // Selected prefixes (max 3)
  selectedSuffixes: Modifier[];   // Selected suffixes (max 3)
  exclusionRules: ModifierExclusion[]; // Incompatibility rules
  loading: boolean;
  error: string | null;
}

export interface ModifiersActions {
  loadModifiers: (itemId: string) => Promise<void>;
  selectModifier: (modifier: Modifier) => void;
  deselectModifier: (modifierId: string) => void;
  isModifierDisabled: (modifierId: string) => boolean;
  clearSelections: () => void;
}

export interface SimulationState {
  result: SimulationResult | null;   // Current simulation results
  loading: boolean;                   // Simulation in progress
  progress: number | null;            // Progress percentage (if available)
  error: string | null;               // Error message
}

export interface SimulationActions {
  startSimulation: (request: SimulationRequest) => Promise<void>;
  cancelSimulation: () => void;
  clearResults: () => void;
}

// ============================================================================
// Type Guards & Validators
// ============================================================================

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
