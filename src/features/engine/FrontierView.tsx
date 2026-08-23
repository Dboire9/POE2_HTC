import React from 'react';
import PriceBasisNote from './PriceBasisNote';
import type { EnginePriceBasis } from '../../lib/engine';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { recommendedIndex, type EngineResult } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit } from '../../lib/currency';

function fmtPct(p: number): string {
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
};

/** The (expected cost ↔ success probability) frontier: one card per non-dominated plan, cheapest→surest. */
const FrontierView: React.FC<{
  result: EngineResult; title?: string; emptyHint?: React.ReactNode; priceBasis?: EnginePriceBasis;
}> = ({
  result, title = 'Your options — cheapest to surest', emptyHint, priceBasis,
}) => {
  // ONE unit for the whole card set, chosen from the largest number it will show. Picking per-value
  // would put "9,800 ex" next to "300 chaos" in a list whose entire purpose is comparing rows.
  const unit = pickUnit(
    Math.max(0, ...result.frontier.flatMap((p) => [p.expected, p.perAttempt].filter(Number.isFinite))),
    priceBasis?.rates,
  );
  return (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{DEPTH_NOTE[result.currencyDepth]}</Badge>
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
        {emptyHint ?? (
          <p>Nothing this search tried worked. The usual cause is a target tier gated above the item
            level, or a mod that can’t roll on this base — try a lower target tier or a higher item
            level. If neither applies, the craft may still be possible by a route the planner doesn’t
            explore.</p>
        )}
      </Card>
    ) : (
      <div className="space-y-3">
        {(() => { const rec = recommendedIndex(result.frontier); return result.frontier.map((plan, i) => {
          const isCheapest = i === 0;
          const isSurest = i === result.frontier.length - 1;
          const isRecommended = i === rec;
          return (
            <Card key={i} className={`p-4 space-y-3 ${isRecommended ? 'ring-2 ring-primary/60' : ''}`}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <div>
                  <div className="text-2xl font-bold tabular-nums" title={exactExalts(plan.expected)}>
                    {formatIn(unit, plan.expected)}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">expected cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums text-primary">{fmtPct(plan.probability)}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">success / attempt</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>≈ {Number.isFinite(plan.expectedAttempts) ? plan.expectedAttempts.toFixed(1) : '∞'} attempts</div>
                  <div title={exactExalts(plan.perAttempt)}>{formatIn(unit, plan.perAttempt)} per attempt</div>
                </div>
                <div className="flex-1" />
                <div className="flex gap-1">
                  {isRecommended && <Badge>best value</Badge>}
                  {isCheapest && <Badge variant={isRecommended ? 'outline' : 'secondary'}>cheapest</Badge>}
                  {isSurest && !isCheapest && <Badge variant={isRecommended ? 'outline' : 'secondary'}>surest</Badge>}
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
        }); })()}
      </div>
    )}
  </div>
  );
};

export default FrontierView;
