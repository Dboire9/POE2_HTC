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
 * twelve where two apply would be a worse question.
 *
 * Two kinds are offered. A LIMIT rune changes what the item may hold; a POOL rune ("Can roll Marksman
 * modifiers") adds its own modifiers to what the base can roll, and ticking one makes them appear in
 * the pickers and in every plan. The Aldur runes are deliberately absent: they convert modifiers that
 * are already there, and the app proposes one itself when the targets call for it, so a tick here
 * would be a second way to say something the plan already says.
 */
const EFFECT: Readonly<Record<string, string>> = {
  'astrids-creativity': 'a second crafted modifier — Essence, Perfect Essence or Alloy',
  'serles-triumph': 'a fourth suffix',
};

/** Title case for a pool's tag: `destruction` -> `Destruction`, as the rune's own text prints it. */
const titled = (tag: string): string => tag.charAt(0).toUpperCase() + tag.slice(1);

/**
 * What ticking this rune allows, in the player's words.
 *
 * Derived for a pool rune rather than written out six more times: the pool's name IS the tag, so a
 * seventh rune would need no copy here — and copy that has to be kept in step with a data table is
 * copy that eventually disagrees with it.
 */
const effectOf = (rune: Rune): string =>
  rune.effect.kind === 'pool' ? `${titled(rune.effect.tag)} modifiers to be rolled on it` : EFFECT[rune.id] ?? '';

const RunePicker: React.FC<{
  /** The base's category, which decides which runes fit it. */
  category: string;
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
}> = ({ category, value, onChange }) => {
  const offered = RUNES.filter((r): r is Rune =>
    r.effect.kind !== 'convert' && (r.categories.length === 0 || r.categories.includes(category)));
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
          <label key={r.id} className="flex items-center gap-1.5 text-sm" title={`Allows ${effectOf(r)}.`}>
            <input
              type="checkbox"
              checked={value.includes(r.id)}
              onChange={() => toggle(r.id)}
              className="h-4 w-4 accent-amber-500"
            />
            <span>{r.name}</span>
            <span className="text-xs text-muted-foreground">— {effectOf(r)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RunePicker;
