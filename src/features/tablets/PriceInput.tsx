import React from 'react';
import { cn } from '../../lib/utils';
import type { CostUnit } from '../../lib/currency';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * A price as the trade site shows it: a number, and the orb it is listed in. Tablets list in exalts,
 * Chaos or Divine Orbs, so the player picks the one they read rather than converting by hand; the
 * caller turns it into exalts with `perExalt`.
 */
export const PriceInput: React.FC<{
  text: string;
  onText: (text: string) => void;
  unit: CostUnit;
  /** Every unit on offer — `priceUnits(rates)`. */
  units: readonly CostUnit[];
  onUnit: (unit: CostUnit) => void;
  /** Names the number for a screen reader; the unit menu is named after it. */
  label: string;
  onBlur?: () => void;
  invalid?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md';
}> = ({ text, onText, unit, units, onUnit, label, onBlur, invalid = false, placeholder, size = 'sm' }) => {
  const box = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  return (
    <span className="inline-flex items-center">
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={text}
        onChange={(e) => onText(e.target.value)}
        {...(onBlur ? { onBlur } : {})}
        {...(placeholder ? { placeholder } : {})}
        aria-invalid={invalid}
        className={cn(
          'rounded-l border bg-background tabular-nums', size === 'sm' ? 'w-16' : 'w-20', box,
          invalid ? 'border-amber-500' : 'border-border', FOCUS,
        )}
      />
      <select
        aria-label={`${label}: unit`}
        value={unit.key}
        onChange={(e) => onUnit(units.find((u) => u.key === e.target.value) ?? unit)}
        className={cn('rounded-r border border-l-0 border-border bg-muted text-muted-foreground', box, FOCUS)}
      >
        {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
      </select>
    </span>
  );
};
