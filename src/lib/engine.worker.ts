/// <reference lib="webworker" />
// The worker side of the solve. Deliberately the thinnest thing that will work: load the engine once,
// then for each request run `runSolve` and post what comes back. All the logic worth testing lives in
// solve.ts, because jsdom provides no Worker and so nothing in THIS file can be unit-tested.
//
// Note it loads its own copy of the patch snapshot rather than receiving one. The main thread still
// needs the data for the mod lists it filters synchronously while you type, so a copy has to exist
// there regardless; sending it across would just add a structured-clone of several MB to startup.
// A second parse costs ~10ms (8ms JSON.parse + 2ms indexPatch, measured), which is also what makes
// cancel-by-terminate cheap enough to be the whole cancellation story — see engineClient.ts.

import { loadEngine } from './engine.ts';
import { runSolve, type SolveProgress, type SolveRequest, type SolveResult } from './solve.ts';

export type WorkerRequest = { readonly id: number; readonly req: SolveRequest };

export type WorkerResponse =
  | { readonly id: number; readonly type: 'progress'; readonly progress: SolveProgress }
  | { readonly id: number; readonly type: 'done'; readonly result: SolveResult }
  | { readonly id: number; readonly type: 'error'; readonly message: string };

const post = (msg: WorkerResponse): void => { (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg); };

self.onmessage = async (e: MessageEvent<WorkerRequest>): Promise<void> => {
  const { id, req } = e.data;
  try {
    const eng = await loadEngine();
    // Progress is posted synchronously from inside the solve. The main thread is NOT free to drain it:
    // every message wakes a React re-render of the progress bar, so the cost is per-message and lands
    // on the thread the worker exists to protect. Value iteration once reported per sweep — ~100,001
    // messages for a solve that renders at most 1001 distinct values — and a 24-second solve took ten
    // minutes in the browser while measuring 24 seconds in node. Solvers must throttle to changes the
    // UI can actually show; this adapter deliberately adds no buffering of its own, so that stays a
    // property of the solver rather than something a thin adapter silently papers over.
    const result = runSolve(eng, req, (progress) => post({ id, type: 'progress', progress }));
    post({ id, type: 'done', result });
  } catch (err) {
    // Errors here are the planner's own "that target is illegal" messages, which the UI shows verbatim,
    // so carry the message across rather than letting the worker die with an unhandled rejection.
    post({ id, type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
