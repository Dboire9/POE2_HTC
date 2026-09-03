import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { exaltProbability } from '../../packages/engine/src/probability.ts';
import { listBases, listMods } from './engine.ts';
import { defaultWorkspace, encodeWorkspace, decodeWorkspace } from './workspace.ts';

// A wand or staff base can be locked to ONE spell element, and the dump says so outright: the base
// carries `no_fire_spell_mods` and friends, and the mods those gate list the tag at weight 0. A Frigid
// Wand rolls cold spell mods and no others. `pickVariant` skipped these variants, so the app shipped
// the unrestricted Attuned Wand as "Wands" — right for 9 of 18 wand bases, wrong for the other 7.
const data = loadPatch('data/patches/0.5.0');
const ELEMENTS = ['fire', 'cold', 'lightning', 'physical', 'chaos'] as const;
const pool = (id: string) => {
  const b = data.bases.get(id)!;
  return new Set([...b.pools.normal.prefixes, ...b.pools.normal.suffixes]);
};

describe('spell-element base variants', () => {
  it('ships one variant per element for wands and staves, and only those', () => {
    const ids = listBases(data).map((b) => b.id);
    for (const parent of ['Wands', 'Staves']) {
      for (const e of ELEMENTS) expect(ids).toContain(`${parent}_${e}`);
    }
    // Sceptres and Quarterstaves have no `no_*_spell_mods` variant in the dump — their cultural
    // ezomyte/maraketh/vaal/karui tags gate no mod at all, so they must NOT be split.
    expect(ids.filter((i) => /^(Sceptres|Quarterstaves|Bows|Foci)_/.test(i))).toEqual([]);
  });

  // The whole point: the variant is the parent MINUS what the base cannot roll, never something new.
  it('is a strict subset of its parent, holding exactly one element', () => {
    for (const parent of ['Wands', 'Staves']) {
      const all = pool(parent);
      for (const e of ELEMENTS) {
        const p = pool(`${parent}_${e}`);
        expect([...p].every((m) => all.has(m))).toBe(true);
        expect(p.size).toBeLessThan(all.size);
        // Its own gem-level mod is there and the other four are gone.
        const gem = (el: string) => `${parent}/GlobalIncrease${el[0]!.toUpperCase()}${el.slice(1)}SpellSkillGemLevelWeapon`;
        expect(p.has(gem(e))).toBe(true);
        for (const other of ELEMENTS.filter((x) => x !== e)) expect(p.has(gem(other))).toBe(false);
      }
    }
  });

  // Reusing the parent's mod ids is what keeps `mods.json` from growing, and it is only sound because
  // every group the two share resolves to the same weight — measured across all ten variants.
  it('adds no mods of its own', () => {
    for (const parent of ['Wands', 'Staves']) {
      for (const e of ELEMENTS) {
        for (const id of pool(`${parent}_${e}`)) expect(id.startsWith(`${parent}/`)).toBe(true);
      }
    }
  });

  /**
   * The half that matters more than the missing rows.
   *
   * Gated mods stayed in the DENOMINATOR, so the app understated the odds of every mod that IS legal.
   * One exalt onto an empty Rare Wand, for `+X to Level of all Cold Spell Skills`: 2.273% on the
   * unrestricted base against 3.030% on a Frigid Wand — 1.33x, and it compounds over a craft.
   */
  it('raises the odds of a legal mod, because the illegal ones leave the denominator', () => {
    const COLD = 'Wands/GlobalIncreaseColdSpellSkillGemLevelWeapon';
    const at = (id: string): number => exaltProbability(
      data, { base: data.bases.get(id)!, level: 82, rarity: 'rare', prefixes: [], suffixes: [] }, COLD,
    );
    const parent = at('Wands');
    const frigid = at('Wands_cold');
    expect(frigid).toBeGreaterThan(parent);
    expect(frigid / parent).toBeCloseTo(1.333, 2);
  });

  it('names the real game bases, which is how a player recognises the row', () => {
    const byId = new Map(listBases(data).map((b) => [b.id, b.name]));
    expect(byId.get('Wands_cold')).toBe('Frigid Wand');
    expect(byId.get('Wands_fire')).toBe('Volatile Wand');
    expect(byId.get('Wands_chaos')).toBe('Primordial Wand, Withered Wand');
    // `[DNT…]` is a developer placeholder the game marks Do Not Translate; two sit in the staff pool.
    for (const [, name] of byId) expect(name).not.toMatch(/\[DNT/i);
  });

  it('offers only its own element in the mod picker', () => {
    // Only the ELEMENT-specific ones are gated. "+# to Level of all Spell Skills" names no element, so
    // no `no_*_spell_mods` tag touches it and a Frigid Wand rolls it like any other wand — asserting
    // it away would have been the test demanding the data be wrong.
    const elemental = (id: string) => listMods(data, id).prefixes.concat(listMods(data, id).suffixes)
      .map((m) => m.text)
      .filter((t) => /Level of all (Fire|Cold|Lightning|Physical|Chaos) Spell Skills/.test(t));
    expect(elemental('Wands_cold')).toEqual(['+# to Level of all Cold Spell Skills']);
    expect(elemental('Wands')).toHaveLength(5);
    expect(listMods(data, 'Wands_cold').prefixes.concat(listMods(data, 'Wands_cold').suffixes)
      .some((m) => m.text === '+# to Level of all Spell Skills')).toBe(true);
  });

  /**
   * A share link survives the split, and by luck rather than design — so it is pinned.
   *
   * `strip` shortens a mod id only when it starts with `${baseId}/`. A variant's mods are the PARENT's
   * (`Wands/…`), so nothing is stripped and the full id travels; `restore` returns any short form
   * containing a slash unchanged, so it comes back intact. Change either half and this breaks silently.
   */
  it('round-trips through a share link', () => {
    const ws = {
      ...defaultWorkspace(),
      lab: {
        ...defaultWorkspace().lab, baseId: 'Wands_cold',
        targets: [{ modId: 'Wands/GlobalIncreaseColdSpellSkillGemLevelWeapon', tierDisplay: 1 }],
      },
    };
    const back = decodeWorkspace(encodeWorkspace(ws), data)?.workspace;
    expect(back?.lab.baseId).toBe('Wands_cold');
    // The FULL id, because `Wands/…` does not start with `Wands_cold/` — the payload is longer and the
    // value is exact, which is the trade this pins.
    expect(back?.lab.targets[0]?.modId).toBe('Wands/GlobalIncreaseColdSpellSkillGemLevelWeapon');
  });
});
