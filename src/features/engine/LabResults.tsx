import React from 'react';
import { Card } from '../../components/ui/card';
import { priceBasis } from '../../lib/engine';
import { EFFORT_PRESETS, isTopEffort, useEffort } from '../../lib/searchEffort';
import AppUpdatedNotice from './AppUpdatedNotice';
import FrontierView from './FrontierView';
import AlternativesView from './AlternativesView';
import StartFromItem from './StartFromItem';
import TrueCostCard from './TrueCostCard';
import CraftToSell from './CraftToSell';
import type { LabCraft } from './useLabCraft';

/** The Plan tab's answers: the true cost and its route, the items to start from instead, the step routes. */
const LabResults: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  const {
    stale, runErr, markov, result, engine, solvedFor, alongSig, markovSpare, markovRun, fractured, markovEffort,
    computing, compute, playOut, desecrationNeedsRare, normalTargets, excludedKeys, freeSlots, alts, altBudget,
    budget, sale, setSale, saleKey,
  } = lab;
  const effort = useEffort();
  // "Raise Search effort" is the app's standing answer to a solve that stopped early, and it is good
  // advice at every preset but the top one — where it points at a control with nothing above it. The
  // honest thing there is to say the solver has given everything it has.
  const topped = isTopEffort(effort);
  // Name the actual top preset rather than hardcoding a word. This said "Maximum", which matched no
  // preset on the ladder at all — it was Patient, and is now Exhaustive — so the app was telling
  // people to look for a setting that did not exist.
  const topLabel = EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.label;
  const tightenAdvice = topped
    ? <>at <strong>{topLabel}</strong> this is as tight as the solver gets</>
    : <>raise <strong>Search effort</strong> to tighten the price</>;
  const finishAdvice = topped
    ? <>This is <strong>{topLabel}</strong> already — the craft is beyond what the solver can settle.</>
    : <>Raise <strong>Search effort</strong> to let it finish.</>;
  const rates = engine ? priceBasis(engine).rates : undefined;
  // The Budget as typed, read against the spread of what a craft costs — blank or unreadable is none.
  const budgetEx = budget.trim() !== '' && Number(budget) > 0 ? Number(budget) : undefined;
  return (
    <>
      {/* "Cannot craft this target" asserted about the GAME over a message that may only describe a
          restriction of this planner (some throws are real rules like ">3 prefixes"; others are not).
          Naming the planner is accurate either way, and the message underneath carries the specifics. */}
      {stale && <AppUpdatedNotice />}
      {runErr && (
        <Card className="p-4">
          <p className="text-destructive font-medium text-sm">The planner can’t build this target</p>
          <p className="text-sm text-muted-foreground mt-1">{runErr}</p>
        </Card>
      )}

      {/* Same rule as ItemActions: there are two ways to have no true cost and the card must cover
          both, or the panel loses half its content with no explanation. Keyed on the NEGATION of the
          condition below so the two are exhaustive by construction. */}
      {markov && !runErr && result && !(markov.applicable && markov.feasible) && markov.reason && (
        <Card className="p-4">
          <p className="text-sm font-medium">No true expected cost for this craft</p>
          <p className="text-sm text-muted-foreground mt-1">{markov.reason}</p>
        </Card>
      )}

      {/* The true expected cost + policy route, the same model the Item tab uses. From a white base the
          policy may also simply start over, which is why its number is believable here (see
          WHITE_BASE_COST in solve.ts). */}
      {markov && !runErr && markov.applicable && markov.feasible && (
        <TrueCostCard
          markov={markov} rates={rates} spare={markovSpare}
          along={engine && alongSig ? { engine, tab: 'lab', sig: alongSig, plain: 'A white base' } : undefined}
          playOut={{ run: playOut, busy: computing }} budget={budgetEx} sale={sale?.ex}
          sell={engine && solvedFor && saleKey !== null && (
            <CraftToSell
              engine={engine} markov={markov} solvedFor={solvedFor} rates={rates}
              sale={sale} saleKey={saleKey} onSale={setSale}
            />
          )}
        >
          {/* Which way an unfinished solve leans depends on how it was started, so the copy follows
              `bound` rather than guessing. From a white base the solver seeds from a policy that never
              restarts — a real, if expensive, way to finish — and works DOWN from it, so stopping early
              leaves a ceiling. From an item it starts at zero and works up, leaving a floor. */}
          {markov.bound === 'upper' && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ The solver stopped before this number settled, so it is a <strong>ceiling</strong> — the
              real cost is at most this, and usually well under it. The route below is already the right
              shape — {tightenAdvice}.
            </p>
          )}
          {markov.bound === 'lower' && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ The solver stopped before this number settled, so it is a <strong>floor</strong> — the
              real cost is at least this and may be higher. {finishAdvice}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            The average spend to reach this target playing the optimal policy — it weighs orb strengths
            and side omens, recovers in place after a bad roll, and, when another base costs less than
            the repair, may also decide the cheapest move is to
            {' '}<strong>bin what you have and start again</strong>.
            The step routes below are the simpler per-plan view: one fixed sequence, every slam hitting
            a named mod.
          </p>
        </TrueCostCard>
      )}

      {/* Its own section on every craft from scratch, open unless the player hid it (their choice,
          2026-09-11). It reads the solve above, which may bin a bought item and start over; the Item
          tab's `WhatToBuy` asks the keep-the-item question from its own solve. See StartFromItem. */}
      {markov && !runErr && engine && (
        <StartFromItem
          key={markovRun} markov={markov} engine={engine} rates={priceBasis(engine).rates}
          {...(solvedFor ? { solvedFor } : {})}
          carved={fractured.size > 0} ranAt={markovEffort} computing={computing} recompute={compute}
        />
      )}

      {result && !runErr && (
        <FrontierView
          result={result}
          priceBasis={engine ? priceBasis(engine) : undefined}
          // Ordered most specific first: a wrong-but-plausible reason is worse than none, and the
          // generic tier-gate message was being shown for a craft that simply never reaches Rare.
          emptyHint={desecrationNeedsRare ? (
                <p>A Desecration needs a <strong>Rare</strong> item, and from scratch the item only
                  becomes Rare after three mods (Transmutation → Augmentation → Regal). This target
                  has {normalTargets} rollable mod{normalTargets === 1 ? '' : 's'}, so the planner has
                  nothing to spend those three on.{' '}
                  <strong>In game you can still do this</strong>: roll three throwaway mods, annul them
                  off (the item stays Rare), then Desecrate. The planner doesn’t search that yet — every
                  step it builds adds a mod you asked for, so it can’t propose filler. Until it does,
                  add rollable mods until there are three, or start from a Rare item you already hold.</p>
              ) : excludedKeys.length > 0 ? (
                <p>No plan avoids the {excludedKeys.length} currenc{excludedKeys.length === 1 ? 'y' : 'ies'} you
                  excluded. Untick some under “Currency I don’t have” to widen the search — or the target may be
                  out of reach anyway, which this can’t tell you without re-running it unrestricted.</p>
              ) : freeSlots > 0 ? (
                /* Not a claim that the free slot CAUSED this — a short target can come back empty
                   without one, for the same underlying reason. It is a claim about where the answer
                   is: every step these routes build names the mod it adds, so none of them can be
                   spent on a position you left open, and the generic "try a lower tier" below would
                   send the reader off adjusting something that was never the problem. */
                <p>These routes can’t use the slot you left free — every step in a route names the mod
                  it adds, so none of them can be spent on “anything”. The <strong>true expected
                  cost</strong> above is not restricted that way: if it came back with a number, the
                  craft is reachable even though no route here is.</p>
              ) : undefined}
        />
      )}
      {alts && !runErr && <AlternativesView alts={alts} budget={altBudget} rates={rates} />}
    </>
  );
};

export default LabResults;
