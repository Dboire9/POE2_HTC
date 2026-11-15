import { describe, it, expect } from 'vitest';
import { loadShippedPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { MIN_SLOTS, STARTER_RECIPES, TIER_SLACK, modWords, targetsAt, type StarterRecipe } from './starterRecipes';
import { runSolve } from './solve';
import { limitsFor } from './searchEffort';
import { EXAMPLE_CRAFTS } from './exampleCrafts';
import { locateItem, stepFor } from './engine';
import { START_OVER } from './stateWords';
import type { EngineMarkovResult, ExistingItem, ItemModInput } from './engineTypes';

// The data the browser gets: a recipe naming a base or modifier a refresh renamed would plan a craft the
// picker cannot show.
const data = loadShippedPatch('data/patches/0.5.0');

/**
 * The item levels each recipe is held to, with its first and last offered level: the levels
 * `scripts/starter-recipes.mts` measures, and its stated `bases` were measured over.
 */
const MEASURED_LEVELS = [8, 12, 16, 25, 33, 40, 46, 55, 60, 65];

const QS = 'Quarterstaves';
const recipeOf = (baseId: string, slots: readonly (readonly string[])[]): StarterRecipe => ({
  name: 'test', weapon: 'test', grade: 'easy', baseId, levels: { from: 1, to: 100 }, bases: { from: 0, to: 0 },
  slots: slots.map((ids) => ({ modIds: ids.map((id) => `${baseId}/${id}`), words: '' })),
});

describe('the starter recipes', () => {
  it('name real bases, and modifiers each base rolls with currency, one side per slot', () => {
    for (const r of STARTER_RECIPES) {
      const base = data.bases.get(r.baseId);
      expect(base, r.baseId).toBeDefined();
      const pool = [...base!.pools.normal.prefixes, ...base!.pools.normal.suffixes];
      expect(r.slots.length, r.name).toBeGreaterThanOrEqual(MIN_SLOTS);
      for (const s of r.slots) {
        for (const id of s.modIds) {
          expect(pool, id).toContain(id);
          expect(data.mods.get(id)!.source, id).toBe('normal');
        }
        // Alternatives fill one position, so they must sit on one side — the solver refuses a slot that does not.
        expect(new Set(s.modIds.map((id) => data.mods.get(id)!.type)).size, s.words).toBe(1);
      }
    }
  });

  // The card says "done when it has these modifiers": its words are the game's, numbers taken out.
  it('word each slot as the game does', () => {
    for (const r of STARTER_RECIPES) {
      for (const s of r.slots) expect(s.words).toBe(s.modIds.map((id) => modWords(data.mods.get(id)!.text!)).join(' or '));
    }
  });

  // The card groups recipes by `weapon` and lists each weapon's easy recipe first: a recipe out of its
  // weapon's run would open a second group, and a better one ahead of the easy one inverts the card.
  it('are grouped by weapon, each weapon’s easy recipe before its better one', () => {
    const weapons = STARTER_RECIPES.map((r) => r.weapon);
    const order = [...new Set(weapons)];
    // Each weapon's recipes sit together: the weapons, read in order, never come back.
    expect(weapons.filter((w, i) => i === 0 || w !== weapons[i - 1])).toEqual(order);
    for (const w of order) {
      const grades = STARTER_RECIPES.filter((r) => r.weapon === w).map((r) => r.grade);
      for (const g of grades) expect(['easy', 'better'], w).toContain(g);
      expect(grades, w).toEqual([...grades].sort((a, b) => (a === b ? 0 : a === 'easy' ? -1 : 1)));
      expect(new Set(grades).size, w).toBe(grades.length);
      expect(w.trim(), w).not.toBe('');
      expect(new Set(STARTER_RECIPES.filter((r) => r.weapon === w).map((r) => r.baseId)).size, w).toBe(1);
    }
  });

  it('give every attack weapon one easy and one better recipe, the easy one first', () => {
    for (const baseId of ['Bows', 'Crossbows', 'Quarterstaves', 'Spears', 'OneHand_Maces', 'TwoHand_Maces']) {
      expect(STARTER_RECIPES.filter((r) => r.baseId === baseId).map((r) => r.grade), baseId).toEqual(['easy', 'better']);
    }
  });

  // Both sit on the same "Or try one" card, so a starter recipe named like an example craft would read as
  // the same craft with another answer.
  it('share no name with an example craft', () => {
    const examples = new Set(EXAMPLE_CRAFTS.map((e) => e.name));
    for (const r of STARTER_RECIPES) expect(examples.has(r.name), r.name).toBe(false);
  });

  it('each carry a unique name and a level range inside the game’s', () => {
    const names = STARTER_RECIPES.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
    for (const r of STARTER_RECIPES) {
      expect(r.levels.from, r.name).toBeGreaterThanOrEqual(1);
      expect(r.levels.from, r.name).toBeLessThanOrEqual(r.levels.to);
      expect(r.levels.to, r.name).toBeLessThanOrEqual(100);
      // The card says it in words ("usually 2–8 bases"): whole numbers, the fewest first, at least one base.
      expect(Number.isInteger(r.bases.from) && Number.isInteger(r.bases.to), r.name).toBe(true);
      expect(r.bases.from, r.name).toBeGreaterThanOrEqual(1);
      expect(r.bases.from, r.name).toBeLessThanOrEqual(r.bases.to);
    }
  });

  // Every level a card can be asked about: each recipe keeps all its modifiers, each at a tier it has.
  it('yield valid targets, dropping nothing, at every level they are offered', () => {
    for (const r of STARTER_RECIPES) {
      for (let level = r.levels.from; level <= r.levels.to; level++) {
        const at = targetsAt(data, r, level);
        expect(at, `${r.name} ${level}`).not.toBeNull();
        expect(at!.dropped, `${r.name} ${level}`).toEqual([]);
        expect(at!.targets.map((t) => t.modId)).toEqual(r.slots.flatMap((s) => s.modIds));
        for (const t of at!.targets) {
          expect(t.tierDisplay).toBeGreaterThanOrEqual(1);
          expect(t.tierDisplay).toBeLessThanOrEqual(data.mods.get(t.modId)!.tiers.length);
        }
      }
    }
  });
});

describe('targetsAt', () => {
  // Hand-checked against the data, whose tiers run worst first. Flat Physical Damage on a Quarterstaff
  // rolls from item levels 1, 8, 16, 33, 46, 54, 60, 65, 75 (nine tiers, T9 to T1); Attack Speed from
  // 1, 11, 22, 30, 37, 45, 60, 77 (eight, T8 to T1).
  const staff = recipeOf(QS, [['LocalPhysicalDamage'], ['LocalIncreasedAttackSpeed']]);
  const tiers = (level: number, slack?: number) => targetsAt(data, staff, level, slack)!.targets.map((t) => t.tierDisplay);

  it('asks each modifier at its best tier for the level, or `slack` below it', () => {
    // Level 25: the best Physical is the level-16 tier (T7), the best Attack Speed the level-22 one (T6).
    expect(tiers(25, 0)).toEqual([7, 6]);
    expect(tiers(25, 1)).toEqual([8, 7]);
    expect(tiers(25, 2)).toEqual([9, 8]);
    // Level 55: level-54 Physical (T4) and level-45 Attack Speed (T3).
    expect(tiers(55, 0)).toEqual([4, 3]);
    expect(tiers(55, TIER_SLACK)).toEqual([4 + TIER_SLACK, 3 + TIER_SLACK]);
    // Never below the worst tier: at level 1 only T9 and T8 roll.
    expect(tiers(1, 2)).toEqual([9, 8]);
  });

  it('gives each alternative its own tier and the slot one id', () => {
    // Increased Spirit rolls from 1, 8, 16, 33, … (eight tiers); Spirit and Mana from 2, 11, 26, 36, … (seven).
    const sceptre = STARTER_RECIPES.find((r) => r.baseId === 'Sceptres')!;
    const at = targetsAt(data, sceptre, 33, 1)!;
    expect(at.targets).toEqual([
      { modId: 'Sceptres/LocalIncreasedSpiritPercent', tierDisplay: 6, slot: 0 },
      { modId: 'Sceptres/LocalIncreasedSpiritAndMana', tierDisplay: 6, slot: 0 },
      { modId: 'Sceptres/AlliesInPresenceAllDamage', tierDisplay: 6 },
    ]);
  });

  it('asks the easy recipe’s second slot as alternatives, each at its own tier', () => {
    // Increased Physical rolls from 1, 8, 16, 33, 46, … (eight tiers); its hybrid with Accuracy from 8, 14,
    // 23, 38, 54, … (eight); flat Fire, Cold and Lightning from 1, 8, 16, 33, 46, 54, … (ten each). At 55,
    // two below the best: T6, T6, T6, and T7 for each element.
    const easy = STARTER_RECIPES.find((r) => r.baseId === QS && r.grade === 'easy')!;
    expect(targetsAt(data, easy, 55)!.targets).toEqual([
      { modId: `${QS}/LocalPhysicalDamage`, tierDisplay: 6 },
      { modId: `${QS}/LocalPhysicalDamagePercent`, tierDisplay: 6, slot: 1 },
      { modId: `${QS}/LocalIncreasedPhysicalDamagePercentAndAccuracyRating`, tierDisplay: 6, slot: 1 },
      { modId: `${QS}/LocalFireDamage`, tierDisplay: 7, slot: 1 },
      { modId: `${QS}/LocalColdDamage`, tierDisplay: 7, slot: 1 },
      { modId: `${QS}/LocalLightningDamage`, tierDisplay: 7, slot: 1 },
    ]);
  });

  it('drops a modifier the level cannot roll, and says which', () => {
    // Life Leech first rolls at item level 21.
    const leech = recipeOf(QS, [['LocalPhysicalDamage'], ['LocalIncreasedAttackSpeed'], ['LifeLeechLocalPermyriad']]);
    expect(targetsAt(data, leech, 12)).toEqual({
      targets: [{ modId: `${QS}/LocalPhysicalDamage`, tierDisplay: 9 }, { modId: `${QS}/LocalIncreasedAttackSpeed`, tierDisplay: 8 }],
      dropped: [`${QS}/LifeLeechLocalPermyriad`],
      // The dropped suffix leaves its position free too: one prefix and one suffix named, two of each free.
      spare: { prefixes: 2, suffixes: 2 },
    });
    expect(targetsAt(data, leech, 21)!.dropped).toEqual([]);
    // A slot keeps the alternatives that roll: Spirit and Mana first rolls at 2, plain Spirit at 1.
    const sceptre = STARTER_RECIPES.find((r) => r.baseId === 'Sceptres')!;
    const at = targetsAt(data, sceptre, 1)!;
    expect(at.dropped).toEqual(['Sceptres/LocalIncreasedSpiritAndMana']);
    expect(at.targets.map((t) => t.modId)).toEqual(['Sceptres/LocalIncreasedSpiritPercent', 'Sceptres/AlliesInPresenceAllDamage']);
  });

  // Every position the recipe does not name is free, per side, the base's three a side less the recipe's
  // slots there — and a slot of alternatives is one position. Each side read off the data, not assumed.
  it('leaves every other position of the item free', () => {
    const side = (id: string) => data.mods.get(id)!.type;
    const recipe = (baseId: string, grade: string) => STARTER_RECIPES.find((r) => r.baseId === baseId && r.grade === grade)!;
    // Easy Bow: flat Physical and the damage slot (increased Physical, its hybrid, flat Fire/Cold/Lightning),
    // all prefixes — one prefix and three suffixes free.
    const easy = recipe('Bows', 'easy');
    expect(easy.slots.flatMap((s) => s.modIds).map(side).every((t) => t === 'prefix')).toBe(true);
    expect(targetsAt(data, easy, 16)!.spare).toEqual({ prefixes: 1, suffixes: 3 });
    // Better Bow: flat Physical (prefix) and Attack Speed (suffix) — two of each free.
    const better = recipe('Bows', 'better');
    expect(better.slots.map((s) => side(s.modIds[0]!))).toEqual(['prefix', 'suffix']);
    expect(targetsAt(data, better, 30)!.spare).toEqual({ prefixes: 2, suffixes: 2 });
    // A Wand: Spell Damage or its Mana hybrid (prefixes, one slot) and Cast Speed (suffix) — two of each.
    const wand = recipe('Wands', 'better');
    expect(wand.slots.map((s) => s.modIds.map(side))).toEqual([['prefix', 'prefix'], ['suffix']]);
    expect(targetsAt(data, wand, 25)!.spare).toEqual({ prefixes: 2, suffixes: 2 });
    // The Sceptre: Spirit or its Mana hybrid, and the allies' Damage — both prefixes; one prefix, three suffixes.
    const sceptre = recipe('Sceptres', 'better');
    expect(sceptre.slots.map((s) => s.modIds.map(side))).toEqual([['prefix', 'prefix'], ['prefix']]);
    expect(targetsAt(data, sceptre, 25)!.spare).toEqual({ prefixes: 1, suffixes: 3 });
    // A slot that keeps one of its alternatives still takes its position: Spirit and Mana dropped at 1.
    expect(targetsAt(data, sceptre, 1)!.spare).toEqual({ prefixes: 1, suffixes: 3 });
  });

  it('is not offered when fewer than two modifiers roll', () => {
    const leech = recipeOf(QS, [['LocalPhysicalDamage'], ['LifeLeechLocalPermyriad']]);
    expect(targetsAt(data, leech, 20)).toBeNull();
    expect(targetsAt(data, leech, 21)).not.toBeNull();
  });
});

describe('each starter recipe on the found sheet', () => {
  // The request the card makes: a white base, the recipe's targets with the rest of the item free (`spare`),
  // planned on the found basis (`priceBasis: 'found'`), which
  // reads the found sheet whole and none of the engine's own — the frozen trade sheet here, the live one
  // in the script, and the script holds the two to the same answer.
  //
  // Each settles within Standard's sweep cap, so the plan a beginner sees is exact; with the clock lifted,
  // so a loaded machine cannot flake it — the clock half (most well under a second alone, 2026-11-14) is
  // a measurement, `scripts/starter-recipes.mts`. And the bases it states are what it uses, both ways: at
  // every level measured the exact count (1 + its start overs) lies inside them, and they are the floor of
  // the fewest and the ceiling of the most — so a range cannot be widened by hand, or go stale when a weight
  // or a level moves. One test per recipe, easy and better alike, so a recipe that breaks is named by it.
  const eng = { data, prices: loadFrozenPrices() };
  const effort = { ...limitsFor('standard'), maxMillis: 600_000 };
  it.each(STARTER_RECIPES.map((r) => [r.name, r] as const))('%s settles, and uses the bases it states', (_name, r) => {
    const levels = [...new Set([r.levels.from, ...MEASURED_LEVELS, r.levels.to])].filter((l) => l >= r.levels.from && l <= r.levels.to);
    const used: number[] = [];
    for (const level of levels) {
      const { targets, spare } = targetsAt(data, r, level)!;
      const got = runSolve(eng, { kind: 'lab', from: { baseId: r.baseId, level }, targets, spare, priceBasis: 'found', effort });
      expect(got.markov, `${r.name} at ${level}`).toMatchObject({ applicable: true, feasible: true, bound: 'exact' });
      expect(got.markov.restarts, `${r.name} at ${level}`).toBeDefined();
      // To a millionth, the solver's tolerance: a count of 3 must not read as 2.9999999 and floor to 2.
      const bases = Math.round((1 + got.markov.restarts!) * 1e6) / 1e6;
      expect(bases, `${r.name} at ${level}`).toBeGreaterThanOrEqual(r.bases.from);
      expect(bases, `${r.name} at ${level}`).toBeLessThanOrEqual(r.bases.to);
      used.push(bases);
    }
    // Tight: the fewest is under `from + 1`, the most over `to − 1`.
    expect(Math.min(...used), `${r.name}: the stated ${r.bases.from} is below the floor of the fewest`).toBeLessThan(r.bases.from + 1);
    expect(Math.max(...used), `${r.name}: the stated ${r.bases.to} is above the ceiling of the most`).toBeGreaterThan(r.bases.to - 1);
  }, 300_000);
});

describe('a starter recipe means what the card says: the other modifiers can be anything', () => {
  // Through the app's own path: the solve the card asks for (`priceBasis: 'found'`, the targets and free
  // slots `targetsAt` gives), then the plan read the way Craft along reads it — `locateItem` places a held
  // item in the solved plan, `stepFor` gives the plan's move there. A plan solved without the free slots
  // finishes only a CLEAN item, so it would bin each of these — which the last test says outright.
  const eng = { data, prices: loadFrozenPrices() };
  const effort = { ...limitsFor('standard'), maxMillis: 600_000 };
  /** A Bow modifier at the best tier `ilvl` rolls — a roll the recipe accepts at that level, or junk. */
  const mod = (id: string, ilvl: number): ItemModInput => {
    const tiers = data.mods.get(`Bows/${id}`)!.tiers;
    let j = 0;
    tiers.forEach((t, i) => { if (t.ilvl <= ilvl) j = i; });
    return { modId: `Bows/${id}`, tierDisplay: tiers.length - j };
  };
  const plan = (grade: string, level: number, free = true): EngineMarkovResult => {
    const r = STARTER_RECIPES.find((x) => x.baseId === 'Bows' && x.grade === grade)!;
    const { targets, spare } = targetsAt(data, r, level)!;
    return runSolve(eng, { kind: 'lab', from: { baseId: 'Bows', level }, targets, ...(free ? { spare } : {}), priceBasis: 'found', effort }).markov;
  };
  /** The plan's move for a held item: undefined when the item is finished. */
  const moveFor = (m: EngineMarkovResult, item: ExistingItem): { finished: boolean; action?: string } => {
    const at = locateItem(eng, m, item);
    if (!at.ok) throw new Error(at.reason);
    const node = stepFor(eng, m, at.key)!.nodes[0]!;
    return { finished: node.isGoal, ...(node.action ? { action: node.action } : {}) };
  };
  // Easy Bow at 16: flat Physical and flat Cold (the damage slot), plus Accuracy and three suffixes nobody
  // asked for. Better Bow at 30: flat Physical and Attack Speed, plus flat Cold and a Critical Hit Chance.
  const easyDone: ExistingItem = {
    baseId: 'Bows', level: 16, rarity: 'rare',
    prefixes: [mod('LocalPhysicalDamage', 8), mod('LocalColdDamage', 8), mod('LocalAccuracyRating', 8)],
    suffixes: [mod('LocalIncreasedAttackSpeed', 1), mod('LocalBaseCriticalStrikeChance', 1), mod('LocalCriticalStrikeMultiplier', 8)],
  };
  const betterDone: ExistingItem = {
    baseId: 'Bows', level: 30, rarity: 'rare',
    prefixes: [mod('LocalPhysicalDamage', 16), mod('LocalColdDamage', 8)],
    suffixes: [mod('LocalIncreasedAttackSpeed', 22), mod('LocalBaseCriticalStrikeChance', 1)],
  };

  it('starts from a white base with a Transmute', () => {
    for (const [grade, level] of [['easy', 16], ['better', 30]] as const) {
      const m = plan(grade, level);
      expect(m.bound).toBe('exact');
      expect(m.nodes.find((n) => n.isStart)!.action, grade).toBe('Transmute');
    }
  });

  it('counts an item holding the recipe and anything else as finished', () => {
    expect(moveFor(plan('easy', 16), easyDone)).toEqual({ finished: true });
    expect(moveFor(plan('better', 30), betterDone)).toEqual({ finished: true });
  });

  it('keeps a Magic item that rolled one of the recipe and something unwanted, and finishes it', () => {
    // One recipe modifier and a Critical Hit Chance suffix: the plan puts the other on with its Essence.
    const magic = (level: number, prefix: ItemModInput): ExistingItem =>
      ({ baseId: 'Bows', level, rarity: 'magic', prefixes: [prefix], suffixes: [mod('LocalBaseCriticalStrikeChance', 1)] });
    expect(moveFor(plan('easy', 16), magic(16, mod('LocalPhysicalDamage', 8)))).toEqual({ finished: false, action: 'Lesser Essence of Flames' });
    expect(moveFor(plan('easy', 16), magic(16, mod('LocalColdDamage', 8)))).toEqual({ finished: false, action: 'Lesser Essence of Abrasion' });
    expect(moveFor(plan('better', 30), magic(30, mod('LocalPhysicalDamage', 16)))).toEqual({ finished: false, action: 'Lesser Essence of Haste' });
  });

  it('would bin every one of them if the rest of the item were not free', () => {
    expect(moveFor(plan('easy', 16, false), easyDone)).toEqual({ finished: false, action: START_OVER });
    expect(moveFor(plan('better', 30, false), betterDone)).toEqual({ finished: false, action: START_OVER });
  });
});
