import { describe, it, expect } from 'vitest';
import { rollLabel, modTextAtTier } from './engineMap.ts';
import { templateFixedRoll } from '../../tools/refresh/modText.mjs';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import type { EngineMod } from './engineTypes.ts';

// Reported by a player asking for +5: the row read "+1 to Level of all Fire Spell Skills" beside a
// dropdown reading "T1 · of Inferno · ilvl 81 · 5–5", and joining the two up was left to them. Two
// separate faults met there — a data one and a display one — so both halves are pinned here.

const data = loadPatch('data/patches/0.5.0');

describe('templateFixedRoll — the data half', () => {
  const tiers = (...ranges: number[][]) => ranges.map((r) => ({ ranges: [r] }));

  // `cleanText` only collapses a PARENTHESISED range, and RePoE renders a fixed roll without
  // parentheses — so the literal from the WORST tier survived into the label of every tier.
  it('restores the placeholder a fixed worst-tier roll left behind', () => {
    expect(templateFixedRoll('+1 to Level of all Fire Spell Skills', tiers([1, 1], [2, 2], [5, 5])))
      .toBe('+# to Level of all Fire Spell Skills');
  });

  // The sign lives in the WORDS: "15% reduced" is stored as -15, and its best tier as -35.
  it('matches on magnitude, since the text carries the sign as a word', () => {
    expect(templateFixedRoll('15% reduced Attribute Requirements', tiers([-15, -15], [-35, -35])))
      .toBe('#% reduced Attribute Requirements');
  });

  it('leaves alone what it cannot prove', () => {
    // No number to template — `Crossbows/AdditionalAmmo`, the one mod of the 115 this cannot fix.
    expect(templateFixedRoll('Loads an additional bolt', tiers([1, 1], [2, 2]))).toBe('Loads an additional bolt');
    // A roll that genuinely never varies keeps its number.
    expect(templateFixedRoll('Has 1 Rune Socket', tiers([1, 1], [1, 1]))).toBe('Has 1 Rune Socket');
    // Already templated.
    expect(templateFixedRoll('+# to maximum Mana', tiers([10, 20], [30, 40]))).toBe('+# to maximum Mana');
    // The number in the text does not match the worst roll, so the match is not a match.
    expect(templateFixedRoll('Grants 9 Life per Enemy Hit', tiers([2, 2], [4, 4]))).toBe('Grants 9 Life per Enemy Hit');
  });

  // The whole point of fixing the generator as well as the file: a refresh must not put them back.
  it('leaves nothing in the shipped data for it to fix', () => {
    const left = [...data.mods.values()].filter((m) => templateFixedRoll(m.text ?? null, m.tiers) !== (m.text ?? null));
    expect(left.map((m) => m.id)).toEqual([]);
  });
});

describe('rollLabel — one roll, as a player reads it', () => {
  it('collapses a fixed roll instead of printing it as a range', () => {
    expect(rollLabel([5, 5])).toBe('5');       // was "5–5"
    expect(rollLabel([3, 4])).toBe('3–4');
  });

  it('shows magnitude, low to high, because taking it reverses a negative pair', () => {
    expect(rollLabel([-35, -35])).toBe('35');
    expect(rollLabel([-10, -8])).toBe('8–10'); // NOT "10–8"
  });

  it('says nothing for a value-less mod', () => {
    expect(rollLabel(undefined)).toBe('');
    expect(rollLabel([])).toBe('');
  });
});

describe('modTextAtTier — the display half', () => {
  const mod = (text: string, ...values: string[][]): EngineMod => ({
    id: 'm', text, type: 'prefix', family: 'F', source: 'normal',
    tiers: values.map((v, i) => ({ display: i + 1, name: `t${i}`, ilvl: 1, label: `T${i + 1}`, range: v[0] ?? '', values: v })),
  });

  it('reads the sentence with the numbers that tier actually rolls', () => {
    const m = mod('+# to Level of all Fire Spell Skills', ['5'], ['4'], ['1']);
    expect(modTextAtTier(m, 1)).toBe('+5 to Level of all Fire Spell Skills');
    expect(modTextAtTier(m, 3)).toBe('+1 to Level of all Fire Spell Skills');
  });

  // 153 shipped mods carry two or three placeholders, each with its own range.
  it('fills several placeholders in order', () => {
    expect(modTextAtTier(mod('# to # Physical Thorns damage', ['101–151', '152–220']), 1))
      .toBe('101–151 to 152–220 Physical Thorns damage');
  });

  it('leaves a placeholder it has no value for rather than dropping the clause', () => {
    expect(modTextAtTier(mod('+# to Evasion\n+# to Energy Shield', ['6–10']), 1))
      .toBe('+6–10 to Evasion\n+# to Energy Shield');
  });

  it('passes a value-less mod through untouched', () => {
    expect(modTextAtTier(mod('Loads an additional bolt', []), 1)).toBe('Loads an additional bolt');
  });

  // End to end on the reported mod, through the real shipped data.
  it('resolves the mod that prompted this', () => {
    const wand = [...data.mods.values()].find((m) => m.id === 'Wands/GlobalIncreaseFireSpellSkillGemLevelWeapon')!;
    expect(wand.text).toBe('+# to Level of all Fire Spell Skills'); // no longer "+1 …"
    expect(wand.tiers.at(-1)!.ranges[0]).toEqual([5, 5]);           // best tier really is +5
  });
});
