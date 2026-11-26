// WHAT A SOLVED PLAN USES: the expected number of each currency spent following it, and of fresh bases.
//
// A starter recipe is read as counts, never as a total — the found sheet's numbers are scarcity weights,
// not Exalted Orbs (foundPrices.ts) — so "about 23 Transmutes, 1 Lesser Essence of Abrasion, 1 Augment
// and 23 bases" (a level-12 Quarterstaff, Physical Damage and Attack Speed at their second tier, measured
// 2026-11-14) IS the answer there. On the trade sheet the same list is the bill, line by line.
//
// EXACT, not sampled. A count is the policy's cost with a price of 1 on one currency and 0 on the rest,
// so every count comes out of the same linear system the solve's closed form costs a fixed policy with
// (`evaluateClosedForm`, markovSolve.ts). That closure lives inside the solve, over its compiled actions;
// the `RouteTable` the solve publishes holds the same policy as plain data — the move each state plays,
// what one play costs, and where it lands — so this reads the table and solves the chain itself, with no
// optimisation re-run. One right-hand side, not one per currency: the expected VISITS to each state,
// and every count is a visit-weighted sum over the states that play it.
//
// Solved the way the closed form is, as a renewal: an attempt runs until it finishes or the policy starts
// over, and a start over begins an identical attempt. So visits are computed per attempt, on the chain
// where a start-over state is terminal (`x`), and scaled by the expected number of attempts, 1/(1 − q),
// q being the chance an attempt ends in a start over. The per-attempt chain is solved exactly: its
// strongly connected pieces in topological order, a piece of one state by division, a larger one by a
// dense solve (`solveDenseInPlace`) — or, past `DENSE_MAX`, by sweeps to a relative 1e-13, and no answer
// at all if those do not settle. Never from a floor: there is a table only on an exact solve or a ceiling
// whose plan was checked to finish (`keepRoutes`, markovReadout.ts), and a plan that reaches a state with
// no move gets no counts here either.
//
// THE IDENTITY that makes this checkable: Σ price × count over `uses`, plus `restartCost × restarts`, is
// the policy's expected cost — the solve's `expectedCost`, to the solver's own tolerance. Charges are
// attributed exactly as the solve makes them: a move's orb and every omen it pays up front
// (`actionPriceParts`, the same parts `stepCost` sums); an Omen of Abyssal Echoes only when the plan
// rerolls, at the chance it does (read back from the table's per-play cost, which is the orb plus that
// expected spend); and a finished item's fill with Exalts (`fillOnFinish`) as Exalted Orbs, one per empty
// slot (read from the goal's value over the Exalt's price). Two charges the identity still holds through
// but no count can carry: an Echoes omen or a fill Exalt priced at 0, whose number of uses the table
// cannot say — both are a fixture's case, never a sheet's.
//
// Measured 2026-11-14: the identity holds to 1e-13–1e-15 relative wherever the solve itself is pinned at
// `tolerance: 1e-12` (at the default tolerance the gap is the solve's, up to ~3e-4); the replay agrees
// with every count within three standard errors (markovUses.test.ts); and it costs a median 0.14 ms on a
// four-target Wand (2,737 states, a 1.4 s solve) and 1.6 ms on a six-target one (15,729 states, 106 s).

import { ECHOES_OMEN } from './cost.ts';
import type { Prices } from './cost.ts';
import { solveDenseInPlace } from './denseSolve.ts';
import type { McAction } from './markovActions.ts';
import { actionPriceParts } from './markovActions.ts';
import type { RouteTable } from './markovRoute.ts';

/** One currency the plan spends, by the sheet key it is priced under. */
export interface MarkovUse {
  /**
   * The sheet key: a `prices.currency` key (`currencyKey` — `transmute`, `exalt_greater`,
   * `essence:lesser:<modId>`, `desecrate` for the base's bone, `annul`, …) or an omen id.
   */
  readonly key: string;
  readonly kind: 'orb' | 'omen';
  /**
   * For an orb: the move that spends it with every omen taken off — what the route's own naming reads
   * (`actionLabel`, src/lib/engineMap.ts), so an Essence is named as the route names it. Absent for an omen.
   */
  readonly action?: McAction;
  /** How many the whole craft uses, on average, following the plan from its start. */
  readonly count: number;
  /** What one costs on the sheet the plan was solved on. */
  readonly price: number;
}

export interface MarkovUses {
  /** Orbs first, then omens; each most-used first. */
  readonly uses: readonly MarkovUse[];
  /** How many times the plan starts over, on average — so the craft takes `1 + restarts` bases. 0 for a craft that cannot. */
  readonly restarts: number;
  /** What a start over costs, as the plan was solved (`MarkovOptions.restartCost`); 0 for a craft that cannot. */
  readonly restartCost: number;
  /** Σ price × count + restartCost × restarts: the policy's expected cost, rebuilt from these counts. */
  readonly expectedCost: number;
}

/** The largest strongly connected piece solved by elimination: ~0.3 s at the limit, as in the solve. */
const DENSE_MAX = 1_000;
/** Sweeps past `DENSE_MAX`: relative change at which a piece is settled, and the cap before giving up. */
const SWEEP_TOL = 1e-13;
const SWEEP_CAP = 1_000_000;

/** The orb a move spends, its omens taken off — the name its count is shown under. */
function orbOf(a: McAction): McAction {
  switch (a.currency) {
    case 'exalt': return { currency: 'exalt', strength: a.strength };
    case 'annul': return { currency: 'annul' };
    case 'desecrate': return a.ancient ? { currency: 'desecrate', ancient: true } : { currency: 'desecrate' };
    case 'perfect-essence': return { currency: 'perfect-essence', target: a.target };
    // A Chaos Orb with the Omen of Whittling is still a Chaos Orb; the omen is its own row.
    case 'chaos': return { currency: 'chaos' };
    default: return a;
  }
}

/** The parts of a `RouteTable` the visit count reads — a plan's moves and where they land. */
export type VisitTable = Pick<RouteTable, 'keys' | 'act' | 'actions' | 'outStart' | 'outTo' | 'outProb' | 'goal' | 'restartIdx'>;

/**
 * How often following the plan in `table` from its start passes through each state, on average —
 * expected VISITS, start overs included (a state a craft passes on every attempt counts once per attempt),
 * and for a goal the chance of finishing there. `order` is every state the plan reaches from its start.
 *
 * Undefined when the plan from the start reaches a state with no move, never finishes, or a piece of its
 * chain is too large to settle — see `markovUses`, which counts currencies from these.
 */
export function markovVisits(
  table: VisitTable,
  /** The largest piece solved by elimination — lowered only by the test that pins the two paths together. */
  opts: { readonly denseMax?: number } = {},
): { readonly visits: Float64Array; readonly order: readonly number[] } | undefined {
  const denseMax = opts.denseMax ?? DENSE_MAX;
  const n = table.keys.length;
  const start = table.restartIdx;
  const { act, actions, outStart, outTo, outProb, goal } = table;
  const isRestartIdx = (i: number): boolean => act[i]! >= 0 && actions[act[i]!]!.currency === 'restart';
  const terminal = (i: number): boolean => goal[i] === 1 || isRestartIdx(i);

  // ── The per-attempt chain's states: everything the plan reaches from the start before it ends. ──
  const reached = new Uint8Array(n);
  const order: number[] = [];
  reached[start] = 1;
  for (const stack = [start]; stack.length > 0;) {
    const i = stack.pop()!;
    order.push(i);
    if (terminal(i)) continue;
    if (act[i]! < 0) return undefined; // a state with no move: the plan does not finish from here
    for (let o = outStart[i]!; o < outStart[i + 1]!; o++) {
      const j = outTo[o]!;
      if (reached[j] === 0) { reached[j] = 1; stack.push(j); }
    }
  }

  // ── Strongly connected pieces of the non-terminal states, iteratively (Tarjan). ──
  // Emitted sinks first; read backwards that is topological order, which is the order visits flow in.
  const index = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const onStack = new Uint8Array(n);
  const sccStack: number[] = [];
  const pieces: number[][] = [];
  let counter = 0;
  for (const root of order) {
    if (terminal(root) || index[root] !== -1) continue;
    const work: [number, number][] = [[root, outStart[root]!]];
    index[root] = low[root] = counter++;
    sccStack.push(root); onStack[root] = 1;
    while (work.length > 0) {
      const top = work[work.length - 1]!;
      const v = top[0];
      if (top[1] < outStart[v + 1]!) {
        const w = outTo[top[1]++]!;
        if (w === v || terminal(w)) continue;
        if (index[w] === -1) {
          index[w] = low[w] = counter++;
          sccStack.push(w); onStack[w] = 1;
          work.push([w, outStart[w]!]);
        } else if (onStack[w] === 1) low[v] = Math.min(low[v]!, index[w]!);
        continue;
      }
      work.pop();
      if (work.length > 0) { const u = work[work.length - 1]![0]; low[u] = Math.min(low[u]!, low[v]!); }
      if (low[v] === index[v]) {
        const piece: number[] = [];
        let w: number;
        do { w = sccStack.pop()!; onStack[w] = 0; piece.push(w); } while (w !== v);
        pieces.push(piece);
      }
    }
  }

  // ── Expected visits per attempt, piece by piece in topological order. ──
  // `inflow[i]` is what arrives at i from outside its piece (the start's 1 included); for a terminal it
  // ends as the visits it receives.
  const inflow = new Float64Array(n);
  inflow[start] = 1;
  const x = new Float64Array(n);
  const inPiece = new Int32Array(n).fill(-1);
  for (let p = pieces.length - 1; p >= 0; p--) {
    const piece = pieces[p]!;
    const m = piece.length;
    for (let r = 0; r < m; r++) inPiece[piece[r]!] = r;
    if (m === 1) {
      const i = piece[0]!;
      let self = 0;
      for (let o = outStart[i]!; o < outStart[i + 1]!; o++) if (outTo[o] === i) self += outProb[o]!;
      if (!(1 - self > 1e-12)) return undefined; // only loops back on itself: never moves on
      x[i] = inflow[i]! / (1 - self);
    } else if (m <= denseMax) {
      // Row r: x_r − Σ_u p(u→r)·x_u = inflow_r, over u in this piece (r itself included).
      const A = new Float64Array(m * m);
      const b = new Float64Array(m);
      for (let r = 0; r < m; r++) { A[r * m + r] = 1; b[r] = inflow[piece[r]!]!; }
      for (let c = 0; c < m; c++) {
        const u = piece[c]!;
        for (let o = outStart[u]!; o < outStart[u + 1]!; o++) {
          const r = inPiece[outTo[o]!]!;
          if (r >= 0) A[r * m + c] = A[r * m + c]! - outProb[o]!;
        }
      }
      if (!solveDenseInPlace(A, m, [b])) return undefined;
      for (let r = 0; r < m; r++) x[piece[r]!] = b[r]!;
    } else if (!sweepPiece(table, piece, inPiece, inflow, x)) {
      return undefined;
    }
    for (const u of piece) {
      for (let o = outStart[u]!; o < outStart[u + 1]!; o++) {
        const t = outTo[o]!;
        if (inPiece[t] === -1) inflow[t] = inflow[t]! + x[u]! * outProb[o]!;
      }
    }
    for (const u of piece) inPiece[u] = -1;
  }
  for (const i of order) if (terminal(i)) x[i] = inflow[i]!;

  // ── Renewal: an attempt ends finished, or in a start over that begins the next one. ──
  let q = 0;
  for (const i of order) if (isRestartIdx(i)) q += x[i]!;
  if (!(q < 1 - 1e-15)) return undefined; // never finishes
  const attempts = 1 / (1 - q);

  const visits = new Float64Array(n);
  for (const i of order) visits[i] = x[i]! * attempts;
  return { visits, order };
}

/**
 * The expected number of each currency the plan in `table` uses from its start, and of start overs.
 *
 * `prices` must be the sheet the plan was solved on, resolved for the base (`pricesForBase`) as the solve
 * resolves it — a Desecration's bone is priced per base. Undefined when the plan from the start reaches a
 * state with no move, never finishes, or a piece of its chain is too large to settle.
 */
export function markovUses(
  table: RouteTable, prices: Prices,
  /** The largest piece solved by elimination — lowered only by the test that pins the two paths together. */
  opts: { readonly denseMax?: number } = {},
): MarkovUses | undefined {
  const counted = markovVisits(table, opts);
  if (!counted) return undefined;
  const { visits: seen, order } = counted;
  const { act, actions, actCost, goal, value } = table;

  // ── Counts: each state's visits, charged to what its move spends. ──
  const byKey = new Map<string, { kind: 'orb' | 'omen'; action?: McAction; count: number; price: number }>();
  const add = (key: string, kind: 'orb' | 'omen', price: number, count: number, action?: McAction): void => {
    const e = byKey.get(key);
    if (e) e.count += count;
    else byKey.set(key, { kind, count, price, ...(action ? { action } : {}) });
  };
  const echoesPrice = prices.omens[ECHOES_OMEN];
  const exaltPrice = prices.currency['exalt'];
  let restarts = 0;
  let restartCost = 0;
  for (const i of order) {
    const visits = seen[i]!;
    if (!(visits > 0)) continue;
    if (goal[i] === 1) {
      // What finishing here costs: nothing, or one Exalt per empty slot (`fillOnFinish`).
      const fill = value[i]!;
      if (fill > 0 && exaltPrice !== undefined && exaltPrice > 0) {
        add('exalt', 'orb', exaltPrice, visits * (fill / exaltPrice), { currency: 'exalt', strength: 'base' });
      }
      continue;
    }
    const a = actions[act[i]!]!;
    if (a.currency === 'restart') { restarts += visits; restartCost = a.cost; continue; }
    for (const part of actionPriceParts(prices, a)) {
      add(part.key, part.kind, part.price, visits, part.kind === 'orb' ? orbOf(a) : undefined);
    }
    // The Echoes omen is paid on a reroll only, at the chance this state rerolls: the table's per-play
    // cost is the up-front price plus exactly that expected spend (`published`, markovReadout.ts).
    if (a.currency === 'desecrate' && a.echoes && echoesPrice !== undefined && echoesPrice > 0) {
      const rerolls = Math.max(0, actCost[i]! - upFront(prices, a)) / echoesPrice;
      add(ECHOES_OMEN, 'omen', echoesPrice, visits * rerolls);
    }
  }

  const uses: MarkovUse[] = [...byKey].map(([key, e]) => ({ key, ...e }))
    .filter((u) => u.count > 0)
    .sort((a, b) => (a.kind === b.kind ? b.count - a.count : a.kind === 'orb' ? -1 : 1));
  let expectedCost = restartCost * restarts;
  for (const u of uses) expectedCost += u.price * u.count;
  return { uses, restarts, restartCost, expectedCost };
}

/** What a move charges up front — `actionCostOf` — read through the same parts this file counts. */
function upFront(prices: Prices, a: McAction): number {
  let c = 0;
  for (const part of actionPriceParts(prices, a)) c += part.price;
  return c;
}

/**
 * Visits for a piece too large to eliminate: Gauss-Seidel sweeps of x_r = (inflow_r + Σ p(u→r)·x_u) /
 * (1 − p(r→r)) until no state moves by more than `SWEEP_TOL` of itself. False if it does not settle.
 */
function sweepPiece(
  table: VisitTable, piece: readonly number[], inPiece: Int32Array, inflow: Float64Array, x: Float64Array,
): boolean {
  const { outStart, outTo, outProb } = table;
  const m = piece.length;
  // Predecessors within the piece, by position: who sends visits to r, and with what odds.
  const preds: { from: number[]; prob: number[]; self: number }[] = piece.map(() => ({ from: [], prob: [], self: 0 }));
  for (let c = 0; c < m; c++) {
    const u = piece[c]!;
    for (let o = outStart[u]!; o < outStart[u + 1]!; o++) {
      const r = inPiece[outTo[o]!]!;
      if (r < 0) continue;
      if (r === c) preds[r]!.self += outProb[o]!;
      else { preds[r]!.from.push(c); preds[r]!.prob.push(outProb[o]!); }
    }
  }
  const v = new Float64Array(m);
  for (let sweep = 0; sweep < SWEEP_CAP; sweep++) {
    let worst = 0;
    for (let r = 0; r < m; r++) {
      const pr = preds[r]!;
      if (!(1 - pr.self > 1e-12)) return false;
      let acc = inflow[piece[r]!]!;
      for (let k = 0; k < pr.from.length; k++) acc += pr.prob[k]! * v[pr.from[k]!]!;
      const next = acc / (1 - pr.self);
      const change = Math.abs(next - v[r]!) / Math.max(Math.abs(next), 1e-300);
      if (change > worst) worst = change;
      v[r] = next;
    }
    if (worst <= SWEEP_TOL) {
      for (let r = 0; r < m; r++) x[piece[r]!] = v[r]!;
      return true;
    }
  }
  return false;
}
