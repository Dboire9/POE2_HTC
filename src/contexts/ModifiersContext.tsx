import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Modifier, ModifierExclusion, ModifiersState, ModifiersActions } from '../types';
import { buildExclusionMap, isModifierDisabled as checkModifierDisabled } from '../lib/modifierValidation';
import { ErrorCode, getErrorMessage } from '../lib/errorMessages';
import { toast } from 'sonner';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : 'https://api.poe2htc.com';

// Context type combining state and actions
type ModifiersContextType = ModifiersState & ModifiersActions;

const ModifiersContext = createContext<ModifiersContextType | undefined>(undefined);

// Provider component (T020)
export const ModifiersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefixes, setPrefixes] = useState<Modifier[]>([]);
  const [suffixes, setSuffixes] = useState<Modifier[]>([]);
  const [selectedPrefixes, setSelectedPrefixes] = useState<Modifier[]>([]);
  const [selectedSuffixes, setSelectedSuffixes] = useState<Modifier[]>([]);
  const [existingPrefixes, setExistingPrefixes] = useState<Modifier[]>([]);
  const [existingSuffixes, setExistingSuffixes] = useState<Modifier[]>([]);
  const [itemRarity, setItemRarity] = useState<'magic' | 'rare'>('rare');
  const [exclusionRules, setExclusionRules] = useState<ModifierExclusion[]>([]);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'normal' | 'perfect' | 'desecrated'>('all');
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
      let url = `${API_BASE_URL}/modifiers?itemId=${itemId}`;
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
          tierDetails: mod.tierDetails || [],  // Tier details with values
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
          // Filter out normal essences (not perfect)
          if (mod.source === 'essence') {
            continue;
          }
          
          const key = `${mod.name || mod.text}-${mod.source || 'normal'}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(transformModifier(mod, type));
          }
        }
        
        return unique;
      };

      const transformedPrefixes = deduplicateModifiers(response.prefixes || [], 'prefix');
      const transformedSuffixes = deduplicateModifiers(response.suffixes || [], 'suffix');
      
      setPrefixes(transformedPrefixes);
      setSuffixes(transformedSuffixes);
      setExclusionRules(response.exclusions || []);
      
      // Clear selections when loading new modifiers
      setSelectedPrefixes([]);
      setSelectedSuffixes([]);
      setExistingPrefixes([]);
      setExistingSuffixes([]);
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

        // Check for family conflicts with already selected modifiers of same type
        if (modifier.id) {
          const conflictingModifier = currentPrefixes.find(m => m.id === modifier.id);
          if (conflictingModifier) {
            // Use setTimeout to avoid toast being called during render
            setTimeout(() => {
              toast.error('Modifier Family Conflict', {
                description: `Cannot select "${modifier.text}"\n\nIt shares the same family with:\n• "${conflictingModifier.text}"\n(family: ${modifier.id})`,
                duration: 10000,
              });
            }, 0);
            return currentPrefixes;
          }
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
        // Always store the full, unfiltered tierDetails for summary lookup
        const modifierWithTier = {
          ...modifier,
          tier: tier !== undefined ? tier : modifier.tier,
          tierDetails: modifier.tierDetails && modifier.tierDetails.length && modifier.tierDetails[0].originalTier
            ? modifier.tierDetails // already unfiltered
            : (prefixes.find(m => m.text === modifier.text)?.tierDetails || modifier.tierDetails)
        };
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

        // Check for family conflicts with already selected modifiers of same type
        if (modifier.id) {
          const conflictingModifier = currentSuffixes.find(m => m.id === modifier.id);
          if (conflictingModifier) {
            // Use setTimeout to avoid toast being called during render
            setTimeout(() => {
              toast.error('Modifier Family Conflict', {
                description: `Cannot select "${modifier.text}"\n\nIt shares the same family with:\n• "${conflictingModifier.text}"\n(family: ${modifier.id})`,
                duration: 10000,
              });
            }, 0);
            return currentSuffixes;
          }
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
        // Always store the full, unfiltered tierDetails for summary lookup
        const modifierWithTier = {
          ...modifier,
          tier: tier !== undefined ? tier : modifier.tier,
          tierDetails: modifier.tierDetails && modifier.tierDetails.length && modifier.tierDetails[0].originalTier
            ? modifier.tierDetails // already unfiltered
            : (suffixes.find(m => m.text === modifier.text)?.tierDetails || modifier.tierDetails)
        };
        return [...currentSuffixes, modifierWithTier];
      });
    }
  }, []);

  // T024: Deselect modifier (uses text for unique identification)
  const deselectModifier = useCallback((modifierText: string) => {
    setSelectedPrefixes(prev => prev.filter(m => m.text !== modifierText));
    setSelectedSuffixes(prev => prev.filter(m => m.text !== modifierText));
  }, []);

  // T025: Check if modifier is disabled due to incompatibility
  const isModifierDisabled = useCallback((modifierId: string) => {
    // Include both selected target mods AND existing mods when checking conflicts
    const allSelected = [...selectedPrefixes, ...selectedSuffixes, ...existingPrefixes, ...existingSuffixes];
    return checkModifierDisabled(modifierId, allSelected, exclusionMap);
  }, [selectedPrefixes, selectedSuffixes, existingPrefixes, existingSuffixes, exclusionMap]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedPrefixes([]);
    setSelectedSuffixes([]);
  }, []);

  // Mark a modifier as existing on the item
  const markAsExisting = useCallback((modifier: Modifier, tier?: number) => {
    const isPrefix = modifier.type === 'prefix';
    const modifierWithTier = { ...modifier, tier: tier !== undefined ? tier : modifier.tier, isExisting: true };
    
    if (isPrefix) {
      setExistingPrefixes(current => {
        // Check if already marked as existing
        const existingIndex = current.findIndex(m => m.text === modifier.text);
        if (existingIndex !== -1) {
          // Update tier if already exists
          const updated = [...current];
          updated[existingIndex] = modifierWithTier;
          return updated;
        }
        
        // Check limit (max 3 prefixes)
        if (current.length >= 3) {
          toast.warning('Maximum 3 existing prefixes', {
            description: 'Remove one to add another',
            duration: 3000,
          });
          return current;
        }
        
        return [...current, modifierWithTier];
      });
    } else {
      setExistingSuffixes(current => {
        // Check if already marked as existing
        const existingIndex = current.findIndex(m => m.text === modifier.text);
        if (existingIndex !== -1) {
          // Update tier if already exists
          const updated = [...current];
          updated[existingIndex] = modifierWithTier;
          return updated;
        }
        
        // Check limit (max 3 suffixes)
        if (current.length >= 3) {
          toast.warning('Maximum 3 existing suffixes', {
            description: 'Remove one to add another',
            duration: 3000,
          });
          return current;
        }
        
        return [...current, modifierWithTier];
      });
    }
  }, []);

  // Unmark a modifier as existing
  const unmarkAsExisting = useCallback((modifierId: string) => {
    setExistingPrefixes(current => current.filter(m => m.text !== modifierId));
    setExistingSuffixes(current => current.filter(m => m.text !== modifierId));
  }, []);

  // Clear all existing mods
  const clearExistingMods = useCallback(() => {
    setExistingPrefixes([]);
    setExistingSuffixes([]);
  }, []);

  // Filter modifiers by source
  const filteredPrefixes = useMemo(() => {
    if (sourceFilter === 'all') return prefixes;
    return prefixes.filter(mod => mod.source === sourceFilter);
  }, [prefixes, sourceFilter]);

  const filteredSuffixes = useMemo(() => {
    if (sourceFilter === 'all') return suffixes;
    return suffixes.filter(mod => mod.source === sourceFilter);
  }, [suffixes, sourceFilter]);

  const value: ModifiersContextType = {
    // State
    prefixes: filteredPrefixes,
    suffixes: filteredSuffixes,
    selectedPrefixes,
    selectedSuffixes,
    existingPrefixes,
    existingSuffixes,
    itemRarity,
    exclusionRules,
    sourceFilter,
    loading,
    error,
    // Actions
    loadModifiers,
    selectModifier,
    deselectModifier,
    isModifierDisabled,
    clearSelections,
    markAsExisting,
    unmarkAsExisting,
    clearExistingMods,
    setItemRarity,
    setSourceFilter,
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