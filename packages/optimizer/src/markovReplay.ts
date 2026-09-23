// Play a SOLVED policy on real items, dice and all — the check the solver's own number cannot give,
// and the only way to answer "how often will I see this mod on the way?".
//
// The solve works on an ABSTRACTION of the item (markovState.ts): which targets are on it, which are
// blocked, and how many other mods sit on each side. That is what makes it fast, and it is also where
// its approximations live — the lattice cannot know WHICH other mod landed, so it cannot know that that
// mod's family has left the pool, or that it happens to share a family with a target. Here the item is
// concrete: every roll picks a real mod at a real tier, by weight, under the game's family exclusion,
// and the policy is asked what to do by classifying the item exactly as a held item is classified at
// the start of a solve (`classifyStart`). So the average cost of these crafts is what following the
// policy really costs, and where it disagrees with the solver's number, the abstraction is what is off.
//
// The same walk answers the watch list. A set of mods is SEEN in a craft when every one of them sits on
// the item at the same moment, at any point before it finishes — restarts included, because a craft the
// player abandons still passes through their hands.

import type { AffixType, ItemState, Mod, PatchData, PlacedMod, Rarity } from '../../engine/src/types.ts';
import { CURRENCY_FLOOR } from '../../engine/src/types.ts';
import { familiesOf, modTierWeight, resolveMod } from '../../engine/src/pool.ts';
import { limitsOf } from '../../engine/src/item.ts';
import type { McAction } from './markovActions.ts';
import type { McState, McTarget, StateEncoder, StateKey } from './markovState.ts';
import { classifyStart } from './markovState.ts';
import { mulberry32 } from './simulate.ts';

/**
 * One modifier a watch entry asks for: an id, or an id with bounds on the value it rolled — "rerolling
 * Favours 3 additional times" sells for more than "1 additional time", so the two are different
 * entries. Bounds read the modifier's FIRST stat, and a value is drawn uniformly over its tier's range
 * (whole numbers when the range is), only for a modifier some entry puts bounds on — so a replay that
 * asks for none rolls exactly the dice it always did.
 */
export type WatchMod = string | { readonly id: string; readonly min?: number; readonly max?: number };

export interface ReplayOptions {
  /** How many crafts to play. */
  readonly runs: number;
  /** Seed for the dice, so a result can be reproduced. Default 1. */
  readonly seed?: number;
  /** Sets of mods to watch for — a single mod, or a combination that has to be on the item together. */
  readonly watch?: readonly (readonly WatchMod[])[];
  /** Give up on a craft after this many moves. A runaway guard, not a budget. Default 1,000,000. */
  readonly maxActions?: number;
  /**
   * Stop starting new crafts after this many milliseconds, and report the ones played — `runs` in the
   * result says how many that was, and `stdErr` widens to match. ABSENT means no clock, which keeps a
   * test's numbers identical on every machine; only the app passes one.
   */
  readonly maxMillis?: number;
  /**
   * How far along the replay is, 0–1: crafts played over `runs`, or time spent over `maxMillis`,
   * whichever is further — the one that will end it. Called each time that moves by a hundredth.
   */
  readonly onProgress?: (fraction: number) => void;
}

/** Crafts played whatever the clock says, so a share is never read off a handful of them. */
const MIN_RUNS = 64;

export interface ReplayResult {
  readonly ok: true;
  /** Crafts actually played — fewer than asked when `maxMillis` ran out first. */
  readonly runs: number;
  /** Mean spent to finish, restarts included, in the solve's unit (exalt-equivalents). */
  readonly meanCost: number;
  /** Standard error of `meanCost` — the dice's share of the difference from the solver's number. */
  readonly stdErr: number;
  /** Mean number of moves per craft. */
  readonly meanActions: number;
  /** Per watch entry, in the order given: the share of crafts in which it was seen. */
  readonly seen: readonly number[];
}

/** A replay, or why there is none. It declines rather than guesses: see `play`. */
export type ReplayReport = ReplayResult | { readonly ok: false; readonly reason: string };

/** What the replay needs from a finished solve — the pieces that decide what the policy sees. */
export interface ReplayContext {
  readonly data: PatchData;
  /** The item the craft began from, which is also where a restart returns to. */
  readonly start: ItemState;
  readonly list: readonly McTarget[];
  readonly idxOf: ReadonlyMap<string, number>;
  /** Same-side family siblings → the position each blocks, exactly as the solve classified its start. */
  readonly blocks: ReadonlyMap<string, number>;
  /** The solve's own encoder, canonicalisation included — any other spelling misses the policy. */
  readonly encode: StateEncoder;
  readonly policy: ReadonlyMap<StateKey, McAction>;
  readonly isGoal: (s: McState) => boolean;
  readonly costOf: (a: McAction) => number;
  /** What finishing costs on this real item — its empty slots filled (`MarkovOptions.fillOnFinish`). */
  readonly finishCost?: (item: ItemState) => number;
}

export function replayPolicy(ctx: ReplayContext, opts: ReplayOptions): ReplayReport {
  const { data, start, list, idxOf, blocks, encode, policy, isGoal, costOf, finishCost } = ctx;
  const runs = Math.max(1, Math.floor(opts.runs));
  const rng = mulberry32(opts.seed ?? 1);
  const maxActions = opts.maxActions ?? 1_000_000;
  const watch = (opts.watch ?? []).map((entry) => entry.map((w) => (typeof w === 'string' ? { id: w } : w)));
  const valued = new Set(watch.flat().filter((w) => w.min !== undefined || w.max !== undefined).map((w) => w.id));
  /** The value each placed mod rolled — only for the mods in `valued`. */
  const rolled = new WeakMap<PlacedMod, number>();
  const limits = limitsOf(start.base);
  const level = start.level;

  /*
   * The normal pool, flattened once: prefixes then suffixes, each mod with its families as small
   * integers. A replay rolls millions of times, and deciding "is this family on the item?" by string
   * lookup for every mod of every roll was most of its cost.
   */
  const famIndex = new Map<string, number>();
  const famsOf = (mod: Mod): number[] => familiesOf(mod).map((f) => {
    let k = famIndex.get(f);
    if (k === undefined) { k = famIndex.size; famIndex.set(f, k); }
    return k;
  });
  const poolIds = [...start.base.pools.normal.prefixes, ...start.base.pools.normal.suffixes];
  const nPrefix = start.base.pools.normal.prefixes.length;
  const poolMods = poolIds.map((id) => resolveMod(data, id));
  const poolFams = poolMods.map(famsOf);
  const placedFams = new Map<string, readonly number[]>();
  const famsOfPlaced = (modId: string): readonly number[] => {
    let f = placedFams.get(modId);
    if (!f) { f = famsOf(resolveMod(data, modId)); placedFams.set(modId, f); }
    return f;
  };
  // Sized after every pool family is indexed; a held mod from outside the pool can add a few more.
  let occupied = new Uint8Array(famIndex.size + 16);
  const scratch = new Float64Array(poolMods.length);

  /** How many mods a side holds at a rarity: none on a white item, one when Magic, the base's own cap when Rare. */
  const capOf = (rarity: Rarity, side: AffixType): number =>
    (rarity === 'rare' ? (side === 'prefix' ? limits.prefixes : limits.suffixes) : rarity === 'magic' ? 1 : 0);

  /** Every pool mod's weight inside [floor, item level] — the window `modTierWeight` sums — once per floor. */
  const weightCache = new Map<number, Float64Array>();
  const weightsAt = (floor: number): Float64Array => {
    let w = weightCache.get(floor);
    if (!w) { w = Float64Array.from(poolMods, (m) => modTierWeight(m, floor, level)); weightCache.set(floor, w); }
    return w;
  };

  /**
   * One random mod by weight from the open sides, the game's way: every family already on the item is
   * out of the draw, the junk's included — which is exactly the part the lattice cannot see.
   * `undefined` when nothing at all can roll.
   */
  const add = (item: ItemState, floor: number, side: AffixType | undefined, into: Rarity): ItemState | undefined => {
    const onItem = [...item.prefixes, ...item.suffixes];
    for (const p of onItem) {
      for (const f of famsOfPlaced(p.modId)) {
        if (f >= occupied.length) { const grown = new Uint8Array(f * 2 + 16); grown.set(occupied); occupied = grown; }
        occupied[f] = 1;
      }
    }
    const weights = weightsAt(floor);
    const prefixOpen = side !== 'suffix' && item.prefixes.length < capOf(into, 'prefix');
    const suffixOpen = side !== 'prefix' && item.suffixes.length < capOf(into, 'suffix');
    let total = 0;
    for (let i = 0; i < poolMods.length; i++) {
      let w = (i < nPrefix ? prefixOpen : suffixOpen) ? weights[i]! : 0;
      if (w > 0) for (const f of poolFams[i]!) if (occupied[f] === 1) { w = 0; break; }
      scratch[i] = w;
      total += w;
    }
    for (const p of onItem) for (const f of famsOfPlaced(p.modId)) occupied[f] = 0;
    if (total <= 0) return undefined;
    let r = rng() * total;
    // The last mod with any weight takes whatever floating-point residue survives the loop — the draw an
    // exact comparison would have made anyway.
    let pick = -1;
    for (let i = 0; i < poolMods.length; i++) {
      if (scratch[i]! <= 0) continue;
      pick = i;
      r -= scratch[i]!;
      if (r < 0) break;
    }
    const mod = poolMods[pick]!;
    const placed: PlacedMod = { modId: mod.id, tierName: pickTier(mod, floor) };
    if (valued.has(mod.id)) rolled.set(placed, rollValue(mod, placed.tierName));
    return place(item, pick < nPrefix ? 'prefix' : 'suffix', placed, into);
  };

  /** A value inside the tier's range for its first stat, uniformly — whole numbers when the range is. */
  const rollValue = (mod: Mod, tierName: string): number => {
    const range = mod.tiers.find((t) => t.name === tierName)?.ranges[0];
    const lo = range?.[0] ?? 0;
    const hi = range?.[1] ?? lo;
    return Number.isInteger(lo) && Number.isInteger(hi) ? lo + Math.floor(rng() * (hi - lo + 1)) : lo + rng() * (hi - lo);
  };

  /** Which tier the mod lands at, by tier weight inside the window — it decides present or blocked. */
  const pickTier = (mod: Mod, floor: number): string => {
    let r = rng() * modTierWeight(mod, floor, level);
    let last = '';
    for (const t of mod.tiers) {
      if (t.ilvl < floor || t.ilvl > level || t.weight <= 0) continue;
      last = t.name;
      r -= t.weight;
      if (r < 0) return t.name;
    }
    return last;
  };

  const place = (item: ItemState, side: AffixType, placed: PlacedMod, rarity: Rarity): ItemState => ({
    ...item,
    rarity,
    prefixes: side === 'prefix' ? [...item.prefixes, placed] : item.prefixes,
    suffixes: side === 'suffix' ? [...item.suffixes, placed] : item.suffixes,
  });

  /** One uniformly random removable mod gone, optionally from one side only (an Annulment omen). */
  const remove = (item: ItemState, side?: AffixType): ItemState => {
    const slots: [AffixType, number][] = [];
    if (side !== 'suffix') item.prefixes.forEach((p, i) => { if (!p.fractured) slots.push(['prefix', i]); });
    if (side !== 'prefix') item.suffixes.forEach((p, i) => { if (!p.fractured) slots.push(['suffix', i]); });
    if (slots.length === 0) return item;
    const [sd, drop] = slots[Math.floor(rng() * slots.length)]!;
    return sd === 'prefix'
      ? { ...item, prefixes: item.prefixes.filter((_, i) => i !== drop) }
      : { ...item, suffixes: item.suffixes.filter((_, i) => i !== drop) };
  };

  /**
   * What a move does to a real item — each one the concrete twin of its distribution in markovActions.ts.
   *
   * `undefined` for a move the replay does not model (a Desecration's three-way offer, an Essence, an
   * Omen of Light), and the whole replay then declines rather than approximating it: a replay that
   * guessed would be the one number here that could not be trusted.
   */
  const play = (action: McAction, item: ItemState): ItemState | undefined | 'nothing-rolls' => {
    switch (action.currency) {
      case 'transmute':
      case 'augment':
      case 'regal':
      case 'exalt': {
        const into: Rarity = action.currency === 'transmute' || action.currency === 'augment' ? 'magic' : 'rare';
        const side = action.currency === 'exalt' ? action.side : undefined;
        return add(item, CURRENCY_FLOOR[action.currency][action.strength], side, into) ?? 'nothing-rolls';
      }
      case 'annul':
        return action.light ? undefined : remove(item, action.side);
      case 'chaos': {
        // Remove, then roll one at base strength on what is left — and if nothing can roll, the
        // removal stands alone, exactly as `chaosOutcomes` has it.
        const mid = remove(item);
        return add(mid, 0, undefined, mid.rarity) ?? mid;
      }
      case 'restart':
        return start;
      default:
        return undefined;
    }
  };

  const holds = (item: ItemState, w: { readonly id: string; readonly min?: number; readonly max?: number }): boolean => {
    const placed = item.prefixes.find((p) => p.modId === w.id) ?? item.suffixes.find((p) => p.modId === w.id);
    if (!placed) return false;
    if (w.min === undefined && w.max === undefined) return true;
    const v = rolled.get(placed);
    return v !== undefined && (w.min === undefined || v >= w.min) && (w.max === undefined || v <= w.max);
  };

  const seenCount = new Array<number>(watch.length).fill(0);
  let sum = 0;
  let sumSq = 0;
  let movesTotal = 0;
  const begun = Date.now();
  const deadline = opts.maxMillis === undefined ? Infinity : begun + opts.maxMillis;
  let shown = 0;
  let played = 0;
  for (let run = 0; run < runs; run++) {
    // Read every craft: one long craft takes tens of milliseconds, so reading it every 64 overshot a
    // 2-second clock by seconds and left a progress bar still for as long.
    const now = Date.now();
    if (run >= MIN_RUNS && now > deadline) break;
    const done = Math.min(1, Math.max(run / runs, (now - begun) / (opts.maxMillis ?? Infinity)));
    if (opts.onProgress && done - shown >= 0.01) {
      shown = done;
      opts.onProgress(done);
    }
    let item = start;
    let cost = 0;
    let moves = 0;
    const seen = new Uint8Array(watch.length);
    const look = (): void => {
      for (let k = 0; k < watch.length; k++) {
        if (seen[k] === 0 && watch[k]!.every((w) => holds(item, w))) seen[k] = 1;
      }
    };
    look();
    for (;;) {
      const s = classifyStart(data, item, list, idxOf, blocks);
      if (isGoal(s)) { cost += finishCost?.(item) ?? 0; break; }
      const key = encode(s.present, s.blocked, s.jp, s.js, s.flagged, s.rarity);
      const action = policy.get(key);
      if (!action) return { ok: false, reason: `the policy has no move for state ${key}` };
      if (++moves > maxActions) return { ok: false, reason: `a craft ran past ${maxActions} moves` };
      const next = play(action, item);
      if (next === undefined) return { ok: false, reason: `the route plays a ${action.currency} move the replay does not model` };
      if (next === 'nothing-rolls') {
        return { ok: false, reason: `the policy played a ${action.currency} where nothing on the real item can roll` };
      }
      cost += costOf(action);
      item = next;
      look();
    }
    played++;
    sum += cost;
    sumSq += cost * cost;
    movesTotal += moves;
    for (let k = 0; k < watch.length; k++) seenCount[k]! += seen[k]!;
  }
  const mean = sum / played;
  const variance = played > 1 ? Math.max(0, (sumSq - played * mean * mean) / (played - 1)) : 0;
  return {
    ok: true,
    runs: played,
    meanCost: mean,
    stdErr: Math.sqrt(variance / played),
    meanActions: movesTotal / played,
    seen: seenCount.map((c) => c / played),
  };
}
