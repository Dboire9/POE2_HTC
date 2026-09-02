import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { markovFromItem, actionCostOf } from './markovFromItem.ts';
import type { Prices } from './cost.ts';
import { pricesForBase, stepCost } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { optimizePareto } from './optimize.ts';
import { mulberry32 } from './simulate.ts';
import { createActionSpace } from './markovActions.ts';
import { FLAG_NONE, decodeState, encodeState, sideIndexOf } from './markovState.ts';
import type { McRarity, McTarget } from './markovState.ts';

/**
 * The MDP's REGULAR-Essence action.
 *
 * A regular essence forces its mod on and converts the item Magic → Rare, removing nothing — the
 * mirror of `essenceForcedProbability`. Until 2026-08-28 the model had no such action, so any craft
 * naming an essence-only mod came back with no true cost at all and fell through to the step routes.
 *
 * Its tiers ARE its levels (Lesser / Essence / Greater, ascending), so the index into `mod.tiers` is
 * both the tier the player receives and the essence they buy.
 */

const EXACT = { tolerance: 1e-12 } as const;

// ── A synthetic craft whose cost is arithmetic, not a fixture ────────────────────────────────────
// normal prefixes [P1] · normal suffixes []  ⇒ a Transmute can only ever land P1
// essence suffixes [E1]                      ⇒ the only way to a suffix is the Essence
// So {P1, E1} from white is a deterministic two-step: Transmute, then Essence. E = 0.2 + 5 = 5.2.
const mk = (
  id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source'],
  tiers: { name: string; ilvl: number }[] = [{ name: 't1', ilvl: 1 }],
): Mod => ({
  id, source, type, family, tags: [], text: id,
  tiers: tiers.map((t) => ({ ...t, weight: source === 'normal' ? 100 : 0, ranges: [] })),
});

const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: {
    normal: { prefixes: ['P1'], suffixes: [] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: [], suffixes: ['E1'] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['P1', mk('P1', 'prefix', 'FP1', 'normal')],
    // Three levels, exactly as the shipped data has: index 0 = Lesser (weakest, lowest ilvl).
    ['E1', mk('E1', 'suffix', 'FE1', 'essence',
      [{ name: 'Lesser Essence of E', ilvl: 1 }, { name: 'Essence of E', ilvl: 30 },
        { name: 'Greater Essence of E', ilvl: 60 }])],
  ]),
  bases: new Map([['S', base]]),
};
// Every level priced differently so a test can tell WHICH one the model bought. The per-essence keys
// live in `currency` alongside the orbs — `stepCost` looks up `essence:<level>:<modId>` there and falls
// back to the per-level `essence_*` key, so a fixture that files them elsewhere silently charges 0.
const prices: Prices = {
  currency: {
    transmute: 0.2, exalt: 1, annul: 1, chaos: 100, regal: 1,
    'essence:lesser:E1': 5, 'essence:normal:E1': 50, 'essence:greater:E1': 500,
  },
  omens: {},
};

const white = (level = 100): ItemState =>
  ({ base, level, rarity: 'normal', prefixes: [], suffixes: [] });

describe('a regular Essence forces its mod and converts Magic → Rare', () => {
  it('a deterministic two-step from white costs exactly transmute + essence', () => {
    const r = markovFromItem(data, prices, white(), [{ modId: 'P1' }, { modId: 'E1' }],
      { ...EXACT, restartCost: 0 });
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    // Transmute (0.2) always lands P1 — it is the only weighted mod — then the Lesser Essence (5)
    // forces E1 and converts. Nothing is random, so there is nothing to average.
    expect(r.expectedCost).toBeCloseTo(5.2, 9);
  });

  it('buys the level the wanted tier needs, and no better', () => {
    const cost = (minTierIndex: number): number => markovFromItem(
      data, prices, white(), [{ modId: 'P1' }, { modId: 'E1', minTierIndex }], { ...EXACT, restartCost: 0 },
    ).expectedCost;
    // minTierIndex is the WORST acceptable tier, and an essence's tiers ascend, so index 0 accepts the
    // Lesser and index 2 demands the Greater. The three prices are 5 / 50 / 500 apart precisely so a
    // wrong level cannot hide inside a rounding tolerance.
    expect(cost(0)).toBeCloseTo(0.2 + 5, 9);
    expect(cost(1)).toBeCloseTo(0.2 + 50, 9);
    expect(cost(2)).toBeCloseTo(0.2 + 500, 9);
  });

  /**
   * The ilvl gate, which is the one condition that can make an essence craft impossible outright.
   *
   * `Greater Essence of E` is ilvl 60, so on an ilvl-50 base it cannot be applied at all — and no
   * cheaper level satisfies a target that asked for that tier, because a lower level IS a lower tier.
   */
  it('will not apply a level the item outranks', () => {
    const r = markovFromItem(data, prices, white(50), [{ modId: 'P1' }, { modId: 'E1', minTierIndex: 2 }],
      { ...EXACT, restartCost: 0 });
    expect(r.feasible).toBe(false);
    // …while the same craft at a level that admits it is fine, so this is the ilvl and not the target.
    expect(markovFromItem(data, prices, white(60), [{ modId: 'P1' }, { modId: 'E1', minTierIndex: 2 }],
      { ...EXACT, restartCost: 0 }).feasible).toBe(true);
  });

  it('is not offered when the player has excluded it', () => {
    const r = markovFromItem(data, prices, white(), [{ modId: 'P1' }, { modId: 'E1' }],
      { ...EXACT, restartCost: 0, policy: { excluded: new Set(['essence:lesser:E1']) } });
    expect(r.feasible).toBe(false); // the Essence is the only route to a suffix on this base
  });

  /**
   * A regular Essence needs a MAGIC item, so a held Rare can never apply one.
   *
   * The refusal has to NAME that, because the generic reachability failure ("no policy reaches the
   * target") tells the reader nothing they can act on — and the fix is not "raise Search effort", it
   * is "this route does not exist from the item you are holding".
   */
  it('refuses on a held Rare, and says why', () => {
    const rare: ItemState = { base, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(data, prices, rare, [{ modId: 'P1' }, { modId: 'E1' }], EXACT);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/needs a Magic item/);
    expect(r.reason).toContain('E1');
  });

  it('does not refuse a held Rare that already carries the essence mod', () => {
    const held: ItemState = {
      base, level: 100, rarity: 'rare',
      prefixes: [], suffixes: [{ modId: 'E1', tierName: 'Lesser Essence of E' }],
    };
    // E1 is already present, so the craft needs no Essence at all — only P1, by Exalt.
    const r = markovFromItem(data, prices, held, [{ modId: 'P1' }, { modId: 'E1' }], EXACT);
    expect(r.feasible).toBe(true);
  });
});

/**
 * Two guards that a COST test cannot reach, asserted on the action space directly.
 *
 * Both are cases where the wrong answer is still a legal route at a higher price, so the argmin hides
 * them: an Essence wrongly offered on a Rare simply loses to the cheaper Magic route, and a side-room
 * check against the wrong cap only refuses a craft that had another way through. Mutation testing found
 * both surviving the cost tests above, which is exactly what it is for.
 */
describe('when the Essence action is offered at all', () => {
  const list: McTarget[] = [
    { mods: [{ mod: data.mods.get('P1')!, minIndex: 0 }], type: 'prefix', fractured: false },
    { mods: [{ mod: data.mods.get('E1')!, minIndex: 0 }], type: 'suffix', fractured: false },
  ];
  const space = createActionSpace({
    data, prices: pricesForBase(prices, base), level: 100, pools: base.pools, list,
    side: sideIndexOf(list), desecratable: false, bossTargetable: false,
  });
  const essenceAt = (rarity: McRarity, jp = 0, js = 0) => space
    .actionsOf(decodeState(encodeState(0, 0, jp, js, FLAG_NONE, rarity)))
    .filter((a) => a.action.currency === 'essence');

  it('needs a Magic item — never offered on a Rare or a white base', () => {
    expect(essenceAt('magic')).toHaveLength(1);   // the case it exists for
    expect(essenceAt('rare')).toEqual([]);        // a regular Essence cannot touch a Rare
    expect(essenceAt('normal')).toEqual([]);      // …nor a white base, which has no mods to convert
  });

  /**
   * The slot it needs is a slot on the item it PRODUCES.
   *
   * An Essence converts as it adds, so the room check is against the Rare cap exactly as a Regal's is.
   * A Magic item already carrying one suffix has no room by the MAGIC cap (1 per side) and plenty by
   * the Rare one (3) — so checking the wrong cap silently refuses a legal essence on the commonest
   * shape there is: a transmuted item that happens to have rolled the other side.
   */
  it('measures side room against the Rare cap, because that is the item it makes', () => {
    expect(essenceAt('magic', 0, 1)).toHaveLength(1);
    // …and it is genuinely full-aware: three suffixes fill the Rare side, and then there is no room.
    expect(essenceAt('magic', 0, 3)).toEqual([]);
  });
});

// ── Against the shipped 0.5.0 data ───────────────────────────────────────────────────────────────
describe('the Essence action on real data', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadPrices('data/patches/0.5.0');
  const wand = real.bases.get('Wands')!;
  const whiteWand: ItemState = { base: wand, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  const ESS = 'Wands/Essence_IncreasedCastSpeed';
  const SPELL = 'Wands/WeaponSpellDamage';

  /**
   * BOTH PLANNERS MUST BUY THE SAME ESSENCE. This is the D8 check.
   *
   * The linear planner picks its level as `clamp(minTierIndex)` (optimize.ts) and prices it through
   * `essence:<level>:<modId>`. The MDP mirrors that choice deliberately rather than shopping for a
   * cheaper level that would also satisfy the target — because two models pricing one step differently
   * is exactly how the desecration mispricing survived. If the MDP ever starts choosing for itself,
   * this is the test that says so.
   */
  it('picks the same essence level the linear planner does', () => {
    for (const minTierIndex of [0, 2]) {
      const targets = [{ modId: SPELL }, { modId: ESS, minTierIndex }];
      const pareto = optimizePareto(real, rp, wand, targets, { level: 82 });
      const linear = pareto.frontier
        .flatMap((p) => p.steps).find((st) => st.currency === 'essence');
      expect(linear, 'the linear planner must plan an essence step').toBeDefined();

      const r = markovFromItem(real, rp, whiteWand, targets, { restartCost: 0, solver: 'policy' });
      expect(r.feasible).toBe(true);
      const mdp = r.edges.map((e) => e.action).find((a) => a.currency === 'essence');
      expect(mdp, 'the MDP must play an essence action').toBeDefined();
      if (mdp?.currency !== 'essence' || linear?.currency !== 'essence') throw new Error('narrowing');

      expect(mdp.tierIndex).toBe(linear.essenceTier);
      expect(mdp.level).toBe(linear.essenceLevel);
      // …and therefore the same price, which is the thing that actually reaches the player. Compared
      // through the two DIFFERENT entry points on purpose: `actionCostOf` translates an McAction and
      // `stepCost` reads a PlanStep, so this fails if the translation ever drops a field pricing needs.
      const money = actionCostOf(pricesForBase(rp, wand), mdp);
      expect(money).toBe(stepCost(pricesForBase(rp, wand), linear));
      expect(money).toBeGreaterThan(0); // a 0 here would mean the key missed and nothing noticed
    }
  }, 120_000);

  /**
   * A P=1 edge is where a mis-encoded successor hides — nothing else in the distribution can dilute
   * it — so playing the published policy and averaging the spend is the check worth having.
   */
  it('40k policy runs match the cost it reports', () => {
    const r = markovFromItem(real, rp, whiteWand, [{ modId: SPELL }, { modId: ESS }],
      { restartCost: 0, solver: 'policy' });
    expect(r.feasible).toBe(true);

    const byFrom = new Map<string, typeof r.edges>();
    for (const e of r.edges) byFrom.set(e.from, [...(byFrom.get(e.from) ?? []), e]);
    const goal = new Set(r.nodes.filter((n) => n.isGoal).map((n) => n.key));
    const rand = mulberry32(7);
    let total = 0;
    const RUNS = 40_000;
    for (let run = 0; run < RUNS; run++) {
      let at = r.nodes.find((n) => n.isStart)!.key;
      for (let step = 0; step < 2_000 && !goal.has(at); step++) {
        const outs = byFrom.get(at);
        if (!outs || outs.length === 0) break;
        total += actionCostOf(rp, outs[0]!.action);
        let roll = rand();
        let next = outs[outs.length - 1]!.to;
        for (const e of outs) { roll -= e.prob; if (roll <= 0) { next = e.to; break; } }
        at = next;
      }
    }
    expect(Math.abs(total / RUNS - r.expectedCost) / r.expectedCost).toBeLessThan(0.05);
  }, 120_000);

  it('still caps an item at one essence modifier, regular and perfect counted together', () => {
    const r = markovFromItem(real, rp, whiteWand,
      [{ modId: ESS }, { modId: 'Wands/PerfectEssence_IncreasedMana' }], { restartCost: 0 });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/at most one essence modifier/);
  });
});
