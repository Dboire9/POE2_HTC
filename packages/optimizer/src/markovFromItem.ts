// From-item cost as a Markov Decision Process (the honest model). The linear from-item planner
// (fromItem.ts) assumes "restart to your item, free" on any miss — a fiction: a real annul removes a
// UNIFORMLY-RANDOM mod, so a miss leaves you in a WORSE state you recover from in place, and reproducing
// an expensive item is never free. Here we model the actual stochastic process: a policy over item
// states, transitions from the real pool weights, solved by value iteration for the minimum expected
// cost + the optimal policy. "Push forward" — never restart; the policy digs out of a bricked state.
//
// STATE ABSTRACTION (what makes it tractable): we track, per target mod, one of {absent, present,
// blocked}, plus how much foreign junk sits on each side:
//   (which target mods are PRESENT at ≥ their tier, which are BLOCKED, #junk prefixes, #junk suffixes).
// A target is BLOCKED when its family is occupied by a roll that ISN'T the target at its wanted tier —
// the mod rolled below its required tier, so the family is taken but the goal isn't met and you must
// annul the off-tier roll before re-adding. Junk (jp/js) is only ever weight in NON-target families, so
// it can never block a target — the blocked bits carry all the family collisions that matter. That
// collapses the space to 3^|target| × slots — a few thousand states — every transition probability from
// the pool weights the engine already computes.
//
// v2 SCOPE (was v1: rollable normal targets, base orbs, exalt/annul/side-annul/chaos):
//   • v2a — family-aware tiered states: a below-tier roll BLOCKS the family (above); an item that already
//     carries a target at too low a tier starts BLOCKED, not satisfied. (Untiered targets have no
//     below-tier band, so this reduces exactly to the v1 present/absent model.)
//   • v2b — richer action set: Exalted Orb at base / GREATER / PERFECT strength (ilvl floor 0 / 35 / 50,
//     which shrinks the below-tier band — a Perfect Exalt can skip the off-tier trap), and side-
//     constrained exalts (Omen of Sinistral/Dextral Exaltation = add a prefix / suffix only). Strengths
//     and side-omens are offered only when the price sheet lists them, so a missing price can't mint a
//     free super-orb.
//
// DOCUMENTED APPROXIMATIONS: two target mods sharing a family are validated out upstream (so free
// targets always have distinct families); a fractured JUNK mod is treated as ordinary removable junk
// (only target mods can be fractured-locked here). Tag-targeting omens (Homogenising Exaltation) and
// lowest-tier removal (Whittling) need tag / tier-ordering the abstraction discards — out of scope.
// Perfect-essence / desecrate / essence targets stay on the linear planner (the caller falls back).

import type { ItemState, Mod, PatchData } from '../../engine/src/types.ts';
import { modTierWeight, poolTotalWeight, resolveMod } from '../../engine/src/pool.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';

/** A target mod resolved for the MDP: its side, family, the mod (for per-floor weights), and lock state. */
interface McTarget {
  readonly modId: string;
  readonly type: 'prefix' | 'suffix';
  readonly family: string;
  readonly mod: Mod;
  /** Worst acceptable tier index (engine indexing: higher index = better/higher-ilvl). */
  readonly minIndex: number;
  readonly fractured: boolean;
}

export type ExaltStrength = 'base' | 'greater' | 'perfect';

/** Every currency+omen the MDP can play. Exalts fan out over {side} × {strength}. */
export type McAction =
  | 'exalt' | 'exalt-greater' | 'exalt-perfect'
  | 'exalt-sinistral' | 'exalt-sinistral-greater' | 'exalt-sinistral-perfect'
  | 'exalt-dextral' | 'exalt-dextral-greater' | 'exalt-dextral-perfect'
  | 'annul' | 'annul-sinistral' | 'annul-dextral'
  | 'chaos';

/** ilvl floor each Exalted-Orb strength imposes (mirrors pool.ts: base 0 / greater 35 / perfect 50). */
const STRENGTH_FLOOR: Record<ExaltStrength, number> = { base: 0, greater: 35, perfect: 50 };
/** The `prices.currency` key for an exalt at a given strength. */
const STRENGTH_PRICE_KEY: Record<ExaltStrength, string> = { base: 'exalt', greater: 'exalt_greater', perfect: 'exalt_perfect' };

export interface PolicyNode {
  readonly key: string;
  /** Target mod ids present (at ≥ their wanted tier) in this state. */
  readonly present: readonly string[];
  /** Target mod ids whose family is occupied by a below-tier ("off-tier") roll — must be annulled first. */
  readonly blocked: readonly string[];
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

/**
 * Cost of every `McAction` from a price sheet: base exalt strength + optional strength surcharge +
 * optional side-omen surcharge; annuls carry their side omen; chaos is flat. Shared by the solver and
 * the Monte-Carlo validator so the two never disagree on pricing (only the transition math is what the
 * MC independently checks). Missing keys read 0 — but the solver only OFFERS an action whose price is
 * actually listed (see `markovFromItem`), so a 0 here never becomes a free move in the optimisation.
 */
export function mcActionCosts(prices: Prices): Record<McAction, number> {
  const c = (k: string): number => prices.currency[k] ?? 0;
  const o = (k: string): number => prices.omens[k] ?? 0;
  const sin = o('OmenofSinistralExaltation');
  const dex = o('OmenofDextralExaltation');
  return {
    exalt: c('exalt'), 'exalt-greater': c('exalt_greater'), 'exalt-perfect': c('exalt_perfect'),
    'exalt-sinistral': c('exalt') + sin, 'exalt-sinistral-greater': c('exalt_greater') + sin, 'exalt-sinistral-perfect': c('exalt_perfect') + sin,
    'exalt-dextral': c('exalt') + dex, 'exalt-dextral-greater': c('exalt_greater') + dex, 'exalt-dextral-perfect': c('exalt_perfect') + dex,
    annul: c('annul'), 'annul-sinistral': c('annul') + o('OmenofSinistralAnnulment'), 'annul-dextral': c('annul') + o('OmenofDextralAnnulment'),
    chaos: c('chaos'),
  };
}

const bit = (i: number): number => 1 << i;
const has = (mask: number, i: number): boolean => (mask & bit(i)) !== 0;
const popcount = (m: number): number => { let c = 0; for (let x = m; x; x >>= 1) c += x & 1; return c; };

/** Distribution over next states as a plain object keyed by state key. */
type Dist = Map<string, number>;

export function markovFromItem(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions = {},
): MarkovResult {
  const fail = (reason: string): MarkovResult =>
    ({ expectedCost: Infinity, feasible: false, reason, nodes: [], edges: [], policy: new Map() });
  if (start.rarity !== 'rare') return fail('the MDP planner models Rare items');

  const level = start.level;
  const norm = start.base.pools.normal;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  // Resolve targets into the ordered list the bitmasks index. Only rollable normal mods are supported.
  const list: McTarget[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    if (mod.source !== 'normal') return fail(`${t.modId} is not a rollable mod (the MDP handles normal mods)`);
    list.push({
      modId: mod.id, type: mod.type, family: mod.family, mod,
      minIndex: t.minTierIndex ?? 0, fractured: fracturedIds.has(mod.id),
    });
  }
  const n = list.length;
  if (n === 0) return fail('no target mods');
  if (n > 6) return fail('target has more than 6 mods');
  const idxOf = new Map(list.map((t, i) => [t.modId, i]));

  // Per-floor weights for a target: success = ≥ its wanted tier; any = the whole family; below = any−success.
  const succWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, t.minIndex);
  const anyWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, 0);

  // A target that can never roll (weight 0 even at base strength, the most permissive) is impossible.
  const ungettable = list.find((t) => succWeight(t, 0) === 0);
  if (ungettable) return fail(`${ungettable.modId} can't roll at item level ${level}`);

  const targetPrefixIdx = list.map((t, i) => (t.type === 'prefix' ? i : -1)).filter((i) => i >= 0);
  const targetSuffixIdx = list.map((t, i) => (t.type === 'suffix' ? i : -1)).filter((i) => i >= 0);
  const GOAL = bit(n) - 1; // all target mods present, none blocked, no junk
  const goalKey = `${GOAL}:0:0:0`;

  // ── Exalt strengths available on the price sheet (base always; greater/perfect only if listed, so a
  //    missing price can't create a free super-orb). Each pairs with an ilvl floor. ─────────────────
  const strengths: ExaltStrength[] = (['base', 'greater', 'perfect'] as const)
    .filter((s) => s === 'base' || prices.currency[STRENGTH_PRICE_KEY[s]] !== undefined);
  const sinistralExaltOk = prices.omens['OmenofSinistralExaltation'] !== undefined;
  const dextralExaltOk = prices.omens['OmenofDextralExaltation'] !== undefined;
  const cost = mcActionCosts(prices);

  // ── State helpers ─────────────────────────────────────────────────────────
  const key = (present: number, blocked: number, jp: number, js: number): string => `${present}:${blocked}:${jp}:${js}`;
  const countSide = (mask: number, sideIdx: readonly number[]): number => sideIdx.filter((i) => has(mask, i)).length;
  const prefUsed = (present: number, blocked: number, jp: number): number =>
    countSide(present, targetPrefixIdx) + countSide(blocked, targetPrefixIdx) + jp;
  const sufUsed = (present: number, blocked: number, js: number): number =>
    countSide(present, targetSuffixIdx) + countSide(blocked, targetSuffixIdx) + js;

  /** Target families occupied (present OR blocked) — excluded from the add denominator (family exclusion). */
  const occupied = (present: number, blocked: number): Set<string> => {
    const s = new Set<string>();
    for (let i = 0; i < n; i++) if (has(present, i) || has(blocked, i)) s.add(list[i]!.family);
    return s;
  };

  /** The add-distribution from a state at ilvl `floor`, optionally constrained to one side (side omen).
   *  A weighted add lands a target at tier (→ present), the target below tier (→ blocked), or foreign
   *  junk (→ jp/js). Empty if no slot is open or nothing is addable; probabilities sum to 1. */
  const addOutcomes = (present: number, blocked: number, jp: number, js: number, floor: number, side?: 'prefix' | 'suffix'): Dist => {
    const prefixOpen = side !== 'suffix' && prefUsed(present, blocked, jp) < 3;
    const suffixOpen = side !== 'prefix' && sufUsed(present, blocked, js) < 3;
    const occ = occupied(present, blocked);
    const prefTotal = prefixOpen ? poolTotalWeight(data, norm.prefixes, floor, level, occ) : 0;
    const sufTotal = suffixOpen ? poolTotalWeight(data, norm.suffixes, floor, level, occ) : 0;
    const grand = prefTotal + sufTotal;
    const out: Dist = new Map();
    if (grand <= 0) return out;
    let anyPref = 0; // Σ whole-family weight of the free targets on the prefix side (the non-junk share)
    let anySuf = 0;
    for (let i = 0; i < n; i++) {
      if (has(present, i) || has(blocked, i)) continue; // family already occupied
      const t = list[i]!;
      if (occ.has(t.family)) continue; // defensive (validated distinct upstream)
      const open = t.type === 'prefix' ? prefixOpen : suffixOpen;
      if (!open) continue;
      const succ = succWeight(t, floor);
      const any = anyWeight(t, floor);
      if (succ > 0) addTo(out, key(present | bit(i), blocked, jp, js), succ / grand);
      const below = any - succ;
      if (below > 0) addTo(out, key(present, blocked | bit(i), jp, js), below / grand); // rolled below tier → family blocked
      if (t.type === 'prefix') anyPref += any; else anySuf += any;
    }
    // Everything else the add can produce is foreign junk on its side (a non-target family).
    const junkPref = Math.max(0, prefTotal - anyPref);
    const junkSuf = Math.max(0, sufTotal - anySuf);
    if (junkPref > 0) addTo(out, key(present, blocked, jp + 1, js), junkPref / grand);
    if (junkSuf > 0) addTo(out, key(present, blocked, jp, js + 1), junkSuf / grand);
    return out;
  };

  /** The removal distribution, optionally constrained to one side (omen annul). Removes a uniformly-
   *  random removable mod: a non-fractured present target (→ absent), a blocked off-tier roll (→ frees
   *  the family, target addable again), or a junk mod. */
  const removeOutcomes = (present: number, blocked: number, jp: number, js: number, side?: 'prefix' | 'suffix'): Dist => {
    const presentRem: number[] = [];
    const blockedRem: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = list[i]!;
      if (side && t.type !== side) continue;
      if (has(present, i) && !t.fractured) presentRem.push(i);
      if (has(blocked, i)) blockedRem.push(i); // an off-tier occupier is a random roll — never locked
    }
    const jpRem = side === 'suffix' ? 0 : jp;
    const jsRem = side === 'prefix' ? 0 : js;
    const total = presentRem.length + blockedRem.length + jpRem + jsRem;
    const out: Dist = new Map();
    if (total <= 0) return out;
    for (const i of presentRem) addTo(out, key(present & ~bit(i), blocked, jp, js), 1 / total);
    for (const i of blockedRem) addTo(out, key(present, blocked & ~bit(i), jp, js), 1 / total);
    if (jpRem > 0) addTo(out, key(present, blocked, jp - 1, js), jpRem / total);
    if (jsRem > 0) addTo(out, key(present, blocked, jp, js - 1), jsRem / total);
    return out;
  };

  /** Chaos = remove one uniformly-random mod, then add one weighted mod (base strength) on the freed item. */
  const chaosOutcomes = (present: number, blocked: number, jp: number, js: number): Dist => {
    const removals = removeOutcomes(present, blocked, jp, js);
    const out: Dist = new Map();
    for (const [midKey, pRem] of removals) {
      const m = parseKey(midKey);
      const adds = addOutcomes(m.present, m.blocked, m.jp, m.js, 0);
      if (adds.size === 0) { addTo(out, midKey, pRem); continue; } // no add possible → just the removal
      for (const [toKey, pAdd] of adds) addTo(out, toKey, pRem * pAdd);
    }
    return out;
  };

  // ── Enumerate states + actions ─────────────────────────────────────────────
  interface ActionDef { action: McAction; cost: number; dist: Dist; }
  const exaltAction = (strength: ExaltStrength, side: 'prefix' | 'suffix' | undefined): McAction => {
    const sideTag = side === 'prefix' ? '-sinistral' : side === 'suffix' ? '-dextral' : '';
    const strTag = strength === 'base' ? '' : `-${strength}`;
    return `exalt${sideTag}${strTag}` as McAction;
  };
  const actionsOf = (present: number, blocked: number, jp: number, js: number): ActionDef[] => {
    const acts: ActionDef[] = [];
    const sides: (undefined | 'prefix' | 'suffix')[] = [undefined];
    if (sinistralExaltOk) sides.push('prefix');
    if (dextralExaltOk) sides.push('suffix');
    for (const side of sides) {
      for (const strength of strengths) {
        const dist = addOutcomes(present, blocked, jp, js, STRENGTH_FLOOR[strength], side);
        if (dist.size === 0) continue;
        const action = exaltAction(strength, side);
        acts.push({ action, cost: cost[action], dist });
      }
    }
    const rem = removeOutcomes(present, blocked, jp, js);
    if (rem.size > 0) acts.push({ action: 'annul', cost: cost.annul, dist: rem });
    const remP = removeOutcomes(present, blocked, jp, js, 'prefix');
    if (remP.size > 0) acts.push({ action: 'annul-sinistral', cost: cost['annul-sinistral'], dist: remP });
    const remS = removeOutcomes(present, blocked, jp, js, 'suffix');
    if (remS.size > 0) acts.push({ action: 'annul-dextral', cost: cost['annul-dextral'], dist: remS });
    const ch = chaosOutcomes(present, blocked, jp, js);
    if (ch.size > 0) acts.push({ action: 'chaos', cost: cost.chaos, dist: ch });
    return acts;
  };

  const allStates: { key: string }[] = [];
  for (let present = 0; present < bit(n); present++) {
    for (let blocked = 0; blocked < bit(n); blocked++) {
      if ((present & blocked) !== 0) continue; // a target is present XOR blocked, never both
      const tp = countSide(present, targetPrefixIdx) + countSide(blocked, targetPrefixIdx);
      const ts = countSide(present, targetSuffixIdx) + countSide(blocked, targetSuffixIdx);
      if (tp > 3 || ts > 3) continue;
      for (let jp = 0; jp + tp <= 3; jp++) {
        for (let js = 0; js + ts <= 3; js++) allStates.push({ key: key(present, blocked, jp, js) });
      }
    }
  }
  const actionCache = new Map<string, ActionDef[]>();
  for (const s of allStates) {
    const st = parseKey(s.key);
    actionCache.set(s.key, s.key === goalKey ? [] : actionsOf(st.present, st.blocked, st.jp, st.js));
  }

  // ── Value iteration ─────────────────────────────────────────────────────────
  // Standard stochastic-shortest-path VI: 0-initialise (a finite lower bound) and let values climb to
  // the fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery
  // cycles here — e.g. {both targets + junk} ↔ {one target + junk} each need the other finite first —
  // so neither bootstraps. Every target is gettable by now, so the goal is reachable from every state
  // and VI converges to a finite V.) Each action solves its own self-loop via ÷(1 − pStay).
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
  const s0 = classifyStart(start, list, idxOf);
  const startKey = key(s0.present, s0.blocked, s0.jp, s0.js);
  const startCost = V.get(startKey) ?? Infinity;
  if (!Number.isFinite(startCost)) return fail('no policy reaches the target');

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

  // Distance-to-goal for layout/regress: missing targets + blocked (each needs a remove then an add) + junk.
  const dist = (k: string): number => {
    const st = parseKey(k);
    return (n - popcount(st.present)) + popcount(st.blocked) + st.jp + st.js;
  };
  const nodes: PolicyNode[] = [];
  const edges: PolicyEdge[] = [];
  const seen = new Set<string>();
  const queue = [startKey];
  while (queue.length > 0) {
    const k = queue.shift()!;
    if (seen.has(k)) continue;
    seen.add(k);
    const st = parseKey(k);
    const isGoal = k === goalKey;
    const act = isGoal ? undefined : bestAction(k);
    const node: PolicyNode = {
      key: k,
      present: list.filter((_, i) => has(st.present, i)).map((t) => t.modId),
      blocked: list.filter((_, i) => has(st.blocked, i)).map((t) => t.modId),
      junkPrefixes: st.jp, junkSuffixes: st.js,
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

function parseKey(k: string): { present: number; blocked: number; jp: number; js: number } {
  const [present, blocked, jp, js] = k.split(':').map(Number) as [number, number, number, number];
  return { present, blocked, jp, js };
}

/** Classify the START item's mods into (present, blocked, junk): a target at ≥ its wanted tier is
 *  present; the same target at too low a tier is blocked (its family is taken, goal unmet); a mod that
 *  matches no target is junk on its side. */
function classifyStart(
  item: ItemState, list: readonly McTarget[], idxOf: ReadonlyMap<string, number>,
): { present: number; blocked: number; jp: number; js: number } {
  let present = 0;
  let blocked = 0;
  let jp = 0;
  let js = 0;
  const place = (arr: ItemState['prefixes'], side: 'prefix' | 'suffix'): void => {
    for (const p of arr) {
      const i = idxOf.get(p.modId);
      if (i === undefined) { if (side === 'prefix') jp++; else js++; continue; }
      const t = list[i]!;
      const tierIdx = t.mod.tiers.findIndex((tt) => tt.name === p.tierName);
      // At or above the wanted tier (or an unrecognised tier — assume fine) ⇒ present; below ⇒ blocked.
      if (tierIdx < 0 || tierIdx >= t.minIndex) present |= bit(i);
      else blocked |= bit(i);
    }
  };
  place(item.prefixes, 'prefix');
  place(item.suffixes, 'suffix');
  return { present, blocked, jp, js };
}
