import React, { useEffect, useState, useMemo } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import { ModifierSource } from '../../types';
import ModifierList from './ModifierList';
import SelectionCounter from './SelectionCounter';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';

// T032: Main modifier selection component
const ModifierSelector: React.FC = () => {
  const { selectedItem } = useItems();
  const {
    prefixes,
    suffixes,
    selectedPrefixes,
    selectedSuffixes,
    loading,
    error,
    loadModifiers,
    selectModifier,
    deselectModifier,
    isModifierDisabled,
  } = useModifiers();

  // Source filter state
  const [enabledSources, setEnabledSources] = useState<Set<ModifierSource>>(new Set([
    ModifierSource.NORMAL,
    ModifierSource.PERFECT_ESSENCE,
    ModifierSource.DESECRATED,
  ]));

  const toggleSource = (source: ModifierSource) => {
    setEnabledSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  // Filter modifiers by enabled sources
  const filteredPrefixes = useMemo(() => {
    return prefixes.filter(mod => 
      !mod.source || enabledSources.has(mod.source)
    );
  }, [prefixes, enabledSources]);

  const filteredSuffixes = useMemo(() => {
    return suffixes.filter(mod => 
      !mod.source || enabledSources.has(mod.source)
    );
  }, [suffixes, enabledSources]);

  // Load modifiers when item is selected
  useEffect(() => {
    if (selectedItem) {
      loadModifiers(selectedItem.id, selectedItem.subcategory);
    }
  }, [selectedItem, loadModifiers]);

  // T059: Validation check to prevent proceeding without item selection
  if (!selectedItem) {
    return (
      <Alert>
        <AlertTitle>Item Required</AlertTitle>
        <AlertDescription>
          Please select an item from the list above to view available modifiers.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading modifiers...</p>
      </div>
    );
  }

  // T061: Enhanced error display with recovery actions
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to Load Modifiers</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => loadModifiers(selectedItem.id)}
          >
            Retry Loading
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with selection counters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Select Modifiers</h2>
        <div className="flex gap-2">
          <SelectionCounter
            count={selectedPrefixes.length}
            max={3}
            type="prefix"
          />
          <SelectionCounter
            count={selectedSuffixes.length}
            max={3}
            type="suffix"
          />
        </div>
      </div>

      {/* Source Filter */}
      <div className="p-4 border border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold mb-3">Filter by Source</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-normal"
              checked={enabledSources.has(ModifierSource.NORMAL)}
              onCheckedChange={() => toggleSource(ModifierSource.NORMAL)}
            />
            <Label 
              htmlFor="filter-normal"
              className="text-sm cursor-pointer"
            >
              Normal Crafting
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-perfect-essence"
              checked={enabledSources.has(ModifierSource.PERFECT_ESSENCE)}
              onCheckedChange={() => toggleSource(ModifierSource.PERFECT_ESSENCE)}
            />
            <Label 
              htmlFor="filter-perfect-essence"
              className="text-sm cursor-pointer"
            >
              Perfect Essences
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-desecrated"
              checked={enabledSources.has(ModifierSource.DESECRATED)}
              onCheckedChange={() => toggleSource(ModifierSource.DESECRATED)}
            />
            <Label 
              htmlFor="filter-desecrated"
              className="text-sm cursor-pointer"
            >
              Desecrated Currency
            </Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Showing {filteredPrefixes.length + filteredSuffixes.length} of {prefixes.length + suffixes.length} modifiers
        </p>
      </div>

      {/* Selected Modifiers Summary */}
      {(selectedPrefixes.length > 0 || selectedSuffixes.length > 0) && (
        <div className="p-4 border border-border rounded-lg bg-card/50">
          <h3 className="text-sm font-semibold mb-3">Selected for Crafting</h3>
          <div className="space-y-2">
            {selectedPrefixes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Prefixes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPrefixes.map(mod => (
                    <div 
                      key={mod.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-xs"
                    >
                      <span>{mod.text}</span>
                      <span className="text-primary font-mono font-semibold">T{mod.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedSuffixes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Suffixes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSuffixes.map(mod => (
                    <div 
                      key={mod.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-xs"
                    >
                      <span>{mod.text}</span>
                      <span className="text-primary font-mono font-semibold">T{mod.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prefixes List */}
      <ModifierList
        title="Prefixes"
        modifiers={filteredPrefixes}
        selectedModifiers={selectedPrefixes}
        onSelect={selectModifier}
        onDeselect={deselectModifier}
        isModifierDisabled={isModifierDisabled}
      />

      {/* Suffixes List */}
      <ModifierList
        title="Suffixes"
        modifiers={filteredSuffixes}
        selectedModifiers={selectedSuffixes}
        onSelect={selectModifier}
        onDeselect={deselectModifier}
        isModifierDisabled={isModifierDisabled}
      />
    </div>
  );
};

export default ModifierSelector;
