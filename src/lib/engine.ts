// Browser facade over the pure TS crafting engine + optimizer. This is the client-side replacement
// for the Java HTTP backend: it loads the patch data snapshot once (fetched as static assets so the
// 3.1 MB mods.json never lands in the JS bundle) and exposes a small, UI-shaped API — list bases,
// list a base's rollable mods with their tiers, and compute the (cost ↔ probability) Pareto frontier
// for a tier-targeted craft.
//
// The UI-shaped types live in ./engineTypes.ts and the presentation/mapping helpers in ./engineMap.ts;
// this file is the thin public API (data loading + the list/compute/currency calls the UI imports).

import { indexPatch } from '../../packages/engine/src/indexPatch.ts';
import { resolveMod } from '../../packages/engine/src/pool.ts';
import type { PatchData } from '../../packages/engine/src/types.ts';
import {
  annulProbability, augmentationProbability, chaosProbability, exaltProbability, regalProbability,
} from '../../packages/engine/src/probability.ts';
// Whether a Desecration on this base can be boss-targeted ("Weapon or Jewellery" only). Re-exported
// because the UI has to DESCRIBE desecration differently on armour, not just cost it differently.
export { bossOmenAllowed } from '../../packages/engine/src/probability.ts';
import { indexPrices, type Prices } from '../../packages/optimizer/src/cost.ts';
import { optimizePareto, type OptimizeParetoOptions } from '../../packages/optimizer/src/optimize.ts';
import { optimizeFromItem } from '../../packages/optimizer/src/fromItem.ts';
import { markovFromItem, type MarkovOptions } from '../../packages/optimizer/src/markovFromItem.ts';
import {
  alternativesFromWhite, alternativesFromItem, type AlternativesOptions,
} from '../../packages/optimizer/src/alternatives.ts';
import type {
  EngineBase, EngineMod, EngineBaseMods, EnginePlan, EngineResult, TargetInput,
  ExistingItem, CurrencyAction, AltTargetInput, EngineAlternatives, EngineMarkovResult,
  EnginePriceBasis,
} from './engineTypes.ts';
import {
  prettyName, toEngineMod, toTierTargets, toAltTargets, buildItemState, addBlockedReason,
  mapFrontier, mapAlternatives, mapMarkov,
} from './engineMap.ts';

// Fetched as URLs (Vite copies them to /assets) rather than imported as modules, so the big JSON is
// lazily loaded and never inflates the main bundle or the TS type-checker.
// The app ships the 0.5.0 (poe2db) snapshot — cross-checked against Craft of Exile (docs/validation.md,
// "External cross-check, round 2"). The Java-extracted 0.5 data stays only as the engine-vs-Java
// differential anchor in the test suite; it is stale vs the live game for several bases.
import modsUrl from '../../data/patches/0.5.0/mods.json?url';
import basesUrl from '../../data/patches/0.5.0/base_items.json?url';
import pricesUrl from '../../data/patches/0.5.0/prices.json?url';

// Re-export the UI-shaped types so components keep importing them from '../../lib/engine'.
export { modFamilies } from './engineTypes.ts';
export type {
  EngineBase, EngineTier, EngineMod, EngineBaseMods, TargetInput, EngineStep, EnginePlan, EngineResult,
  ItemModInput, ExistingItem, CurrencyAction, AltTargetInput, EngineSlot, EngineAlternative, EngineAlternatives,
  EngineMarkovResult, EnginePolicyNode, EnginePolicyEdge, EnginePriceBasis,
} from './engineTypes.ts';

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

export interface Engine { data: PatchData; prices: Prices; }
let cache: Promise<Engine> | null = null;

/** Load and index the patch snapshot once; subsequent calls reuse the same promise. */
export function loadEngine(): Promise<Engine> {
  if (!cache) {
    cache = (async () => {
      // `mods.json` is 3.1 MB and its download would otherwise not START until this function runs —
      // after the JS bundle has been fetched and parsed. The build injects a tiny head script that
      // kicks the fetch off during HTML parse and leaves the Promise here (see `preloadPatchData` in
      // vite.config.ts). Reusing that exact Promise is what makes it one request rather than two.
      // Absent (dev, tests, and the worker, which has no `window`) this is just a normal fetch.
      const warm = (globalThis as { __patchPreload?: { mods?: Promise<Response | null> } }).__patchPreload;
      const modsRes = (await warm?.mods) ?? (await fetch(modsUrl));
      const [mods, bases, prices] = await Promise.all([
        modsRes.json(),
        fetch(basesUrl).then((r) => r.json()),
        fetch(pricesUrl).then((r) => r.json()),
      ]);
      return { data: indexPatch(mods, bases), prices: indexPrices(prices) };
    })();
  }
  return cache;
}

/** Where the loaded price sheet came from — see EnginePriceBasis. Kept tiny and UI-shaped so the
 *  cost views can caveat their own numbers without reaching into the optimizer's Prices type. */
export function priceBasis(eng: { prices: Prices }): EnginePriceBasis {
  const m = eng.prices.meta;
  return {
    estimated: m?.estimated ?? true, // absent provenance ⇒ assume estimated; never overclaim
    ...(m?.updated ?? m?.generated ? { asOf: m?.updated ?? m?.generated } : {}),
    ...(m?.patch ? { patch: m.patch } : {}),
    ...(m?.unit ? { unit: m.unit } : {}),
    ...(m?.caveat ? { caveat: m.caveat } : {}),
    // Read straight off the sheet rather than hardcoded: these move with the economy, and a stale
    // conversion would misreport every large cost while looking authoritative.
    // Optional-chained on purpose. `currency` is required by the type, but this accessor exists to
    // report honestly on whatever sheet it was handed, and rates are only a display nicety — blanking
    // the whole panel because one key is missing would be a wildly disproportionate failure.
    rates: {
      ...(eng.prices.currency?.chaos ? { chaos: eng.prices.currency.chaos } : {}),
      ...(eng.prices.currency?.divine ? { divine: eng.prices.currency.divine } : {}),
    },
  };
}

// ── Listing ───────────────────────────────────────────────────────────────────

/** All craftable bases, sorted by display name. */
export function listBases(data: PatchData): EngineBase[] {
  return [...data.bases.values()]
    .map((b): EngineBase => ({ id: b.id, name: prettyName(b.id), category: b.category }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
        id: mod.id, text: mod.text ?? mod.id, type, family: mod.family,
        ...(mod.families && mod.families.length > 1 ? { families: mod.families } : {}),
        source: 'perfect',
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
        id: mod.id, text: mod.text ?? mod.id, type, family: mod.family,
        ...(mod.families && mod.families.length > 1 ? { families: mod.families } : {}),
        source: 'desecrated',
        tiers: [{ display: 1, name: t.name, ilvl: t.ilvl, label: `desecrated · ilvl ${t.ilvl}${range ? ` · ${range}` : ''}`, range }],
      }];
    });
  return [...build(base.pools.desecrated.prefixes, 'prefix'), ...build(base.pools.desecrated.suffixes, 'suffix')]
    .sort((a, b) => a.text.localeCompare(b.text));
}

// ── Compute ───────────────────────────────────────────────────────────────────

/**
 * Compute the (expected cost ↔ success probability) Pareto frontier for a tier-targeted craft on
 * `baseId` at item level `level`. A target whose mod is essence-only is guaranteed by an essence at
 * its chosen level (its tier picks the essence level → real value/gate/price); at most one such mod
 * is allowed and the target must also include a rollable mod. Throws on an invalid target shape
 * (0 or >6 mods, >3 of a side, off-pool mod, two essences); the caller surfaces the message.
 */
export function optimize(
  eng: Engine, baseId: string, level: number, targets: readonly TargetInput[],
  opts: OptimizeParetoOptions = {},
): EngineResult {
  const { data, prices } = eng;
  const base = data.bases.get(baseId);
  if (!base) throw new Error(`Unknown base: ${baseId}`);
  const res = optimizePareto(data, prices, base, toTierTargets(data, targets), { ...opts, level });
  return mapFrontier(data, res);
}

/**
 * Plan the full sequence to turn an item you already hold (`item`, a Rare) into `targets` — the
 * (expected cost ↔ probability) frontier, using the reset-to-your-item cost model that keeps the good
 * mods you started with. Mods on the item but not in the target are removed; missing target mods are
 * added. Throws on a Magic item or an illegal target shape; the caller surfaces the message.
 */
export function optimizeItem(
  eng: Engine, item: ExistingItem, targets: readonly TargetInput[], opts: OptimizeParetoOptions = {},
): EngineResult {
  const { data, prices } = eng;
  const res = optimizeFromItem(data, prices, buildItemState(data, item), toTierTargets(data, targets), opts);
  return mapFrontier(data, res);
}

/**
 * The TRUE expected cost + optimal-policy graph for a from-item craft, from the MDP model (push-forward,
 * no restart — see markovFromItem). `applicable` is false for a REGULAR-essence target: those need a
 * Magic item and this model starts from the Rare you already hold, so the caller falls back to
 * `optimizeItem`'s frontier. Rollable, desecrated and perfect-essence targets all go through the MDP.
 */
export function optimizeItemMarkov(
  eng: Engine, item: ExistingItem, targets: readonly TargetInput[], opts: MarkovOptions = {},
): EngineMarkovResult {
  const { data, prices } = eng;
  const applicable = targets.every((t) => data.mods.get(t.modId)?.source !== 'essence');
  if (!applicable) {
    return {
      applicable: false, feasible: false, expectedCost: Infinity, converged: true, bound: 'exact',
      assumedOdds: false, nodes: [], edges: [],
      // Note this is NOT "craft it from white": the Lab's from-scratch craft reaches this too, and
      // telling someone already crafting from white to craft from white is the kind of confident
      // non-advice this project keeps having to take back out.
      reason: 'this model has no Essence action yet, so a craft that needs one has no true expected '
        + 'cost — the step-by-step routes below do cover essences',
    };
  }
  const res = markovFromItem(data, prices, buildItemState(data, item), toTierTargets(data, targets), opts);
  return mapMarkov(data, res);
}

// ── Existing-item currency actions (Option 1) ─────────────────────────────────
// "I already have this item — what does each currency do to it, and with what odds?" Every number here
// is the EXACT probability of a SINGLE use of that currency producing the outcome you asked for. It is
// deliberately NOT a total "how many orbs / how much cost" — for currencies that change the item on a
// miss (chaos rerolls, annul removes a random mod), the total depends on your retry strategy, which is
// the harder planner math. So we report the honest per-use odds and leave the budget to the full planner.

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
    currency: CurrencyAction['currency'], label: string, detail: string, prob: number, cost: number, reason?: string,
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

// ── Budget-constrained alternatives ──────────────────────────────────────────
// "I have 200ex — what's the closest thing to my item I can actually get for it?" Every row is a
// near-miss item plus the odds you FINISH it inside the budget (not an expected cost, which busts
// about half the time). Row 0 is always exactly what you asked for.

/**
 * Near-miss alternatives to a from-white craft, ranked closest-first, each with the odds you finish it
 * inside `budget` (exalt-equivalents). An alternative may slide a tier, swap one mod for a same-family
 * sibling, or drop one mod — at most one slot swapped-or-dropped. Pinned targets are never touched.
 */
export function alternatives(
  eng: Engine, baseId: string, level: number, targets: readonly AltTargetInput[], budget: number,
  opts: AlternativesOptions = {},
): EngineAlternatives {
  const { data, prices } = eng;
  const base = data.bases.get(baseId);
  if (!base) throw new Error(`Unknown base: ${baseId}`);
  return mapAlternatives(data, alternativesFromWhite(data, prices, base, toAltTargets(data, targets), budget, { ...opts, level }));
}

/**
 * Near-miss alternatives for transforming an item you already hold — same relaxations, costed with the
 * reset-to-your-item model. A fractured mod on the item is inherently pinned (it's locked there).
 */
export function alternativesForItem(
  eng: Engine, item: ExistingItem, targets: readonly AltTargetInput[], budget: number,
  opts: AlternativesOptions = {},
): EngineAlternatives {
  const { data, prices } = eng;
  const start = buildItemState(data, item);
  return mapAlternatives(data, alternativesFromItem(data, prices, start, toAltTargets(data, targets), budget, opts));
}
