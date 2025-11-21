import React, { useEffect } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import ModifierList from './ModifierList';
import SelectionCounter from './SelectionCounter';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

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
