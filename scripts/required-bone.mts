// Crafts that NEED a bone (a desecrated target), the app's way against the old way — the measurements the
// seeded path for them (TODO 20, markovBoneFree.ts) was gated on. Live sheet, from white, item level 82.
//
//   npx tsx scripts/required-bone.mts [effort] [plainSeconds]
//
// "app" is `runSolve` at the given Search effort (default standard): the craft without its carved target
// solved first, its plan seeding the full solve. "plain" is `markovFromItem` alone, the two-phase solve,
// on `plainSeconds` (default 120). The gate: every craft both settle has the same cost, and none the plain
// solve settles is left without a number by the app.
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { markovFromItem } from '../packages/optimizer/src/markovFromItem.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { buildItemState, toTierTargets } from '../src/lib/engineMap.ts';
import { readGear, type StreamerFile } from '../src/lib/streamerGear.ts';
import type { TargetInput } from '../src/lib/engineTypes.ts';

const effort = process.argv[2] ?? 'standard';
const plainMs = Number(process.argv[3] ?? 120) * 1000;
const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: loadPrices('data/patches/0.5.0') };

const tier2 = (id: string): TargetInput => ({ modId: id, tierDisplay: Math.min(2, data.mods.get(id)!.tiers.length) });
const crafts: { name: string; baseId: string; level: number; targets: TargetInput[] }[] = [];
for (const baseId of ['Wands', 'Rings', 'Amulets', 'Body_Armours_str']) {
  const b = data.bases.get(baseId)!;
  for (const n of [2, 3, 4, 5]) {
    const ids = [...b.pools.normal.prefixes.slice(0, Math.ceil(n / 2)), ...b.pools.normal.suffixes.slice(0, Math.floor(n / 2))];
    crafts.push({ name: `${baseId} x${n} + carved`, baseId, level: 82, targets: [...ids.map(tier2), { modId: b.pools.desecrated.suffixes[0]!, tierDisplay: 1 }] });
  }
}
const file = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as StreamerFile;
const z = file.characters.find((c) => c.profile.startsWith('Zizaran'))!;
for (const i of [1, 9]) {
  const goal = readGear(data, z.items[i]!).goal;
  crafts.push({ name: `streamer item ${i} (${z.items[i]!.name})`, baseId: goal.baseId, level: goal.level, targets: [...goal.targets] });
}

type Answer = { feasible: boolean; bound: string; expectedCost: number; reason?: string; withoutBones?: true } | null;
const show = (m: Answer): string => (!m ? 'none'
  : m.feasible ? `${m.bound === 'upper' ? '≤ ' : m.bound === 'lower' ? '≥ ' : ''}${m.expectedCost.toFixed(2)}${m.withoutBones ? ' (without bones)' : ''}`
  : `none (${(m.reason ?? '').slice(0, 50)})`);

console.log(`effort ${effort}, plain clock ${plainMs / 1000} s`);
let bad = 0;
for (const c of crafts) {
  let t0 = Date.now();
  const app = runSolve(eng, { kind: 'lab', from: { baseId: c.baseId, level: c.level }, targets: c.targets, effort: limitsFor(effort) });
  const appS = (Date.now() - t0) / 1000;
  const appM = (app.kind === 'lab' ? app.markov : null) as Answer;
  t0 = Date.now();
  const start = buildItemState(data, { baseId: c.baseId, level: c.level, rarity: 'normal', prefixes: [], suffixes: [] });
  const plain = markovFromItem(data, eng.prices, start, toTierTargets(data, c.targets),
    { restartCost: 0, solver: 'policy', maxIters: 20_000_000, maxMillis: plainMs });
  const plainS = (Date.now() - t0) / 1000;
  const both = appM?.feasible && appM.bound === 'exact' && plain.feasible && plain.bound === 'exact';
  const rel = both ? Math.abs(appM.expectedCost - plain.expectedCost) / plain.expectedCost : NaN;
  const lost = plain.feasible && plain.bound === 'exact' && !(appM?.feasible && appM.bound === 'exact');
  const verdict = lost ? 'LOST' : both ? (rel < 1e-9 ? 'same' : `DIFF ${rel.toExponential(2)}`) : 'new or neither';
  if (lost || (both && rel >= 1e-9)) bad++;
  console.log(`${c.name.padEnd(42)} app ${show(appM)} in ${appS.toFixed(1)} s | plain ${show(plain)} in ${plainS.toFixed(1)} s | ${verdict}`);
}
console.log(bad === 0 ? 'GATE PASSED' : `GATE FAILED on ${bad}`);
process.exit(bad === 0 ? 0 : 1);
