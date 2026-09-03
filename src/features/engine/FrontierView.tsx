import React from 'react';
import PriceBasisNote from './PriceBasisNote';
import type { EnginePriceBasis } from '../../lib/engine';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { EngineResult } from '../../lib/engine';
import { exactExalts, formatChance, formatIn, pickUnit } from '../../lib/currency';

/** The (expected cost ↔ success probability) frontier: one card per non-dominated plan. */
const FrontierView: React.FC<{
  result: EngineResult; title?: string; emptyHint?: React.ReactNode; priceBasis?: EnginePriceBasis;
}> = ({ result, title, emptyHint, priceBasis }) => {
  // ONE unit down the column, so the cards can be read by comparing the same figure — which is what a
  // shared unit buys. It was once shared across DIFFERENT quantities too, and on a long-shot craft
  // (expected 1e14 ex, per-attempt 357 ex) that rendered 357 ex as "0.98 div".
  const rates = priceBasis?.rates;
  const unitPerAttempt = pickUnit(Math.max(0, ...result.frontier.map((p) => p.perAttempt).filter(Number.isFinite)), rates);
  // Likeliest first: the frontier is built cheapest-run → surest-run, and the route a player reaches
  // for is the one that lands, not the one that is cheap to fail at.
  const ordered = [...result.frontier].reverse();
  const heading = title ?? 'Your options — likeliest first';

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
        {ordered.map((plan, i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {/* The two figures that survive the model's assumptions intact.

                  What is NOT here is `expected cost`. It divides one run's price by the chance it
                  lands, which prices scrapping the item and buying a fresh base after every miss — a
                  policy forbidden to repair, and one no player follows: nobody bins an item six steps
                  in holding five of their six mods, they annul the bad one. On a 6-mod T1 Wand that
                  division produced 6.1 billion divine, 99.3% of it one Perfect Transmutation Orb
                  charged 260 billion times. `True expected cost` answers the same question under
                  optimal play, and it already has "bin it and start again" among its actions
                  (`restartCost`), so wherever restarting really is best it agrees — and where it is
                  not, it comes back orders of magnitude lower. There is nothing the total could add.

                  Nor an attempt count: `expectedAttempts` is `1 / total` (cost.ts) and `probability`
                  IS that same `total` (optimize.ts, "= result.total"), so the two were exact
                  reciprocals. That hid while they rendered as "3.9e-10%" and "2.6e+11" — two
                  unreadable strings do not look alike — and became obvious once the chance was
                  written as "1 in 260 billion". */}
              <div>
                <div className="text-2xl font-bold tabular-nums text-primary">{formatChance(plan.probability)}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">chance per attempt</div>
              </div>
              {/* Real money either way, and with the total gone this is the frontier's cost axis: a
                  plan reaching for Perfect orbs costs more per run and lands more often. */}
              <div>
                <div className="text-2xl font-bold tabular-nums" title={exactExalts(plan.perAttempt)}>
                  {formatIn(unitPerAttempt, plan.perAttempt)}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">what one run costs</div>
              </div>
              <div className="flex-1" />
              {/* The only claim left that a reader can check against the numbers beside it. "cheapest"
                  and "best value" both ranked on the total, so with it gone they would be claims about
                  something not on screen. */}
              <div className="flex gap-1">{i === 0 && <Badge>likeliest</Badge>}</div>
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
        ))}
      </div>
    )}
  </div>
  );
};

export default FrontierView;
