// Main-thread client for the solve worker: start a solve, watch it progress, cancel it.
//
// **Cancellation is `worker.terminate()`.** That reads brutal — it throws away the worker's parsed
// patch data — but that data costs ~10ms to rebuild (8ms JSON.parse + 2ms indexPatch, measured) and
// the fetch behind it is HTTP-cached. Killing and respawning therefore costs about one frame, and it
// works from inside a tight synchronous loop, where a cooperative abort flag would not: the solver
// never yields, so it could not observe a message, and the alternative — SharedArrayBuffer + Atomics —
// would drag in COOP/COEP headers and a solver rewrite to poll them. Terminate needs neither, and
// leaves the pure engine untouched.

import type { SolveProgress, SolveRequest, SolveResult } from './solve.ts';
import type { WorkerRequest, WorkerResponse } from './engine.worker.ts';

/** Thrown into the rejected promise when a solve is cancelled or superseded. Not a failure. */
export class SolveCancelled extends Error {
  constructor() {
    super('solve cancelled');
    this.name = 'SolveCancelled';
  }
}

export const isCancelled = (e: unknown): boolean => e instanceof SolveCancelled;

export interface SolveHandle {
  readonly promise: Promise<SolveResult>;
  /** Stop the solve. The promise rejects with SolveCancelled, which callers should swallow. */
  readonly cancel: () => void;
}

interface InFlight {
  readonly id: number;
  readonly onProgress?: (p: SolveProgress) => void;
  readonly resolve: (r: SolveResult) => void;
  readonly reject: (e: unknown) => void;
}

let worker: Worker | null = null;
let inFlight: InFlight | null = null;
let nextId = 1;

function spawn(): Worker {
  const w = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    // A late message from a superseded request: ignore rather than resolve the wrong solve.
    if (!inFlight || inFlight.id !== msg.id) return;
    if (msg.type === 'progress') { inFlight.onProgress?.(msg.progress); return; }
    const job = inFlight;
    inFlight = null;
    if (msg.type === 'done') job.resolve(msg.result);
    else job.reject(new Error(msg.message));
  };
  w.onerror = (e) => {
    const job = inFlight;
    inFlight = null;
    job?.reject(new Error(e.message || 'the solver crashed'));
  };
  return w;
}

/** Start the worker before it is needed, so the first Compute doesn't also pay for startup. */
export function prewarm(): void {
  if (!worker) worker = spawn();
}

/** Kill the current worker and stand up a replacement, so the next solve starts warm. */
function replaceWorker(): void {
  worker?.terminate();
  worker = spawn();
}

/**
 * Run a solve. Starting one while another is in flight cancels the old one — the user changed their
 * mind, and the stale answer would be discarded anyway.
 */
export function solve(req: SolveRequest, onProgress?: (p: SolveProgress) => void): SolveHandle {
  if (inFlight) cancelInFlight();
  if (!worker) worker = spawn();

  const id = nextId++;
  let settle: Pick<InFlight, 'resolve' | 'reject'>;
  const promise = new Promise<SolveResult>((resolve, reject) => { settle = { resolve, reject }; });
  inFlight = { id, ...settle!, ...(onProgress ? { onProgress } : {}) };

  worker.postMessage({ id, req } satisfies WorkerRequest);
  return { promise, cancel: cancelInFlight };
}

function cancelInFlight(): void {
  const job = inFlight;
  if (!job) return;
  inFlight = null;
  replaceWorker();
  job.reject(new SolveCancelled());
}
