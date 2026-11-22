// The gate for playing the Omen of Whittling in the true expected cost (TODO 12b). The level model
// (markovWhittling.ts) ships OFF — `MarkovOptions.whittling` defaults to false — and its default is not
// flipped unless this script ends GATE PASSED.
//
//   npx tsx scripts/whittling.mts [--only <text>[,<text>…]] [--runs 20000] [--seconds 300] [--replay-seconds 300]
//
// Each craft is solved three ways, all from white, `tolerance: 1e-9`, `solver: 'policy'`, through
// `markovBoneFreeFirst` (as the 2026-11-13 ceiling was): WITHOUT the omen (`whittling: false`, the app's
// solve), with the REAL omen (`whittling: true`, the level model), and at the CEILING (`'ceiling'`: the
// player names the removal, a bound no real omen beats). "uses" is how many Chaos Orbs a finished craft
// plays with the omen, counted exactly from the real-omen plan (`markovUses`). Without and real are then
// played out on real items (`markovReplay.ts`): `--runs` crafts (default 20,000), seed 7, on a clock of
// `--replay-seconds` — a craft too long to play out says so instead.
//
// The crafts:
//   - frozen sheet (`loadFrozenPrices()`, which quotes no omen, so it is priced here at 1, 30 and 300 ex):
//     a white Wand with its first two prefixes and first suffix at their second tier, a base at 30 ex,
//     bones excluded — the craft the model first failed on, 2026-11-22 — and three more small crafts at
//     1 ex, where the omen plays and the replay finishes;
//   - today's sheet (`data/patches/0.5.0/prices.json`): the build-up set (`scripts/build-up.mts`, Wands,
//     Rings, Amulets, Body Armour (str) × 4, 5, 6 targets × T2, T1, item level 82, no start-over cost) with
//     bones excluded — where the ceiling saved most. A craft that gives no exact number on `--seconds`
//     is listed and not checked.
//
// The checks, on every craft with three exact numbers:
//   1. without ≥ real ≥ ceiling (to a relative 1e-9);
//   2. a craft whose real-omen plan never plays the omen costs the same as without, to the last digit;
//   3. where the omen plays and the real-omen replay finished, the replay lands within 2% AND within 3
//      standard errors of the real-omen V. The without replay is shown beside it, not gated (the
//      junk-family average already moves it a little — docs/validation.md 2026-09-24).
// GATE PASSED needs every check to hold and at least one craft where the omen plays whose replay could
// have seen a 2% error (3 SE ≤ 2% of V) and agreed. A replay its clock cut short may be too wide for that:
// it still fails the gate by disagreeing, but its agreement is not counted. The last line is `GATE PASSED`
// or `GATE FAILED`, and the exit code follows it.
//
// The six-target crafts take minutes each; `--only Wands,frozen` runs a subset (a craft whose name holds
// any of the texts), so up to six can run side by side. Their solve times are shown, but measure time with
// nothing else running.
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { whiteItem } from '../packages/engine/src/index.ts';
import type { PatchData } from '../packages/engine/src/types.ts';
import { pricesForBase, type Prices } from '../packages/optimizer/src/cost.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { loadFrozenPrices } from '../packages/optimizer/src/frozenPrices.ts';
import type { MarkovOptions, MarkovResult } from '../packages/optimizer/src/markovFromItem.ts';
import { BONE_KEYS, markovBoneFreeFirst } from '../packages/optimizer/src/markovBoneFree.ts';
import { markovUses } from '../packages/optimizer/src/markovUses.ts';
import type { TierTarget } from '../packages/optimizer/src/optimize.ts';

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const only = arg('only')?.split(',').filter((s) => s.length > 0);
const runs = Number(arg('runs') ?? 20_000);
const solveMs = Number(arg('seconds') ?? 300) * 1000;
const replayMs = Number(arg('replay-seconds') ?? 300) * 1000;
const OMEN = 'OmenofWhittling';

const data = loadShippedPatch('data/patches/0.5.0');
const today = loadPrices('data/patches/0.5.0');
const frozen = loadFrozenPrices();
const withOmen = (p: Prices, price: number): Prices => ({ ...p, omens: { ...p.omens, [OMEN]: price } });

interface Craft {
  readonly name: string;
  readonly sheet: Prices;
  readonly baseId: string;
  readonly targets: readonly TierTarget[];
  readonly restartCost: number;
}

/** The first `np` prefixes and `ns` suffixes of a base's normal pool, each at display tier `tier` (1 = best). */
function firstMods(d: PatchData, baseId: string, np: number, ns: number, tier: number): TierTarget[] {
  const b = d.bases.get(baseId)!;
  const ids = [...b.pools.normal.prefixes.slice(0, np), ...b.pools.normal.suffixes.slice(0, ns)];
  return ids.map((id) => {
    const n = d.mods.get(id)!.tiers.length;
    return { modId: id, minTierIndex: Math.max(0, n - Math.min(tier, n)) };
  });
}

const crafts: Craft[] = [];
for (const price of [1, 30, 300]) {
  crafts.push({ name: `frozen ${price} ex: Wands 2P+1S T2`, sheet: withOmen(frozen, price), baseId: 'Wands', targets: firstMods(data, 'Wands', 2, 1, 2), restartCost: 30 });
}
for (const [baseId, np, ns] of [['Rings', 2, 1], ['Amulets', 1, 2], ['Body_Armours_str', 2, 1]] as const) {
  crafts.push({ name: `frozen 1 ex: ${baseId} ${np}P+${ns}S T2`, sheet: withOmen(frozen, 1), baseId, targets: firstMods(data, baseId, np, ns, 2), restartCost: 30 });
}
// The build-up set, exactly as scripts/build-up.mts picks it.
for (const baseId of ['Wands', 'Rings', 'Amulets', 'Body_Armours_str']) {
  for (const tier of [2, 1]) {
    for (const n of [4, 5, 6]) {
      crafts.push({
        name: `today: ${baseId} x${n} T${tier}`, sheet: today, baseId,
        targets: firstMods(data, baseId, Math.ceil(n / 2), Math.floor(n / 2), tier), restartCost: 0,
      });
    }
  }
}
const chosen = crafts.filter((c) => !only || only.some((s) => c.name.includes(s)));

const NO_BONES = { excluded: new Set<string>(BONE_KEYS) };
const exact = (r: MarkovResult): boolean => r.feasible && r.bound === 'exact';
const fmt = (x: number): string => x.toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

console.log(`Omen of Whittling gate — today's sheet: omen ${today.omens[OMEN] ?? 'unpriced'} ex, Chaos ${today.currency['chaos']} ex; `
  + `frozen sheet: omen priced per craft, Chaos ${frozen.currency['chaos']} ex. Bones excluded everywhere. `
  + `Solve clock ${solveMs / 1000} s, replay ${runs.toLocaleString('en')} runs on ${replayMs / 1000} s, seed 7.`);
console.log('');

let failures = 0;
/** Crafts where the omen plays and a replay that could see a 2% error agreed with V. */
let gatedReplays = 0;
const fail = (craft: string, why: string): void => { failures++; console.log(`  FAIL ${craft}: ${why}`); };

/** One mode's solve, timed. */
function solve(c: Craft, whittling: boolean | 'ceiling', replay: boolean): { r: MarkovResult; s: number } {
  const start = whiteItem(data.bases.get(c.baseId)!, 82);
  const opts: MarkovOptions = {
    restartCost: c.restartCost, solver: 'policy', maxIters: 20_000_000, tolerance: 1e-9, maxMillis: solveMs,
    policy: NO_BONES, whittling, keepRoutes: whittling === true,
    ...(replay ? { replay: { runs, seed: 7, maxMillis: replayMs } } : {}),
  };
  const t0 = Date.now();
  const r = markovBoneFreeFirst(data, c.sheet, start, c.targets, opts, { maxMillis: solveMs });
  return { r, s: (Date.now() - t0) / 1000 };
}

/** A replay, read against V: the mean ± SE, its distance in % and in SE, and the runs if it stopped short. */
function replayText(r: MarkovResult): { text: string; why?: string; ok: boolean; rel: number; z: number; se: number } {
  const rp = r.replay;
  if (!rp) return { text: '—', ok: false, rel: NaN, z: NaN, se: NaN };
  // The replay's own reason ("too long a craft to play out — …") in the log; the table says "too long".
  if (!rp.ok) return { text: 'too long', why: rp.reason, ok: false, rel: NaN, z: NaN, se: NaN };
  const rel = (rp.meanCost - r.expectedCost) / r.expectedCost;
  const z = (rp.meanCost - r.expectedCost) / rp.stdErr;
  const partial = rp.runs < runs ? ` (${rp.runs.toLocaleString('en')} runs)` : '';
  return { text: `${fmt(rp.meanCost)} ± ${fmt(rp.stdErr)} = ${rel >= 0 ? '+' : ''}${(rel * 100).toFixed(2)}%, ${z >= 0 ? '+' : ''}${z.toFixed(2)} SE${partial}`, ok: true, rel, z, se: rp.stdErr };
}

const rows: string[] = [];
for (const c of chosen) {
  const off = solve(c, false, true);
  const real = solve(c, true, true);
  const ceil = solve(c, 'ceiling', false);
  const times = `${off.s.toFixed(1)} / ${real.s.toFixed(1)} / ${ceil.s.toFixed(1)} s`;
  const v = (r: MarkovResult): string => (exact(r) ? String(r.expectedCost) : r.feasible ? `${r.bound} ${r.expectedCost}` : 'no number');
  console.log(`${c.name}`);
  console.log(`  V without ${v(off.r)} | real ${v(real.r)} | ceiling ${v(ceil.r)} | solve + replay ${times}`);
  if (!exact(off.r) || !exact(real.r) || !exact(ceil.r)) {
    console.log('  not checked: a mode gave no exact number');
    rows.push(`| ${c.name} | ${v(off.r)} | ${v(real.r)} | ${v(ceil.r)} | — | — | — | not checked |`);
    continue;
  }
  const u = markovUses(real.r.routes!, pricesForBase(c.sheet, data.bases.get(c.baseId)!));
  const uses = u ? (u.uses.find((x) => x.key === OMEN)?.count ?? 0) : NaN;
  const plays = (real.r.routes?.actions ?? []).some((a) => a.currency === 'chaos' && a.whittling === true);
  const offRp = replayText(off.r);
  const realRp = replayText(real.r);
  const replayUses = real.r.replay?.ok
    ? real.r.replay.spendByMove.filter((m) => m.action.currency === 'chaos' && m.action.whittling).reduce((s, m) => s + m.count, 0)
    : NaN;
  console.log(`  whittled Chaos a craft: ${Number.isNaN(uses) ? 'not counted' : uses.toFixed(2)} (plan)${Number.isNaN(replayUses) ? '' : `, ${replayUses.toFixed(2)} (replay)`}`);
  console.log(`  replay without ${offRp.why ?? offRp.text}`);
  console.log(`  replay real    ${realRp.why ?? realRp.text}`);

  const slack = 1e-9;
  if (real.r.expectedCost > off.r.expectedCost * (1 + slack)) fail(c.name, `real ${real.r.expectedCost} > without ${off.r.expectedCost}`);
  if (ceil.r.expectedCost > real.r.expectedCost * (1 + slack)) fail(c.name, `ceiling ${ceil.r.expectedCost} > real ${real.r.expectedCost}`);
  if (!plays && real.r.expectedCost !== off.r.expectedCost) fail(c.name, `never plays, yet real ${real.r.expectedCost} ≠ without ${off.r.expectedCost}`);
  let verdict = plays ? 'plays' : 'never plays, unchanged';
  if (plays && realRp.ok) {
    const within = Math.abs(realRp.rel) <= 0.02 && Math.abs(realRp.z) <= 3;
    // An agreement counts as a measurement only if the replay could have seen a 2% error: 3 SE ≤ 2% of V.
    // A replay stopped short by its clock on a long craft (Wands ×5 T1: 1,335 runs, SE 2.4%) cannot.
    const resolves = 3 * realRp.se <= 0.02 * real.r.expectedCost;
    if (!within) fail(c.name, `replay of the real-omen plan is ${(realRp.rel * 100).toFixed(2)}%, ${realRp.z.toFixed(2)} SE from V`);
    else if (resolves) gatedReplays++;
    verdict = !within ? 'plays, REPLAY DISAGREES' : resolves ? 'plays, replay agrees' : 'plays, replay agrees but too few runs to count';
  } else if (plays) verdict = 'plays, replay too long';
  if (!plays && real.r.expectedCost !== off.r.expectedCost) verdict = 'never plays, CHANGED';
  rows.push(`| ${c.name} | ${fmt(off.r.expectedCost)} | ${fmt(real.r.expectedCost)} | ${fmt(ceil.r.expectedCost)} | `
    + `${Number.isNaN(uses) ? '—' : uses.toFixed(2)} | ${offRp.text} | ${realRp.text} | ${verdict} |`);
}

console.log('');
console.log('| craft | V without | V real omen | V ceiling | whittled Chaos a craft | replay without | replay real omen | verdict |');
console.log('|---|---|---|---|---|---|---|---|');
for (const row of rows) console.log(row);
console.log('');
if (gatedReplays === 0) {
  failures++;
  console.log('No craft where the omen plays had a replay that could see a 2% error and agreed: nothing measured the model.');
}
console.log(failures === 0 ? 'GATE PASSED' : `GATE FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
