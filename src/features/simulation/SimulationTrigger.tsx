import React from 'react';
import { useItems } from '../../contexts/ItemsContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import { useSimulation } from '../../contexts/SimulationContext';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

// T046: Button component that triggers simulation
const SimulationTrigger: React.FC = () => {
  const { selectedItem } = useItems();
  const { 
    selectedPrefixes, 
    selectedSuffixes, 
    existingPrefixes, 
    existingSuffixes,
    itemRarity
  } = useModifiers();
  const { loading, startSimulation } = useSimulation();

  const selectedModifiers = [...selectedPrefixes, ...selectedSuffixes];
  const existingModifiers = [...existingPrefixes, ...existingSuffixes];
  
  // T050, T060: Validation - disable if no item or no modifiers selected
  const canSimulate = selectedItem && selectedModifiers.length > 0;

  const handleClick = () => {
    if (!selectedItem || selectedModifiers.length === 0) return;

    // Format itemId with subcategory if present (e.g., "Boots/Boots_int")
    const itemId = selectedItem.subcategory 
      ? `${selectedItem.id}/${selectedItem.subcategory}`
      : selectedItem.id;

    const request: any = {
      itemId,
      modifiers: {
        // Convert 1-based UI tier to 0-based backend tier
        prefixes: selectedPrefixes.map(m => ({ text: m.text, tier: (m.tier || 1) - 1 })),
        suffixes: selectedSuffixes.map(m => ({ text: m.text, tier: (m.tier || 1) - 1 })),
      },
    };

    // Include existing mods if any are specified
    if (existingModifiers.length > 0) {
      request.existingModifiers = {
        prefixes: existingPrefixes.map(m => ({ text: m.text, tier: (m.tier || 1) - 1 })),
        suffixes: existingSuffixes.map(m => ({ text: m.text, tier: (m.tier || 1) - 1 })),
      };
      // Include item rarity when starting from existing item
      request.itemRarity = itemRarity;
    }

    startSimulation(request);
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card">
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
