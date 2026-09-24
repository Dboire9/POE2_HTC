// TODO 23, measured: how far the solver's cost sits from the same plan played on real items.
//
// The lattice counts junk, never WHICH junk, so it cannot take a junk mod's family out of the next roll's
// pool the way the game does, and every roll with junk on the item is priced a little worse than it is.
// The replay (markovReplay.ts) plays the solved plan on concrete items, where the family IS taken out —
// so its mean is the yardstick. Frozen sheet, no clock on the solve, a long replay; gap = replay − V.
//
//   npx tsx scripts/junk-bias.mts [--runs 20000] [--junk-families] [--only <part of a craft's name>]
//
// `--junk-families` turns on the mean-field correction (`MarkovOptions.junkFamilies`) to compare.
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../packages/optimizer/src/frozenPrices.ts';
import { optimizeItemMarkov } from '../src/lib/engine.ts';
import type { MarkovOptions } from '../packages/optimizer/src/markovFromItem.ts';

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
};
const RUNS = Number(arg('runs', '20000'));
const FIX = process.argv.includes('--junk-families');
const ONLY = arg('only', '');
const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: loadFrozenPrices() };

const top = (id: string, fromTop: number) => ({ modId: id, tierDisplay: Math.min(fromTop, data.mods.get(id)!.tiers.length) });
const firstMods = (base: string, p: number, s: number, tier: number) => {
  const b = data.bases.get(base)!;
  return [...b.pools.normal.prefixes.slice(0, p), ...b.pools.normal.suffixes.slice(0, s)].map((id) => top(id, tier));
};

interface Craft { name: string; baseId: string; level: number; targets: { modId: string; tierDisplay: number }[]; opts: MarkovOptions }
const gear = (name: string, baseId: string, p: number, s: number, tier: number, baseCost: number): Craft =>
  ({ name, baseId, level: 82, targets: firstMods(baseId, p, s, tier), opts: { restartCost: baseCost } });
// As the Tablets tab asks (TabletsTab.tsx): a plain tablet's price, free positions, filled at the end, no
// Annulment, the exact small-lattice solve.
const tablet = (name: string, baseId: string, p: number, s: number): Craft => ({
  name, baseId, level: 100, targets: firstMods(baseId, p, s, 1),
  opts: {
    restartCost: 100, spare: { prefixes: 2 - p, suffixes: 2 - s }, fillOnFinish: true,
    heuristicSeed: true, exactEvaluation: true, policy: { excluded: new Set(['annul']) },
  },
});

const crafts: Craft[] = [
  gear('Wand 2 (T1), base 30', 'Wands', 1, 1, 1, 30),
  gear('Wand 2 (T2), base 30', 'Wands', 1, 1, 2, 30),
  gear('Wand 3 (T2), base 30', 'Wands', 2, 1, 2, 30),
  gear('Wand 3 (T2), base 0', 'Wands', 2, 1, 2, 0),
  gear('Ring 3 (T2), base 30', 'Rings', 2, 1, 2, 30),
  gear('Ring 2 (T1), base 30', 'Rings', 1, 1, 1, 30),
  gear('Amulet 3 (T2), base 30', 'Amulets', 2, 1, 2, 30),
  gear('Body Armour 3 (T2), base 30', 'Body_Armours_str', 2, 1, 2, 30),
  gear('Body Armour 2 (T1), base 30', 'Body_Armours_str', 1, 1, 1, 30),
  gear('Staff 3 (T2), base 30', 'Staves', 2, 1, 2, 30),
  gear('Staff 2 (T1), base 0', 'Staves', 1, 1, 1, 0),
  gear('Amulet 2 (T1), base 10', 'Amulets', 1, 1, 1, 10),
  tablet('Ritual 1 prefix', 'Tablets_ritual', 1, 0),
  tablet('Ritual 1+1', 'Tablets_ritual', 1, 1),
  tablet('Ritual 2 prefixes', 'Tablets_ritual', 2, 0),
  tablet('Overseer 1+1', 'Tablets_overseer', 1, 1),
  tablet('Temple 1+1', 'Tablets_temple', 1, 1),
  tablet('Temple 2+1', 'Tablets_temple', 2, 1),
];

console.log(`frozen sheet, ${RUNS.toLocaleString('en')} crafts played each${FIX ? ', junk families corrected' : ''}`);
console.log('| craft | solver V | replay ± SE | gap | z |');
console.log('|---|---|---|---|---|');
for (const c of crafts.filter((x) => x.name.includes(ONLY))) {
  const white = { baseId: c.baseId, level: c.level, rarity: 'normal' as const, prefixes: [], suffixes: [] };
  const m = optimizeItemMarkov(eng, white, c.targets, {
    ...c.opts, solver: 'policy', maxIters: 20_000_000, ...(FIX ? { junkFamilies: true } : {}),
    replay: { runs: RUNS, seed: 1, watch: [], maxMillis: 120_000 },
  });
  const r = m.replay;
  if (!m.feasible || m.bound !== 'exact' || !r) {
    console.log(`| ${c.name} | ${m.feasible ? m.bound : 'none'} | ${m.replayReason ?? 'not played'} | | |`);
    continue;
  }
  const gap = (r.meanCost - m.expectedCost) / m.expectedCost;
  const z = (r.meanCost - m.expectedCost) / r.stdErr;
  console.log(`| ${c.name} | ${m.expectedCost.toFixed(1)} | ${r.meanCost.toFixed(1)} ± ${r.stdErr.toFixed(1)} (${r.runs.toLocaleString('en')}) | ${(gap * 100).toFixed(1)}% | ${z.toFixed(1)} |`);
}
