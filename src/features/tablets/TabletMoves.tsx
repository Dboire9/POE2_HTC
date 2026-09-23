import React from 'react';
import { cn } from '../../lib/utils';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engineTypes';

const WORDS = ['no', 'one', 'two'];
const count = (n: number, one: string): string => `${WORDS[n] ?? n} ${one}${n > 1 ? 'es' : ''}`;
const RANK = { normal: 0, magic: 1, rare: 2 } as const;

/** "Rare · Rituals rerolled # times, and one prefix + one suffix you did not ask for". */
function tabletOf(n: EnginePolicyNode): string {
  if (n.isStart && n.rarity === 'normal') return 'A plain tablet';
  const kind = n.rarity === 'magic' ? 'Magic' : n.rarity === 'rare' ? 'Rare' : 'Normal';
  const junk = n.junkPrefixes + n.junkSuffixes === 0 ? ''
    : [n.junkPrefixes ? count(n.junkPrefixes, 'prefix') : '', n.junkSuffixes ? count(n.junkSuffixes, 'suffix') : ''].filter(Boolean).join(' + ');
  const held = n.present.map((m) => m.text).join(' + ');
  const parts = [held, junk && (held ? `${junk} you did not ask for` : `${junk}, none of them wanted`)].filter(Boolean);
  return `${kind} · ${parts.join(', and ') || 'nothing on it'}`;
}

/**
 * "What do I do with THIS one?" — every tablet the plan can leave in your hands, and its next move.
 *
 * The route above follows the crafts that go well, so it never said what to do with the rest (Dorian,
 * 2026-09-23: "what do I do with the ones that have only 1 prefix and are magic, and the rare with 1 prefix
 * 1 suffix?"). The solved policy has an answer for every state it reaches; this is that, as a lookup: the
 * tablet, the next orb — or stop, when the plan would start a fresh one — and what finishing still costs.
 * A tablet the plan stops on is not worthless: it can still be run or sold; the plan just counts it at nothing.
 */
export const TabletMoves: React.FC<{
  markov: EngineMarkovResult;
  startName: string;
  fmt: (ex: number) => string;
}> = ({ markov, startName, fmt }) => {
  const seen = new Set<string>();
  const rows = markov.nodes
    .filter((n) => !n.isGoal && !n.isRestart && n.action)
    .map((n) => ({ n, tablet: tabletOf(n) }))
    .filter(({ tablet }) => (seen.has(tablet) ? false : (seen.add(tablet), true)))
    .sort((a, b) => RANK[a.n.rarity] - RANK[b.n.rarity] || b.n.present.length - a.n.present.length
      || (a.n.junkPrefixes + a.n.junkSuffixes) - (b.n.junkPrefixes + b.n.junkSuffixes) || a.tablet.localeCompare(b.tablet));
  if (rows.length === 0) return null;
  return (
    <details open className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
      <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        What to do with each tablet
      </summary>
      <p className="mt-2 text-xs text-muted-foreground">
        Whatever a roll leaves you holding, the plan’s next move for it. <strong>Stop</strong> means the plan starts a fresh
        tablet instead — this one can still be run or sold; the plan simply counts it at nothing.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-1 font-normal">You hold</th>
              <th className="pb-1 font-normal">Next</th>
              <th className="pb-1 text-right font-normal" title="What finishing from here still costs, on average">Still to spend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ n, tablet }) => {
              const stop = n.action === 'Start over with a new base';
              return (
                <tr key={n.key} className="border-t border-border/60">
                  <td className="py-1 pr-3">{tablet}</td>
                  <td className={cn('py-1 pr-3 font-medium', stop ? 'text-amber-300' : 'text-primary')}>
                    {stop ? `Stop — run or sell it, start a new ${startName.toLowerCase()}` : n.action}
                  </td>
                  <td className="py-1 text-right tabular-nums text-muted-foreground">{stop ? '—' : fmt(n.expectedCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
};
