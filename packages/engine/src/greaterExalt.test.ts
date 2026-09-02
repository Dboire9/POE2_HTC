// Omen of Greater Exaltation: "your next Exalted Orb will add two random modifiers"
// (poe2db, internal id `OmenOnExaltAddTwoMods`, traced 2026-09-02).
//
// Hand-computed against a tiny synthetic pool, because the whole point of the mechanic is the
// INTERACTION between the two draws — the second one sees a pool the first has already shrunk — and
// a number that came from the implementation would confirm nothing about that. Every expectation
// below is written out as the arithmetic it comes from.

import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from './index.ts';
import { greaterExaltProbability } from './index.ts';

// Deliberately uneven weights: with a uniform pool the "either order" sum and a single order agree
// by symmetry, and the test would pass against an implementation that only counted one order.
// P4/S3/S4 exist so a SIDE can be filled while reachable mods remain in the pool. Without them,
// filling the prefix side also exhausts every prefix family, and a test aimed at the 3-per-side cap
// passes for the wrong reason — which is exactly what the first version of this file did.
const W: Record<string, number> = { P1: 300, P2: 200, P3: 500, P4: 250, S1: 100, S2: 400, S3: 150, S4: 350 };
const tier = (name: string, ilvl: number, weight: number) => ({ name, ilvl, weight, ranges: [] });
const mod = (id: string, type: 'prefix' | 'suffix', tiers = [tier('t1', 1, W[id]!)]): Mod =>
  ({ id, source: 'normal', type, family: `fam_${id}`, tags: [], text: id, tiers });
const ALL = [
  mod('P1', 'prefix'), mod('P2', 'prefix'), mod('P3', 'prefix'), mod('P4', 'prefix'),
  mod('S1', 'suffix'), mod('S2', 'suffix'), mod('S3', 'suffix'), mod('S4', 'suffix'),
];
const base: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: {
    normal: { prefixes: ['P1', 'P2', 'P3', 'P4'], suffixes: ['S1', 'S2', 'S3', 'S4'] },
    desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
  },
};
const withMods = (extra: Mod[] = []): PatchData =>
  ({ patch: 't', mods: new Map([...ALL, ...extra].map((m) => [m.id, m])), bases: new Map([['B', base]]) });
const data = withMods();

const TOTAL = 300 + 200 + 500 + 250 + 100 + 400 + 150 + 350; // 2250 — every mod in the pool

const item = (prefixes: string[] = [], suffixes: string[] = [], rarity: ItemState['rarity'] = 'rare'): ItemState => ({
  base, level: 100, rarity,
  prefixes: prefixes.map((modId) => ({ modId, tierName: 't1' })),
  suffixes: suffixes.map((modId) => ({ modId, tierName: 't1' })),
});
const t = (modId: string, minTierIndex?: number) => (minTierIndex === undefined ? { modId } : { modId, minTierIndex });

describe('Omen of Greater Exaltation — two draws on one orb', () => {
  it('sums BOTH orders on an empty Rare', () => {
    // P1 then S1: (300/1500) · (100/1200)   [P1's 300 leaves the pool with its family]
    // S1 then P1: (100/1500) · (300/1400)
    const expected = (300 / TOTAL) * (100 / (TOTAL - 300)) + (100 / TOTAL) * (300 / (TOTAL - 100));
    expect(greaterExaltProbability(data, item(), [t('P1'), t('S1')])).toBeCloseTo(expected, 12);
    // Order of `adds` is not part of the question the caller is asking.
    expect(greaterExaltProbability(data, item(), [t('S1'), t('P1')])).toBeCloseTo(expected, 12);
  });

  it('is strictly better than the two Exalts it replaces, and by exactly the second order', () => {
    // A fixed two-step plan commits to an order; the omen gets both. That IS the mechanic's value,
    // so pin the identity rather than a bare inequality.
    const firstOrder = (300 / TOTAL) * (100 / (TOTAL - 300));
    const both = greaterExaltProbability(data, item(), [t('P1'), t('S1')]);
    expect(both).toBeGreaterThan(firstOrder);
    expect(both - firstOrder).toBeCloseTo((100 / TOTAL) * (300 / (TOTAL - 100)), 12);
  });

  it('two prefixes draw from the same combined pool, minus each other', () => {
    const expected = (300 / TOTAL) * (200 / (TOTAL - 300)) + (200 / TOTAL) * (300 / (TOTAL - 200));
    expect(greaterExaltProbability(data, item(), [t('P1'), t('P2')])).toBeCloseTo(expected, 12);
  });

  it('a FULL side is out of the pool even though its mods are still reachable', () => {
    // Three prefixes held ⇒ the prefix side is capped, so P4 — whose family is free and whose weight
    // is 250 — cannot be drawn by either draw. The suffix pool alone is 100+400+150+350 = 1000.
    // This is the test that separates the 3-per-side cap from family exclusion: P4 is excluded by the
    // cap ONLY. Start the recursion's side counts at zero instead of the item's and it fails.
    const held = item(['P1', 'P2', 'P3'], []);
    const expected = (100 / 1000) * (400 / (1000 - 100)) + (400 / 1000) * (100 / (1000 - 400));
    expect(greaterExaltProbability(data, held, [t('S1'), t('S2')])).toBeCloseTo(expected, 12);
  });

  it('a family already on the item is out of the pool for both draws', () => {
    // P3 held ⇒ its 500 leaves the denominator entirely; P1 and S1 then draw from 1750.
    const held = item(['P3'], []);
    const pool = TOTAL - 500;
    const expected = (300 / pool) * (100 / (pool - 300)) + (100 / pool) * (300 / (pool - 100));
    expect(greaterExaltProbability(data, held, [t('P1'), t('S1')])).toBeCloseTo(expected, 12);
  });
});

describe('Omen of Greater Exaltation — what it refuses', () => {
  it('needs a Rare item', () => {
    for (const rarity of ['normal', 'magic'] as const) {
      expect(greaterExaltProbability(data, item([], [], rarity), [t('P1'), t('S1')])).toBe(0);
    }
  });

  it('scores 0 with only ONE free slot, and the recursion is what refuses it', () => {
    // 3 prefixes + 2 suffixes = five mods, one free suffix slot. S3 and S4 are both reachable and
    // both need that slot, so the second draw has nowhere to go. Deliberately NOT tested against a
    // pair whose families are already held — that would pass without the slot logic doing anything,
    // which is the mistake the first version of this test made.
    const oneLeft = item(['P1', 'P2', 'P3'], ['S1', 'S2']);
    expect(oneLeft.prefixes.length + oneLeft.suffixes.length).toBe(5);
    expect(greaterExaltProbability(data, oneLeft, [t('S3'), t('S4')])).toBe(0);
    // …and it is the CAP that does it: with the same item and two slots' worth of room, they land.
    const twoLeft = item(['P1', 'P2', 'P3'], ['S1']);
    expect(greaterExaltProbability(data, twoLeft, [t('S3'), t('S4')])).toBeGreaterThan(0);
  });

  it('refuses two mods of ONE family — they can never co-exist', () => {
    const sibling = mod('P1b', 'prefix');
    const shared: Mod = { ...sibling, family: 'fam_P1' }; // same family as P1
    const d = withMods([shared]);
    const withPool: ItemBase = { ...base, pools: { ...base.pools, normal: { prefixes: ['P1', 'P2', 'P3', 'P1b'], suffixes: ['S1', 'S2'] } } };
    const d2: PatchData = { ...d, bases: new Map([['B', withPool]]) };
    const start: ItemState = { base: withPool, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    expect(greaterExaltProbability(d2, start, [t('P1'), t('P1b')])).toBe(0);
  });

  it('refuses the same mod twice, and any target count other than two', () => {
    expect(greaterExaltProbability(data, item(), [t('P1'), t('P1')])).toBe(0);
    expect(greaterExaltProbability(data, item(), [t('P1')] as never)).toBe(0);
    expect(greaterExaltProbability(data, item(), [t('P1'), t('P2'), t('S1')] as never)).toBe(0);
  });

  it('refuses a mod outside the base’s normal pool', () => {
    const desecrated = { ...mod('D1', 'prefix'), source: 'desecrated' as const };
    const d = withMods([desecrated]);
    expect(greaterExaltProbability(d, item(), [t('P1'), t('D1')])).toBe(0);
  });
});

describe('Omen of Greater Exaltation — orb strength and tier targets', () => {
  // A two-tier mod: t2 is the low roll (ilvl 1), t1 the high one (ilvl 60). Tiers ascend by ilvl.
  const hiLo = mod('P2', 'prefix', [tier('lo', 1, 150), tier('hi', 60, 50)]);
  const d = withMods([hiLo]);
  const TOT = TOTAL; // P2's two tiers still sum to 200, so the pool total is unchanged

  it('a Greater orb raises the floor for BOTH draws', () => {
    // floor 35 ⇒ every ilvl-1 tier is out. Only P2's `hi` (50) survives... and P1/S1 vanish with it,
    // so the pair can no longer land at all.
    expect(greaterExaltProbability(d, item(), [t('P1'), t('S1')], { currencyTier: 'greater' })).toBe(0);
  });

  it('a tier requirement narrows the NUMERATOR but not the pool', () => {
    // Asking for P2 at index 1 (`hi`, weight 50) keeps the denominator at P2's full 200: a roll of
    // `lo` still lands P2 and spends the family — it just fails the craft. That asymmetry is the
    // thing most likely to be got wrong, so it is pinned on its own.
    const strict = (50 / TOT) * (100 / (TOT - 200)) + (100 / TOT) * (50 / (TOT - 100));
    expect(greaterExaltProbability(d, item(), [t('P2', 1), t('S1')])).toBeCloseTo(strict, 12);
    const loose = (200 / TOT) * (100 / (TOT - 200)) + (100 / TOT) * (200 / (TOT - 100));
    expect(greaterExaltProbability(d, item(), [t('P2', 0), t('S1')])).toBeCloseTo(loose, 12);
    expect(strict).toBeLessThan(loose);
  });

  it('an unreachable tier scores 0 rather than falling back to any tier', () => {
    const lowLevel: ItemState = { ...item(), level: 30 }; // caps out below `hi`'s ilvl 60
    expect(greaterExaltProbability(d, lowLevel, [t('P2', 1), t('S1')])).toBe(0);
  });
});

// ── Monte-Carlo, on the SHIPPED data ─────────────────────────────────────────────────────────────
// The hand-computed tests above pin the arithmetic on a five-mod pool. They cannot catch a mistake
// that only shows at scale — a tier floor applied to the numerator but not the denominator, say, on a
// mod with eight tiers. So this samples the mechanic as a player experiences it (two weighted draws,
// families excluded between them, three per side) against a real Wands pool and compares.
//
// It simulates the RULE, not the implementation: the loop below is written from the item text, and
// shares no code with `greaterExaltProbability`. That independence is the whole point — a simulation
// that called the function it validates would agree with any bug it had.

import { loadPatch } from './loadPatch.ts';
import { familiesOf, modTierWeight } from './pool.ts';
import { CURRENCY_FLOOR } from './types.ts';

const shipped = loadPatch('data/patches/0.5.0');
const wands = shipped.bases.get('Wands')!;
const LEVEL = 82;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** One omened Exalted Orb on an empty Rare Wand: two draws, at `floor`. Returns what landed. */
function simDouble(rng: () => number, floor: number): Set<string> {
  const entry = (id: string, side: 'prefix' | 'suffix') => {
    const m = shipped.mods.get(id)!;
    return { id, side, families: familiesOf(m), w: modTierWeight(m, floor, LEVEL, 0) };
  };
  const pre = wands.pools.normal.prefixes.map((id) => entry(id, 'prefix')).filter((x) => x.w > 0);
  const suf = wands.pools.normal.suffixes.map((id) => entry(id, 'suffix')).filter((x) => x.w > 0);
  const occ = new Set<string>();
  const out = new Set<string>();
  let pf = 0; let sf = 0;
  for (let d = 0; d < 2; d++) {
    const pool = [...(pf < 3 ? pre : []), ...(sf < 3 ? suf : [])].filter((x) => !x.families.some((f) => occ.has(f)));
    let tot = 0;
    for (const x of pool) tot += x.w;
    if (tot === 0) break;
    let r = rng() * tot;
    let pick = pool[pool.length - 1]!;
    for (const x of pool) { r -= x.w; if (r < 0) { pick = x; break; } }
    for (const f of pick.families) occ.add(f);
    out.add(pick.id);
    if (pick.side === 'prefix') pf++; else sf++;
  }
  return out;
}

const RUNS = 400_000;
const mc = (targets: string[], floor: number, seed = 7): number => {
  const rng = mulberry32(seed);
  let ok = 0;
  for (let i = 0; i < RUNS; i++) { const got = simDouble(rng, floor); if (targets.every((t) => got.has(t))) ok++; }
  return ok / RUNS;
};
const tol = (p: number) => 4 * Math.sqrt(Math.max(p * (1 - p), 1e-7) / RUNS) + 1e-4;

describe('greaterExaltProbability — matches Monte-Carlo on the shipped 0.5.0 Wands pool', () => {
  const empty: ItemState = { base: wands, level: LEVEL, rarity: 'rare', prefixes: [], suffixes: [] };
  const pair: [string, string][] = [
    ['Wands/IncreasedMana', 'Wands/Intelligence'],                 // one per side
    ['Wands/IncreasedMana', 'Wands/WeaponSpellDamage'],            // both prefixes
    ['Wands/Intelligence', 'Wands/LocalAttributeRequirements'],    // both suffixes
  ];
  for (const [a, b] of pair) {
    it(`${a.split('/')[1]} + ${b.split('/')[1]}`, () => {
      const analytic = greaterExaltProbability(shipped, empty, [{ modId: a }, { modId: b }]);
      expect(analytic).toBeGreaterThan(0);
      expect(Math.abs(analytic - mc([a, b], 0))).toBeLessThan(tol(analytic));
    });
  }

  it('a Greater orb’s ilvl floor moves the sampled odds too', () => {
    // The floor changes the pool the simulation draws from, so this is a real check on the FLOOR
    // reaching the denominator — not only the numerator, which is the easy half to get right.
    const a = 'Wands/IncreasedMana';
    const b = 'Wands/Intelligence';
    const analytic = greaterExaltProbability(shipped, empty, [{ modId: a }, { modId: b }], { currencyTier: 'greater' });
    expect(analytic).toBeGreaterThan(0);
    expect(CURRENCY_FLOOR.greater).toBe(35);
    expect(Math.abs(analytic - mc([a, b], CURRENCY_FLOOR.greater))).toBeLessThan(tol(analytic));
    // …and it is a DIFFERENT number from the base-strength one, or the test above would pass for free.
    expect(analytic).not.toBeCloseTo(greaterExaltProbability(shipped, empty, [{ modId: a }, { modId: b }]), 6);
  });
});
