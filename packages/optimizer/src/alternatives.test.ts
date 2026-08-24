import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import type { AlternativeTarget, SlotChange } from './alternatives.ts';
import { alternativesFromItem, alternativesFromWhite, compareCloseness } from './alternatives.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';

// Synthetic pool built to isolate the two swap regimes that decide this feature's whole design:
//   FSym  — PSym1 / PSym2: same family, IDENTICAL weights ⇒ swapping buys nothing ⇒ must stay off the
//           frontier (this is the real WeaponDamageTypePrefix case: 5 siblings, all weight 2550).
//   FAsym — PAsymRare (w10/tier) / PAsymCommon (w500/tier): a 50× swing ⇒ the swap must surface (the
//           real IncreaseSocketedGemLevel case: 500 vs 2600).
// All tiers sit at ilvl 1 so nothing is level-gated and the orb-strength axis stays trivial.
const mod = (id: string, type: 'prefix' | 'suffix', family: string, tiers: { w: number; v: number }[]): Mod => ({
  id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id,
  tiers: tiers.map((t, i) => ({ name: `t${i}`, ilvl: 1, weight: t.w, ranges: [[t.v, t.v]], stats: [] })),
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
      a.slots[0]!.kind === 'kept' && 'minTierIndex' in a.slots[0]! && a.slots[0]!.minTierIndex === 1);
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
      a.slots[0]!.kind === 'kept' && 'minTierIndex' in a.slots[0]! && a.slots[0]!.minTierIndex === 2
    ))).toBe(true);
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
