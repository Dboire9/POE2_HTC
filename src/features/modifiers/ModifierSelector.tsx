import React, { useEffect } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import ModifierList from './ModifierList';
import SelectionCounter from './SelectionCounter';
import { Spinner } from '../../components/ui/spinner';

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

  // Load modifiers when item is selected
  useEffect(() => {
    if (selectedItem) {
      loadModifiers(selectedItem.id);
    }
  }, [selectedItem, loadModifiers]);

  // Show message if no item selected
  if (!selectedItem) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select an item first
      </div>
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => loadModifiers(selectedItem.id)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
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

      {/* Prefixes List */}
      <ModifierList
        title="Prefixes"
        modifiers={prefixes}
        selectedModifiers={selectedPrefixes}
        onSelect={selectModifier}
        onDeselect={deselectModifier}
        isModifierDisabled={isModifierDisabled}
      />

      {/* Suffixes List */}
      <ModifierList
        title="Suffixes"
        modifiers={suffixes}
        selectedModifiers={selectedSuffixes}
        onSelect={selectModifier}
        onDeselect={deselectModifier}
        isModifierDisabled={isModifierDisabled}
      />
    </div>
  );
};

export default ModifierSelector;
