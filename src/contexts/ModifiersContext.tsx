import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Modifier, ModifierExclusion, ModifiersState, ModifiersActions } from '../types';
import { buildExclusionMap, isModifierDisabled as checkModifierDisabled } from '../lib/modifierValidation';
import { ErrorCode, getErrorMessage } from '../lib/errorMessages';
import { toast } from 'sonner';

// Context type combining state and actions
type ModifiersContextType = ModifiersState & ModifiersActions;

const ModifiersContext = createContext<ModifiersContextType | undefined>(undefined);

// Provider component (T020)
export const ModifiersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefixes, setPrefixes] = useState<Modifier[]>([]);
  const [suffixes, setSuffixes] = useState<Modifier[]>([]);
  const [selectedPrefixes, setSelectedPrefixes] = useState<Modifier[]>([]);
  const [selectedSuffixes, setSelectedSuffixes] = useState<Modifier[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ModifierExclusion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // T022: Build exclusion map using utility function (memoized for performance)
  const exclusionMap = useMemo(() => {
    return buildExclusionMap(exclusionRules);
  }, [exclusionRules]);

  // T021: Load modifiers from backend via Electron IPC
  const loadModifiers = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!window.electronAPI) {
        throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
      }

      const response = await window.electronAPI.invoke('api:modifiers', { itemId });
      
      if (response.error) {
        throw new Error(response.error.code || ErrorCode.UNKNOWN);
      }

      setPrefixes(response.prefixes || []);
      setSuffixes(response.suffixes || []);
      setExclusionRules(response.exclusions || []);
      
      // Clear selections when loading new modifiers
      setSelectedPrefixes([]);
      setSelectedSuffixes([]);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : ErrorCode.UNKNOWN;
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, []);

  // T023: Select modifier with 3-item limit checking and toast notification
  const selectModifier = useCallback((modifier: Modifier) => {
    const isPrefix = modifier.type === 'prefix';
    const currentSelections = isPrefix ? selectedPrefixes : selectedSuffixes;
    const setSelections = isPrefix ? setSelectedPrefixes : setSelectedSuffixes;
    
    // Check if already selected
    const alreadySelected = currentSelections.some(m => m.id === modifier.id);
    if (alreadySelected) {
      return; // Already selected, do nothing
    }

    // Check limit (FR-008)
    if (currentSelections.length >= 3) {
      toast.warning(`Maximum 3 ${isPrefix ? 'prefixes' : 'suffixes'} selected`, {
        description: 'Deselect one to add another',
        duration: 3000,
      });
      return;
    }

    // Add to selections
    setSelections(prev => [...prev, modifier]);
  }, [selectedPrefixes, selectedSuffixes]);

  // T024: Deselect modifier
  const deselectModifier = useCallback((modifierId: string) => {
    setSelectedPrefixes(prev => prev.filter(m => m.id !== modifierId));
    setSelectedSuffixes(prev => prev.filter(m => m.id !== modifierId));
  }, []);

  // T025: Check if modifier is disabled due to incompatibility
  const isModifierDisabled = useCallback((modifierId: string) => {
    const allSelected = [...selectedPrefixes, ...selectedSuffixes];
    return checkModifierDisabled(modifierId, allSelected, exclusionMap);
  }, [selectedPrefixes, selectedSuffixes, exclusionMap]);

  // T026: Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedPrefixes([]);
    setSelectedSuffixes([]);
  }, []);

  const value: ModifiersContextType = {
    // State
    prefixes,
    suffixes,
    selectedPrefixes,
    selectedSuffixes,
    exclusionRules,
    loading,
    error,
    // Actions
    loadModifiers,
    selectModifier,
    deselectModifier,
    isModifierDisabled,
    clearSelections,
  };

  return <ModifiersContext.Provider value={value}>{children}</ModifiersContext.Provider>;
};

// T027: Custom hook to use ModifiersContext
export const useModifiers = (): ModifiersContextType => {
  const context = useContext(ModifiersContext);
  if (context === undefined) {
    throw new Error('useModifiers must be used within a ModifiersProvider');
  }
  return context;
};
