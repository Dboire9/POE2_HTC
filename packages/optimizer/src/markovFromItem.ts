// From-item cost as a Markov Decision Process (the honest model). The linear from-item planner
// (fromItem.ts) assumes "restart to your item, free" on any miss — a fiction: a real annul removes a
// UNIFORMLY-RANDOM mod, so a miss leaves you in a WORSE state you recover from in place, and reproducing
// an expensive item is never free. Here we model the actual stochastic process: a policy over item
// states, transitions from the real pool weights, solved by value iteration for the minimum expected
// cost + the optimal policy. "Push forward" — never restart; the policy digs out of a bricked state.
//
// STATE ABSTRACTION (what makes it tractable): we don't track junk mod IDENTITIES, only
//   (which target mods are present, #junk prefixes, #junk suffixes).
// That collapses the space to ~2^|target| × slots — a few hundred states — and every transition
// probability comes from the pool weights the engine already computes.
//
// v1 SCOPE: rollable (normal) target mods; currencies exalt / annul / (sinistral|dextral) annul / chaos
// at base orb strength. DOCUMENTED APPROXIMATIONS: junk families are assumed distinct from target
// families (so junk never blocks a target's family in the denominator); a target mod rolled BELOW its
// tier is treated as generic junk (it doesn't block re-adding the mod). Perfect-essence / desecrate /
// essence targets and orb-strength / add-side omens are out of scope — the caller keeps the linear
// planner for those.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import { modTierWeight, poolTotalWeight, resolveMod } from '../../engine/src/pool.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';

/** A target mod resolved for the MDP: its side, gettable weight, and whether it's fractured (locked). */
interface McTarget {
  readonly modId: string;
  readonly type: 'prefix' | 'suffix';
  readonly family: string;
  /** Weight of rolling this mod at ≥ its required tier (base orb, item-level capped). 0 ⇒ ungettable. */
  readonly successWeight: number;
  /** Weight at ANY tier (the whole family's addable weight) — used to size the junk remainder. */
  readonly anyWeight: number;
  readonly fractured: boolean;
}

export type McAction = 'exalt' | 'annul' | 'annul-sinistral' | 'annul-dextral' | 'chaos';

export interface PolicyNode {
  readonly key: string;
  /** Target mod ids present in this state. */
  readonly present: readonly string[];
  readonly junkPrefixes: number;
  readonly junkSuffixes: number;
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /** Minimum expected cost to reach the target from here. */
  readonly expectedCost: number;
  /** The optimal currency to use here (undefined at the goal). */
  readonly action?: McAction;
}

export interface PolicyEdge {
  readonly from: string;
  readonly to: string;
  readonly action: McAction;
  readonly prob: number;
  /** True when this outcome moves AWAY from the target (a "brick" — the back-arrow in the graph). */
  readonly regress: boolean;
}

export interface MarkovResult {
  /** Minimum expected cost (exalt-equivalents) to reach the target under the optimal policy. */
  readonly expectedCost: number;
  /** False when a target mod can't be rolled at all (ungettable at this item level) — cost is ∞. */
  readonly feasible: boolean;
  readonly reason?: string;
  /** Reachable states under the optimal policy (the graph's squares), start first. */
  readonly nodes: readonly PolicyNode[];
  /** Policy transitions (the graph's arrows). */
  readonly edges: readonly PolicyEdge[];
  /** Optimal action for EVERY non-goal state (key → action), for simulation/validation. */
  readonly policy: ReadonlyMap<string, McAction>;
}

export interface MarkovOptions {
  /** Value-iteration convergence tolerance (max ΔV). Default 1e-9. */
  readonly tolerance?: number;
  /** Safety cap on iterations. Default 100000. */
  readonly maxIters?: number;
}

const bit = (i: number): number => 1 << i;
const has = (mask: number, i: number): boolean => (mask & bit(i)) !== 0;
const popcount = (m: number): number => { let c = 0; for (let x = m; x; x >>= 1) c += x & 1; return c; };

/** Distribution over next states as a plain object keyed by state key. */
type Dist = Map<string, number>;

export function markovFromItem(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions = {},
): MarkovResult {
  if (start.rarity !== 'rare') {
    return { expectedCost: Infinity, feasible: false, reason: 'the MDP planner models Rare items', nodes: [], edges: [], policy: new Map() };
  }
  const level = start.level;
  const floor = 0; // base orb strength (v1)
  const norm = start.base.pools.normal;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  // Resolve targets into the ordered list the bitmask indexes. Only rollable normal mods are supported.
  const list: McTarget[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    if (mod.source !== 'normal') {
      return { expectedCost: Infinity, feasible: false, reason: `${t.modId} is not a rollable mod (MDP v1 handles normal mods)`, nodes: [], edges: [], policy: new Map() };
    }
    const minIndex = t.minTierIndex ?? 0;
    list.push({
      modId: mod.id, type: mod.type, family: mod.family,
      successWeight: modTierWeight(mod, floor, level, minIndex),
      anyWeight: modTierWeight(mod, floor, level, 0),
      fractured: fracturedIds.has(mod.id),
    });
  }
  const n = list.length;
  if (n === 0) return { expectedCost: Infinity, feasible: false, reason: 'no target mods', nodes: [], edges: [], policy: new Map() };
  if (n > 6) return { expectedCost: Infinity, feasible: false, reason: 'target has more than 6 mods', nodes: [], edges: [], policy: new Map() };
  const idxOf = new Map(list.map((t, i) => [t.modId, i]));

  // A target mod that can never roll (weight 0 at this item level) makes the craft impossible.
  const ungettable = list.find((t) => t.successWeight === 0);
  if (ungettable) {
    return { expectedCost: Infinity, feasible: false, reason: `${ungettable.modId} can't roll at item level ${level}`, nodes: [], edges: [], policy: new Map() };
  }

  const targetPrefixIdx = list.map((t, i) => (t.type === 'prefix' ? i : -1)).filter((i) => i >= 0);
  const targetSuffixIdx = list.map((t, i) => (t.type === 'suffix' ? i : -1)).filter((i) => i >= 0);
  const GOAL = (bit(n) - 1); // all target mods present
  const goalKey = `${GOAL}:0:0`;

  // ── Pricing ──────────────────────────────────────────────────────────────
  const price = (k: string): number => prices.currency[k] ?? 0;
  const omen = (k: string): number => prices.omens[k] ?? 0;
  const COST: Record<McAction, number> = {
    exalt: price('exalt'),
    annul: price('annul'),
    'annul-sinistral': price('annul') + omen('OmenofSinistralAnnulment'),
    'annul-dextral': price('annul') + omen('OmenofDextralAnnulment'),
    chaos: price('chaos'),
  };

  // ── State helpers ─────────────────────────────────────────────────────────
  const key = (present: number, jp: number, js: number): string => `${present}:${jp}:${js}`;
  const prefUsed = (present: number, jp: number): number =>
    targetPrefixIdx.filter((i) => has(present, i)).length + jp;
  const sufUsed = (present: number, js: number): number =>
    targetSuffixIdx.filter((i) => has(present, i)).length + js;

  /** Occupied target families in `present` — the pool denominator excludes these (family exclusion). */
  const occupied = (present: number): Set<string> => {
    const s = new Set<string>();
    for (let i = 0; i < n; i++) if (has(present, i)) s.add(list[i]!.family);
    return s;
  };

  /** The exalt add-distribution from (present,jp,js): where a single weighted add can land. Empty if
   *  no slot is open or nothing is addable. Probabilities sum to 1. */
  const addOutcomes = (present: number, jp: number, js: number): Dist => {
    const prefixOpen = prefUsed(present, jp) < 3;
    const suffixOpen = sufUsed(present, js) < 3;
    const occ = occupied(present);
    const prefTotal = prefixOpen ? poolTotalWeight(data, norm.prefixes, floor, level, occ) : 0;
    const sufTotal = suffixOpen ? poolTotalWeight(data, norm.suffixes, floor, level, occ) : 0;
    const grand = prefTotal + sufTotal;
    const out: Dist = new Map();
    if (grand <= 0) return out;
    let prefTargetSuccess = 0;
    let sufTargetSuccess = 0;
    for (let i = 0; i < n; i++) {
      if (has(present, i)) continue; // already there
      const t = list[i]!;
      if (occ.has(t.family)) continue; // family blocked (only if two targets share a family — validated out)
      if (t.type === 'prefix' && prefixOpen) {
        out.set(key(present | bit(i), jp, js), t.successWeight / grand);
        prefTargetSuccess += t.successWeight;
      } else if (t.type === 'suffix' && suffixOpen) {
        out.set(key(present | bit(i), jp, js), t.successWeight / grand);
        sufTargetSuccess += t.successWeight;
      }
    }
    // Everything else the add can produce is junk on its side (incl. a target rolled below its tier).
    const junkPref = Math.max(0, prefTotal - prefTargetSuccess);
    const junkSuf = Math.max(0, sufTotal - sufTargetSuccess);
    if (junkPref > 0) addTo(out, key(present, jp + 1, js), junkPref / grand);
    if (junkSuf > 0) addTo(out, key(present, jp, js + 1), junkSuf / grand);
    return out;
  };

  /** The removal distribution from (present,jp,js), optionally constrained to one side (omen annul). */
  const removeOutcomes = (present: number, jp: number, js: number, side?: 'prefix' | 'suffix'): Dist => {
    // Removable = non-fractured target mods + junk, on the allowed side(s).
    const removableTargets: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!has(present, i)) continue;
      const t = list[i]!;
      if (t.fractured) continue; // locked — annul can't take it
      if (side && t.type !== side) continue;
      removableTargets.push(i);
    }
    const jpRem = side === 'suffix' ? 0 : jp;
    const jsRem = side === 'prefix' ? 0 : js;
    const total = removableTargets.length + jpRem + jsRem;
    const out: Dist = new Map();
    if (total <= 0) return out;
    for (const i of removableTargets) addTo(out, key(present & ~bit(i), jp, js), 1 / total);
    if (jpRem > 0) addTo(out, key(present, jp - 1, js), jpRem / total);
    if (jsRem > 0) addTo(out, key(present, jp, js - 1), jsRem / total);
    return out;
  };

  /** Chaos = remove one uniformly-random mod, then add one weighted mod on the freed item. */
  const chaosOutcomes = (present: number, jp: number, js: number): Dist => {
    const removals = removeOutcomes(present, jp, js);
    const out: Dist = new Map();
    for (const [midKey, pRem] of removals) {
      const [mp, mjp, mjs] = midKey.split(':').map(Number) as [number, number, number];
      const adds = addOutcomes(mp, mjp, mjs);
      if (adds.size === 0) { addTo(out, midKey, pRem); continue; } // no add possible → just the removal
      for (const [toKey, pAdd] of adds) addTo(out, toKey, pRem * pAdd);
    }
    return out;
  };

  // ── Enumerate states + actions ─────────────────────────────────────────────
  interface ActionDef { action: McAction; cost: number; dist: Dist; }
  const actionsOf = (present: number, jp: number, js: number): ActionDef[] => {
    const acts: ActionDef[] = [];
    const addable = addOutcomes(present, jp, js);
    if (addable.size > 0) acts.push({ action: 'exalt', cost: COST.exalt, dist: addable });
    const rem = removeOutcomes(present, jp, js);
    if (rem.size > 0) acts.push({ action: 'annul', cost: COST.annul, dist: rem });
    const remP = removeOutcomes(present, jp, js, 'prefix');
    if (remP.size > 0) acts.push({ action: 'annul-sinistral', cost: COST['annul-sinistral'], dist: remP });
    const remS = removeOutcomes(present, jp, js, 'suffix');
    if (remS.size > 0) acts.push({ action: 'annul-dextral', cost: COST['annul-dextral'], dist: remS });
    const ch = chaosOutcomes(present, jp, js);
    if (ch.size > 0) acts.push({ action: 'chaos', cost: COST.chaos, dist: ch });
    return acts;
  };

  const allStates: { present: number; jp: number; js: number; key: string }[] = [];
  for (let present = 0; present < bit(n); present++) {
    const tp = targetPrefixIdx.filter((i) => has(present, i)).length;
    const ts = targetSuffixIdx.filter((i) => has(present, i)).length;
    for (let jp = 0; jp + tp <= 3; jp++) {
      for (let js = 0; js + ts <= 3; js++) allStates.push({ present, jp, js, key: key(present, jp, js) });
    }
  }
  const actionCache = new Map<string, ActionDef[]>();
  for (const s of allStates) actionCache.set(s.key, s.key === goalKey ? [] : actionsOf(s.present, s.jp, s.js));

  // ── Value iteration ─────────────────────────────────────────────────────────
  // Standard stochastic-shortest-path VI: 0-initialise (a finite lower bound) and let values climb to
  // the fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery
  // cycles here — e.g. {both targets + junk} ↔ {one target + junk} each need the other finite first —
  // so neither ever bootstraps. Every target is gettable by now, so the goal is reachable from every
  // state and VI converges to a finite V.) Each action solves its own self-loop via ÷(1 − pStay).
  const tol = opts.tolerance ?? 1e-9;
  const maxIters = opts.maxIters ?? 100_000;
  const V = new Map<string, number>();
  for (const s of allStates) V.set(s.key, 0);
  const actionValue = (k: string, a: ActionDef): number => {
    const pStay = a.dist.get(k) ?? 0;
    if (pStay >= 1 - 1e-12) return Infinity; // an action that only loops back can't make progress
    return (a.cost + sumOther(a.dist, k, V)) / (1 - pStay);
  };
  for (let iter = 0; iter < maxIters; iter++) {
    let delta = 0;
    for (const s of allStates) {
      if (s.key === goalKey) continue;
      let best = Infinity;
      for (const a of actionCache.get(s.key)!) best = Math.min(best, actionValue(s.key, a));
      if (!Number.isFinite(best)) continue;
      const prev = V.get(s.key)!;
      V.set(s.key, best);
      delta = Math.max(delta, Math.abs(best - prev));
    }
    if (delta <= tol) break;
  }

  // ── Extract policy + reachable graph from the start ─────────────────────────
  const startPresent = maskOfPresent(start, idxOf);
  const startJp = countJunk(start, 'prefix', idxOf);
  const startJs = countJunk(start, 'suffix', idxOf);
  const startKey = key(startPresent, startJp, startJs);
  const startCost = V.get(startKey) ?? Infinity;
  if (!Number.isFinite(startCost)) {
    return { expectedCost: Infinity, feasible: false, reason: 'no policy reaches the target', nodes: [], edges: [], policy: new Map() };
  }

  const bestAction = (k: string): ActionDef | undefined => {
    let best: ActionDef | undefined;
    let bestVal = Infinity;
    for (const a of actionCache.get(k)!) {
      const val = actionValue(k, a);
      if (val < bestVal) { bestVal = val; best = a; }
    }
    return best;
  };

  // Full policy over every non-goal state (the reachable graph below is a subset) — for the MC validator.
  const policy = new Map<string, McAction>();
  for (const s of allStates) {
    if (s.key === goalKey) continue;
    const a = bestAction(s.key);
    if (a) policy.set(s.key, a.action);
  }

  const nodes: PolicyNode[] = [];
  const edges: PolicyEdge[] = [];
  const seen = new Set<string>();
  const queue = [startKey];
  const dist = (k: string): number => popcount(GOAL) - popcount(parseKey(k).present) + parseKey(k).jp + parseKey(k).js;
  while (queue.length > 0) {
    const k = queue.shift()!;
    if (seen.has(k)) continue;
    seen.add(k);
    const st = parseKey(k);
    const isGoal = k === goalKey;
    const act = isGoal ? undefined : bestAction(k);
    const presentMods = list.filter((_, i) => has(st.present, i)).map((t) => t.modId);
    const node: PolicyNode = {
      key: k, present: presentMods, junkPrefixes: st.jp, junkSuffixes: st.js,
      isStart: k === startKey, isGoal, expectedCost: V.get(k) ?? Infinity,
      ...(act ? { action: act.action } : {}),
    };
    nodes.push(node);
    if (act) {
      for (const [to, p] of act.dist) {
        if (p <= 0) continue;
        edges.push({ from: k, to, action: act.action, prob: p, regress: dist(to) > dist(k) });
        if (!seen.has(to)) queue.push(to);
      }
    }
  }

  return { expectedCost: startCost, feasible: true, nodes, edges, policy };
}

// ── small helpers ────────────────────────────────────────────────────────────

function addTo(d: Dist, k: string, p: number): void { d.set(k, (d.get(k) ?? 0) + p); }

function sumOther(dist: Dist, selfKey: string, V: Map<string, number>): number {
  let s = 0;
  for (const [to, p] of dist) if (to !== selfKey) s += p * (V.get(to) ?? Infinity);
  return s;
}

function parseKey(k: string): { present: number; jp: number; js: number } {
  const [present, jp, js] = k.split(':').map(Number) as [number, number, number];
  return { present, jp, js };
}

function maskOfPresent(item: ItemState, idxOf: Map<string, number>): number {
  let m = 0;
  for (const p of [...item.prefixes, ...item.suffixes]) {
    const i = idxOf.get(p.modId);
    if (i !== undefined) m |= bit(i);
  }
  return m;
}

function countJunk(item: ItemState, side: 'prefix' | 'suffix', idxOf: Map<string, number>): number {
  const arr = side === 'prefix' ? item.prefixes : item.suffixes;
  return arr.filter((p) => !idxOf.has(p.modId)).length;
}
