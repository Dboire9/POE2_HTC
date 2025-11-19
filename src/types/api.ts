/**
 * Comprehensive TypeScript type definitions for POE2_HTC API
 * All types enforce TypeScript strict mode (no 'any' types)
 */

export interface Item {
  id: string;
  name: string;
  baseType: string;
  category: string;
  implicits?: Modifier[];
}

export interface Modifier {
  id: string;
  family: string; // Original family name used by backend
  name: string;
  tier: number;
  tags: string[];
  weight: number;
  type: 'PREFIX' | 'SUFFIX';
}

export interface Currency {
  id: string;
  name: string;
  category: 'basic' | 'essence' | 'special';
  description?: string;
  icon?: string;
}

export interface SelectedModifier {
  id: string;
  tier: number;
}

export interface CraftingRequest {
  sessionId?: string;
  itemId: string;
  modifiers: {
    prefixes: SelectedModifier[];
    suffixes: SelectedModifier[];
  };
  allowedCurrencies?: string[];
  strategy?: 'fastest' | 'cheapest' | 'balanced';
  iterations?: number;
  maxSteps?: number;
}export interface CraftingStep {
  currencyId: string;
  currencyName: string;
  probability: number;
  resultingModifiers: string[];
  description: string;
  tier?: string;
  omens?: string[];
  temporaryModifier?: boolean; // True if this modifier will be removed by Perfect Essence in next step
}

export interface CraftingPath {
  steps: CraftingStep[];
  probability: number;
  successRate: number;
  cost: number;
  estimatedCost: number;
  quality: number;
  label: string;
}

export interface CraftingResult {
  sessionId: string;
  success: boolean;
  path: CraftingPath;
  totalProbability: number;
  averageCost: number;
  estimatedAttempts: number;
  averageSteps: number;
  alternatives?: CraftingPath[];
}

export interface ProgressData {
  sessionId: string;
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  currentPhase: string;
  message?: string;
}

export type ErrorType =
  | 'HEAP_SPACE_ERROR'
  | 'TIMEOUT_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'VALIDATION_ERROR'
  | 'NO_PATH_FOUND'
  | 'UNKNOWN_ERROR';

export interface ErrorResponse {
  type: ErrorType;
  message: string;
  suggestions?: string[];
}
