import React from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import { useSimulation } from '../../contexts/SimulationContext';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

// T046: Button component that triggers simulation
const SimulationTrigger: React.FC = () => {
  const { selectedItem } = useItems();
  const { selectedPrefixes, selectedSuffixes } = useModifiers();
  const { loading, startSimulation } = useSimulation();

  const selectedModifiers = [...selectedPrefixes, ...selectedSuffixes];
  
  // T050, T060: Validation - disable if no item or no modifiers selected
  const canSimulate = selectedItem && selectedModifiers.length > 0;

  const handleClick = () => {
    if (!selectedItem || selectedModifiers.length === 0) return;

    startSimulation({
      itemId: selectedItem.id,
      desiredModifiers: selectedModifiers.map(m => m.id),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-border rounded-lg bg-card">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Ready to Simulate</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          {selectedItem && (
            <div>✓ Item: <span className="font-medium">{selectedItem.name}</span></div>
          )}
          {selectedModifiers.length > 0 && (
            <div>✓ Modifiers: <span className="font-medium">{selectedModifiers.length} selected</span></div>
          )}
        </div>
      </div>

      <Button
        onClick={handleClick}
        disabled={!canSimulate || loading}
        size="lg"
        className="w-full"
      >
        {loading ? 'Simulating...' : 'Start Crafting Simulation'}
      </Button>

      {/* T060: Enhanced validation messages */}
      {!canSimulate && (
        <Alert>
          <AlertDescription>
            {!selectedItem && 'Please select an item from the list above.'}
            {selectedItem && selectedModifiers.length === 0 && 'Please select at least one modifier to simulate crafting paths.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SimulationTrigger;
