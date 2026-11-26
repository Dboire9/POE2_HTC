import { describe, it, expect } from 'vitest';
import type { ItemState } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { solveDenseInPlace } from './denseSolve.ts';
import { ECHOES_OMEN, type Prices } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { actionCostOf, type McAction } from './markovActions.ts';
import { markovFromItem, type MarkovOptions, type MarkovResult } from './markovFromItem.ts';
import {
  actionId, bestValues, checkMethod, methodCraft, methodFromPlan, reachedFrom, specOf,
  type Condition, type Method, type MethodCheck, type MethodChecked, type MethodCraft,
} from './markovMethod.ts';
import type { CompiledAction } from './markovLattice.ts';
import type { RouteTable } from './markovRoute.ts';
import { decodeState } from './markovState.ts';
import type { TierTarget } from './optimize.ts';

// "Check my method", on small frozen-sheet Wand crafts solved at a tight tolerance: the best plan written
// as rules costs exactly the best plan; a method one move worse loses exactly that move's value at that
// state; the losses add up to the gap; a move the item cannot take, or a method that loops, stops the check
// where it happens; a folded spelling is costed at its own price; and the replay agrees with the cost.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
/** Hand-checked arithmetic, not the app's stopping rule (as the other exact MDP tests ask). */
const TIGHT: MarkovOptions = { tolerance: 1e-9, solver: 'policy', keepRoutes: true };

function distinct(ids: readonly string[], n: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const m = data.mods.get(id);
    if (!m || m.source !== 'normal' || seen.has(m.family)) continue;
    seen.add(m.family);
    out.push(id);
    if (out.length === n) break;
  }
  return out;
}
const PRE = distinct(wands.pools.normal.prefixes, 3);
const SUF = distinct(wands.pools.normal.suffixes, 3);
const white: ItemState = { base: wands, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
/** Two prefixes and a suffix at any tier, from a white Wand at 1 ex a base: ~1,000 states, bones in play. */
const THREE: TierTarget[] = [{ modId: PRE[0]!, minTierIndex: 0 }, { modId: PRE[1]!, minTierIndex: 0 }, { modId: SUF[0]!, minTierIndex: 0 }];
const FROM_WHITE: MarkovOptions = { ...TIGHT, restartCost: 1 };

interface Setup { readonly r: MarkovResult; readonly routes: RouteTable; readonly craft: MethodCraft; readonly V: Float64Array }
function setup(start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions): Setup {
  const r = markovFromItem(data, prices, start, targets, opts);
  expect(r.bound).toBe('exact');
  const craft = methodCraft(data, prices, start, targets, opts);
  if ('refused' in craft) throw new Error(craft.refused);
  const best = bestValues(craft, { routes: r.routes!, bound: r.bound });
  if ('refused' in best) throw new Error(best.refused);
  expect(best.reused).toBe(true);
  return { r, routes: r.routes!, craft, V: best.V };
}
const three = setup(white, THREE, FROM_WHITE);
/** The same craft with bones excluded: no Desecration mark to tell states apart, so rules can say every state. */
const boneless = setup(white, THREE, { ...FROM_WHITE, policy: { excluded: new Set(['desecrate', 'desecrate_ancient']) } });

const ok = (c: MethodCheck): MethodChecked => {
  if (!c.ok) throw new Error(`stopped: ${JSON.stringify(c.stop)}`);
  return c;
};
/** The best plan as rules, one per state it reaches. */
const bestAsRules = (s: Setup): Method => {
  const { method, faithful } = methodFromPlan(s.routes, reachedFrom(s.routes, s.routes.restartIdx).map((i) => s.routes.keys[i]!));
  expect(faithful).toBe(true);
  return method;
};
/** The best plan as rules at EVERY state it has a move for — so a method that strays still plays it. */
const bestEverywhere = (s: Setup): Method => {
  const { method, faithful } = methodFromPlan(s.routes, s.routes.keys.filter((_, i) => s.routes.act[i]! >= 0));
  expect(faithful).toBe(true);
  return method;
};
/** A rule's conditions naming state `i` exactly — the first rule of what `methodFromPlan` writes for it. */
const exactly = (s: Setup, i: number): readonly Condition[] => methodFromPlan(s.routes, [s.routes.keys[i]!]).method.rules[0]!.when;

/**
 * The method's cost from its start, solved as one dense linear system over every state it reaches (the
 * whole chain, start overs as moves) — a different calculation from the renewal over visits the check makes.
 */
function costIndependently(t: RouteTable, finish: Float64Array): number {
  const live = reachedFrom(t, t.restartIdx).filter((i) => t.goal[i] !== 1);
  const at = new Map(live.map((i, k) => [i, k]));
  const m = live.length;
  const A = new Float64Array(m * m);
  const b = new Float64Array(m);
  live.forEach((i, r) => {
    A[r * m + r] = A[r * m + r]! + 1;
    b[r] = t.actCost[i]!;
    for (let o = t.outStart[i]!; o < t.outStart[i + 1]!; o++) {
      const j = t.outTo[o]!;
      if (t.goal[j] === 1) b[r] += t.outProb[o]! * finish[j]!;
      else A[r * m + at.get(j)!] = A[r * m + at.get(j)!]! - t.outProb[o]!;
    }
  });
  expect(solveDenseInPlace(A, m, [b])).toBe(true);
  return b[at.get(t.restartIdx)!]!;
}

describe('a method costed against the best plan', () => {
  it('the best plan written as rules costs exactly the best plan, and loses nowhere', () => {
    const c = ok(checkMethod(three.craft, three.V, 'exact', bestAsRules(three)));
    expect(c.bestCost).toBe(three.r.expectedCost);
    expect(Math.abs(c.cost - c.bestCost) / c.bestCost).toBeLessThan(1e-9);
    expect(Math.abs(c.gap!) / c.bestCost).toBeLessThan(1e-9);
    expect(c.losses).toEqual([]);
    // …and the same number by a different calculation.
    expect(costIndependently(c.table, three.craft.lattice.finishCost) / c.cost).toBeCloseTo(1, 9);
  });

  it('a held Rare’s best plan, which plays Chaos where a swap can change nothing, costs the same as rules', () => {
    // A Chaos that swaps one unwanted mod for another on the same side leaves the item where it was: the
    // self-loop must be counted as a play, or the method comes out cheaper than the plan it copies.
    const lowest = (id: string) => ({ modId: id, tierName: data.mods.get(id)!.tiers.at(-1)!.name });
    const held = setup(
      { base: wands, level: 82, rarity: 'rare', prefixes: [lowest(PRE[2]!)], suffixes: [lowest(SUF[2]!)] },
      [{ modId: PRE[0]!, minTierIndex: 0 }, { modId: SUF[0]!, minTierIndex: 0 }], TIGHT,
    );
    const method = bestAsRules(held);
    const c = ok(checkMethod(held.craft, held.V, 'exact', method));
    const loops = c.table.keys.some((_, i) => {
      for (let o = c.table.outStart[i]!; o < c.table.outStart[i + 1]!; o++) if (c.table.outTo[o] === i && c.visits[i]! > 0) return true;
      return false;
    });
    expect(loops).toBe(true);
    expect(Math.abs(c.cost - c.bestCost) / c.bestCost).toBeLessThan(1e-9);
  });

  it('at the app’s own tolerance, the best plan as rules shows no row', () => {
    const r = markovFromItem(data, prices, white, THREE, { restartCost: 1, keepRoutes: true });
    expect(r.bound).toBe('exact');
    const craft = methodCraft(data, prices, white, THREE, { restartCost: 1 });
    if ('refused' in craft) throw new Error(craft.refused);
    const s: Setup = { r, routes: r.routes!, craft, V: r.routes!.value };
    const c = ok(checkMethod(craft, s.V, 'exact', bestAsRules(s)));
    expect(c.losses).toEqual([]);
    expect(Math.abs(c.gap!) / c.bestCost).toBeLessThan(1e-3);
  });

  it('one move worse at one state loses exactly that state’s value: visits × (Q* of the move − V*)', () => {
    const { routes, craft, V } = boneless;
    // A Magic state the best plan passes through, where it Regals: the method Augments there instead.
    const st = reachedFrom(routes, routes.restartIdx).find((i) => {
      const a = routes.act[i]!;
      return a >= 0 && decodeState(routes.keys[i]!).rarity === 'magic' && routes.actions[a]!.currency === 'regal';
    })!;
    expect(st).toBeDefined();
    const augment = craft.lattice.compiled[st]!.find((ca) => ca.def.action.currency === 'augment' && ca.def.action.strength === 'base')!;
    // Q* by hand from the move's own outcomes: its price, plus where each outcome lands at V*, the self-loop too.
    let q = augment.cost + augment.selfProb * V[st]!;
    for (let j = 0; j < augment.to.length; j++) q += augment.prob[j]! * V[augment.to[j]!]!;
    expect(q).toBeGreaterThan(V[st]! + 1e-6);

    const best = bestEverywhere(boneless);
    const worse: Method = { ...best, rules: [{ when: exactly(boneless, st), move: { currency: 'augment', strength: 'base' } }, ...best.rules] };
    const c = ok(checkMethod(craft, V, 'exact', worse));
    expect(c.losses.map((l) => [l.state, l.rule, actionId(l.move)])).toEqual([[st, 0, actionId({ currency: 'augment', strength: 'base' })]]);
    expect(c.losses[0]!.best.currency).toBe('regal');
    expect(c.losses[0]!.loss).toBeCloseTo(c.losses[0]!.visits * (q - V[st]!), 9);
    // The whole gap is that one state's, and the method costs what an independent solve of its chain says.
    const independent = costIndependently(c.table, craft.lattice.finishCost);
    expect(c.cost / independent).toBeCloseTo(1, 9);
    expect(c.losses[0]!.loss / (independent - c.bestCost)).toBeCloseTo(1, 7);
  });

  /** A rule set an expert might write: up the rarities, bin a Magic item that misses, clean or bin a Rare. */
  const expert: Method = {
    rules: [
      { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
      { when: [{ kind: 'rarity', is: 'magic' }, { kind: 'junk', side: 'total', op: '>=', n: 1 }], move: { currency: 'restart' } },
      { when: [{ kind: 'rarity', is: 'magic' }], move: { currency: 'regal', strength: 'base' } },
      { when: [{ kind: 'junk', side: 'total', op: '>=', n: 2 }], move: { currency: 'restart' } },
      { when: [{ kind: 'junk', side: 'total', op: '=', n: 1 }], move: { currency: 'annul' } },
    ],
    otherwise: { currency: 'exalt', strength: 'base' },
  };

  it('the losses add up to the gap, whatever the method', () => {
    const c = ok(checkMethod(three.craft, three.V, 'exact', expert));
    expect(c.losses.length).toBeGreaterThan(2);
    expect(c.gap!).toBeGreaterThan(0);
    const sum = c.losses.reduce((s, l) => s + l.loss, 0);
    expect(Math.abs(sum - c.gap!) / c.cost).toBeLessThan(1e-9);
    expect(c.cost / costIndependently(c.table, three.craft.lattice.finishCost)).toBeCloseTo(1, 9);
    // Visits are per finished item: the goals' share sums to one.
    const t = c.table;
    let finished = 0;
    for (let i = 0; i < t.keys.length; i++) if (t.goal[i] === 1) finished += c.visits[i]!;
    expect(finished).toBeCloseTo(1, 12);
  });

  it('played on real items, it costs what the check says, within three standard errors', () => {
    const c = ok(checkMethod(three.craft, three.V, 'exact', expert, { replay: { runs: 4_000, seed: 3 } }));
    const r = c.replay!;
    if (!r.ok) throw new Error(r.reason);
    expect(Math.abs(r.meanCost - c.cost)).toBeLessThan(3 * r.stdErr);
    expect(r.costPercentiles).toHaveLength(101);
  });

  it('a folded spelling resolves, and is costed at its own price', () => {
    const { routes, craft, V } = three;
    // A Magic state the best plan passes where an Annulment has nothing to choose between the sides: the
    // Sinistral spelling is the same move, at the omen's price on top, so the solve keeps only the plain one.
    let found: { st: number; plain: McAction; omened: McAction } | undefined;
    for (const i of reachedFrom(routes, routes.restartIdx)) {
      if (decodeState(routes.keys[i]!).rarity !== 'magic' || routes.act[i]! < 0) continue;
      const ca = craft.lattice.compiled[i]!.find((x) => x.def.action.currency === 'annul' && x.def.aliases?.length);
      if (ca) { found = { st: i, plain: ca.def.action, omened: ca.def.aliases![0]! }; break; }
    }
    expect(found).toBeDefined();
    const { st, plain, omened } = found!;
    const dearer = actionCostOf(craft.problem.prices, omened) - actionCostOf(craft.problem.prices, plain);
    expect(dearer).toBeGreaterThan(0);

    const best = bestAsRules(three);
    const playing = (move: McAction): MethodChecked =>
      ok(checkMethod(craft, V, 'exact', { ...best, rules: [{ when: exactly(three, st), move: specOf(routes, move)! }, ...best.rules] }));
    const asSolved = playing(plain);
    const folded = playing(omened);
    expect(asSolved.folded).toEqual([]);
    expect(folded.folded.map(actionId)).toEqual([actionId(omened)]);
    expect(folded.table.actCost[st]).toBe(actionCostOf(craft.problem.prices, omened));
    // Same outcomes, so the same visits — and the dearer spelling costs those visits times the price difference.
    expect(folded.visits[st]).toBe(asSolved.visits[st]);
    expect(folded.cost - asSolved.cost).toBeCloseTo(asSolved.visits[st]! * dearer, 9);
    expect(folded.losses.find((l) => l.state === st)!.loss - asSolved.losses.find((l) => l.state === st)!.loss)
      .toBeCloseTo(asSolved.visits[st]! * dearer, 9);
  });
});

describe('a method that cannot be costed stops where it fails, and says why', () => {
  it('a Regal on a Rare item: the rule, the state, the reason', () => {
    const method: Method = {
      rules: [
        { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
        { when: [], move: { currency: 'regal', strength: 'base' } },
      ],
      otherwise: { currency: 'chaos' },
    };
    const c = checkMethod(three.craft, three.V, 'exact', method);
    if (c.ok) throw new Error('costed a Regal on a Rare');
    expect(c.stop).toMatchObject({ kind: 'not-possible', rule: 1, why: 'needs-magic', action: { currency: 'regal', strength: 'base' } });
    if (c.stop.kind !== 'not-possible') return;
    expect(decodeState(c.table.keys[c.stop.state]!).rarity).toBe('rare');
  });

  it('a currency the player excluded', () => {
    const opts: MarkovOptions = { ...FROM_WHITE, policy: { excluded: new Set(['augment']) } };
    const s = setup(white, THREE, opts);
    const method: Method = {
      rules: [
        { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
        { when: [{ kind: 'rarity', is: 'magic' }], move: { currency: 'augment', strength: 'base' } },
      ],
      otherwise: { currency: 'exalt', strength: 'base' },
    };
    const c = checkMethod(s.craft, s.V, 'exact', method);
    expect(c.ok).toBe(false);
    if (c.ok) return;
    expect(c.stop).toMatchObject({ kind: 'not-possible', rule: 1, why: 'excluded' });
  });

  it('a method that loops forever: never finishes, from the first state it cannot finish from', () => {
    // Transmute, then Augment an empty Magic item and Annul a full one: it never leaves Magic.
    const method: Method = {
      rules: [
        { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
        { when: [{ kind: 'open', side: 'prefix', op: '=', n: 1 }, { kind: 'open', side: 'suffix', op: '=', n: 1 }], move: { currency: 'augment', strength: 'base' } },
      ],
      otherwise: { currency: 'annul' },
    };
    const c = checkMethod(three.craft, three.V, 'exact', method);
    expect(c.ok).toBe(false);
    if (c.ok) return;
    expect(c.stop).toEqual({ kind: 'never-finishes', rule: 0, state: three.routes.restartIdx });
  });

  it('starting over on a white base never moves on', () => {
    const c = checkMethod(three.craft, three.V, 'exact', { rules: [], otherwise: { currency: 'restart' } });
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.stop).toMatchObject({ kind: 'never-finishes', rule: 'otherwise' });
  });

  it('a slot the craft does not have', () => {
    const c = checkMethod(three.craft, three.V, 'exact', {
      rules: [{ when: [{ kind: 'slot', slot: 3, is: 'present' }], move: { currency: 'chaos' } }], otherwise: { currency: 'chaos' },
    });
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.stop).toEqual({ kind: 'invalid', rule: 0, slot: 3 });
  });
});

describe('what a rule reads', () => {
  it('slots are numbered in the order their first target is asked, whatever ids they carry', () => {
    const craft = methodCraft(data, prices, white, [{ modId: SUF[0]!, minTierIndex: 0, slot: 7 }, { modId: PRE[0]!, minTierIndex: 0, slot: 2 }], FROM_WHITE);
    if ('refused' in craft) throw new Error(craft.refused);
    const ids = (k: number) => craft.problem.list.filter((_, i) => (craft.problem.slotMasks[k]! & (1 << i)) !== 0).flatMap((t) => t.mods.map((m) => m.mod.id));
    expect(ids(0)).toEqual([SUF[0]]);
    expect(ids(1)).toEqual([PRE[0]]);
  });

  it('a best plan whose states rules cannot tell apart is said not to be faithful', () => {
    // Rules read slots, junk, rarity and where a Desecration's mark sits — not which wanted mod it marked,
    // nor which of a slot's alternatives landed. Two states that read alike but get different moves from
    // the plan cannot both be written out. Spell Damage, or its Essence, fills the second slot here.
    const twin = setup(white, [
      { modId: PRE[0]!, minTierIndex: 0, slot: 0 }, { modId: 'Wands/WeaponSpellDamage', minTierIndex: 0, slot: 1 },
      { modId: SUF[0]!, minTierIndex: 0, slot: 2 }, { modId: 'Wands/Essence_WeaponCasterDamagePrefix', minTierIndex: 0, slot: 1, essenceTwin: true },
    ], { ...FROM_WHITE, policy: { excluded: new Set(['desecrate', 'desecrate_ancient']) } });
    const t = twin.routes;
    const reading = (i: number): string => JSON.stringify(methodFromPlan(t, [t.keys[i]!]).method.rules[0]?.when);
    const seen = new Map<string, number>();
    let pair: [number, number] | undefined;
    for (let i = 0; i < t.keys.length && !pair; i++) {
      if (t.goal[i] === 1 || t.act[i]! < 0) continue;
      const r = reading(i);
      const j = seen.get(r);
      if (j !== undefined && actionId(t.actions[t.act[j]!]!) !== actionId(t.actions[t.act[i]!]!)) pair = [j, i];
      else if (j === undefined) seen.set(r, i);
    }
    expect(pair).toBeDefined();
    const keys = pair!.map((i) => t.keys[i]!);
    expect(methodFromPlan(t, keys).faithful).toBe(false);
    // Each alone is written out faithfully.
    expect(methodFromPlan(t, [keys[0]!]).faithful).toBe(true);
    expect(methodFromPlan(t, [keys[1]!]).faithful).toBe(true);
  });

  it('a prefill starts over where nothing else is said, on a craft that can', () => {
    const line = reachedFrom(three.routes, three.routes.restartIdx).slice(0, 4).map((i) => three.routes.keys[i]!);
    const { method, faithful } = methodFromPlan(three.routes, line);
    expect(faithful).toBe(true);
    expect(method.otherwise).toEqual({ currency: 'restart' });
    expect(method.rules.length).toBeGreaterThan(0);
  });
});

describe('a Desecration where the solve plays every one with an Omen of Abyssal Echoes', () => {
  // The frozen sheet prices no Abyssal Echoes omen, so this copy does — cheap, so the best plan throws
  // offers back. Then every Desecration the solve offers carries the omen (it is paid only when used),
  // and a player's plain Desecration is that move never thrown back.
  const ECHOES_PRICE = 0.01;
  const withEchoes: Prices = { ...prices, omens: { ...prices.omens, [ECHOES_OMEN]: ECHOES_PRICE } };
  const r = markovFromItem(data, withEchoes, white, THREE, FROM_WHITE);
  const craft = methodCraft(data, withEchoes, white, THREE, FROM_WHITE);
  if ('refused' in craft) throw new Error(craft.refused);
  const best = bestValues(craft, { routes: r.routes!, bound: r.bound });
  if ('refused' in best) throw new Error(best.refused);
  const V = best.V;
  /** Up to a clean Rare, then Desecrate while no Desecrated modifier is on it; bin what misses. */
  const desecrating = (move: Method['otherwise']): Method => ({
    rules: [
      { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
      { when: [{ kind: 'rarity', is: 'magic' }, { kind: 'junk', side: 'total', op: '>=', n: 1 }], move: { currency: 'restart' } },
      { when: [{ kind: 'rarity', is: 'magic' }], move: { currency: 'regal', strength: 'base' } },
      { when: [{ kind: 'junk', side: 'total', op: '>=', n: 1 }], move: { currency: 'restart' } },
      { when: [{ kind: 'bone', is: 'none' }], move },
    ],
    otherwise: { currency: 'exalt', strength: 'base' },
  });
  const bone = actionCostOf(craft.problem.prices, { currency: 'desecrate' });

  /**
   * The keep rule worked by hand from the offer's draw odds (markovOffer.ts states it): of `offer` draws
   * the one cheapest to finish from by V is kept, P(keep k) = T_k^m − T_(k+1)^m over outcomes sorted by
   * V, T the tail sums; τ = Σ P(keep k)·V_k. With a reroll at price c the first offer goes back when even
   * its best costs more than c + τ — with chance q^m, q the odds of a draw above that bar — and the fresh
   * offer is kept as above. Returns the chance of keeping each destination and of a throw.
   */
  function byHand(i: number, ca: CompiledAction, c?: number): { keep: Map<number, number>; thrown: number } {
    const outs = Array.from(ca.to, (t, j) => ({ t, p: ca.prob[j]! }));
    if (ca.selfProb > 0) outs.push({ t: i, p: ca.selfProb });
    outs.sort((a, b) => V[a.t]! - V[b.t]!);
    const m = ca.offer;
    const tail = outs.map((_, k) => outs.slice(k).reduce((sum, o) => sum + o.p, 0));
    const plain = outs.map((_, k) => tail[k]! ** m - (tail[k + 1] ?? 0) ** m);
    const tau = outs.reduce((sum, o, k) => sum + plain[k]! * V[o.t]!, 0);
    const bar = c === undefined ? Infinity : c + tau;
    const above = outs.reduce((sum, o) => sum + (V[o.t]! > bar ? o.p : 0), 0);
    const thrown = c === undefined ? 0 : above ** m;
    const keep = new Map<number, number>();
    outs.forEach((o, k) => keep.set(o.t, (keep.get(o.t) ?? 0) + (V[o.t]! <= bar ? plain[k]! : 0) + thrown * plain[k]!));
    return { keep, thrown };
  }
  /** What the method's table keeps at state `i`: its realized odds, by destination. */
  const keptAt = (c: MethodChecked, i: number): Map<number, number> => {
    const kept = new Map<number, number>();
    for (let o = c.table.outStart[i]!; o < c.table.outStart[i + 1]!; o++) {
      kept.set(c.table.outTo[o]!, (kept.get(c.table.outTo[o]!) ?? 0) + c.table.outProb[o]!);
    }
    return kept;
  };
  const sameOdds = (a: Map<number, number>, b: Map<number, number>): void => {
    for (const k of new Set([...a.keys(), ...b.keys()])) expect(a.get(k) ?? 0).toBeCloseTo(b.get(k) ?? 0, 12);
  };
  /** The states the method reaches where it Desecrates, with the solve's own Desecration there. */
  const desecratedAt = (c: MethodChecked): { i: number; ca: CompiledAction }[] =>
    c.table.keys.map((_, i) => i).filter((i) => c.visits[i]! > 0 && c.table.actions[c.table.act[i]!]?.currency === 'desecrate')
      .map((i) => {
        const omened = actionId({ currency: 'desecrate', echoes: true });
        return { i, ca: craft.lattice.compiled[i]!.find((x) => actionId(x.def.action) === omened)! };
      });

  it('a plain Desecration is the Echoes move with no reroll: the bone alone, the best of three kept', () => {
    expect(r.bound).toBe('exact');
    const plain = ok(checkMethod(craft, V, 'exact', desecrating({ currency: 'desecrate' })));
    const at = desecratedAt(plain);
    expect(at.length).toBeGreaterThan(0);
    for (const { i, ca } of at) {
      // The solve has no plain Desecration here — each one it offers carries the omen.
      const offered = craft.lattice.compiled[i]!.filter((x) => x.def.action.currency === 'desecrate');
      expect(offered.every((x) => x.def.action.currency === 'desecrate' && x.def.action.echoes === true)).toBe(true);
      expect(ca.offer).toBe(3);
      expect(plain.table.actCost[i]).toBe(bone);
      expect(plain.table.rerollAbove[i]).toBeNaN();
      sameOdds(keptAt(plain, i), byHand(i, ca).keep);
    }
    expect(plain.keepsOffers).toBe(true);
  });

  it('with the omen, it throws the offer back where the best plan would, and pays the omen only then', () => {
    const echoes = ok(checkMethod(craft, V, 'exact', desecrating({ currency: 'desecrate', echoes: true })));
    const at = desecratedAt(echoes);
    expect(at.length).toBeGreaterThan(0);
    let rerolls = 0;
    for (const { i, ca } of at) {
      const hand = byHand(i, ca, ECHOES_PRICE);
      // One play: the bone, and the omen times the chance it is used.
      expect(echoes.table.actCost[i]).toBeCloseTo(bone + hand.thrown * ECHOES_PRICE, 12);
      sameOdds(keptAt(echoes, i), hand.keep);
      if (hand.thrown > 0) { rerolls++; expect(Number.isFinite(echoes.table.rerollAbove[i])).toBe(true); }
    }
    // Somewhere it goes the omen is worth using, so the reroll is really exercised.
    expect(rerolls).toBeGreaterThan(0);
  });
});
