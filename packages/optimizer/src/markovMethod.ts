// "Check my method": a player's own strategy, costed exactly and compared with the best plan.
//
// A METHOD is a short list of rules read top to bottom — "if ⟨the item looks like this⟩, play ⟨this move⟩"
// — then an "otherwise". It is plain JSON (it crosses the worker boundary and sits in localStorage), and
// it speaks only of what a state really holds: per SLOT (one target row, any of its alternatives), never
// per alternative, because the state cannot tell same-family alternatives apart (they share one bit) nor
// interchangeable ones (one spelling is kept) — markovSymmetry.ts.
//
// Checking it is three steps over the same lattice the solve used (markovLattice.ts):
//   • COMPILE: walk the states the method reaches from the start and, at each, find its move among the
//     moves the solve itself could play there — by exact spelling, or through a FOLD ALIAS (`pusher` in
//     markovActions.ts keeps one spelling of each outcome distribution, and records the dearer ones it
//     dropped against it: same outcomes, the player's own price). A move that is not there is NOT
//     POSSIBLE there, and the check stops on the first such state and says why. It never substitutes a
//     move (the maintainer's ruling, 2026-11-26).
//   • EVALUATE: the method as a `RouteTable`, its expected visits per state from `markovVisits`
//     (markovUses.ts — exact, a renewal over strongly connected pieces), so its cost is Σ visits × what
//     each play costs. A method that can loop forever is caught BEFORE that, by reachability: the first
//     state it reaches from which no finish is reachable is reported.
//   • COMPARE: where the method's move differs from the best plan's, what that costs per finished item:
//     loss(s) = visits(s) × (Q*(s, your move) − V*(s)), Q* = cost + Σ p·V* over every outcome, the
//     self-loop included. These add up to the whole gap — the performance-difference identity, asserted
//     in markovMethod.test.ts — so "where it costs you" accounts for every currency of it.
//
// A Desecration shows three modifiers and the player keeps one. Which one a player keeps is not a rule
// here: the method keeps the offer the BEST plan would keep (the one cheapest to finish from by V*), and
// throws an Omen of Abyssal Echoes offer back where the best plan's line says to. The result says so.
//
// Never `evaluateClosedForm` (markovSolve.ts): it treats a state the optimum cannot finish from as worth 0,
// which is right for the optimum and wrong for an arbitrary method.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import { bossOmenAllowed, type DesecrationBossOmen } from '../../engine/src/probability.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { ECHOES_OMEN, cheapestEssenceLevel, essenceLevelOf, stepIsPriced } from './cost.ts';
import type { ExaltStrength, McAction } from './markovActions.ts';
import { actionCostOf, allowsAction, pricedStepOf } from './markovActions.ts';
import type { MarkovOptions, MarkovResult } from './markovFromItem.ts';
import { boneRole } from './markovFromItem.ts';
import type { CompiledAction, McLattice } from './markovLattice.ts';
import { buildLattice } from './markovLattice.ts';
import { offerValuer } from './markovOffer.ts';
import type { McProblem } from './markovProblem.ts';
import { resolveProblem } from './markovProblem.ts';
import { planTable, tableFrame } from './markovReadout.ts';
import type { ReplayOptions, ReplayReport } from './markovReplay.ts';
import { replayPolicy } from './markovReplay.ts';
import type { RouteTable } from './markovRoute.ts';
import { flagFieldsOf } from './markovRoute.ts';
import { solveLattice } from './markovSolve.ts';
import type { McRarity, McState, ObstacleMasks, SideIndex, StateKey } from './markovState.ts';
import {
  decodeState, hasDesecrated, isAccepting, perSideCap, popcount, prefUsed, representative, sufUsed,
} from './markovState.ts';
import { markovVisits } from './markovUses.ts';
import type { TierTarget } from './optimize.ts';

type Side = 'prefix' | 'suffix';
export type Compare = '=' | '>=' | '<=';

/**
 * One test on the item. A SLOT is an index into the craft's slots in the order their first target
 * appears (`slotIndexGroups` over the targets as asked — the Plan tab's rows), which is also the order of
 * `RouteTable.slotMasks`. Its three readings are exclusive: `present` when any of its alternatives is on
 * the item at the asked tier; else `blocked` when one is below that tier or another mod of its family
 * holds the place; else `missing`. JUNK counts the mods nobody asked for on a side, a sibling that blocks
 * a target included; OPEN counts the free places on a side at the item's rarity.
 */
export type Condition =
  | { readonly kind: 'slot'; readonly slot: number; readonly is: 'present' | 'missing' | 'blocked' }
  | { readonly kind: 'junk'; readonly side: Side | 'total'; readonly op: Compare; readonly n: number }
  | { readonly kind: 'open'; readonly side: Side; readonly op: Compare; readonly n: number }
  | { readonly kind: 'rarity'; readonly is: McRarity }
  /**
   * The modifier a Desecration placed (an item holds at most one): none on the item, a mod nobody asked
   * for (`junk` — "bone junk is on the item"), or one of the mods asked for (`wanted`).
   */
  | { readonly kind: 'bone'; readonly is: 'none' | 'junk' | 'wanted' };

/** A move, as the player names it — everything the true cost plays (no Alchemy, no Whittling). */
export type MoveSpec =
  | { readonly currency: 'transmute' | 'augment' | 'regal'; readonly strength: ExaltStrength }
  | { readonly currency: 'exalt'; readonly strength: ExaltStrength; readonly side?: Side }
  | { readonly currency: 'chaos' }
  | { readonly currency: 'annul'; readonly side?: Side; readonly light?: true }
  /** The regular Essence that gives this slot's modifier, at the level the solve buys. */
  | { readonly currency: 'essence'; readonly slot: number }
  | { readonly currency: 'perfect-essence'; readonly slot: number; readonly side?: Side }
  | {
    readonly currency: 'desecrate'; readonly ancient?: true; readonly boss?: DesecrationBossOmen;
    readonly side?: Side; readonly echoes?: true;
  }
  | { readonly currency: 'restart' };

/** "If every condition holds, play this move" — an empty `when` always holds. */
export interface MethodRule {
  readonly when: readonly Condition[];
  readonly move: MoveSpec;
}

/** Rules read top to bottom, the first that holds wins; `otherwise` where none does. */
export interface Method {
  readonly rules: readonly MethodRule[];
  readonly otherwise: MoveSpec;
}

/** Which rule chose a move: its index in `rules`, or the otherwise row. */
export type RuleRef = number | 'otherwise';

/** Why a move cannot be played at a state — each one a reason the action space leaves it out. */
export type NotPossibleWhy =
  | 'excluded' | 'unpriced' | 'needs-normal' | 'needs-magic' | 'needs-rare' | 'no-room' | 'nothing-to-remove'
  | 'no-desecrated-mod' | 'already-desecrated' | 'no-desecration' | 'boss-not-here' | 'boss-not-modelled'
  | 'no-essence' | 'no-perfect-essence' | 'cannot-start-over' | 'no-effect';

export type MethodStop =
  /** The rule's move is not one the item can take at `state` (an index into the table's `keys`). */
  | {
    readonly kind: 'not-possible'; readonly rule: RuleRef; readonly state: number; readonly spec: MoveSpec;
    /** The move as an action, when the spec names one in this craft (an Essence slot may not). */
    readonly action?: McAction; readonly why: NotPossibleWhy;
  }
  /** From `state` (the first such state the method reaches) nothing the method plays ever finishes. */
  | { readonly kind: 'never-finishes'; readonly rule: RuleRef; readonly state: number }
  /** The method finishes, but its chain is too large to settle (`markovVisits`). */
  | { readonly kind: 'unsettled' }
  /** The method names a slot this craft does not have. */
  | { readonly kind: 'invalid'; readonly rule: RuleRef; readonly slot: number };

/** One state where the method's move differs from the best plan's, and what that costs per finished item. */
export interface MethodLoss {
  readonly state: number;
  readonly rule: RuleRef;
  readonly move: McAction;
  readonly best: McAction;
  /** How often a finished item passes this state under the method, on average. */
  readonly visits: number;
  /** visits × (Q*(state, move) − V*(state)) — this state's share of the gap. */
  readonly loss: number;
}

export interface MethodChecked {
  readonly ok: true;
  /** The method as a plan over the lattice — only the states it reaches carry a move. `value` is V*. */
  readonly table: RouteTable;
  /** The method's exact expected cost from the start. */
  readonly cost: number;
  /** The best plan's: V*(start), with its bound. */
  readonly bestCost: number;
  readonly bound: 'exact' | 'lower' | 'upper';
  /** cost − bestCost; only when the best plan is exact. Σ `losses[].loss` equals it. */
  readonly gap?: number;
  /**
   * Every state where the method's move costs more than the best plan's, largest first; empty unless the
   * best plan is exact. They sum to `gap` (to ~1e-12 of the cost at a tight tolerance).
   */
  readonly losses: readonly MethodLoss[];
  /** Expected visits per state (index into `table.keys`) — Σ over goals is 1. */
  readonly visits: Float64Array;
  /** The method played on real items, when asked. */
  readonly replay?: ReplayReport;
  /** The method plays a Desecration somewhere it goes, keeping the offer the best plan would keep. */
  readonly keepsOffers: boolean;
  /** Moves the method plays that the solve folds into a cheaper spelling — each priced at its own price. */
  readonly folded: readonly McAction[];
}

export type MethodCheck = MethodChecked | { readonly ok: false; readonly table: RouteTable; readonly stop: MethodStop };

// ── Reading a state ────────────────────────────────────────────────────────────────────────────────

/** What a condition needs to read a state. `side` and `limits` only for `open`. */
export interface MethodFrame {
  readonly slotMasks: readonly number[];
  readonly obstacles: ObstacleMasks;
  readonly side?: SideIndex;
  readonly limits?: { readonly prefixes: number; readonly suffixes: number };
}

const compare = (op: Compare, a: number, b: number): boolean => (op === '=' ? a === b : op === '>=' ? a >= b : a <= b);

/** A slot's one reading in `st` — see `Condition`. */
export function slotIs(st: McState, mask: number): 'present' | 'missing' | 'blocked' {
  if ((st.present & mask) !== 0) return 'present';
  return (st.blocked & mask) !== 0 ? 'blocked' : 'missing';
}

/** Junk per side as the player counts it: the junk counters plus any sibling on the item that blocks a target. */
export function junkOf(st: McState, obstacles: ObstacleMasks): { prefix: number; suffix: number } {
  return { prefix: st.jp + popcount(st.present & obstacles.prefix), suffix: st.js + popcount(st.present & obstacles.suffix) };
}

/** Where the Desecration's mark sits — `flagFieldsOf`'s reading, so a marked sibling counts as junk as it reads. */
export function boneOf(st: McState, obstacles: ObstacleMasks): 'none' | 'junk' | 'wanted' {
  if (st.flagged === 0) return 'none';
  return flagFieldsOf(st, [], obstacles).desecratedJunk !== undefined ? 'junk' : 'wanted';
}

export function holds(c: Condition, st: McState, f: MethodFrame): boolean {
  switch (c.kind) {
    case 'slot': return slotIs(st, f.slotMasks[c.slot] ?? 0) === c.is;
    case 'junk': {
      const j = junkOf(st, f.obstacles);
      return compare(c.op, c.side === 'total' ? j.prefix + j.suffix : j[c.side], c.n);
    }
    case 'open': {
      if (!f.side || !f.limits) throw new Error('an open-slot condition needs the craft’s sides and limits');
      const open = c.side === 'prefix'
        ? perSideCap(st.rarity, f.limits.prefixes) - prefUsed(st, f.side)
        : perSideCap(st.rarity, f.limits.suffixes) - sufUsed(st, f.side);
      return compare(c.op, open, c.n);
    }
    case 'rarity': return st.rarity === c.is;
    case 'bone': return boneOf(st, f.obstacles) === c.is;
  }
}

/** The first rule that holds in `st`, or the otherwise row. */
export function ruleFor(method: Method, st: McState, f: MethodFrame): { rule: RuleRef; move: MoveSpec } {
  for (let r = 0; r < method.rules.length; r++) {
    const rule = method.rules[r]!;
    if (rule.when.every((c) => holds(c, st, f))) return { rule: r, move: rule.move };
  }
  return { rule: 'otherwise', move: method.otherwise };
}

/** One spelling per move, whatever order its fields were written in. */
export function actionId(a: McAction): string {
  const x = a as Partial<Record<string, unknown>>;
  return ['currency', 'strength', 'side', 'light', 'whittling', 'boss', 'ancient', 'echoes', 'target', 'tierIndex']
    .map((k) => (x[k] === undefined ? '' : JSON.stringify(x[k]))).join('|');
}

// ── Setting the craft up ───────────────────────────────────────────────────────────────────────────

/** The craft a method is checked on: the solve's own problem and lattice, rebuilt from the same inputs. */
export interface MethodCraft {
  readonly problem: McProblem;
  readonly lattice: McLattice;
  readonly opts: MarkovOptions;
}

/**
 * Resolve and build the lattice exactly as `markovFromItem` does for these inputs — or the reason it
 * cannot be (the same refusal the solve gives, or a finished item, where there is nothing to check).
 */
export function methodCraft(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
): MethodCraft | { readonly refused: string } {
  const bones = boneRole(data, prices, start, targets, opts.policy);
  const refuse = (reason: string): { answer: MarkovResult } => ({
    answer: { expectedCost: Infinity, feasible: false, converged: true, bound: 'exact', reason, nodes: [], edges: [], policy: new Map() },
  });
  const problem = resolveProblem(data, prices, start, targets, opts, bones, refuse);
  if ('answer' in problem) {
    return { refused: problem.answer.feasible ? 'the item already is the target' : problem.answer.reason ?? 'no plan' };
  }
  const lattice = buildLattice(problem, opts, refuse);
  if ('answer' in lattice) return { refused: lattice.answer.reason ?? 'no plan' };
  return { problem, lattice, opts };
}

/** Whether a solved table is over exactly this lattice — the same states in the same order. */
export function sameLattice(routes: RouteTable, lattice: McLattice): boolean {
  const a = routes.keys;
  const b = lattice.allStates;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** The best plan's values over the craft: the table already solved when it is this lattice's, else one solve. */
export function bestValues(
  craft: MethodCraft, best?: { readonly routes: RouteTable; readonly bound: 'exact' | 'lower' | 'upper' },
): { readonly V: Float64Array; readonly bound: 'exact' | 'lower' | 'upper'; readonly reused: boolean } | { readonly refused: string } {
  if (best && sameLattice(best.routes, craft.lattice)) return { V: best.routes.value, bound: best.bound, reused: true };
  const refuse = (reason: string, why: { stoppedEarly?: true } = {}): { answer: MarkovResult } => ({
    answer: { expectedCost: Infinity, feasible: false, converged: true, bound: 'exact', reason, ...why, nodes: [], edges: [], policy: new Map() },
  });
  const solved = solveLattice(craft.problem, craft.lattice, craft.opts, refuse);
  if ('answer' in solved) return { refused: solved.answer.reason ?? 'no plan' };
  return { V: solved.V, bound: solved.bound, reused: false };
}

// ── The check ──────────────────────────────────────────────────────────────────────────────────────

/** A move found among a state's moves: what it is, what one play costs, where it lands. */
interface Played {
  readonly rule: RuleRef;
  readonly action: McAction;
  readonly cost: number;
  readonly to: readonly number[];
  readonly prob: readonly number[];
  /** Q*: cost + Σ prob × V*. */
  readonly q: number;
  readonly folded: boolean;
  readonly rerollAbove: number;
}
interface Unplayable { readonly rule: RuleRef; readonly spec: MoveSpec; readonly action?: McAction; readonly why: NotPossibleWhy }

export function methodFrame(p: McProblem): MethodFrame {
  return { slotMasks: p.slotMasks, obstacles: p.siblings.obstacles, side: p.side, limits: p.limits };
}

/**
 * Check `method` on a craft against the best plan's values `V` (`bestValues`). Stops on the first state
 * the method reaches where its move is not possible, or from which it never finishes; otherwise costs it.
 */
export function checkMethod(
  craft: MethodCraft, V: Float64Array, bound: 'exact' | 'lower' | 'upper', method: Method,
  opts: { readonly replay?: ReplayOptions } = {},
): MethodCheck {
  const { problem: p, lattice: l } = craft;
  const policy = craft.opts.policy;
  const { N, allStates, compiled, isGoalIdx, finishCost } = l;
  const frame = methodFrame(p);
  const start = l.idxOfState.get(p.restartKey)!;
  const valuer = offerValuer(V, l.widestOffer);
  const played: (Played | undefined)[] = new Array<Played | undefined>(N);

  /** The method's moves as a `RouteTable` over the whole lattice (V* as its values). */
  const tableOf = (): RouteTable => {
    const act = new Int32Array(N).fill(-1);
    const actCost = new Float64Array(N);
    const rerollAbove = new Float64Array(N).fill(NaN);
    const outStart = new Int32Array(N + 1);
    const outTo: number[] = [];
    const outProb: number[] = [];
    const actions: McAction[] = [];
    const ids = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      outStart[i] = outTo.length;
      const pl = played[i];
      if (!pl) continue;
      const id = actionId(pl.action);
      let a = ids.get(id);
      if (a === undefined) { a = actions.length; actions.push(pl.action); ids.set(id, a); }
      act[i] = a;
      actCost[i] = pl.cost;
      rerollAbove[i] = pl.rerollAbove;
      for (let j = 0; j < pl.to.length; j++) { outTo.push(pl.to[j]!); outProb.push(pl.prob[j]!); }
    }
    outStart[N] = outTo.length;
    return planTable(tableFrame(p, l), {
      value: V, act, actions, actCost, outStart, outTo: Int32Array.from(outTo), outProb: Float64Array.from(outProb), rerollAbove,
    });
  };
  const stopped = (stop: MethodStop): MethodCheck => ({ ok: false, table: tableOf(), stop });

  // A slot the method names must exist; checked once, up front, rather than at whichever state reads it.
  const slots = p.slotMasks.length;
  const badSlot = (s: number): boolean => !Number.isInteger(s) || s < 0 || s >= slots;
  const rows: { rule: RuleRef; rr: MethodRule }[] = [
    ...method.rules.map((rr, r) => ({ rule: r, rr })), { rule: 'otherwise', rr: { when: [], move: method.otherwise } },
  ];
  for (const { rule, rr } of rows) {
    for (const c of rr.when) if (c.kind === 'slot' && badSlot(c.slot)) return stopped({ kind: 'invalid', rule, slot: c.slot });
    const m = rr.move;
    if ((m.currency === 'essence' || m.currency === 'perfect-essence') && badSlot(m.slot)) {
      return stopped({ kind: 'invalid', rule, slot: m.slot });
    }
  }

  const playAt = (i: number): Played | Unplayable => {
    const st = decodeState(allStates[i]!);
    const { rule, move } = ruleFor(method, st, frame);
    const action = toAction(p, craft.opts, policy, move);
    if (action === undefined) return { rule, spec: move, why: move.currency === 'essence' ? 'no-essence' : 'no-perfect-essence' };
    const found = resolve(compiled[i]!, action, p.prices);
    if (!found) return { rule, spec: move, action, why: whyNot(p, l, policy, st, action) };
    const { ca, cost: own, folded } = found;
    const to: number[] = [];
    const prob: number[] = [];
    let cost = own;
    let rerollAbove = NaN;
    if (ca.offer > 1) {
      const w = new Float64Array(ca.to.length);
      valuer.keepWeights(ca, w, true);
      if (valuer.last.throw > 0) { cost += valuer.last.throw * ca.rerollCost; rerollAbove = valuer.last.bar; }
      for (let j = 0; j < ca.to.length; j++) if (w[j]! > 0) { to.push(ca.to[j]!); prob.push(w[j]!); }
    } else {
      for (let j = 0; j < ca.to.length; j++) { to.push(ca.to[j]!); prob.push(ca.prob[j]!); }
      if (ca.selfProb > 0) { to.push(i); prob.push(ca.selfProb); }
    }
    let q = cost;
    for (let j = 0; j < to.length; j++) q += prob[j]! * V[to[j]!]!;
    return { rule, action, cost, to, prob, q, folded, rerollAbove };
  };

  // ── Compile: the states the method reaches, breadth first, stopping at the first move it cannot play. ──
  const reached = new Uint8Array(N);
  const order: number[] = [start];
  reached[start] = 1;
  for (let k = 0; k < order.length; k++) {
    const i = order[k]!;
    if (isGoalIdx[i] === 1) continue;
    const got = playAt(i);
    if (!('q' in got)) {
      return stopped({ kind: 'not-possible', rule: got.rule, state: i, spec: got.spec, ...(got.action ? { action: got.action } : {}), why: got.why });
    }
    played[i] = got;
    for (const j of got.to) if (reached[j] === 0) { reached[j] = 1; order.push(j); }
  }
  const table = tableOf();

  // ── A method that can loop forever: the first state it reaches with no finish reachable from it. ──
  const finishes = new Uint8Array(N);
  const into: number[][] = new Array<number[]>(N);
  for (const i of order) {
    for (const j of played[i]?.to ?? []) (into[j] ??= []).push(i);
  }
  const queue = order.filter((i) => isGoalIdx[i] === 1);
  for (const i of queue) finishes[i] = 1;
  for (let k = 0; k < queue.length; k++) {
    for (const u of into[queue[k]!] ?? []) if (finishes[u] === 0) { finishes[u] = 1; queue.push(u); }
  }
  const stuck = order.find((i) => finishes[i] === 0);
  if (stuck !== undefined) return { ok: false, table, stop: { kind: 'never-finishes', rule: played[stuck]!.rule, state: stuck } };

  const counted = markovVisits(table);
  if (!counted) return { ok: false, table, stop: { kind: 'unsettled' } };
  const { visits } = counted;

  // ── Its cost, and where it differs from the best plan. ──
  let cost = 0;
  const tiny = 1e-12 * Math.max(1, Math.abs(V[start]!));
  const losses: MethodLoss[] = [];
  const folded = new Map<string, McAction>();
  let keepsOffers = false;
  for (const i of counted.order) {
    const v = visits[i]!;
    if (isGoalIdx[i] === 1) { cost += v * finishCost[i]!; continue; }
    const pl = played[i]!;
    cost += v * pl.cost;
    if (pl.folded) folded.set(actionId(pl.action), pl.action);
    if (pl.action.currency === 'desecrate') keepsOffers = true;
    if (bound !== 'exact') continue;
    // Where the method plays the plan's own move this is ≤ 0 up to rounding: an exact V* is that plan's
    // value (policy iteration costs it in closed form; value iteration's phase B descends, T(V) ≤ V).
    const loss = v * (pl.q - V[i]!);
    if (loss > tiny) losses.push({ state: i, rule: pl.rule, move: pl.action, best: bestMove(compiled[i]!, valuer), visits: v, loss });
  }
  losses.sort((a, b) => b.loss - a.loss);
  const bestCost = V[start]!;

  const replay = opts.replay ? replayMethod(craft, V, played, playAt, opts.replay) : undefined;
  return {
    ok: true, table, cost, bestCost, bound, ...(bound === 'exact' ? { gap: cost - bestCost } : {}),
    losses, visits, ...(replay ? { replay } : {}), keepsOffers, folded: [...folded.values()],
  };
}

/** The move a spec names in this craft — undefined for an Essence slot with no Essence modelled. */
function toAction(p: McProblem, opts: MarkovOptions, policy: CurrencyPolicy | undefined, m: MoveSpec): McAction | undefined {
  switch (m.currency) {
    case 'restart': return { currency: 'restart', cost: opts.restartCost ?? 0 };
    case 'essence': {
      const i = p.list.findIndex((t, k) => (p.slotMasks[m.slot]! & (1 << k)) !== 0 && representative(t).source === 'essence');
      if (i < 0) return undefined;
      const mod = representative(p.list[i]!);
      const tierIndex = cheapestEssenceLevel(p.prices, mod, p.list[i]!.mods[0]!.minIndex, p.level, policy);
      return { currency: 'essence', target: mod.id, tierIndex, level: essenceLevelOf(mod.tiers[tierIndex]?.name) };
    }
    case 'perfect-essence': {
      const i = p.list.findIndex((t, k) => (p.slotMasks[m.slot]! & (1 << k)) !== 0 && representative(t).source === 'perfect_essence');
      if (i < 0) return undefined;
      return { currency: 'perfect-essence', target: representative(p.list[i]!).id, ...(m.side ? { side: m.side } : {}) };
    }
    default: return m;
  }
}

/**
 * The compiled move that plays `action` here, and what one play costs: the move itself; a dearer spelling
 * the solve folded into a cheaper one (same outcomes, the player's price); or — where every Desecration is
 * offered with an Omen of Abyssal Echoes — the plain draw, which is that move with no reroll.
 */
function resolve(
  acts: readonly CompiledAction[], action: McAction, prices: Prices,
): { ca: CompiledAction; cost: number; folded: boolean } | undefined {
  const id = actionId(action);
  for (const ca of acts) if (actionId(ca.def.action) === id) return { ca, cost: ca.cost, folded: false };
  for (const ca of acts) {
    if (ca.def.aliases?.some((a) => actionId(a) === id)) return { ca, cost: actionCostOf(prices, action), folded: true };
  }
  if (action.currency === 'desecrate' && !action.echoes) {
    const omened = actionId({ ...action, echoes: true });
    for (const ca of acts) {
      const exact = actionId(ca.def.action) === omened;
      if (!exact && !ca.def.aliases?.some((a) => actionId(a) === omened)) continue;
      const plain: CompiledAction = {
        ...ca, def: { action, cost: actionCostOf(prices, action), dist: ca.def.dist, ...(ca.def.offer ? { offer: ca.def.offer } : {}) },
        cost: actionCostOf(prices, action), rerollCost: Infinity, order: Int32Array.from(ca.order),
      };
      return { ca: plain, cost: plain.cost, folded: !exact };
    }
  }
  return undefined;
}

/** Why the action space has no such move at `st` — the first of its gates the move fails. */
function whyNot(p: McProblem, l: McLattice, policy: CurrencyPolicy | undefined, st: McState, a: McAction): NotPossibleWhy {
  if (a.currency === 'restart') return l.canRestart ? 'no-effect' : 'cannot-start-over';
  if (!allowsAction(policy, a)) return 'excluded';
  if (!stepIsPriced(p.prices, pricedStepOf(a))) return 'unpriced';
  const needs: McRarity = a.currency === 'transmute' ? 'normal'
    : a.currency === 'augment' || a.currency === 'regal' || a.currency === 'essence' ? 'magic'
    : a.currency === 'annul' ? st.rarity : 'rare';
  if (st.rarity !== needs) return needs === 'normal' ? 'needs-normal' : needs === 'magic' ? 'needs-magic' : 'needs-rare';
  const used = { prefix: prefUsed(st, p.side), suffix: sufUsed(st, p.side) };
  const cap = { prefix: perSideCap(st.rarity, p.limits.prefixes), suffix: perSideCap(st.rarity, p.limits.suffixes) };
  const room = (sd?: Side): boolean => (sd ? used[sd] < cap[sd] : used.prefix < cap.prefix || used.suffix < cap.suffix);
  const held = (sd?: Side): boolean => (sd ? used[sd] > 0 : used.prefix + used.suffix > 0);
  switch (a.currency) {
    case 'exalt': return room(a.side) ? 'no-effect' : 'no-room';
    case 'augment': return room() ? 'no-effect' : 'no-room';
    case 'annul':
      if (a.light) return st.flagged === 0 ? 'no-desecrated-mod' : 'no-effect';
      return held(a.side) ? 'no-effect' : 'nothing-to-remove';
    case 'chaos': return held() ? 'no-effect' : 'nothing-to-remove';
    case 'desecrate':
      if (!p.desecratable) return 'no-desecration';
      if (hasDesecrated(st)) return 'already-desecrated';
      if (a.boss && !bossOmenAllowed(p.start.base.category)) return 'boss-not-here';
      // A boss omen is offered only where its pool holds a modifier the craft asks for (`bossesWanted`).
      if (a.boss) return 'boss-not-modelled';
      return room(a.side) ? 'no-effect' : 'no-room';
    default: return 'no-effect';
  }
}

/** The best plan's move at a state: the cheapest by V*, an Echoes offer that never rerolls named plain. */
function bestMove(acts: readonly CompiledAction[], valuer: ReturnType<typeof offerValuer>): McAction {
  let best: CompiledAction | undefined;
  let bestVal = Infinity;
  for (const a of acts) {
    const v = valuer.valueOf(a);
    if (v < bestVal) { bestVal = v; best = a; }
  }
  const d = best!.def.action;
  if (best!.offer <= 1 || best!.rerollCost === Infinity || d.currency !== 'desecrate') return d;
  valuer.keepWeights(best!, valuer.scratch, true);
  if (valuer.last.throw > 0) return d;
  const { echoes: _echoes, ...plain } = d;
  return plain;
}

/** The method played on real items: every state it can play gets its move, the keep rule reads V*. */
function replayMethod(
  craft: MethodCraft, V: Float64Array, played: readonly (Played | undefined)[],
  playAt: (i: number) => Played | Unplayable, opts: ReplayOptions,
): ReplayReport {
  const { problem: p, lattice: l, opts: mo } = craft;
  // The lattice walk reached what the abstraction can; a real item may stray further, so every state the
  // method can play is in the table the replay reads, not only the ones the walk met.
  const moves = new Map<StateKey, McAction>();
  const reroll = new Map<StateKey, number>();
  for (let i = 0; i < l.N; i++) {
    if (l.isGoalIdx[i] === 1) continue;
    const got = played[i] ?? playAt(i);
    if (!('q' in got)) continue;
    moves.set(l.allStates[i]!, got.action);
    if (Number.isFinite(got.rerollAbove)) reroll.set(l.allStates[i]!, got.rerollAbove);
  }
  const echoes = p.prices.omens[ECHOES_OMEN];
  return replayPolicy({
    data: p.data, start: p.start, list: p.list, idxOf: p.idxOf, blocks: p.siblings.blocks, encode: p.encode, policy: moves,
    isGoal: (s) => isAccepting(s, p.slotMasks, p.spare, p.siblings.obstacles),
    valueOf: (key) => { const i = l.idxOfState.get(key); return i === undefined ? undefined : V[i]; },
    ...(mo.restartCost === undefined ? {} : { restartCost: mo.restartCost }),
    ...(mo.fillOnFinish ? { finishCost: (item: ItemState) =>
      ((p.baseLimits.prefixes - item.prefixes.length) + (p.baseLimits.suffixes - item.suffixes.length)) * p.exaltPrice! } : {}),
    costOf: (a) => actionCostOf(p.prices, a),
    ...(echoes !== undefined ? { reroll: { cost: echoes, above: (key: StateKey) => reroll.get(key) } } : {}),
  }, opts);
}

// ── A method from the best plan ────────────────────────────────────────────────────────────────────

/** Every state the table's plan reaches from `root`, breadth first, goals included. */
export function reachedFrom(t: RouteTable, root: number): number[] {
  const seen = new Uint8Array(t.keys.length);
  const order = [root];
  seen[root] = 1;
  for (let k = 0; k < order.length; k++) {
    const i = order[k]!;
    for (let o = t.outStart[i]!; o < t.outStart[i + 1]!; o++) {
      const j = t.outTo[o]!;
      if (seen[j] === 0) { seen[j] = 1; order.push(j); }
    }
  }
  return order;
}

/** The spec a player would write for a move the plan plays — undefined for one no spec names. */
export function specOf(t: RouteTable, a: McAction): MoveSpec | undefined {
  const slotOfMod = (id: string): number => {
    const pos = t.positions.findIndex((ids) => ids.includes(id));
    return t.slotMasks.findIndex((m) => pos >= 0 && (m & (1 << pos)) !== 0);
  };
  switch (a.currency) {
    case 'restart': return { currency: 'restart' };
    case 'chaos': return a.whittling ? undefined : { currency: 'chaos' };
    case 'essence': { const slot = slotOfMod(a.target); return slot < 0 ? undefined : { currency: 'essence', slot }; }
    case 'perfect-essence': {
      const slot = slotOfMod(a.target);
      return slot < 0 ? undefined : { currency: 'perfect-essence', slot, ...(a.side ? { side: a.side } : {}) };
    }
    default: return a;
  }
}

/**
 * Rules that play the best plan's move at each of `keys` (its states, e.g. the main line a route draws),
 * each rule naming its state exactly: every slot's reading, the junk on each side, the rarity, and — on a
 * craft with bones — where the Desecration's mark sits. `otherwise` is a start over where the craft
 * can start over, else the move the plan plays most often.
 *
 * FAITHFUL when every one of `keys` is then played the plan's move: conditions cannot name which
 * alternative of a slot landed (or that two did), a sibling against junk, or WHICH wanted mod a Desecration
 * marked, so two states the plan treats differently can read alike — and then the earlier rule wins at
 * both. The same holds for a state off `keys` that reads like one on it: it plays that rule's move, which
 * there may not be possible — the check then says so, as it would for a rule the player wrote.
 */
export function methodFromPlan(t: RouteTable, keys: readonly string[]): { readonly method: Method; readonly faithful: boolean } {
  const frame: MethodFrame = { slotMasks: t.slotMasks, obstacles: t.obstacles };
  const at = new Map(t.keys.map((k, i) => [k as string, i]));
  const bones = t.keys.some((k) => decodeState(k).flagged !== 0);
  const rules: MethodRule[] = [];
  const seen = new Set<string>();
  const wanted: { st: McState; move: MoveSpec }[] = [];
  for (const key of keys) {
    const i = at.get(key);
    if (i === undefined || t.goal[i] === 1 || t.act[i]! < 0) continue;
    const move = specOf(t, t.actions[t.act[i]!]!);
    if (!move) continue;
    const st = decodeState(t.keys[i]!);
    const junk = junkOf(st, t.obstacles);
    const when: Condition[] = [
      ...t.slotMasks.map((m, slot): Condition => ({ kind: 'slot', slot, is: slotIs(st, m) })),
      { kind: 'junk', side: 'prefix', op: '=', n: junk.prefix },
      { kind: 'junk', side: 'suffix', op: '=', n: junk.suffix },
      { kind: 'rarity', is: st.rarity },
      ...(bones ? [{ kind: 'bone', is: boneOf(st, t.obstacles) } as const] : []),
    ];
    wanted.push({ st, move });
    const id = JSON.stringify(when);
    if (seen.has(id)) continue;
    seen.add(id);
    rules.push({ when, move });
  }
  const counts = new Map<string, { n: number; move: MoveSpec }>();
  for (let i = 0; i < t.keys.length; i++) {
    if (t.goal[i] === 1 || t.act[i]! < 0) continue;
    const move = specOf(t, t.actions[t.act[i]!]!);
    if (!move) continue;
    const id = JSON.stringify(move);
    const c = counts.get(id);
    if (c) c.n++; else counts.set(id, { n: 1, move });
  }
  const common = [...counts.values()].sort((a, b) => b.n - a.n)[0]?.move ?? { currency: 'chaos' as const };
  const method: Method = { rules, otherwise: t.canRestart ? { currency: 'restart' } : common };
  const faithful = wanted.every(({ st, move }) => JSON.stringify(ruleFor(method, st, frame).move) === JSON.stringify(move));
  return { method, faithful };
}
