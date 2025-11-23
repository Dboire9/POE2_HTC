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
  const loadModifiers = useCallback(async (itemId: string, subcategory?: string) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // Direct HTTP API call with optional subcategory
      let url = `http://localhost:8080/api/modifiers?itemId=${itemId}`;
      if (subcategory) {
        url += `&subcategory=${subcategory}`;
      }
      const httpResponse = await fetch(url);
      if (!httpResponse.ok) {
        throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
      }
      response = await httpResponse.json();
      
      if (response.error) {
        throw new Error(response.error.code || ErrorCode.UNKNOWN);
      }

      // Transform backend response to Modifier format
      // Backend sends: {id, name, tiers, source}
      // Frontend expects: {id, text, type, tier, statRanges, tags, source, availableTiers}
      const transformModifier = (mod: any, type: 'prefix' | 'suffix'): Modifier => {
        // All modifiers default to tier 1 (UI value, will be converted to 0 for backend)
        const defaultTier = 1;
        
        // Normalize text: replace newlines with spaces and collapse multiple spaces
        const normalizedText = (mod.name || mod.text || mod.id)
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        return {
          id: mod.id,
          text: normalizedText,
          type,
          tier: defaultTier,
          availableTiers: mod.tiers || 1,  // Total tiers available
          statRanges: mod.statRanges || [],
          tags: mod.tags || [],
          source: mod.source
        };
      };

      // Deduplicate modifiers by text+source combination (text is unique per modifier variant)
      const deduplicateModifiers = (mods: any[], type: 'prefix' | 'suffix'): Modifier[] => {
        const seen = new Set<string>();
        const unique: Modifier[] = [];
        
        for (const mod of mods) {
          const key = `${mod.name || mod.text}-${mod.source || 'normal'}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(transformModifier(mod, type));
          }
        }
        
        return unique;
      };

      setPrefixes(deduplicateModifiers(response.prefixes || [], 'prefix'));
      setSuffixes(deduplicateModifiers(response.suffixes || [], 'suffix'));
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
  const selectModifier = useCallback((modifier: Modifier, tier?: number) => {
    const isPrefix = modifier.type === 'prefix';
    
    // Early family conflict check before state update
    if (modifier.id) {
      const currentSelected = isPrefix ? selectedPrefixes : selectedSuffixes;
      const conflictingModifier = currentSelected.find(m => m.id === modifier.id && m.text !== modifier.text);
      if (conflictingModifier) {
        toast.error('Modifier Family Conflict', {
          description: `Cannot select "${modifier.text}"\n\nIt shares the same family with:\n• "${conflictingModifier.text}"\n(family: ${modifier.id})`,
          duration: 10000,
        });
        return;
      }
    }
    
    // Use functional updates to get the latest state
    if (isPrefix) {
      setSelectedPrefixes(currentPrefixes => {
        // Check if already selected (use text for unique identification)
        const existingIndex = currentPrefixes.findIndex(m => m.text === modifier.text);
        if (existingIndex !== -1) {
          // Update tier if already selected
          if (tier !== undefined) {
            const updated = [...currentPrefixes];
            updated[existingIndex] = { ...updated[existingIndex], tier };
            return updated;
          }
          return currentPrefixes;
        }

        // Check if this is a desecrated modifier
        const isDesecrated = modifier.source === 'desecrated';
        
        if (isDesecrated) {
          // Check if there's already a desecrated modifier in prefixes
          const existingDesecratedIndex = currentPrefixes.findIndex(m => m.source === 'desecrated');
          
          if (existingDesecratedIndex !== -1) {
            // Replace the desecrated prefix
            const modifierWithTier = { ...modifier, tier: tier !== undefined ? tier : modifier.tier };
            const updated = [...currentPrefixes];
            updated[existingDesecratedIndex] = modifierWithTier;
            
            toast.info('Replaced desecrated modifier', {
              description: 'Only one desecrated modifier allowed per item',
              duration: 3000,
            });
            return updated;
          }
          
          // Also check suffixes for desecrated
          setSelectedSuffixes(currentSuffixes => {
            const existingDesecratedInSuffixes = currentSuffixes.findIndex(m => m.source === 'desecrated');
            if (existingDesecratedInSuffixes !== -1) {
              // Remove from suffixes
              const updated = [...currentSuffixes];
              updated.splice(existingDesecratedInSuffixes, 1);
              
              toast.info('Replaced desecrated modifier', {
                description: 'Only one desecrated modifier allowed per item',
                duration: 3000,
              });
              
              return updated;
            }
            return currentSuffixes;
          });
        }

        // Check limit (FR-008)
        if (currentPrefixes.length >= 3) {
          toast.warning('Maximum 3 prefixes selected', {
            description: 'Deselect one to add another',
            duration: 3000,
          });
          return currentPrefixes;
        }

        // Add to selections
        const modifierWithTier = { ...modifier, tier: tier !== undefined ? tier : modifier.tier };
        return [...currentPrefixes, modifierWithTier];
      });
    } else {
      setSelectedSuffixes(currentSuffixes => {
        // Check if already selected (use text for unique identification)
        const existingIndex = currentSuffixes.findIndex(m => m.text === modifier.text);
        if (existingIndex !== -1) {
          // Update tier if already selected
          if (tier !== undefined) {
            const updated = [...currentSuffixes];
            updated[existingIndex] = { ...updated[existingIndex], tier };
            return updated;
          }
          return currentSuffixes;
        }

        // Check if this is a desecrated modifier
        const isDesecrated = modifier.source === 'desecrated';
        
        if (isDesecrated) {
          // Check if there's already a desecrated modifier in suffixes
          const existingDesecratedIndex = currentSuffixes.findIndex(m => m.source === 'desecrated');
          
          if (existingDesecratedIndex !== -1) {
            // Replace the desecrated suffix
            const modifierWithTier = { ...modifier, tier: tier !== undefined ? tier : modifier.tier };
            const updated = [...currentSuffixes];
            updated[existingDesecratedIndex] = modifierWithTier;
            
            toast.info('Replaced desecrated modifier', {
              description: 'Only one desecrated modifier allowed per item',
              duration: 3000,
            });
            return updated;
          }
          
          // Also check prefixes for desecrated
          setSelectedPrefixes(currentPrefixes => {
            const existingDesecratedInPrefixes = currentPrefixes.findIndex(m => m.source === 'desecrated');
            if (existingDesecratedInPrefixes !== -1) {
              // Remove from prefixes
              const updated = [...currentPrefixes];
              updated.splice(existingDesecratedInPrefixes, 1);
              
              toast.info('Replaced desecrated modifier', {
                description: 'Only one desecrated modifier allowed per item',
                duration: 3000,
              });
              
              return updated;
            }
            return currentPrefixes;
          });
        }

        // Check limit (FR-008)
        if (currentSuffixes.length >= 3) {
          toast.warning('Maximum 3 suffixes selected', {
            description: 'Deselect one to add another',
            duration: 3000,
          });
          return currentSuffixes;
        }

        // Add to selections
        const modifierWithTier = { ...modifier, tier: tier !== undefined ? tier : modifier.tier };
        return [...currentSuffixes, modifierWithTier];
      });
    }
  }, [selectedPrefixes, selectedSuffixes]);

  // T024: Deselect modifier (uses text for unique identification)
  const deselectModifier = useCallback((modifierText: string) => {
    setSelectedPrefixes(prev => prev.filter(m => m.text !== modifierText));
    setSelectedSuffixes(prev => prev.filter(m => m.text !== modifierText));
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
