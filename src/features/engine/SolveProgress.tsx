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
};

const SolveProgress: React.FC<{ progress: Progress | null; onCancel: () => void }> = ({ progress, onCancel }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const h = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);
    return () => clearInterval(h);
  }, []);

  // Before the first report there is genuinely nothing to show a position for, so the bar stays at
  // zero rather than inventing one.
  const pct = Math.round((progress?.fraction ?? 0) * 100);
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-sm text-muted-foreground truncate">
            {progress ? PHASE_LABEL[progress.phase] : 'Starting…'}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {pct}% · {elapsed.toFixed(1)}s
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Computing plan"
        >
          <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  );
};

export default SolveProgress;
