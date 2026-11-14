import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { EXAMPLE_CATEGORIES, EXAMPLE_CRAFTS, type ExampleCategory } from '../../lib/exampleCrafts';
import { FOCUS_RING } from './ui';
import type { LabCraft } from './useLabCraft';

// Only the categories that hold a craft get a chip: a chip that opens an empty grid is a dead end.
const CATEGORIES = EXAMPLE_CATEGORIES.filter((c) => EXAMPLE_CRAFTS.some((e) => e.category === c.id));

/** "a Gemling Legionnaire", "an Invoker" — every class name in the streamer data reads as it is spelt. */
const withArticle = (name: string) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;

/**
 * The empty Plan tab's second card: a few crafts to try, each loaded and solved in one click
 * (`tryExample`), so a first visit sees an answer before it learns the picker. Filed by build type, one
 * category shown at a time — the choice is not kept, since the card is gone once a craft is loaded.
 * Gone as soon as the craft has a target — the targets card takes its place.
 */
const ExampleCrafts: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  const [category, setCategory] = useState<ExampleCategory | undefined>(CATEGORIES[0]?.id);
  if (lab.targets.length > 0 || lab.freeSlots > 0) return null;
  return (
    <Card className="p-4 space-y-2">
      <h3 className="text-sm font-bold">Or try one</h3>
      <p className="text-xs text-muted-foreground">
        Pick modifiers above to plan your own craft — or load one of these and see what the app answers.
      </p>
      <div role="group" aria-label="Build type" className="inline-flex flex-wrap rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        {CATEGORIES.map((c) => (
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
    </Card>
  );
};

export default ExampleCrafts;
