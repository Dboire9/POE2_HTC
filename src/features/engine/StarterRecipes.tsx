import React, { useId, useState } from 'react';
import { cn } from '../../lib/utils';
import { STARTER_RECIPES, modWords, targetsAt, type StarterRecipe } from '../../lib/starterRecipes';
import { STOP_LINE } from '../../lib/foundUses';
import { FOCUS_RING, selectCls } from './ui';
import type { LabCraft } from './useLabCraft';

/** The highest item level any recipe is offered at: above it, the build-type crafts are the ones to try. */
const LAST_LEVEL = Math.max(...STARTER_RECIPES.map((r) => r.levels.to));
/**
 * The level the panel shows until the player types theirs, when the Lab's own is above every recipe (it
 * defaults to 82, for endgame crafts): the first level at which EVERY recipe is offered, so a first visit
 * sees them all. Only shown — the Lab's level changes when the player types one or loads a recipe.
 */
const START_LEVEL = Math.max(...STARTER_RECIPES.map((r) => r.levels.from));

/** The weapons in list order, each with its recipes (the easy one first, as the list keeps them). */
const WEAPONS: readonly { readonly weapon: string; readonly recipes: readonly StarterRecipe[] }[] = (() => {
  const by = new Map<string, StarterRecipe[]>();
  for (const r of STARTER_RECIPES) by.set(r.weapon, [...(by.get(r.weapon) ?? []), r]);
  return [...by].map(([weapon, recipes]) => ({ weapon, recipes }));
})();
const GRADE_LABEL: Record<StarterRecipe['grade'], string> = { easy: 'Easy', better: 'Better' };

/** "Uses 1–7 bases on average" — the recipe's measured range (`StarterRecipe.bases`). */
const basesLine = ({ from, to }: StarterRecipe['bases']): string =>
  `Uses ${from === to ? from : `${from}–${to}`} base${to === 1 ? '' : 's'} on average`;

/** Why a recipe cannot be loaded at `level`, or null when it can. */
const whyNot = (r: StarterRecipe, level: number, offered: boolean): string | null =>
  level < r.levels.from ? `From item level ${r.levels.from}`
    : level > r.levels.to ? `Up to item level ${r.levels.to}`
      : offered ? null : 'Not offered at this item level';

/**
 * The Starter chip's panel: a first weapon crafted from currency that drops, on a white base the player
 * found (`STARTER_RECIPES`). The player types the base's item level and picks a weapon; that weapon's
 * recipes show, each one button that loads it at that level and solves it counted in what drops
 * (`tryStarter`, `priceBasis: 'found'`). A recipe the level cannot have is shown, disabled, with the level
 * it needs.
 *
 * One weapon at a time: all nine, up to two recipes each, ran to about 2,400 px on a phone (2026-11-15),
 * and a player looking for a first Bow reads past eight weapons they do not use. The pick is the panel's
 * own state, not saved: the card is gone once a recipe is loaded.
 */
const StarterRecipes: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  // What the player typed, as typed — until then the Lab's level when a recipe can use it, else
  // START_LEVEL. Typing writes the Lab's level too: it is the same field, for the craft about to load.
  const [typed, setTyped] = useState<string | null>(null);
  const [weapon, setWeapon] = useState(WEAPONS[0]!.weapon);
  const weaponLabel = useId();
  const recipes = WEAPONS.find((w) => w.weapon === weapon)?.recipes ?? [];
  const shown = typed ?? String(lab.level <= LAST_LEVEL ? lab.level : START_LEVEL);
  const n = Number(shown);
  const level = shown.trim() !== '' && Number.isInteger(n) && n >= 1 && n <= 100 ? n : null;
  const data = lab.data;
  const words = (id: string): string => modWords(data?.mods.get(id)?.text ?? id);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        A first weapon you can make from currency you find — no trading. Find a white (Normal) base of the
        weapon, type its item level, pick your weapon and a recipe. The plan is worked out on what drops,
        not on trade prices.
      </p>
      <label className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item level of your base</span>
        <input
          type="number" inputMode="numeric" min={1} max={100} value={shown}
          onChange={(e) => {
            setTyped(e.target.value);
            const v = Number(e.target.value);
            if (e.target.value.trim() !== '' && Number.isInteger(v) && v >= 1 && v <= 100) lab.setLevel(v);
          }}
          className={`${selectCls} w-20`}
        />
      </label>
      {/* No line on where the game shows an item level: nothing in the app explains it yet, and a game
          fact it cannot point to is not one to state. */}
      <p className="text-xs font-medium">{STOP_LINE}</p>
      {level === null ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">Type the item level of your base, from 1 to 100.</p>
      ) : level > LAST_LEVEL && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          No starter recipe goes above item level {LAST_LEVEL}. For a base this high, pick a build type above.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span id={weaponLabel} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your weapon</span>
        <div role="group" aria-labelledby={weaponLabel} className="inline-flex flex-wrap rounded-md border border-border bg-muted/40 p-0.5 text-sm">
          {WEAPONS.map((w) => (
            <button
              key={w.weapon}
              type="button"
              aria-pressed={weapon === w.weapon}
              onClick={() => setWeapon(w.weapon)}
              // FOCUS_RING first: it carries a `rounded-sm` that would otherwise win the merge.
              className={cn(FOCUS_RING, 'rounded px-2.5 py-1', weapon === w.weapon ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              {w.weapon}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recipes.map((r) => {
          const at = level === null || !data ? null : targetsAt(data, r, level);
          const reason = level === null ? 'Type an item level first' : whyNot(r, level, at !== null);
          return (
            <button
              key={r.name}
              type="button"
              disabled={reason !== null || lab.computing}
              onClick={() => { if (level !== null) lab.tryStarter(r, level); }}
              className={cn('block w-full rounded-md border border-border px-3 py-2 text-left hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent', FOCUS_RING)}
            >
              {/* A space between every line, as a text node of the button's own: the lines are its
                  name too, and without one a screen reader hears "A hard-hitting BowEasyAdds…". */}
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium">{r.name}</span>
                {recipes.length > 1 && ' '}
                {recipes.length > 1 && (
                  <span className={cn('rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide', r.grade === 'easy' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300')}>
                    {GRADE_LABEL[r.grade]}
                  </span>
                )}
              </span>
              {r.slots.map((s, i) => (
                <React.Fragment key={s.words}>
                  {' '}
                  <span className="block text-[11px] text-muted-foreground">
                    {i > 0 && 'and '}
                    {s.modIds.length === 1 ? s.words : <>{i > 0 ? 'any' : 'Any'} one of: {s.modIds.map(words).join(' · ')}</>}
                  </span>
                </React.Fragment>
              ))}
              {' '}<span className="block text-[11px] text-muted-foreground">{basesLine(r.bases)}</span>
              {reason !== null && <>{' '}<span className="block text-[11px] text-amber-700 dark:text-amber-300">{reason}</span></>}
              {/* Never inside a recipe's offered levels on the shipped data (measured 2026-11-15, item
                  levels 1–100), but `targetsAt` can drop one, and the player would be owed why. */}
              {reason === null && at !== null && at.dropped.length > 0 && (<>
                {' '}
                <span className="block text-[11px] text-amber-700 dark:text-amber-300">
                  Item level {level} cannot roll {at.dropped.map(words).join(' or ')} yet, so it is left out.
                </span>
              </>)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StarterRecipes;
