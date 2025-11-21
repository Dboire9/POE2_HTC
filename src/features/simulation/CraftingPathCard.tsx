import React from 'react';
import { CraftingPath } from '../../types';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface CraftingPathCardProps {
  path: CraftingPath;
  rank: number;
}

// T048: Individual crafting path display with steps
const CraftingPathCard: React.FC<CraftingPathCardProps> = ({ path, rank }) => {
  const probabilityPercent = (path.probability * 100).toFixed(2);
  const isHighProbability = path.probability > 0.5;

  return (
    <Card className="p-4 space-y-3">
      {/* Header with rank and probability */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? 'default' : 'secondary'}>
            #{rank}
          </Badge>
          <span className="text-sm font-medium">
            Success Rate: <span className={isHighProbability ? 'text-green-500' : 'text-yellow-500'}>
              {probabilityPercent}%
            </span>
          </span>
        </div>
      </div>

      {/* Crafting steps */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Steps:</h4>
        <ol className="space-y-2">
          {path.steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground font-mono w-6">{step.order}.</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{step.action}</p>
                  {step.tier && (
                    <Badge variant="outline" className="text-xs">
                      {step.tier}
                    </Badge>
                  )}
                  {step.omen && (
                    <Badge variant="secondary" className="text-xs">
                      {step.omen}
                    </Badge>
                  )}
                  {step.omens && step.omens.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {step.omens.join(', ')}
                    </Badge>
                  )}
                </div>
                {step.targetModifier && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    → {step.targetModifier}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {(step.probability * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Total cost */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Total Cost:</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(path.totalCost).map(([currency, amount]) => (
            <Badge key={currency} variant="outline" className="font-mono">
              {amount}× {currency}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};

// T051: Wrap with React.memo() for performance
export default React.memo(CraftingPathCard);
