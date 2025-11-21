import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useModifiers } from '../../contexts/ModifiersContext';
import { useItems } from '../../contexts/ItemsContext';
import CraftingPathCard from './CraftingPathCard';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

// T049: Main component displaying simulation results
const ResultsDisplay: React.FC = () => {
  const { result, error, clearResults, startSimulation } = useSimulation();
  const { selectedPrefixes, selectedSuffixes, clearSelections } = useModifiers();
  const { selectedItem } = useItems();

  // T061: Display error with recovery actions
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Simulation Failed</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error}</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (selectedItem && (selectedPrefixes.length > 0 || selectedSuffixes.length > 0)) {
                  startSimulation({
                    itemId: selectedItem.id,
                    modifiers: {
                      prefixes: selectedPrefixes.map(m => ({ id: m.id, tier: m.tier || 0 })),
                      suffixes: selectedSuffixes.map(m => ({ id: m.id, tier: m.tier || 0 })),
                    },
                  });
                }
              }}
            >
              Retry Simulation
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                clearResults();
                clearSelections();
              }}
            >
              Reset All
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 px-6 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">
          Results will appear here after simulation
        </p>
      </div>
    );
  }

  if (result.paths.length === 0) {
    return (
      <Alert>
        <AlertTitle>No Path Found</AlertTitle>
        <AlertDescription>
          <p className="mb-3">
            No valid crafting path found for the selected modifiers. This may happen if the modifiers are incompatible or too restrictive.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => clearSelections()}
            >
              Clear Modifiers & Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with result info */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Crafting Paths</h2>
        <div className="text-sm text-muted-foreground">
          Found {result.paths.length} path{result.paths.length !== 1 ? 's' : ''} 
          {' '}({result.computationTime}ms)
        </div>
      </div>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <Alert>
          <AlertDescription>
            {result.warnings.map((warning, idx) => (
              <div key={idx}>{warning}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Paths list (sorted by probability) */}
      <div className="space-y-3">
        {result.paths.map((path, idx) => (
          <CraftingPathCard key={path.id} path={path} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};

// T052: Wrap with React.memo() for performance
export default React.memo(ResultsDisplay);
