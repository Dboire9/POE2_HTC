// What the Lab's "Start from an item you buy instead" panel says about a streamer's item, measured.
//
//   npx tsx scripts/start-items.mts [profile regex] [ms budget] [file to save the route table in]
//
// Defaults to fubgun's staff — the craft that asked the question — at Exhaustive's clock. Solves it
// once, from a white base, exactly as the Lab's from-white solve does (restart at the Base cost, policy
// iteration, the solved policy kept), then reads what the panel would show: how many starting items of
// each size and rarity and the best of each, every two-modifier item, what drawing the best routes
// costs, and how big the table is that makes that possible. Stdout only — the numbers belong in
// docs/validation.md (2026-09-11). The optional third argument saves the table, so `routeFrom` can be
// timed and compared offline: it reads nothing else.

import { readFileSync, writeFileSync } from 'node:fs';
import { serialize } from 'node:v8';
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../packages/optimizer/src/cost.ts';
import { optimizeItemMarkov, routeFor } from '../src/lib/engine.ts';
import { readGear } from '../src/lib/streamerGear.ts';
import { startOptions } from '../src/lib/startingItem.ts';

const who = new RegExp(process.argv[2] ?? 'fubgun');
const budget = Number(process.argv[3] ?? 900_000);
const data = loadShippedPatch('data/patches/0.5.0');
const sheet = JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8'));
const eng = { data, prices: indexPrices(sheet) };
const character = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')).characters
  .find((c: { profile: string }) => who.test(c.profile));
// The item with a slot of alternatives is the Aldur-rune staff; any other profile takes its first item.
const item = character.items.find((i: { familyConflict?: unknown[] }) => (i.familyConflict?.length ?? 0) > 0) ?? character.items[0];
const goal = readGear(data, item).goal;
const white = { baseId: goal.baseId, level: goal.level, rarity: 'normal' as const, prefixes: [], suffixes: [] };

console.log(`price sheet ${sheet.updated} (${sheet.league}); ${goal.baseId} ilvl ${goal.level}; ${goal.targets.length} candidates`);
const t0 = performance.now();
const m = optimizeItemMarkov(eng, white, goal.targets, {
  restartCost: 0, maxIters: 20_000_000, solver: 'policy', maxMillis: budget, keepRoutes: true,
});
const solveS = (performance.now() - t0) / 1000;
const div = eng.prices.currency.divine ?? 1;
const inDiv = (ex: number): string => `${(ex / div).toLocaleString('en', { maximumFractionDigits: 1 })} div`;
console.log(`solve: ${solveS.toFixed(1)} s, ${m.bound}, from scratch ${inDiv(m.expectedCost)} (${Math.round(m.expectedCost).toLocaleString('en')} ex), graph ${m.nodes.length} states`);
if (!m.routes || !m.holdings || m.restartCost === undefined) {
  console.log('no route table — the solve did not settle, so the panel would show its effort note');
  process.exit(0);
}

// Saved so `routeFrom` can be timed and compared offline: it reads nothing but this table.
if (process.argv[4]) writeFileSync(process.argv[4], serialize({ routes: m.routes, holdings: m.holdings, expectedCost: m.expectedCost }));

const scratch = m.restartCost + m.expectedCost;
const sizes = [...new Set(m.holdings.map((h) => h.present.length))].sort((a, b) => a - b);
console.log('\nstarting items by how many targets they carry — count, and the best of each size:');
for (const k of sizes) {
  const at = m.holdings.filter((h) => h.present.length === k);
  const best = startOptions(m.holdings, scratch, k, new Map())[0];
  console.log(`  ${k}: ${String(at.filter((h) => h.rarity === 'magic').length).padStart(2)} Magic, ${String(at.filter((h) => h.rarity === 'rare').length).padStart(2)} Rare`
    + (best ? `; best ${best.rarity} ${best.present.join(' + ')}, finish ${inDiv(best.finish)}, worth up to ${inDiv(best.worthUpTo)}` : ''));
}

const rows = startOptions(m.holdings, scratch, 2, new Map());
console.log('\nstarting items with 2 of the targets, cheapest to finish first:');
for (const r of rows) {
  console.log(`  ${r.rarity.padEnd(5)} ${r.present.join(' + ').padEnd(110)} finish ${inDiv(r.finish).padStart(12)}  worth up to ${inDiv(r.worthUpTo).padStart(12)}`);
}

const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;
console.log('\nroutes for the best Magic and the best Rare:');
for (const rarity of ['magic', 'rare'] as const) {
  const best = rows.find((r) => r.rarity === rarity);
  if (!best) continue;
  const times: number[] = [];
  let route = routeFor(eng, m, best.key)!;
  for (let i = 0; i < 5; i++) { const t = performance.now(); route = routeFor(eng, m, best.key)!; times.push(performance.now() - t); }
  console.log(`  ${rarity}: ${route.nodes.length} states, ${route.edges.length} edges, routeFor median ${median(times).toFixed(1)} ms`
    + `, starts over ${route.nodes.some((n) => n.isRestart) ? 'on some branches' : 'never'}`);
}

const { routes, ...withoutRoutes } = m;
const t1 = performance.now();
structuredClone(m);
const cloneMs = performance.now() - t1;
console.log(`\npayload: route table ${(serialize(routes).length / 1e6).toFixed(2)} MB (${routes.keys.length} states, ${routes.outTo.length} outcomes);`
  + ` result with it ${(serialize(m).length / 1e6).toFixed(2)} MB, without ${(serialize(withoutRoutes).length / 1e6).toFixed(2)} MB;`
  + ` structuredClone ${cloneMs.toFixed(0)} ms`);
