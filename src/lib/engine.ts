// Browser facade over the pure TS crafting engine + optimizer. This is the client-side replacement
// for the Java HTTP backend: it loads the patch data snapshot once (fetched as static assets so the
// 1.1 MB mods.json never lands in the JS bundle) and exposes a small, UI-shaped API — list bases,
// list a base's rollable mods with their tiers, and compute the (cost ↔ probability) Pareto frontier
// for a tier-targeted craft.

import { indexPatch } from '../../packages/engine/src/indexPatch.ts';
import { resolveMod, familyAvailable } from '../../packages/engine/src/pool.ts';
import type { PatchData, ItemBase, ItemState, PlacedMod, CurrencyTier, Mod } from '../../packages/engine/src/types.ts';
import type { PlanStep } from '../../packages/engine/src/plan.ts';
import {
  annulProbability, augmentationProbability, chaosProbability, exaltProbability, regalProbability,
} from '../../packages/engine/src/probability.ts';
import { indexPrices, type Prices } from '../../packages/optimizer/src/cost.ts';
import { optimizePareto } from '../../packages/optimizer/src/optimize.ts';
import { optimizeFromItem } from '../../packages/optimizer/src/fromItem.ts';
import type { TierTarget, CurrencyDepth, ParetoResult } from '../../packages/optimizer/src/optimize.ts';
import { alternativesFromWhite, alternativesFromItem } from '../../packages/optimizer/src/alternatives.ts';
import type { Alternative, AlternativeTarget, AlternativesResult, SlotChange } from '../../packages/optimizer/src/alternatives.ts';

// Fetched as URLs (Vite copies them to /assets) rather than imported as modules, so the big JSON is
// lazily loaded and never inflates the main bundle or the TS type-checker.
// The app ships the 0.5.0 (poe2db) snapshot — cross-checked against Craft of Exile (docs/validation.md,
// "External cross-check, round 2"). The Java-extracted 0.5 data stays only as the engine-vs-Java
// differential anchor in the test suite; it is stale vs the live game for several bases.
import modsUrl from '../../data/patches/0.5.0/mods.json?url';
import basesUrl from '../../data/patches/0.5.0/base_items.json?url';
import pricesUrl from '../../data/patches/0.5.0/prices.json?url';

// ── UI-shaped types ─────────────────────────────────────────────────────────

export interface EngineBase {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}

/** One selectable tier of a mod, presented best-first (`display` 1 = T1 = best). */
export interface EngineTier {
  /** 1-based, 1 = best (T1). Equal to `tierCount` for the worst tier (⇒ "any tier"). */
  readonly display: number;
  readonly name: string;
  readonly ilvl: number;
  readonly label: string;
  /** The roll range as "min–max" (e.g. "165–179"), or "" for a value-less mod. */
  readonly range: string;
}

export interface EngineMod {
  readonly id: string;
  readonly text: string;
  readonly type: 'prefix' | 'suffix';
  /** Family-exclusion group — an item may hold at most one mod per family. */
  readonly family: string;
  /** 'normal' = rollable with currency; 'essence' = obtainable only by a regular essence (tiers = levels);
   * 'perfect' = a perfect-essence mod (added on a Rare by a Perfect Essence, which removes one random mod);
   * 'desecrated' = a desecrated ("carved by the Abyss") mod — occupies a slot/family and is the sole
   * target an Omen of Light annul can remove for certain. */
  readonly source: 'normal' | 'essence' | 'perfect' | 'desecrated';
  /** Tiers best-first (T1 … Tn); for essence mods these are the Greater→Lesser essence levels. */
  readonly tiers: readonly EngineTier[];
}

export interface EngineBaseMods {
  readonly prefixes: readonly EngineMod[];
  readonly suffixes: readonly EngineMod[];
}

/** A desired mod for the optimizer: which mod, and what tier (1-based from best). For an essence-only
 * mod the tier is the essence level (Greater = best); essence-ness is inherent to the mod, not a flag. */
export interface TargetInput {
  readonly modId: string;
  /** 1-based from best; `tierCount` = worst = "any tier". */
  readonly tierDisplay: number;
}

export interface EngineStep {
  readonly n: number;
  readonly currency: PlanStep['currency'];
  readonly orb?: CurrencyTier;
  readonly label: string;
  readonly target: string;
  readonly prob: number;
}

export interface EnginePlan {
  readonly probability: number;
  readonly expected: number;
  readonly perAttempt: number;
  readonly expectedAttempts: number;
  readonly steps: readonly EngineStep[];
}

export interface EngineResult {
  readonly frontier: readonly EnginePlan[];
  readonly plansEvaluated: number;
  readonly currencyDepth: CurrencyDepth;
}

/** Beyond this many expected attempts, a "cheap" plan is really an impractical grind (tune to taste). */
export const MAX_PRACTICAL_ATTEMPTS = 40;

/**
 * The "recommended / best value" plan on a cost↔probability frontier. The frontier runs cheapest
 * (lowest expected cost, but often a sub-1% grind of thousands of attempts) → surest (highest per-attempt
 * success, fewest clicks, but priciest). "Best value" = the **cheapest plan you'd actually want to
 * execute** — the least expected cost among plans that succeed within a practical number of attempts
 * (`MAX_PRACTICAL_ATTEMPTS`). Because the frontier ascends in both cost and probability, expected
 * attempts descend along it, so the first plan clearing the bar is that cheapest-practical one. If even
 * the surest plan can't clear the bar (a genuinely hard craft), recommend the surest. Returns -1 if empty.
 */
export function recommendedIndex(frontier: readonly EnginePlan[]): number {
  const n = frontier.length;
  if (n === 0) return -1;
  const idx = frontier.findIndex((p) => p.expectedAttempts <= MAX_PRACTICAL_ATTEMPTS);
  return idx >= 0 ? idx : n - 1;
}

// ── Data loading (memoized) ──────────────────────────────────────────────────

interface Engine { data: PatchData; prices: Prices; }
let cache: Promise<Engine> | null = null;

/** Load and index the patch snapshot once; subsequent calls reuse the same promise. */
export function loadEngine(): Promise<Engine> {
  if (!cache) {
    cache = (async () => {
      const [mods, bases, prices] = await Promise.all([
        fetch(modsUrl).then((r) => r.json()),
        fetch(basesUrl).then((r) => r.json()),
        fetch(pricesUrl).then((r) => r.json()),
      ]);
      return { data: indexPatch(mods, bases), prices: indexPrices(prices) };
    })();
  }
  return cache;
}

// ── Presentation helpers ─────────────────────────────────────────────────────

function prettyName(id: string): string {
  return id.replace(/_/g, ' ');
}

const ORB_SUFFIX: Record<CurrencyTier, string> = { base: '', greater: ' (Greater)', perfect: ' (Perfect)' };
/** Desecration boss omen → its in-game name (Blackblooded=Kurgal, Liege=Amanamu, Sovereign=Ulaman). */
const BOSS_LABEL: Record<'blackblooded' | 'liege' | 'sovereign', string> = {
  blackblooded: 'Blackblooded', liege: 'Liege', sovereign: 'Sovereign',
};
const CURRENCY_LABEL: Record<PlanStep['currency'], string> = {
  transmute: 'Transmutation', augment: 'Augmentation', regal: 'Regal', exalt: 'Exalted',
  alchemy: 'Alchemy', chaos: 'Chaos', annul: 'Annulment', desecrate: 'Desecration', essence: 'Essence', 'perfect-essence': 'Perfect Essence',
};

function tierLabel(display: number, tierCount: number, name: string, ilvl: number, range: string): string {
  const head = display === tierCount ? `T${display} · any` : `T${display}`;
  return `${head} · ${name} · ilvl ${ilvl}${range}`;
}

/** Essence mods label their tiers by essence level (the tier name already says "Greater Essence of …"). */
function essenceTierLabel(name: string, ilvl: number, range: string): string {
  return `${name} · ilvl ${ilvl}${range}`;
}

/** All craftable bases, sorted by display name. */
export function listBases(data: PatchData): EngineBase[] {
  return [...data.bases.values()]
    .map((b: ItemBase): EngineBase => ({ id: b.id, name: prettyName(b.id), category: b.category }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toEngineMod(data: PatchData, modId: string, type: 'prefix' | 'suffix'): EngineMod | null {
  const mod = data.mods.get(modId);
  if (!mod || mod.tiers.length === 0) return null;
  // Only rollable (normal) or regular-essence mods are craftable from white here. The essence pool
  // also holds perfect-essence-only mods (source 'perfect_essence') — those need the remove-and-add-
  // on-rare flow this optimizer doesn't model yet, so they aren't offered as targets.
  if (mod.source !== 'normal' && mod.source !== 'essence') return null;
  const isEssence = mod.source === 'essence';
  const n = mod.tiers.length;
  // Present best-first: engine tiers ascend by ilvl (index 0 = worst), so reverse for display.
  const tiers: EngineTier[] = mod.tiers
    .map((t, engineIndex) => {
      const display = n - engineIndex; // engineIndex n-1 (best) → display 1
      const r = t.ranges[0];
      const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
      const suffix = range ? ` · ${range}` : '';
      const label = isEssence ? essenceTierLabel(t.name, t.ilvl, suffix) : tierLabel(display, n, t.name, t.ilvl, suffix);
      return { display, name: t.name, ilvl: t.ilvl, label, range };
    })
    .sort((a, b) => a.display - b.display);
  return { id: mod.id, text: mod.text ?? mod.id, type, family: mod.family, source: isEssence ? 'essence' : 'normal', tiers };
}

/**
 * The prefixes and suffixes a base can carry, each with its tiers (best-first): the rollable normal
 * pool plus the essence-only mods (obtainable only via an essence, their tiers being essence levels).
 */
export function listMods(data: PatchData, baseId: string): EngineBaseMods {
  const base = data.bases.get(baseId);
  if (!base) return { prefixes: [], suffixes: [] };
  const map = (ids: readonly string[], type: 'prefix' | 'suffix'): EngineMod[] =>
    ids.map((id) => toEngineMod(data, id, type)).filter((m): m is EngineMod => m !== null);
  const byText = (a: EngineMod, b: EngineMod) => a.text.localeCompare(b.text);
  return {
    prefixes: [...map(base.pools.normal.prefixes, 'prefix'), ...map(base.pools.essence.prefixes, 'prefix')].sort(byText),
    suffixes: [...map(base.pools.normal.suffixes, 'suffix'), ...map(base.pools.essence.suffixes, 'suffix')].sort(byText),
  };
}

/**
 * The perfect-essence mods a base can carry (from its essence pool, source 'perfect_essence'). These are
 * NOT from-white targets — a Perfect Essence adds its guaranteed mod on a Rare while removing one random
 * mod — so they're offered only in the from-item flow. Single "tier" (the perfect level), best-first.
 */
export function listPerfectEssences(data: PatchData, baseId: string): EngineMod[] {
  const base = data.bases.get(baseId);
  if (!base) return [];
  const build = (ids: readonly string[], type: 'prefix' | 'suffix'): EngineMod[] =>
    ids.flatMap((id): EngineMod[] => {
      const mod = data.mods.get(id);
      if (!mod || mod.source !== 'perfect_essence' || mod.tiers.length === 0) return [];
      const t = mod.tiers[0]!;
      const r = t.ranges[0];
      const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
      return [{
        id: mod.id, text: mod.text ?? mod.id, type, family: mod.family, source: 'perfect',
        tiers: [{ display: 1, name: t.name, ilvl: t.ilvl, label: `${t.name} · ilvl ${t.ilvl}${range ? ` · ${range}` : ''}`, range }],
      }];
    });
  return [...build(base.pools.essence.prefixes, 'prefix'), ...build(base.pools.essence.suffixes, 'suffix')]
    .sort((a, b) => a.text.localeCompare(b.text));
}

/**
 * The desecrated mods a base can carry (its desecrated pool). These are NOT crafted-from-white here —
 * a desecrated mod is added by the Desecration currency on a Rare — so they're offered only so you can
 * MODEL an item that already carries one: it occupies a slot + family (shifting every other currency's
 * odds) and is the only mod an Omen of Light annul removes for certain. Single "tier", best-first.
 */
export function listDesecrated(data: PatchData, baseId: string): EngineMod[] {
  const base = data.bases.get(baseId);
  if (!base) return [];
  const build = (ids: readonly string[], type: 'prefix' | 'suffix'): EngineMod[] =>
    ids.flatMap((id): EngineMod[] => {
      const mod = data.mods.get(id);
      if (!mod || mod.source !== 'desecrated' || mod.tiers.length === 0) return [];
      const t = mod.tiers[0]!;
      const r = t.ranges[0];
      const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
      return [{
        id: mod.id, text: mod.text ?? mod.id, type, family: mod.family, source: 'desecrated',
        tiers: [{ display: 1, name: t.name, ilvl: t.ilvl, label: `desecrated · ilvl ${t.ilvl}${range ? ` · ${range}` : ''}`, range }],
      }];
    });
  return [...build(base.pools.desecrated.prefixes, 'prefix'), ...build(base.pools.desecrated.suffixes, 'suffix')]
    .sort((a, b) => a.text.localeCompare(b.text));
}

// ── The optimize call ────────────────────────────────────────────────────────

/**
 * Compute the (expected cost ↔ success probability) Pareto frontier for a tier-targeted craft on
 * `baseId` at item level `level`. A target whose mod is essence-only is guaranteed by an essence at
 * its chosen level (its tier picks the essence level → real value/gate/price); at most one such mod
 * is allowed and the target must also include a rollable mod. Throws on an invalid target shape
 * (0 or >6 mods, >3 of a side, off-pool mod, two essences); the caller surfaces the message.
 */
export function optimize(
  eng: Engine, baseId: string, level: number, targets: readonly TargetInput[],
): EngineResult {
  const { data, prices } = eng;
  const base = data.bases.get(baseId);
  if (!base) throw new Error(`Unknown base: ${baseId}`);
  const res = optimizePareto(data, prices, base, toTierTargets(data, targets), { level });
  return mapFrontier(data, res);
}

/** UI tier display (1 = best) → engine TierTarget minTierIndex (worst acceptable tier; display n ⇒ any). */
function toTierTargets(data: PatchData, targets: readonly TargetInput[]): TierTarget[] {
  return targets.map((t) => {
    const n = resolveMod(data, t.modId).tiers.length;
    // For an essence mod the tiers are its levels, so this picks the exact Lesser/Normal/Greater level.
    return { modId: t.modId, minTierIndex: Math.max(0, Math.min(n - 1, n - t.tierDisplay)) };
  });
}

/** Map an optimizer ParetoResult into the UI-shaped EngineResult (shared by from-white and from-item). */
function mapFrontier(data: PatchData, res: ParetoResult): EngineResult {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  const frontier: EnginePlan[] = res.frontier.map((plan) => ({
    probability: plan.probability,
    expected: plan.cost.expected,
    perAttempt: plan.cost.perAttempt,
    expectedAttempts: plan.cost.expectedAttempts,
    steps: plan.steps.map((step, i): EngineStep => {
      const sr = plan.result.steps[i]!;
      const orb = 'tier' in step ? step.tier : undefined;
      const essenceLevel = step.currency === 'essence' ? step.essenceLevel : undefined;
      // A side-constrained exalt/chaos uses an Exaltation omen (Sinistral = prefix, Dextral = suffix);
      // a perfect-essence step can carry a Sinistral/Dextral Crystallisation omen (constrains the removal).
      const constrainTo = (step.currency === 'exalt' || step.currency === 'chaos') ? step.constrainTo : undefined;
      const peOmen = step.currency === 'perfect-essence' ? step.omen : undefined;
      // A desecration is constrained to its boss (the omen that targets the desecrated mod).
      const boss = step.currency === 'desecrate' ? step.boss : undefined;
      const omen = constrainTo ? (constrainTo === 'prefix' ? ' + Sinistral' : ' + Dextral')
        : peOmen ? (peOmen === 'sinistral' ? ' + Sinistral' : ' + Dextral')
        : boss ? ` + Omen of the ${BOSS_LABEL[boss]}` : '';
      const label = CURRENCY_LABEL[step.currency]
        + (orb ? ORB_SUFFIX[orb] : '')
        + (essenceLevel && essenceLevel !== 'normal' ? ` (${essenceLevel})` : '')
        + omen;
      // Each step names what it acts on: alchemy supplies 4 mods, chaos swaps one for another, annul
      // removes one, everything else adds one.
      const target = step.currency === 'alchemy' ? step.adds.map(text).join(' + ')
        : step.currency === 'chaos' ? `−${text(step.remove)}  +${text(step.add)}`
        : step.currency === 'perfect-essence' ? `+${text(step.add)}  −${text(step.remove)} (random)`
        : step.currency === 'annul' ? `removes ${text(step.remove)}`
        : text(sr.target);
      return { n: i + 1, currency: step.currency, orb, label, target, prob: sr.prob };
    }),
  }));
  return { frontier, plansEvaluated: res.plansEvaluated, currencyDepth: res.currencyDepth };
}

// ── Existing-item currency actions (Option 1) ─────────────────────────────────
// "I already have this item — what does each currency do to it, and with what odds?" Every number here
// is the EXACT probability of a SINGLE use of that currency producing the outcome you asked for. It is
// deliberately NOT a total "how many orbs / how much cost" — for currencies that change the item on a
// miss (chaos rerolls, annul removes a random mod), the total depends on your retry strategy, which is
// the harder planner math. So we report the honest per-use odds and leave the budget to the full planner.

/** A modifier currently sitting on an item the user already holds. */
export interface ItemModInput {
  readonly modId: string;
  /** 1-based from best (matches the picker); only affects which tier ilvl is recorded. */
  readonly tierDisplay: number;
  /** Fractured ("carved"): locked on the item — never removed, and out of the random-removal pool. */
  readonly fractured?: boolean;
}

/** An item the user already owns: a magic or rare base carrying these prefixes/suffixes. */
export interface ExistingItem {
  readonly baseId: string;
  readonly level: number;
  readonly rarity: 'magic' | 'rare';
  readonly prefixes: readonly ItemModInput[];
  readonly suffixes: readonly ItemModInput[];
}

/** One currency's outcome on the current item: the exact per-use probability, plus feasibility. */
export interface CurrencyAction {
  readonly currency: PlanStep['currency'];
  readonly label: string;
  /** Human description of the outcome, e.g. "removes X, adds Y" or "adds Y to an open suffix". */
  readonly detail: string;
  /** Exact probability that ONE use produces this outcome (0 if the action can't apply here). */
  readonly prob: number;
  /** Price of a single orb, in exalt-equivalents (informational — not a total budget). */
  readonly cost: number;
  readonly feasible: boolean;
  /** Why the action can't apply (only when infeasible). */
  readonly reason?: string;
}

/** Turn a UI item description into the engine's ItemState (looks up mods, records their tier ilvl). */
function buildItemState(data: PatchData, item: ExistingItem): ItemState {
  const base = data.bases.get(item.baseId);
  if (!base) throw new Error(`Unknown base: ${item.baseId}`);
  const place = (inputs: readonly ItemModInput[]): PlacedMod[] =>
    inputs.map((m) => {
      const mod = resolveMod(data, m.modId);
      const n = mod.tiers.length;
      const idx = Math.max(0, Math.min(n - 1, n - m.tierDisplay)); // display 1 = best = last engine index
      const tierName = (mod.tiers[idx] ?? mod.tiers[0])?.name ?? '';
      return m.fractured ? { modId: m.modId, tierName, fractured: true } : { modId: m.modId, tierName };
    });
  const prefixes = place(item.prefixes);
  const suffixes = place(item.suffixes);
  // The desecrated flag gates the Omen of Light annul, so set it whenever a desecrated mod is on the item.
  const desecrated = [...prefixes, ...suffixes].some((m) => data.mods.get(m.modId)?.source === 'desecrated');
  const state = { base, level: item.level, rarity: item.rarity, prefixes, suffixes };
  return desecrated ? { ...state, desecrated: true } : state;
}

/** Why an add of `mod` onto `state` is impossible (side full / family taken / off-pool). */
function addBlockedReason(data: PatchData, state: ItemState, mod: Mod): string {
  const onSide = mod.type === 'prefix' ? state.prefixes.length : state.suffixes.length;
  const cap = state.rarity === 'magic' ? 1 : 3;
  if (onSide >= cap) return `the ${mod.type} side is full`;
  if (!familyAvailable(data, state, mod)) return `its “${mod.family}” family is already on the item`;
  return 'it can’t roll on this base';
}

/**
 * What each currency can do to an item you already hold. `addModId` = a mod you want ONTO the item;
 * `removeModId` = a mod currently on it you'd sacrifice. Returns the applicable currencies with their
 * exact per-use probability and feasibility:
 *   • Rare + add → **Exalted** (fill an open slot); + a removeModId → **Chaos** (swap it out for the add).
 *   • Magic + add → **Augmentation** (fill the open slot) and **Regal** (upgrade to Rare adding it).
 *   • removeModId alone → **Annulment** (remove one random mod — odds it's the one you named).
 */
export function currencyActions(
  eng: Engine, item: ExistingItem, sel: { addModId?: string; removeModId?: string },
): CurrencyAction[] {
  const { data, prices } = eng;
  const state = buildItemState(data, item);
  const actions: CurrencyAction[] = [];
  const price = (k: string): number => prices.currency[k] ?? 0;
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  const push = (
    currency: PlanStep['currency'], label: string, detail: string, prob: number, cost: number, reason?: string,
  ): void => {
    actions.push(reason ? { currency, label, detail, prob, cost, feasible: prob > 0, reason }
      : { currency, label, detail, prob, cost, feasible: prob > 0 });
  };

  const { addModId, removeModId } = sel;
  if (addModId) {
    const add = resolveMod(data, addModId);
    const reason = (): string => addBlockedReason(data, state, add);
    if (state.rarity === 'rare') {
      const p = exaltProbability(data, state, addModId);
      push('exalt', 'Exalted Orb', `adds ${text(addModId)} to an open ${add.type}`, p, price('exalt'), p > 0 ? undefined : reason());
      if (removeModId) {
        const c = chaosProbability(data, state, removeModId, addModId);
        const onItem = state.prefixes.concat(state.suffixes).some((m) => m.modId === removeModId);
        push('chaos', 'Chaos Orb', `removes ${text(removeModId)}, adds ${text(addModId)}`, c, price('chaos'),
          c > 0 ? undefined : (!onItem ? `${text(removeModId)} isn’t on the item` : `can’t add ${text(addModId)} even after the swap`));
      }
    }
    if (state.rarity === 'magic') {
      const a = augmentationProbability(data, state, addModId);
      push('augment', 'Orb of Augmentation', `adds ${text(addModId)} to the open ${add.type}`, a, price('augment'), a > 0 ? undefined : reason());
      const rg = regalProbability(data, state, addModId);
      push('regal', 'Regal Orb', `upgrades to Rare, adds ${text(addModId)}`, rg, price('regal'), rg > 0 ? undefined : reason());
    }
  }
  if (removeModId) {
    const p = annulProbability(data, state, removeModId);
    const onItem = state.prefixes.concat(state.suffixes).some((m) => m.modId === removeModId);
    push('annul', 'Orb of Annulment', `removes one random mod — odds it’s ${text(removeModId)}`, p, price('annul'),
      p > 0 ? undefined : (onItem ? undefined : `${text(removeModId)} isn’t on the item`));
    // Omen of Light makes the Annulment remove the DESECRATED mod for certain (P=1) — the targeted-
    // removal lever. Only meaningful when the sacrifice is itself a desecrated mod on a desecrated item.
    if (onItem && data.mods.get(removeModId)?.source === 'desecrated' && state.desecrated) {
      const lp = annulProbability(data, state, removeModId, { omen: 'light' });
      push('annul', 'Orb of Annulment + Omen of Light', `removes the desecrated ${text(removeModId)} for certain`,
        lp, price('annul') + (prices.omens['OmenofLight'] ?? 0));
    }
  }
  return actions;
}

/**
 * Plan the full sequence to turn an item you already hold (`item`, a Rare) into `targets` — the
 * (expected cost ↔ probability) frontier, using the reset-to-your-item cost model that keeps the good
 * mods you started with. Mods on the item but not in the target are removed; missing target mods are
 * added. Throws on a Magic item or an illegal target shape; the caller surfaces the message.
 */
export function optimizeItem(eng: Engine, item: ExistingItem, targets: readonly TargetInput[]): EngineResult {
  const { data, prices } = eng;
  const res = optimizeFromItem(data, prices, buildItemState(data, item), toTierTargets(data, targets));
  return mapFrontier(data, res);
}

// ── Budget-constrained alternatives ──────────────────────────────────────────
// "I have 200ex — what's the closest thing to my item I can actually get for it?" Every row is a
// near-miss item plus the odds you FINISH it inside the budget (not an expected cost, which busts
// about half the time). Row 0 is always exactly what you asked for.

/** A desired mod for the alternatives search: pinned mods are never relaxed, swapped or dropped. */
export interface AltTargetInput extends TargetInput {
  readonly pinned?: boolean;
}

/** What became of one desired slot in an alternative (slot order matches your target). */
export interface EngineSlot {
  readonly kind: 'kept' | 'swapped' | 'dropped';
  /** The mod you'd end up with (for a drop, the mod you'd lose). */
  readonly text: string;
  /** What you originally asked for — set only when this slot changed. */
  readonly fromText?: string;
  /** 1-based from best; absent for a dropped slot. */
  readonly tierDisplay?: number;
  /** Compact tier label, e.g. "T2 · 125–149" or "T8 · any". */
  readonly tierLabel?: string;
}

export interface EngineAlternative {
  readonly slots: readonly EngineSlot[];
  /** True for the row that is exactly your target — no relaxation at all. */
  readonly isTarget: boolean;
  readonly dropped: number;
  readonly swapped: number;
  /** Mean fraction of the asked-for stat value still guaranteed, [0,1]. */
  readonly valueRetained: number;
  /** P(you finish inside the budget), conservative. Exact unless `exact` is false. */
  readonly inBudget: number;
  /** Upper bound — the true chance is in [inBudget, inBudgetMax]. */
  readonly inBudgetMax: number;
  /** False when the prices weren't commensurable, so the odds are a bracket, not a point. */
  readonly exact: boolean;
  /** The best way to spend the budget on THIS item. */
  readonly plan: EnginePlan;
}

export interface EngineAlternatives {
  /** Closest-first; the odds strictly rise down the list. */
  readonly rows: readonly EngineAlternative[];
  readonly nodesEvaluated: number;
  /** The node cap stopped the search early — farther alternatives may be missing. */
  readonly truncated: boolean;
  readonly currencyDepth: CurrencyDepth;
}

function toAltTargets(data: PatchData, targets: readonly AltTargetInput[]): AlternativeTarget[] {
  return targets.map((t) => {
    const n = resolveMod(data, t.modId).tiers.length;
    const minTierIndex = Math.max(0, Math.min(n - 1, n - t.tierDisplay));
    return t.pinned ? { modId: t.modId, minTierIndex, pinned: true } : { modId: t.modId, minTierIndex };
  });
}

/** Engine slot → UI slot: turns minTierIndex back into a 1-based display tier and a compact label. */
function toEngineSlot(data: PatchData, slot: SlotChange): EngineSlot {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  if (slot.kind === 'dropped') return { kind: 'dropped', text: text(slot.from), fromText: text(slot.from) };
  const mod = resolveMod(data, slot.modId);
  const n = mod.tiers.length;
  const display = n - slot.minTierIndex;
  const r = mod.tiers[slot.minTierIndex]?.ranges[0];
  const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
  const tierLabel = `T${display}${display === n ? ' · any' : ''}${range ? ` · ${range}` : ''}`;
  const kept = { kind: slot.kind, text: text(slot.modId), tierDisplay: display, tierLabel };
  // Only a CHANGED slot carries "what you asked for"; a kept slot's own text already says it.
  return slot.kind === 'swapped' ? { ...kept, fromText: text(slot.from) } : kept;
}

function mapAlternatives(data: PatchData, res: AlternativesResult): EngineAlternatives {
  const rows = res.frontier.map((a: Alternative): EngineAlternative => {
    const { dropped, swapped, valueRetained } = a.closeness;
    return {
      slots: a.slots.map((s) => toEngineSlot(data, s)),
      isTarget: dropped === 0 && swapped === 0 && valueRetained >= 1 - 1e-9,
      dropped, swapped, valueRetained,
      inBudget: a.inBudget,
      inBudgetMax: a.inBudgetMax,
      exact: a.inBudgetMax - a.inBudget < 1e-9,
      plan: mapFrontier(data, { frontier: [a.plan], plansEvaluated: 1, currencyDepth: res.currencyDepth }).frontier[0]!,
    };
  });
  return { rows, nodesEvaluated: res.nodesEvaluated, truncated: res.truncated, currencyDepth: res.currencyDepth };
}

/**
 * Near-miss alternatives to a from-white craft, ranked closest-first, each with the odds you finish it
 * inside `budget` (exalt-equivalents). An alternative may slide a tier, swap one mod for a same-family
 * sibling, or drop one mod — at most one slot swapped-or-dropped. Pinned targets are never touched.
 */
export function alternatives(
  eng: Engine, baseId: string, level: number, targets: readonly AltTargetInput[], budget: number,
): EngineAlternatives {
  const { data, prices } = eng;
  const base = data.bases.get(baseId);
  if (!base) throw new Error(`Unknown base: ${baseId}`);
  return mapAlternatives(data, alternativesFromWhite(data, prices, base, toAltTargets(data, targets), budget, { level }));
}

/**
 * Near-miss alternatives for transforming an item you already hold — same relaxations, costed with the
 * reset-to-your-item model. A fractured mod on the item is inherently pinned (it's locked there).
 */
export function alternativesForItem(
  eng: Engine, item: ExistingItem, targets: readonly AltTargetInput[], budget: number,
): EngineAlternatives {
  const { data, prices } = eng;
  const start = buildItemState(data, item);
  return mapAlternatives(data, alternativesFromItem(data, prices, start, toAltTargets(data, targets), budget));
}
