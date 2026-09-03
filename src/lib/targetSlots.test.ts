import { describe, it, expect } from 'vitest';
import type { EngineMod, TargetInput } from './engineTypes.ts';
import {
  MAX_PER_SIDE, MIXED_TIER_NOTE, mixedTierAlternatives, nextSlotId, slotCounts, slotsOf, whyNotAdd,
} from './targetSlots.ts';

const tier = (d: number) => ({ display: d, name: `t${d}`, ilvl: 1, label: `T${d}`, range: '1–2', values: ['1–2'] });
const mod = (
  id: string, type: 'prefix' | 'suffix', family: string, source: EngineMod['source'] = 'normal',
): EngineMod => ({ id, text: id, type, family, source, tiers: [tier(1), tier(2)] });

// Two siblings (one family) and two unrelated mods, mirroring the real split: `increased Fire/Cold`
// share WeaponDamageTypePrefix, while `Gain as Extra Cold/Fire` are separate families.
const FIRE = mod('fire', 'prefix', 'WeaponDamageTypePrefix');
const COLD = mod('cold', 'prefix', 'WeaponDamageTypePrefix');
const XCOLD = mod('xcold', 'prefix', 'ColdDamage');
const XFIRE = mod('xfire', 'prefix', 'FireDamage');
const SPELL = mod('spell', 'prefix', 'SpellDamage');
const MANA = mod('mana', 'prefix', 'Mana');
const CAST = mod('cast', 'suffix', 'CastSpeed');
const CRIT = mod('crit', 'suffix', 'Crit');
const INT = mod('int', 'suffix', 'Int');
const DES = mod('des', 'prefix', 'Desecrated', 'desecrated');
const DES2 = mod('des2', 'suffix', 'Desecrated2', 'desecrated');
const DES3 = mod('des3', 'prefix', 'Desecrated3', 'desecrated'); // carved PREFIX, so it can join DES's slot
const modById = new Map([FIRE, COLD, XCOLD, XFIRE, SPELL, MANA, CAST, CRIT, INT, DES, DES2, DES3].map((m) => [m.id, m]));

const t = (modId: string, slot?: number): TargetInput =>
  (slot === undefined ? { modId, tierDisplay: 1 } : { modId, tierDisplay: 1, slot });

describe('slotsOf', () => {
  it('gives every ungrouped target a slot of its own', () => {
    expect(slotsOf([t('fire'), t('cast')], modById).map((s) => s.members)).toEqual([[0], [1]]);
  });

  it('groups members sharing a slot id, in order of first appearance', () => {
    const slots = slotsOf([t('xcold', 0), t('cast'), t('xfire', 0)], modById);
    expect(slots.map((s) => s.members)).toEqual([[0, 2], [1]]);
    expect(slots.map((s) => s.type)).toEqual(['prefix', 'suffix']);
  });

  // `slot ?? 0` would quietly make an ungrouped target an alternative of a mod nobody said it could
  // stand in for. The UI numbers the slots it groups and leaves the rest bare, so this list is normal.
  it('never merges a bare target into slot 0', () => {
    expect(slotsOf([t('fire'), t('xcold', 0), t('xfire', 0)], modById).map((s) => s.members))
      .toEqual([[0], [1, 2]]);
  });
});

describe('slotCounts — the 3-per-side limit counts SLOTS, not candidates', () => {
  it('counts a three-way slot once', () => {
    expect(slotCounts([t('xcold', 0), t('xfire', 0), t('fire', 0)], modById)).toEqual({ prefix: 1, suffix: 0 });
  });

  it('counts ungrouped targets one apiece', () => {
    expect(slotCounts([t('fire'), t('spell'), t('cast')], modById)).toEqual({ prefix: 2, suffix: 1 });
  });
});

describe('whyNotAdd — adding a NEW slot', () => {
  const full = [t('fire'), t('spell'), t('mana')]; // three prefix slots

  it('refuses a fourth slot on a full side', () => {
    expect(whyNotAdd(XCOLD, full, modById)).toMatch(/side is full/i);
  });

  it('still allows the other side', () => {
    expect(whyNotAdd(CAST, full, modById)).toBeNull();
  });

  it('refuses a family another slot already holds', () => {
    expect(whyNotAdd(COLD, [t('fire')], modById)).toMatch(/WeaponDamageTypePrefix/);
  });

  // Two carved mods in slots of their own can never both land, so this stays refused…
  it('refuses a second desecrated mod that has no alternative', () => {
    expect(whyNotAdd(DES2, [t('des')], modById)).toMatch(/an item holds one/i);
  });

  it('refuses a mod already in the target', () => {
    expect(whyNotAdd(FIRE, [t('fire')], modById)).toMatch(/already/i);
  });
});

describe('whyNotAdd — joining an existing slot', () => {
  /**
   * The rule the whole feature turns on. Three prefix SLOTS is a full side, but a fourth prefix
   * CANDIDATE joining one of them is legal — only one member of a slot ever lands on the item, so it
   * costs no slot. Enforcing the side cap here would make alternatives impossible on exactly the
   * six-mod targets people build.
   */
  it('lets a fourth prefix candidate join a slot on a full side', () => {
    const full = [t('fire', 0), t('spell'), t('mana')];
    expect(slotCounts(full, modById).prefix).toBe(MAX_PER_SIDE);
    expect(whyNotAdd(XCOLD, full, modById, { intoSlot: 0 })).toBeNull();
  });

  // Siblings are the ordinary alternative and collide by definition — refusing them would rule out
  // the commonest group there is.
  it('allows an alternative that shares a family with the slot it joins', () => {
    expect(whyNotAdd(COLD, [t('fire', 0)], modById, { intoSlot: 0 })).toBeNull();
  });

  // …but a family held by a DIFFERENT slot still blocks: both could never be filled.
  it('still refuses a family another slot holds', () => {
    const targets = [t('fire'), t('xcold', 0)];
    expect(whyNotAdd(COLD, targets, modById, { intoSlot: 0 })).toMatch(/WeaponDamageTypePrefix/);
  });

  it('refuses an alternative from the other side', () => {
    expect(whyNotAdd(CAST, [t('fire', 0)], modById, { intoSlot: 0 })).toMatch(/same side/i);
  });
});

describe('nextSlotId', () => {
  it('starts at zero and never reuses an id', () => {
    expect(nextSlotId([])).toBe(0);
    expect(nextSlotId([t('fire'), t('cast')])).toBe(0);
    expect(nextSlotId([t('fire', 0), t('cast', 3)])).toBe(4);
  });
});

/**
 * ONE desecrated mod on the finished ITEM — not one in the target.
 *
 * The rule used to count carved CANDIDATES, which refused a perfectly ordinary ask: "carved Cast
 * Speed, or failing that a normal one" in two different slots. Only one carved mod ever ends up on
 * the item there, whichever way each slot resolves. What is genuinely unsatisfiable is two slots
 * offering nothing but carved mods — every way of filling those lands two.
 */
describe('whyNotAdd — desecrated alternatives', () => {
  it('allows a carved mod as an alternative to a normal one', () => {
    expect(whyNotAdd(DES, [t('fire', 0)], modById, { intoSlot: 0 })).toBeNull();
  });

  // Slot 0 = {fire, des} can be filled without a carved mod, so it is not forced — which leaves the
  // new carved slot as the only forced one, and that is satisfiable.
  it('allows a second carved candidate once the first slot has a way out', () => {
    expect(whyNotAdd(DES2, [t('fire', 0), t('des', 0)], modById)).toBeNull();
  });

  // Slot 0 holds only `des`, so it is already forced; a bare second carved mod would force another.
  it('refuses a carved mod that would make a SECOND slot carved-only', () => {
    expect(whyNotAdd(DES2, [t('des', 0)], modById)).toMatch(/an item holds one/i);
  });

  // …but JOINING that slot adds no slot: still one forced position, and either carved mod may fill it.
  it('lets a carved mod join a slot that is already carved-only', () => {
    expect(whyNotAdd(DES3, [t('des', 0)], modById, { intoSlot: 0 })).toBeNull();
  });
});

/**
 * MIXED TIERS — a planner note, never a rule.
 *
 * The craft is legal and the answer identical either way; what changes is how long the solve takes.
 * The distinction the predicate has to get right is that the two kinds of group are optimised by
 * different means: same-family alternatives merge into one bit regardless of the tiers asked of them,
 * while different-family ones can only be folded together while they are indistinguishable — and a
 * different tier is exactly the distinguishing difference the player controls.
 */
describe('mixedTierAlternatives', () => {
  const at = (modId: string, slot: number, tierDisplay: number): TargetInput => ({ modId, tierDisplay, slot });
  const slot0 = (targets: readonly TargetInput[]) => slotsOf(targets, modById)[0]!;

  it('is false for a lone target, which has no alternatives to differ from', () => {
    expect(mixedTierAlternatives(slot0([t('xcold')]), [t('xcold')], modById)).toBe(false);
  });

  it('is false when the alternatives ask the same tier', () => {
    const targets = [at('xcold', 0, 1), at('xfire', 0, 1)];
    expect(mixedTierAlternatives(slot0(targets), targets, modById)).toBe(false);
  });

  it('is true when cross-family alternatives ask different tiers', () => {
    const targets = [at('xcold', 0, 1), at('xfire', 0, 2)];
    expect(mixedTierAlternatives(slot0(targets), targets, modById)).toBe(true);
  });

  /**
   * The assertion that stops this becoming noise. Siblings merge into a single bit whatever tiers they
   * are asked at — the family is occupied either way, so the individual floors stop mattering the
   * moment one lands. Telling the player to match their tiers here would be advice that buys nothing.
   */
  it('is false for SAME-family alternatives at different tiers, which merge anyway', () => {
    const targets = [at('fire', 0, 1), at('cold', 0, 2)];
    expect(mixedTierAlternatives(slot0(targets), targets, modById)).toBe(false);
  });

  // Three members where only one pair differs is still a reason to say something.
  it('is true when any one cross-family pair differs', () => {
    const targets = [at('xcold', 0, 1), at('xfire', 0, 1), at('spell', 0, 2)];
    expect(mixedTierAlternatives(slot0(targets), targets, modById)).toBe(true);
  });

  // The copy is shared so the two tabs cannot drift, and it must not promise a speed-up: matching the
  // tiers is necessary for the fold, not sufficient (the weights have to match too, which is data).
  it('says what stands in the way without promising a number', () => {
    expect(MIXED_TIER_NOTE).toMatch(/same answer/i);
    expect(MIXED_TIER_NOTE).not.toMatch(/\d+(\.\d+)?\s*(x|×|%|faster)/i);
  });
});
