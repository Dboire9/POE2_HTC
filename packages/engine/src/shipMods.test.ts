// What the browser downloads must be the same DATA as what the repo records — smaller, not different.
//
// The projection is already half-proved by the compiler: `shipModsFile` returns `ModsFile`, and the
// `: Mod` / `: Tier` annotations inside it make excess-property checking fire, so a field the engine
// reads cannot be dropped and a field it does not read cannot be added (both mutation-verified
// 2026-09-02). What the compiler cannot say is whether the fields it DOES copy come through
// unchanged — `tiers: m.tiers.map(...)` type-checks perfectly while reversing the array. That is
// what these tests are for, and they run against the real shipped snapshot rather than a fixture.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ModsFile } from './indexPatch.ts';
import { shipModsFile, shipModsJson } from './shipMods.ts';

const RAW_PATH = 'data/patches/0.5.0/mods.json';
const raw = JSON.parse(readFileSync(RAW_PATH, 'utf8')) as ModsFile;

/**
 * The fields on disk that no code in the APP reads. Named here so the test says what it expects to lose.
 *
 * "Dead" means dead to the browser, not useless: `group`/`field` are the RePoE provenance
 * `dataIntegrity.test.ts` checks the import against, `stats` is what `statLookup.ts` resolves a pasted
 * or fetched item from, and `codes` is what `profileItems.ts` resolves a CRAFTED line from. All four
 * belong to jobs that run in Node against the full file, and none of them belongs in a download.
 */
const DEAD_MOD_FIELDS = ['group', 'field', 'categories'] as const;
const DEAD_TIER_FIELDS = ['stats', 'codes'] as const;

/**
 * The same projection written the OTHER way round — by deleting, where `shipModsFile` builds up.
 *
 * Two implementations that agree is the whole point: a constructive projection is exactly the shape
 * that can silently lose a field (write `tiers: []` and it still compiles), and a subtractive one
 * cannot, because it starts from everything. Comparing them turns "I listed all the fields" into an
 * assertion rather than a claim.
 */
function byDeletion(file: ModsFile): unknown {
  const clone = JSON.parse(JSON.stringify(file)) as { mods: Record<string, unknown>[] };
  for (const m of clone.mods) {
    // A computed `delete` is the whole method here: naming the keys in a list is what makes this
    // implementation independent of the constructive one, and spelling them out statically would
    // just be the same list twice. Scoped to a deep clone of parsed JSON, so nothing shared is hit.
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    for (const k of DEAD_MOD_FIELDS) delete m[k];
    for (const t of m['tiers'] as Record<string, unknown>[]) for (const k of DEAD_TIER_FIELDS) delete t[k];
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
  }
  return { patch: file.patch, mods: clone.mods };
}

describe('shipMods — the browser asset is the record minus what nothing reads', () => {
  it('differs from the file on disk in exactly the fields nothing in the app reads', () => {
    // Mutation-check: drop `ranges` (or reorder `tiers`) inside shipModsFile and this goes red.
    expect(JSON.parse(shipModsJson(raw))).toEqual(byDeletion(raw));
  });

  it('the dead fields are really on disk, so the test above is not vacuous', () => {
    // If a future refresh stopped emitting them, the comparison would pass while proving nothing —
    // and `dataIntegrity.test.ts` would be the thing that noticed, for group/field at least.
    const first = raw.mods[0] as unknown as Record<string, unknown>;
    for (const k of DEAD_MOD_FIELDS) expect(first, k).toHaveProperty(k);
    // Counted across the whole file rather than read off the first mod, because the two tier fields
    // are not on the same tiers: `stats` sits on every normal one and `codes` only on the CRAFTED ones
    // (`apply_codes.mjs`), so asking `mods[0]` for `codes` would fail on a field present in its
    // thousands. A count also says more than `toHaveProperty` — it goes red if a refresh emits one.
    const tiers = raw.mods.flatMap((m) => m.tiers as unknown as Record<string, unknown>[]);
    for (const k of DEAD_TIER_FIELDS) {
      expect(tiers.filter((t) => t[k] !== undefined).length, k).toBeGreaterThan(0);
    }
  });

  it('is idempotent — projecting an already-projected file changes nothing', () => {
    // The build applies it once, but a shipped asset re-fed to the pipeline must not degrade.
    const once = shipModsFile(raw);
    expect(shipModsFile(once)).toEqual(once);
  });

  it('keeps a multi-family mod’s families array (the one optional field)', () => {
    // `...(m.families ? {} : {})` is the only conditional in the projection, so it is the only place
    // a field can vanish for SOME mods and not others — which no whole-file comparison would localise.
    const multi = raw.mods.filter((m) => m.families !== undefined);
    expect(multi.length).toBeGreaterThan(0);
    const out = new Map(shipModsFile(raw).mods.map((m) => [m.id, m]));
    for (const m of multi) expect(out.get(m.id)?.families, m.id).toEqual(m.families);
  });

  it('serializes minified, and materially smaller than the record', () => {
    const json = shipModsJson(raw);
    expect(json).not.toContain('\n');
    // The record is pretty-printed; the win over the wire is measured in docs/validation.md. This
    // only pins that the two are not accidentally the same file.
    expect(json.length).toBeLessThan(readFileSync(RAW_PATH, 'utf8').length / 2);
  });
});
