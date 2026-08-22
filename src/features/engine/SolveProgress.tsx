import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import type { SolveProgress as Progress } from '../../lib/solve';

/**
 * What the app shows while a plan is being computed.
 *
 * This used to be the word "Computing…" beside a frozen page. The solve now runs in a Worker, so the
 * page stays live and there is something honest to say: which phase is running, how far along it is,
 * how long it has taken, and a way out. The bar is real — it comes from the solver counting states,
 * not from a timer pretending.
 */
const PHASE_LABEL: Record<Progress['phase'], string> = {
  actions: 'Mapping out every move…',
  compile: 'Preparing the solver…',
  solve: 'Finding the cheapest route…',
  plan: 'Weighing every crafting order…',
  alternatives: 'Checking what your budget buys…',
};

const SolveProgress: React.FC<{ progress: Progress | null; onCancel: () => void }> = ({ progress, onCancel }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const h = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);
    return () => clearInterval(h);
  }, []);

  // Until the first report arrives there is no position to show — so show motion instead of a zero.
  // A bar sitting at 0% reads as hung, and some phases are genuinely silent (the from-item planner
  // has no reporting yet), so this is the difference between "working" and "broken" to a user.
  const determinate = progress !== null;
  const pct = Math.round((progress?.fraction ?? 0) * 100);
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-sm text-muted-foreground truncate">
            {progress ? PHASE_LABEL[progress.phase] : 'Working…'}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {determinate ? `${pct}% · ` : ''}{elapsed.toFixed(1)}s
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          {...(determinate ? { 'aria-valuenow': pct } : {})}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Computing plan"
        >
          {determinate ? (
            <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
          ) : (
            <div className="h-full w-1/5 rounded-full bg-primary animate-indeterminate" />
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  );
};

export default SolveProgress;
