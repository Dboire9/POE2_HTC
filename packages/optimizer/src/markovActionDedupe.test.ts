import { describe, it, expect } from 'vitest';
import type { ItemBase, Mod, PatchData } from '../../engine/src/index.ts';
import { bossOmenAllowed, loadPatch } from '../../engine/src/index.ts';
import { pricesForBase } from './cost.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { createActionSpace } from './markovActions.ts';
import type { ActionDef } from './markovActions.ts';
import {
  FLAG_NONE, decodeState, encodeState, sideIndexOf,
} from './markovState.ts';
import type { Dist, McState, McTarget } from './markovState.ts';

/**
 * The solver never sees two spellings of one move.
 *
 * `pusher` folds actions that share an outcome distribution down to the cheapest of them, because with
 * the distribution fixed an action's value is monotone in its cost. These tests pin the two halves that
 * can break: that it FIRES on the shipped data (an optimisation whose trigger nothing asserts is one a
 * price or weight refresh silently switches off), and that it does not fire where the two actions
 * genuinely differ.
 */

const real = loadPatch('data/patches/0.5.0');
const rp = loadPrices('data/patches/0.5.0');

/** Outcome-distribution fingerprint — the same equality `signatureOf` uses, minus the restart bit. */
const distKey = (d: Dist): string => [...d].map(([k, p]) => `${k}=${p}`).sort().join(';');

const spaceFor = (baseId: string, modIds: readonly string[], restart?: { cost: number; dist: Dist }) => {
  const base = real.bases.get(baseId)!;
  const list: McTarget[] = modIds.map((id) => {
    const mod = real.mods.get(id)!;
    return { mods: [{ mod, minIndex: 0 }], type: mod.type, fractured: false };
  });
  return {
    list,
    ...createActionSpace({
      data: real, prices: pricesForBase(rp, base), level: 82, pools: base.pools, list,
      side: sideIndexOf(list), desecratable: true, bossTargetable: bossOmenAllowed(base.category),
      ...(restart ? { restart } : {}),
    }),
  };
};

const st = (present: number, blocked: number, jp: number, js: number): McState =>
  decodeState(encodeState(present, blocked, jp, js, FLAG_NONE, 'rare'));

const WAND = ['Wands/WeaponSpellDamage', 'Wands/IncreasedCastSpeed', 'Wands/DamageGainedAsCold'];

describe('the action space never offers two spellings of one move', () => {
  it('no two actions in a state share an outcome distribution — across the whole Wand lattice', () => {
    const { actionsOf } = spaceFor('Wands', WAND);
    let checked = 0;
    for (let jp = 0; jp <= 3; jp++) {
      for (let js = 0; js <= 3; js++) {
        for (let present = 0; present < 8; present++) {
          const s = st(present, 0, jp, js);
          const acts = actionsOf(s);
          const seen = new Map<string, ActionDef>();
          for (const a of acts) {
            // Restart is deliberately excluded from the fold; see the `isRestart` note on `signatureOf`.
            if (a.action.currency === 'restart') continue;
            const k = `${a.offer ?? 1}|${distKey(a.dist)}`;
            const prev = seen.get(k);
            expect(prev, `${JSON.stringify(a.action)} duplicates ${JSON.stringify(prev?.action)} at `
              + `present=${present} jp=${jp} js=${js}`).toBeUndefined();
            seen.set(k, a);
          }
          checked += acts.length;
        }
      }
    }
    // The invariant is only worth asserting if there were actions to assert it over.
    expect(checked).toBeGreaterThan(1000);
  });

  /**
   * It FIRES, and on the cause that motivated it: a side omen that constrains nothing.
   *
   * With the suffix side full, `addOutcomes` closes it whether or not a Sinistral Exaltation says so,
   * so the omened action is bit-identical to the plain one at 20-27x the price.
   */
  it('drops a Sinistral Exaltation once the suffix side is full', () => {
    const { actionsOf } = spaceFor('Wands', WAND);
    const sideOmened = (acts: ActionDef[]) =>
      acts.filter((a) => a.action.currency === 'exalt' && 'side' in a.action);

    // Room on both sides: the omens genuinely constrain, so every variant is on offer.
    expect(sideOmened(actionsOf(st(0, 0, 0, 0))).length).toBeGreaterThan(0);
    // Three suffixes used: a plain Exalt can only produce a prefix, so Sinistral buys nothing…
    const full = actionsOf(st(0, 0, 0, 3));
    expect(sideOmened(full).filter((a) => (a.action as { side: string }).side === 'prefix')).toEqual([]);
    // …while the plain Exalt is of course still there.
    expect(full.some((a) => a.action.currency === 'exalt' && !('side' in a.action))).toBe(true);
  });

  it('drops a strength that cannot change the roll', () => {
    // Every Wand prefix/suffix tier reachable at ilvl 82 sits above the Greater floor on many states,
    // so Greater and Perfect produce the plain Exalt's distribution and only cost more.
    const { actionsOf } = spaceFor('Wands', WAND);
    const strengths = (s: McState) => new Set(actionsOf(s)
      .filter((a) => a.action.currency === 'exalt' && !('side' in a.action))
      .map((a) => (a.action as { strength: string }).strength));
    // At least one state in the lattice must have collapsed the three strengths to fewer.
    let collapsed = false;
    for (let jp = 0; jp <= 3 && !collapsed; jp++) {
      for (let js = 0; js <= 3 && !collapsed; js++) {
        if (strengths(st(0, 0, jp, js)).size < 3) collapsed = true;
      }
    }
    expect(collapsed).toBe(true);
  });

  /**
   * Why `offer` sits in the signature even though no craft can exercise it.
   *
   * Two actions with the same outcome distribution but different offer counts are NOT the same move —
   * `E[min of three draws]` is not `E[one draw]` — so folding them would be wrong. Mutation-testing the
   * `offer` term out of `signatureOf` changes nothing on the shipped data, and this is the reason: the
   * only action with `offer > 1` is a Desecration, and a Desecration is the only thing that FLAGS what
   * it placed. Every one of its outcomes therefore differs from every unflagged action's outcome in the
   * state key itself, so the collision the term guards against cannot arise.
   *
   * That is a structural fact rather than a lucky one, and this is the test that keeps it structural:
   * add a second offer mechanic that does not flag, and this goes red next to the term it protects.
   */
  it('only a Desecration shows an offer, and only a Desecration flags what it placed', () => {
    const { actionsOf } = spaceFor('Wands', ['Wands/Desecrated_WeaponDamageTypePrefix', ...WAND.slice(0, 2)]);
    let offers = 0;
    for (let jp = 0; jp <= 2; jp++) {
      for (let js = 0; js <= 2; js++) {
        for (const a of actionsOf(st(0, 0, jp, js))) {
          const flags = [...a.dist.keys()].map((k) => decodeState(k).flagged);
          if ((a.offer ?? 1) > 1) {
            expect(a.action.currency).toBe('desecrate');
            expect(flags.every((f) => f !== FLAG_NONE)).toBe(true); // every outcome carries the bone's mark
            offers++;
          } else {
            // …and nothing else can reach a flagged state from an unflagged one, so no unflagged
            // action can ever collide with a bone's distribution.
            expect(flags.every((f) => f === FLAG_NONE)).toBe(true);
          }
        }
      }
    }
    expect(offers).toBeGreaterThan(0);
  });

  /**
   * The survivor is the CHEAP one, which is what makes the fold free rather than merely smaller.
   *
   * An unomened Desecration is pushed before the boss-omened ones precisely so that when a boss's pool
   * happens to be the whole legal pool the player is told to skip the omen. That preference used to
   * rest on `bestAction`'s strict `<`; now the dearer spelling never reaches the solver at all.
   */
  it('keeps the omen-free spelling when a boss omen buys nothing', () => {
    const { actionsOf } = spaceFor('Wands', ['Wands/Desecrated_WeaponDamageTypePrefix']);
    const acts = actionsOf(st(0, 0, 0, 0));
    const bones = acts.filter((a) => a.action.currency === 'desecrate');
    const plain = bones.find((a) => !('boss' in a.action) && !('side' in a.action));
    expect(plain).toBeDefined();
    for (const b of bones) {
      if (b === plain) continue;
      expect(distKey(b.dist)).not.toBe(distKey(plain!.dist));
    }
  });
});

/**
 * The one fold that would be WRONG, and the reason `isRestart` is in the signature.
 *
 * Phase A of the solve runs push-forward only and skips restarts. An Annulment that empties a one-mod
 * item lands on the start state with P=1 exactly as a restart does — so folding the two together would
 * leave phase A with NO action at that state, an Infinity where a real value belongs, and a seed that
 * is not the push-forward optimum.
 */
describe('a restart is never folded into the action that happens to match it', () => {
  const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod => ({
    id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id,
    tiers: [{ name: 't1', ilvl: 1, weight, ranges: [], stats: [] }],
  });
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'C',
    pools: {
      normal: { prefixes: ['T1'], suffixes: [] },
      desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
    },
  };
  const data: PatchData = {
    patch: 't', mods: new Map([['T1', mk('T1', 'prefix', 'FT1', 100)]]), bases: new Map([['S', base]]),
  };
  // A free restart, so it is strictly cheaper than the 1ex annul it collides with.
  const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };

  it('keeps both, even though they land on the same state with P=1', () => {
    const list: McTarget[] = [{ mods: [{ mod: data.mods.get('T1')!, minIndex: 0 }], type: 'prefix', fractured: false }];
    const emptyKey = encodeState(0, 0, 0, 0, FLAG_NONE, 'rare');
    const { actionsOf } = createActionSpace({
      data, prices: pricesForBase(prices, base), level: 100, pools: base.pools, list,
      side: sideIndexOf(list), desecratable: false, bossTargetable: false,
      restart: { cost: 0, dist: new Map([[emptyKey, 1]]) },
    });
    // One junk prefix on the item: the only annul takes it, landing on the empty item with P=1 —
    // which is exactly where a restart lands.
    const acts = actionsOf(decodeState(encodeState(0, 0, 1, 0, FLAG_NONE, 'rare')));
    const annul = acts.find((a) => a.action.currency === 'annul' && !('side' in a.action));
    const restart = acts.find((a) => a.action.currency === 'restart');
    expect(annul, 'the annul must survive — phase A has nothing else here').toBeDefined();
    expect(restart).toBeDefined();
    expect(distKey(annul!.dist)).toBe(distKey(restart!.dist)); // …and they really do collide
  });
});
