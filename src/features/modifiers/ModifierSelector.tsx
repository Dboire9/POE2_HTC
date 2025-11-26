import React, { useEffect } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import ExistingModsPanel from './ExistingModsPanel';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { RotateCcw } from 'lucide-react';

// T032: Main modifier selection component
const ModifierSelector: React.FC = () => {
  const { selectedItem } = useItems();
  const {
    loading,
    error,
    loadModifiers,
    sourceFilter,
    setSourceFilter,
    clearSelections,
    clearExistingMods,
  } = useModifiers();

  // Load modifiers when item is selected
  useEffect(() => {
    if (selectedItem) {
      loadModifiers(selectedItem.id, selectedItem.subcategory);
    }
  }, [selectedItem, loadModifiers]);

  const handleClearAll = () => {
    clearSelections();
    clearExistingMods();
    setSourceFilter('all');
  };

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
    <div className="space-y-3">
      <Card>
        <h2 className="text-lg font-bold">Select Modifiers</h2>
      </Card>

      {/* ExistingModsPanel now handles mode selection and filter controls internally */}
      <ExistingModsPanel 
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        onClearAll={handleClearAll}
      />
    </div>
  );
};

export default ModifierSelector;
