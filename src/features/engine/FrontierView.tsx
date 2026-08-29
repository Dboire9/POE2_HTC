import React from 'react';
import PriceBasisNote from './PriceBasisNote';
import type { EnginePriceBasis } from '../../lib/engine';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { recommendedIndex, type EngineResult } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit } from '../../lib/currency';

/**
 * A success chance, at whatever scale it happens to be.
 *
 * Exported because the Lab's screen-reader announcement had its own `toFixed(1)` and read
 * "Best value: 0.0% per attempt" for the 0.0000063% this panel was showing three lines below —
 * a plan the app had just called achievable, announced as impossible.
 */
export function fmtPct(p: number): string {
  const pct = p * 100;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.01) return `${pct.toFixed(3)}%`;
  if (pct <= 0) return '0%';
  return `${pct.toPrecision(2)}%`;
}

// Said in the terms a player has: which ORBS were tried, and why not all of them. "orb search reduced
// to base+strongest" described the algorithm's throttle rather than the consequence.
const DEPTH_NOTE: Record<EngineResult['currencyDepth'], string> = {
  full: 'tried every orb strength',
  'base+strongest': 'only tried base + strongest orbs — too many combinations for all of them',
  'strongest-only': 'only tried the strongest orbs — too many combinations for all of them',
  // The from-item planner never varies orb strength at all — every add it builds is a base-strength
  // orb. It used to report `full`, i.e. "tried every orb strength", which was simply untrue and hid a
  // real reason its numbers sit so far above the MDP's (which does reach for Greater/Perfect Exalts).
  'base-only': 'base-strength orbs only — this planner doesn’t vary orb strength on an item you hold',
};

/** The (expected cost ↔ success probability) frontier: one card per non-dominated plan. */
const FrontierView: React.FC<{
  result: EngineResult; title?: string; emptyHint?: React.ReactNode; priceBasis?: EnginePriceBasis;
  /**
   * Whether a miss really can be shrugged off. The cost model behind `expected` restarts to the
   * STARTING item for free on every failure — sound for a white base (buy another), fiction for the
   * Rare in your stash. Under that fiction the ranking inverts: an Annulment costs 158.7ex against an
   * Exalt's 1ex, so burying the Annuls behind a 0.1% gate you rarely pass "saves" ~65x, and the
   * cheapest plan becomes one no player would run. When false, the likeliest route leads instead and
   * the cost figure is captioned with the assumption it rests on.
   */
  freeRestart?: boolean;
}> = ({
  result, title, emptyHint, priceBasis, freeRestart = true,
}) => {
  // ONE unit per QUANTITY, not per view. Cards are read by comparing the same figure down the column,
  // which is what a shared unit buys; sharing one across DIFFERENT quantities does the opposite, and
  // on a long-shot craft (expected 1e14 ex, per-attempt 357 ex) it rendered 357 ex as "0.98 div".
  const rates = priceBasis?.rates;
  const unitExpected = pickUnit(Math.max(0, ...result.frontier.map((p) => p.expected).filter(Number.isFinite)), rates);
  const unitPerAttempt = pickUnit(Math.max(0, ...result.frontier.map((p) => p.perAttempt).filter(Number.isFinite)), rates);

  // Flags are decided on the SEARCH order (cheapest→surest) and carried, so reversing the display
  // can't slide "best value" onto the wrong card.
  const rec = recommendedIndex(result.frontier);
  const cards = result.frontier.map((plan, i) => ({
    plan,
    isCheapest: i === 0,
    isSurest: i === result.frontier.length - 1,
    isRecommended: i === rec,
  }));
  const ordered = freeRestart ? cards : [...cards].reverse();
  const heading = title ?? (freeRestart ? 'Your options — cheapest to surest' : 'Your options — likeliest first');

  return (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{heading}</h2>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{DEPTH_NOTE[result.currencyDepth]}</Badge>
        {result.truncated && (
          <Badge variant="outline" className="border-amber-500/60 text-amber-700 dark:text-amber-300">
            stopped early — raise Search effort for more
          </Badge>
        )}
        <span>
          checked {result.plansEvaluated.toLocaleString()} plan{result.plansEvaluated === 1 ? '' : 's'}
        </span>
      </div>
    </div>

    {priceBasis && <PriceBasisNote basis={priceBasis} exactOdds={!result.assumedOdds} />}

    {result.frontier.length === 0 ? (
      <Card className="p-6 text-center text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">No achievable plan — every path scored 0%.</p>
        {/* The FALLBACK reason, used only when the caller has nothing more specific. It must not
            assert that the target is impossible: an empty frontier means THIS SEARCH found nothing,
            which also happens when the craft is legal but outside what the planner explores (the
            desecration filler route, for one). Naming the likely cause and admitting it is a guess
            beats a confident wrong diagnosis that sends the player off adjusting a tier. */}
        {/* `result.reason` outranks the generic text because they answer different questions. The
            fallback below explains a search that RAN and found nothing; a reason means the planner
            declined the craft's shape before searching at all, and telling that reader to try a lower
            tier would send them adjusting something that was never the problem. */}
        {emptyHint ?? (result.reason ? <p>{result.reason}</p> : (
          <p>Nothing this search tried worked. The usual cause is a target tier gated above the item
            level, or a mod that can’t roll on this base — try a lower target tier or a higher item
            level. If neither applies, the craft may still be possible by a route the planner doesn’t
            explore.</p>
        ))}
      </Card>
    ) : (
      <div className="space-y-3">
        {ordered.map(({ plan, isCheapest, isSurest, isRecommended }, i) => {
          const cost = (
            <div>
              <div className="text-2xl font-bold tabular-nums" title={exactExalts(plan.expected)}>
                {formatIn(unitExpected, plan.expected)}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">expected cost</div>
            </div>
          );
          const odds = (
            <div>
              <div className="text-2xl font-bold tabular-nums text-primary">{fmtPct(plan.probability)}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">chance per attempt</div>
            </div>
          );
          // What one run through the sequence actually costs you. Real money either way, and with the
          // free-restart total gone it is also the cost axis of the frontier: a plan that reaches for
          // Perfect orbs costs more per run and lands more often, which is the whole trade.
          const perRun = (
            <div>
              <div className="text-2xl font-bold tabular-nums" title={exactExalts(plan.perAttempt)}>
                {formatIn(unitPerAttempt, plan.perAttempt)}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">what one run costs</div>
            </div>
          );
          return (
            <Card key={i} className={`p-4 space-y-3 ${isRecommended && freeRestart ? 'ring-2 ring-primary/60' : ''}`}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {/* Dividing a real per-run cost by a ~1e-13 chance produces a number in the billions of
                    divine. It is arithmetically right and it is not a budget — nobody runs a sequence
                    1e14 times, they abandon it. Showing it made every from-item card shout a figure
                    that could only be ignored, so the total and the attempt count are dropped here and
                    the two figures that survive are ones you can act on: how often one run lands, and
                    what one run costs. */}
                {freeRestart ? <>{cost}{odds}</> : <>{odds}{perRun}</>}
                {freeRestart && (
                  <div className="text-xs text-muted-foreground">
                    <div>≈ {Number.isFinite(plan.expectedAttempts) ? plan.expectedAttempts.toFixed(1) : '∞'} attempts</div>
                    <div title={exactExalts(plan.perAttempt)}>{formatIn(unitPerAttempt, plan.perAttempt)} per attempt</div>
                  </div>
                )}
                <div className="flex-1" />
                <div className="flex gap-1">
                  {/* With no total on the card, "cheapest" and "best value" are claims about a number
                      the reader cannot see. Only the ordering claim survives. */}
                  {freeRestart ? (
                    <>
                      {isRecommended && <Badge>best value</Badge>}
                      {isCheapest && <Badge variant={isRecommended ? 'outline' : 'secondary'}>cheapest</Badge>}
                      {isSurest && !isCheapest && <Badge variant={isRecommended ? 'outline' : 'secondary'}>surest</Badge>}
                    </>
                  ) : (
                    isSurest && <Badge>likeliest</Badge>
                  )}
                </div>
              </div>

              {plan.steps.length > 0 ? (
                <ol className="space-y-1 border-t border-border/50 pt-2">
                  {plan.steps.map((s) => (
                    <li key={s.n} className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-right font-mono text-muted-foreground">{s.n}.</span>
                      <span className="font-medium min-w-40">{s.label}</span>
                      <span className="flex-1 text-muted-foreground">{s.target}</span>
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {Math.min(s.prob * 100, 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="border-t border-border/50 pt-2 text-sm text-muted-foreground">
                  Your item already matches the target — no currency needed.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    )}
  </div>
  );
};

export default FrontierView;
