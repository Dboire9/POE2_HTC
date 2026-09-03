import { describe, it, expect, vi } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';

// `loadEngine` fetches the snapshot by URL, which jsdom cannot resolve from a root-relative path.
// Feed it the same data off disk instead: the point of this file is the message protocol, and the
// solve behind it should stay real so the progress reports it emits are the real ones.
vi.mock('./engine.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./engine.ts')>();
  const { loadPrices } = await import('../../packages/optimizer/src/loadPrices.ts');
  const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
  return { ...actual, loadEngine: () => Promise.resolve(eng) };
});

import { solve, isCancelled } from './engineClient.ts';
import type { SolveProgress } from './solve.ts';
import { listMods } from './engine.ts';

// The client is the one link in the chain nothing else covers: solve.ts is tested directly, and the
// component tests only assert that a planner ran. Between them sits the id-keyed message protocol —
// and a break there produces exactly the symptom that is hard to diagnose from a screenshot: the
// elapsed timer keeps counting (it is local to the component) while the bar never moves, because the
// progress messages never arrive.
const mods = listMods(loadPatch('data/patches/0.5.0'), 'Wands');
// The item must NOT already satisfy `targets`. It used to: the item held p0 and s0 and the targets
// were p0 and s0 at the same tier, so the start state was already the goal — and `markovFromItem` now
// short-circuits that in ~1 ms without building a state space (see its `isAccepting` guard). Every
// test below that needs a real solve — progress messages, sweep limits — was silently measuring the
// solver grinding through a lattice for a craft that was already finished, and passed only because
// that waste existed. Hold ONE of them and ask for both.
const item = {
  baseId: 'Wands', level: 82, rarity: 'rare' as const,
  prefixes: [{ modId: mods.prefixes[0]!.id, tierDisplay: 99 }],
  suffixes: [],
};
const targets = [
  { modId: mods.prefixes[0]!.id, tierDisplay: 99 },
  { modId: mods.suffixes[0]!.id, tierDisplay: 99 },
];

describe('engineClient — the progress messages actually reach the caller', () => {
  it('forwards progress from the worker for an item solve', async () => {
    const seen: SolveProgress[] = [];
    const { promise } = solve({ kind: 'item', item, targets }, (p) => seen.push(p));
    await promise;
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  });

  // Declared timeout: a budgeted lab solve runs the frontier, the MDP and the near-miss search — ~9s
  // locally, and CI is slower than the 30s default allows.
  it('forwards progress for a lab solve with a budget', async () => {
    const seen: SolveProgress[] = [];
    const { promise } = solve(
      { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 },
      (p) => seen.push(p),
    );
    await promise;
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  }, 60_000);

  it('resolves with the result the worker computed', async () => {
    const { promise } = solve({ kind: 'item', item, targets });
    const res = await promise;
    expect(res.kind).toBe('item');
  });

  it('rejects with a cancellation marker the UI can tell apart from a failure', async () => {
    const { promise, cancel } = solve({ kind: 'item', item, targets });
    cancel();
    await expect(promise).rejects.toSatisfy(isCancelled);
  });

  // Starting a solve while one runs must not leave the first one's listener able to resolve the
  // second's promise, or a stale answer would be rendered as if it were current.
  it('supersedes a running solve rather than interleaving the two', async () => {
    const first = solve({ kind: 'item', item, targets });
    const second = solve({ kind: 'item', item, targets });
    await expect(first.promise).rejects.toSatisfy(isCancelled);
    await expect(second.promise).resolves.toMatchObject({ kind: 'item' });
  });
});
