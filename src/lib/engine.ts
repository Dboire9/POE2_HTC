// Browser facade over the pure TS crafting engine + optimizer. This is the client-side replacement
// for the Java HTTP backend: it loads the patch data snapshot once (fetched as static assets so the
// mods data never lands in the JS bundle) and exposes a small, UI-shaped API — list bases,
// list a base's rollable mods with their tiers, and compute the (cost ↔ probability) Pareto frontier
// for a tier-targeted craft.
//
// The UI-shaped types live in ./engineTypes.ts and the presentation/mapping helpers in ./engineMap.ts;
// this file is the thin public API (data loading + the list/compute/currency calls the UI imports).

import { indexPatch, type BasesFile, type ModsFile } from '../../packages/engine/src/indexPatch.ts';
import { resolveMod } from '../../packages/engine/src/pool.ts';
import type { ItemState, Mod, PatchData } from '../../packages/engine/src/types.ts';
import {
  annulProbability, augmentationProbability, bossOmenAllowed, chaosProbability,
  desecrationBossAnySideProbability, desecrationOffered, desecrationOmenForMod, desecrationProbability,
  exaltProbability, regalProbability,
} from '../../packages/engine/src/probability.ts';
// Whether a Desecration on this base can be boss-targeted ("Weapon or Jewellery" only). Re-exported
// because the UI has to DESCRIBE desecration differently on armour, not just cost it differently.
export { bossOmenAllowed };
import {
  cheapestEssenceLevel, currencyKey, essenceLevelOf, indexPrices, pricesForBase, stepCost,
  type PricedStep, type Prices, type PricesFile,
} from '../../packages/optimizer/src/cost.ts';
import { atStrength } from '../../packages/optimizer/src/levers.ts';
import { stepProbability, type PlanStep } from '../../packages/engine/src/plan.ts';
import { optimizePareto, type OptimizeParetoOptions } from '../../packages/optimizer/src/optimize.ts';
import { optimizeFromItem } from '../../packages/optimizer/src/fromItem.ts';
import { markovFromItem, type MarkovOptions } from '../../packages/optimizer/src/markovFromItem.ts';
import {
  alternativesFromWhite, alternativesFromItem, type AlternativesOptions,
} from '../../packages/optimizer/src/alternatives.ts';
import type {
  EngineBase, EngineMod, EngineBaseMods, EngineResult, TargetInput,
  ExistingItem, CurrencyAction, AltTargetInput, EngineAlternatives, EngineMarkovResult,
  EnginePriceBasis,
} from './engineTypes.ts';
import {
  prettyName, toEngineMod, toTierTargets, toAltTargets, buildItemState, addBlockedReason,
  bossOmenLabel, mapFrontier, mapAlternatives, mapMarkov,
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

// ── Data loading (memoized) ──────────────────────────────────────────────────

export interface Engine { data: PatchData; prices: Prices; }
let cache: Promise<Engine> | null = null;

/** Load and index the patch snapshot once; subsequent calls reuse the same promise. */
export function loadEngine(): Promise<Engine> {
  if (!cache) {
    cache = (async () => {
      // `mods.json` is the biggest asset the app fetches and its download would otherwise not START
      // until this function runs —
      // after the JS bundle has been fetched and parsed. The build injects a tiny head script that
      // kicks the fetch off during HTML parse and leaves the Promise here (see `preloadPatchData` in
      // vite.config.ts). Reusing that exact Promise is what makes it one request rather than two.
      // Absent (dev, tests, and the worker, which has no `window`) this is just a normal fetch.
      const warm = (globalThis as { __patchPreload?: { mods?: Promise<Response | null> } }).__patchPreload;
      const modsRes = (await warm?.mods) ?? (await fetch(modsUrl));
      // `Response.json()` is `any`, so without these the three files entered `indexPatch` /
      // `indexPrices` unchecked — the one place a data refresh could change a shape and nothing would
      // complain until a probability came out wrong. Named here, at the boundary they cross.
      const [mods, bases, prices] = await Promise.all([
        modsRes.json() as Promise<ModsFile>,
        fetch(basesUrl).then((r) => r.json() as Promise<BasesFile>),
        fetch(pricesUrl).then((r) => r.json() as Promise<PricesFile>),
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
 * no restart — see markovFromItem). Rollable, desecrated and BOTH essence grades go through it.
 *
 * There used to be a blanket `applicable: false` here for any regular-essence target, on the reasoning
 * that those need a Magic item while the model starts from the Rare you hold. Half of that was right:
 * the model now HAS an Essence action, and the Lab's from-white craft reaches Magic on its way up, so
 * the gate was refusing the case it works for. The genuinely unreachable case — a target needing a
 * regular Essence on an item that is already Rare — is refused inside `markovFromItem`, which can name
 * the mod and the rule instead of speaking for every essence craft at once.
 */
export function optimizeItemMarkov(
  eng: Engine, item: ExistingItem, targets: readonly TargetInput[], opts: MarkovOptions = {},
): EngineMarkovResult {
  const { data, prices } = eng;
  const res = markovFromItem(data, prices, buildItemState(data, item), toTierTargets(data, targets), opts);
  return mapMarkov(data, res);
}

// ── Existing-item currency actions (Option 1) ─────────────────────────────────
// "I already have this item — what does each currency do to it, and with what odds?" Every number here
// is the EXACT probability of a SINGLE use of that currency producing the outcome you asked for. It is
// deliberately NOT a total "how many orbs / how much cost" — for currencies that change the item on a
// miss (chaos rerolls, annul removes a random mod), the total depends on your retry strategy, which is
// the harder planner math. So we report the honest per-use odds and leave the budget to the full planner.

/** One row before it is priced — a step descriptor plus the words that go beside it. */
interface ActionRow {
  readonly step: PricedStep;
  readonly label: string;
  readonly detail: string;
  readonly prob: number;
  readonly reason?: string;
}

/**
 * The Desecration rows: a plain bone, and — for a carved mod — the bone plus its boss omen.
 *
 * Sits beside the Exalt because it answers the same question, and inside the caller's `rare` branch
 * because the bone's own text says so: "Desecrates a **Rare** Weapon or Quiver" / "…a **Rare** Armour".
 *
 * Two rules belong to SPENDING a bone rather than to the draw, and `desecrationProbability` — a
 * per-draw primitive — enforces neither:
 *
 *   1. **The bone offers three modifiers and you keep one.** Worth ~3x, applied by every caller that
 *      spends one (`plan.ts`'s desecrate step, the MDP's desecrate actions) via `desecrationOffered`.
 *   2. **An item holds at most one desecrated mod**, so a bone is refused outright while a carved mod
 *      is still on it — the `hasDesecrated` gate in `markovActions`.
 *
 * Quoting the raw per-draw number would advertise odds no route ever charges, which is the one thing
 * this panel must never do. The boss omens are separate rows because they are a different draw (1/N
 * over one boss's carved pool, not a weighted draw over normal ∪ desecrated), and their text is "your
 * next **Weapon or Jewellery** Desecration attempt" — so on armour they are impossible, said out loud
 * rather than left as a missing row, because that gap is the most confusing part of the mechanic.
 */
function desecrationRows(data: PatchData, state: ItemState, add: Mod): ActionRow[] {
  const rows: ActionRow[] = [];
  const carried = state.desecrated === true;
  const held = carried ? 'the item already holds a desecrated mod — remove it first' : null;
  const why = (): string => held ?? addBlockedReason(data, state, add);
  const row = (step: PricedStep, label: string, detail: string, draw: number): ActionRow => {
    const prob = desecrationOffered(draw);
    return prob > 0 ? { step, label, detail, prob } : { step, label, detail, prob, reason: why() };
  };

  // The plain bone draws by weight from the COMBINED normal ∪ desecrated pool, so it can land an
  // ordinary mod as well as a carved one — which is why this row belongs on every add, not only on
  // desecrated ones.
  rows.push(row({ currency: 'desecrate' }, 'Desecration',
    `offers 3 mods — the odds one of them is ${add.text}`,
    carried ? 0 : desecrationProbability(data, state, add.id)));

  const boss = desecrationOmenForMod(add);
  if (boss === undefined) return rows; // not a carved mod: no boss owns it, so no omen can target it
  const allowed = bossOmenAllowed(state.base.category);
  const name = bossOmenLabel(boss);
  const draw = carried || !allowed ? 0 : desecrationBossAnySideProbability(data, state, add.id, { omen: boss });
  const r = row({ currency: 'desecrate', boss }, `Desecration + Omen of the ${name}`,
    `draws only from the ${name}’s carved pool, then offers 3`, draw);
  rows.push(allowed ? r : { ...r, reason: 'the boss omens only work on a Weapon or Jewellery' });
  return rows;
}

/**
 * What each currency can do to an item you already hold. `addModId` = a mod you want ONTO the item;
 * `removeModId` = a mod currently on it you'd sacrifice. Returns the applicable currencies with their
 * exact per-use probability and feasibility:
 *   • Rare + add → **Exalted** (fill an open slot); + a removeModId → **Chaos** (swap it out for the
 *     add); + a **Desecration**, plus its boss omen when the mod is a carved one.
 *   • Magic + add → **Augmentation** (fill the open slot) and **Regal** (upgrade to Rare adding it).
 *   • removeModId alone → **Annulment** (remove one random mod — odds it's the one you named).
 *
 *   • Every add orb also appears at **Greater** and **Perfect** strength where the sheet prices one and
 *     it can actually land — the route cards beside this panel have named those orbs since the
 *     orb-strength axis shipped, and a check that only knew base orbs disagreed with them on one screen.
 *   • An **Essence** row: Perfect (Rare — adds its mod for certain while eating one at random, with the
 *     Crystallisation omens that choose the side) and regular (Magic — the forced add, P=1).
 */
export function currencyActions(
  eng: Engine, item: ExistingItem, sel: { addModId?: string; removeModId?: string },
): CurrencyAction[] {
  const { data, prices } = eng;
  const state = buildItemState(data, item);
  const actions: CurrencyAction[] = [];
  // Every row is priced by the PLANNERS' own `stepCost`, on a base-resolved sheet. Two reasons, and
  // the panel got both wrong before: a Desecration's bone depends on the item's category (jawbone
  // 0.62ex, rib 0.30ex, collarbone 4.00ex) and only `pricesForBase` knows which; and the Omen of Light
  // surcharge was summed by hand here — `prices.currency[k] ?? 0` plus `prices.omens[id] ?? 0` — a
  // second copy of the pricing rule, which is the exact shape the D8 mispricing hid in. A row that
  // quotes a different number from the route that uses the same orb is worse than no row.
  const sheet = pricesForBase(prices, state.base);
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  const push = (
    step: PricedStep, label: string, detail: string, prob: number, reason?: string,
  ): void => {
    const row = {
      currency: step.currency, label, detail, prob, cost: stepCost(sheet, step), feasible: prob > 0,
    };
    actions.push(reason === undefined ? row : { ...row, reason });
  };

  /**
   * The same orb at Greater and Perfect strength, pushed under the base row it belongs to.
   *
   * Three gates, and the first two are not optional. A strength the sheet does not list is SKIPPED,
   * never priced at the base key — `stepCost` charges 0 for a missing key, so an unlisted Perfect orb
   * would read FREE and be the panel's top recommendation. And `atStrength` decides which currencies
   * have strengths at all, imported rather than restated, because a second copy of that switch is how
   * this panel and the planners would come to disagree about what the game sells.
   *
   * The third is a judgement: a strength that cannot land (`prob <= 0`) is dropped rather than shown
   * blocked. A raised ilvl floor puts the LOW tiers out of reach, so a Perfect orb legitimately can't
   * produce a T8 mod — true, and a different question from "can this mod go on this item at all",
   * which the base row above already answers. Showing both makes the panel argue with itself.
   */
  const pushStrengths = (step: PlanStep, name: string, detail: string): void => {
    for (const [tier, adjective] of [['greater', 'Greater'], ['perfect', 'Perfect']] as const) {
      const at = atStrength(step, tier);
      if (at === undefined || sheet.currency[currencyKey(at)] === undefined) continue;
      const prob = stepProbability(data, state, at);
      if (!(prob > 0)) continue;
      push(at, `${adjective} ${name}`, `${detail} — ${adjective.toLowerCase()} orbs only roll the better tiers`, prob);
    }
  };

  const { addModId, removeModId } = sel;
  if (addModId) {
    const add = resolveMod(data, addModId);
    const reason = (): string => addBlockedReason(data, state, add);
    const onItem = (id: string): boolean => state.prefixes.concat(state.suffixes).some((m) => m.modId === id);
    if (state.rarity === 'rare') {
      const p = exaltProbability(data, state, addModId);
      const exalt = `adds ${text(addModId)} to an open ${add.type}`;
      push({ currency: 'exalt' }, 'Exalted Orb', exalt, p, p > 0 ? undefined : reason());
      pushStrengths({ currency: 'exalt', add: addModId }, 'Exalted Orb', exalt);
      if (removeModId) {
        const c = chaosProbability(data, state, removeModId, addModId);
        const swap = `removes ${text(removeModId)}, adds ${text(addModId)}`;
        push({ currency: 'chaos' }, 'Chaos Orb', swap, c,
          c > 0 ? undefined : (!onItem(removeModId) ? `${text(removeModId)} isn’t on the item` : `can’t add ${text(addModId)} even after the swap`));
        pushStrengths({ currency: 'chaos', add: addModId, remove: removeModId }, 'Chaos Orb', swap);
      }
      for (const row of desecrationRows(data, state, add)) push(row.step, row.label, row.detail, row.prob, row.reason);
      // A Perfect Essence adds its mod for CERTAIN and takes one at random in exchange, so the only
      // uncertainty — and the only thing worth quoting — is which mod it eats. That makes a sacrifice
      // mandatory to the question, not optional to it: `PlanStep`'s perfect-essence variant requires
      // `remove`, and without one there is no probability to state, only the trade to explain.
      if (add.source === 'perfect_essence') {
        const essence = `adds ${text(addModId)} for certain, in exchange for one mod at random`;
        if (removeModId === undefined) {
          push({ currency: 'perfect-essence', add: addModId }, 'Perfect Essence', essence, 0,
            'name a mod to sacrifice above and this shows the odds it takes that one');
        } else {
          for (const [omen, label, note] of [
            [undefined, 'Perfect Essence', 'it takes any mod'],
            ['sinistral', 'Perfect Essence + Omen of Sinistral Crystallisation', 'it can only take a prefix'],
            ['dextral', 'Perfect Essence + Omen of Dextral Crystallisation', 'it can only take a suffix'],
          ] as const) {
            const step: PlanStep = { currency: 'perfect-essence', add: addModId, remove: removeModId, ...(omen ? { omen } : {}) };
            const prob = stepProbability(data, state, step);
            if (omen !== undefined && !(prob > 0)) continue; // an omen for the side the mod isn't on
            push(step, label, `${essence} — odds it’s ${text(removeModId)}, ${note}`, prob,
              prob > 0 ? undefined : (!onItem(removeModId) ? `${text(removeModId)} isn’t on the item` : reason()));
          }
        }
      }
    }
    if (state.rarity === 'magic') {
      const a = augmentationProbability(data, state, addModId);
      const augment = `adds ${text(addModId)} to the open ${add.type}`;
      push({ currency: 'augment' }, 'Orb of Augmentation', augment, a, a > 0 ? undefined : reason());
      pushStrengths({ currency: 'augment', add: addModId }, 'Orb of Augmentation', augment);
      const rg = regalProbability(data, state, addModId);
      const regal = `upgrades to Rare, adds ${text(addModId)}`;
      push({ currency: 'regal' }, 'Regal Orb', regal, rg, rg > 0 ? undefined : reason());
      pushStrengths({ currency: 'regal', add: addModId }, 'Regal Orb', regal);
      // A regular Essence is the Magic-only branch: it forces its mod and turns the item Rare, P=1.
      // Which LEVEL to quote is a real choice — Abrasion runs Lesser 116ex against Greater 0.81ex, so
      // naming the wrong one misprices the row by 140x — and it is already made once, by the same
      // function both planners use.
      if (add.source === 'essence') {
        const essenceTier = cheapestEssenceLevel(sheet, add, 0, state.level);
        const level = essenceLevelOf(add.tiers[essenceTier]?.name ?? '');
        const step: PlanStep = { currency: 'essence', add: addModId, essenceTier, ...(level ? { essenceLevel: level } : {}) };
        const prob = stepProbability(data, state, step);
        push(step, 'Essence', `forces ${text(addModId)} onto the open ${add.type} and makes the item Rare`, prob,
          prob > 0 ? undefined : reason());
      }
    }
  }
  if (removeModId) {
    const p = annulProbability(data, state, removeModId);
    const onItem = state.prefixes.concat(state.suffixes).some((m) => m.modId === removeModId);
    push({ currency: 'annul' }, 'Orb of Annulment', `removes one random mod — odds it’s ${text(removeModId)}`, p,
      p > 0 ? undefined : (onItem ? undefined : `${text(removeModId)} isn’t on the item`));
    // Omen of Light makes the Annulment remove the DESECRATED mod for certain (P=1) — the targeted-
    // removal lever. Only meaningful when the sacrifice is itself a desecrated mod on a desecrated item.
    if (onItem && data.mods.get(removeModId)?.source === 'desecrated' && state.desecrated) {
      const lp = annulProbability(data, state, removeModId, { omen: 'light' });
      push({ currency: 'annul', omen: 'light' }, 'Orb of Annulment + Omen of Light',
        `removes the desecrated ${text(removeModId)} for certain`, lp);
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
