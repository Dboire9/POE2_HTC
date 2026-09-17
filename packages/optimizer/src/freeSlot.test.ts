import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import { optimizeFromItem } from './fromItem.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import type { Prices } from './cost.ts';
import { NO_SPARE } from './slots.ts';

/**
 * FREE SLOTS — "I don't care what lands in that one."
 *
 * A target list has always meant "these mods and nothing else": `isAccepting` demanded zero junk, so
 * anything the player did not name had to come off before the item counted as finished. A free slot
 * relaxes exactly that, per side, and nothing else — `blocked` still has to be empty, the side caps
 * still bind, and no new state is enumerated.
 *
 * THE IDENTITY CASE IS THE REST OF THE SUITE. Every other test in this repo runs without `spare`, so
 * "no free slots changes nothing" is asserted 2,000 times over rather than once here. What this file
 * pins is the part that only exists when there IS one.
 */

const EXACT = { tolerance: 1e-12 } as const;

// ── A synthetic craft small enough to reason about by hand ───────────────────────────────────────
// Two target mods, and one junk mod on each side that nothing can add (weight 0) — so junk exists only
// where the START item is built with it, and every state below is one the test put there.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number, tiers = 1): Mod => ({
  id,
  source: 'normal',
  type,
  family,
  tags: [],
  text: id,
  tiers: Array.from({ length: tiers }, (_, i) => ({ name: `t${i + 1}`, ilvl: 1, weight, ranges: [] })),
});

const MODS: Mod[] = [
  mk('TP', 'prefix', 'FTP', 100, 2), // target prefix, two tiers, so it can also be held BELOW tier
  mk('TS', 'suffix', 'FTS', 100),    // target suffix
  mk('JP', 'prefix', 'FJP', 0),      // junk prefix — ungettable, so only ever carried in
  mk('JS', 'suffix', 'FJS', 0),      // junk suffix
  // A second prefix for the ALTERNATIVES case below: a different family from TP (so both can sit on
  // the item at once) and a different weight (so `markovSymmetry` cannot judge the two interchangeable
  // and collapse the very state the test is about).
  mk('XP', 'prefix', 'FXP', 50, 2),
];

const base: ItemBase = {
  id: 'B',
  name: 'B',
  category: 'C',
  pools: {
    normal: { prefixes: ['TP', 'XP', 'JP'], suffixes: ['TS', 'JS'] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: [], suffixes: [] },
  },
};

const data: PatchData = {
  patch: 't',
  mods: new Map(MODS.map((m) => [m.id, m])),
  bases: new Map([['B', base]]),
};

// Exalt and Annul both 1, everything else dear, so the cheap policy is the obvious one and any cost
// above zero means the model decided something had to be removed.
const prices: Prices = {
  currency: { exalt: 1, annul: 1, chaos: 100, transmute: 1, augment: 1, regal: 1 },
  omens: { OmenofSinistralAnnulment: 50, OmenofDextralAnnulment: 50 },
};

const at = (id: string, tier = 1) => ({ modId: id, tierName: `t${tier}` });
const rare = (pre: readonly string[], suf: readonly string[], tiers: Record<string, number> = {}): ItemState => ({
  base,
  level: 100,
  rarity: 'rare',
  prefixes: pre.map((id) => at(id, tiers[id] ?? 1)),
  suffixes: suf.map((id) => at(id, tiers[id] ?? 1)),
});

const WANT = [{ modId: 'TP' }, { modId: 'TS' }] as const;

describe('a free slot — what the model accepts as finished', () => {
  /**
   * The headline case, and the one the feature exists for: an item that is exactly the target apart
   * from one modifier nobody asked about.
   *
   * Zero is a much stronger assertion than "cheaper". It says the model considers the item FINISHED —
   * `isAccepting` is true of the start state — which is the whole claim, and it is reached through the
   * short-circuit that answers before a lattice exists. An empty policy proves that path was taken.
   */
  it('finishes an item that carries one modifier nobody asked for', () => {
    const held = rare(['TP'], ['TS', 'JS']);
    const strict = markovFromItem(data, prices, held, WANT, EXACT);
    expect(strict.expectedCost).toBeGreaterThan(0); // the junk suffix has to be annulled off

    const free = markovFromItem(data, prices, held, WANT, { ...EXACT, spare: { prefixes: 0, suffixes: 1 } });
    expect(free.feasible).toBe(true);
    expect(free.expectedCost).toBe(0);
    expect(free.policy.size).toBe(0);
  });

  /**
   * A free SUFFIX is not a free prefix. The counts are per side because the item's slots are, and a
   * player who tolerates a spare suffix has said nothing about their prefixes.
   */
  it('does not let a junk prefix through a free suffix', () => {
    const held = rare(['TP', 'JP'], ['TS']);
    const wrongSide = markovFromItem(data, prices, held, WANT, { ...EXACT, spare: { prefixes: 0, suffixes: 1 } });
    expect(wrongSide.expectedCost).toBeGreaterThan(0);

    const rightSide = markovFromItem(data, prices, held, WANT, { ...EXACT, spare: { prefixes: 1, suffixes: 0 } });
    expect(rightSide.expectedCost).toBe(0);
  });

  /**
   * A NAMED target rolled below the tier you asked for is not junk, and no amount of tolerance makes
   * it acceptable — its slot is simply unfilled, and the goal demands every slot.
   *
   * This one is carried by the SLOT test in `isAccepting`, not by its `blocked` clause: an unfilled
   * slot fails whatever `blocked` says. The case that rests on `blocked` is the one below it.
   */
  it('still refuses a target that rolled below its tier, however free the slots are', () => {
    // Engine tiers run WORST-first, so `t1` is the bottom of TP's two and `minTierIndex: 1` asks for
    // the top one. The item holds the bottom: the family is occupied, the goal unmet.
    const held = rare(['TP'], ['TS'], { TP: 1 });
    const want = [{ modId: 'TP', minTierIndex: 1 }, { modId: 'TS' }];
    const generous = markovFromItem(data, prices, held, want,
      { ...EXACT, spare: { prefixes: 3, suffixes: 3 } });
    expect(generous.feasible).toBe(true);
    expect(generous.expectedCost).toBeGreaterThan(0);
  });

  /**
   * …and the `blocked` clause itself, which only bites where a slot is filled AND carries an off-tier
   * roll: one slot offering TP or XP, TP landed at the tier asked, XP sitting on the item below it.
   *
   * A free slot must not reach this. `spare` is about mods you never NAMED; an off-tier roll of a mod
   * you did name is a different thing, and whether the engine should insist on removing it is a
   * question that predates free slots and is not theirs to answer. The assertion is therefore
   * equality with the strict run, not a claim about which answer is right.
   */
  it('does not reach an off-tier roll of a named alternative', () => {
    const want = [
      { modId: 'TP', minTierIndex: 1, slot: 0 },
      { modId: 'XP', minTierIndex: 1, slot: 0 },
      { modId: 'TS' },
    ];
    const held = rare(['TP', 'XP'], ['TS'], { TP: 2, XP: 1 }); // TP at the top tier, XP at the bottom
    const strict = markovFromItem(data, prices, held, want, EXACT);
    const free = markovFromItem(data, prices, held, want,
      { ...EXACT, spare: { prefixes: 1, suffixes: 1 } });
    expect(strict.expectedCost).toBeGreaterThan(0);
    expect(free.expectedCost).toBe(strict.expectedCost);
  });

  /**
   * A free slot the side has no room for is INERT rather than an error.
   *
   * `enumerateStates` never emits a state whose targets plus junk exceed the side cap, so the widened
   * accepting set simply has nothing extra to accept — which is why nothing in the engine validates
   * `spare` against the item's limits. The UI refuses it up front (`roomOnSide`) so the player is told;
   * down here it has to be harmless, and "byte-identical cost" is how that is said.
   */
  it('is inert on a side with no room for it', () => {
    const three = [{ modId: 'TP' }, { modId: 'JP' }, { modId: 'TS' }];
    const held = rare(['TP'], ['TS']);
    const strict = markovFromItem(data, prices, held, three, EXACT);
    const free = markovFromItem(data, prices, held, three,
      { ...EXACT, spare: { prefixes: 1, suffixes: 0 } }); // prefixes already full at 3
    expect(free.expectedCost).toBe(strict.expectedCost);
    expect(free.feasible).toBe(strict.feasible);
  });

  /** `NO_SPARE` is spelled out, so the default is pinned rather than assumed to be the absent case. */
  it('reads an explicit NO_SPARE exactly as it reads no option at all', () => {
    const held = rare(['TP'], ['TS', 'JS']);
    const absent = markovFromItem(data, prices, held, WANT, EXACT);
    const explicit = markovFromItem(data, prices, held, WANT, { ...EXACT, spare: NO_SPARE });
    expect(explicit.expectedCost).toBe(absent.expectedCost);
  });
});

describe('a free slot — what the step planner does with it', () => {
  /**
   * The Item tab's two panels have to agree. The model above stops at an item carrying junk; if the
   * step plan beside it still said "annul that", the player would be reading two answers to the same
   * question.
   *
   * A kept junk mod becomes indistinguishable from a fractured one — still on the item, still holding
   * its slot and family, simply never removed — which is why this needed no new concept in `plan.ts`.
   */
  it('leaves the junk where it is, instead of annulling it', () => {
    const held = rare(['TP'], ['JS']); // TS still missing, so there is real work either way
    const touchesJunk = (r: ReturnType<typeof optimizeFromItem>): boolean[] =>
      r.frontier.map((p) => p.steps.some((s) => 'remove' in s && s.remove === 'JS'));

    const strict = optimizeFromItem(data, prices, held, WANT);
    expect(strict.frontier.length).toBeGreaterThan(0);
    expect(touchesJunk(strict).every(Boolean)).toBe(true);

    const free = optimizeFromItem(data, prices, held, WANT, { spare: { prefixes: 0, suffixes: 1 } });
    expect(free.frontier.length).toBeGreaterThan(0);
    expect(touchesJunk(free).some((x) => !x)).toBe(true);
  });

  /**
   * …and it is strictly better here, which is the point of running both and letting dominance decide
   * rather than assuming: one fewer Annulment, and the suffix side had room for the missing target
   * anyway.
   */
  it('wins on probability when the side has room for it', () => {
    const held = rare(['TP'], ['JS']);
    const best = (r: ReturnType<typeof optimizeFromItem>): number =>
      Math.max(...r.frontier.map((p) => p.probability));
    expect(best(optimizeFromItem(data, prices, held, WANT, { spare: { prefixes: 0, suffixes: 1 } })))
      .toBeGreaterThan(best(optimizeFromItem(data, prices, held, WANT)));
  });
});

describe('a free slot on real data — the Sceptre this was built for', () => {
  const real = loadPatch('data/patches/0.5.0');
  const realPrices = loadFrozenPrices();
  const sceptres = real.bases.get('Sceptres')!;
  const white: ItemState = { base: sceptres, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  // Three prefixes and two suffixes named; the sixth position is the one the player doesn't care about.
  const five = [
    { modId: 'Sceptres/LocalIncreasedSpiritPercent' },
    { modId: 'Sceptres/IncreasedMana' },
    { modId: 'Sceptres/AlliesInPresenceAllDamage' },
    { modId: 'Sceptres/AlliesInPresenceIncreasedCastSpeed' },
    { modId: 'Sceptres/AlliesInPresenceCriticalStrikeChance' },
  ];

  /**
   * Naming every remaining suffix as an alternative — the only way to express this before — is refused
   * at nine candidates. A Sceptre has 14 normal suffixes in 14 distinct families, so nothing merges and
   * five named plus twelve alternatives is seventeen. That refusal is NOT what a free slot relaxes, and
   * pinning it here is what stops this test being read as "the cap went away".
   */
  it('is a different thing from naming every alternative, which is still refused', () => {
    const named = new Set(five.map((t) => t.modId));
    const rest = sceptres.pools.normal.suffixes.filter((id) => !named.has(id));
    expect(rest.length).toBe(12);
    const asAlternatives = markovFromItem(real, realPrices, white,
      [...five, ...rest.map((id) => ({ modId: id, slot: 9 }))], { solver: 'policy', restartCost: 0 });
    expect(asAlternatives.feasible).toBe(false);
    expect(asAlternatives.reason).toMatch(/more than 9 candidate mods/);
  });

  /**
   * And it is CHEAPER than the craft it relaxes, which is the property that makes it worth having
   * rather than merely expressible. Measured at the time of writing: 366.84 ex strict against 191.27
   * with one free suffix. Asserted as an inequality because the price sheet moves and the point does
   * not — a wider accepting set cannot cost more.
   */
  it('costs less than demanding the same five mods and nothing else', () => {
    const opts = { solver: 'policy', restartCost: 0 } as const;
    const strict = markovFromItem(real, realPrices, white, five, opts);
    const free = markovFromItem(real, realPrices, white, five,
      { ...opts, spare: { prefixes: 0, suffixes: 1 } });
    expect(strict.feasible).toBe(true);
    expect(free.feasible).toBe(true);
    expect(free.expectedCost).toBeLessThan(strict.expectedCost);
    // Two full solves of a five-target craft on real data: ~10s alone, ~35s under a parallel suite,
    // so the 30s default is not a ceiling this can sit under. Same allowance the other real-data MDP
    // tests take (markovEssence, craftedCap).
  }, 120_000);
});
