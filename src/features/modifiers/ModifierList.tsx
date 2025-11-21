import React from 'react';
import { Modifier } from '../../types';
import ModifierCard from './ModifierCard';

interface ModifierListProps {
  title: string;
  modifiers: Modifier[];
  selectedModifiers: Modifier[];
  onSelect: (modifier: Modifier) => void;
  onDeselect: (modifierId: string) => void;
  isModifierDisabled: (modifierId: string) => boolean;
}

// T031: Scrollable list with sections (Prefixes/Suffixes)
const ModifierList: React.FC<ModifierListProps> = ({
  title,
  modifiers,
  selectedModifiers,
  onSelect,
  onDeselect,
  isModifierDisabled,
}) => {
  if (modifiers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No {title.toLowerCase()} available
      </div>
    );
  }

  const handleClick = (modifier: Modifier) => {
    const isSelected = selectedModifiers.some(m => m.id === modifier.id);
    if (isSelected) {
      onDeselect(modifier.id);
    } else {
      onSelect(modifier);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {modifiers.map((modifier) => (
          <ModifierCard
            key={modifier.id}
            modifier={modifier}
            selected={selectedModifiers.some(m => m.id === modifier.id)}
            disabled={isModifierDisabled(modifier.id)}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
};

// T034: Wrap with React.memo() for performance
export default React.memo(ModifierList);
