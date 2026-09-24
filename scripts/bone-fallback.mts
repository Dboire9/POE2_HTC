// Big crafts with bones priced: how long the solve takes with Desecration and without it, and what each
// answers — the numbers the bone-free ceiling (TODO 20, markovBoneFree.ts) was designed on, and what it
// answers now. Live sheet, from white, the first prefixes and suffixes of each base at their second tier
// (as `replay-coverage.mts`), one craft at a time. "bones" is the app's answer, the fallback included.
//
//   npx tsx scripts/bone-fallback.mts [effort]        effort: quick | standard (default) | exhaustive
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';

const effort = process.argv[2] ?? 'standard';
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const tierOf = (id: string, fromTop: number) => ({ modId: id, tierDisplay: Math.min(fromTop, eng.data.mods.get(id)!.tiers.length) });
const pick = (base: string, n: number) => {
  const b = eng.data.bases.get(base)!;
  const ids = [...b.pools.normal.prefixes.slice(0, Math.ceil(n / 2)), ...b.pools.normal.suffixes.slice(0, Math.floor(n / 2))];
  return ids.map((id) => tierOf(id, 2));
};
const crafts = [
  ['Wands', 3], ['Wands', 4], ['Wands', 5], ['Body_Armours_str', 3], ['Body_Armours_str', 4], ['Body_Armours_str', 5],
  ['Amulets', 3], ['Amulets', 4], ['Amulets', 5], ['Staves', 3], ['Rings', 4], ['Rings', 5],
] as const;
const show = (m: { feasible: boolean; bound: string; expectedCost: number; reason?: string; withoutBones?: true }): string =>
  (m.feasible
    ? `${m.bound === 'upper' ? '≤ ' : m.bound === 'lower' ? '≥ ' : ''}${Math.round(m.expectedCost).toLocaleString('en')} ex${m.withoutBones ? ' (without bones)' : ''}`
    : `none (${m.reason?.slice(0, 40)}…)`);
console.log(`effort ${effort}`);
for (const [base, n] of crafts) {
  const targets = pick(base, n);
  const timed = (excluded: string[]) => {
    const t0 = Date.now();
    const r = runSolve(eng, { kind: 'lab', from: { baseId: base, level: 82 }, targets, effort: limitsFor(effort), ...(excluded.length ? { excluded } : {}) });
    return { ms: Date.now() - t0, m: r.markov };
  };
  const bones = timed([]);
  const free = timed(['desecrate', 'desecrate_ancient']);
  console.log(`${base} x${n}  bones ${show(bones.m)} in ${(bones.ms / 1000).toFixed(1)} s  |  no bones ${show(free.m)} in ${(free.ms / 1000).toFixed(1)} s`);
}
