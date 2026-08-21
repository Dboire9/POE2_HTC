// Monte-Carlo self-check for the analytic optimizer (CLAUDE.md: "100k MC runs of recommended plan
// match analytic success %"). Full-plan totals are tiny (~1e-5), so a whole-plan MC is hopelessly
// noisy; instead we validate each PER-STEP probability (0.03–0.3, MC-friendly) by sampling the same
// weighted pool the analytic uses. The cumulative total is then exact arithmetic (Π of per-step),
// needing no simulation. This mirrors the engine's model exactly (base floor, ilvl cap = level, no
// family exclusion in the denominator — see D6), so empirical → analytic by the law of large numbers.

import type { ItemState, PatchData, PlanStep, Rarity } from '../../engine/src/index.ts';
import { excluded, itemFamilies, modTierWeight, resolveMod, whiteItem, withAffix } from '../../engine/src/index.ts';

/** Deterministic PRNG so the self-check is reproducible (no flaky tests). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Max mods per side for the add's RESULT rarity (magic 1+1 / rare 3, D2) — matches the engine. */
const SLOT_LIMIT: Record<'transmute' | 'augment' | 'regal' | 'exalt', number> = {
  transmute: 1, augment: 1, regal: 3, exalt: 3,
};

/**
 * The reachable add pool for `state`: open sides' normal mods (side open iff below `limit`), weighted
 * by eligible tier weight, with on-item families removed — the REAL game mechanic (family exclusion
 * D6 + magic 1+1 slots D2), so it's genuine ground truth for the corrected analytic.
 */
function reachableWeighted(data: PatchData, state: ItemState, limit: number): { id: string; weight: number }[] {
  const ids: string[] = [];
  if (state.prefixes.length < limit) ids.push(...state.base.pools.normal.prefixes);
  if (state.suffixes.length < limit) ids.push(...state.base.pools.normal.suffixes);
  const occupied = itemFamilies(data, state);
  const out: { id: string; weight: number }[] = [];
  for (const id of ids) {
    const mod = resolveMod(data, id);
    if (excluded(mod, occupied)) continue; // can't roll a family already on the item (any of them)
    const w = modTierWeight(mod, 0, state.level, 0);
    if (w > 0) out.push({ id, weight: w });
  }
  return out;
}

function sample(weighted: { id: string; weight: number }[], rng: () => number): string {
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let r = rng() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r < 0) return w.id;
  }
  return weighted[weighted.length - 1]!.id;
}

function rarityAfterAdd(currency: PlanStep['currency'], prev: Rarity): Rarity {
  if (currency === 'transmute') return 'magic';
  if (currency === 'regal') return 'rare';
  return prev;
}

/**
 * Empirical per-step success rate for an add-chain `steps` sequence: for each step, sample the add
 * `runs` times from the reachable pool and record the fraction that landed the intended mod, then
 * thread state deterministically (as if the intended mod was obtained) before the next step. The
 * returned array lines up with evaluatePlan's per-step probabilities.
 */
export function simulatePerStepRates(
  data: PatchData, base: ItemState['base'], steps: readonly PlanStep[], runs: number, seed = 1, level = 100,
): number[] {
  const rng = mulberry32(seed);
  const rates: number[] = [];
  let state = whiteItem(base, level);
  for (const step of steps) {
    if (step.currency !== 'transmute' && step.currency !== 'augment' && step.currency !== 'regal' && step.currency !== 'exalt') {
      throw new Error(`simulatePerStepRates only handles the add chain, got ${step.currency}`);
    }
    const targetId = step.add;
    const weighted = reachableWeighted(data, state, SLOT_LIMIT[step.currency]);
    let ok = 0;
    for (let r = 0; r < runs; r++) if (sample(weighted, rng) === targetId) ok++;
    rates.push(ok / runs);
    const mod = resolveMod(data, targetId);
    state = withAffix(state, mod.type, { modId: targetId, tierName: mod.tiers[0]?.name ?? '' }, rarityAfterAdd(step.currency, state.rarity));
  }
  return rates;
}
