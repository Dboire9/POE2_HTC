import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { Spinner } from '../../components/ui/spinner';

// T047: Loading indicator during simulation
const SimulationProgress: React.FC = () => {
  const { loading, progress } = useSimulation();

  if (!loading) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 border border-border rounded-lg bg-card">
      <Spinner size="lg" />
      <h3 className="text-lg font-semibold mt-4">Simulating Crafting Paths...</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Calculating optimal strategies
      </p>
      {progress !== null && progress > 0 && (
        <div className="w-full max-w-xs mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {progress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default SimulationProgress;
