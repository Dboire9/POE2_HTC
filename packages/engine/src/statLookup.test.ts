import { describe, it, expect } from 'vitest';
import { loadPatch } from './loadPatch.ts';
import { statIndex, resolveByStats, statsOf, familyConflicts } from './statLookup.ts';
import type { ItemBase } from './types.ts';

const data = loadPatch('data/patches/0.5.0');
const base = (id: string): ItemBase => {
  const b = data.bases.get(id);
  if (!b) throw new Error(`no such base: ${id}`);
  return b;
};
const on = (id: string) => statIndex(data, base(id));

describe('resolving a modifier from its stat identifiers', () => {
  it('finds the mod and pins the tier', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: { additional_intelligence: 20 } });
    expect(r.modId).toBe('Amulets/Intelligence');
    expect(r.values).toEqual([20]);
    expect(r.tierName).toBeDefined();
  });

  /**
   * The whole reason this exists beside the text reader. `Staves/DamageGainedAsFire` tops out at 60,
   * and a real staff carried TWO of it — 71 and 62, one converted onto the other's element by a
   * Passion of Aldur — which the game sums on screen into a single `133%`. From text that is one
   * unreadable modifier; from stats it is two, each resolved and each Sanctified.
   */
  it('reads two modifiers that the game prints as one summed line', () => {
    const idx = on('Staves');
    const a = resolveByStats(data, idx, { stats: { 'non_skill_base_all_damage_%_to_gain_as_fire': 71 } });
    const b = resolveByStats(data, idx, { stats: { 'non_skill_base_all_damage_%_to_gain_as_fire': 62 } });
    expect(a.modId).toBe('Staves/DamageGainedAsFire');
    expect(b.modId).toBe('Staves/DamageGainedAsFire');
    expect([a.sanctified, b.sanctified]).toEqual([true, true]);
    expect(a.tierName).toBe('Flamebound');
  });

  /**
   * A hybrid is one entry with two stats, so there is no window to guess at — and the values must be
   * ordered by the MOD's stat order, not by the object's. Written here in the opposite order on
   * purpose: `ranges` is `[[armour],[evasion]]`, so reading the object's own order would compare 70
   * against the armour range and 80 against the evasion one, and quietly pin the wrong tier.
   */
  it('orders a hybrid\'s values by the mod, not by the object it arrived in', () => {
    const r = resolveByStats(data, on('Boots_str_dex'), {
      stats: { local_base_evasion_rating: 70, local_base_physical_damage_reduction_rating: 80 },
    });
    expect(r.modId).toBe('Boots_str_dex/LocalBaseArmourAndEvasionRating');
    expect(r.values).toEqual([80, 70]);
    expect(r.tierName).toBe('Durable');
  });

  it('returns nothing for a stat the base has no modifier for', () => {
    const r = resolveByStats(data, on('Rings'), { stats: { grenade_skill_cooldown_count_: 1 } });
    expect(r.modId).toBeUndefined();
    expect(r.modIds).toEqual([]);
  });
});

describe('the source id as a tie-breaker', () => {
  const AMBIGUOUS = { 'base_item_found_rarity_+%': 9 };

  /** Two normal mods, one prefix and one suffix, with the same single stat. The roll cannot separate
   *  them and neither can the stats — this is the 8-in-52-bases case. */
  it('is ambiguous on stats alone', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: AMBIGUOUS });
    expect(r.modId).toBeUndefined();
    expect(r.modIds).toHaveLength(2);
  });

  it('settles it when the source names the prefix', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: AMBIGUOUS, id: 'ItemFoundRarityIncreasePrefix3' });
    expect(r.modId).toBe('Amulets/ItemFoundRarityIncreasePrefix');
    expect(r.tierName).toBeDefined();
  });

  it('settles it the other way just as readily', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: AMBIGUOUS, id: 'ItemFoundRarityIncrease3' });
    expect(r.modId).toBe('Amulets/ItemFoundRarityIncrease');
  });

  /** The schemes disagree far more often than they agree — 24 of 43 on a real character — so an id
   *  that matches nothing must leave the tie alone rather than guess. */
  it('leaves the tie open when the id matches neither candidate', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: AMBIGUOUS, id: 'SomethingElse7' });
    expect(r.modId).toBeUndefined();
  });

  /** Consulted ONLY among candidates the stats left tied, so a disagreeing id cannot overrule a
   *  confident match — which matters, because they usually do disagree. */
  it('never overrules a stat match that was already unique', () => {
    const r = resolveByStats(data, on('Amulets'), { stats: { additional_intelligence: 20 }, id: 'FireResist7' });
    expect(r.modId).toBe('Amulets/Intelligence');
  });
});

describe('an item the engine cannot represent', () => {
  /**
   * Two modifiers of one family. Family exclusion is an invariant the whole engine rests on, so an
   * `ItemState` cannot hold this — but the game can produce it and a real character had one. Naming
   * it lets a caller say so, instead of dropping one and planning against an item nobody owns.
   */
  it('names two modifiers that share an exclusion family', () => {
    const clash = familyConflicts(data, ['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsFire']);
    expect(clash).toEqual(['Staves/DamageGainedAsFire']);
  });

  it('is silent on an ordinary item', () => {
    expect(familyConflicts(data, ['Amulets/Intelligence', 'Amulets/FireResistance'])).toEqual([]);
  });
});

describe('what this needs from the data', () => {
  /**
   * `tiers[].stats` is stripped from the asset the browser downloads, so this resolver only works
   * where the full mods file is read. If that ever stops being true in Node the index goes silently
   * empty, which is the failure worth pinning.
   */
  it('finds stats on the shipped file, which is what the whole join rests on', () => {
    expect(statsOf(data.mods.get('Amulets/Intelligence')!)).toEqual(['additional_intelligence']);
    // 80 mods in the Amulets pool collapse to 32 distinct stat sets — the difference is real and is
    // the essence/normal twins and the tier families sharing a stat, not missing data.
    expect(on('Amulets').size).toBe(32);
  });
});
