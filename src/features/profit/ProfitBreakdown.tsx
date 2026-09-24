import React from 'react';
import { cn } from '../../lib/utils';
import type { CostLine } from '../../lib/profit';

// A move a craft plays only now and then still gets its line — a rare Perfect Exalt can be a real share
// of the bill — so a count too small for two decimals says so rather than rounding to "0".
const count = (n: number): string => (n >= 100 ? Math.round(n).toLocaleString('en') : n >= 10 ? n.toFixed(1)
  : n > 0 && n < 0.005 ? '< 0.01' : n.toFixed(2).replace(/\.?0+$/, ''));

/**
 * "Why is this a profit?" — the verdict's two numbers taken apart, for the player who wants to check them.
 *
 * What one craft spends on average, line by line (every orb and every base or plain tablet the
 * played-out plan used, at its price — `spendBreakdown` on a tablet, `spendLines` on gear), against what
 * it gets (what was asked for at its typed price, and each priced set sold on the way, times how often
 * it sold), and the difference. Then how sure that
 * average is: it comes from a finite number of crafts played out, and a thin profit can sit inside the
 * noise — which is said, rather than left for the player to find out.
 */
export const ProfitBreakdown: React.FC<{
  spend: readonly CostLine[];
  /** The tablet asked for, then each set sold on the way: name, how many a craft, price each. */
  get: readonly CostLine[];
  /** The spend the verdict above uses, when it is the solver's exact average rather than the played one. */
  exactSpend?: number;
  runs: number;
  /** Standard error of one craft's average spend. */
  stdErr: number;
  fmt: (ex: number) => string;
  /** What one craft covers, in a sentence — from where it starts to what it ends on. */
  about?: React.ReactNode;
  /** What is crafted — "a tablet", "an item". */
  noun?: string;
}> = ({ spend, get, exactSpend, runs, stdErr, fmt, about, noun = 'a tablet' }) => {
  const spent = spend.reduce((a, l) => a + l.total, 0);
  const got = get.reduce((a, l) => a + l.total, 0);
  const verdictSpend = exactSpend ?? spent;
  const profit = got - verdictSpend;
  const margin = 1.96 * stdErr;
  const table = (title: string, lines: readonly CostLine[], total: number, tone: string) => (
    <table className="w-full text-xs tabular-nums">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th className="pb-1 font-normal">{title}</th>
          <th className="pb-1 text-right font-normal">How many</th>
          <th className="pb-1 text-right font-normal">Each</th>
          <th className="pb-1 text-right font-normal">Total</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.name} className="border-t border-border/60">
            <td className="py-1 pr-2">{l.name}</td>
            <td className="py-1 text-right">{count(l.count)}</td>
            <td className="py-1 text-right text-muted-foreground">{fmt(l.each)}</td>
            <td className="py-1 text-right">{fmt(l.total)}</td>
          </tr>
        ))}
        <tr className="border-t border-border font-semibold">
          <td className="py-1" colSpan={3}>Total</td>
          <td className={cn('py-1 text-right', tone)}>{fmt(total)}</td>
        </tr>
      </tbody>
    </table>
  );
  return (
    <details className="group rounded-lg border border-border/70 bg-background/40 p-3 text-sm">
      <summary className="cursor-pointer select-none font-medium text-muted-foreground group-open:text-foreground">
        How is this worked out?
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs text-muted-foreground">
          One craft, on average — {runs.toLocaleString('en')} crafts played out following the plan below, each{' '}
          {about ?? 'starting from a plain tablet and ending on the tablet you asked for, filled to four modifiers.'}
        </p>
        <div className="overflow-x-auto">{table('You spend', spend, spent, 'text-amber-300')}</div>
        {exactSpend !== undefined && (
          <p className="text-xs text-muted-foreground">
            The crafts played out spent {fmt(spent)} on average; the verdict uses the solver’s exact figure,{' '}
            {fmt(exactSpend)} — the same plan, without the dice.
          </p>
        )}
        <div className="overflow-x-auto">{table('You get', get, got, 'text-emerald-300')}</div>
        <p className={cn('font-semibold', profit >= 0 ? 'text-emerald-400' : 'text-amber-400')}>
          {fmt(got)} − {fmt(verdictSpend)} = {profit >= 0 ? '' : '−'}{fmt(Math.abs(profit))} {profit >= 0 ? 'profit' : 'loss'} {noun}
        </p>
        <p className="text-xs text-muted-foreground">
          How sure: {runs.toLocaleString('en')} crafts pin the average spend to within ±{fmt(margin)}, 19 times in 20.
          {' '}{Math.abs(profit) <= margin
            ? 'The profit is inside that — it could as well be a small loss. Check the prices before counting on it.'
            : `The ${profit >= 0 ? 'profit' : 'loss'} is bigger than that, so it is not an accident of the dice — it is only as good as the prices you typed.`}
        </p>
      </div>
    </details>
  );
};
