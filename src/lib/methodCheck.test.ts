import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { listMods } from './engine.ts';
import type { EngineMethodResult, Method, TargetInput } from './engineTypes.ts';
import { neverFinishes } from './methodWords.ts';
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
      expect(got.stop).toMatchObject({ kind: 'never-finishes', rule: 'Otherwise', move: 'Annul' });
      expect(got.stop.message).toMatch(
        /^Your method never finishes: Otherwise plays Annul at the nearest it gets to the finished item, and from what follows, your rules only go round in a loop\. That item: Magic · /);
    }
  });
});

describe('a method that never finishes, in words', () => {
  it('names the rule where it loses its progress, what follows it, and whether any craft finishes', () => {
    expect(neverFinishes('Otherwise', 'Start over with a new base', 'restart', true, 'Magic · +# to Intelligence')).toBe(
      'Your method never finishes: Otherwise starts over at the nearest it gets to the finished item. That item: Magic · +# to Intelligence.');
    expect(neverFinishes('Rule 4', 'Chaos', 'loops', false, 'Rare · #% increased Spell Damage')).toBe(
      'Some crafts never finish with your method: Rule 4 plays Chaos at the nearest they get to the finished item, and from what follows, your rules only go round in a loop. That item: Rare · #% increased Spell Damage.');
    expect(neverFinishes('Rule 3', 'Annul', 'starts-over', true, 'Magic · +# to maximum Mana')).toBe(
      'Your method never finishes: Rule 3 plays Annul at the nearest it gets to the finished item, and from what follows, your rules only ever start over. That item: Magic · +# to maximum Mana.');
  });
});

describe('Start from the best plan', () => {
  it('the worker writes the best plan as short rules and checks them at once: no gap', () => {
    // A craft whose states every rule can tell apart (no Essence twin sharing a slot with a rolled mod).
    const plain = [any('Wands/IncreasedMana'), any('Wands/Intelligence'), any('Wands/IncreasedCastSpeed')];
    const solved = runSolve(eng, { kind: 'lab', from, targets: plain, baseCost: 1 });
    expect(solved.markov.bound).toBe('exact');
    const got = runSolve(eng, {
      kind: 'method', from, targets: plain, baseCost: 1, method: 'best',
      best: { routes: solved.markov.routes!, bound: solved.markov.bound },
    });
    const pre = got.prefilled!;
    expect(pre.faithful).toBe(true);
    // Each rule keeps only some of what an exact rule says: the rarity, every slot, both junk counts, the bone.
    const exactTests = 1 + plain.length + 2 + 1;
    for (const rule of pre.method.rules) expect(rule.when.length).toBeLessThan(exactTests);
    expect(pre.method.otherwise).toEqual({ currency: 'restart' });
    // At the app's own tolerance, the gap is the solver's rounding: the panel says "nothing more".
    const m = okOf(got.method);
    expect(m.where).toEqual([]);
    expect(m.gap!).toBeLessThanOrEqual(1e-6 * m.best.cost);
    expect(m.replay?.costPercentiles).toHaveLength(101);
  });

  it('where two of the plan’s items read alike to every rule, it says so, and the check shows the gap', () => {
    const got = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: 'best', best });
    expect(got.prefilled!.faithful).toBe(false);
    expect(okOf(got.method).gap!).toBeGreaterThan(0);
  });

  it('one later rule changed so every craft ends in a start over: the check names that rule, not Rule 1', () => {
    // A player's report (2026-11-26): the best plan's rules, Rule 4 changed, and "never finishes from: A
    // white base (Rule 1 plays Transmute (Greater) there)" — the start is the first state of any method
    // where nothing finishes. The rule that Annuls the Magic item the Essence would have made Rare is.
    const pre = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: 'best', best }).prefilled!;
    const r = pre.method.rules.findIndex((x) => x.move.currency === 'essence');
    expect(r).toBeGreaterThan(0);
    const changed: Method = { ...pre.method, rules: pre.method.rules.map((x, k) => (k === r ? { ...x, move: { currency: 'annul' } } : x)) };
    const got = runSolve(eng, { kind: 'method', from, targets, baseCost: 1, method: changed, best }).method;
    if (got.ok) throw new Error('costed a method that never finishes');
    expect(got.stop).toMatchObject({ kind: 'never-finishes', rule: `Rule ${r + 1}`, move: 'Annul' });
    expect(got.stop.message).toMatch(new RegExp(
      `^Your method never finishes: Rule ${r + 1} plays Annul at the nearest it gets to the finished item, and from what follows, your rules only ever start over\\. That item: Magic · `));
  });
});
