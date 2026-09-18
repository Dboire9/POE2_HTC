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

/**
 * THE WHOLE ITEM FROM THE SCREENSHOT, modifier for modifier.
 *
 * `SMALL` above is a five-modifier subset, chosen because it solves quickly; the tests that PLAN
 * anything use it, so nothing yet asserted that the real item — four rolled modifiers and both Alloys,
 * filling all six slots — can be crafted at all. That is the thing the player actually asked for, so it
 * is worth pinning as itself rather than by proxy.
 */
describe('the Spirit Star Sceptre, as photographed', () => {
  /** Each line of the screenshot: the modifier, and the number printed beside it. */
  const PHOTO: readonly (readonly [string, number])[] = [
    [ALLY_DAMAGE, 115], [SPIRIT, 49], [ALLY_RES, 16], [MINION_LEVEL, 4],
    [ALLOY_CHANCE, 48], [ALLOY_STACKS, 6],
  ];

  it('is six real Sceptre modifiers, three a side, two of them Alloys', () => {
    const side = (t: 'prefix' | 'suffix') => SPIRIT_STAR.filter((x) => data.mods.get(x.modId)!.type === t);
    expect(side('prefix')).toHaveLength(3);
    expect(side('suffix')).toHaveLength(3);
    expect(SPIRIT_STAR.filter((x) => data.mods.get(x.modId)!.alloy === true)).toHaveLength(2);
  });

  /**
   * Five of the six rolls land in exactly one tier, so the item is representable — and the sixth does
   * not, which is the item's own oddity rather than a gap in this data. The photo reads "+6 maximum
   * stacks of Puppet Master" and The Runebinder's Alloy tops out at 5. A roll above everything a
   * modifier can produce is read as Sanctified (`tierFit`) and Sanctification is NOT modelled as a
   * mechanic, so a plan for this item quotes the +5 it can actually craft. Pinned here so that
   * discrepancy is on the record rather than a surprise.
   */
  it('matches the photographed rolls to real tiers, except the one above the ceiling', () => {
    const fits = (modId: string, v: number) => data.mods.get(modId)!.tiers
      .filter((t) => t.ranges.some((r) => v >= Math.min(...r) && v <= Math.max(...r)));
    for (const [modId, roll] of PHOTO) {
      if (modId === ALLOY_STACKS) continue;
      expect(fits(modId, roll), `${modId} @ ${roll}`).toHaveLength(1);
    }
    expect(fits(ALLOY_STACKS, 6)).toHaveLength(0);
    const best = data.mods.get(ALLOY_STACKS)!.tiers.at(-1)!;
    expect(Math.max(...best.ranges.flat())).toBe(5);
  });

  it('is refused without the rune, and craftable with it at a finite cost', () => {
    expect(() => optimizePareto(data, prices, sceptre, SPIRIT_STAR)).toThrow(/crafted modifier/i);
    const r = markovFromItem(data, prices, whiteItem(runed, 82), SPIRIT_STAR);
    expect(r.feasible).toBe(true);
    expect(Number.isFinite(r.expectedCost)).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
    // The step planner has to agree — all three planners quote the same craft.
    expect(optimizePareto(data, prices, runed, SPIRIT_STAR).frontier.length).toBeGreaterThan(0);
  }, 120_000);
});

/**
 * The Spirit Star Sceptre again, part-way, as a player reported it from the Item tab: a MAGIC Sceptre
 * holding T1 ally damage and T1 minion levels, both wanted, asked for Spirit and the two Alloys with
 * the last suffix left free.
 *
 * The model solves it — it rolls something unwanted first and lets the Alloy take that. The step
 * planner cannot: every route draws an Alloy's removal from a modifier ALREADY on the item, and this
 * one holds none it doesn't want. What the planner owes the player is that sentence, in their terms. It
 * used to say "need 2 Perfect Essence(s) but only 0 spare mod(s) to sacrifice", which never named an
 * Alloy — the badge on both targets — and read as a flaw in the craft rather than in the planner.
 */
describe('an Alloy needs a modifier on the item to take', () => {
  const best = (modId: string) => ({ modId, tierName: tierName(modId) });
  const magic: ItemState = {
    base: runed, level: 82, rarity: 'magic', prefixes: [best(ALLY_DAMAGE)], suffixes: [best(MINION_LEVEL)],
  };
  const wanted = [ALLY_DAMAGE, MINION_LEVEL, ALLOY_CHANCE, ALLOY_STACKS, SPIRIT].map((modId) => ({ modId }));
  const freeSuffix = { spare: { prefixes: 0, suffixes: 1 } };

  // Through the free slot on purpose: that is the path the report took, and the one that must still
  // reach the planner's refusal rather than stop at the keep-sets built for it.
  it('names the Alloy, and says the item has nothing for it to take', () => {
    expect(() => optimizeFromItem(data, prices, magic, wanted, freeSuffix))
      .toThrow(/Alloy or Perfect Essence removes a random modifier .* adds 2 and your item has none$/);
  });

  it('counts what the item does hold', () => {
    const family = (id: string) => data.mods.get(id)!.family;
    const taken = [MINION_LEVEL, ALLOY_STACKS].map(family);
    const junk = sceptre.pools.normal.suffixes.find((id) => !taken.includes(family(id)))!;
    const held: ItemState = { ...magic, rarity: 'rare', suffixes: [...magic.suffixes, best(junk)] };
    expect(() => optimizeFromItem(data, prices, held, wanted, freeSuffix))
      .toThrow(/adds 2 and your item has only 1$/);
  });
});
