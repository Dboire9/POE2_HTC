// Every streamer item through the Lab's "Start from an item you buy instead" — checked, not just run.
//
//   npx tsx scripts/start-items-sweep.mts --list                  one "<profile> <index>" per item
//   npx tsx scripts/start-items-sweep.mts <profile> <index> [ms]  one item, one JSON line on stdout
//
// All of them, six at a time (each solve is single-threaded; memory stayed above 10 GB free):
//
//   npx tsx scripts/start-items-sweep.mts --list \
//     | xargs -P 6 -L 1 sh -c 'npx tsx scripts/start-items-sweep.mts "$0" "$1" > "sweep-$0-$1.json"'
//
// Each item is solved from a white base as the Lab solves it (restart at a free base, policy iteration,
// Exhaustive's clock, the solved policy kept). What is CHECKED, on every settled item:
//   - no starting item costs more to finish than crafting from scratch (restart is always a move);
//   - Magic rows carry at most two modifiers, rows are distinct states, the largest row fills every
//     slot and costs nothing;
//   - for the best item at every size, and the best Magic one: the route's root costs what its row says,
//     it ends at no more than one "start over" terminal and that terminal goes nowhere, a route from an
//     item worth anything reaches the target, every state's outcomes sum to one, and every state
//     satisfies V(s) = cost of its move + Σ p·V(next) — the route IS the policy its costs came from.
// Timings are only comparable between items run alone; under `-P 6` they are for orientation.

import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../packages/optimizer/src/cost.ts';
import { routeFrom } from '../packages/optimizer/src/markovRoute.ts';
import { optimizeItemMarkov, routeFor } from '../src/lib/engine.ts';
import { readGear, type StreamerFile } from '../src/lib/streamerGear.ts';
import { startOptions, startSizes } from '../src/lib/startingItem.ts';

const file = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as StreamerFile;
if (process.argv[2] === '--list') {
  for (const c of file.characters) c.items.forEach((_, i) => console.log(`${c.profile} ${i}`));
  process.exit(0);
}
const [profile, index, ms] = process.argv.slice(2);
const character = file.characters.find((c) => c.profile === profile);
const item = character?.items[Number(index)];
if (!character || !item) { console.error(`no item ${index} for ${profile}`); process.exit(1); }

const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: indexPrices(JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8'))) };
const out: Record<string, unknown> = { profile, index: Number(index), name: item.name };
const done = (status: string, extra: Record<string, unknown> = {}): never => {
  console.log(JSON.stringify({ ...out, status, ...extra }));
  process.exit(0);
};

const reading = readGear(data, item);
out.omitted = reading.omitted;
if (reading.blocked) done('blocked', { reason: reading.blocked });
const goal = reading.goal;
const slots = new Set(goal.targets.map((t, i) => t.slot ?? `own${i}`)).size;
Object.assign(out, { baseId: goal.baseId, level: goal.level, targets: goal.targets.length, slots });

const t0 = performance.now();
const m = optimizeItemMarkov(eng, { baseId: goal.baseId, level: goal.level, rarity: 'normal', prefixes: [], suffixes: [] },
  goal.targets, { restartCost: 0, maxIters: 20_000_000, solver: 'policy', maxMillis: Number(ms ?? 900_000), keepRoutes: true });
out.solveS = (performance.now() - t0) / 1000;
out.div = eng.prices.currency.divine;
if (!m.applicable || !m.feasible) done('unsolved', { reason: m.reason });
if (m.bound !== 'exact' || !m.routes || !m.holdings || m.restartCost === undefined) done('bound', { bound: m.bound });

const t = m.routes!;
const H = m.holdings!;
const scratch = m.restartCost! + m.expectedCost;
const checks: string[] = [];
const n = Math.max(...H.map((h) => h.present.length));
if (n !== slots) checks.push(`largest row holds ${n}, the craft has ${slots} slots`);
if (H.some((h) => h.present.length === n && h.cost !== 0)) checks.push('a finished row costs more than 0');
if (new Set(H.map((h) => h.key)).size !== H.length) checks.push('two rows read one state');
for (const h of H) {
  if (h.cost > scratch * (1 + 1e-9)) checks.push(`${h.rarity} ${h.present.join(' + ')} costs more than crafting from scratch`);
  if (h.rarity === 'magic' && h.present.length > 2) checks.push(`a Magic row carries ${h.present.length} modifiers`);
}

const perSize = [];
let routes = 0;
let worstResidual = 0;
for (const k of startSizes(H)) {
  const rows = startOptions(H, scratch, k, new Map());
  const best = rows[0]!;
  const bestMagic = rows.find((r) => r.rarity === 'magic');
  perSize.push({
    k, magic: rows.filter((r) => r.rarity === 'magic').length, rare: rows.filter((r) => r.rarity === 'rare').length,
    best: { rarity: best.rarity, mods: best.present, finish: best.finish, worth: best.worthUpTo },
  });
  for (const r of bestMagic && bestMagic !== best ? [best, bestMagic] : [best]) {
    const g = routeFrom(t, t.keys.indexOf(r.key as (typeof t.keys)[number]));
    routes++;
    if (g.nodes[0]!.expectedCost !== r.finish) checks.push(`route from ${r.present.join(' + ')} starts at a different cost`);
    const fresh = g.nodes.filter((x) => x.isRestart);
    if (fresh.length > 1) checks.push('a route with two start-over terminals');
    if (fresh.some((x) => g.edges.some((e) => e.from === x.key))) checks.push('a start-over terminal with a move out');
    if (r.worthUpTo > 0 && !g.nodes.some((x) => x.isGoal)) checks.push(`the route from ${r.present.join(' + ')} never finishes`);
    const V = new Map(g.nodes.map((x) => [x.key, x.expectedCost]));
    const from = new Map<string, typeof g.edges>();
    for (const e of g.edges) from.set(e.from, [...(from.get(e.from) ?? []), e]);
    for (const x of g.nodes) {
      if (x.actionCost === undefined) continue;
      const es = from.get(x.key) ?? [];
      const psum = es.reduce((s, e) => s + e.prob, 0);
      if (Math.abs(psum - 1) > 1e-9) checks.push(`the outcomes of one state sum to ${psum}`);
      const rhs = x.actionCost + es.reduce((s, e) => s + e.prob * V.get(e.to)!, 0);
      worstResidual = Math.max(worstResidual, Math.abs(rhs - x.expectedCost) / Math.max(1, x.expectedCost));
    }
  }
}
// The solver stops at a tolerance of a thousandth of the craft's cheapest action, so V is not exact to
// the last digit; 1e-6 relative is far outside anything that tolerance produces on these crafts.
if (worstResidual > 1e-6) checks.push(`a drawn route breaks V(s) = cost + Σ p·V by ${worstResidual.toExponential(2)}`);

// What a click on the best two-modifier row costs, as the app draws it (walk plus labels).
const click = startOptions(H, scratch, startSizes(H).includes(2) ? 2 : startSizes(H)[0]!, new Map())[0]!;
const times = [0, 1, 2].map(() => { const s = performance.now(); routeFor(eng, m, click.key); return performance.now() - s; });

done('exact', {
  scratch, lattice: t.keys.length, perSize, routes, worstResidual,
  clickMs: times.sort((a, b) => a - b)[1], checks,
});
