import React, { useState } from 'react';
import { Modifier, ModifierSource } from '../../types';
import { Card } from '../../components/ui/card';
import { Tooltip } from '../../components/ui/tooltip';
import { Select } from '../../components/ui/select';
import { cn } from '../../lib/utils';

interface ModifierCardProps {
  modifier: Modifier;
  selected: boolean;
  disabled: boolean;
  onClick: (modifier: Modifier, tier?: number) => void;
  selectedTier?: number;
  availableTiers?: number;
}

// Helper to get source badge styling
const getSourceBadge = (source?: ModifierSource) => {
  if (!source) return null;
  
  const badges = {
    [ModifierSource.NORMAL]: { label: 'Normal', className: 'bg-gray-100 text-gray-700' },
    [ModifierSource.ESSENCE]: { label: 'Essence', className: 'bg-purple-100 text-purple-700' },
    [ModifierSource.PERFECT_ESSENCE]: { label: 'Perfect', className: 'bg-yellow-100 text-yellow-700' },
    [ModifierSource.DESECRATED]: { label: 'Desecrated', className: 'bg-red-100 text-red-700' },
  };
  
  return badges[source];
};

// T029: Individual modifier with tooltip for disabled state
const ModifierCard: React.FC<ModifierCardProps> = ({ 
  modifier, 
  selected, 
  disabled, 
  onClick,
  selectedTier,
  availableTiers = 1
}) => {
  // Use selectedTier if provided (when selected), otherwise use modifier's default tier
  const [tier, setTier] = useState(selectedTier || modifier.tier || 1);
  const sourceBadge = getSourceBadge(modifier.source);
  
  // Update local tier state when selectedTier changes (sync with context)
  React.useEffect(() => {
    if (selectedTier !== undefined) {
      setTier(selectedTier);
    }
  }, [selectedTier]);
  
  const handleTierChange = (newTier: number) => {
    setTier(newTier);
    if (selected) {
      onClick(modifier, newTier);
    }
  };
  
  const handleCardClick = () => {
    if (!disabled) {
      onClick(modifier, tier);
    }
  };
  
  const content = (
    <Card
      className={cn(
        'cursor-pointer transition-all p-3',
        selected && 'border-primary ring-2 ring-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && !selected && 'hover:border-primary/50 hover:shadow-sm'
      )}
      onClick={handleCardClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{modifier.text}</p>
            {sourceBadge && (
              <span className={cn(
                'inline-block mt-1 text-xs px-1.5 py-0.5 rounded font-medium',
                sourceBadge.className
              )}>
                {sourceBadge.label}
              </span>
            )}
          </div>
          {availableTiers > 1 && (
            <select
              value={tier}
              onChange={(e) => {
                e.stopPropagation();
                handleTierChange(Number(e.target.value));
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted cursor-pointer"
              disabled={disabled}
            >
              {Array.from({ length: availableTiers }, (_, i) => i + 1).map(t => (
                <option key={t} value={t}>Tier {t}</option>
              ))}
            </select>
          )}
        </div>
        
        {modifier.statRanges && modifier.statRanges.length > 0 && (
          <div className="space-y-1">
            {modifier.statRanges.map((range, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">
                {range.stat}: {range.min}-{range.max}
              </div>
            ))}
          </div>
        )}

        {modifier.tags && modifier.tags.length > 0 && (
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
