import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { listMods } from './engine.ts';
import type { Method, MoveSpec, TargetInput } from './engineTypes.ts';
import {
  NOT_OWNED, bossOptions, emptyMethod, gradeOptions, isMethod, methodCraftInfo, methodRequest, methodSig,
  moveKindOptions, omenOptions, readMethod, writeMethod, type LabRequest, type MethodCraftInfo,
} from './methodRules.ts';
import { runSolve } from './solve.ts';

// The editor's side of "Check my method": what a rule may say on a craft, the request a check sends, and
// where a method is kept. The checking itself is markovMethod.test.ts and methodCheck.test.ts.

const data = loadPatch('data/patches/0.5.0');
const eng = { data, prices: loadFrozenPrices() };
const mods = listMods(data, 'Wands');
const any = (id: string, slot?: number): TargetInput => {
  const m = [...mods.prefixes, ...mods.suffixes].find((x) => x.id === id)!;
  return { modId: id, tierDisplay: m.tiers.length, ...(slot === undefined ? {} : { slot }) };
};
const textOf = (id: string): string => data.mods.get(id)?.text ?? id;
const targets = [any('Wands/IncreasedMana'), any('Wands/WeaponSpellDamage'), any('Wands/Intelligence')];
const req: LabRequest = { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 1 };
const lab = runSolve(eng, req);

const options = (groups: ReturnType<typeof moveKindOptions>): string[] => groups.flatMap((g) => g.options.map((o) => o.value));
const withExcluded = (excluded: string[]): MethodCraftInfo => methodCraftInfo(data, { ...req, excluded }, lab.markov.routes);

beforeEach(() => localStorage.clear());

describe('what a rule can name on a craft', () => {
  it('names each slot by its targets, in the order the solve numbers them, and reads the craft off the solve', () => {
    const info = methodCraftInfo(data, req, lab.markov.routes);
    expect(info.slots.map((s) => s.name)).toEqual(targets.map((t) => textOf(t.modId)));
    expect(info.canRestart).toBe(true);
    expect(info.policy).toBeUndefined();
    // Spell Damage's Essence twin is a position of its slot in the solve, so an Essence is a move for it.
    expect(info.slots.map((s) => s.essence)).toEqual([undefined, 'Wands/Essence_WeaponCasterDamagePrefix', undefined]);
    expect(options(moveKindOptions(info, { currency: 'chaos' }))).toContain('essence:1');
    // Bones are priced on this sheet, so the solve's states carry the Desecration flag.
    expect(info.desecration).toBe(true);
    expect(options(moveKindOptions(info, { currency: 'chaos' }))).toContain('desecrate');
  });

  it('names a slot of alternatives "A or B", once, as the graph names a position', () => {
    const two = [any('Wands/IncreasedMana', 7), any('Wands/WeaponSpellDamage'), any('Wands/WeaponSpellDamageAndMana', 7)];
    const info = methodCraftInfo(data, { ...req, targets: two }, undefined);
    expect(info.slots.map((s) => s.name)).toEqual([
      `${textOf('Wands/IncreasedMana')} or ${textOf('Wands/WeaponSpellDamageAndMana')}`, textOf('Wands/WeaponSpellDamage'),
    ]);
  });

  it('a carved craft cannot start over, so neither can a rule', () => {
    const info = methodCraftInfo(data, { ...req, from: { item: { baseId: 'Wands', level: 82, rarity: 'rare', prefixes: [], suffixes: [] } } }, undefined);
    expect(info.canRestart).toBe(false);
    expect(options(moveKindOptions(info, { currency: 'chaos' }))).not.toContain('restart');
    expect(emptyMethod(info).otherwise).toEqual({ currency: 'chaos' });
  });

  it('offers only the currencies the solve ran with', () => {
    const all = withExcluded([]);
    expect(options(moveKindOptions(all, { currency: 'chaos' }))).toEqual(expect.arrayContaining(
      ['chaos', 'exalt', 'annul', 'regal', 'transmute', 'augment', 'restart']));
    const noRegal = withExcluded(['regal', 'regal_greater', 'regal_perfect', 'annul']);
    expect(options(moveKindOptions(noRegal, { currency: 'chaos' }))).not.toContain('regal');
    expect(options(moveKindOptions(noRegal, { currency: 'chaos' }))).not.toContain('annul');
    // A strength the player lacks is not offered; the others are.
    const noPerfect = withExcluded(['exalt_perfect']);
    expect(gradeOptions({ currency: 'exalt', strength: 'base' }, noPerfect).map((o) => o.value)).toEqual(['base', 'greater']);
    // Nor an omen.
    const noSinistral = withExcluded(['OmenofSinistralExaltation']);
    expect(omenOptions({ currency: 'exalt', strength: 'base' }, noSinistral).map((o) => o.value)).toEqual(['', 'suffix']);
    expect(omenOptions({ currency: 'annul' }, all).map((o) => o.value)).toEqual(['', 'prefix', 'suffix', 'light']);
  });

  it('keeps a rule’s own choice listed, marked, rather than silently changing it', () => {
    const noRegal = withExcluded(['regal', 'regal_greater', 'regal_perfect']);
    const regal: MoveSpec = { currency: 'regal', strength: 'greater' };
    expect(options(moveKindOptions(noRegal, regal))).toContain('regal');
    expect(gradeOptions(regal, noRegal)).toEqual([{ value: 'greater', label: `Greater${NOT_OWNED}` }]);
  });

  it('offers boss omens only on a base that takes one', () => {
    const info = methodCraftInfo(data, req, lab.markov.routes);
    expect(bossOptions({ currency: 'desecrate' }, info).map((o) => o.value)).toEqual(['', 'blackblooded', 'liege', 'sovereign']);
    expect(bossOptions({ currency: 'desecrate' }, { ...info, boss: false })).toEqual([]);
  });
});

describe('a craft the panel cannot fully read', () => {
  it('offers less, and never throws — the panel has no error boundary of its own', () => {
    const stub = { mods: new Map() } as unknown as typeof data;
    const info = methodCraftInfo(stub, req, {} as never);
    expect(info.slots.map((s) => s.name)).toEqual(targets.map((t) => t.modId));
    expect(info.boss).toBe(false);
    expect(info.canRestart).toBe(true);
  });
});

describe('the request a check sends', () => {
  it('is the solve’s own craft, with its table and bound — and nothing only the solve reads', () => {
    const full: LabRequest = {
      ...req, budget: 50, want: targets, excluded: ['regal'], runes: ['r'], spare: { prefixes: 1, suffixes: 0 },
      effort: { maxMillis: 1000, maxNodes: 10 },
    };
    const method: Method = { rules: [], otherwise: { currency: 'restart' } };
    const got = methodRequest(full, method, lab.markov);
    expect(got).toEqual({
      kind: 'method', from: req.from, targets, method, baseCost: 1, excluded: ['regal'], runes: ['r'],
      spare: { prefixes: 1, suffixes: 0 }, effort: { maxMillis: 1000, maxNodes: 10 },
      best: { routes: lab.markov.routes, bound: lab.markov.bound },
    });
  });

  it('without a table, asks the check to solve the best plan itself', () => {
    const { routes: _r, ...bare } = lab.markov;
    expect(methodRequest(req, emptyMethod(methodCraftInfo(data, req, undefined)), bare)).not.toHaveProperty('best');
  });
});

describe('a method is kept per craft', () => {
  const method: Method = {
    rules: [{ when: [{ kind: 'junk', side: 'total', op: '>=', n: 2 }], move: { currency: 'restart' } }],
    otherwise: { currency: 'exalt', strength: 'greater', side: 'suffix' },
  };

  it('comes back for the same craft, whatever the exclusions, base cost or effort; another craft starts empty', () => {
    writeMethod(methodSig(req), method);
    expect(readMethod(methodSig({ ...req, excluded: ['regal'], baseCost: 3, effort: { maxMillis: 1, maxNodes: 1 } }))).toEqual(method);
    expect(readMethod(methodSig({ ...req, targets: targets.slice(1) }))).toBeUndefined();
  });

  it('keeps the twenty most recent crafts', () => {
    for (let i = 0; i < 21; i++) writeMethod(`craft ${i}`, method);
    expect(readMethod('craft 0')).toBeUndefined();
    expect(readMethod('craft 1')).toEqual(method);
    expect(readMethod('craft 20')).toEqual(method);
  });

  it('reads anything else as none, and never throws', () => {
    localStorage.setItem('poe2htc.method.v1', '{not json');
    expect(readMethod('x')).toBeUndefined();
    localStorage.setItem('poe2htc.method.v1', JSON.stringify([{ sig: 'x', method: { rules: [{ when: [{ kind: 'mood' }], move: { currency: 'chaos' } }], otherwise: { currency: 'chaos' } } }]));
    expect(readMethod('x')).toBeUndefined();
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => writeMethod('x', method)).not.toThrow();
    expect(readMethod('x')).toBeUndefined();
    get.mockRestore();
    set.mockRestore();
  });

  it('knows a method’s shape', () => {
    expect(isMethod(method)).toBe(true);
    expect(isMethod({ rules: [], otherwise: { currency: 'alchemy' } })).toBe(false);
    expect(isMethod({ rules: [{ when: [], move: { currency: 'exalt' } }], otherwise: { currency: 'chaos' } })).toBe(false);
    expect(isMethod({ rules: [{ when: [{ kind: 'junk', side: 'total', op: '>', n: 1 }], move: { currency: 'chaos' } }], otherwise: { currency: 'chaos' } })).toBe(false);
  });
});
