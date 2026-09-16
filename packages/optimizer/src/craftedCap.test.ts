import { describe, it, expect } from 'vitest';
import type { ItemState } from '../../engine/src/index.ts';
import { loadPatch, whiteItem, withRunes } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';

/**
 * The craft this whole change came from: a player could not plan the "Spirit Star" Sceptre, because it
 * carries TWO Alloy modifiers — Adaptive Alloy's Puppet Master chance and The Runebinder's Alloy's
 * Puppet Master stacks — and an item holds one crafted modifier (0.5.0: "items can only have 1 crafted
 * modifier at a time"). Astrid's Creativity, "Can have 1 additional Crafted Modifier", is what makes
 * the pair legal, and fubgun's uncorrupted wand carries two Alloys the same way.
 *
 * Every planner has to agree, since all three quote the same craft.
 */
const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const sceptre = data.bases.get('Sceptres')!;
const runed = withRunes(sceptre, ['astrids-creativity']);

const ALLOY_CHANCE = 'Sceptres/PerfectEssence_MinionGainPuppetMasterOnCommand';
const ALLOY_STACKS = 'Sceptres/PerfectEssence_MaximumPuppeteerStacks';
const SPIRIT = 'Sceptres/LocalIncreasedSpiritPercent';
const ALLY_DAMAGE = 'Sceptres/AlliesInPresenceAllDamage';
const ALLY_RES = 'Sceptres/AlliesInPresenceAllResistances';
const MINION_LEVEL = 'Sceptres/GlobalIncreaseMinionSpellSkillGemLevelWeapon';

/** The Sceptre's six modifiers, as the screenshot carries them. */
const SPIRIT_STAR = [ALLY_DAMAGE, SPIRIT, ALLY_RES, MINION_LEVEL, ALLOY_CHANCE, ALLOY_STACKS]
  .map((modId) => ({ modId }));
/**
 * Enough of the Sceptre to be craftable end to end.
 *
 * THREE rolled modifiers, one of them a suffix, are what carry a white base to Rare — transmute,
 * augment, regal — and a Perfect Essence needs a Rare to work on. Two rolled PREFIXES cannot do it: the
 * augment would be a second prefix on a Magic item, which holds one per side, so every plan scores 0
 * and the frontier comes back empty.
 */
const SMALL = [SPIRIT, ALLY_RES, ALLY_DAMAGE, ALLOY_CHANCE, ALLOY_STACKS].map((modId) => ({ modId }));

const tierName = (modId: string): string => data.mods.get(modId)!.tiers.at(-1)!.name;
const heldRare = (base = sceptre): ItemState => ({
  base, level: 82, rarity: 'rare',
  prefixes: [{ modId: SPIRIT, tierName: tierName(SPIRIT) }], suffixes: [],
});

describe('two Alloys need Astrid’s Creativity', () => {
  it('is refused by all three planners without the rune', () => {
    expect(() => optimizePareto(data, prices, sceptre, SPIRIT_STAR)).toThrow(/crafted modifier/i);
    expect(() => optimizeFromItem(data, prices, heldRare(), SPIRIT_STAR)).toThrow(/crafted modifier/i);
    const r = markovFromItem(data, prices, whiteItem(sceptre, 82), SPIRIT_STAR);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/crafted modifier/i);
  });

  it('names the rune that would allow it, rather than just refusing', () => {
    expect(() => optimizePareto(data, prices, sceptre, SPIRIT_STAR)).toThrow(/Astrid/);
  });

  it('is planned once the rune is socketed', () => {
    const r = markovFromItem(data, prices, whiteItem(runed, 82), SMALL);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
    expect(Number.isFinite(r.expectedCost)).toBe(true);

    const pareto = optimizePareto(data, prices, runed, SMALL);
    expect(pareto.frontier.length).toBeGreaterThan(0);
  });

  /**
   * The step planner used to restart the tail of an ordering on an empty Normal item after a Perfect
   * Essence. With one crafted modifier as the cap nothing could follow, so it never showed; with two,
   * the second essence found nothing to eat and the ordering was dropped. This is that regression: a
   * plan that spends both Alloys has to exist.
   */
  it('sequences BOTH Perfect Essence steps in one plan', () => {
    const pareto = optimizePareto(data, prices, runed, SMALL);
    const twoEssences = pareto.frontier.filter(
      (p) => p.steps.filter((s) => s.currency === 'perfect-essence').length === 2,
    );
    expect(twoEssences.length).toBeGreaterThan(0);
    // …and each one names a different Alloy, which is what "two crafted modifiers" means.
    const added = twoEssences[0]!.steps
      .filter((s) => s.currency === 'perfect-essence')
      .map((s) => ('add' in s ? s.add : ''));
    expect([...added].sort()).toEqual([ALLOY_CHANCE, ALLOY_STACKS].sort());
  });

  it('still refuses a third crafted modifier, which no rune allows', () => {
    const three = [...SMALL, { modId: 'Sceptres/PerfectEssence_AuraEffect' }];
    expect(() => optimizePareto(data, prices, runed, three)).toThrow(/crafted modifiers/i);
    expect(markovFromItem(data, prices, whiteItem(runed, 82), three).reason).toMatch(/crafted modifiers/i);
  });
});
