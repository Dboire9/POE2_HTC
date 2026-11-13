// What a rolled target's Essence (essenceTwins.ts) changes: every craft solved through the app's own path
// (`runSolve`, the Lab, from white, item level 82, the live sheet) as asked and with its essence twins.
// "As asked" excludes every essence level — for these crafts, which name no essence, that is exactly the
// solve before twins existed: no other Essence step was ever offered.
//
//   npx tsx scripts/essence-twins.mts [effort] [bones|nobones]
//
// Crafts: the four "Or try one" examples, then the first prefixes and suffixes of Wands, Rings, Amulets
// and Body Armour (str) for 4, 5 and 6 targets at T1, T2 and T3. Per craft: both costs and times, the
// saving, and which essences the plan plays.
//
// The gate: no craft that answers as asked is left without an exact number, and no cost goes UP — an
// extra alternative can only help, so a rise is a bug (or TODO 29, which value iteration referees).
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { BONE_KEYS } from '../packages/optimizer/src/markovBoneFree.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { EXAMPLE_CRAFTS } from '../src/lib/exampleCrafts.ts';
import type { TargetInput } from '../src/lib/engineTypes.ts';

const effort = process.argv[2] ?? 'standard';
const bones = process.argv[3] !== 'nobones';
const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: loadPrices('data/patches/0.5.0') };
const NO_ESSENCES = ['essence_lesser', 'essence', 'essence_greater'];

const crafts: { name: string; baseId: string; targets: TargetInput[] }[] = EXAMPLE_CRAFTS.map((e) => ({
  name: e.name, baseId: e.goal.baseId, targets: [...e.goal.targets],
}));
for (const baseId of ['Wands', 'Rings', 'Amulets', 'Body_Armours_str']) {
  const b = data.bases.get(baseId)!;
  for (const tier of [3, 2, 1]) {
    for (const n of [4, 5, 6]) {
      const ids = [...b.pools.normal.prefixes.slice(0, Math.ceil(n / 2)), ...b.pools.normal.suffixes.slice(0, Math.floor(n / 2))];
      crafts.push({
        name: `${baseId} x${n} T${tier}`, baseId,
        targets: ids.map((id) => ({ modId: id, tierDisplay: Math.min(tier, data.mods.get(id)!.tiers.length) })),
      });
    }
  }
}

type Answer = { feasible: boolean; bound?: string; expectedCost: number; reason?: string; policy?: unknown } | null;
const exact = (m: Answer): m is NonNullable<Answer> => !!m && m.feasible && m.bound === 'exact';
const show = (m: Answer): string => (!m ? 'none'
  : m.feasible ? `${m.bound === 'exact' ? '' : m.bound === 'upper' ? '≤ ' : '≥ '}${Math.round(m.expectedCost).toLocaleString('en-US')}`
  : `none (${(m.reason ?? '').slice(0, 40)})`);

console.log(`effort ${effort}, ${bones ? 'bones as priced' : 'bones excluded'}, live sheet`);
let bad = 0;
for (const c of crafts) {
  const solve = (excluded: readonly string[]) => {
    const t0 = Date.now();
    const r = runSolve(eng, {
      kind: 'lab', from: { baseId: c.baseId, level: 82 }, targets: c.targets, effort: limitsFor(effort),
      excluded: [...excluded, ...(bones ? [] : BONE_KEYS)],
    });
    return { m: (r.kind === 'lab' ? r.markov : null) as Answer, s: (Date.now() - t0) / 1000 };
  };
  const asked = solve(NO_ESSENCES);
  const twins = solve([]);
  const lost = exact(asked.m) && !exact(twins.m);
  const rise = exact(asked.m) && exact(twins.m) && twins.m.expectedCost > asked.m.expectedCost * (1 + 1e-6);
  if (lost || rise) bad++;
  const saving = exact(asked.m) && exact(twins.m) ? `${(100 * (1 - twins.m.expectedCost / asked.m.expectedCost)).toFixed(1)}%` : '-';
  // What the plan plays: the Essence moves in the route the result shows.
  const nodes = (twins.m as { nodes?: { action?: string }[] } | null)?.nodes ?? [];
  const essences = [...new Set(nodes.map((n) => n.action ?? '').filter((a) => a.includes('Essence of')))];
  console.log(`${c.name.padEnd(30)} as asked ${show(asked.m).padStart(12)} in ${asked.s.toFixed(1).padStart(5)} s | `
    + `with twins ${show(twins.m).padStart(12)} in ${twins.s.toFixed(1).padStart(5)} s | ${saving.padStart(6)} | `
    + `${lost ? 'LOST' : rise ? 'ROSE' : (essences.join(', ') || '-')}`);
}
console.log(bad === 0 ? 'GATE PASSED' : `GATE FAILED on ${bad}`);
process.exit(bad === 0 ? 0 : 1);
