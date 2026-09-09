/**
 * Does the solver's expected cost match what its own policy actually spends?
 *
 * `markovFromItem` returns V — the value function it computed — and a policy graph. This walks that
 * graph, sampling its transition edges, and averages the real spend. mean → V by the law of large
 * numbers, so a persistent gap is a defect in value iteration, self-loop handling, or policy
 * extraction, and NOT something the unit suite would catch: those pin the transition-building on
 * hand-computed pools, this checks the whole solve at the scale of a real craft.
 *
 * Run:  npx tsx scripts/policy-vs-mc.mts [runs] [seeds]
 * e.g.  npx tsx scripts/policy-vs-mc.mts 4000 8
 *
 * WHY MULTIPLE SEEDS, AND WHY THE z FROM ONE SEED IS NOT ENOUGH. The cost of a run is heavy-tailed —
 * a geometric-ish number of cheap restarts with a long tail — and for heavy tails the SAMPLE variance
 * understates the true variance, so the standard error comes out too small and |z| is inflated. A
 * single seed at |z| > 2 is therefore not the 1-in-20 event it looks like. Independent seeds separate
 * the two possibilities cleanly: a real bias keeps its SIGN and size across seeds, sampling noise
 * does not. Read the sign count, not the z.
 *
 * Measured 2026-09-09 at 50,000 runs, one seed, over fubgun's gear: five of seven items inside 2 SE,
 * with Dire Spire at z = +2.27 and Pain Collar at z = -3.37. Unresolved — see docs/validation.md.
 *
 * Two of the nine items are skipped: their odds are long enough that a run walks millions of restarts
 * before it succeeds, so sampling them is intractable rather than informative. That is a limit of
 * this check, not a result about those items.
 */
import { readFileSync } from 'node:fs';
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { markovFromItem, actionCostOf } from '../packages/optimizer/src/markovFromItem.ts';
import { mulberry32 } from '../packages/optimizer/src/simulate.ts';
import type { ItemState, PatchData } from '../packages/engine/src/types.ts';

const RUNS = Number(process.argv[2] ?? 4000);
const SEEDS = Number(process.argv[3] ?? 8);
const PATCH = 'data/patches/0.5.0';

const data = loadPatch(PATCH);
const prices = loadPrices(PATCH);
const gear = JSON.parse(readFileSync(`data/streamers/${data.patch}.json`, 'utf8')) as {
  characters: { character: string; items: {
    slot: string; name: string; baseId: string; level: number;
    mods: { modId: string; tierDisplay: number }[];
  }[] }[];
};

/** The same two rules an item obeys, applied in the gear file's own order. */
function targetsOf(it: (typeof gear.characters)[number]['items'][number], d: PatchData): string[] {
  const seen = new Set<string>();
  const pre: string[] = []; const suf: string[] = [];
  for (const m of it.mods) {
    const mod = d.mods.get(m.modId);
    if (!mod) continue;
    const fams = mod.families ?? [mod.family];
    if (fams.some((f) => seen.has(f))) continue;
    const side = mod.type === 'prefix' ? pre : suf;
    if (side.length >= 3) continue;
    for (const f of fams) seen.add(f);
    side.push(m.modId);
  }
  return [...pre, ...suf];
}

function walk(r: ReturnType<typeof markovFromItem>, runs: number, seed: number) {
  const nodeByKey = new Map(r.nodes.map((nd) => [nd.key, nd]));
  const outByKey = new Map<string, { to: string; prob: number }[]>();
  for (const e of r.edges) {
    const l = outByKey.get(e.from) ?? [];
    l.push({ to: e.to, prob: e.prob });
    outByKey.set(e.from, l);
  }
  const start = r.nodes.find((nd) => nd.isStart)!;
  const rng = mulberry32(seed);
  let sum = 0; let sumSq = 0; let max = 0;
  for (let run = 0; run < runs; run++) {
    let cur = start.key; let spent = 0;
    // A guard, not a budget: a run that needs more steps than this is one this check cannot sample.
    for (let g = 0; g < 5_000_000; g++) {
      const nd = nodeByKey.get(cur)!;
      if (nd.isGoal) break;
      spent += actionCostOf(prices, nd.action!);
      const outs = outByKey.get(cur)!;
      let x = rng();
      let next = outs[outs.length - 1]!.to;
      for (const o of outs) { x -= o.prob; if (x < 0) { next = o.to; break; } }
      cur = next;
    }
    sum += spent; sumSq += spent * spent;
    if (spent > max) max = spent;
  }
  const mean = sum / runs;
  return { mean, sd: Math.sqrt(Math.max(0, sumSq / runs - mean * mean)), max };
}

const CAP = { maxIters: 20_000_000, maxMillis: 300_000, solver: 'policy' as const, restartCost: 0 };
console.log(`${SEEDS} seeds x ${RUNS.toLocaleString()} runs, patch ${data.patch}\n`);

for (const it of gear.characters[0]!.items) {
  const base = data.bases.get(it.baseId);
  if (!base) continue;
  const targets = targetsOf(it, data).map((modId) => ({ modId }));
  const start: ItemState = { base, level: it.level, rarity: 'normal', prefixes: [], suffixes: [] };
  let r: ReturnType<typeof markovFromItem>;
  try { r = markovFromItem(data, prices, start, targets, CAP); } catch (e) {
    console.log(`${it.name}: threw — ${(e as Error).message}`); continue;
  }
  if (!r.feasible || r.bound !== 'exact') { console.log(`${it.name}: ${r.reason ?? r.bound}`); continue; }

  const opener = actionCostOf(prices, r.nodes.find((n) => n.isStart)!.action!);
  if (r.expectedCost / Math.max(1e-12, opener) > 2e5) {
    console.log(`${(it.slot + ' ' + it.name).padEnd(30)} V=${r.expectedCost.toExponential(3)}  too long-odds to sample`);
    continue;
  }

  const runsOf = Array.from({ length: SEEDS }, (_, i) => walk(r, RUNS, i + 1));
  const means = runsOf.map((x) => x.mean);
  const avg = means.reduce((a, b) => a + b, 0) / means.length;
  const above = means.filter((x) => x > r.expectedCost).length;
  const rel = (x: number) => ((x / r.expectedCost - 1) * 100);
  console.log(`${it.slot} ${it.name} — V = ${r.expectedCost.toExponential(4)} ex, ${targets.length} targets`);
  console.log(`  per-seed deviation (%): ${means.map((x) => rel(x).toFixed(2).padStart(6)).join(' ')}`);
  console.log(`  mean of ${SEEDS}: ${rel(avg).toFixed(3)}%   above V: ${above}/${SEEDS}` +
    `   ${above === SEEDS || above === 0 ? '<-- consistent sign: investigate as BIAS' : '<-- mixed sign: sampling noise'}`);
  console.log(`  spread: SD/mean = ${(runsOf[0]!.sd / runsOf[0]!.mean).toFixed(1)}x, worst run = ${(runsOf[0]!.max / r.expectedCost).toFixed(0)}x V\n`);
}
