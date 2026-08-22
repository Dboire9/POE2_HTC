import React from 'react';
import PriceBasisNote from './PriceBasisNote';
import type { EnginePriceBasis } from '../../lib/engine';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { recommendedIndex, type EngineResult } from '../../lib/engine';

function fmtCost(x: number): string {
  if (!Number.isFinite(x)) return '∞';
  const s = x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
  return `${s} ex`;
}

function fmtPct(p: number): string {
  const pct = p * 100;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.01) return `${pct.toFixed(3)}%`;
  if (pct <= 0) return '0%';
  return `${pct.toPrecision(2)}%`;
}

const DEPTH_NOTE: Record<EngineResult['currencyDepth'], string> = {
  full: 'searched every orb strength',
  'base+strongest': 'orb search reduced to base + strongest (target too large for full)',
  'strongest-only': 'orb search reduced to strongest only (target too large for full)',
};

/** The (expected cost ↔ success probability) frontier: one card per non-dominated plan, cheapest→surest. */
const FrontierView: React.FC<{
  result: EngineResult; title?: string; emptyHint?: React.ReactNode; priceBasis?: EnginePriceBasis;
}> = ({
  result, title = 'Cost ↔ probability frontier', emptyHint, priceBasis,
}) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{DEPTH_NOTE[result.currencyDepth]}</Badge>
        <span>
          {result.plansEvaluated.toLocaleString()} plan{result.plansEvaluated === 1 ? '' : 's'} evaluated
        </span>
      </div>
    </div>

    {priceBasis && <PriceBasisNote basis={priceBasis} />}

    {result.frontier.length === 0 ? (
      <Card className="p-6 text-center text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">No achievable plan — every path scored 0%.</p>
        {emptyHint ?? (
          <p>The target is impossible on this base/level — usually a target tier gated above the item
            level, or a mod that can’t roll here. Try a lower target tier or a higher item level.</p>
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
                  <div className="text-2xl font-bold tabular-nums">{fmtCost(plan.expected)}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">expected cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums text-primary">{fmtPct(plan.probability)}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">success / attempt</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>≈ {Number.isFinite(plan.expectedAttempts) ? plan.expectedAttempts.toFixed(1) : '∞'} attempts</div>
                  <div>{fmtCost(plan.perAttempt)} per attempt</div>
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

export default FrontierView;
