import React from 'react';
import { Card } from '../../components/ui/card';
import { priceBasis } from '../../lib/engine';
import { EFFORT_PRESETS, isTopEffort, useEffort } from '../../lib/searchEffort';
import { slotsOfTargets } from '../../lib/gearTrade';
import AppUpdatedNotice from './AppUpdatedNotice';
import FrontierView from './FrontierView';
import PriceBasisNote from './PriceBasisNote';
import { GearTradeLink } from './GearTradeLink';
import WhatToBuy from './WhatToBuy';
import { ItemWorth } from './ItemWorth';
import TrueCostCard from './TrueCostCard';
import type { ItemCraft } from './useItemCraft';

/** The Item tab's answers: the true cost of finishing your item, and the step routes behind a disclosure. */
const ItemResults: React.FC<{ it: ItemCraft }> = ({ it }) => {
  const {
    engine, rates, stale, plan, planErr, markov, trueCostAnswered, solvedFor, markovSpare, showRoutes,
    setShowRoutes, excludedKeys,
  } = it;
  const effort = useEffort();
  /**
   * What to tell someone whose solve did not settle — and NOT to tell them at the top rung, where it
   * would point at a control with nothing above it. Same pair the Lab tab uses; this tab had neither,
   * and told the reader the floor was "itself the answer" instead.
   */
  const topped = isTopEffort(effort);
  const finishAdvice = topped
    ? <>This is <strong>{EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.label}</strong> already — the craft is beyond what the solver can settle.</>
    : <>Raise <strong>Search effort</strong> and compute again to let it finish.</>;
  return (
    <>
      {/* This panel used to show TWO cost totals and the note described only one of them, labelled
          just "Cost model:". Naming both was the honest version then. The step plan's total is now
          gone entirely — it priced replacing your item for free on every miss, which for an item
          you hold you cannot do, and which no player does from a white base either — so there is
          one total left and the note's job changed: not "why do these two numbers differ" but
          "what are the routes below, given they no longer carry one". */}
      <p className="text-[11px] text-muted-foreground px-1">
        <strong>One total, and a set of routes.</strong> <strong>True expected cost</strong> is the whole
        answer: a miss leaves you in a worse state and the policy digs out of it in place, taking whatever
        lands. The step routes below are the simpler view — each is one <em>fixed</em> sequence where every
        slam must hit a named mod, so they tell you the odds of a clean run and what that run costs, and on a
        long-shot target they will look far harder than the true cost, because the policy is allowed to adapt
        and they are not.
      </p>

      {stale && <AppUpdatedNotice />}
      {planErr && (
        <Card className="p-4">
          {/* Says "plan", not "craft" — the failure is this planner's, and some of the messages
              underneath are its own restrictions rather than game rules. See docs/copy-audit.md. */}
          <p className="text-destructive font-medium text-sm">The planner can’t plan this craft</p>
          <p className="text-sm text-muted-foreground mt-1">{planErr}</p>
        </Card>
      )}
      {/* When the MDP doesn't model this craft the true-cost card simply wasn't rendered, so the
          panel lost half its content with no explanation — and its `reason`, which says exactly
          why, was carried across the worker boundary and then never shown to anyone.
          The condition is the NEGATION of the true-cost card's below, deliberately: there are two
          ways to have no figure. `applicable: false` is set by the facade before the model runs
          (a regular-essence target), while the model's own refusals come back through `mapMarkov`,
          which hardcodes `applicable: true` and reports `feasible: false`. Keying this card on
          `!applicable` alone caught the first and missed the second, so a Magic item — the case it
          was written for — still showed nothing at all. */}
      {plan && !planErr && markov && !trueCostAnswered && markov.reason && (
        <Card className="p-4">
          <p className="text-sm font-medium">No true expected cost for this craft</p>
          <p className="text-sm text-muted-foreground mt-1">{markov.reason}</p>
        </Card>
      )}
      {plan && !planErr && markov?.applicable && markov.feasible && (
        <TrueCostCard markov={markov} rates={rates} spare={markovSpare}>
          {markov.bound === 'lower' && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              {/* This used to end "which is itself the answer: on this target, it isn't close" — an
                  unsettled floor presented as informative. Measured on a four-target Wand craft with
                  three prefixes, Standard's floor is 5.08e6 against a settled 2.33e7: out by 4.6x,
                  and it settles at ~2.3M sweeps in ~262s, which Exhaustive allows and Standard does
                  not. So the floor is not the answer, and there IS something to do about it. */}
              ⚠ The solver stopped before this number settled, so it is a <strong>floor</strong> — the
              real cost is at least this and can be several times it, so don’t read it as an estimate.
              {' '}{finishAdvice}
            </p>
          )}
          {engine && solvedFor && (
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              Or buy one already made — every modifier at the tier you asked or better:
              <GearTradeLink
                data={engine.data} league={priceBasis(engine).league} baseId={solvedFor.baseId}
                slots={slotsOfTargets(solvedFor.targets)} rarity="nonunique" label="the finished item"
              />
            </p>
          )}
          <ItemWorth markov={markov} rates={rates} />
          <WhatToBuy
            markov={markov} rates={rates}
            {...(engine && solvedFor ? { trade: { data: engine.data, league: priceBasis(engine).league, ...solvedFor } } : {})}
          />
          <p className="text-[11px] text-muted-foreground">
            The honest average spend to reach this target, playing the optimal policy — it weighs
            Greater/Perfect Exalts and side omens, and <strong>recovers in place</strong> after a bad roll
            rather than restarting. The step routes below are the simpler per-plan view: one fixed sequence,
            priced as though a miss handed you a free replacement item. That makes their cost neither an
            upper nor a lower bound on this one. <strong>“True” describes the model, not the money</strong>{' '}
            — it is honest about how crafting actually behaves; the price sheet it is multiplied by is
            still an estimate.
          </p>
          {engine && <PriceBasisNote basis={priceBasis(engine)} exactOdds={!markov.assumedOdds} assumedFrom={markov.assumedFrom} />}
        </TrueCostCard>
      )}
      {plan && !planErr && trueCostAnswered && !showRoutes && (
        <button
          type="button"
          onClick={() => setShowRoutes(true)}
          aria-expanded={false}
          className="w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-muted/40"
        >
          <span className="font-medium text-foreground">Step-by-step routes</span>
          {/* NOT the cheapest expected cost. That figure is the free-restart total — billions of
              divine on a long-shot craft — and putting it on the button meant you met the number
              without ever opening the section. The route count is the honest summary. */}
          {plan.frontier.length > 0 && (
            <span className="tabular-nums"> ({plan.frontier.length})</span>
          )}
          {/* Deliberately NOT a restatement of the two-cost-models paragraph above — that one
              explains the models; this one says why the number behind this button is safe to
              ignore. Saying it twice reads as the panel arguing with itself. */}
          <span className="block mt-0.5">
            Every slam here must hit one <em>named</em> mod, where the policy above takes whatever
            lands — which is why this figure is so much larger. Kept for completeness.
          </span>
        </button>
      )}
      {plan && !planErr && trueCostAnswered && showRoutes && (
        <button
          type="button"
          onClick={() => setShowRoutes(false)}
          aria-expanded
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Hide step-by-step routes
        </button>
      )}
      {plan && !planErr && (!trueCostAnswered || showRoutes) && (
        <FrontierView
          priceBasis={engine ? priceBasis(engine) : undefined}
          result={plan}
          title="Step-by-step routes (per-plan view)"
          emptyHint={excludedKeys.length > 0 ? (
            <p>No route avoids the {excludedKeys.length} currenc{excludedKeys.length === 1 ? 'y' : 'ies'} you
              excluded. Untick some under “Currency I don’t have” to widen the search.</p>
          ) : (
            <p>No route reaches this target from your item — usually the target needs more mods than
              fit, or a tier gated above the item level.</p>
          )}
        />
      )}
    </>
  );
};

export default ItemResults;
