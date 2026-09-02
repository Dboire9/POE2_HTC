// The knobs on a crafting step that change only its ODDS and its PRICE — never what happens next.
//
// A plan step names an outcome ("Exalt, landing Increased Mana"). Around that outcome sit choices the
// player makes at the counter: which strength of orb to buy, whether to spend an omen alongside it.
// They move the probability and the bill, and they move nothing else — `applyStep` (plan.ts) reads
// only `currency` / `remove` / `add` / `adds` / `essenceTier`, so the item that comes out the other
// side is the same item whichever way they are set.
//
// That is the whole reason this module exists as its own thing. Because the levers do not touch the
// state trajectory, a search does NOT have to enumerate their product across a plan: it can price them
// one step at a time against a state it already knows, and combine the results afterwards
// (`leverDp.ts`). A five-add plan has 3^5 orb assignments; it has 5 x 3 lever options.
//
// The property is a fact about today's `applyStep`, not a law, so `levers.test.ts` asserts it directly
// — every option this module returns must leave the same item behind as the step it came from. A
// future lever that changed the outcome (an Omen of Greater Exaltation adds TWO mods) would turn that
// test red instead of quietly corrupting a frontier.

import type { CurrencyTier, ItemState, PatchData } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
// Imported from the modules themselves, never from the package index: the index re-exports
// `loadPatch`, which reaches for `node:fs`, and pulling it in here would drag the filesystem into the
// browser bundle. The build catches it, which is why the build is in the verify chain.
import { resolveMod } from '../../engine/src/pool.ts';
import { stepProbability } from '../../engine/src/plan.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { allowsStep, currencyKey, stepCost } from './cost.ts';

/** One way to buy a step: the fully-specified step, what it lands, and what it costs. */
export interface StepLever {
  readonly step: PlanStep;
  /** `stepProbability` against the state this step acts on. Always > 0 — see `leverOptions`. */
  readonly prob: number;
  readonly cost: number;
}

const STRENGTHS: readonly CurrencyTier[] = ['base', 'greater', 'perfect'];

/**
 * The step at an orb strength, or `undefined` for a currency the game doesn't sell at strengths.
 *
 * Written as a switch rather than a currency-set test because that is what narrows `step` to the
 * variants carrying a `tier` field; `chaos` is on the list because `chaos_greater` / `chaos_perfect`
 * are real listings and `chaosProbability` has always honoured the floor.
 */
function atStrength(step: PlanStep, tier: CurrencyTier): PlanStep | undefined {
  switch (step.currency) {
    // `greater-exalt` is on this list because it IS an Exalted Orb — one with an Omen of Greater
    // Exaltation on it — and the omen works on a Greater or Perfect orb too (user ruling 2026-09-02).
    // Its STRENGTH is a lever: it moves the odds and the price and leaves the same two mods behind.
    // The omen is not, which is why it is baked into the step rather than offered by `withOmen`.
    case 'transmute': case 'augment': case 'regal': case 'exalt': case 'chaos': case 'greater-exalt':
      return { ...step, tier };
    default:
      return undefined;
  }
}

/**
 * The step with its omen spent, or `undefined` where no omen applies.
 *
 * Lifted from `withOmenVariants` (optimize.ts) unchanged, deliberately: this is meant to offer exactly
 * the omens that planner already offers, so the only NEW axis a caller gains is orb strength. A
 * Necromancy omen on an UNOMENED desecration is a real, priced lever that neither offers — left alone
 * here so this change stays one change.
 */
function withOmen(data: PatchData, prices: Prices, step: PlanStep): PlanStep | undefined {
  switch (step.currency) {
    // Omen of Whittling: the Chaos Orb removes the LOWEST-LEVEL modifier instead of a uniform one.
    // Gated on the omen having a PRICE, for the same reason the strengths above are: `stepCost`
    // charges 0 for a missing key, and this omen is not in the shipped `omenQuotes` yet (poe.ninja
    // serves no omen endpoint, so those are hand-transcribed). Ungated, an unpriced Whittling would
    // come back FREE and dominate every chaos step it touched — the exact trap this module's other
    // gate exists for. It lights up on its own the day the quote is added; until then a chaos step
    // simply has no omen variant, which is today's behaviour exactly.
    case 'chaos':
      return prices.omens['OmenofWhittling'] === undefined ? undefined : { ...step, omen: 'whittling' };
    case 'exalt': return { ...step, constrainTo: resolveMod(data, step.add).type };
    case 'perfect-essence':
      return { ...step, omen: resolveMod(data, step.remove).type === 'prefix' ? 'sinistral' : 'dextral' };
    // Only a BOSS-targeted desecration takes a side omen here, matching withOmenVariants.
    case 'desecrate': return step.boss ? { ...step, constrainTo: resolveMod(data, step.add).type } : undefined;
    // Omen of Light. No legality gate: `annulProbability` returns 1 only on a desecrated item holding a
    // desecrated mod and 0 otherwise, so the wrong case prunes itself below. withOmenVariants gates on
    // the START item instead, which is a proxy for the evolving one — right in practice, but a proxy.
    case 'annul': return { ...step, omen: 'light' };
    default: return undefined;
  }
}

/**
 * Every way `step` can be bought against `state`, minus the ways that can never win.
 *
 * Returned in a deliberate order — base strength before greater before perfect, omen off before on —
 * so that when two options tie exactly, the one kept is the cheaper, plainer orb. A route that reads
 * "Perfect Exalt" where a plain one buys the same odds is a route the player would rightly distrust.
 *
 * Three filters, in the order that costs least:
 *
 *  1. A strength the sheet does not list is SKIPPED, never priced at the base key. `stepCost` charges
 *     0 for a missing key, so an unlisted Perfect orb would come back FREE and dominate everything it
 *     touched — the exact trap `cost.test.ts` pins. Mirrors `markovActions.ts`, which gates its own
 *     strengths on `prices.currency[key] !== undefined` for the same reason.
 *  2. `allowsStep` — the same function the frontier filters with, so what the search prunes and what
 *     the player is promised can never drift apart.
 *  3. `prob <= 0` drops. This is the ONLY legality check the module needs, and it is exact: an orb
 *     whose ilvl floor puts the target out of reach, an omen pointing at the wrong side, a
 *     side-constrained add onto a full side all score 0 on their own. It is also why this must not
 *     reuse `legalOrbTiers` (optimize.ts), which answers the same question by arithmetic on the
 *     target's MINIMUM tier and gets it wrong for an any-tier target: `tiers[0].ilvl` is about 1, every
 *     strength floor is above it, and the function concludes `['base']` — while a Greater orb is
 *     perfectly legal there, since a better tier still satisfies "any tier or better". That planner
 *     needs the guess because it builds its cross product before it knows any probability. This one
 *     computes the probability first, so it can simply look.
 * What this deliberately does NOT do is drop options one another dominates. That is the search's
 * business (`leverDp.ts` prunes them before its first pass), and keeping it there has two payoffs: the
 * count of what was offered stays available for the "plans checked" figure, and the brute-force
 * differential enumerates the unpruned set, so it tests the domination rule instead of sharing it.
 */
export function leverOptions(
  data: PatchData, prices: Prices, state: ItemState, step: PlanStep, policy?: CurrencyPolicy,
): StepLever[] {
  const variants: PlanStep[] = [];
  for (const tier of STRENGTHS) {
    let at: PlanStep | undefined;
    if (tier === 'base') {
      at = step;
    } else {
      at = atStrength(step, tier);
      // Priced through `currencyKey`, never by rebuilding the key here: a step's currency name is not
      // always the orb it buys (a `greater-exalt` buys an `exalt`), and a gate that guessed wrong
      // would silently drop every strength above base instead of failing.
      if (at === undefined || prices.currency[currencyKey(at)] === undefined) continue;
    }
    variants.push(at);
    const omened = withOmen(data, prices, at);
    if (omened !== undefined) variants.push(omened);
  }

  const kept: StepLever[] = [];
  for (const v of variants) {
    if (policy && !allowsStep(policy, v)) continue;
    const prob = stepProbability(data, state, v);
    if (!(prob > 0)) continue;
    kept.push({ step: v, prob, cost: stepCost(prices, v) });
  }
  return kept;
}
