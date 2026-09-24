// What "Play it out" adds to a gear solve, and whether the replay can play the plan at all — a
// Desecration's offer, an Essence, a Perfect Essence and an Omen of Light included. Live sheet (bones
// priced), Standard effort, from white; each craft solved plain and then played out, one after the other.
//
//   npx tsx scripts/replay-coverage.mts
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';

const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const tierOf = (id: string, fromTop: number) => ({ modId: id, tierDisplay: Math.min(fromTop, eng.data.mods.get(id)!.tiers.length) });
const pick = (base: string, n: number) => {
  const b = eng.data.bases.get(base)!;
  const ids = [...b.pools.normal.prefixes.slice(0, Math.ceil(n / 2)), ...b.pools.normal.suffixes.slice(0, Math.floor(n / 2))];
  return ids.map((id) => tierOf(id, 2));
};
for (const [base, n] of [['Wands', 2], ['Wands', 3], ['Wands', 4], ['Body_Armours_str', 3], ['Body_Armours_str', 4], ['Amulets', 3], ['Rings', 3], ['Staves', 3]] as const) {
  const targets = pick(base, n);
  const timed = (playOut: boolean) => {
    const t0 = Date.now();
    const r = runSolve(eng, { kind: 'lab', from: { baseId: base, level: 82 }, targets, effort: limitsFor('standard'), playOut });
    return { ms: Date.now() - t0, m: r.markov };
  };
  const plain = timed(false);
  const out = timed(true);
  const r = out.m.replay;
  const gap = r ? (r.meanCost - out.m.expectedCost) / out.m.expectedCost : NaN;
  console.log(`${base} x${n}  solve ${String(plain.ms).padStart(6)} ms  played ${String(out.ms).padStart(6)} ms  bound=${out.m.bound}  ` +
    (r
      ? `runs=${r.runs}  replay ${r.meanCost.toFixed(1)} ± ${r.stdErr.toFixed(1)} vs solver ${out.m.expectedCost.toFixed(1)} (${(gap * 100).toFixed(1)}%)  ` +
        `moves=${r.spendByMove.map((l) => l.label).join(' | ')}`
      : `NOT PLAYED: ${out.m.replayReason ?? '(a bound is never played out)'}`));
}
