import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPatch } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
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
