import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { bossOmenAllowed, desecrationBoneFor } from '../../engine/src/probability.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';
import { markovFromItem } from './markovFromItem.ts';
import { pricesForBase } from './cost.ts';
import { createActionSpace } from './markovActions.ts';
import { FLAG_NONE, decodeState, encodeState, flaggedTarget, popcount, representative, sideIndexOf } from './markovState.ts';
import type { McTarget } from './markovState.ts';

// The boss omens read "your next WEAPON OR JEWELLERY Desecration attempt will guarantee a random
// Ulaman/Amanamu/Kurgal modifier". Nothing gated on that, so the planners offered boss-targeted
// desecration on ARMOUR too — 342 of the 527 desecrated mods in the shipped data sit on armour bases,
// so roughly two thirds of desecrated crafts were being planned around a step the game refuses.
const data = loadPatch('data/patches/0.5.0');
// FROZEN, not the shipped sheet. What this asserts is a property of the MODEL, but it is computed
// from prices, so on the live sheet it is really an assertion about this week's economy. The
// Forbidden Rites league start proved that: nothing in the engine changed and it went red, because
// four orb strengths had not traded yet and kept their Runes of Aldur values. CLAUDE.md already
// requires a test asserting an exact cost to read `loadFrozenPrices()`; a test asserting a cost
// ORDERING is the same claim wearing a different hat. `priceResolution` and `costConsistency` remain
// on the live sheet, and they are the refresh's guard.
const prices = loadFrozenPrices();

/**
 * A base of each kind, plus a desecrated mod from its pool and THREE rollable mods of distinct
 * families. Three, because a from-white craft only reaches Rare after transmute → augment → regal, and
 * a Desecration needs a Rare item — with fewer targets the desecrate step scores 0 and the frontier
 * comes back empty, which would make these assertions pass while proving nothing.
 */
const pick = (baseId: string) => {
  const base = data.bases.get(baseId)!;
  const des = base.pools.desecrated.prefixes[0] ?? base.pools.desecrated.suffixes[0]!;
  const desMod = data.mods.get(des)!;
  const used = new Set([desMod.family]);
  const take = (ids: readonly string[], n: number): string[] => {
    const out: string[] = [];
    for (const id of ids) {
      const m = data.mods.get(id);
      if (!m || m.source !== 'normal' || used.has(m.family)) continue;
      used.add(m.family);
      out.push(id);
      if (out.length === n) break;
    }
    return out;
  };
  const preNeed = desMod.type === 'prefix' ? 1 : 2; // keep within 3 per side once the desecrated lands
  const rollable = [...take(base.pools.normal.prefixes, preNeed), ...take(base.pools.normal.suffixes, 3 - preNeed)];
  return { base, des, rollable };
};
const WEAPON = pick('Wands');
const ARMOUR = pick('Body_Armours_dex_int');

describe('bone mapping, straight from the item text', () => {
  it('routes each gear kind to the bone that desecrates it', () => {
    expect(desecrationBoneFor('Wands')).toBe('jawbone');       // "a Rare Weapon or Quiver"
    expect(desecrationBoneFor('Quivers')).toBe('jawbone');
    expect(desecrationBoneFor('Body_Armours')).toBe('rib');    // "a Rare Armour"
    expect(desecrationBoneFor('Foci')).toBe('rib');
    expect(desecrationBoneFor('Amulets')).toBe('collarbone');  // "a Rare Amulet, Ring or Belt"
    expect(desecrationBoneFor('Rings')).toBe('collarbone');
  });

  // An unmapped category must not silently unlock boss targeting: claiming a plan works when the game
  // would refuse it is the worse failure, so the fallback is the armour one.
  it('treats an unknown category as armour rather than assuming the permissive case', () => {
    expect(desecrationBoneFor('SomeFutureCategory')).toBe('rib');
    expect(bossOmenAllowed('SomeFutureCategory')).toBe(false);
  });

  it('allows boss targeting exactly on Weapon or Jewellery', () => {
    expect(bossOmenAllowed('Wands')).toBe(true);
    expect(bossOmenAllowed('Amulets')).toBe(true);
    expect(bossOmenAllowed('Body_Armours')).toBe(false);
    expect(bossOmenAllowed('Helmets')).toBe(false);
  });
});

const bossSteps = (frontier: readonly { steps: readonly unknown[] }[]) =>
  frontier.flatMap((p) => p.steps).filter((s) => (s as { boss?: string }).boss !== undefined);

describe('from-white planner', () => {
  const targets = (p: typeof WEAPON) =>
    [...p.rollable.map((modId) => ({ modId, minTierIndex: 0 })), { modId: p.des, minTierIndex: 0 }];

  // The control: without it, the armour assertion below could pass simply because nothing desecrates.
  it('still boss-targets on a weapon', () => {
    const r = optimizePareto(data, prices, WEAPON.base, targets(WEAPON), { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    expect(bossSteps(r.frontier).length).toBeGreaterThan(0);
  });

  it('never boss-targets on armour, but still plans the untargeted draw', () => {
    const r = optimizePareto(data, prices, ARMOUR.base, targets(ARMOUR), { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0); // desecration still works there…
    expect(r.frontier.flatMap((p) => p.steps).some((s) => s.currency === 'desecrate')).toBe(true);
    expect(bossSteps(r.frontier)).toEqual([]); // …just not boss-targeted
  });
});

describe('from-item planner', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });

  it('still boss-targets on a weapon', () => {
    const r = optimizeFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect(bossSteps(r.frontier).length).toBeGreaterThan(0);
  });

  it('never boss-targets on armour', () => {
    const r = optimizeFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(bossSteps(r.frontier)).toEqual([]);
  });
});

describe('MDP', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });

  it('models a boss-targeted desecration on a weapon', () => {
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(true);
  });

  // REGRESSION. Gating the boss omen correctly is only half the fix: for a while the MDP's ONLY
  // desecrate action carried one, so armour lost the ability to desecrate at all and the planner
  // reported `feasible: false` for a craft the game performs happily. That is 342 of 527 desecrated
  // mods — the majority — told they were impossible.
  it('plans armour with the untargeted draw instead of declining it', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
    expect(Number.isFinite(r.expectedCost)).toBe(true);
  });

  // …and it must be the UNTARGETED draw, not a boss omen smuggled in by the new action.
  it('never puts a boss omen in an armour policy', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    const desecrations = [...r.policy.values()].filter((a) => a.currency === 'desecrate');
    expect(desecrations.length).toBeGreaterThan(0);
    expect(desecrations.every((a) => a.boss === undefined)).toBe(true);
  });

  // The control. A weapon must still be able to buy the narrower boss draw, or the assertion above
  // would pass simply because nothing anywhere targets a boss.
  it('still offers a boss-targeted desecration somewhere in a weapon policy', () => {
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect([...r.policy.values()].some((a) => a.currency === 'desecrate' && a.boss !== undefined)).toBe(true);
  });

  // A player who owns no omens at all still has a bone. Before the untargeted action existed, excluding
  // omens removed the last desecrate action on EVERY base, weapons included.
  it('keeps a desecrated target reachable when every omen is excluded', () => {
    const noOmens = { excluded: new Set(Object.keys(prices.omens)) };
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ], { policy: noOmens });
    expect(r.feasible).toBe(true);
  });
});

// Value iteration 0-initialises and climbs, so an UNCONVERGED result is a strict lower bound on the
// true expected cost, not an estimate. `markovFromItem` used to report that number with no indication
// and the UI printed it as a plain figure — the most precise-looking wrong number in the app.
//
// Pinned with an absurdly small `maxIters` rather than a slow real craft: it is instant, deterministic,
// and it survives the pool data changing underneath. (It was originally pinned on an armour
// desecration, which stopped working as a fixture the moment desecrated weights went 1 → 1000 and the
// solve started converging in 159ms instead of exhausting 100k sweeps.)
describe('MDP — convergence is reported, not assumed', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });
  const targetsOf = (p: typeof WEAPON) =>
    [{ modId: p.rollable[0]!, minTierIndex: 0 }, { modId: p.des, minTierIndex: 0 }];

  it('flags a solve that ran out of sweeps', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), targetsOf(ARMOUR), { maxIters: 3 });
    expect(r.feasible).toBe(true);
    expect(r.converged).toBe(false);
  });

  // The control: left to finish, the same craft converges — otherwise the flag would be constant noise.
  it('converges when allowed to run', () => {
    expect(markovFromItem(data, prices, start(ARMOUR), targetsOf(ARMOUR)).converged).toBe(true);
    expect(markovFromItem(data, prices, start(WEAPON), targetsOf(WEAPON)).converged).toBe(true);
  });

  // An unconverged value is a LOWER bound: more sweeps can only raise it.
  it('reports a floor, so more sweeps only raise the number', () => {
    const few = markovFromItem(data, prices, start(ARMOUR), targetsOf(ARMOUR), { maxIters: 3 });
    const done = markovFromItem(data, prices, start(ARMOUR), targetsOf(ARMOUR));
    expect(few.expectedCost).toBeLessThanOrEqual(done.expectedCost + 1e-9);
  });

  // A rejected target never ran VI at all; reporting `converged: false` there would imply the number
  // was a floor when it is simply absent.
  //
  // This used to reject a MAGIC item, which the model now handles (it opens with a Regal), so the
  // rejection has to come from somewhere still real: excluding every currency that could add the
  // missing mod leaves the policy with no route at all.
  it('reports a rejection as converged rather than as a floor', () => {
    const everyAdd = new Set([
      'exalt', 'exalt_greater', 'exalt_perfect', 'chaos', 'desecrate',
      'transmute', 'transmute_greater', 'transmute_perfect',
      'augment', 'augment_greater', 'augment_perfect',
      'regal', 'regal_greater', 'regal_perfect',
    ]);
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 },
      { modId: WEAPON.rollable[1]!, minTierIndex: 0 },
    ], { policy: { excluded: everyAdd } });
    expect(r.feasible).toBe(false);
    expect(r.converged).toBe(true);
  });
});

// The desecrated spawn weight is an ASSUMPTION (see shipped-pools.test.ts), and only the UNOMENED
// draw inherits it — a boss-omened Desecration is count-uniform and ignores weights entirely. The UI
// caveat keys off exactly this distinction (`assumedOdds` in engineMap.ts → PriceBasisNote's
// `exactOdds`), so it has to hold at the source: warn on armour, stay silent on a weapon.
/**
 * A Chaos Orb takes the desecrated mod at the same odds as anything else.
 *
 * This was ruled the other way on 2026-08-24 ("we cannot use a Chaos Orb on desecrated modifiers, even
 * if they are normal modifiers gotten through desecration"), the ruling was RETRACTED in the same
 * conversation, and the retraction was missed — so a restriction shipped that the game does not have.
 * It went out twice, first as an outright immunity and then as a preference, and both were wrong.
 *
 * Asserted rather than merely deleted, because the restriction was plausible enough to be built twice.
 */
describe('a Chaos Orb has no special treatment for the desecrated mod', () => {
  it('can remove it, and the item is clean afterwards', () => {
    const base = data.bases.get('Wands')!;
    const out: string[] = [];
    const fams = new Set<string>();
    for (const id of [...base.pools.normal.prefixes, ...base.pools.normal.suffixes]) {
      const m = data.mods.get(id);
      if (!m || m.source !== 'normal' || fams.has(m.family)) continue;
      const np = out.filter((x) => data.mods.get(x)!.type === 'prefix').length;
      if (m.type === 'prefix' ? np >= 2 : out.length - np >= 2) continue;
      fams.add(m.family);
      out.push(id);
      if (out.length === 3) break;
    }
    const carved = base.pools.desecrated.suffixes[0]!;
    // A held Rare carrying an unwanted desecrated suffix, plus an ordinary junk prefix — so there IS
    // something else for a Chaos to take, which is exactly the case the retracted rule got wrong.
    const junkPrefix = base.pools.normal.prefixes.find((id) => {
      const m = data.mods.get(id);
      return m && m.source === 'normal' && !fams.has(m.family);
    })!;
    const stuck: ItemState = {
      base, level: 82, rarity: 'rare', desecrated: true,
      prefixes: [{ modId: junkPrefix, tierName: data.mods.get(junkPrefix)!.tiers[0]!.name }],
      suffixes: [{ modId: carved, tierName: data.mods.get(carved)!.tiers[0]!.name }],
    };
    const r = markovFromItem(data, prices, stuck, out.map((modId) => ({ modId, minTierIndex: 0 })));
    expect(r.feasible).toBe(true);
    const byKey = new Map(r.nodes.map((nd) => [nd.key, nd]));
    const clearsIt = r.edges.some((e) => e.action.currency === 'chaos'
      && byKey.get(e.from)?.desecratedJunk === 'suffix'
      && byKey.get(e.to)?.desecratedJunk === undefined);
    expect(clearsIt).toBe(true);
  });
});

/**
 * A bone is worth playing even when you want NO carved mod — it is the cheapest way to add an
 * ordinary one on most bases.
 *
 * It offers three modifiers and you keep one, and a Preserved rib is 0.31ex against an Exalt's 1.00ex.
 * Measured on a held Rare (no restart, so the bone competes on merit), at the carved spawn weight
 * measured in game on 2026-08-24: Wands 4,073.8ex -> 2,493.7ex, Body Armour 2,967.6ex -> 1,396.4ex.
 * The model used to switch desecration off entirely unless a carved mod was targeted, so none of that
 * was reachable.
 *
 * The gate that replaced it is a NECESSARY condition, not a heuristic: the offer raises the chance of
 * a hit by at most `DESECRATION_OFFER_COUNT` (1−(1−p)^m ≤ m·p), and a bone's per-draw p is strictly
 * below an Exalt's because its denominator also carries the carved pool. So a bone priced at m Exalts
 * or more cannot win, and skipping it costs nothing — which is what keeps the desJunk axis, and the 3x
 * states it brings, off a craft that could never have used it. On amulets and rings the collarbone is
 * 7.69ex and the gate closes.
 */
describe('a bone competes for ordinary mods too, where its price allows', () => {
  const heldRare = (baseId: string) => {
    const base = data.bases.get(baseId)!;
    const out: string[] = [];
    const fams = new Set<string>();
    for (const id of [...base.pools.normal.prefixes, ...base.pools.normal.suffixes]) {
      const m = data.mods.get(id);
      if (!m || m.source !== 'normal' || fams.has(m.family)) continue;
      const np = out.filter((x) => data.mods.get(x)!.type === 'prefix').length;
      if (m.type === 'prefix' ? np >= 2 : out.length - np >= 2) continue;
      fams.add(m.family);
      out.push(id);
      if (out.length === 3) break;
    }
    // A Rare you already hold: no `restartCost`, so nothing masks the comparison.
    const start: ItemState = { base, level: 82, rarity: 'rare', prefixes: [], suffixes: [] };
    return { start, targets: out.map((modId) => ({ modId, minTierIndex: 0 })) };
  };
  const solve = (baseId: string, excludeBones: boolean) => {
    const { start, targets } = heldRare(baseId);
    return markovFromItem(data, prices, start, targets,
      excludeBones ? { policy: { excluded: new Set(['desecrate']) } } : {});
  };

  it('plays a Desecration for a craft with no carved target at all, and it is much cheaper', () => {
    const targets = heldRare('Wands').targets;
    expect(targets.every((t) => data.mods.get(t.modId)!.source === 'normal')).toBe(true);
    const withBones = solve('Wands', false);
    const without = solve('Wands', true);
    expect(withBones.converged && without.converged).toBe(true);
    expect([...withBones.policy.values()].some((a) => a.currency === 'desecrate')).toBe(true);
    // Measured 4,073.8ex → 2,493.7ex on this craft (−39%); Body Armour −53%.
    //
    // The threshold was 0.7 while the carved spawn weight was an assumed 1,000, where this craft
    // measured −46%. Measuring that weight in game moved it to 2,500, and a heavier carved pool makes
    // a bone WORSE at fishing for ordinary mods, so the margin narrowed to 0.612. Kept at 0.85 rather
    // than restored to 0.7: the claim under test is "a bone is worth playing for ordinary mods", and
    // the exact ratio moves with both the price sheet and any future weight sample, neither of which
    // this test is about.
    expect(withBones.expectedCost).toBeLessThan(without.expectedCost * 0.85);
  });

  /**
   * …and it does NOT open with one, which is the behaviour that first exposed the whole flag model.
   *
   * A bone marks whatever it applies, and the item takes no second bone until that mod is gone — so
   * the one Desecration is a resource to place well, not an opener to spam. The policy holds it back
   * and opens with an Exalt. That is exactly how the mechanic is played in practice ("desecration is
   * at the end, for the mods with the low weights"), and the model reaching it unaided is the strongest
   * evidence the flag is in the right place: the earlier version, which let a bone be spent freely,
   * opened with one and used it on every target.
   */
  it('saves the bone rather than opening with it', () => {
    const withBones = solve('Wands', false);
    const opener = withBones.nodes.find((nd) => nd.isStart)!.action;
    expect(opener).toBeDefined();
    expect(opener!.currency).not.toBe('desecrate');
  });

  /**
   * The recovery from a bone that burned the carved slot on a craft that wanted no carved mod —
   * a state combination that could not arise until bones were let in for ordinary mods.
   *
   * The Omen of Light is pushed OUTSIDE the `desecratable` block precisely so it does not depend on a
   * carved mod being targeted; `lightOutcomes` returns an empty distribution when there is nothing
   * carved to remove, and `push` drops empty ones, so nothing is wasted when it cannot apply. This
   * asserts availability, NOT that the policy takes it: at 3,095ex (8.5 divine) against a 158.7ex
   * random Annulment it is declined on any ordinary craft, and excluding it entirely moves a 5-of-6
   * Body Armour craft by 0ex. It earns its price only where the item is worth ~100x the omen.
   */
  it('still offers the Omen of Light to clear carved junk, with no carved mod targeted', () => {
    const { start, targets } = heldRare('Wands');
    expect(targets.every((t) => data.mods.get(t.modId)!.source === 'normal')).toBe(true);
    const carved = start.base.pools.desecrated.suffixes[0]!;
    const stuck: ItemState = {
      ...start, desecrated: true,
      suffixes: [{ modId: carved, tierName: data.mods.get(carved)!.tiers[0]!.name }],
    };
    const r = markovFromItem(data, prices, stuck, targets);
    expect(r.feasible).toBe(true);
    // The carved mod is junk here — it occupies the desJunk axis, not a target mask.
    expect(r.nodes.find((nd) => nd.isStart)!.desecratedJunk).toBe('suffix');
    // Available: excluding it is a strictly smaller action space, so the cost can only rise or hold.
    const without = markovFromItem(data, prices, stuck, targets,
      { policy: { excluded: new Set(['OmenofLight']) } });
    expect(without.expectedCost).toBeGreaterThanOrEqual(r.expectedCost - 1e-9);
  });

  it('leaves it out where the bone costs too much to ever win, keeping the state space untouched', () => {
    // Amulets take a collarbone at 7.69ex against a 1.00ex Exalt — over the m-Exalt ceiling, so no
    // offer can make it pay. The craft must come out byte-identical to one with bones excluded.
    const withBones = solve('Amulets', false);
    const without = solve('Amulets', true);
    expect(withBones.expectedCost).toBeCloseTo(without.expectedCost, 9);
    expect([...withBones.policy.values()].some((a) => a.currency === 'desecrate')).toBe(false);
    // The desJunk axis is what the gate is really protecting: it triples the lattice.
    expect(withBones.nodes.some((nd) => nd.desecratedJunk !== undefined)).toBe(false);
    expect(withBones.nodes.length).toBe(without.nodes.length);
  });
});

/**
 * What an UNOMENED Desecration actually draws from, pinned at the source.
 *
 * The ruling (docs/validation.md, confirmed by the user 2026-08-23): normal mods DO enter the bone
 * pool, so the draw is over `normal ∪ desecrated`, not over the carved mods alone. That is the whole
 * reason `assumedOdds` exists — the carved rows carry an assumed weight against real normal weights.
 *
 * Nothing asserted it, and the Lab's own hint drifted to "it spans the base's whole desecrated pool",
 * which reads as though a bone always produces a carved mod. It does not: on a Body Armour a carved
 * mod lands about 1 time in 13, and the rest of the time you get an ordinary one. A route step saying
 * "Desecrate — most likely lands +# to maximum Life" then looks like a bug when it is the mechanic.
 */
describe('an unomened Desecration draws from the whole pool, normal mods included', () => {
  const spaceFor = (p: typeof ARMOUR) => {
    const ids = [...p.rollable, p.des];
    const list: McTarget[] = ids.map((id) => {
      const mod = data.mods.get(id)!;
      return { mods: [{ mod, minIndex: 0 }], type: mod.type, fractured: false };
    });
    return {
      list,
      ...createActionSpace({
        data, prices: pricesForBase(prices, p.base), level: 82, pools: p.base.pools, list,
        side: sideIndexOf(list), desecratable: true, bossTargetable: bossOmenAllowed(p.base.category),
      }),
    };
  };

  it('can add a NORMAL target mod, and flags whatever it added', () => {
    const { list, actionsOf } = spaceFor(ARMOUR);
    const empty = decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'rare'));

    // The plain bone — no Sinistral/Dextral, no boss omen. Armour has no boss omen available at all.
    const bone = actionsOf(empty).find((a) => a.action.currency === 'desecrate' && !('side' in a.action));
    expect(bone).toBeDefined();

    let landsANormalTarget = 0;
    for (const [key, prob] of bone!.dist) {
      const st = decodeState(key);
      // EVERY outcome leaves the item flagged. That is the invariant the whole mechanic rests on: a
      // bone marks whatever it applied, so the item cannot be desecrated again until that mod goes.
      expect(st.flagged).not.toBe(FLAG_NONE);
      const i = flaggedTarget(st.flagged);
      if (i >= 0 && representative(list[i]!).source === 'normal') landsANormalTarget += prob;
    }
    // The fact the app's copy once denied: a bone lands an ordinary mod you asked for.
    expect(landsANormalTarget).toBeGreaterThan(0);
  });

  /**
   * What the state deliberately no longer records.
   *
   * It used to track "an unwanted DESECRATED-POOL mod" apart from ordinary junk, on its own axis with
   * its own slot. Under the flag model that distinction is gone, and it should be: once a mod is on the
   * item, the pool it came from decides nothing. It fills the same slot, blocks the same family, and
   * every currency removes it the same way. Only the FLAG survives, and only until the mod does.
   *
   * Asserted because the old shape double-counted a carved mod as an extra affix the item did not have.
   */
  it('does not distinguish a carved-pool junk mod from an ordinary one once it is on the item', () => {
    const { actionsOf } = spaceFor(ARMOUR);
    const empty = decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'rare'));
    const bone = actionsOf(empty).find((a) => a.action.currency === 'desecrate' && !('side' in a.action))!;
    for (const [key] of bone.dist) {
      const st = decodeState(key);
      // A bone adds exactly one mod, so the item holds exactly one thing more than it did.
      const mods = popcount(st.present) + popcount(st.blocked) + st.jp + st.js;
      expect(mods).toBe(1);
    }
  });

  // A side-constrained bone on a side with no carved mods can only ever place an ordinary one — 10 of
  // this base's carved mods are suffixes and none is a prefix. Observable through which TARGET it can
  // flag, since the state no longer records the pool a junk mod came from (see above).
  it('on a side with no carved mods, can never land a carved target', () => {
    const { list, actionsOf } = spaceFor(ARMOUR);
    const barren = (['prefix', 'suffix'] as const)
      .find((sd) => ARMOUR.base.pools.desecrated[`${sd}es`].length === 0);
    expect(barren).toBeDefined();
    const empty = decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'rare'));
    const bone = actionsOf(empty)
      .find((a) => a.action.currency === 'desecrate' && 'side' in a.action && a.action.side === barren);
    if (!bone) return; // priced out of the space is fine; a WRONG distribution is not
    for (const [key] of bone.dist) {
      const i = flaggedTarget(decodeState(key).flagged);
      if (i >= 0) expect(representative(list[i]!).source).not.toBe('desecrated');
    }
  });
});

describe('which desecrations lean on the assumed weight', () => {
  const targets = (p: typeof WEAPON) =>
    [...p.rollable.map((modId) => ({ modId, minTierIndex: 0 })), { modId: p.des, minTierIndex: 0 }];
  const desecrations = (p: typeof WEAPON) =>
    optimizePareto(data, prices, p.base, targets(p), { level: 82 })
      .frontier.flatMap((plan) => plan.steps)
      .filter((s) => s.currency === 'desecrate') as { boss?: string }[];

  it('armour plans desecrate WITHOUT an omen, so their odds inherit the assumption', () => {
    const steps = desecrations(ARMOUR);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.every((s) => s.boss === undefined)).toBe(true);
  });

  it('weapon plans buy the boss omen, whose count-uniform odds do not', () => {
    const steps = desecrations(WEAPON);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.boss !== undefined)).toBe(true);
  });
});

/**
 * CARVED ALTERNATIVES reach the linear planners by EXPANSION, and one expansion is not an item.
 *
 * "Carved X, or failing that a normal one" may be said of two different slots: only one carved mod
 * ever lands, whichever way each resolves. But the expansion that takes the carved member of BOTH
 * slots is an item the game forbids, and `optimizePareto` rightly throws on it — which, run inside the
 * merge, would take the whole search down and lose the routes that are perfectly fine.
 *
 * So the impossible combinations are dropped before they are run. Without that this describe block
 * fails with the planner's own "an item can hold at most one desecrated mod", rather than the search
 * simply working.
 */
describe('from-white planner — two slots that each offer a carved mod', () => {
  it('plans the combinations that are items, and skips the one that is not', () => {
    const p = WEAPON;
    // Slot 0: the carved mod OR a rollable one. Slot 1: a second carved mod OR another rollable one.
    // Only the (carved, carved) expansion is illegal.
    const otherDes = p.base.pools.desecrated.suffixes.find((id) => id !== p.des)
      ?? p.base.pools.desecrated.prefixes.find((id) => id !== p.des)!;
    const targets = [
      { modId: p.des, minTierIndex: 0, slot: 0 },
      { modId: p.rollable[0]!, minTierIndex: 0, slot: 0 },
      { modId: otherDes, minTierIndex: 0, slot: 1 },
      { modId: p.rollable[1]!, minTierIndex: 0, slot: 1 },
    ];
    const r = optimizePareto(data, prices, p.base, targets, { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    // …and no route it produces carries two carved mods.
    for (const plan of r.frontier) {
      const carved = plan.steps.filter((s) => s.currency === 'desecrate');
      expect(carved.length).toBeLessThanOrEqual(1);
    }
  });
});
