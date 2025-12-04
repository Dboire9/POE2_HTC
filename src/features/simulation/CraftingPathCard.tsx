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
  
  // Check if this path uses perfect essence replacements (CHANGED events)
  const hasPerfectEssence = path.steps.some(step => step.eventType === 'CHANGED');

  return (
    <Card className="p-4 space-y-3 relative">
      {/* Perfect essence indicator in top right corner */}
      {hasPerfectEssence && (
        <div className="absolute top-3 right-3 z-10 text-red-600 dark:text-red-400 font-semibold text-xs">
          The normal modifiers that are changed by perfect essences have a 100% probability as they will be removed
        </div>
      )}
      
      {/* Header with rank and probability */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? 'default' : 'secondary'}>
            #{rank}
          </Badge>
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
                  <div className="text-xs mt-0.5 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {step.eventType && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0 ${
                            step.eventType === 'ADDED' 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' 
                              : step.eventType === 'REMOVED'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {step.eventType === 'ADDED' ? '✚' : step.eventType === 'REMOVED' ? '✖' : '↻'}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">{step.targetModifier}</span>
                      {step.modifierType && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0 ${
                            step.modifierType === 'PREFIX' 
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' 
                              : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                          }`}
                        >
                          {step.modifierType === 'PREFIX' ? 'P' : 'S'}
                        </Badge>
                      )}
                    </div>
                    {step.eventType === 'CHANGED' && step.replacedModifier && (
                      <div className="flex items-center gap-1.5 flex-wrap pl-4">
                        <span className="text-xs text-red-400">← replaced:</span>
                        <span className="text-xs text-muted-foreground line-through">{step.replacedModifier}</span>
                        {step.replacedModifierType && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1.5 py-0 ${
                              step.replacedModifierType === 'PREFIX' 
                                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' 
                                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {step.replacedModifierType === 'PREFIX' ? 'P' : 'S'}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {Math.min(step.probability * 100, 100).toFixed(1)}%
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
};

// T051: Wrap with React.memo() for performance
export default React.memo(CraftingPathCard);
