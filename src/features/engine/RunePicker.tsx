import React from 'react';
import { RUNES, type Rune } from '../../../packages/engine/src/runes.ts';

/**
 * Which runes are socketed in the item being crafted.
 *
 * A rune is not a currency the plan spends: it sits in the item and changes what the item may HOLD —
 * Astrid's Creativity a second crafted modifier, Serle's Triumph a fourth suffix. So it belongs beside
 * the base and the item level, with the other facts about the item, rather than among the steps.
 *
 * Only the runes that FIT the base are offered, because that is what the game allows and a list of
 * twelve where two apply would be a worse question. The pool runes ("Can roll Marksman modifiers") are
 * in the table but not yet in the data, so this shows the two that change a limit and says so plainly
 * rather than offering a tick that would do nothing.
 */
const EFFECT: Readonly<Record<string, string>> = {
  'astrids-creativity': 'a second crafted modifier — Essence, Perfect Essence or Alloy',
  'serles-triumph': 'a fourth suffix',
};

const RunePicker: React.FC<{
  /** The base's category, which decides which runes fit it. */
  category: string;
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
}> = ({ category, value, onChange }) => {
  const offered = RUNES.filter((r): r is Rune =>
    EFFECT[r.id] !== undefined && (r.categories.length === 0 || r.categories.includes(category)));
  if (offered.length === 0) return null;

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Runes socketed <span className="font-normal normal-case opacity-70">(optional)</span>
      </legend>
      <div className="flex flex-wrap items-center gap-3">
        {offered.map((r) => (
          <label key={r.id} className="flex items-center gap-1.5 text-sm" title={`Allows ${EFFECT[r.id]}.`}>
            <input
              type="checkbox"
              checked={value.includes(r.id)}
              onChange={() => toggle(r.id)}
              className="h-4 w-4 accent-amber-500"
            />
            <span>{r.name}</span>
            <span className="text-xs text-muted-foreground">— {EFFECT[r.id]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RunePicker;
