import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { familiesOf } from '../../engine/src/pool.ts';
import type { Mod } from '../../engine/src/types.ts';
import {
  FLAG_NONE, decodeState, encodeState, flagTarget, type McTarget,
} from './markovState.ts';
import {
  canonicalFilterFor, encoderFor, mergeKey, mergeSlots, permutationClasses,
  type ResolvedCandidate,
} from './markovSymmetry.ts';

const data = loadPatch('data/patches/0.5.0');
const mod = (id: string): Mod => data.mods.get(id)!;
const cand = (id: string, minIndex = 0, fractured = false): ResolvedCandidate =>
  ({ mod: mod(id), minIndex, fractured });

// Three families, one mod each, identical tier tables — the shape the whole feature was asked for.
const XCOLD = 'Wands/DamageGainedAsCold';
const XFIRE = 'Wands/DamageGainedAsFire';
const XLIGHT = 'Wands/DamageGainedAsLightning';
// One family, five normal members: the mutually-exclusive case.
const WFIRE = 'Wands/FireDamageWeaponPrefix';
const WCOLD = 'Wands/ColdDamageWeaponPrefix';
const WLIGHT = 'Wands/LightningDamageWeaponPrefix';
// Same family as those, from the desecrated pool rather than the normal one.
const WCARVED = 'Wands/Desecrated_WeaponDamageTypePrefix';
const CAST = 'Wands/IncreasedCastSpeed';

describe('mergeKey — which alternatives collapse into one bit', () => {
  it('groups same-family, same-source, same-side alternatives', () => {
    expect(mergeKey(cand(WFIRE), 0)).toBe(mergeKey(cand(WCOLD), 1));
    expect(mergeKey(cand(WCOLD), 1)).toBe(mergeKey(cand(WLIGHT), 2));
  });

  /**
   * Different families must NOT merge, and this is the assertion that keeps the two mechanisms apart.
   * Cold and Lightning can be on the item at the same time and each excludes a different mod from the
   * pool, so one bit could not describe them: the finished item holding both would have nowhere to go,
   * and every later roll would divide by the wrong number.
   */
  it('keeps different families apart, however alike they look', () => {
    expect(mergeKey(cand(XCOLD), 0)).not.toBe(mergeKey(cand(XLIGHT), 1));
  });

  // The family is taken either way, but a bone and an Exalt are not the same action: one arrives
  // flagged and draws from a different pool. Merging would sum weights across two pools.
  it('keeps a carved member out of a normal one, despite the shared family', () => {
    expect(mergeKey(cand(WFIRE), 0)).not.toBe(mergeKey(cand(WCARVED), 1));
  });

  /**
   * No family means no exclusion, so two such mods can sit on the item together — merging would claim
   * the second could never land.
   *
   * Built rather than found: every mod in 0.5.0 has a family, so a test that searched the patch for one
   * would quietly assert nothing. The guard still has to hold, because nothing in the loader promises
   * the next patch is the same.
   */
  it('never merges a mod that has no family', () => {
    const free: Mod = { ...mod(XCOLD), id: 'free', family: '' };
    expect(familiesOf(free)).toEqual([]);
    expect(mergeKey({ mod: free, minIndex: 0, fractured: false }, 0))
      .not.toBe(mergeKey({ mod: free, minIndex: 0, fractured: false }, 1));
  });

  /**
   * Side, with a mod built rather than found — because nothing in 0.5.0 exercises this term.
   *
   * No two mods on one base share a family SET and a source while sitting on different sides, so the
   * family term separates every real cross-side pair before side is ever consulted.
   * `Bows/Desecrated_CompanionDamage` and `…_2` look like the exception and are not: the suffix one
   * carries a second family, `IncreasedAttackSpeed`. Asserting on that pair passes whether or not side
   * is in the key, which is exactly the kind of test that proves nothing — it was written, and
   * mutation testing caught it doing nothing.
   *
   * The term is still load-bearing. A merged position has ONE `type`, and `prefUsed`, `sufUsed` and
   * `slotSides` all read it: a position that had swallowed both sides would count a suffix against the
   * prefix cap, and "alternatives for one slot must be all prefixes or all suffixes" — which runs on
   * the MERGED positions — would see a single type and find nothing to complain about.
   */
  it('never merges a prefix with a suffix, even of one family', () => {
    const asPrefix = mod(XCOLD);
    const asSuffix: Mod = { ...asPrefix, id: 'xcold-as-suffix', type: 'suffix' };
    expect(asPrefix.type).toBe('prefix'); // …so the two really do differ in side and nothing else
    expect(mergeKey({ mod: asPrefix, minIndex: 0, fractured: false }, 0))
      .not.toBe(mergeKey({ mod: asSuffix, minIndex: 0, fractured: false }, 1));
  });

  /**
   * A fractured mod is never removed, by anything. Merged with an unlocked sibling, the position would
   * carry one lock state for both — so an Annul would either take a mod the game will not take, or
   * refuse one it will.
   */
  it('never merges a locked mod with an unlocked one', () => {
    expect(mergeKey(cand(WFIRE, 0, true), 0)).not.toBe(mergeKey(cand(WFIRE, 0, false), 1));
  });

  /**
   * Two Perfect Essence mods of one family are a priced CHOICE, not a union of weights on one roll: the
   * essence FORCES its mod, and essences are priced per mod (`essence:<level>:<modId>`). Merging would
   * keep one and hide the other's price — and, again, defeat a check, since "an item can hold at most
   * one essence modifier" counts POSITIONS and two that had merged report as one.
   *
   * Reachable rather than theoretical: six bases on 0.5.0 carry two or more, `Bows` among them.
   */
  it('never merges two perfect-essence mods, even of one family', () => {
    expect(mergeKey(cand('Bows/PerfectEssence_MartialWeaponGainedDamage'), 0))
      .not.toBe(mergeKey(cand('Bows/PerfectEssence_MartialWeaponGainedDamage_2'), 1));
  });

  // Weights and tier floors are deliberately NOT in the key: once the family is occupied they stop
  // mattering, and on the way in they simply add up. Merging despite different floors is the point.
  it('merges members the caller asked different tiers of', () => {
    expect(mergeKey(cand(WFIRE, 5), 0)).toBe(mergeKey(cand(WCOLD, 1), 1));
  });
});

describe('mergeSlots', () => {
  // The compatibility property: a craft with nothing to merge gets its list back, index for index, so
  // every state key — and therefore every published number — is the one it always was.
  it('returns a list with nothing to merge exactly as it came in', () => {
    const cands = [cand(CAST), cand(XCOLD), cand(XLIGHT)];
    const { targets, slots } = mergeSlots(cands, [[0], [1], [2]]);
    expect(targets).toHaveLength(3);
    expect(targets.map((t) => t.mods.map((m) => m.mod.id))).toEqual([[CAST], [XCOLD], [XLIGHT]]);
    expect(slots).toEqual([[0], [1], [2]]);
  });

  it('folds a same-family slot into one position, keeping every member and its own tier floor', () => {
    const cands = [cand(CAST), cand(WFIRE, 4), cand(WCOLD, 2), cand(WLIGHT, 7)];
    const { targets, slots } = mergeSlots(cands, [[0], [1, 2, 3]]);
    expect(targets).toHaveLength(2);
    expect(slots).toEqual([[0], [1]]);
    expect(targets[1]!.mods.map((m) => [m.mod.id, m.minIndex]))
      .toEqual([[WFIRE, 4], [WCOLD, 2], [WLIGHT, 7]]);
  });

  it('leaves a cross-family slot as separate positions', () => {
    const { targets, slots } = mergeSlots([cand(XCOLD), cand(XFIRE), cand(XLIGHT)], [[0, 1, 2]]);
    expect(targets).toHaveLength(3);
    expect(slots).toEqual([[0, 1, 2]]);
  });

  /**
   * Merging is scoped to a slot. Two SLOTS wanting one family is an impossible target and
   * `markovFromItem` refuses it BY NAME; merging across slots first would quietly turn that into a
   * single position and the player would get "no policy reaches the target" instead of the reason.
   */
  it('never merges across slots, so the impossible target still has an error to give', () => {
    const { targets } = mergeSlots([cand(WFIRE), cand(WCOLD)], [[0], [1]]);
    expect(targets).toHaveLength(2);
  });
});

describe('permutationClasses — measured against the data, never assumed', () => {
  const wand = data.bases.get('Wands')!;
  const ctx = { data, pools: wand.pools, level: 82 };
  const classesFor = (cands: readonly ResolvedCandidate[], slots: number[][]) => {
    const merged = mergeSlots(cands, slots);
    return permutationClasses(ctx, merged.targets, merged.slots);
  };

  /**
   * The case the feature was asked for. Cold and Lightning are the sole members of their families,
   * both normal prefixes, with identical tier tables — so nothing downstream can tell which of them
   * landed, and the lattice need only carry one spelling.
   */
  it('finds Extra Cold and Extra Lightning interchangeable on a Wand', () => {
    expect(classesFor([cand(XCOLD), cand(XLIGHT)], [[0, 1]])).toEqual([[0, 1]]);
  });

  /**
   * Fire joins them, and the reason is worth pinning because it is not obvious.
   *
   * `FireDamage` also holds `PerfectEssence_FireDamage`, so occupying Fire excludes a mod from the
   * essence pool that occupying Cold does not — which looks like exactly the asymmetry that should
   * disqualify it. It does not, because a Perfect Essence FORCES its mod rather than drawing one: the
   * essence pool is never a denominator anywhere in this model (`pools.essence` is read once, to check
   * a target is in it), so what it contains changes no probability.
   *
   * The pool is still in the signature, deliberately. When the regular-Essence action arrives (TODO 1)
   * that pool becomes a real weighted draw, and on that day this test should go red rather than the
   * numbers quietly going wrong.
   */
  it('finds all three Extra-damage prefixes interchangeable, essence family-mate and all', () => {
    expect(classesFor([cand(XCOLD), cand(XFIRE), cand(XLIGHT)], [[0, 1, 2]])).toEqual([[0, 1, 2]]);
  });

  /**
   * A family shared with ANOTHER position is disqualifying, and this is the guard that makes the rest
   * safe: occupying that family would block a target that occupying its twin's family does not, so the
   * two are visibly different however alike their weights.
   */
  it('excludes a position whose family is shared with another position', () => {
    // WFIRE and WCARVED are one family and cannot merge (different pools), so both are ruled out —
    // while Cold and Lightning, untouched by that family, still pair up.
    const classes = classesFor(
      [cand(XCOLD), cand(XLIGHT), cand(WFIRE), cand(WCARVED)], [[0, 1, 2, 3]],
    );
    expect(classes).toEqual([[0, 1]]);
  });

  /**
   * Occupying a family removes ITS WHOLE WEIGHT from the denominator of every later roll, so two
   * families of different size are two different futures however alike the two mods look.
   *
   * Nothing in 0.5.0 exercises this on its own — every interchangeable pair in the shipped data also
   * has families of equal pool weight, which is why the condition is pinned here rather than left to
   * be discovered when a refresh moves a weight. Only the POOL is invented: `Rings/ColdDamage` is a
   * real mod and a real member of `ColdDamage`; putting it in a Wand's pool is what makes Cold take
   * 6,900 out where Lightning takes 3,000.
   */
  it('refuses a pair whose families remove different weight from the pool', () => {
    const wide = {
      ...wand.pools,
      normal: {
        ...wand.pools.normal,
        prefixes: [...wand.pools.normal.prefixes, 'Rings/ColdDamage'],
      },
    };
    const merged = mergeSlots([cand(XCOLD), cand(XLIGHT)], [[0, 1]]);
    expect(permutationClasses({ data, pools: wide, level: 82 }, merged.targets, merged.slots))
      .toEqual([]);
    // The control: the very same pair classes in the real pool, so the rejection is the extra mod.
    expect(classesFor([cand(XCOLD), cand(XLIGHT)], [[0, 1]])).toEqual([[0, 1]]);
  });

  // Mixed tiers are the common way this stops applying, and it must stop rather than approximate:
  // the two fill on different halves of their weight, so "Cold below tier" is not "Lightning below
  // tier" and the states are genuinely different.
  it('refuses a pair the caller asked different tiers of', () => {
    expect(classesFor([cand(XCOLD, 5), cand(XLIGHT, 3)], [[0, 1]])).toEqual([]);
    // …and agrees again the moment the floors match, so the rejection is the tiers and nothing else.
    expect(classesFor([cand(XCOLD, 3), cand(XLIGHT, 3)], [[0, 1]])).toEqual([[0, 1]]);
  });

  // A locked mod is never removed, by anything, so it and an unlocked twin part company under an Annul.
  it('refuses a pair where only one is fractured', () => {
    expect(classesFor([cand(XCOLD, 0, true), cand(XLIGHT)], [[0, 1]])).toEqual([]);
  });

  /**
   * The BOSS-pool condition, and the only term that counts rather than weighs.
   *
   * An unomened Desecration draws by weight; a boss-omened one is uniform over that boss's candidates
   * (`desecrationBossProbability`). So occupying a family that removes a candidate from Ulaman's list
   * changes a probability that occupying one which removes a candidate from Kurgal's does not — even
   * though the two removed exactly the same 2,500 weight. Weight is the wrong question there.
   *
   * Both mods and both bosses are real; only the POOL is built, so the two exclusions weigh the same
   * and nothing but the boss split is left to tell them apart. As with the pool condition above,
   * nothing in 0.5.0 isolates this on its own — every differing-boss pair on Wands shares a family.
   */
  it('refuses a pair whose families sit in different bosses’ pools', () => {
    const BLEED = 'Wands/Desecrated_BleedingDamage';   // sovereign
    const MINION = 'Wands/Desecrated_MinionDamage';    // liege
    const bones = {
      normal: { prefixes: [], suffixes: [] },
      desecrated: { prefixes: [BLEED, MINION], suffixes: [] },
      essence: { prefixes: [], suffixes: [] },
    };
    const one = (id: string): McTarget =>
      ({ mods: [{ mod: mod(id), minIndex: 0 }], type: 'prefix', fractured: false });
    const ctxBones = { data, pools: bones, level: 82 };
    expect(permutationClasses(ctxBones, [one(BLEED), one(MINION)], [[0, 1]])).toEqual([]);
    // The control: two mods of ONE boss, otherwise the same, do class — so it is the boss split that
    // separated them and not merely their being carved.
    const SOV1 = 'Wands/Desecrated_ArmourBreak';
    const SOV2 = 'Wands/Desecrated_HinderedEnemyTakeIncreasedDamage_3';
    const both = { ...bones, desecrated: { prefixes: [SOV1, SOV2], suffixes: [] } };
    expect(permutationClasses({ ...ctxBones, pools: both }, [one(SOV1), one(SOV2)], [[0, 1]]))
      .toEqual([[0, 1]]);
  });

  /**
   * Side, which decides WHICH CAP a bit counts against. Canonicalising a prefix onto a suffix's index
   * would move a mod from one side of the item to the other, and `countSide` would report three
   * prefixes on an item holding two.
   *
   * The caller rejects a mixed-side slot before this runs, so the check is `permutationClasses` being
   * correct on its own terms rather than trusting its caller — the same reason as the shared-family
   * guard above.
   */
  it('never classes two positions on different sides', () => {
    const at = (id: string, type: 'prefix' | 'suffix'): McTarget =>
      ({ mods: [{ mod: mod(id), minIndex: 0 }], type, fractured: false });
    expect(permutationClasses(ctx, [at(XCOLD, 'prefix'), at(XLIGHT, 'suffix')], [[0, 1]])).toEqual([]);
    // …and the identical pair on one side classes, so the side is the whole of the difference.
    expect(permutationClasses(ctx, [at(XCOLD, 'prefix'), at(XLIGHT, 'prefix')], [[0, 1]]))
      .toEqual([[0, 1]]);
  });

  // Interchangeability is about one slot: two positions in DIFFERENT slots are both wanted, so
  // swapping their labels would swap which slot is filled.
  it('never spans two slots', () => {
    expect(classesFor([cand(XCOLD), cand(XLIGHT)], [[0], [1]])).toEqual([]);
  });

  /**
   * The shared-family guard, isolated — which needs a list `mergeSlots` would never hand over.
   *
   * `WFIRE` and `WCOLD` are one family with identical tier tables, so their signatures match exactly
   * and the guard is the ONLY thing that can separate them. In a real solve they would have merged
   * long before this ran; the point is that `permutationClasses` is correct on its own terms rather
   * than relying on its caller, because canonicalising two positions that occupy the SAME family
   * would claim two arrangements are one when occupying either blocks the other.
   *
   * The reachable shape of this is the test below it — one slot holding a normal and a carved mod of
   * one family, which cannot merge. Those are separated by source anyway, which is why that test
   * does not exercise this guard and this one has to exist.
   */
  it('excludes positions that share a family with each other', () => {
    const one = (id: string): McTarget =>
      ({ mods: [{ mod: mod(id), minIndex: 0 }], type: 'prefix', fractured: false });
    expect(permutationClasses(ctx, [one(WFIRE), one(WCOLD)], [[0, 1]])).toEqual([]);
    // …and the same two mods, in families of their own, would have classed — so the rejection above is
    // the shared family and nothing else about them.
    expect(permutationClasses(ctx, [one(XCOLD), one(XLIGHT)], [[0, 1]])).toEqual([[0, 1]]);
  });

  // Same-family alternatives have already become one position by the time this runs, so there is
  // nothing left to permute — the two mechanisms do not overlap.
  it('finds nothing to permute in a slot that merged', () => {
    expect(classesFor([cand(WFIRE), cand(WCOLD), cand(WLIGHT)], [[0, 1, 2]])).toEqual([]);
  });
});

describe('encoderFor — one spelling per situation', () => {
  // No classes means the encoder IS `encodeState`, so a craft that predates this pays nothing at all,
  // not even a branch. Identity of the function object is the assertion, not equality of its output.
  it('is encodeState itself when there is nothing to canonicalise', () => {
    expect(encoderFor([])).toBe(encodeState);
    expect(encoderFor([[2]])).toBe(encodeState); // a one-member class is not a class
    expect(canonicalFilterFor([])).toBeUndefined();
  });

  const cls = [[1, 2, 3]];
  const enc = encoderFor(cls);
  const b = (i: number) => 1 << i;

  it('packs a class’s present members low and its blocked members next', () => {
    // present {3}, blocked {1} → present {1}, blocked {2}
    expect(enc(b(3), b(1), 0, 0)).toBe(encodeState(b(1), b(2), 0, 0));
    // present {2,3} → present {1,2}
    expect(enc(b(2) | b(3), 0, 0, 0)).toBe(encodeState(b(1) | b(2), 0, 0, 0));
  });

  it('leaves bits outside the class exactly where they are', () => {
    const k = decodeState(enc(b(0) | b(3), b(4), 1, 2));
    expect(k.present & b(0)).toBe(b(0));
    expect(k.blocked & b(4)).toBe(b(4));
    expect(k.jp).toBe(1);
    expect(k.js).toBe(2);
  });

  /**
   * The flag names an INDEX, so it has to travel with the mod it marks. Left behind, repacking would
   * move the desecrated mod and leave the mark on whichever member landed in its place — and since the
   * mark is what stops the item being desecrated again, that is a rule applied to the wrong mod.
   */
  it('carries the desecration flag with the member it marks', () => {
    // Member 3 is present and flagged; it repacks to index 1, so the flag must follow it there.
    expect(enc(b(3), 0, 0, 0, flagTarget(3))).toBe(encodeState(b(1), 0, 0, 0, flagTarget(1)));
    // A flag on a mod OUTSIDE the class does not move.
    expect(enc(b(3), 0, 0, 0, flagTarget(0))).toBe(encodeState(b(1), 0, 0, 0, flagTarget(0)));
  });

  it('is idempotent — a canonical state encodes to itself', () => {
    for (const [p, bl, f] of [[b(1), b(2), FLAG_NONE], [b(1) | b(2), 0, flagTarget(2)], [0, 0, FLAG_NONE]] as const) {
      const once = enc(p, bl, 0, 0, f);
      const st = decodeState(once);
      expect(enc(st.present, st.blocked, st.jp, st.js, st.flagged, st.rarity)).toBe(once);
    }
  });

  /**
   * The lattice filter and the encoder must agree, or states would be built that no transition can
   * reach (or worse, reached that were never built). They are derived from the same function here, and
   * this is what pins that they stay so.
   */
  it('keeps exactly the arrangements the encoder leaves alone', () => {
    const keep = canonicalFilterFor(cls)!;
    for (let p = 0; p < 16; p++) {
      for (let bl = 0; bl < 16; bl++) {
        if ((p & bl) !== 0) continue;
        expect(keep(p, bl)).toBe(enc(p, bl, 0, 0) === encodeState(p, bl, 0, 0));
      }
    }
  });

  // Every arrangement must canonicalise to one that survives the filter, or an outcome could point at
  // a state the lattice never built — which is the failure the closure assertion exists to catch.
  it('maps every arrangement onto one the lattice keeps', () => {
    const keep = canonicalFilterFor(cls)!;
    for (let p = 0; p < 16; p++) {
      for (let bl = 0; bl < 16; bl++) {
        if ((p & bl) !== 0) continue;
        const st = decodeState(enc(p, bl, 0, 0));
        expect(keep(st.present, st.blocked)).toBe(true);
      }
    }
  });
});

describe('the two mechanisms, side by side', () => {
  const t = (ids: string[]): McTarget =>
    ({ mods: ids.map((id) => ({ mod: mod(id), minIndex: 0 })), type: 'prefix', fractured: false });
  it('a merged position holds several mods; a permuted class holds several positions', () => {
    const merged = mergeSlots([cand(WFIRE), cand(WCOLD)], [[0, 1]]);
    expect(merged.targets).toHaveLength(1);
    expect(merged.targets[0]!.mods).toHaveLength(2);
    expect(t([WFIRE, WCOLD]).mods).toHaveLength(2);

    const apart = mergeSlots([cand(XCOLD), cand(XLIGHT)], [[0, 1]]);
    expect(apart.targets).toHaveLength(2);
    expect(apart.targets.every((x) => x.mods.length === 1)).toBe(true);
  });
});
