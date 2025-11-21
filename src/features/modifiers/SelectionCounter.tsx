import React from 'react';
import { Badge } from '../../components/ui/badge';

interface SelectionCounterProps {
  count: number;
  max: number;
  type: 'prefix' | 'suffix';
}

// T028: Badge showing "X/3 selected"
const SelectionCounter: React.FC<SelectionCounterProps> = ({ count, max, type }) => {
  const isAtLimit = count >= max;
  const label = type === 'prefix' ? 'Prefixes' : 'Suffixes';

  return (
    <Badge
      variant={isAtLimit ? 'destructive' : 'secondary'}
      className="font-mono"
    >
      {label}: {count}/{max}
    </Badge>
  );
};

export default SelectionCounter;
