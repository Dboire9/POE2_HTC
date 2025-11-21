import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import CraftingPathCard from './CraftingPathCard';
import { Alert, AlertDescription } from '../../components/ui/alert';

// T049: Main component displaying simulation results
const ResultsDisplay: React.FC = () => {
  const { result, error } = useSimulation();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
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
        <AlertDescription>
          No valid crafting path found for the selected modifiers. Try removing one and retrying.
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
