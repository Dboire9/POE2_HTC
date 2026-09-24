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
import { ANCIENT_BONE_FLOOR, DESECRATION_OFFER_COUNT, desecrationOmenForMod } from '../../engine/src/probability.ts';
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
   * test's numbers identical on every machine; only the app passes one. Declines, with the reason, when
   * even `MIN_RUNS` crafts would take `GIVE_UP_AFTER` times this.
   */
  readonly maxMillis?: number;
  /**
   * How far along the replay is, 0–1: crafts played over `runs`, or time spent over `maxMillis`,
   * whichever is further — the one that will end it. Called each time that moves by a hundredth.
   */
  readonly onProgress?: (fraction: number) => void;
  /**
   * What each watch entry SELLS for, in the solve's unit, in the order of `watch` — 0 or less for one
   * nobody priced. With it the replay plays one rule the policy cannot: when the item holds a priced
   * set and selling it beats carrying on — the price, less what filling the item costs, against the
   * start over it forces, `restartCost + V(start)`, less what finishing from here would still cost,
   * `V(here)` — fill it (a Regal if Magic, then Exalts until every slot is taken: an item is always sold
   * full, since another good modifier can only raise its price), sell it at the best priced set it then
   * holds, start a fresh base, and keep going for the target. A one-step improvement on the solved policy.
   * Needs `valueOf` and `restartCost` in the context; without either, nothing is sold.
   */
  readonly sell?: readonly number[];
}

/** Crafts played whatever the clock says, so a share is never read off a handful of them. */
const MIN_RUNS = 64;
/**
 * …unless those crafts would take this many times the clock: then the replay declines rather than keep
 * the player waiting. A four-modifier tablet whose rarest pieces are 1 roll in 150 needs over a million
 * orbs and restarts a craft — seconds EACH — and at that length the cost the model gives is all
 * there is to say (reported 2026-09-23: "a craft ran past 1000000 moves", after a long wait).
 */
const GIVE_UP_AFTER = 3;

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
  /**
   * What one craft costs, as its percentiles: `costPercentiles[p]` is the cost p% of the crafts played
   * came in under (0–100, 101 values). The mean alone hides the question a player asks before starting —
   * "if I put this much in, how likely am I to finish?" — and the spread is wide: on a rare target half
   * the crafts cost well under the mean and one in ten several times it.
   */
  readonly costPercentiles: readonly number[];
  /**
   * With `sell`: what selling on the way brought back, per craft on average — `revenue` in the solve's
   * unit, and how many of each watch entry were sold (`perEntry`, in the order of `watch`). `meanCost`
   * and the percentiles then include the fresh bases those sales forced; revenue is NOT netted out of
   * them, so a caller shows both. Absent without `sell`.
   */
  readonly sales?: { readonly revenue: number; readonly perEntry: readonly number[] };
  /**
   * What the policy actually PLAYS, per craft on average, by currency — `restart` included (a fresh
   * base each time). The solved policy is a table over every state; this is what following it spends,
   * which is what "how does this plan work" has to be answered from.
   */
  readonly movesPerCraft: Readonly<Record<string, number>>;
  /**
   * The same per craft, move by move as priced: each distinct move (strength, omens and all), how many
   * times a craft plays it on average and what it spends on it — an Echoes omen counted when it is
   * actually spent. Sums to `meanCost` less what finishing and selling add. For a line-by-line bill.
   */
  readonly spendByMove: readonly { readonly action: McAction; readonly count: number; readonly spent: number }[];
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
  /** The solved value of a state — what finishing from it still costs. Only the `sell` rule reads it. */
  readonly valueOf?: (key: StateKey) => number | undefined;
  /** What a fresh base costs, when the craft may start over. Only the `sell` rule reads it. */
  readonly restartCost?: number;
  /** What finishing costs on this real item — its empty slots filled (`MarkovOptions.fillOnFinish`). */
  readonly finishCost?: (item: ItemState) => number;
  /**
   * An Omen of Abyssal Echoes: its price, and per state the line the plan throws an offer back below
   * (`RouteTable.rerollAbove`). Without it an omened Desecration is played as a plain one.
   */
  readonly reroll?: { readonly cost: number; readonly above: (key: StateKey) => number | undefined };
}

export function replayPolicy(ctx: ReplayContext, opts: ReplayOptions): ReplayReport {
  const { data, start, list, idxOf, blocks, encode, policy, isGoal, costOf, finishCost, valueOf, restartCost, reroll } = ctx;
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

  /** The mod a Desecration placed: marked by the bone, or from the desecrated pool (`classifyStart`'s rule). */
  const isFlagged = (p: PlacedMod): boolean => p.desecrated === true || data.mods.get(p.modId)?.source === 'desecrated';
  const desPool = start.base.pools.desecrated;
  const normalPool = start.base.pools.normal;

  /**
   * One draw of a bone — the twin of `desecrateOutcomes` / `desecrateAnyOutcomes`. With a boss omen: that
   * boss's carved pool, count-uniformly; without one: the base's normal and carved pools together, by
   * weight, above the bone's floor (40 for an Ancient bone). A side omen keeps it to one side, a full
   * side is out, and every family on the item is out — the junk's included, which the lattice cannot
   * see. What lands carries the bone's mark. `undefined` when nothing can land.
   */
  const desecrationDraw = (item: ItemState, a: Extract<McAction, { readonly currency: 'desecrate' }>): ItemState | undefined => {
    const fams = new Set([...item.prefixes, ...item.suffixes].flatMap((p) => familiesOf(resolveMod(data, p.modId))));
    const floor = a.ancient ? ANCIENT_BONE_FLOOR : 0;
    const cands: { mod: Mod; side: AffixType; w: number }[] = [];
    let total = 0;
    for (const side of ['prefix', 'suffix'] as const) {
      if (a.side !== undefined && a.side !== side) continue;
      if ((side === 'prefix' ? item.prefixes : item.suffixes).length >= capOf('rare', side)) continue;
      const ids = a.boss ? desPool[side === 'prefix' ? 'prefixes' : 'suffixes']
        : [...normalPool[side === 'prefix' ? 'prefixes' : 'suffixes'], ...desPool[side === 'prefix' ? 'prefixes' : 'suffixes']];
      for (const id of ids) {
        const mod = resolveMod(data, id);
        if (a.boss && desecrationOmenForMod(mod) !== a.boss) continue;
        if (familiesOf(mod).some((f) => fams.has(f))) continue;
        const w = a.boss ? 1 : modTierWeight(mod, floor, level);
        if (w <= 0) continue;
        cands.push({ mod, side, w });
        total += w;
      }
    }
    if (total <= 0) return undefined;
    let r = rng() * total;
    let pick = cands[cands.length - 1]!;
    for (const c of cands) { r -= c.w; if (r < 0) { pick = c; break; } }
    return place(item, pick.side, { modId: pick.mod.id, tierName: pickTier(pick.mod, floor), desecrated: true }, 'rare');
  };

  /**
   * A Desecration as the plan plays it: three draws offered, the one the plan values most KEPT — the
   * cheapest to finish from, `keepWeights`' rule — and, with an Omen of Abyssal Echoes, the whole offer
   * thrown back once when even its best sits above the plan's line, the omen spent only then. `extra`
   * is that spend. `undefined` without the solved values the rule needs.
   */
  const offer = (
    a: Extract<McAction, { readonly currency: 'desecrate' }>, item: ItemState, key: StateKey,
  ): { item: ItemState; extra: number } | 'nothing-rolls' | undefined => {
    if (!valueOf) return undefined;
    const worth = (it: ItemState): number => {
      const s = classifyStart(data, it, list, idxOf, blocks);
      return valueOf(encode(s.present, s.blocked, s.jp, s.js, s.flagged, s.rarity)) ?? Infinity;
    };
    const best = (): { item: ItemState; v: number } | undefined => {
      let kept: { item: ItemState; v: number } | undefined;
      for (let k = 0; k < DESECRATION_OFFER_COUNT; k++) {
        const drawn = desecrationDraw(item, a);
        if (!drawn) return undefined;
        const v = worth(drawn);
        if (!kept || v < kept.v) kept = { item: drawn, v };
      }
      return kept;
    };
    const first = best();
    if (!first) return 'nothing-rolls';
    const line = a.echoes && reroll ? reroll.above(key) : undefined;
    if (line === undefined || !(first.v > line)) return { item: first.item, extra: 0 };
    const again = best();
    return again ? { item: again.item, extra: reroll!.cost } : 'nothing-rolls';
  };

  /**
   * What a move does to a real item — each one the concrete twin of its distribution in markovActions.ts.
   * A Desecration is `offer`'s, since keeping one of three needs the state the item is in.
   *
   * `undefined` for a move the replay does not model, and the whole replay then declines rather than
   * approximating it: a replay that guessed would be the one number here that could not be trusted.
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
      case 'annul': {
        if (!action.light) return remove(item, action.side);
        // An Omen of Light takes the mod a Desecration placed, for certain (`lightOutcomes`).
        const flagged = [...item.prefixes, ...item.suffixes].find(isFlagged);
        return flagged ? { ...item, prefixes: item.prefixes.filter((p) => p !== flagged), suffixes: item.suffixes.filter((p) => p !== flagged) } : undefined;
      }
      case 'chaos': {
        // Remove, then roll one at base strength on what is left — and if nothing can roll, the
        // removal stands alone, exactly as `chaosOutcomes` has it.
        const mid = remove(item);
        return add(mid, 0, undefined, mid.rarity) ?? mid;
      }
      case 'restart':
        return start;
      case 'essence': {
        // A regular Essence forces its mod at the level bought and turns the Magic item Rare (`essenceOutcomes`).
        const mod = resolveMod(data, action.target);
        const tier = mod.tiers[action.tierIndex];
        return tier ? place(item, mod.type, { modId: mod.id, tierName: tier.name }, 'rare') : undefined;
      }
      case 'perfect-essence': {
        // Eats one mod at random — on one side under a Crystallisation omen — then forces its own
        // (`perfectEssenceOutcomes`): at the tier the craft asked of it, which is what makes it present.
        const mod = resolveMod(data, action.target);
        const i = idxOf.get(action.target);
        const minIndex = i === undefined ? 0 : list[i]!.mods.find((m) => m.mod.id === mod.id)?.minIndex ?? 0;
        const tier = mod.tiers[minIndex] ?? mod.tiers.at(-1);
        const mid = item.prefixes.length + item.suffixes.length === 0 ? item : remove(item, action.side);
        if ((mod.type === 'prefix' ? mid.prefixes : mid.suffixes).length >= capOf(mid.rarity, mod.type)) return undefined;
        return tier ? place(mid, mod.type, { modId: mod.id, tierName: tier.name }, mid.rarity) : undefined;
      }
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
  let played = 0;
  const begun = Date.now();
  const deadline = opts.maxMillis === undefined ? Infinity : begun + opts.maxMillis;
  const giveUpAt = opts.maxMillis === undefined ? Infinity : begun + GIVE_UP_AFTER * opts.maxMillis;
  /**
   * Why a craft this long is not played out, in the words the result shows: the crafts played so far
   * when there are some, else the one that ran on.
   */
  const tooLong = (inThisOne: number): string => `too long a craft to play out — ${played > 0 && movesTotal / played > inThisOne
    ? `about ${Math.round(movesTotal / played).toLocaleString('en')}`
    : `over ${inThisOne.toLocaleString('en')}`} orbs and restarts a craft`;
  let shown = 0;
  const costs: number[] = [];
  const moveCount = new Map<string, number>();
  const spendBy = new Map<string, { action: McAction; count: number; spent: number }>();
  /** One move played and what it spent — the line-by-line bill (`spendByMove`). */
  const tally = (a: McAction, spent: number): void => {
    const k = JSON.stringify(a);
    const e = spendBy.get(k);
    if (e) { e.count++; e.spent += spent; } else spendBy.set(k, { action: a, count: 1, spent });
  };
  // The sell rule: priced entries, and what starting over is worth — both fixed for the whole replay.
  const sellAt = opts.sell && valueOf && restartCost !== undefined ? opts.sell : undefined;
  const startOver = sellAt ? (() => {
    const s0 = classifyStart(data, start, list, idxOf, blocks);
    return restartCost! + (valueOf!(encode(s0.present, s0.blocked, s0.jp, s0.js, s0.flagged, s0.rarity)) ?? Infinity);
  })() : Infinity;
  const sold = new Array<number>(watch.length).fill(0);
  let revenue = 0;
  const REGAL: McAction = { currency: 'regal', strength: 'base' };
  const EXALT: McAction = { currency: 'exalt', strength: 'base' };
  const slotsLeft = (item: ItemState): number =>
    limits.prefixes + limits.suffixes - item.prefixes.length - item.suffixes.length;
  /** What filling an item costs before selling it, counted before any dice: a Regal if Magic, an Exalt a slot. */
  const fillCostOf = (item: ItemState): number => (item.rarity === 'magic'
    ? costOf(REGAL) + Math.max(0, slotsLeft(item) - 1) * costOf(EXALT)
    : item.rarity === 'rare' ? slotsLeft(item) * costOf(EXALT) : Infinity);
  /** Fill an item to every slot, as a player does before selling: spends and counts the orbs. */
  const fillUp = (item: ItemState): { item: ItemState; spent: number } => {
    let it = item;
    let spent = 0;
    const step = (a: McAction): boolean => {
      const next = play(a, it);
      if (next === undefined || next === 'nothing-rolls') return false;
      it = next;
      spent += costOf(a);
      tally(a, costOf(a));
      moveCount.set(a.currency, (moveCount.get(a.currency) ?? 0) + 1);
      return true;
    };
    if (it.rarity === 'magic' && !step(REGAL)) return { item: it, spent };
    while (it.rarity === 'rare' && slotsLeft(it) > 0 && step(EXALT));
    return { item: it, spent };
  };
  /** The best-priced watched set this item holds, if any: [entry, price]. */
  const bestSale = (item: ItemState): [number, number] | undefined => {
    let best: [number, number] | undefined;
    for (let k = 0; k < watch.length; k++) {
      const p = sellAt![k] ?? 0;
      if (p > 0 && (!best || p > best[1]) && watch[k]!.every((w) => holds(item, w))) best = [k, p];
    }
    return best;
  };
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
      if (sellAt) {
        // Sell when the price beats carrying on: what starting over costs, less what finishing from here
        // would still have cost. Where the policy would bin the item anyway that is any price at all.
        const sale = bestSale(item);
        const here = valueOf!(key);
        if (sale && here !== undefined && sale[1] - fillCostOf(item) > startOver - here) {
          if (++moves > maxActions) return { ok: false, reason: tooLong(moves) };
          // Filled first — it can only gain: whatever lands is added, nothing comes off.
          const full = fillUp(item);
          const best = bestSale(full.item) ?? sale;
          sold[best[0]]! += 1;
          revenue += best[1];
          cost += full.spent + restartCost!;
          tally({ currency: 'restart', cost: restartCost! }, restartCost!);
          moveCount.set('sell', (moveCount.get('sell') ?? 0) + 1);
          item = start;
          look();
          continue;
        }
      }
      const action = policy.get(key);
      if (!action) return { ok: false, reason: `the policy has no move for state ${key}` };
      if (++moves > maxActions) return { ok: false, reason: tooLong(moves) };
      // The clock, read every 4,096 moves: a craft of millions of them is seconds on its own.
      if ((moves & 4095) === 0 && played < MIN_RUNS && Date.now() > giveUpAt) return { ok: false, reason: tooLong(moves) };
      moveCount.set(action.currency, (moveCount.get(action.currency) ?? 0) + 1);
      let extra = 0;
      let next: ItemState | 'nothing-rolls' | undefined;
      if (action.currency === 'desecrate') {
        const o = offer(action, item, key);
        next = o === undefined || o === 'nothing-rolls' ? o : o.item;
        if (o !== undefined && o !== 'nothing-rolls') extra = o.extra;
      } else {
        next = play(action, item);
      }
      if (next === undefined) return { ok: false, reason: `the route plays a ${action.currency} move the replay does not model` };
      if (next === 'nothing-rolls') {
        return { ok: false, reason: `the policy played a ${action.currency} where nothing on the real item can roll` };
      }
      const spent = costOf(action) + extra;
      cost += spent;
      tally(action, spent);
      item = next;
      look();
    }
    played++;
    costs.push(cost);
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
    costPercentiles: percentiles(costs),
    ...(sellAt ? { sales: { revenue: revenue / played, perEntry: sold.map((n) => n / played) } } : {}),
    movesPerCraft: Object.fromEntries([...moveCount].map(([k, n]) => [k, n / played])),
    spendByMove: [...spendBy.values()].map((e) => ({ action: e.action, count: e.count / played, spent: e.spent / played })),
  };
}

/** The 0th to 100th percentile of `xs`, nearest-rank — 101 values, however many crafts were played. */
export function percentiles(xs: readonly number[]): number[] {
  const sorted = [...xs].sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  return Array.from({ length: 101 }, (_, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]!);
}
