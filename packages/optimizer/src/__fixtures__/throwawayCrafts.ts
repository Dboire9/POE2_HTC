// The crafts the throwaway change is measured against, shared by the snapshot that recorded them and
// the test that replays them — one list, so the two can never quietly disagree about what was run.
//
// IDENTITY crafts name no Perfect Essence or Alloy. Throwaway steps are only ever generated to feed
// one, so these must build exactly the skeletons they built before and return byte-identical
// frontiers. They span both planners and the paths a throwaway could plausibly have disturbed:
// tier targets, excluded currencies, an essence, a desecration, a magic start, junk, a free slot, a
// fractured mod.
//
// WITH-PERFECT crafts name one. Their routes are allowed to change, but only for the better: every
// plan on the old frontier must still be matched or beaten, since the old routes stay in the search.
//
// Everything is chosen by rule from the shipped data rather than by hardcoded id, so a data refresh
// that renames a mod fails loudly here instead of silently testing something else.

import type { ItemState, PatchData, PlacedMod } from '../../../engine/src/types.ts';
import { familiesOf, resolveMod } from '../../../engine/src/pool.ts';
import { desecrationOmenForMod } from '../../../engine/src/probability.ts';
import type { Prices } from '../cost.ts';
import type { ParetoResult, TierTarget } from '../optimize.ts';
import { optimizePareto } from '../optimize.ts';
import { optimizeFromItem } from '../fromItem.ts';

export interface NamedCraft {
  readonly name: string;
  readonly run: () => ParetoResult;
}

const LEVEL = 82;

/** The first `n` normal-pool mods of one side that roll at LEVEL, with no family shared among them or with `avoid`. */
function pick(data: PatchData, baseId: string, side: 'prefix' | 'suffix', n: number, avoid: readonly string[] = []): string[] {
  const base = data.bases.get(baseId)!;
  const pool = side === 'prefix' ? base.pools.normal.prefixes : base.pools.normal.suffixes;
  const taken = new Set(avoid.flatMap((id) => familiesOf(resolveMod(data, id))));
  const out: string[] = [];
  for (const id of pool) {
    const mod = resolveMod(data, id);
    if (mod.tiers[0]!.ilvl > LEVEL || familiesOf(mod).some((f) => taken.has(f))) continue;
    out.push(id);
    for (const f of familiesOf(mod)) taken.add(f);
    if (out.length === n) return out;
  }
  throw new Error(`${baseId} has fewer than ${n} usable ${side}es`);
}

const any = (modId: string): TierTarget => ({ modId });
const placed = (data: PatchData, modId: string, extra: Partial<PlacedMod> = {}): PlacedMod =>
  ({ modId, tierName: resolveMod(data, modId).tiers.at(-1)!.name, ...extra });

export function identityCrafts(data: PatchData, prices: Prices): NamedCraft[] {
  const wands = data.bases.get('Wands')!;
  const [wp0, wp1, wpJ] = pick(data, 'Wands', 'prefix', 3);
  const [ws0, ws1, wsJ] = pick(data, 'Wands', 'suffix', 3);
  const [rp0] = pick(data, 'Rings', 'prefix', 1);
  const [rs0, rs1] = pick(data, 'Rings', 'suffix', 2);
  const ess = wands.pools.essence.prefixes.concat(wands.pools.essence.suffixes)
    .find((id) => resolveMod(data, id).source === 'essence' && resolveMod(data, id).type === 'suffix')!;
  const des = wands.pools.desecrated.prefixes.concat(wands.pools.desecrated.suffixes)
    .find((id) => desecrationOmenForMod(resolveMod(data, id)) !== undefined
      && resolveMod(data, id).type === 'suffix'
      && !familiesOf(resolveMod(data, id)).some((f) => [ws0!].flatMap((s) => familiesOf(resolveMod(data, s))).includes(f)))!;
  const tier2 = resolveMod(data, wp0!).tiers.length - 2;
  const sceptreTargets = ['Sceptres/LocalIncreasedSpiritPercent', 'Sceptres/AlliesInPresenceAllResistances',
    'Sceptres/AlliesInPresenceAllDamage', 'Sceptres/GlobalIncreaseMinionSpellSkillGemLevelWeapon'].map(any);
  const rare = (pre: PlacedMod[], suf: PlacedMod[]): ItemState =>
    ({ base: wands, level: LEVEL, rarity: 'rare', prefixes: pre, suffixes: suf });

  return [
    { name: 'wands, white, two targets', run: () => optimizePareto(data, prices, wands, [any(wp0!), any(ws0!)], { level: LEVEL }) },
    { name: 'wands, white, tier target', run: () => optimizePareto(data, prices, wands,
      [{ modId: wp0!, minTierIndex: tier2 }, any(wp1!), any(ws0!)], { level: LEVEL }) },
    { name: 'rings, white, currencies excluded', run: () => optimizePareto(data, prices, data.bases.get('Rings')!,
      [any(rp0!), any(rs0!), any(rs1!)],
      { level: LEVEL, policy: { excluded: new Set(['exalt_perfect', 'OmenofDextralExaltation']) } }) },
    { name: 'wands, white, regular essence', run: () => optimizePareto(data, prices, wands, [any(wp0!), any(ess)], { level: LEVEL }) },
    { name: 'wands, white, desecration', run: () => optimizePareto(data, prices, wands,
      [any(wp0!), any(wp1!), any(ws0!), any(des)], { level: LEVEL }) },
    { name: 'sceptres, white, four targets', run: () => optimizePareto(data, prices, data.bases.get('Sceptres')!,
      sceptreTargets, { level: LEVEL }) },
    { name: 'wands, rare item with junk', run: () => optimizeFromItem(data, prices,
      rare([placed(data, wp0!), placed(data, wpJ!)], [placed(data, ws0!)]), [any(wp0!), any(ws0!), any(ws1!)]) },
    { name: 'wands, magic item', run: () => optimizeFromItem(data, prices,
      { base: wands, level: LEVEL, rarity: 'magic', prefixes: [placed(data, wp0!)], suffixes: [] },
      [any(wp0!), any(wp1!), any(ws0!)]) },
    { name: 'wands, rare item, free suffix', run: () => optimizeFromItem(data, prices,
      rare([placed(data, wp0!)], [placed(data, ws0!), placed(data, wsJ!)]), [any(wp0!), any(ws0!), any(wp1!)],
      { spare: { prefixes: 0, suffixes: 1 } }) },
    { name: 'wands, rare item, fractured mod', run: () => optimizeFromItem(data, prices,
      rare([placed(data, wp0!, { fractured: true })], [placed(data, ws0!), placed(data, wsJ!)]),
      [any(wp0!), any(ws0!), any(ws1!)]) },
  ];
}

export function withPerfectCrafts(data: PatchData, prices: Prices): NamedCraft[] {
  const sceptre = data.bases.get('Sceptres')!;
  const SPIRIT = 'Sceptres/LocalIncreasedSpiritPercent';
  const ALLY_RES = 'Sceptres/AlliesInPresenceAllResistances';
  const ALLY_DAMAGE = 'Sceptres/AlliesInPresenceAllDamage';
  const MINION_LEVEL = 'Sceptres/GlobalIncreaseMinionSpellSkillGemLevelWeapon';
  const ALLOY_STACKS = 'Sceptres/PerfectEssence_MaximumPuppeteerStacks';
  const [junk] = pick(data, 'Sceptres', 'suffix', 1, [MINION_LEVEL, ALLOY_STACKS]);
  return [
    { name: 'sceptres, white, an Alloy', run: () => optimizePareto(data, prices, sceptre,
      [SPIRIT, ALLY_RES, MINION_LEVEL, ALLOY_STACKS].map(any), { level: LEVEL }) },
    { name: 'sceptres, rare item with junk, an Alloy', run: () => optimizeFromItem(data, prices,
      { base: sceptre, level: LEVEL, rarity: 'rare',
        prefixes: [placed(data, ALLY_DAMAGE)], suffixes: [placed(data, MINION_LEVEL), placed(data, junk!)] },
      [ALLY_DAMAGE, MINION_LEVEL, ALLOY_STACKS].map(any)) },
  ];
}

/** What the snapshot keeps of a result: everything a player sees, at full precision. */
export function frontierSnapshot(r: ParetoResult) {
  return {
    plansEvaluated: r.plansEvaluated,
    truncated: r.truncated ?? false,
    frontier: r.frontier.map((p) => ({
      probability: p.probability, expected: p.cost.expected, perAttempt: p.cost.perAttempt, steps: p.steps,
    })),
  };
}
