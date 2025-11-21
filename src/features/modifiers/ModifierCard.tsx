import React from 'react';
import { Modifier } from '../../types';
import { Card } from '../../components/ui/card';
import { Tooltip } from '../../components/ui/tooltip';
import { cn } from '../../lib/utils';

interface ModifierCardProps {
  modifier: Modifier;
  selected: boolean;
  disabled: boolean;
  onClick: (modifier: Modifier) => void;
}

// T029: Individual modifier with tooltip for disabled state
const ModifierCard: React.FC<ModifierCardProps> = ({ 
  modifier, 
  selected, 
  disabled, 
  onClick 
}) => {
  const content = (
    <Card
      className={cn(
        'cursor-pointer transition-all p-3',
        selected && 'border-primary ring-2 ring-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && !selected && 'hover:border-primary/50 hover:shadow-sm'
      )}
      onClick={() => !disabled && onClick(modifier)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium flex-1">{modifier.text}</p>
          <span className="text-xs text-muted-foreground font-mono">
            T{modifier.tier}
          </span>
        </div>
        
        {modifier.statRanges.length > 0 && (
          <div className="space-y-1">
            {modifier.statRanges.map((range, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">
                {range.stat}: {range.min}-{range.max}
              </div>
            ))}
          </div>
        )}

        {modifier.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {modifier.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  // T030: Add tooltip explaining why modifiers are disabled
  if (disabled) {
    return (
      <Tooltip content="Incompatible with selected modifiers">
        {content}
      </Tooltip>
    );
  }

  return content;
};

// T033: Wrap with React.memo() using custom equality for complex props
export default React.memo(ModifierCard, (prevProps, nextProps) => {
  return (
    prevProps.modifier.id === nextProps.modifier.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.disabled === nextProps.disabled
  );
});
