import React from 'react';
import PriceBasisNote from './PriceBasisNote';
import type { EnginePriceBasis } from '../../lib/engine';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MAX_PRACTICAL_ATTEMPTS, recommendPlan, type EngineResult } from '../../lib/engine';
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

/**
 * An expected-attempt count, at whatever scale it happens to be.
 *
 * `toFixed(1)` alone printed a long-shot craft as **"≈ 1050000000000.0 attempts"** — twelve
 * unseparated digits and a decimal place that is noise at that size. It is the same defect as the
 * total beside it: a true number rendered in a form nobody can read. Thousands separators fix the
 * middle of the range; past a million even those give a string too long to take in at a glance, so it
 * goes exponential, which is also how the chance beside it already renders.
 */
export function fmtAttempts(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  if (n < 1000) return n.toFixed(1);
  if (n < 1e6) return Math.round(n).toLocaleString();
  return n.toExponential(1);
}

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
  //
  // `leads` and `isRecommended` are deliberately different things. The recommended card keeps its
  // highlight either way — a list has to open somewhere — but it only makes the "best value" CLAIM
  // when a plan actually cleared the practicality bar. Where none did, that card is the fallback,
  // which is the surest and therefore the dearest plan on the frontier.
  const rec = recommendPlan(result.frontier);
  const cards = result.frontier.map((plan, i) => ({
    plan,
    isCheapest: i === 0,
    isSurest: i === result.frontier.length - 1,
    isRecommended: i === rec.index,
    leads: i === rec.index && rec.practical,
  }));
  const ordered = freeRestart ? cards : [...cards].reverse();
  const heading = title ?? (freeRestart ? 'Your options — cheapest to surest' : 'Your options — likeliest first');

  return (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{heading}</h2>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {result.truncated && (
          <Badge variant="outline" className="border-amber-500/60 text-amber-700 dark:text-amber-300">
            stopped early — raise Search effort for more
          </Badge>
        )}
        {/* The orb-strength claim used to be a Badge of its own, chosen from a four-way `currencyDepth`
            that said which strengths the search had settled for. Every craft searches all of them now,
            so the field had one reachable value and the badge could only ever say one thing — noise
            where it used to be information. It survives as the tail of this line, which is where a
            reader looking at "how hard did it try" is already looking, and it is stated only when a
            search actually ran: a planner that DECLINED reports 0 plans and gets no claim at all. */}
        <span>
          checked {result.plansEvaluated.toLocaleString()} plan{result.plansEvaluated === 1 ? '' : 's'}
          {result.plansEvaluated > 0 && ' · every orb strength'}
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
        {/* What `expected cost` assumes, said out loud on exactly the crafts where the assumption
            stops holding.

            The figure is one run's cost divided by the chance it lands, which prices scrapping the
            item and buying a fresh base after every miss. That is fair from white on an ordinary
            craft. It stops being fair the further the odds fall, because the division runs away: a
            6-mod T1 Wand lands 3.9e-10% of the time, so the total is a real Perfect Transmutation
            Orb bought 260 billion times, and 99.3% of a 6.1-billion-divine answer is that one step.
            Nobody scraps an item six steps in — they repair it — which is the model the true expected
            cost uses, and why it came back four orders of magnitude lower on the same craft.

            Shown only where NO plan clears the bar, so an ordinary craft never sees it, and worded
            around the assumption rather than a verdict so it reads sensibly at 45 attempts as well as
            at 1e12. It points at the figures that survive the assumption intact.

            It DESCRIBES the card's labels rather than repeating them. Quoting "expected cost" and
            "chance per attempt" back verbatim put a second copy of each label on screen above the
            cards — and broke three tests that locate a card by its labels, which is the same
            ambiguity a reader would have had. */}
        {freeRestart && !rec.practical && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <strong className="text-foreground">
              No route here lands inside {MAX_PRACTICAL_ATTEMPTS} attempts.
            </strong>{' '}
            The total on each card divides one run&rsquo;s cost by the chance it lands, so it prices
            scrapping the item and starting from a fresh base after every miss — the further past that
            bar a plan sits, the more that total is arithmetic than a budget. The odds and the per-run
            price beside it hold either way, and <strong>True expected cost</strong> prices repairing
            the item rather than replacing it.
          </p>
        )}
        {ordered.map(({ plan, isCheapest, isSurest, isRecommended, leads }, i) => {
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
                    <div>≈ {fmtAttempts(plan.expectedAttempts)} attempts</div>
                    <div title={exactExalts(plan.perAttempt)}>{formatIn(unitPerAttempt, plan.perAttempt)} per attempt</div>
                  </div>
                )}
                <div className="flex-1" />
                <div className="flex gap-1">
                  {/* With no total on the card, "cheapest" and "best value" are claims about a number
                      the reader cannot see. Only the ordering claim survives. */}
                  {freeRestart ? (
                    <>
                      {leads && <Badge>best value</Badge>}
                      {isCheapest && <Badge variant={leads ? 'outline' : 'secondary'}>cheapest</Badge>}
                      {isSurest && !isCheapest && <Badge variant={leads ? 'outline' : 'secondary'}>surest</Badge>}
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
