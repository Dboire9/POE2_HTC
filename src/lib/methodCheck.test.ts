import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { listMods, prefillMethod } from './engine.ts';
import type { EngineMethodResult, Method, TargetInput } from './engineTypes.ts';
import { mainLine } from './policyPath.ts';
import { runSolve, type SolveProgress } from './solve.ts';

// "Check my method" end to end through `runSolve`, as the worker runs it: a Plan-tab solve first, then the
// method request handing back its table, so the best plan is not solved again. On the frozen sheet.

const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadFrozenPrices() };
const mods = listMods(eng.data, 'Wands');
const any = (id: string): TargetInput => {
  const m = [...mods.prefixes, ...mods.suffixes].find((x) => x.id === id)!;
  return { modId: id, tierDisplay: m.tiers.length };
};
const targets = [any('Wands/IncreasedMana'), any('Wands/WeaponSpellDamage'), any('Wands/Intelligence')];
const from = { baseId: 'Wands', level: 82 };
const lab = runSolve(eng, { kind: 'lab', from, targets, baseCost: 1 });
const best = { routes: lab.markov.routes!, bound: lab.markov.bound };

/** Up the rarities, bin a Magic item that misses, clean or bin a Rare. */
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

const okOf = (r: EngineMethodResult) => {
  if (!r.ok) throw new Error(r.stop.message);
  return r;
};

describe('a method request, end to end', () => {
  it('costs the method against the best plan the Plan tab solved, worded, with its spread', () => {
    expect(lab.markov.bound).toBe('exact');
    const seen: SolveProgress[] = [];
    const got = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: expert, best }, (p) => seen.push(p));
    expect(got.kind).toBe('method');
    const m = okOf(got.method);
    expect(m.best).toEqual({ cost: lab.markov.expectedCost, bound: 'exact' });
    expect(m.gap).toBeCloseTo(m.cost - m.best.cost, 9);
    expect(m.gap!).toBeGreaterThan(0);
    // At most five rows, largest first; with what is left they account for the whole gap.
    expect(m.where.length).toBeGreaterThan(0);
    expect(m.where.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < m.where.length; i++) expect(m.where[i]!.costsYou).toBeLessThanOrEqual(m.where[i - 1]!.costsYou);
    const shown = m.where.reduce((s, r) => s + r.costsYou, 0) + (m.elsewhere?.costsYou ?? 0);
    expect(Math.abs(shown - m.gap!) / m.cost).toBeLessThan(1e-6);
    for (const row of m.where) {
      expect(row.rule).toMatch(/^(Rule [1-5]|Otherwise)$/);
      expect(row.where).toMatch(/^(A white base|Magic ·|Rare ·)/);
      expect(row.yourMove).not.toBe(row.bestMove);
      expect(row.visits).toBeGreaterThan(0);
    }
    // Played out as Play it out plays: the percentiles of what one craft costs.
    expect(m.replay?.costPercentiles).toHaveLength(101);
    expect(m.notes).toEqual([]);
    expect(seen[seen.length - 1]).toEqual({ phase: 'playout', fraction: 1 });
    for (let i = 1; i < seen.length; i++) expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
  });

  it('without the Plan tab’s table, solves the best plan once and gives the same answer', () => {
    const withTable = okOf(runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: expert, best }).method);
    const alone = okOf(runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: expert }).method);
    expect(alone.cost).toBeCloseTo(withTable.cost, 9);
    expect(alone.best.cost / withTable.best.cost).toBeCloseTo(1, 9);
  });

  it('a move the item cannot take: the rule, the move, the reason and the item, in one sentence', () => {
    const regalOnRare: Method = {
      rules: [
        { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
        { when: [], move: { currency: 'regal', strength: 'base' } },
      ],
      otherwise: { currency: 'chaos' },
    };
    const got = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: regalOnRare, best }).method;
    expect(got.ok).toBe(false);
    if (got.ok) return;
    expect(got.stop).toMatchObject({ kind: 'not-possible', rule: 'Rule 2', move: 'Regal', why: 'needs-magic' });
    expect(got.stop.message).toMatch(/^Rule 2 says Regal, but it works on a Magic item, and here the item is already Rare\. The item there: Rare · /);
  });

  it('a currency the player does not have', () => {
    const got = runSolve(eng, {
      kind: 'method', from, targets, baseCost: 1, excluded: ['regal'], method: expert,
    }).method;
    expect(got.ok).toBe(false);
    if (!got.ok) {
      expect(got.stop).toMatchObject({ kind: 'not-possible', rule: 'Rule 3', move: 'Regal', why: 'excluded' });
      expect(got.stop.message).toContain('it is in your “currency I don’t have” list');
    }
  });

  it('a method that never finishes says where', () => {
    const loop: Method = {
      rules: [
        { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
        { when: [{ kind: 'open', side: 'prefix', op: '=', n: 1 }, { kind: 'open', side: 'suffix', op: '=', n: 1 }], move: { currency: 'augment', strength: 'base' } },
      ],
      otherwise: { currency: 'annul' },
    };
    const got = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: loop, best }).method;
    expect(got.ok).toBe(false);
    if (!got.ok) {
      expect(got.stop.kind).toBe('never-finishes');
      expect(got.stop.message).toBe('Your method never finishes from: A white base (Rule 1 plays Transmute there).');
    }
  });

  it('a method pre-filled from the best plan’s main line can be checked as it stands', () => {
    const line = mainLine(lab.markov).steps.map((s) => s.node.key);
    expect(line.length).toBeGreaterThan(0);
    const pre = prefillMethod(lab.markov, line)!;
    expect(pre.faithful).toBe(true);
    expect(pre.method.otherwise).toEqual({ currency: 'restart' });
    const m = okOf(runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: pre.method, best }).method);
    expect(m.gap!).toBeGreaterThanOrEqual(-1e-9 * m.best.cost);
    // The main line itself is the best plan's: anything it loses, it loses off the line.
    const onLine = new Set(line);
    for (const row of m.where) expect(onLine.has(row.node.key)).toBe(false);
  });
});
