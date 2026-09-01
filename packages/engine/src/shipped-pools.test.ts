import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemState } from './index.ts';
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
  it('every essence-pool entry is a regular OR perfect essence mod with ≥1 tier', () => {
    let regular = 0; let perfect = 0;
    for (const base of data.bases.values()) {
      for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
        const m = data.mods.get(id);
        expect(m, id).toBeDefined();
        expect(['essence', 'perfect_essence']).toContain(m!.source);
        expect(m!.tiers.length).toBeGreaterThan(0);
        if (m!.source === 'essence') regular++; else perfect++;
      }
    }
    expect(regular).toBeGreaterThan(0); // regular essence pool populated (regression guard vs empty state)
    expect(perfect).toBeGreaterThan(0); // perfect essence pool populated
  });

  it('perfect essences are single-tier deterministic mods that force-add onto a Rare (P=1)', () => {
    // find a base with a perfect-essence entry
    let mod;
    outer: for (const base of data.bases.values())
      for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
        const m = data.mods.get(id)!;
        if (m.source === 'perfect_essence') { mod = m; break outer; }
      }
    expect(mod, 'a perfect-essence mod exists in 0.5.0').toBeDefined();
    // The `!`s are NOT redundant: `expect(...).toBeDefined()` is a runtime assertion vitest cannot
    // express as a type predicate, so `mod` stays `Mod | undefined` to the compiler. ESLint's
    // no-unnecessary-type-assertion disagrees because it reads this file against a project where the
    // narrowing happens to hold; the engine's own tsconfig is stricter and is the one CI runs.
    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    expect(mod!.tiers.length).toBe(1);
    expect(mod!.tiers[0]!.weight).toBe(0); // deterministic — no roll weight
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
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

// The desecrated spawn weight cannot be read off poe2db — it publishes none and reports a literal 1 for
// every row, which taken at face value would make a bone produce a desecrated mod about 1 time in
// 121,510 on a Body Armour. As of 2026-08-24 the shipped value is MEASURED rather than assumed: 40
// bones on an empty Rare Helmets_dex_int showed 120 modifiers, 22 of them carved, which
// scripts/desecrate-weight.mts inverts to a maximum likelihood of 2,512 (range 1,995-3,981), rounded
// to 2,500. The previous 1,000 predicted 7.6% per draw against 18.3% observed.
//
// This assertion earned its keep immediately: the sample was first misread as "22 of 40 OFFERS held a
// carved mod", shipped at 4,000, and corrected a commit later — and this is the test that has to move
// deliberately for that to happen, rather than the number drifting quietly.
//
// Nothing in the app would fail loudly if a refresh quietly restored poe2db's 1 either, so this asserts
// the constant. If it changes again, change it HERE and in tools/refresh/apply_pools.mjs together, and
// say so in docs/validation.md D4 and the UI note.
describe('the measured desecrated weight', () => {
  const DESECRATED_ASSUMED_WEIGHT = 2500;

  it('is applied uniformly to every desecrated mod in the shipped snapshot', () => {
    const weights = new Set<number>();
    for (const mod of data.mods.values()) {
      if (mod.source !== 'desecrated') continue;
      for (const t of mod.tiers) weights.add(t.weight);
    }
    expect(weights.size).toBeGreaterThan(0);
    expect([...weights]).toEqual([DESECRATED_ASSUMED_WEIGHT]);
  });

  const modsFileSource = (): string =>
    (JSON.parse(readFileSync('data/patches/0.5.0/mods.json', 'utf8')) as { source: string }).source;

  it('is declared as an assumption in the snapshot\u2019s own provenance', () => {
    // A future reader must be able to find out that this number was chosen, not measured.
    expect(modsFileSource()).toMatch(/DESECRATED WEIGHTS ARE AN ASSUMPTION/i);
    expect(modsFileSource()).toMatch(/validation\.md D4/i);
  });
});
