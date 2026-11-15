import React, { useId, useState } from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { EXAMPLE_CATEGORIES, EXAMPLE_CRAFTS, type ExampleCategory } from '../../lib/exampleCrafts';
import { FOCUS_RING } from './ui';
import type { LabCraft } from './useLabCraft';
import StarterRecipes from './StarterRecipes';
import { readFolded, writeFolded } from '../../lib/examplesFold';

// Only the categories that hold a craft get a chip: a chip that opens an empty grid is a dead end.
const CATEGORIES = EXAMPLE_CATEGORIES.filter((c) => EXAMPLE_CRAFTS.some((e) => e.category === c.id));

/** The Starter chip, before the build types: a first weapon from what drops (`StarterRecipes`). */
const STARTER = 'starter';
type Chip = typeof STARTER | ExampleCategory;
const CHIPS: readonly { readonly id: Chip; readonly label: string }[] = [{ id: STARTER, label: 'Starter' }, ...CATEGORIES];

/** "a Gemling Legionnaire", "an Invoker" — every class name in the streamer data reads as it is spelt. */
const withArticle = (name: string) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;

/**
 * The ready crafts, at the TOP of an empty Plan tab: each loaded and solved in one click (`tryExample`,
 * `tryStarter`), so a first visit gets an answer before it meets the base picker and the wall of
 * modifiers under it (moved above them 2026-11-15, the maintainer's call: a beginner who lands on that
 * wall may not stay to try). Filed by chip, one shown at a time — the choice is not kept, since the card
 * is gone once a craft is loaded. Gone as soon as the craft has a target — the targets card takes its
 * place, and the picker comes up to meet it.
 *
 * It opens on Starter (the maintainer's call, 2026-11-14): a first weapon for a player who has never
 * crafted, from currency that drops. Starter is not a build type, so the chips are named for what they
 * hold — crafts to try.
 *
 * **Hide** folds it to one line that opens it again, remembered in the browser (`examplesFold.ts`): it
 * pushes the planner down by about 380 px on a desktop and 580 on a phone, which a player who knows the
 * planner should only have to wave away once.
 */
const ExampleCrafts: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  const [category, setCategory] = useState<Chip>(STARTER);
  const [folded, setFolded] = useState(readFolded);
  const body = useId();
  if (lab.targets.length > 0 || lab.freeSlots > 0) return null;
  const fold = (next: boolean) => { setFolded(next); writeFolded(next); };
  if (folded) {
    return (
      <Card className="px-4 py-2">
        <button
          type="button"
          aria-expanded={false}
          onClick={() => fold(false)}
          className={cn(FOCUS_RING, 'flex w-full flex-wrap items-baseline gap-x-2 text-left')}
        >
          <span className="text-sm font-bold">▸ Crafts to try</span>
          <span className="text-xs text-muted-foreground">a first weapon from what you find, or a ready craft in one click</span>
        </button>
      </Card>
    );
  }
  return (
    <Card id={body} className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold">New here? Start with a ready craft</h3>
        <button
          type="button"
          aria-expanded={true}
          aria-controls={body}
          aria-label="Hide crafts to try"
          onClick={() => fold(true)}
          className={cn(FOCUS_RING, 'shrink-0 rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground')}
        >
          Hide
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Load one in one click and see what the app answers — or hide this and pick your own modifiers below.
      </p>
      <div role="group" aria-label="Crafts to try" className="inline-flex flex-wrap rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
            // FOCUS_RING first: it carries a `rounded-sm` that would otherwise win the merge.
            className={cn(FOCUS_RING, 'rounded px-2.5 py-1', category === c.id ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            {c.label}
          </button>
        ))}
      </div>
      {category === STARTER ? <StarterRecipes lab={lab} /> : (
      <div className="grid gap-2 sm:grid-cols-2">
        {EXAMPLE_CRAFTS.filter((e) => e.category === category).map((e) => (
          <button
            key={e.name}
            type="button"
            onClick={() => lab.tryExample(e.goal)}
            disabled={lab.computing}
            className={cn('rounded-md border border-border px-3 py-2 text-left hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50', FOCUS_RING)}
          >
            <span className="block text-sm font-medium">{e.name}</span>
            <span className="block text-[11px] text-muted-foreground">{e.mods}</span>
            <span className="block text-[11px] text-muted-foreground">From {withArticle(e.build)} build</span>
          </button>
        ))}
      </div>
      )}
    </Card>
  );
};

export default ExampleCrafts;
