import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import { TABLET_CATEGORY } from '../../engine/src/types.ts';
import { desecrationBoneFor } from '../../engine/src/probability.ts';
import { pricesForBase } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';

// Precursor Tablets as the data ships them (tools/refresh/apply_tablets.mjs), against the rolling data
// their weights come from (data/tablets/morce-faster.json — Morce Faster's three sheets).

const data = loadPatch('data/patches/0.5.0');
interface MorceFile {
  readonly weights: Record<string, { readonly weight: number; readonly basis: string; readonly seen: number }>;
  readonly tablets: Record<string, { readonly counts: Record<string, number> }>;
}
const morce = JSON.parse(readFileSync('data/tablets/morce-faster.json', 'utf8')) as MorceFile;
const TABLETS = ['Tablets_ritual', 'Tablets_overseer', 'Tablets_temple'] as const;

/**
 * The upper 0.1% point of a chi-square with `k` degrees of freedom, by Wilson–Hilferty — close to three
 * figures across the 12–19 degrees of freedom here, which is all a data check needs.
 */
const chiSquare999 = (k: number): number => k * (1 - 2 / (9 * k) + 3.0902 * Math.sqrt(2 / (9 * k))) ** 3;

describe('Precursor Tablets — the shipped data', () => {
  it('ships Ritual, Overseer and Temple, each Rare at 2 prefixes + 2 suffixes and no crafted modifier', () => {
    const tablets = [...data.bases.values()].filter((b) => b.category === TABLET_CATEGORY);
    expect(tablets.map((b) => [b.id, b.name])).toEqual([
      ['Tablets_ritual', 'Ritual Tablet'], ['Tablets_overseer', 'Overseer Tablet'], ['Tablets_temple', 'Temple Tablet'],
    ]);
    for (const b of tablets) {
      expect(b.limits).toEqual({ prefixes: 2, suffixes: 2, crafted: 0 });
      expect(b.pools.desecrated).toEqual({ prefixes: [], suffixes: [] });
      expect(b.pools.essence).toEqual({ prefixes: [], suffixes: [] });
    }
  });

  it('lists exactly the modifiers Morce Faster saw on each tablet, and no other', () => {
    for (const id of TABLETS) {
      const pools = data.bases.get(id)!.pools.normal;
      expect([...pools.prefixes, ...pools.suffixes].sort()).toEqual(Object.keys(morce.tablets[id]!.counts).sort());
    }
  });

  it('every tablet modifier is one tier at level 1, weighted exactly as morce-faster.json says', () => {
    for (const [id, w] of Object.entries(morce.weights)) {
      const mod = data.mods.get(id)!;
      expect(mod.tiers).toHaveLength(1);
      expect(mod.tiers[0]!.ilvl).toBe(1);
      expect(mod.tiers[0]!.weight).toBe(w.weight);
    }
  });

  /**
   * The weights have to FIT the counts they came from, side by side, tablet by tablet — which is what
   * catches a weight typed against the wrong modifier, or a sheet row matched to the wrong one. Every
   * weight is Morce Faster's own estimate or rounded to his ladder, except one his three sheets reject
   * outright (of Undertaking), so a clean fit is the claim the file makes.
   */
  it('fits Morce Faster’s counts on every tablet side (chi-square, 99.9%)', () => {
    for (const id of TABLETS) {
      const counts = morce.tablets[id]!.counts;
      const pools = data.bases.get(id)!.pools.normal;
      for (const side of [pools.prefixes, pools.suffixes]) {
        const n = side.reduce((s, m) => s + counts[m]!, 0);
        const total = side.reduce((s, m) => s + data.mods.get(m)!.tiers[0]!.weight, 0);
        let chi = 0;
        for (const m of side) {
          const expected = (n * data.mods.get(m)!.tiers[0]!.weight) / total;
          chi += (counts[m]! - expected) ** 2 / expected;
        }
        expect(chi, `${id} ${side === pools.prefixes ? 'prefixes' : 'suffixes'}`).toBeLessThan(chiSquare999(side.length - 1));
      }
    }
  });
});

describe('Precursor Tablets — no bone desecrates one', () => {
  it('has no bone, and no Desecration price survives for it — not even the sheet’s flat fallback', () => {
    expect(desecrationBoneFor(TABLET_CATEGORY)).toBeUndefined();
    const prices = pricesForBase(loadFrozenPrices(), data.bases.get('Tablets_ritual')!);
    expect(prices.currency['desecrate']).toBeUndefined();
    expect(prices.currency['desecrate_ancient']).toBeUndefined();
  });

  /** Measured before this: five of seven tablet crafts routed through a Desecration, at a third of the cost. */
  it('the true-cost policy never desecrates a tablet', () => {
    const ritual = data.bases.get('Tablets_ritual')!;
    const r = markovFromItem(data, loadFrozenPrices(), whiteItem(ritual, 100),
      [{ modId: 'Tablets/MapDroppedItemRarityIncrease' }, { modId: 'Tablets/RitualTributeIncrease' }], { restartCost: 1 });
    expect(r.feasible).toBe(true);
    expect([...r.policy.values()].some((a) => a.currency === 'desecrate')).toBe(false);
  });
});
