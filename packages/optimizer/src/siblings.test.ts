import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import type { Prices } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import type { MarkovResult, ReplayResult } from './markovFromItem.ts';
import { markovFromItem } from './markovFromItem.ts';
import { resolveSiblings } from './markovSiblings.ts';
import { decodeState, isAccepting } from './markovState.ts';
import { markovFingerprint, markovIdentityCrafts } from './__fixtures__/siblingCrafts.ts';

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();

describe('family siblings — crafts that have none are untouched', () => {
  // Recorded at 2a4b384, before the solver knew a DIFFERENT mod of a target's family blocks it (the
  // crafts and the fingerprint live in `__fixtures__/siblingCrafts.ts`, so the recording and this
  // check cannot disagree about what was run). Every target here is LONELY — nothing else the base can
  // roll shares its family — so the fix has nothing to act on, and anything it moved would be a leak.
  const recorded = JSON.parse(readFileSync(
    join(import.meta.dirname, '__fixtures__', 'pre-sibling-markov.json'), 'utf8')) as Record<string, unknown>;

  for (const craft of markovIdentityCrafts(data, prices)) {
    it(`${craft.name}: byte-identical to the recording`, () => {
      expect(markovFingerprint(craft.run())).toEqual(recorded[craft.name]);
    });
  }

  it('the recording covers every identity craft, and nothing else', () => {
    expect(Object.keys(recorded).sort()).toEqual(markovIdentityCrafts(data, prices).map((c) => c.name).sort());
  });
});

// ── The fix itself, on crafts small enough to reason about ─────────────────────────────────────────
//
// Every pool here holds only targets and their siblings — nothing that could be junk — so the lattice
// loses nothing to the one approximation it still makes (a junk mod's family staying in the next roll's
// pool). The solver's number and the replay's (real dice, real exclusion) must then agree to within
// sampling error, and before the fix they could not: the sibling was counted as harmless junk.

const fam = (id: string, type: 'prefix' | 'suffix', families: string[], weight: number): Mod => ({
  id, source: 'normal', type, family: families[0]!, ...(families.length > 1 ? { families } : {}),
  tags: [], text: id, tiers: [{ name: `${id}1`, ilvl: 1, weight, ranges: [] }],
});
const synthetic = (prefixes: Mod[], suffixes: Mod[]): { data: PatchData; base: ItemBase } => {
  const base: ItemBase = {
    id: 'B', name: 'B', category: 'C',
    pools: {
      normal: { prefixes: prefixes.map((m) => m.id), suffixes: suffixes.map((m) => m.id) },
      desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
    },
  };
  return { base, data: { patch: 't', mods: new Map([...prefixes, ...suffixes].map((m) => [m.id, m])), bases: new Map([['B', base]]) } };
};
const orbs: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
function replayed(r: MarkovResult): ReplayResult {
  if (!r.replay?.ok) throw new Error(`no replay: ${r.replay && !r.replay.ok ? r.replay.reason : 'absent'}`);
  return r.replay;
}

describe('family siblings — a different mod of the target’s family blocks it', () => {
  it('same side: it lands the target as BLOCKED, and the solver agrees with real dice', () => {
    // T and S are one family on the prefix side; the craft wants T and B.
    const { data, base } = synthetic([fam('T', 'prefix', ['F'], 1), fam('S', 'prefix', ['F'], 2)], [fam('B', 'suffix', ['G'], 1)]);
    const r = markovFromItem(data, orbs, whiteItem(base, 100), [{ modId: 'T' }, { modId: 'B' }], {
      restartCost: 0.5, tolerance: 1e-12, replay: { runs: 20_000, seed: 3 },
    });
    expect(r.nodes.some((n) => n.blocked.some((ids) => ids.includes('T')))).toBe(true);
    const rp = replayed(r);
    expect(Math.abs(rp.meanCost - r.expectedCost)).toBeLessThan(3 * rp.stdErr);
  });

  it('other side: it becomes an OBSTACLE — tracked, never wanted, and the solver agrees with real dice', () => {
    // T (prefix) and U (suffix) share family F: an item holding U can never roll T.
    const { data, base } = synthetic([fam('T', 'prefix', ['F'], 1)], [fam('U', 'suffix', ['F'], 1), fam('B', 'suffix', ['G'], 1)]);
    const r = markovFromItem(data, orbs, whiteItem(base, 100), [{ modId: 'T' }, { modId: 'B' }], {
      restartCost: 0.5, tolerance: 1e-12, replay: { runs: 20_000, seed: 4 },
    });
    const withU = r.nodes.filter((n) => n.obstacles?.some((ids) => ids.includes('U')));
    expect(withU.length).toBeGreaterThan(0);
    for (const n of withU) expect(n.present.flat()).not.toContain('U'); // an obstacle is not a target
    expect(r.nodes.filter((n) => n.isGoal).every((n) => n.obstacles === undefined)).toBe(true);
    // Nobody buys an item for its obstacle: no starting-item row may hold one (U is position 2).
    expect(r.holdings?.length).toBeGreaterThan(0);
    for (const h of r.holdings ?? []) {
      expect(decodeState(h.key).present & 0b100).toBe(0);
      expect(h.present.every((ids) => ids.length > 0 && !ids.includes('U'))).toBe(true);
    }
    const rp = replayed(r);
    expect(Math.abs(rp.meanCost - r.expectedCost)).toBeLessThan(3 * rp.stdErr);
  });

  it('an item already holding a sibling starts with the target BLOCKED, not with junk', () => {
    const { data, base } = synthetic([fam('T', 'prefix', ['F'], 1), fam('S', 'prefix', ['F'], 2)], [fam('B', 'suffix', ['G'], 1)]);
    const held: ItemState = { base, level: 100, rarity: 'rare', prefixes: [{ modId: 'S', tierName: 'S1' }], suffixes: [] };
    const r = markovFromItem(data, orbs, held, [{ modId: 'T' }, { modId: 'B' }], { tolerance: 1e-12 });
    const start = r.nodes.find((n) => n.isStart)!;
    expect(start.blocked).toEqual([['T']]);
    expect(start.junkPrefixes).toBe(0);
  });

  it('a hybrid blocking two targets is an obstacle; one blocking a single target is just blocked', () => {
    // H is one prefix in BOTH target families, so it blocks T and P together — no single `blocked` bit
    // says that. K spans T's family and one no target is in, so it blocks T alone: that other family is
    // untracked exactly as a junk mod's is.
    const { data, base } = synthetic([
      fam('T', 'prefix', ['F'], 1), fam('P', 'prefix', ['G'], 1),
      fam('H', 'prefix', ['F', 'G'], 1), fam('K', 'prefix', ['F', 'X'], 1),
    ], []);
    const list = [{ mod: data.mods.get('T')!, minIndex: 0 }, { mod: data.mods.get('P')!, minIndex: 0 }]
      .map((c) => ({ mods: [c], type: 'prefix' as const, fractured: false }));
    const sib = resolveSiblings(data, base.pools, list, false);
    expect(sib.list.map((t) => t.mods.map((m) => m.mod.id))).toEqual([['T'], ['P'], ['H']]);
    expect(sib.obstacles).toEqual({ prefix: 0b100, suffix: 0 });
    expect([...sib.blocks]).toEqual([['K', 0]]);
  });

  it('with no Desecration in play, a carved sibling is not looked at — nothing could place it', () => {
    const t = fam('T', 'prefix', ['F'], 1);
    const carved: Mod = { ...fam('C', 'suffix', ['F'], 1), source: 'desecrated' };
    const base: ItemBase = {
      id: 'B', name: 'B', category: 'C',
      pools: { normal: { prefixes: ['T'], suffixes: [] }, desecrated: { prefixes: [], suffixes: ['C'] }, essence: { prefixes: [], suffixes: [] } },
    };
    const data: PatchData = { patch: 't', mods: new Map([['T', t], ['C', carved]]), bases: new Map([['B', base]]) };
    const list = [{ mods: [{ mod: t, minIndex: 0 }], type: 'prefix' as const, fractured: false }];
    expect(resolveSiblings(data, base.pools, list, false).list).toHaveLength(1);
    expect(resolveSiblings(data, base.pools, list, true).list).toHaveLength(2);
  });

  it('an obstacle on the finished item counts against the free slots, like any other unwanted mod', () => {
    const obstacles = { prefix: 0, suffix: 0b10 };
    const state = { present: 0b11, blocked: 0, jp: 0, js: 0, flagged: 0, rarity: 'rare' as const };
    expect(isAccepting(state, [0b01], { prefixes: 0, suffixes: 0 }, obstacles)).toBe(false);
    expect(isAccepting(state, [0b01], { prefixes: 0, suffixes: 1 }, obstacles)).toBe(true);
  });
});
