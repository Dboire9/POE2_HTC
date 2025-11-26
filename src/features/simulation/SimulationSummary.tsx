import React from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';

const SimulationSummary: React.FC = () => {
  const { selectedItem } = useItems();
  const { selectedPrefixes, selectedSuffixes, existingPrefixes, existingSuffixes } = useModifiers();

  const selectedModifiers = [...selectedPrefixes, ...selectedSuffixes];
  const existingModifiers = [...existingPrefixes, ...existingSuffixes];

  // Only show if there are selected modifiers (ready to simulate or simulated)
  if (selectedModifiers.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h2 className="text-base font-bold mb-3">Ready to Simulate</h2>
      <div className="text-sm text-muted-foreground space-y-1">
        {selectedItem && (
          <div>✓ Item: <span className="font-medium text-foreground">{selectedItem.name.split('\n')[0]}</span></div>
        )}
        {existingModifiers.length > 0 && (
          <div>⚡ Starting with: <span className="font-medium text-orange-500">{existingModifiers.length} existing mod{existingModifiers.length !== 1 ? 's' : ''}</span></div>
        )}
        {selectedModifiers.length > 0 && (
          <div>🎯 Target: <span className="font-medium text-foreground">{selectedModifiers.length} desired mod{selectedModifiers.length !== 1 ? 's' : ''}</span></div>
        )}
      </div>
    </div>
  );
};

export default SimulationSummary;
