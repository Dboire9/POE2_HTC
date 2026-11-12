import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { whiteItem } from '../../engine/src/item.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import type { MarkovOptions, MarkovProgress, MarkovResult } from './markovFromItem.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { TierTarget } from './optimize.ts';
import { markovIdentityCrafts, markovSiblingCrafts } from './__fixtures__/siblingCrafts.ts';

// `markovFromItem.ts` was split into phases (problem → lattice → solve → read-out) by MOVING code, not
// rewriting it. This holds the move to that: every craft below was recorded before the split, and must
// come back byte-identical — the whole result (route table and its `locate`, policy, holdings, replay)
// AND the progress events, so a phase that stops reporting, or reports in another order, fails here too.
//
// Re-record (only for a deliberate change of answer, never to make a refactor pass):
//   RECORD_SPLIT=1 npx vitest run packages/optimizer/src/markovSplit.test.ts

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const FIXTURE = join(import.meta.dirname, '__fixtures__', 'pre-split-markov.json');

/** Everything in the result, as JSON: Maps and Sets as entry lists, typed arrays as plain arrays. */
function fingerprint(r: MarkovResult, events: MarkovProgress[]): unknown {
  const json = JSON.stringify({ r, events }, (_k, v: unknown) => {
    if (v instanceof Map) return { map: [...v.entries()] };
    if (v instanceof Set) return { set: [...v] };
    if (ArrayBuffer.isView(v)) return { typed: Array.from(v as unknown as ArrayLike<number>) };
    if (typeof v === 'number' && !Number.isFinite(v)) return { num: String(v) };
    return v;
  });
  return {
    feasible: r.feasible, reason: r.reason ?? null, bound: r.bound,
    expectedCost: Number.isFinite(r.expectedCost) ? r.expectedCost : String(r.expectedCost),
    routes: r.routes !== undefined, sha256: createHash('sha256').update(json).digest('hex'),
  };
}

const wands = data.bases.get('Wands')!;
const top = (id: string): number => data.mods.get(id)!.tiers.length - 1;
const CASTER: TierTarget[] = [
  { modId: 'Wands/WeaponSpellDamage', minTierIndex: top('Wands/WeaponSpellDamage') - 2 },
  { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon', minTierIndex: top('Wands/GlobalIncreaseSpellSkillGemLevelWeapon') - 1 },
  { modId: 'Wands/IncreasedCastSpeed', minTierIndex: top('Wands/IncreasedCastSpeed') - 2 },
];
const white = whiteItem(wands, 82);
const heldRare: ItemState = {
  base: wands, level: 82, rarity: 'rare',
  prefixes: [{ modId: 'Wands/IncreasedMana', tierName: data.mods.get('Wands/IncreasedMana')!.tiers[0]!.name }], suffixes: [],
};
const finished: ItemState = {
  base: wands, level: 82, rarity: 'rare',
  prefixes: [{ modId: 'Wands/WeaponSpellDamage', tierName: data.mods.get('Wands/WeaponSpellDamage')!.tiers.at(-1)!.name }],
  suffixes: [{ modId: 'Wands/IncreasedCastSpeed', tierName: data.mods.get('Wands/IncreasedCastSpeed')!.tiers.at(-1)!.name }],
};
const TWO: TierTarget[] = [{ modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/IncreasedCastSpeed' }];

type Run = (extra?: MarkovOptions) => MarkovResult;
const solve = (start: ItemState, targets: TierTarget[], opts: MarkovOptions): Run =>
  (extra = {}) => markovFromItem(data, prices, start, targets, { ...opts, ...extra });

function crafts(): { name: string; run: Run }[] {
  const seed = markovFromItem(data, prices, white, CASTER, { restartCost: 0, solver: 'policy', keepRoutes: true }).routes!;
  return [
    ...markovIdentityCrafts(data, prices).map((c) => ({ name: `identity: ${c.name}`, run: (e: MarkovOptions = {}) => c.run({ keepRoutes: true, ...e }) })),
    ...markovSiblingCrafts(data, prices).map((c) => ({ name: `sibling: ${c.name}`, run: (e: MarkovOptions = {}) => c.run({ keepRoutes: true, ...e }) })),
    { name: 'caster, policy, routes', run: solve(white, CASTER, { restartCost: 0, solver: 'policy', keepRoutes: true }) },
    { name: 'two mods, value iteration, paid base', run: solve(white, TWO, { restartCost: 3, solver: 'value', keepRoutes: true }) },
    { name: 'caster, ceiling (one round)', run: solve(white, CASTER, { restartCost: 0, solver: 'policy', keepRoutes: true, maxRounds: 1 }) },
    { name: 'held rare, floor (two sweeps)', run: solve(heldRare, CASTER, { keepRoutes: true, maxIters: 2 }) },
    { name: 'held rare, exact', run: solve(heldRare, CASTER, { keepRoutes: true }) },
    { name: 'caster, seeded from its own plan', run: solve(white, CASTER, { restartCost: 0, solver: 'policy', keepRoutes: true, seedFrom: seed }) },
    { name: 'caster, heuristic seed', run: solve(white, CASTER, { restartCost: 0, solver: 'policy', heuristicSeed: true }) },
    { name: 'two mods, iterative evaluation', run: solve(white, TWO, { restartCost: 0, solver: 'policy', iterativeEval: true }) },
    { name: 'caster, exact evaluation', run: solve(white, CASTER, { restartCost: 0, solver: 'policy', exactEvaluation: true }) },
    { name: 'two mods, fill on finish', run: solve(white, TWO, { restartCost: 0, fillOnFinish: true, keepRoutes: true }) },
    { name: 'two mods, replayed', run: solve(white, TWO, { restartCost: 0, keepRoutes: true, replay: { runs: 2000, seed: 7 } }) },
    { name: 'already finished', run: solve(finished, TWO, { keepRoutes: true }) },
    { name: 'refused: no targets', run: solve(white, [], {}) },
    { name: 'refused: cannot roll at this level', run: solve(whiteItem(wands, 1), CASTER, {}) },
  ];
}

describe('the split moved code, not answers', () => {
  const list = crafts();
  const got: Record<string, unknown> = {};
  for (const c of list) {
    const events: MarkovProgress[] = [];
    got[c.name] = fingerprint(c.run({ onProgress: (p) => events.push(p) }), events);
  }
  if (process.env['RECORD_SPLIT'] === '1') writeFileSync(FIXTURE, `${JSON.stringify(got, null, 1)}\n`);
  const recorded = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Record<string, unknown>;

  for (const c of list) {
    it(`${c.name}: byte-identical to the recording`, () => {
      expect(got[c.name]).toEqual(recorded[c.name]);
    });
  }

  it('the recording covers every craft here, and nothing else', () => {
    expect(Object.keys(recorded).sort()).toEqual(list.map((c) => c.name).sort());
  });
});
