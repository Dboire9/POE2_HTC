import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import type { AlternativeTarget, SlotChange } from './alternatives.ts';
import { alternativesFromItem, alternativesFromWhite, bestByBudget, compareCloseness } from './alternatives.ts';
import type { CostCdfBounds, Prices } from './cost.ts';
import type { ParetoPlan } from './optimize.ts';
import { planCostCdf } from './cost.ts';
import { optimizeFromItem } from './fromItem.ts';
import { loadPrices } from './loadPrices.ts';

// Synthetic pool built to isolate the two swap regimes that decide this feature's whole design:
//   FSym  — PSym1 / PSym2: same family, IDENTICAL weights ⇒ swapping buys nothing ⇒ must stay off the
//           frontier (this is the real WeaponDamageTypePrefix case: 5 siblings, all weight 2550).
//   FAsym — PAsymRare (w10/tier) / PAsymCommon (w500/tier): a 50× swing ⇒ the swap must surface (the
//           real IncreaseSocketedGemLevel case: 500 vs 2600).
// All tiers sit at ilvl 1 so nothing is level-gated and the orb-strength axis stays trivial.
const mod = (id: string, type: 'prefix' | 'suffix', family: string, tiers: { w: number; v: number }[]): Mod => ({
  id, source: 'normal', type, family, tags: [], text: id,
  tiers: tiers.map((t, i) => ({ name: `t${i}`, ilvl: 1, weight: t.w, ranges: [[t.v, t.v]] })),
});
const three = (w: number): { w: number; v: number }[] => [{ w, v: 10 }, { w, v: 20 }, { w, v: 30 }];

const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: {
    normal: { prefixes: ['PSym1', 'PSym2', 'PAsymRare', 'PAsymCommon'], suffixes: ['SFill'] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['PSym1', mod('PSym1', 'prefix', 'FSym', three(100))],
    ['PSym2', mod('PSym2', 'prefix', 'FSym', three(100))],
    ['PAsymRare', mod('PAsymRare', 'prefix', 'FAsym', three(10))],
    ['PAsymCommon', mod('PAsymCommon', 'prefix', 'FAsym', three(500))],
    ['SFill', mod('SFill', 'suffix', 'FS', [{ w: 1000, v: 1 }])],
  ]),
  bases: new Map([['S', base]]),
};
// Commensurable prices (0.1 quantum) ⇒ every P(in budget) below is exact, not bracketed.
const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 1, exalt: 1, annul: 1.5, chaos: 0.2 }, omens: {} };

const swappedTo = (slots: readonly SlotChange[], modId: string): boolean =>
  slots.some((s) => s.kind === 'swapped' && s.modId === modId);

describe('alternativesFromWhite — the frontier shape', () => {
  const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];

  it('row 0 is the exact item you asked for, however hopeless', () => {
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    const row0 = r.frontier[0]!;
    expect(row0.slots).toEqual([
      { kind: 'kept', modId: 'PAsymRare', minTierIndex: 2 },
      { kind: 'kept', modId: 'SFill', minTierIndex: 0 },
    ]);
    expect(row0.closeness).toEqual({ dropped: 0, swapped: 0, valueRetained: 1 });
  });

  it('is a valid antichain: each row is strictly farther but strictly likelier', () => {
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    expect(r.frontier.length).toBeGreaterThan(1);
    for (let k = 1; k < r.frontier.length; k++) {
      const prev = r.frontier[k - 1]!;
      const cur = r.frontier[k]!;
      expect(compareCloseness(cur.closeness, prev.closeness)).toBeGreaterThan(0); // farther from the target
      expect(cur.inBudget).toBeGreaterThan(prev.inBudget); // but likelier to land in budget
    }
  });

  it('reports an exact P(in budget) on a commensurable price sheet', () => {
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    for (const a of r.frontier) expect(a.inBudgetMax).toBe(a.inBudget);
  });

  it('a bigger budget never makes an alternative less likely', () => {
    const lean = alternativesFromWhite(data, prices, base, desired, 10).frontier[0]!;
    const rich = alternativesFromWhite(data, prices, base, desired, 100).frontier[0]!;
    expect(rich.inBudget).toBeGreaterThanOrEqual(lean.inBudget);
  });
});

describe('alternativesFromWhite — which same-family swaps survive', () => {
  it('a swap between IDENTICAL-weight siblings never reaches the frontier (dominated)', () => {
    // PSym1 → PSym2 costs exactly the same, so it lands the same P at strictly worse closeness. The
    // dominance rule alone must bin it — there is no special case for "pointless swap" in the search.
    const desired: AlternativeTarget[] = [{ modId: 'PSym1', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    expect(r.frontier.length).toBeGreaterThan(1); // the search really did run and find relaxations
    for (const a of r.frontier) expect(swappedTo(a.slots, 'PSym2')).toBe(false);
  });

  it('a swap between weight-ASYMMETRIC siblings does reach the frontier', () => {
    // PAsymRare (w10) → PAsymCommon (w500) is a 50× swing; no tier relax on PAsymRare can beat it
    // (its own three tiers only sum to 30), so the swap must appear.
    const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    expect(r.frontier.some((a) => swappedTo(a.slots, 'PAsymCommon'))).toBe(true);
  });

  it('every swap is ranked closer than any drop', () => {
    const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    const firstDrop = r.frontier.findIndex((a) => a.closeness.dropped > 0);
    const lastSwap = r.frontier.map((a) => a.closeness.swapped > 0).lastIndexOf(true);
    if (firstDrop >= 0 && lastSwap >= 0) expect(firstDrop).toBeGreaterThan(lastSwap);
  });

  it('never swaps a mod for one of a different family', () => {
    const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    for (const a of r.frontier) {
      for (const s of a.slots) {
        if (s.kind === 'swapped') {
          expect(data.mods.get(s.modId)!.family).toBe(data.mods.get(s.from)!.family);
          expect(data.mods.get(s.modId)!.type).toBe(data.mods.get(s.from)!.type);
        }
      }
    }
  });
});

describe('alternativesFromWhite — value retained', () => {
  it('scores a tier slide by the stat value it still guarantees', () => {
    // PAsymRare's tier floors are 10/20/30. Asking for index 2 (=30) and accepting index 1 (=20) keeps
    // 20/30 of the value on that slot; SFill is untouched (1.0). Mean = (2/3 + 1)/2 = 5/6.
    const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    const slid = r.frontier.find((a) =>
      a.slots[0]!.kind === 'kept' && 'minTierIndex' in a.slots[0]! && a.slots[0].minTierIndex === 1);
    expect(slid).toBeDefined();
    expect(slid!.closeness.valueRetained).toBeCloseTo(5 / 6, 9);
  });

  it('scores a dropped slot as zero value', () => {
    const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    const dropped = r.frontier.find((a) => a.closeness.dropped === 1);
    if (dropped) expect(dropped.closeness.valueRetained).toBeCloseTo(1 / 2, 9); // SFill's 1.0, halved
  });
});

describe('alternativesFromWhite — pinned targets are frozen', () => {
  it('never relaxes, swaps or drops a pinned slot', () => {
    const desired: AlternativeTarget[] = [
      { modId: 'PAsymRare', minTierIndex: 2, pinned: true }, { modId: 'SFill' },
    ];
    const r = alternativesFromWhite(data, prices, base, desired, 20);
    for (const a of r.frontier) {
      expect(a.slots[0]).toEqual({ kind: 'kept', modId: 'PAsymRare', minTierIndex: 2 });
    }
    // …and pinning genuinely constrains: unpinned, the same target does relax that slot.
    const free = alternativesFromWhite(data, prices, base,
      [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }], 20);
    expect(free.frontier.some((a) => !(
      a.slots[0]!.kind === 'kept' && 'minTierIndex' in a.slots[0]! && a.slots[0].minTierIndex === 2
    ))).toBe(true);
  });
});

/**
 * Pinning every slot is not a stricter search — it is no search. All three relaxation moves (tier
 * slide, sibling swap, drop) skip a pinned slot, so the lattice collapses to its root and the frontier
 * to the one row the feature exists to get you past.
 *
 * This is the test that answers "should the pin be on by default?". Measured on this fixture: unpinned
 * the frontier reaches certainty, all-pinned it reports 5.9% and nothing else. A default that does that
 * would read to a user as the panel being broken.
 */
describe('alternativesFromWhite — pinning everything is not a search', () => {
  it('collapses the frontier to the exact target alone', () => {
    const targets = (pin: boolean): AlternativeTarget[] => [
      pin ? { modId: 'PAsymRare', minTierIndex: 2, pinned: true } : { modId: 'PAsymRare', minTierIndex: 2 },
      pin ? { modId: 'SFill', pinned: true } : { modId: 'SFill' },
    ];
    const allPinned = alternativesFromWhite(data, prices, base, targets(true), 20);
    const free = alternativesFromWhite(data, prices, base, targets(false), 20);

    expect(allPinned.frontier).toHaveLength(1);
    expect(allPinned.frontier[0]!.slots).toEqual([
      { kind: 'kept', modId: 'PAsymRare', minTierIndex: 2 },
      { kind: 'kept', modId: 'SFill', minTierIndex: 0 },
    ]);

    // The row that survives is row 0 either way — what pinning destroys is everything reachable.
    expect(free.frontier.length).toBeGreaterThan(1);
    expect(free.frontier[0]!.inBudget).toBeCloseTo(allPinned.frontier[0]!.inBudget, 9);
    const bestFree = Math.max(...free.frontier.map((r) => r.inBudget));
    expect(bestFree).toBeGreaterThan(allPinned.frontier[0]!.inBudget * 10);
  });
});

describe('alternativesFromItem — fractured mods are inherently pinned', () => {
  it('never relaxes, swaps or drops a carved mod, even unpinned by the caller', () => {
    // A fractured mod is physically locked on the item: its tier is already decided and it cannot be
    // removed, so no relaxation of it is even meaningful.
    const start: ItemState = {
      base, level: 100, rarity: 'rare',
      prefixes: [{ modId: 'PSym1', tierName: 't2', fractured: true }],
      suffixes: [{ modId: 'SFill', tierName: 't0' }],
    };
    const desired: AlternativeTarget[] = [{ modId: 'PSym1', minTierIndex: 2 }, { modId: 'SFill' }];
    const r = alternativesFromItem(data, prices, start, desired, 20);
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const a of r.frontier) {
      expect(a.slots[0]).toEqual({ kind: 'kept', modId: 'PSym1', minTierIndex: 2 });
    }
  });

  it('still relaxes the NON-fractured slots around it', () => {
    const start: ItemState = {
      base, level: 100, rarity: 'rare',
      prefixes: [{ modId: 'PSym1', tierName: 't2', fractured: true }],
      suffixes: [],
    };
    const desired: AlternativeTarget[] = [{ modId: 'PSym1', minTierIndex: 2 }, { modId: 'SFill', minTierIndex: 0 }];
    const r = alternativesFromItem(data, prices, start, desired, 20);
    expect(r.frontier[0]!.slots[0]).toEqual({ kind: 'kept', modId: 'PSym1', minTierIndex: 2 });
  });
});

describe('alternatives — search accounting is reported, never silent', () => {
  const desired: AlternativeTarget[] = [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }];

  it('flags truncation when the node cap bites, and not when it does not', () => {
    const capped = alternativesFromWhite(data, prices, base, desired, 20, { maxNodes: 2 });
    expect(capped.truncated).toBe(true);
    expect(capped.nodesEvaluated).toBe(2);

    const full = alternativesFromWhite(data, prices, base, desired, 20, { maxNodes: 5000 });
    expect(full.truncated).toBe(false);
    expect(full.nodesEvaluated).toBeLessThanOrEqual(5000);
  });

  it('stopping early on a certainty is completeness, not truncation', () => {
    // A budget this large makes some relaxation a lock; the search may stop the moment it hits P≈1
    // because nothing looser can beat it — that is a proof, not a cap.
    const r = alternativesFromWhite(data, prices, base, desired, 1e6, { maxNodes: 5000 });
    expect(r.truncated).toBe(false);
    expect(r.frontier[r.frontier.length - 1]!.inBudget).toBeGreaterThan(0.99);
  });

  it('rejects an empty target', () => {
    expect(() => alternativesFromWhite(data, prices, base, [], 20)).toThrow(/no desired mods/i);
  });
});

describe('alternativesFromWhite — real data (Wands, 0.5.0)', () => {
  const real = loadPatch('data/patches/0.5.0');
  const wands = real.bases.get('Wands')!;
  const rprices = loadPrices('data/patches/0.5.0');
  // Declared timeout: walks the whole relaxation lattice on real data, ~6s locally and slower on CI.
  it('never starves the swap/drop classes behind the tier lattice', () => {
    // REGRESSION. Every tier relaxation is lexicographically closer than any swap, and this 3-mod target
    // has 4×11×8 = 352 tier combos — so exploring globally best-first (visit order == output order) burns
    // the whole node budget on tiers and never reaches a single swap or drop. The player was told
    // "20.8% is your best" while dropping one mod sat at ~99%. Exploration is now per edit-class.
    // (Budget is 600ex, not the 30ex this test first used: against the live poe.ninja sheet an Exalt is
    // the unit and a Chaos ~33ex, so 30ex no longer funds a craft where "near-certain" is even on the
    // table — the bug this guards would hide behind a hopeless budget rather than being caught.)
    const desired: AlternativeTarget[] = [
      { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon', minTierIndex: 3 },
      { modId: 'Wands/IncreasedMana', minTierIndex: 10 },
      { modId: 'Wands/WeaponSpellDamage', minTierIndex: 7 },
    ];
    const r = alternativesFromWhite(real, rprices, wands, desired, 600, { level: 82, maxNodes: 200 });
    // The exact item is hopeless even on 600ex — that's the honest row 0…
    expect(r.frontier[0]!.closeness).toEqual({ dropped: 0, swapped: 0, valueRetained: 1 });
    expect(r.frontier[0]!.inBudget).toBeLessThan(0.05);
    // …but the search must still find the near-certain option, which requires reaching an edit class.
    const best = r.frontier[r.frontier.length - 1]!;
    expect(best.inBudget).toBeGreaterThan(0.9);
    expect(best.closeness.dropped + best.closeness.swapped).toBeGreaterThan(0);
  }, 60_000);

  it('surfaces the generic→elemental gem-level swap the weights actually justify', () => {
    // "+1 to Level of all Spell Skills" carries 500 total weight; every elemental sibling in the same
    // IncreaseSocketedGemLevel family carries 2600 — a 5.2× swing. That is exactly the swap a player
    // makes when the generic mod is unaffordable, so it must be on the frontier.
    const desired: AlternativeTarget[] = [
      { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon' }, { modId: 'Wands/IncreasedMana' },
    ];
    const r = alternativesFromWhite(real, rprices, wands, desired, 30, { level: 82, maxNodes: 60 });
    expect(r.frontier.length).toBeGreaterThan(0);
    const swaps = r.frontier.flatMap((a) => a.slots.filter((s) => s.kind === 'swapped'));
    for (const s of swaps) {
      expect(real.mods.get(s.modId)!.family).toBe('IncreaseSocketedGemLevel');
    }
    expect(swaps.length).toBeGreaterThan(0);
  });
});

/**
 * SLOT ALTERNATIVES reach the budget search by EXPANSION — one concrete craft per member, frontiers
 * merged — and not by being handed to the relaxation lattice.
 *
 * That lattice reads `desired` positionally: one entry is one slot it may relax. Handing it a group
 * would let it drop or swap the alternatives against each other, so a target saying "PAsymRare or
 * PAsymCommon, either is fine" would come back offering to swap PAsymRare for PAsymCommon as a
 * near-miss — a relaxation of something the user had already said they did not care about — while
 * separately demanding both be on the item at once.
 */
describe('alternativesFromWhite — a slot with alternatives', () => {
  const group: AlternativeTarget[] = [
    { modId: 'PAsymRare', minTierIndex: 2, slot: 0 },
    { modId: 'PAsymCommon', minTierIndex: 2, slot: 0 },
    { modId: 'SFill', slot: 1 },
  ];

  it('never asks for two members of one slot at the same time', () => {
    const r = alternativesFromWhite(data, prices, base, group, 20);
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const alt of r.frontier) {
      const held = alt.slots.filter((s) => s.kind !== 'dropped').map((s) => s.modId);
      expect(held).not.toEqual(expect.arrayContaining(['PAsymRare', 'PAsymCommon']));
      // …and every row is a real two-slot item, not a lattice artefact.
      expect(alt.slots).toHaveLength(2);
    }
  });

  /**
   * The point of a slot: the frontier gets to use whichever member is easier. PAsymCommon is 50x the
   * weight of PAsymRare, so a target that will accept either must reach odds the rare one alone
   * cannot — otherwise the expansion is running but its results are being thrown away.
   */
  it('reaches odds the harder member alone cannot', () => {
    const rareOnly = alternativesFromWhite(data, prices, base,
      [{ modId: 'PAsymRare', minTierIndex: 2 }, { modId: 'SFill' }], 20);
    const either = alternativesFromWhite(data, prices, base, group, 20);
    const best = (r: { frontier: readonly { inBudget: number }[] }) =>
      Math.max(...r.frontier.map((a) => a.inBudget));
    expect(best(either)).toBeGreaterThan(best(rareOnly));
  });

});

/**
 * The node cap is what bounds this search's wall clock — every node is a full Pareto run, and the
 * default of 200 was chosen against a ~7.3s measurement. A slot must therefore DIVIDE that budget
 * across its expansions rather than hand the whole of it to each: a three-way slot that quietly
 * tripled the wait would be a trade made on the user's behalf, in the one place the user is already
 * saying they are short of something.
 *
 * Needs a lattice big enough for the cap to bind — the synthetic pool above runs dry at 10 nodes, so
 * both behaviours look identical there. Real Wands does not.
 */
describe('alternativesFromWhite — a slot does not multiply the wall clock', () => {
  const real = loadPatch('data/patches/0.5.0');
  const wands = real.bases.get('Wands')!;
  const rprices = loadPrices('data/patches/0.5.0');
  const GEM = 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon';
  const CHAOSGEM = 'Wands/GlobalIncreaseChaosSpellSkillGemLevelWeapon';
  const MANA = 'Wands/IncreasedMana';
  const SPELL = 'Wands/WeaponSpellDamage';

  it('spends no more nodes on a two-way slot than on one mod', () => {
    const one = alternativesFromWhite(real, rprices, wands, [
      { modId: GEM, minTierIndex: 3 }, { modId: MANA, minTierIndex: 10 }, { modId: SPELL, minTierIndex: 7 },
    ], 600, { level: 82, maxNodes: 60 });
    const two = alternativesFromWhite(real, rprices, wands, [
      { modId: GEM, minTierIndex: 3, slot: 0 }, { modId: CHAOSGEM, minTierIndex: 3, slot: 0 },
      { modId: MANA, minTierIndex: 10, slot: 1 }, { modId: SPELL, minTierIndex: 7, slot: 2 },
    ], 600, { level: 82, maxNodes: 60 });

    // The cap has to actually bite, or this test proves nothing about dividing it.
    expect(one.nodesEvaluated).toBeGreaterThan(30);
    expect(two.nodesEvaluated).toBeLessThanOrEqual(one.nodesEvaluated * 1.2);
  });
});

/**
 * THE SCREENING PASS MUST NOT CHANGE THE WINNER.
 *
 * Picking a node's best plan means the highest `P(finish in budget)` over its whole frontier, and
 * `planCostCdf` is expensive — it was 86% of a from-item alternatives run, almost all of it spent
 * proving that plans lose. So each plan is bracketed cheaply first, and one whose bracket tops out
 * below a rival's confirmed floor never gets the full sweep.
 *
 * That is exact, not approximate: `planCostCdf` returns a bracket AROUND the true value at any cell
 * count, so a screening `upper` bounds the truth from above and a settled `lower` bounds it from
 * below. A plan skipped on that comparison genuinely could not have won.
 *
 * "Exact" is a claim about the ANSWER, so the test is on the answer: recompute every candidate plan's
 * CDF at full precision and demand the search reported the best of them. A screen that pruned too
 * hard would report a lower number here, not a crash.
 */
describe('alternativesFromItem — the cost-CDF screen never changes the answer', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadPrices('data/patches/0.5.0');
  const wand = real.bases.get('Wands')!;
  const P = wand.pools.normal.prefixes;
  const S = wand.pools.normal.suffixes;
  const held: ItemState = {
    base: wand, level: 82, rarity: 'rare',
    prefixes: [{ modId: P[0]!, tierName: real.mods.get(P[0]!)!.tiers[0]!.name }], suffixes: [],
  };
  const want: AlternativeTarget[] = [P[1]!, S[0]!].map((modId) => {
    const n = real.mods.get(modId)!.tiers.length;
    return { modId, minTierIndex: Math.max(0, n - 3) };
  });
  const BUDGET = 2_000;

  it('reports the best plan on the winning node’s own frontier, not merely a good one', () => {
    const r = alternativesFromItem(real, rp, held, want, BUDGET, { maxNodes: 40 });
    expect(r.frontier.length).toBeGreaterThan(0);
    const top = r.frontier[0]!;
    // Rebuild that node's craft and score EVERY plan at full precision — no screen involved.
    const targets = top.slots.flatMap((s) => (s.kind === 'dropped' ? [] : [{ modId: s.modId, minTierIndex: s.minTierIndex }]));
    const res = optimizeFromItem(real, rp, held, targets);
    const best = Math.max(...res.frontier.map((p) => planCostCdf(rp, p.result, p.steps, BUDGET).lower));
    expect(top.inBudget).toBeCloseTo(best, 12);
  });

  /**
   * And the screen must actually be doing something, or the test above proves nothing: a search that
   * skipped no plans would pass it trivially. The winning node's frontier has to hold rivals the
   * screen could have pruned — several plans, spanning a real range of in-budget chances.
   */
  it('has rivals to prune, so the guarantee is not vacuous', () => {
    const r = alternativesFromItem(real, rp, held, want, BUDGET, { maxNodes: 40 });
    const top = r.frontier[0]!;
    const targets = top.slots.flatMap((s) => (s.kind === 'dropped' ? [] : [{ modId: s.modId, minTierIndex: s.minTierIndex }]));
    const res = optimizeFromItem(real, rp, held, targets);
    expect(res.frontier.length).toBeGreaterThan(1);
    const scores = res.frontier.map((p) => planCostCdf(rp, p.result, p.steps, BUDGET).lower);
    expect(Math.max(...scores)).toBeGreaterThan(Math.min(...scores));
  });
});

/**
 * The screen's correctness argument, isolated from the data.
 *
 * End-to-end the screen is far too tight to expose a mistake — on real crafts its bracket is a few
 * parts in ten thousand, so pruning on the wrong bound picks the same plans anyway and a broken
 * version passes every test above. That is exactly the case for testing the rule rather than the
 * result: `bestByBudget` takes its two scorers as arguments, so a test can hand it a deliberately
 * useless screen and see whether the answer survives.
 */
describe('bestByBudget — the screen may skip, never decide', () => {
  const plan = (probability: number): ParetoPlan =>
    ({ steps: [], result: { steps: [], total: probability }, cost: { expected: 1 / probability, perAttempt: 1, expectedAttempts: 1 / probability }, probability });
  // Truth: the SECOND plan is the best buy. Nothing about the frontier order gives that away.
  const truth = new Map([[0.1, 0.20], [0.2, 0.90], [0.3, 0.50]]);
  const frontier = [plan(0.1), plan(0.2), plan(0.3)];
  const settle = (p: ParetoPlan): CostCdfBounds =>
    ({ lower: truth.get(p.probability)!, upper: truth.get(p.probability)!, exact: true });

  it('finds the best plan when the screen is exact', () => {
    const r = bestByBudget(frontier, settle, settle);
    expect(r.plan).toBe(frontier[1]);
    expect(r.lower).toBeCloseTo(0.9, 12);
  });

  /**
   * A screen so coarse it brackets [0,1] for everything orders nothing and prunes nothing — the search
   * degrades to the exhaustive scan it replaced. That is the RIGHT failure mode, and it is the one
   * that separates a safe screen from an unsafe one: prune on the screen's ceiling and this still
   * finds the winner; prune on its floor and the winner is cut before it is ever settled.
   */
  it('still finds the best plan when the screen is useless', () => {
    const useless = (): CostCdfBounds => ({ lower: 0, upper: 1, exact: false });
    const r = bestByBudget(frontier, useless, settle);
    expect(r.plan).toBe(frontier[1]);
    expect(r.lower).toBeCloseTo(0.9, 12);
  });

  /**
   * A screen that ranks the winner LAST costs extra sweeps, never the answer — as long as its ceiling
   * really is a ceiling. That is the contract, and it is the only thing `bestByBudget` asks of a
   * screen: `screen(x).upper >= truth(x)`. `planCostCdf` satisfies it at every cell count by
   * construction, since it returns a bracket around the true value rather than an estimate of it.
   */
  it('is not fooled by a valid screen that orders the frontier backwards', () => {
    // Valid (barely above the truth for every plan) but ranks the best plan last.
    const backwards = (p: ParetoPlan): CostCdfBounds =>
      ({ lower: 0, upper: 1 - 0.001 * truth.get(p.probability)!, exact: false });
    const r = bestByBudget(frontier, backwards, settle);
    expect(r.plan).toBe(frontier[1]);
    expect(r.lower).toBeCloseTo(0.9, 12);
  });

  it('reports nothing for an empty frontier rather than an arbitrary row', () => {
    expect(bestByBudget([], settle, settle).plan).toBeUndefined();
  });

  it('keeps the earlier frontier row on a tie, as the plain scan did', () => {
    const flat = (): CostCdfBounds => ({ lower: 0.4, upper: 0.4, exact: true });
    expect(bestByBudget(frontier, flat, flat).plan).toBe(frontier[0]);
  });
});
