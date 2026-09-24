// The true-cost crafts the family-sibling fix is measured against, shared by the snapshot that
// recorded them and the test that replays them — one list, so the two cannot quietly disagree.
//
// IDENTITY crafts name only LONELY mods: no other mod in the base's normal or desecrated pool shares a
// family with any target. The fix only ever changes what happens when such a sibling rolls, so these
// must come back byte-identical — cost, bound, the route's states, actions and odds, the starting-item
// table. They span the paths a change to the action space could disturb: from white with and without a
// paid restart, a held Rare with junk, a Magic start, a tier target, excluded currencies, a desecrated
// target, a regular and a Perfect Essence, a free slot, a fractured mod, and cross-family alternatives
// (the symmetry path).
//
// SIBLING crafts name mods that do have one. Their numbers are ALLOWED to move — that is the fix — and
// what they are held to is agreeing with the replay (markovReplay.ts) once it is in.
//
// Everything is chosen by rule from the shipped data, so a data refresh that renames a mod fails loudly
// here instead of silently testing something else.

import { createHash } from 'node:crypto';
import type { ItemBase, ItemState, PatchData, PlacedMod } from '../../../engine/src/types.ts';
import { familiesOf, resolveMod } from '../../../engine/src/pool.ts';
import { whiteItem } from '../../../engine/src/item.ts';
import { desecrationOmenForMod } from '../../../engine/src/probability.ts';
import type { Prices } from '../cost.ts';
import type { TierTarget } from '../optimize.ts';
import type { MarkovOptions, MarkovResult } from '../markovFromItem.ts';
import { markovFromItem } from '../markovFromItem.ts';

export interface NamedMarkovCraft {
  readonly name: string;
  readonly run: (extra?: MarkovOptions) => MarkovResult;
}

const LEVEL = 82;

/** Every mod a roll can put on this base — the pools a sibling would have to come from. */
const rollable = (base: ItemBase): string[] => [
  ...base.pools.normal.prefixes, ...base.pools.normal.suffixes,
  ...base.pools.desecrated.prefixes, ...base.pools.desecrated.suffixes,
];

/** True when no other mod the base can roll shares a family with `id`. */
export function lonely(data: PatchData, base: ItemBase, id: string): boolean {
  const fams = familiesOf(resolveMod(data, id));
  return !rollable(base).some((o) => o !== id && familiesOf(resolveMod(data, o)).some((f) => fams.includes(f)));
}

/** The first `n` lonely normal mods of one side that roll at LEVEL. */
function pickLonely(data: PatchData, baseId: string, side: 'prefix' | 'suffix', n: number, skip = 0): string[] {
  const base = data.bases.get(baseId)!;
  const pool = side === 'prefix' ? base.pools.normal.prefixes : base.pools.normal.suffixes;
  const out = pool.filter((id) => resolveMod(data, id).tiers[0]!.ilvl <= LEVEL && lonely(data, base, id)).slice(skip, skip + n);
  if (out.length < n) throw new Error(`${baseId} has fewer than ${n + skip} lonely ${side}es`);
  return out;
}

const any = (modId: string): TierTarget => ({ modId });
const placed = (data: PatchData, modId: string, extra: Partial<PlacedMod> = {}): PlacedMod =>
  ({ modId, tierName: resolveMod(data, modId).tiers.at(-1)!.name, ...extra });

export function markovIdentityCrafts(data: PatchData, prices: Prices): NamedMarkovCraft[] {
  const wands = data.bases.get('Wands')!;
  const rings = data.bases.get('Rings')!;
  const boots = data.bases.get('Boots_str')!;
  const [wp0, wp1, wpJ] = pickLonely(data, 'Wands', 'prefix', 3);
  const [ws0, ws1, wsJ] = pickLonely(data, 'Wands', 'suffix', 3);
  const [rp0] = pickLonely(data, 'Rings', 'prefix', 1);
  const [rs0, rs1] = pickLonely(data, 'Rings', 'suffix', 2);
  const [bp0] = pickLonely(data, 'Boots_str', 'prefix', 1);
  const [bs0] = pickLonely(data, 'Boots_str', 'suffix', 1);
  const des = wands.pools.desecrated.suffixes.find((id) =>
    desecrationOmenForMod(resolveMod(data, id)) !== undefined && lonely(data, wands, id))!;
  const ess = [...wands.pools.essence.prefixes, ...wands.pools.essence.suffixes]
    .find((id) => resolveMod(data, id).source === 'essence' && resolveMod(data, id).type === 'suffix')!;
  const perfect = [...wands.pools.essence.prefixes, ...wands.pools.essence.suffixes]
    .find((id) => resolveMod(data, id).source === 'perfect_essence' && resolveMod(data, id).type === 'prefix')!;
  const gain = ['Wands/DamageGainedAsCold', 'Wands/DamageGainedAsLightning'];
  // Picked by name for the symmetry path, so checked rather than trusted: a sibling would put this craft
  // in the wrong list.
  for (const id of gain) if (!lonely(data, wands, id)) throw new Error(`${id} is no longer lonely`);
  const tier2 = resolveMod(data, wp0!).tiers.length - 2;
  const rare = (pre: PlacedMod[], suf: PlacedMod[]): ItemState =>
    ({ base: wands, level: LEVEL, rarity: 'rare', prefixes: pre, suffixes: suf });
  // On the model the recording was made with: these lock that the sibling fix moved nothing it should
  // not, a question the later junk-family correction (TODO 23, which moves every craft with junk on
  // purpose) has no part in. Re-recording would lose what they were recorded to show.
  const solve = (start: ItemState, targets: TierTarget[], opts: MarkovOptions = {}) =>
    (extra: MarkovOptions = {}): MarkovResult => markovFromItem(data, prices, start, targets, { junkFamilies: false, ...opts, ...extra });

  return [
    { name: 'wands, white, free base, two targets', run: solve(whiteItem(wands, LEVEL), [any(wp0!), any(ws0!)], { restartCost: 0 }) },
    { name: 'wands, white, paid base, tier target', run: solve(whiteItem(wands, LEVEL),
      [{ modId: wp0!, minTierIndex: tier2 }, any(ws0!)], { restartCost: 30 }) },
    { name: 'wands, held rare with junk', run: solve(rare([placed(data, wp0!), placed(data, wpJ!)], [placed(data, wsJ!)]),
      [any(wp0!), any(wp1!), any(ws0!)]) },
    { name: 'wands, magic start', run: solve({ ...whiteItem(wands, LEVEL), rarity: 'magic', prefixes: [placed(data, wp0!)] },
      [any(wp0!), any(ws0!), any(ws1!)]) },
    { name: 'rings, white, currencies excluded', run: solve(whiteItem(rings, LEVEL), [any(rp0!), any(rs0!), any(rs1!)],
      { restartCost: 5, policy: { excluded: new Set(['exalt_perfect', 'OmenofDextralExaltation', 'desecrate']) } }) },
    { name: 'wands, held rare, desecrated target', run: solve(rare([placed(data, wp0!)], []), [any(wp0!), any(des)]) },
    { name: 'wands, white, regular essence', run: solve(whiteItem(wands, LEVEL), [any(wp0!), any(ess)], { restartCost: 1 }) },
    { name: 'wands, held rare, perfect essence', run: solve(rare([placed(data, wp1!)], [placed(data, ws0!)]),
      [any(perfect), any(ws0!)]) },
    { name: 'boots, white, free suffix', run: solve(whiteItem(boots, LEVEL), [any(bp0!), any(bs0!)],
      { restartCost: 2, spare: { prefixes: 0, suffixes: 1 } }) },
    { name: 'wands, held rare, fractured target', run: solve(rare([placed(data, wp0!, { fractured: true }), placed(data, wpJ!)], []),
      [any(wp0!), any(ws0!)]) },
    { name: 'wands, white, cross-family alternatives', run: solve(whiteItem(wands, LEVEL),
      [...gain.map((modId) => ({ modId, slot: 0 })), any(ws0!)], { restartCost: 0 }) },
  ];
}

/** Crafts whose targets DO have family siblings — the ones the fix is for. */
export function markovSiblingCrafts(data: PatchData, prices: Prices): NamedMarkovCraft[] {
  const wands = data.bases.get('Wands')!;
  const FIRELVL = 'Wands/GlobalIncreaseFireSpellSkillGemLevelWeapon';
  const FIREDMG = 'Wands/FireDamageWeaponPrefix';
  const [ws0] = pickLonely(data, 'Wands', 'suffix', 1);
  const noBones = { excluded: new Set(['desecrate', 'desecrate_ancient']) };
  const solve = (start: ItemState, targets: TierTarget[], opts: MarkovOptions) =>
    (extra: MarkovOptions = {}): MarkovResult => markovFromItem(data, prices, start, targets, { ...opts, ...extra });
  return [
    { name: 'wands, white, paid base, +fire spell levels', run: solve(whiteItem(wands, LEVEL), [any(FIRELVL)],
      { restartCost: 30, policy: noBones }) },
    { name: 'wands, white, paid base, fire damage + a lonely suffix', run: solve(whiteItem(wands, LEVEL),
      [any(FIREDMG), any(ws0!)], { restartCost: 30, policy: noBones }) },
  ];
}

/**
 * Everything a solve publishes that the fix could move, as plain data: the numbers, the route the
 * player is shown (its states, actions, odds and labels), and the starting-item table.
 */
export function markovSnapshot(r: MarkovResult): unknown {
  return {
    feasible: r.feasible, reason: r.reason ?? null, expectedCost: r.expectedCost, bound: r.bound,
    converged: r.converged, bareCost: r.bareCost ?? null,
    holdings: (r.holdings ?? []).map((h) => ({ present: h.present, cost: h.cost, rarity: h.rarity, key: h.key })),
    nodes: r.nodes.map((n) => ({
      key: n.key, present: n.present, blocked: n.blocked, junkPrefixes: n.junkPrefixes, junkSuffixes: n.junkSuffixes,
      expectedCost: n.expectedCost, action: n.action ?? null, visitRate: n.visitRate,
    })),
    edges: r.edges.map((e) => ({ from: e.from, to: e.to, action: e.action, prob: e.prob, regress: e.regress })),
    policySize: r.policy.size,
  };
}

/**
 * What the fixture keeps per craft: the headline numbers, readable, and a SHA-256 of the whole snapshot.
 * JSON keeps every double to full precision, so an equal digest is a byte-for-byte equal result — and
 * the file stays a few kilobytes instead of the ~220 KB the snapshots themselves come to.
 */
export function markovFingerprint(r: MarkovResult): unknown {
  return {
    expectedCost: r.expectedCost, bound: r.bound, bareCost: r.bareCost ?? null,
    nodes: r.nodes.length, edges: r.edges.length,
    sha256: createHash('sha256').update(JSON.stringify(markovSnapshot(r))).digest('hex'),
  };
}
