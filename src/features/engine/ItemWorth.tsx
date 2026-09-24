import React from 'react';
import type { EngineMarkovResult } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit, type Rates } from '../../lib/currency';

/**
 * What the item you are holding is actually worth to this craft.
 *
 * "I have four of the six, I just need two more" feels two-thirds done. Measured on a 6-target T2
 * Wand it is **4.4%** — the last mod alone is 53% of the craft and the first three together are 0.27%
 * of it (docs/validation.md, 2026-09-03). Cost is back-loaded because every mod added leaves fewer
 * open slots for the next one to land in, while a miss then needs an Annulment that picks uniformly
 * and can take what was banked. Nothing on screen said this, and counting mods invites exactly the
 * wrong conclusion, so the panel says it in currency.
 *
 * The comparison is free: `bareCost` is a value the solve already computed for another state in the
 * same lattice, not a second solve.
 *
 * Three things it refuses to do:
 *  - **Claim a figure it cannot stand behind.** Shown only when `bound` is `exact`. Both numbers come
 *    from one solve, so when that solve ran out of clock they are two floors on values still climbing
 *    and their DIFFERENCE is not a bound on anything.
 *  - **Assume progress is positive.** A dirty item costs more than a clean one because the junk has to
 *    come off, and that is worth saying plainly rather than rendering as a negative percentage.
 *  - **State the obvious.** A bare start IS the baseline, so there is nothing to compare and the row
 *    does not appear — which is also what silences it on the Lab tab, where every craft starts bare.
 *
 * Its figure is written in the unit of the True expected cost it sits under. Formatted on its own it
 * took whichever unit suited the smaller number, so a player read "saves 3,321 chaos" one line below
 * "1,733 div" — the side-by-side conversion `pickUnit` exists to spare them.
 */
export const ItemWorth: React.FC<{ markov: EngineMarkovResult; rates?: Rates }> = ({ markov, rates }) => {
  const bare = markov.bareCost;
  if (bare === undefined || markov.bound !== 'exact') return null;
  const start = markov.nodes.find((n) => n.isStart);
  const bareStart = start !== undefined && start.present.length === 0 && start.blocked.length === 0
    && start.junkPrefixes === 0 && start.junkSuffixes === 0;
  if (bareStart || bare <= 0) return null;

  const worth = bare - markov.expectedCost;
  const share = worth / bare;
  const unit = pickUnit(markov.expectedCost, rates); // the headline's own choice, via formatBoundedCost
  return (
    <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
      {worth > 0 ? (
        <>
          <strong className="text-foreground">
            Your item has done {share < 0.001 ? 'under 0.1' : (share * 100).toFixed(1)}% of this craft
          </strong>{' '}
          — it saves <span title={exactExalts(worth)}>{formatIn(unit, worth)}</span> against the same
          base carrying none of these mods. The rest is in what you still need: cost is back-loaded,
          because every mod already on the item leaves fewer open slots for the next one to land in.
          <strong> Counting mods overstates how far along you are.</strong>
        </>
      ) : (
        <>
          <strong className="text-foreground">Your item is behind a clean start</strong> — finishing it
          costs <span title={exactExalts(-worth)}>{formatIn(unit, -worth)}</span> more than the same
          base carrying none of these mods, because what you do not want has to come off first, and an
          Annulment takes a mod at random rather than the one you picked.
        </>
      )}
    </p>
  );
};
