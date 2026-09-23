import React from 'react';
import { cn } from '../../lib/utils';
import type { RunPlan } from '../../lib/tabletRun';

const pct = (x: number): string => (x >= 0.995 ? '100%' : x < 0.005 ? 'under 1%' : `${Math.round(x * 100)}%`);

/**
 * "How many should I craft, and what do I need to start?" — a run of crafts, read off the replay
 * (tabletRun.ts). The shortest run that finishes ahead 9 times in 10 leads, with what it should make and
 * what to have on hand; 1, 10 and 100 sit beside it for scale — "you do not need 100, do what is best".
 */
export const RunPlanView: React.FC<{
  plan: RunPlan;
  /** What one craft makes on average — its sign decides the headline. */
  perCraft: number;
  fmt: (ex: number) => string;
}> = ({ plan, perCraft, fmt }) => {
  if (plan.rows.length === 0) return null;
  const best = plan.rows.find((r) => r.crafts === plan.best);
  const tablets = (n: number): string => `${n.toLocaleString('en')} tablet${n === 1 ? '' : 's'}`;
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan a run</h4>
      <p className="text-sm">
        {best ? (
          <>
            Craft <strong className="text-emerald-400">{tablets(best.crafts)}</strong> and you come out ahead{' '}
            <strong>{pct(best.ahead)}</strong> of the time — about{' '}
            <strong className="tabular-nums text-emerald-400">{fmt(best.profit)}</strong> over the run. Have about{' '}
            <strong className="tabular-nums">{fmt(best.bankroll)}</strong> on hand: the deepest a run that long goes
            before its sales pay you back, 9 times in 10.
          </>
        ) : perCraft > 0 ? (
          <>It pays on average, but no run up to 500 tablets comes out ahead 9 times in 10 — at any size you would craft, it stays a gamble.</>
        ) : (
          <>No number of crafts turns this into a profit: each loses about <strong className="tabular-nums text-amber-400">{fmt(-perCraft)}</strong> on average, and more crafts only add the losses up.</>
        )}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs tabular-nums">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-1 font-normal">Tablets crafted</th>
              <th className="pb-1 text-right font-normal">Ahead at the end</th>
              <th className="pb-1 text-right font-normal">Profit on average</th>
              <th className="pb-1 text-right font-normal" title="What to have on hand so 9 runs in 10 never run dry before a sale pays back">Have on hand</th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((r) => (
              <tr key={r.crafts} className={cn('border-t border-border/60', r.crafts === plan.best && 'bg-emerald-500/10 font-semibold')}>
                <td className="py-1">{r.crafts.toLocaleString('en')}{r.crafts === plan.best && <span className="ml-1 text-[10px] font-semibold text-emerald-400">best</span>}</td>
                <td className="py-1 text-right">{pct(r.ahead)}</td>
                <td className={cn('py-1 text-right', r.profit >= 0 ? 'text-emerald-400' : 'text-amber-400')}>
                  {r.profit >= 0 ? '+' : '−'}{fmt(Math.abs(r.profit))}
                </td>
                <td className="py-1 text-right">{fmt(r.bankroll)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Each run crafts one tablet after another, selling each as it is done — played out thousands of times from the
        crafts above. More tablets make the average more certain, never bigger per tablet.
      </p>
    </div>
  );
};
