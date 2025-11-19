/**
 * Crafting Context - Centralized state management for crafting simulation
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Item, Modifier, CraftingResult } from '../types/api';
import { CraftingError } from '../types/errors';
import type { ProgressData } from '../hooks/useCalculationProgress';

interface SelectedModifier {
  modifier: Modifier;
  tier: number;
}

interface CraftingState {
  // Item selection
  selectedItem: Item | null;
  availableModifiers: Modifier[];
  
  // Modifier selection
  selectedModifiers: {
    prefixes: SelectedModifier[];
    suffixes: SelectedModifier[];
  };
  
  // Calculation state
  isCalculating: boolean;
  sessionId: string | null;
  progress: ProgressData | null;
  result: CraftingResult | null;
  error: CraftingError | null;
}

interface CraftingActions {
  // Item actions
  setSelectedItem: (item: Item | null) => void;
  setAvailableModifiers: (modifiers: Modifier[]) => void;
  
  // Modifier actions
  addModifier: (type: 'prefix' | 'suffix', modifier: Modifier, tier: number) => void;
  removeModifier: (type: 'prefix' | 'suffix', modifierId: string) => void;
  updateModifierTier: (type: 'prefix' | 'suffix', modifierId: string, tier: number) => void;
  clearModifiers: () => void;
  
  // Calculation actions
  setIsCalculating: (isCalculating: boolean) => void;
  setSessionId: (sessionId: string | null) => void;
  setProgress: (progress: ProgressData | null) => void;
  setResult: (result: CraftingResult) => void;
  setError: (error: CraftingError | null) => void;
  reset: () => void;
}

type CraftingContextType = CraftingState & CraftingActions;

const CraftingContext = createContext<CraftingContextType | null>(null);

const initialState: CraftingState = {
  selectedItem: null,
  availableModifiers: [],
  selectedModifiers: {
    prefixes: [],
    suffixes: [],
  },
  isCalculating: false,
  sessionId: null,
  progress: null,
  result: null,
  error: null,
};

export function CraftingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CraftingState>(initialState);

  const setSelectedItem = useCallback((item: Item | null) => {
    setState((prev) => ({
      ...prev,
      selectedItem: item,
      availableModifiers: [],
      selectedModifiers: { prefixes: [], suffixes: [] },
      result: null,
      error: null,
    }));
  }, []);

  const setAvailableModifiers = useCallback((modifiers: Modifier[]) => {
    setState((prev) => ({ ...prev, availableModifiers: modifiers }));
  }, []);

  const addModifier = useCallback((type: 'prefix' | 'suffix', modifier: Modifier, tier: number) => {
    setState((prev) => {
      const key = type === 'prefix' ? 'prefixes' : 'suffixes';
      const current = prev.selectedModifiers[key];
      
      // Check if modifier already exists
      if (current.some((m) => m.modifier.id === modifier.id)) {
        return prev;
      }
      
      return {
        ...prev,
        selectedModifiers: {
          ...prev.selectedModifiers,
          [key]: [...current, { modifier, tier }],
        },
        result: null,
        error: null,
      };
    });
  }, []);

  const removeModifier = useCallback((type: 'prefix' | 'suffix', modifierId: string) => {
    setState((prev) => {
      const key = type === 'prefix' ? 'prefixes' : 'suffixes';
      
      return {
        ...prev,
        selectedModifiers: {
          ...prev.selectedModifiers,
          [key]: prev.selectedModifiers[key].filter((m) => m.modifier.id !== modifierId),
        },
        result: null,
        error: null,
      };
    });
  }, []);

  const updateModifierTier = useCallback((type: 'prefix' | 'suffix', modifierId: string, tier: number) => {
    setState((prev) => {
      const key = type === 'prefix' ? 'prefixes' : 'suffixes';
      
      return {
        ...prev,
        selectedModifiers: {
          ...prev.selectedModifiers,
          [key]: prev.selectedModifiers[key].map((m) =>
            m.modifier.id === modifierId ? { ...m, tier } : m
          ),
        },
        result: null,
        error: null,
      };
    });
  }, []);

  const clearModifiers = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedModifiers: { prefixes: [], suffixes: [] },
      result: null,
      error: null,
    }));
  }, []);

  const setIsCalculating = useCallback((isCalculating: boolean) => {
    setState((prev) => ({ ...prev, isCalculating }));
  }, []);

  const setSessionId = useCallback((sessionId: string | null) => {
    setState((prev) => ({ ...prev, sessionId }));
  }, []);

  const setProgress = useCallback((progress: ProgressData | null) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const setResult = useCallback((result: CraftingResult) => {
    setState((prev) => ({ ...prev, result, isCalculating: false, progress: null, sessionId: null }));
  }, []);

  const setError = useCallback((error: CraftingError | null) => {
    setState((prev) => ({ ...prev, error, isCalculating: false }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const contextValue: CraftingContextType = {
    ...state,
    setSelectedItem,
    setAvailableModifiers,
    addModifier,
    removeModifier,
    updateModifierTier,
    clearModifiers,
    setIsCalculating,
    setSessionId,
    setProgress,
    setResult,
    setError,
    reset,
  };

  return (
    <CraftingContext.Provider value={contextValue}>
      {children}
    </CraftingContext.Provider>
  );
}

export function useCrafting(): CraftingContextType {
  const context = useContext(CraftingContext);
  if (!context) {
    throw new Error('useCrafting must be used within CraftingProvider');
  }
  return context;
}
