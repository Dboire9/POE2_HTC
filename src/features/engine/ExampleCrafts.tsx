import React from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { EXAMPLE_CRAFTS } from '../../lib/exampleCrafts';
import { FOCUS_RING } from './ui';
import type { LabCraft } from './useLabCraft';

/**
 * The empty Plan tab's second card: a few crafts to try, each loaded and solved in one click
 * (`tryExample`), so a first visit sees an answer before it learns the picker. Gone as soon as the
 * craft has a target — the targets card takes its place.
 */
const ExampleCrafts: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  if (lab.targets.length > 0 || lab.freeSlots > 0) return null;
  return (
    <Card className="p-4 space-y-2">
      <h3 className="text-sm font-bold">Or try one</h3>
      <p className="text-xs text-muted-foreground">
        Pick modifiers above to plan your own craft — or load one of these and see what the app answers.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {EXAMPLE_CRAFTS.map((e) => (
          <button
            key={e.name}
            type="button"
            onClick={() => lab.tryExample(e.goal)}
            disabled={lab.computing}
            className={cn('rounded-md border border-border px-3 py-2 text-left hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50', FOCUS_RING)}
          >
            <span className="block text-sm font-medium">{e.name}</span>
            <span className="block text-[11px] text-muted-foreground">{e.mods}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ExampleCrafts;
