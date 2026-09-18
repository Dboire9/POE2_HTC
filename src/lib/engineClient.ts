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
import { reportError } from './sentry.ts';

/** Thrown into the rejected promise when a solve is cancelled or superseded. Not a failure. */
export class SolveCancelled extends Error {
  constructor() {
    super('solve cancelled');
    this.name = 'SolveCancelled';
  }
}

export const isCancelled = (e: unknown): boolean => e instanceof SolveCancelled;

/**
 * The site was redeployed after this tab loaded, and the solve needed a file the new deployment no
 * longer has. Not a failure of the solver, and not reported as one — the only fix is a reload.
 *
 * It happens every day, not only when code ships: every asset URL is content-hashed, the price sheet
 * is refreshed each morning, and that changes the hash of `prices.json` and of every chunk that names
 * it — the entry and the worker included. A tab left open overnight therefore points at files that
 * are gone. First seen as `Unexpected token 'T', "The page c"... is not valid JSON` (Vercel's text 404
 * page, parsed as the price sheet), reported as a solver crash.
 */
export class AppUpdated extends Error {
  constructor() {
    super('poe2htc was updated since this tab was opened');
    this.name = 'AppUpdated';
  }
}

export const isAppUpdated = (e: unknown): boolean => e instanceof AppUpdated;

/**
 * Is the site now serving a different build from the one this tab is running?
 *
 * Asked only after something has already failed, so it costs nothing on the happy path. The test is
 * the one fact that changes with every deployment that could strand a tab: the entry script's hashed
 * name. This tab's page still carries its own; the live `index.html` carries the current one. A
 * mismatch is a redeploy — which covers every way skew breaks a solve at once (the data files, the
 * worker script a cancel respawns, a lazy chunk) without having to recognise each one's error text.
 *
 * Every doubt answers NO. A dev server, a failed probe, or a page with no hashed entry reads as "not
 * stale", so a genuine crash is still reported rather than hidden behind a guess.
 */
export async function servesNewerBuild(
  doc: Pick<Document, 'querySelector'> = document,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const src = doc.querySelector('script[type="module"][src]')?.getAttribute('src');
  if (!src || !/-[\w-]{6,}\.js$/.test(src)) return false; // no hashed entry: dev, tests — nothing to compare
  try {
    const res = await fetcher('/', { cache: 'no-store' });
    if (!res.ok) return false;
    return !(await res.text()).includes(src);
  } catch {
    return false;
  }
}

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

/**
 * Turn a worker failure into a reported Error on the main thread.
 *
 * **The worker carries no Sentry SDK, deliberately.** It would be the whole 158 kB (gzip) of it, on a
 * thread whose entire job is to keep heavy work off the one the user is looking at — and this app
 * spawns a fresh worker on every cancel. The main thread already has the SDK loaded, and the worker
 * already had an error channel to it, so the cheap move is to send the stack across and report from
 * here. Nothing new is downloaded and nothing about the worker's startup cost changes.
 *
 * The stack belongs to worker code, so the frames are real but the SOURCE is the worker bundle
 * (`engine.worker-*.js`), not the entry chunk. `tags.origin` says which handler saw it so a crash in
 * the solver is not filed next to one in the UI.
 *
 * Cancellation never reaches here: `cancelInFlight` rejects with `SolveCancelled` directly, without
 * going through `onmessage` or `onerror`. So a cancelled solve is not reported as a failure, which it
 * is not.
 */
function fromWorker(message: string, stack: string | undefined, origin: string): Error {
  const err = new Error(message);
  err.name = 'SolverError';
  if (stack) err.stack = stack;
  reportError(err, { tags: { origin } });
  return err;
}

/**
 * What a worker failure should become: `AppUpdated` when the site has moved on under this tab, and a
 * reported `SolverError` otherwise.
 *
 * The staleness check runs FIRST so a redeploy never reaches the issue tracker. It would otherwise land
 * there daily, as a "crash", for every player who left the tab open across the morning price refresh —
 * burying the reports that `SolverError` exists to surface.
 */
async function failureOf(message: string, stack: string | undefined, origin: string): Promise<Error> {
  if (await servesNewerBuild()) return new AppUpdated();
  return fromWorker(message, stack, origin);
}

function spawn(): Worker {
  const w = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    // A late message from a superseded request: ignore rather than resolve the wrong solve.
    if (!inFlight || inFlight.id !== msg.id) return;
    if (msg.type === 'progress') { inFlight.onProgress?.(msg.progress); return; }
    const job = inFlight;
    inFlight = null;
    if (msg.type === 'done') { job.resolve(msg.result); return; }
    void failureOf(msg.message, msg.stack, 'worker-solve').then(job.reject);
  };
  w.onerror = (e) => {
    const job = inFlight;
    inFlight = null;
    /*
     * A worker that failed is not kept.
     *
     * The case that forced this: a Cancel respawns the worker, and on a tab older than the live site
     * its hashed script is gone. The load fails at once — while NOTHING is in flight — so there was no
     * job to reject and the error went nowhere; the worker stayed in `worker`, and every later solve
     * was posted to something that would never answer. Measured end to end: a redeploy under an open
     * tab, then Cancel, then Compute, spun for good. Dropping it means the next solve spawns afresh,
     * and that one's failure lands while its job IS in flight, so `failureOf` gets to name it.
     */
    if (worker === w) { w.terminate(); worker = null; }
    // No `stack` here: `onerror` fires for failures the worker could not catch itself — a module that
    // would not load, a crash in the runtime — so the ErrorEvent's own location is all there is.
    const where = e.filename ? ` (${e.filename}:${e.lineno})` : '';
    // Where the OTHER half of skew lands: a cancel respawns the worker, and after a redeploy its hashed
    // script is gone, so it never starts — an ErrorEvent with no message and nothing to recognise.
    // `failureOf` asks the site rather than the event, which is why it can tell this apart from a crash.
    if (job) void failureOf(`${e.message || 'the solver crashed'}${where}`, undefined, 'worker-fatal').then(job.reject);
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
