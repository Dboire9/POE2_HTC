// Budget-constrained ALTERNATIVE crafts: "I have 200ex — what's the closest thing to my item I can
// actually get for it?" Returns the (closeness ↔ P(finish within budget)) Pareto frontier, mirroring
// the cost↔probability frontier optimize.ts already produces. Row 0 is the exact target you asked for
// (usually with a dismal P — that's the point), followed by the minimal relaxations that buy real odds.
//
// WHAT MAY BE RELAXED. Per desired slot: keep the mod but slide its tier requirement down, swap it for
// a SAME-FAMILY sibling, or drop it — with at most ONE slot swapped-or-dropped across the whole item
// ("1 different mod"). Pinned slots are frozen entirely.
//
// WHY NOT TAG-SIMILAR SWAPS (this is load-bearing — don't "improve" it back in): a tag-Jaccard metric
// over 0.5.0 scores "#% increased Light Radius" at 1.00 against "+# to maximum Mana", because both mods
// carry exactly ['resource','mana'] and nothing else. The tags simply don't hold the information, and
// the bad row would rank FIRST (it's cheap). Same-family siblings are a declared exclusion group, not
// an inferred similarity, so they can't produce that. Revisit only via tiers[].stats (`base_maximum_mana`
// vs `mana_regeneration_rate_+%`), which covers 77% of tiers.
//
// USELESS SWAPS FILTER THEMSELVES OUT. On Wands all 5 WeaponDamageTypePrefix siblings (Fire/Cold/
// Lightning/Phys/Chaos) carry identical weights, so Fire→Cold costs exactly the same: same P at lower
// closeness ⇒ dominated ⇒ never on the frontier. Whereas IncreaseSocketedGemLevel runs 500 (all Spell
// Skills) vs 2600 (Fire Spell Skills) — a 5.2× swing that surfaces. No special-casing needed either way.

import type { ItemBase, ItemState, PatchData, Tier } from '../../engine/src/types.ts';
import { familiesOf, resolveMod } from '../../engine/src/pool.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { planCostCdf, pricesForBase } from './cost.ts';
import type { CurrencyDepth, ParetoPlan, ParetoResult, TierTarget } from './optimize.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';

/** A desired mod at a desired tier. Pinned targets are non-negotiable — never relaxed/swapped/dropped. */
export interface AlternativeTarget extends TierTarget {
  readonly pinned?: boolean;
}

/** What became of one desired slot in an alternative. Slot order matches the desired target. */
export type SlotChange =
  | { readonly kind: 'kept'; readonly modId: string; readonly minTierIndex: number }
  | { readonly kind: 'swapped'; readonly modId: string; readonly minTierIndex: number; readonly from: string }
  | { readonly kind: 'dropped'; readonly from: string };

/**
 * How close an alternative is to what you asked for. Compared LEXICOGRAPHICALLY (dropped ↑, swapped ↑,
 * valueRetained ↓) — deliberately constant-free: weighing "one tier step" against "lost a mod" needs an
 * arbitrary exchange rate, and the ordering below ("all my mods at lower tiers beats missing a mod")
 * needs none. It also sidesteps the fact that value-retained is meaningless ACROSS a swap: family
 * siblings have identical ranges, so a swap would score a free 1.0.
 */
export interface Closeness {
  readonly dropped: number;
  readonly swapped: number;
  /** Mean fraction of the asked-for stat value still guaranteed, in [0,1]; a dropped slot scores 0. */
  readonly valueRetained: number;
}

export interface Alternative {
  readonly slots: readonly SlotChange[];
  readonly closeness: Closeness;
  /** P(finish within budget), conservative (lower) bound. Exact unless `inBudgetMax` differs. */
  readonly inBudget: number;
  /** Upper bound: the true chance lies in [inBudget, inBudgetMax]. Equal when the prices are commensurable. */
  readonly inBudgetMax: number;
  /** The plan achieving `inBudget` — the best way to spend the budget on THIS item. */
  readonly plan: ParetoPlan;
}

export interface AlternativesResult {
  /** Non-dominated alternatives, closest-first; P(in budget) strictly rises down the list. */
  readonly frontier: readonly Alternative[];
  readonly nodesEvaluated: number;
  /**
   * True only when the node cap stopped the search before the lattice was exhausted, so farther
   * alternatives may be missing. Stopping early on a P≈1 find is NOT a truncation (nothing looser can
   * beat a certainty), and neither is running the lattice dry.
   */
  readonly truncated: boolean;
  /** The coarsest orb-strength search depth any node fell back to — reported, never silent. */
  readonly currencyDepth: CurrencyDepth;
}

export interface AlternativesOptions {
  level?: number;
  /** Cap on relaxed targets evaluated. Each costs a full Pareto run, so this bounds the wall clock. */
  maxNodes?: number;
  /** `maxPlans` handed to each node's Pareto run (throttles its currencyDepth). */
  maxPlansPerNode?: number;
  /** `maxCells` handed to each P(in budget) evaluation. */
  costCells?: number;
  /**
   * Called as nodes are evaluated, so a UI can show progress through a search that is genuinely slow:
   * every node is a full Pareto run, and at 6 targets with a budget this takes ~7.3s.
   *
   * `total` is the node CAP, not a known total — the search can finish early. In practice the slow
   * cases are exactly the ones that exhaust it (200/200/196 nodes at 4/5/6 targets), so the bar tracks
   * real work precisely where it is needed. A plain callback, so this file stays pure.
   */
  onProgress?: (done: number, total: number) => void;
  /** Currencies the player doesn't have. Forwarded into every node's plan search. */
  policy?: CurrencyPolicy;
}

export const DEFAULT_MAX_NODES = 200;
/** Lower than optimizePareto's own 100k default: we run one search PER NODE, so depth trades for breadth. */
export const DEFAULT_MAX_PLANS_PER_NODE = 5_000;

const FRONTIER_EPS = 1e-12;
const DEPTH_RANK: Record<CurrencyDepth, number> = { full: 0, 'base+strongest': 1, 'strongest-only': 2 };

/** |midpoint| of a stat range: [min,max] → |(min+max)/2|. Absolute, so "reduced X" mods (whose best
 *  tier is the most negative) still compare in the right direction. */
function midAbs(range: readonly number[]): number | undefined {
  if (range.length >= 2) return Math.abs(((range[0] ?? 0) + (range[1] ?? 0)) / 2);
  if (range.length === 1) return Math.abs(range[0] ?? 0);
  return undefined;
}

function tierAt(data: PatchData, modId: string, index: number): Tier | undefined {
  return resolveMod(data, modId).tiers[index];
}

/**
 * Fraction of the asked-for stat value a tier still GUARANTEES, in [0,1]. `minTierIndex` means "that
 * tier or better", so the floor you're promised is exactly tiers[minTierIndex] — comparing floors is
 * the honest read. Compound mods carry several ranges (verified: no mod's range-count varies across
 * its own tiers), so their per-range ratios are averaged.
 *
 * Capped at 1: a sibling with BIGGER numbers isn't *closer* to what you asked for, and an uncapped
 * ratio would let an over-shooting swap outrank a faithful one in the tie-break.
 *
 * The 1.3% of tiers with no ranges are ALL single-tier desecrated/perfect-essence mods ("Mark of the
 * Abyssal Lord", "Allocates a random Notable Passive Skill", …) — a tier relax can never reach them, so
 * an unmeasurable pair scores 1.0 and the lexicographic swap/drop counts carry the whole penalty.
 */
function valueRatio(got: Tier | undefined, want: Tier | undefined): number {
  if (!got || !want) return 1;
  const n = Math.min(got.ranges.length, want.ranges.length);
  let sum = 0;
  let counted = 0;
  for (let i = 0; i < n; i++) {
    const g = midAbs(got.ranges[i] ?? []);
    const w = midAbs(want.ranges[i] ?? []);
    if (g === undefined || w === undefined || Math.abs(w) < 1e-12) continue; // unmeasurable
    sum += g / w;
    counted++;
  }
  return counted === 0 ? 1 : Math.min(1, sum / counted);
}

function closenessOf(
  data: PatchData, desired: readonly AlternativeTarget[], slots: readonly SlotChange[],
): Closeness {
  let dropped = 0;
  let swapped = 0;
  let sum = 0;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i]!;
    if (s.kind === 'dropped') {
      dropped++;
      continue; // contributes 0 to the value mean
    }
    if (s.kind === 'swapped') swapped++;
    const want = desired[i]!;
    sum += valueRatio(tierAt(data, s.modId, s.minTierIndex), tierAt(data, want.modId, want.minTierIndex ?? 0));
  }
  return { dropped, swapped, valueRetained: slots.length > 0 ? sum / slots.length : 1 };
}

/** Negative ⇒ `a` is closer to the desired item than `b`. Lexicographic; see `Closeness`. */
export function compareCloseness(a: Closeness, b: Closeness): number {
  if (a.dropped !== b.dropped) return a.dropped - b.dropped;
  if (a.swapped !== b.swapped) return a.swapped - b.swapped;
  return b.valueRetained - a.valueRetained;
}

/** Same-family, same-type, rollable alternatives to `modId` in `base`'s normal pool (id-sorted). */
function siblingsOf(data: PatchData, base: ItemBase, modId: string): string[] {
  const mod = resolveMod(data, modId);
  if (mod.source !== 'normal') return []; // essence/desecrated mods aren't rolled — nothing to swap to
  const pool = [...base.pools.normal.prefixes, ...base.pools.normal.suffixes];
  const out = pool.filter((id) => {
    if (id === modId) return false;
    const m = resolveMod(data, id);
    // Same TYPE too: swapping a prefix for a suffix moves the craft to the other side and reshapes the
    // ≤3-per-side split — that's a different item, not a near-miss.
    // PRIMARY family only, deliberately: this is a similarity test, not an exclusion test. Matching on
    // any shared family would make a multi-family mod (a desecrated "+Str +Int") a "near-miss" for every
    // Strength AND every Intelligence mod, which is not what the user asked to approximate.
    return m.family === mod.family && m.type === mod.type;
  });
  out.sort(); // deterministic search order ⇒ reproducible frontiers
  return out;
}

/** Canonical key for a relaxed target (slot order is positional, so '-' for a drop is unambiguous). */
function keyOf(slots: readonly SlotChange[]): string {
  return slots.map((s) => (s.kind === 'dropped' ? '-' : `${s.modId}@${s.minTierIndex}`)).join('|');
}

function searchAlternatives(
  data: PatchData, base: ItemBase, prices: Prices,
  planFor: (targets: readonly TierTarget[]) => ParetoResult,
  desired: readonly AlternativeTarget[], budget: number, opts: AlternativesOptions,
): AlternativesResult {
  if (desired.length === 0) throw new Error('no desired mods');
  const maxNodes = Math.max(1, opts.maxNodes ?? DEFAULT_MAX_NODES);
  const cdfOpts = opts.costCells !== undefined ? { maxCells: opts.costCells } : {};

  /** Best P(in budget) reachable for one relaxed target — the best way to spend the budget on it. */
  const evaluate = (slots: readonly SlotChange[], closeness: Closeness): { alt?: Alternative; depth: CurrencyDepth } => {
    const targets: TierTarget[] = [];
    for (const s of slots) if (s.kind !== 'dropped') targets.push({ modId: s.modId, minTierIndex: s.minTierIndex });
    if (targets.length === 0) return { depth: 'full' }; // dropped everything — not an item
    let res: ParetoResult;
    try {
      res = planFor(targets);
    } catch {
      // The relaxation made the target illegal (essence rules, slot shape). Not a candidate — but its
      // children still are, so the caller keeps expanding.
      return { depth: 'full' };
    }
    // The CHEAPEST plan isn't automatically the likeliest to land inside the budget — a dearer, surer
    // plan can finish in budget more often — so scan the whole frontier rather than assuming.
    let best: ParetoPlan | undefined;
    let lower = -1;
    let upper = 0;
    for (const p of res.frontier) {
      const cdf = planCostCdf(prices, p.result, p.steps, budget, cdfOpts);
      if (cdf.lower > lower) {
        lower = cdf.lower;
        upper = cdf.upper;
        best = p;
      }
    }
    if (!best) return { depth: res.currencyDepth };
    return { alt: { slots, closeness, inBudget: lower, inBudgetMax: upper, plan: best }, depth: res.currencyDepth };
  };

  const replaceAt = (slots: readonly SlotChange[], i: number, s: SlotChange): SlotChange[] =>
    slots.map((x, j) => (j === i ? s : x));

  /** Slide one unpinned slot's tier requirement down a step. The EDIT (swap/drop) identity is fixed by
   *  the class seed, so within a class the lattice is tiers only. */
  const tierChildren = (slots: readonly SlotChange[]): SlotChange[][] => {
    const out: SlotChange[][] = [];
    for (let i = 0; i < slots.length; i++) {
      if (desired[i]!.pinned) continue;
      const s = slots[i]!;
      if (s.kind === 'dropped' || s.minTierIndex <= 0) continue;
      const t = s.minTierIndex - 1;
      out.push(replaceAt(slots, i, s.kind === 'kept'
        ? { kind: 'kept', modId: s.modId, minTierIndex: t }
        : { kind: 'swapped', modId: s.modId, from: s.from, minTierIndex: t }));
    }
    return out;
  };

  /** Every unpinned slot at its loosest tier — a class's farthest, likeliest node. */
  const anchorOf = (slots: readonly SlotChange[]): SlotChange[] =>
    slots.map((s, i) => (desired[i]!.pinned || s.kind === 'dropped' || s.minTierIndex === 0
      ? s
      : s.kind === 'kept'
        ? { kind: 'kept', modId: s.modId, minTierIndex: 0 }
        : { kind: 'swapped', modId: s.modId, from: s.from, minTierIndex: 0 }));

  const root: SlotChange[] = desired.map((d) => ({ kind: 'kept', modId: d.modId, minTierIndex: d.minTierIndex ?? 0 }));

  /** One seed per EDIT class: the unedited target, plus each single swap and each single drop. */
  const editSeeds = (): SlotChange[][] => {
    const out: SlotChange[][] = [];
    for (let i = 0; i < root.length; i++) {
      if (desired[i]!.pinned) continue;
      const s = root[i]!;
      if (s.kind !== 'kept') continue;
      for (const sib of siblingsOf(data, base, s.modId)) {
        const fam = resolveMod(data, sib).family;
        // A sibling shares the swapped-out mod's family by construction, so this can only fire if the
        // DESIRED target already listed two mods of one family (an impossible item). Cheap, and it keeps
        // the invariant explicit if the swap rule ever widens beyond same-family.
        const collides = root.some((o, j) => j !== i && o.kind !== 'dropped' && familiesOf(resolveMod(data, o.modId)).includes(fam));
        if (collides) continue;
        // Siblings can have fewer tiers ("+1 all Spell Skills" has 4, the elemental ones 5), so clamp.
        const tiers = resolveMod(data, sib).tiers.length;
        out.push(replaceAt(root, i, {
          kind: 'swapped', modId: sib, from: s.modId,
          minTierIndex: Math.max(0, Math.min(s.minTierIndex, tiers - 1)),
        }));
      }
      out.push(replaceAt(root, i, { kind: 'dropped', from: s.modId }));
    }
    return out;
  };

  const seen = new Set<string>();
  const evaluated: Alternative[] = [];
  let nodes = 0;
  let truncated = false;
  let depth: CurrencyDepth = 'full';

  /** Evaluate a node unless already seen. `spent` says whether a node budget was actually consumed —
   *  an already-seen node (a lattice diamond, or a seed that IS its own anchor) must not be charged. */
  const visit = (slots: readonly SlotChange[]): { spent: boolean; alt?: Alternative } => {
    const k = keyOf(slots);
    if (seen.has(k)) return { spent: false };
    seen.add(k);
    const { alt, depth: d } = evaluate(slots, closenessOf(data, desired, slots));
    nodes++;
    // The one place `nodes` moves, so the one place progress needs reporting. Per-node is cheap: the
    // cap is 200, and each node just cost a full Pareto run.
    opts.onProgress?.(nodes, maxNodes);
    if (DEPTH_RANK[d] > DEPTH_RANK[depth]) depth = d;
    if (alt) {
      evaluated.push(alt);
      return { spent: true, alt };
    }
    return { spent: true };
  };

  /** Explore ONE edit class's tier lattice on its own node budget: the loosest node first (a class's
   *  best odds, and the row a squeezed budget most needs), then best-first outward from the seed. */
  const explore = (seed: readonly SlotChange[], budget: number): void => {
    // The global cap outranks the per-class budget: the anchor visit below is unconditional, so without
    // this every remaining class would still spend a node and blow past maxNodes.
    if (nodes >= maxNodes) {
      truncated = true;
      return;
    }
    let used = 0;
    if (visit(anchorOf(seed)).spent) used++;
    const queue: { slots: SlotChange[]; closeness: Closeness }[] = [
      { slots: [...seed], closeness: closenessOf(data, desired, seed) },
    ];
    while (queue.length > 0) {
      if (used >= budget || nodes >= maxNodes) {
        truncated = true; // conservative: the queue may hold only stale (already-seen) entries
        break;
      }
      // Pop this class's CLOSEST queued node, so a squeezed budget is spent nearest your actual item.
      // (Linear scan: the queue stays small, and a heap would only obscure that.)
      let bi = 0;
      for (let i = 1; i < queue.length; i++) {
        if (compareCloseness(queue[i]!.closeness, queue[bi]!.closeness) < 0) bi = i;
      }
      const node = queue.splice(bi, 1)[0]!;
      const r = visit(node.slots);
      if (!r.spent) continue; // already reached another way — free, and its children are queued already
      used++;
      // Popping in closeness order WITHIN the class means a certainty here dominates every farther node
      // of this class — so the class is finished, not truncated.
      if (r.alt && r.alt.inBudget >= 1 - FRONTIER_EPS) break;
      for (const child of tierChildren(node.slots)) {
        if (!seen.has(keyOf(child))) queue.push({ slots: child, closeness: closenessOf(data, desired, child) });
      }
    }
  };

  // Budget split: half to your own item's tier neighbourhood (the rows you most want detail on), half
  // shared by the edit classes — enough for each to report its loosest and least-relaxed forms. Without
  // this split the edit classes STARVE: every tier relaxation is lexicographically closer than any swap,
  // and a 3-mod target already has 4×11×8 = 352 tier combos, so a global best-first walk would never
  // reach a single swap or drop and a squeezed budget would be told "20% is the best you can do" while
  // dropping one mod sat at 99%.
  const edits = editSeeds();
  const tierBudget = Math.max(1, Math.floor(maxNodes / 2));
  explore(root, tierBudget);
  if (edits.length > 0) {
    const each = Math.max(2, Math.floor((maxNodes - Math.min(nodes, tierBudget)) / edits.length));
    for (const seed of edits) explore(seed, each);
  }

  // Output order is NOT visit order: the frontier rule only needs the evaluated set sorted by closeness
  // at the END. Equal-closeness ties are settled by odds so the sweep keeps the best of them, then by
  // key so the frontier is reproducible.
  evaluated.sort((a, b) =>
    compareCloseness(a.closeness, b.closeness)
    || b.inBudget - a.inBudget
    || keyOf(a.slots).localeCompare(keyOf(b.slots)));

  // A row earns its place only by beating every CLOSER row's odds — that antichain is the frontier.
  // (bestP starts at −∞ so the exact target always takes row 0, however hopeless its P.)
  const frontier: Alternative[] = [];
  let bestP = -Infinity;
  for (const a of evaluated) {
    if (a.inBudget > bestP + FRONTIER_EPS) {
      frontier.push(a);
      bestP = a.inBudget;
    }
  }

  return { frontier, nodesEvaluated: nodes, truncated, currencyDepth: depth };
}

/**
 * Budget-constrained alternatives for a craft from a WHITE base. `budget` is in exalt-equivalents.
 * See the file header for what "close" means and what may be relaxed.
 */
export function alternativesFromWhite(
  data: PatchData, rawPrices: Prices, base: ItemBase, desired: readonly AlternativeTarget[],
  budget: number, opts: AlternativesOptions = {},
): AlternativesResult {
  const level = opts.level ?? 100;
  const maxPlans = opts.maxPlansPerNode ?? DEFAULT_MAX_PLANS_PER_NODE;
  const policy = opts.policy;
  const prices = pricesForBase(rawPrices, base); // the bone a Desecration consumes depends on the base
  return searchAlternatives(
    data, base, prices,
    (targets) => optimizePareto(data, prices, base, targets, { level, maxPlans, ...(policy ? { policy } : {}) }),
    desired, budget, opts,
  );
}

/**
 * Budget-constrained alternatives for transforming an item you already HOLD — same lattice, but each
 * node is costed with optimizeFromItem's reset-to-your-item model rather than from-white.
 */
export function alternativesFromItem(
  data: PatchData, rawPrices: Prices, start: ItemState, desired: readonly AlternativeTarget[],
  budget: number, opts: AlternativesOptions = {},
): AlternativesResult {
  // A fractured ("carved") mod is inherently pinned: it's physically locked on the item, so it can be
  // neither dropped nor swapped, and its tier is already decided. Pin it whatever the caller passed.
  const fractured = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));
  const pinned = desired.map((d) => (fractured.has(d.modId) ? { ...d, pinned: true } : d));
  const policy = opts.policy;
  const prices = pricesForBase(rawPrices, start.base);
  return searchAlternatives(
    data, start.base, prices,
    (targets) => optimizeFromItem(data, prices, start, targets, policy ? { policy } : {}),
    pinned, budget, opts,
  );
}
