// Big crafts built up from smaller ones (markovBuildUp.ts) against the plain two-phase solve — the
// measurements the build-up was gated on. Live sheet, from white, item level 82: the first prefixes and
// suffixes of Wands, Rings, Amulets and Body Armour (str) for 4, 5 and 6 targets at their second and first
// tier, plus two streamer items (as `required-bone.mts`).
//
//   npx tsx scripts/build-up.mts [effort] [plainSeconds] [bones|nobones] [tight]
//
// "app" is `runSolve` at the given Search effort (default standard), which builds a craft of four or more
// slot groups up from smaller ones; "plain" is `markovFromItem` alone, the two-phase solve, on
// `plainSeconds` (default 120). `nobones` (the default is `bones`, the sheet as it is) excludes Desecration
// on both sides. `tight` compares at `tolerance: 1e-9` instead, which `runSolve` does not expose: "built" is
// `markovBoneFreeFirst` called directly, "plain" `markovFromItem`, both on the `plainSeconds` clock.
//
// The gate: no craft the plain solve settles is left without an exact number, and every craft both settle
// agrees to 1e-5 relative — 1e-9 with `tight`. At the default tolerance the solver stops at a thousandth of
// the cheapest action, so two ways to the same answer may part in the last digits; `tight` says whether
// they reach the same optimum.
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { markovFromItem, type MarkovOptions } from '../packages/optimizer/src/markovFromItem.ts';
import { BONE_KEYS, markovBoneFreeFirst } from '../packages/optimizer/src/markovBoneFree.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { buildItemState, toTierTargets } from '../src/lib/engineMap.ts';
import { readGear, type StreamerFile } from '../src/lib/streamerGear.ts';
import type { TargetInput } from '../src/lib/engineTypes.ts';

const effort = process.argv[2] ?? 'standard';
const plainMs = Number(process.argv[3] ?? 120) * 1000;
const bones = process.argv[4] !== 'nobones';
const tight = process.argv[5] === 'tight';
const limit = tight ? 1e-9 : 1e-5;
const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: loadPrices('data/patches/0.5.0') };

const crafts: { name: string; baseId: string; level: number; targets: TargetInput[] }[] = [];
for (const baseId of ['Wands', 'Rings', 'Amulets', 'Body_Armours_str']) {
  const b = data.bases.get(baseId)!;
  for (const tier of [2, 1]) {
    for (const n of [4, 5, 6]) {
      const ids = [...b.pools.normal.prefixes.slice(0, Math.ceil(n / 2)), ...b.pools.normal.suffixes.slice(0, Math.floor(n / 2))];
      const targets = ids.map((id) => ({ modId: id, tierDisplay: Math.min(tier, data.mods.get(id)!.tiers.length) }));
      crafts.push({ name: `${baseId} x${n} T${tier}`, baseId, level: 82, targets });
    }
  }
}
const file = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as StreamerFile;
const z = file.characters.find((c) => c.profile.startsWith('Zizaran'))!;
for (const i of [1, 9]) {
  const goal = readGear(data, z.items[i]!).goal;
  crafts.push({ name: `streamer item ${i} (${z.items[i]!.name})`, baseId: goal.baseId, level: goal.level, targets: [...goal.targets] });
}

type Answer = { feasible: boolean; bound: string; expectedCost: number; reason?: string; withoutBones?: true } | null;
const exact = (m: Answer): m is NonNullable<Answer> => !!m && m.feasible && m.bound === 'exact';
// Full precision: the gaps this measures are in the last digits.
const show = (m: Answer): string => (!m ? 'none'
  : m.feasible ? `${m.bound === 'upper' ? '≤ ' : m.bound === 'lower' ? '≥ ' : 'exact '}${m.expectedCost}${m.withoutBones ? ' (without bones)' : ''}`
  : `none (${(m.reason ?? '').slice(0, 50)})`);

const policy = bones ? {} : { policy: { excluded: new Set<string>(BONE_KEYS) } };
const base: MarkovOptions = { restartCost: 0, solver: 'policy', maxIters: 20_000_000, ...policy, ...(tight ? { tolerance: 1e-9 } : {}) };

console.log(`effort ${tight ? '(tight: called directly)' : effort}, plain clock ${plainMs / 1000} s, ${bones ? 'bones as priced' : 'bones excluded'}, tolerance ${tight ? '1e-9' : 'default'}, gate ${limit}`);
let bad = 0;
for (const c of crafts) {
  const start = buildItemState(data, { baseId: c.baseId, level: c.level, rarity: 'normal', prefixes: [], suffixes: [] });
  const targets = toTierTargets(data, c.targets);
  let t0 = Date.now();
  let app: Answer;
  if (tight) {
    app = markovBoneFreeFirst(data, eng.prices, start, targets, { ...base, maxMillis: plainMs }, { maxMillis: plainMs });
  } else {
    const r = runSolve(eng, {
      kind: 'lab', from: { baseId: c.baseId, level: c.level }, targets: c.targets, effort: limitsFor(effort),
      ...(bones ? {} : { excluded: [...BONE_KEYS] }),
    });
    app = (r.kind === 'lab' ? r.markov : null) as Answer;
  }
  const appS = (Date.now() - t0) / 1000;
  t0 = Date.now();
  const plain = markovFromItem(data, eng.prices, start, targets, { ...base, maxMillis: plainMs });
  const plainS = (Date.now() - t0) / 1000;
  const both = exact(app) && exact(plain);
  const rel = both ? Math.abs(app!.expectedCost - plain.expectedCost) / plain.expectedCost : NaN;
  const lost = exact(plain) && !exact(app);
  const verdict = lost ? 'LOST' : both ? (rel <= limit ? 'same' : `DIFF ${rel.toExponential(2)}`)
    : exact(app) ? 'new' : 'neither';
  if (lost || (both && rel > limit)) bad++;
  console.log(`${c.name.padEnd(44)} ${tight ? 'built' : 'app'} ${show(app)} in ${appS.toFixed(2)} s | plain ${show(plain)} in ${plainS.toFixed(2)} s | ${both ? `rel ${rel.toExponential(3)} | ` : ''}${verdict}`);
}
console.log(bad === 0 ? 'GATE PASSED' : `GATE FAILED on ${bad}`);
process.exit(bad === 0 ? 0 : 1);
