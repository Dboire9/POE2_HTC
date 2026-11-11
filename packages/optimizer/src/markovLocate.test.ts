import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { whiteItem } from '../../engine/src/item.ts';
import type { ItemState, PlacedMod } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem, type MarkovResult } from './markovFromItem.ts';
import { keyOfItem } from './markovLocate.ts';
import type { TierTarget } from './optimize.ts';

// Craft along re-syncs from a pasted item by placing it in the solved table (`keyOfItem`). The key it
// finds must be the key the SOLVE wrote for that item — the solve placed its own start, and lists every
// clean starting item it can price (`holdings`), so both are checked against it directly.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
const rings = data.bases.get('Rings')!;
const top = (id: string): number => data.mods.get(id)!.tiers.length - 1;
const tierName = (id: string, idx: number): string => data.mods.get(id)!.tiers[idx]!.name;

const solveFromWhite = (base = wands, targets: TierTarget[]): MarkovResult =>
  markovFromItem(data, prices, whiteItem(base, 82), targets, { restartCost: 0, solver: 'policy', keepRoutes: true });

/** A clean item holding `ids`, each at its best tier. */
const itemWith = (base: typeof wands, ids: readonly string[], rarity: 'magic' | 'rare'): ItemState => {
  const placed = (id: string): PlacedMod => ({ modId: id, tierName: tierName(id, top(id)) });
  const mods = ids.map((id) => ({ id, type: data.mods.get(id)!.type }));
  return {
    base, level: 82, rarity,
    prefixes: mods.filter((m) => m.type === 'prefix').map((m) => placed(m.id)),
    suffixes: mods.filter((m) => m.type === 'suffix').map((m) => placed(m.id)),
  };
};

const CASTER: TierTarget[] = [
  { modId: 'Wands/WeaponSpellDamage', minTierIndex: top('Wands/WeaponSpellDamage') - 2 },
  { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon', minTierIndex: top('Wands/GlobalIncreaseSpellSkillGemLevelWeapon') - 1 },
  { modId: 'Wands/IncreasedCastSpeed', minTierIndex: top('Wands/IncreasedCastSpeed') - 2 },
];

describe('keyOfItem — an item lands where the solve put it', () => {
  it('places the white base at the start, and every starting item at its own row', () => {
    const r = solveFromWhite(wands, CASTER);
    const t = r.routes!;
    expect(t).toBeDefined();
    const start = keyOfItem(t, data, whiteItem(wands, 82));
    expect(start).toMatchObject({ ok: true, key: t.keys[t.restartIdx] });
    expect(r.holdings!.length).toBeGreaterThan(4);
    for (const h of r.holdings!) {
      const got = keyOfItem(t, data, itemWith(wands, h.present.map((ids) => ids[0]!), h.rarity));
      expect(got, `${h.rarity} ${JSON.stringify(h.present)}`).toMatchObject({ ok: true, key: h.key });
    }
  });

  it('writes interchangeable alternatives the way the solve does — one spelling', () => {
    // Extra Cold or Extra Lightning in one slot: the data cannot tell them apart, so both spell one state.
    const r = solveFromWhite(wands, [
      { modId: 'Wands/DamageGainedAsCold', slot: 0 }, { modId: 'Wands/DamageGainedAsLightning', slot: 0 },
      { modId: 'Wands/IncreasedCastSpeed', slot: 1 },
    ]);
    const t = r.routes!;
    const cold = keyOfItem(t, data, itemWith(wands, ['Wands/DamageGainedAsCold'], 'magic'));
    const lightning = keyOfItem(t, data, itemWith(wands, ['Wands/DamageGainedAsLightning'], 'magic'));
    expect(cold.ok && lightning.ok).toBe(true);
    expect(cold.ok && lightning.ok && cold.key === lightning.key).toBe(true);
    for (const h of r.holdings!) {
      expect(keyOfItem(t, data, itemWith(wands, h.present.map((ids) => ids[0]!), h.rarity))).toMatchObject({ ok: true, key: h.key });
    }
  });

  it('reads a roll below the tier asked for as blocked, not as done', () => {
    const r = solveFromWhite(wands, CASTER);
    const t = r.routes!;
    const low: ItemState = {
      base: wands, level: 82, rarity: 'magic',
      prefixes: [{ modId: 'Wands/WeaponSpellDamage', tierName: tierName('Wands/WeaponSpellDamage', 0) }], suffixes: [],
    };
    const got = keyOfItem(t, data, low);
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    const [present, blocked] = got.key.split(':').map(Number);
    expect(present).toBe(0);
    expect(blocked).not.toBe(0);
  });

  it('reads a different mod of a target\'s family as blocking it — the solve\'s own sibling map', () => {
    // A carved Spell Damage holds the family the Spell Damage target needs, so it blocks it, exactly as
    // the solve reads it (markovSiblings.ts) — not as junk, which would block nothing.
    const r = solveFromWhite(wands, CASTER);
    const sib = 'Wands/Desecrated_WeaponCasterDamagePrefix';
    expect(r.routes!.locate.blocks.map(([id]) => id)).toContain(sib);
    const item: ItemState = { base: wands, level: 82, rarity: 'rare', prefixes: [{ modId: sib, tierName: tierName(sib, 0) }], suffixes: [] };
    const got = keyOfItem(r.routes!, data, item);
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    const [present, blocked, jp] = got.key.split(':').map(Number);
    expect(present).toBe(0);
    expect(blocked).toBe(1); // position 0, Spell Damage
    expect(jp).toBe(0);
  });

  it('counts a mod nobody asked for as junk', () => {
    const r = solveFromWhite(wands, CASTER);
    const got = keyOfItem(r.routes!, data, itemWith(wands, ['Wands/IncreasedMana'], 'magic'));
    expect(got.ok && got.key.split(':')[2]).toBe('1');
  });
});

describe('keyOfItem — what it refuses, by name', () => {
  const r = solveFromWhite(wands, CASTER);
  const t = r.routes!;

  it('another base', () => {
    const got = keyOfItem(t, data, itemWith(rings, ['Rings/IncreasedLife'], 'magic'));
    expect(got).toMatchObject({ ok: false });
    expect(!got.ok && got.reason).toMatch(/different kind of base/);
  });

  it('a fractured mod the plan was not solved with', () => {
    const item: ItemState = { ...itemWith(wands, [], 'rare'), prefixes: [{ modId: 'Wands/IncreasedMana', tierName: tierName('Wands/IncreasedMana', 0), fractured: true }] };
    expect(keyOfItem(t, data, item)).toMatchObject({ ok: false, reason: expect.stringMatching(/fractured/) });
  });

  it('a rarity the plan never holds', () => {
    // A held Rare's plan stays Rare: it has no Magic state to pick up from.
    const held = markovFromItem(data, prices, itemWith(wands, ['Wands/WeaponSpellDamage'], 'rare'), CASTER, { keepRoutes: true });
    const got = keyOfItem(held.routes!, data, itemWith(wands, ['Wands/WeaponSpellDamage'], 'magic'));
    expect(got).toMatchObject({ ok: false, reason: expect.stringMatching(/never holds a Magic item/) });
  });

  it('notes a different item level without refusing', () => {
    const got = keyOfItem(t, data, { ...whiteItem(wands, 75) });
    expect(got).toMatchObject({ ok: true, level: 75 });
  });
});
