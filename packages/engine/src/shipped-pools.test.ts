import { describe, it, expect } from 'vitest';
import type { ItemState, Mod } from './index.ts';
import { loadPatch, essenceForcedProbability, desecrationProbability, desecrationBossProbability } from './index.ts';
import type { DesecrationBossOmen } from './probability.ts';

// The essence + desecrated pools the app SHIPS (0.5.0, built from poe2db by tools/refresh/apply_pools.mjs).
// Unlike the hand-computed synthetic tests, these exercise the real shipped data so a bad refresh (empty
// pools, mis-sourced mods, lost boss tags) is caught. Mods are looked up DYNAMICALLY by pool/source/tag
// so the tests survive a re-refresh (ids like `.../Desecrated_X_2` are order-dependent — never hardcode).

const data = loadPatch('data/patches/0.5.0');
const item = (baseId: string, rarity: ItemState['rarity']): ItemState =>
  ({ base: data.bases.get(baseId)!, level: 100, rarity, prefixes: [], suffixes: [] });

// Omen -> boss tag: Blackblooded=Kurgal, Liege=Amanamu, Sovereign=Ulaman (see desecrationBossProbability).
const BOSS_OMEN: Record<string, DesecrationBossOmen> = {
  kurgal_mod: 'blackblooded', amanamu_mod: 'liege', ulaman_mod: 'sovereign',
};

describe('0.5.0 shipped essence pool', () => {
  it('every base with essence entries resolves them to source=essence mods with ≥1 level tier', () => {
    let seen = 0;
    for (const base of data.bases.values()) {
      for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
        const m = data.mods.get(id);
        expect(m, id).toBeDefined();
        expect(m!.source).toBe('essence');
        expect(m!.tiers.length).toBeGreaterThan(0);
        seen++;
      }
    }
    expect(seen).toBeGreaterThan(0); // the pool is actually populated (regression guard vs the empty state)
  });

  it('a regular essence deterministically forces its mod (P=1) onto a Magic item; 0 on white/rare', () => {
    const wands = data.bases.get('Wands')!;
    const id = wands.pools.essence.prefixes[0] ?? wands.pools.essence.suffixes[0]!;
    // tier 0 is the lowest-ilvl (Lesser) level → within an ilvl-100 item.
    expect(essenceForcedProbability(data, item('Wands', 'magic'), id, 0)).toBe(1);
    expect(essenceForcedProbability(data, item('Wands', 'normal'), id, 0)).toBe(0); // white: essences don't apply
    expect(essenceForcedProbability(data, item('Wands', 'rare'), id, 0)).toBe(0);   // rare: regular essences don't apply
  });
});

describe('0.5.0 shipped desecrated pool', () => {
  const firstDesecratedPrefix = (): Mod => {
    for (const base of data.bases.values())
      for (const id of base.pools.desecrated.prefixes) return data.mods.get(id)!;
    throw new Error('no desecrated prefixes in 0.5.0');
  };

  it('every desecrated entry resolves to a source=desecrated mod with a positive weight', () => {
    let seen = 0;
    for (const base of data.bases.values())
      for (const id of [...base.pools.desecrated.prefixes, ...base.pools.desecrated.suffixes]) {
        const m = data.mods.get(id);
        expect(m, id).toBeDefined();
        expect(m!.source).toBe('desecrated');
        expect(m!.tiers[0]!.weight).toBeGreaterThan(0); // desecration draws by weight; 0 would be a bug
        seen++;
      }
    expect(seen).toBeGreaterThan(0);
  });

  it('plain desecration draws a desecrated mod from the combined pool with positive probability', () => {
    const wands = data.bases.get('Wands')!;
    const id = wands.pools.desecrated.prefixes[0]!;
    expect(desecrationProbability(data, item('Wands', 'rare'), id)).toBeGreaterThan(0);
  });

  it('a boss omen picks uniformly among that boss’s desecrated mods of the slot (1/count)', () => {
    const wands = data.bases.get('Wands')!;
    const prefixes = wands.pools.desecrated.prefixes.map((i) => data.mods.get(i)!);
    const tagged = prefixes.find((m) => m.tags.some((t) => t in BOSS_OMEN));
    expect(tagged, 'a Wands desecrated prefix carries a boss tag').toBeDefined();
    const bossTag = tagged!.tags.find((t) => t in BOSS_OMEN)!;
    const count = prefixes.filter((m) => m.tags.includes(bossTag)).length;
    const p = desecrationBossProbability(data, item('Wands', 'rare'), tagged!.id, { omen: BOSS_OMEN[bossTag]! });
    expect(p).toBeCloseTo(1 / count, 12);
    // Under a DIFFERENT boss's omen the same mod is unreachable.
    const otherOmen = Object.values(BOSS_OMEN).find((o) => o !== BOSS_OMEN[bossTag]);
    expect(desecrationBossProbability(data, item('Wands', 'rare'), tagged!.id, { omen: otherOmen! })).toBe(0);
  });
});
