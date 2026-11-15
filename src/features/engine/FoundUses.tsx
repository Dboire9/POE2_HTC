import React from 'react';
import type { EngineMarkovResult } from '../../lib/engine';
import { countWords, currencyName } from '../../lib/foundUses';

/**
 * "What you'll use": a plan counted in what drops, as counts — each currency the plan uses and the bases
 * it goes through (`1 + restarts`), every one an average. Never a cost: on the found sheet a cost is a
 * weight, not an amount of any currency.
 */
const FoundUses: React.FC<{ markov: EngineMarkovResult }> = ({ markov }) => {
  const uses = markov.uses;
  if (!uses || markov.restarts === undefined) {
    // Counted only where the result carries a plan known to finish (markovUses.ts).
    return <p className="text-sm text-muted-foreground">The app could not count what this plan uses.</p>;
  }
  const rows = [
    ...uses.filter((u) => u.count > 0).map((u) => ({ name: currencyName(u), count: u.count })),
    { name: 'Bases, counting the one you start with', count: 1 + markov.restarts },
  ];
  return (
    <div className="space-y-1.5">
      <ul aria-label="What you’ll use" className="divide-y divide-border rounded-md border border-border text-sm">
        {rows.map((r) => (
          <li key={r.name} className="flex flex-wrap items-baseline justify-between gap-x-3 px-3 py-1.5">
            <span>{r.name}</span>
            <span className="tabular-nums text-muted-foreground">{countWords(r.count)}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        These are averages over many crafts: one weapon can take more, or fewer.
      </p>
    </div>
  );
};

export default FoundUses;
