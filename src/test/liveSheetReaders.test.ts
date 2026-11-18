import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { findLiveSheetReaders, liveSheetReads } from './liveSheet.ts';

/**
 * Every test that reads the LIVE price sheet, and why it may.
 *
 * The price bot runs the whole suite against each day's poe.ninja sheet and holds the update when a
 * test fails, so a test asserting a market fact there keeps stale prices on the site on a day nothing is
 * broken (the maintainer's ruling, 2026-11-18: poe.ninja is the reference; only a BROKEN sheet — a price
 * missing, zero, collapsed onto one value — may fail a test). A test that pins a number derived from
 * prices reads `loadFrozenPrices()` instead. What stays on the live sheet is one of two kinds:
 *
 * - `subject`: the sheet itself is what is tested — its keys, its contract, its provenance. Freezing
 *   these would freeze the bot's guard.
 * - `price-independent`: it needs real prices only to make a solve or a render whole, and asserts what
 *   holds at any price. `scripts/market-sweep.mts` is the proof: it runs every file below against every
 *   sheet `main` has shipped and four synthetic markets, and must end `GATE PASSED`.
 *
 * Adding a file here is a claim of one or the other; run the sweep before making it.
 */
const ALLOWED: Record<string, { kind: 'subject' | 'price-independent'; why: string }> = {
  'packages/engine/src/runes.test.ts': { kind: 'subject',
    why: 'every Aldur rune has a positive price on the shipped sheet — a missing key would price a rune free' },
  'packages/engine/src/runeConvert.test.ts': { kind: 'subject',
    why: 'the rune price key is on the shipped sheet, positive, before anything charges for it' },
  'packages/optimizer/src/alternatives.test.ts': { kind: 'price-independent',
    why: 'pins the SEARCH on real Wands data (node budget per slot, the CDF screen never changing the answer); the one in-budget threshold reads loadFrozenPrices()' },
  'packages/optimizer/src/costConsistency.test.ts': { kind: 'subject',
    why: 'the two cost models agree on every pair at the shipped prices — the sheet’s own contract' },
  'packages/optimizer/src/exclusions.test.ts': { kind: 'price-independent',
    why: 'an excluded currency appears in no plan any planner returns, whatever it costs' },
  'packages/optimizer/src/foundPrices.test.ts': { kind: 'price-independent',
    why: 'reads the trade sheet for its key names and as the control that a withheld step is reachable; asserts no number from it' },
  'packages/optimizer/src/leverDp.test.ts': { kind: 'price-independent',
    why: 'brute force and the lever DP agree on real data, on whatever sheet both are given' },
  'packages/optimizer/src/levers.test.ts': { kind: 'price-independent',
    why: 'which options leverOptions offers on a real Wand: gated by what is priced, not by how much' },
  'packages/optimizer/src/markovActionDedupe.test.ts': { kind: 'price-independent',
    why: 'the cheapest-twin fold fires on the shipped data and only on identical distributions; it compares two prices of one sheet, never a value' },
  'packages/optimizer/src/markovEssence.test.ts': { kind: 'price-independent',
    why: 'both planners buy the same essence level (the D8 check) on real data, whatever that level costs' },
  'packages/optimizer/src/markovEssenceDesecrate.test.ts': { kind: 'price-independent',
    why: 'which mods the shipped pools hold, and how the MDP counts the item held; no cost asserted' },
  'packages/optimizer/src/markovRoute.test.ts': { kind: 'price-independent',
    why: 'the live sheet prices the bones and the Echoes omen; every assertion compares two readings of one solve' },
  'packages/optimizer/src/perfectEssence.test.ts': { kind: 'price-independent',
    why: 'a real Wand craft can end in a Perfect Essence; the plan exists, its cost is not asserted' },
  'packages/optimizer/src/priceResolution.test.ts': { kind: 'subject',
    why: 'every key the planners ask for resolves on the shipped sheet, and none is zero — the sheet’s contract and the bot’s guard' },
  'src/features/engine/AlternativesView.test.tsx': { kind: 'price-independent',
    why: 'renders a real frontier: rows, marks, wording — not the figures in them' },
  'src/features/engine/GearTradeLink.test.tsx': { kind: 'price-independent',
    why: 'the trade search is built from the item and the sheet’s league; prices only make the engine whole' },
  'src/features/engine/ItemTargetTradeLink.test.tsx': { kind: 'price-independent',
    why: 'the Item tab’s trade search, built before anything is priced' },
  'src/features/engine/PolicyGraph.test.tsx': { kind: 'price-independent',
    why: 'renders a real MDP’s graph — layout and wiring; costs use a stand-in unit' },
  'src/features/engine/PriceBasisNote.test.tsx': { kind: 'subject',
    why: 'the shipped sheet states its own provenance: estimated, a caveat sentence, its patch and date' },
  'src/features/engine/TargetTradeLink.test.tsx': { kind: 'price-independent',
    why: 'the Plan tab’s trade search, built before anything is priced' },
  'src/features/tablets/TabletsTab.test.tsx': { kind: 'price-independent',
    why: 'what the Tablets tab shows and does on the shipped sheet: wording and wiring, not amounts; its trade links are checked against the sheet’s own league' },
  'src/lib/alloys.test.ts': { kind: 'subject',
    why: 'Alloys are priced individually on what ships — the test that caught a real collapse (2026-09-08)' },
  'src/lib/currencyPrefs.test.ts': { kind: 'subject',
    why: 'every exclusion key the UI emits is one the sheet or the engine knows: a typo guard' },
  'src/lib/deployConfig.test.ts': { kind: 'subject',
    why: 'the sheet records the league and leagueSince that the bot’s league hold reads' },
  'src/lib/engine.test.ts': { kind: 'subject',
    why: 'the Quick check charges the sheet’s own per-category bones, as the routes do; the rest is facade wiring, price-independent' },
  'src/lib/engineClient.test.ts': { kind: 'price-independent',
    why: 'the worker message protocol, with a real solve behind it so its progress reports are real' },
  'src/lib/runePools.test.ts': { kind: 'price-independent',
    why: 'a socketed rune’s assumed-pool caveat reaches the plan; the plan’s cost is not asserted' },
  'src/lib/searchEffort.test.ts': { kind: 'price-independent',
    why: 'each effort preset reaches the planners, compared as two solves of one sheet' },
  'src/lib/solve.test.ts': { kind: 'price-independent',
    why: 'runSolve equals the planner it routes to on the same sheet; every price-pinned number reads loadFrozenPrices()' },
  'src/lib/solveFound.test.ts': { kind: 'price-independent',
    why: 'the trade sheet is the control: a request without the found basis is the trade solve it always was' },
  'src/test/liveSheetReaders.test.ts': { kind: 'price-independent',
    why: 'this file: its fixtures spell out the reads it detects, and it reads no sheet' },
};

const ROOT = join(import.meta.dirname, '..', '..');

describe('which tests read the live price sheet', () => {
  const readers = findLiveSheetReaders(ROOT);

  it('is every one of them allowlisted, with a reason', () => {
    const unlisted = [...readers].filter(([file]) => !(file in ALLOWED));
    const message = unlisted.map(([file, how]) => `${file} reads the live price sheet (${how.join('; ')}).`).join('\n')
      + '\nA test that pins a number derived from prices must read loadFrozenPrices() '
      + '(packages/optimizer/src/frozenPrices.ts): the daily price bot runs the whole suite, and a market '
      + 'move must never fail it. If the sheet itself is the subject, or the test holds at any price, add '
      + 'the file to ALLOWED in src/test/liveSheetReaders.test.ts with its reason — after '
      + '`npx tsx scripts/market-sweep.mts` ends GATE PASSED with it in.';
    expect(unlisted.length, message).toBe(0);
  });

  it('lists nothing that no longer reads it', () => {
    const stale = Object.keys(ALLOWED).filter((file) => !readers.has(file));
    expect(stale, 'these no longer read the live sheet — take them off ALLOWED').toEqual([]);
  });

  it('gives every entry a reason', () => {
    for (const [file, { why }] of Object.entries(ALLOWED)) expect(why.length, file).toBeGreaterThan(20);
  });
});

describe('the detector', () => {
  // The fixtures spell the reads out as source text for the detector to scan — which is why this file
  // is on ALLOWED itself.
  const SHEET = ['data/patches/0.5.0', 'prices.json'].join('/');

  it.each([
    ['a literal patch dir', "const p = loadPrices('data/patches/0.5.0');"],
    ['a PATCH constant', "const PATCH = 'data/patches/0.5.0';\nconst p = loadPrices(PATCH);"],
    ['a path it cannot resolve', "const p = loadPrices(join(ROOT, 'data', 'patches', '0.5.0'));"],
    ['an import alias', "import { loadPrices as lp } from './loadPrices.ts';\nconst p = lp('data/patches/0.5.0');"],
    ['a lazy import of the loader', "const { loadPrices } = await import('./loadPrices.ts');\nconst p = loadPrices('data/patches/0.5.0');"],
    ['the file read by hand', `const s = JSON.parse(readFileSync('${SHEET}', 'utf8'));`],
    ['a dynamic JSON import', `const s = (await import('../../${SHEET}')).default;`],
    ['a static JSON import', `import sheet from '../../${SHEET}';`],
    ['a template path', 'const s = readFileSync(`${dir}/prices.json`);'],
  ])('flags %s', (_name, src) => {
    expect(liveSheetReads(src)).not.toEqual([]);
  });

  it.each([
    ['the frozen sheet', 'const p = loadFrozenPrices();'],
    ['the frozen dir', 'const p = loadPrices(FROZEN_PATCH_DIR);'],
    ['the Java-era anchor', "const p = loadPrices('data/patches/0.5');"],
    ['the found sheet', `const s = readFileSync('data/found/prices.json');`],
    ['a ?url import, which only the browser fetches', `import u from '../../${SHEET}?url';`],
    ['a line comment', "// const p = loadPrices('data/patches/0.5.0');"],
    ['a block comment', `/* readFileSync('${SHEET}') */`],
    ['a test title that names it', "describe('prices.json loads', () => {});\nit('loadPrices(\\'data/patches/0.5.0\\') once', () => {});"],
    ['the loader declared', 'export function loadPrices(patchDir: string) {}'],
  ])('ignores %s', (_name, src) => {
    expect(liveSheetReads(src)).toEqual([]);
  });

  // A fake repo: one test reading the sheet through a helper module, one reading the frozen sheet, and
  // a reader in each directory the scan must skip.
  const repo = mkdtempSync(join(tmpdir(), 'live-sheet-'));
  afterAll(() => rmSync(repo, { recursive: true, force: true }));
  const put = (rel: string, text: string): void => {
    mkdirSync(dirname(join(repo, rel)), { recursive: true });
    writeFileSync(join(repo, rel), text);
  };
  put('src/lib/engineFixture.ts', "export const eng = { prices: loadPrices('data/patches/0.5.0') };");
  put('src/lib/viaHelper.test.ts', "import { eng } from './engineFixture.ts';\nit('x', () => eng);");
  put('src/lib/viaAlias.test.tsx', "import { eng } from '@/lib/engineFixture';\nit('x', () => eng);");
  put('src/lib/frozen.test.ts', "const p = loadFrozenPrices();\nimport { x } from './plain.ts';");
  put('src/lib/plain.ts', 'export const x = 1;');
  put('e2e/smoke.test.ts', "const p = loadPrices('data/patches/0.5.0');");
  put('node_modules/pkg/a.test.ts', "const p = loadPrices('data/patches/0.5.0');");

  it('follows a test into the helper that reads it, and skips e2e/ and node_modules/', () => {
    const found = findLiveSheetReaders(repo);
    expect([...found.keys()]).toEqual(['src/lib/viaAlias.test.tsx', 'src/lib/viaHelper.test.ts']);
    expect(found.get('src/lib/viaHelper.test.ts')![0]).toMatch(/^via src\/lib\/engineFixture\.ts: loadPrices/);
  });
});
