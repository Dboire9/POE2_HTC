import { useRef, useState } from 'react';
import { solve, isAppUpdated, isCancelled } from '../../lib/engineClient';
import type { SolveProgress, SolveRequest, SolveResult } from '../../lib/solve';

/** What a tab does with the solve it started. Only the CURRENT run's handlers are ever called. */
export interface SolveHandlers {
  readonly onResult: (res: SolveResult) => void;
  /**
   * It failed — never called for a cancel, which is what the player asked for rather than an error.
   * `appUpdated` means the site was redeployed under this tab, which only a reload fixes (see
   * AppUpdatedNotice), so every tab words it apart from a planner failure.
   */
  readonly onError: (e: unknown, appUpdated: boolean) => void;
  /** How long it ran, however it ended. */
  readonly onSettled?: (ms: number) => void;
}

export interface SolveRunner {
  readonly computing: boolean;
  readonly progress: SolveProgress | null;
  /** Start a solve in the worker. One already running is superseded (engineClient cancels it). */
  readonly run: (req: SolveRequest, handlers: SolveHandlers) => void;
  readonly cancel: () => void;
}

/**
 * Run solves in the worker, one at a time, for one tab.
 *
 * The run-id guard is the reason this exists as one piece. Starting a solve supersedes the one running,
 * whose rejection then arrives AFTER its replacement began — without a stamp per run, the superseded
 * one's `finally` would clear `computing` while the new one is still going, and the page would look idle
 * mid-solve. Each tab used to carry its own copy of that guard.
 */
export function useSolveRunner(): SolveRunner {
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<SolveProgress | null>(null);
  // Refs, not state: changing them must not re-render.
  const cancelRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);

  const run = (req: SolveRequest, handlers: SolveHandlers): void => {
    const runId = ++runIdRef.current;
    const current = (): boolean => runIdRef.current === runId;
    const startedAt = Date.now();
    setComputing(true);
    setProgress(null);
    const handle = solve(req, (p) => { if (current()) setProgress(p); });
    cancelRef.current = handle.cancel;
    handle.promise
      .then((res) => { if (current()) handlers.onResult(res); })
      .catch((e: unknown) => {
        if (!current() || isCancelled(e)) return;
        handlers.onError(e, isAppUpdated(e));
      })
      .finally(() => {
        if (!current()) return;
        cancelRef.current = null;
        setComputing(false);
        setProgress(null);
        handlers.onSettled?.(Date.now() - startedAt);
      });
  };

  // Cancelling leaves the run current, so its rejection still reaches the `finally` above and resets
  // the page — nothing to unwind here.
  const cancel = (): void => { cancelRef.current?.(); };

  return { computing, progress, run, cancel };
}
