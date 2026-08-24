// D4 — pin down DESECRATED_ASSUMED_WEIGHT from what a bone actually offers in game.
//
// poe2db publishes no spawn weight for carved rows (it reports 1 for every one), so all 527 are set to
// an assumed 1000 in tools/refresh/apply_pools.mjs. That was already "the single largest unverified
// number in the app"; since bones became the cheapest way to add an ORDINARY mod it also sets the
// price of every craft on armour and weapons — measured at a 4x swing across the plausible range.
//
// The saving grace is that it is now cheap to observe. A bone offers three modifiers; all you have to
// record is how many offers contained at least one carved ("carved by the Abyss") mod. The candidate
// weights predict wildly different rates, so a couple of dozen bones settles it.
//
//   npx tsx scripts/desecrate-weight.mts                       # what to expect, per base
//   npx tsx scripts/desecrate-weight.mts Body_Armours_str 20 3 # 20 bones, 3 offers held a carved mod
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import { modTierWeight } from '../packages/engine/src/pool.ts';
import { DESECRATION_OFFER_COUNT } from '../packages/engine/src/probability.ts';

const LEVEL = 82;
const CANDIDATES = [1, 10, 100, 500, 1000, 2000, 5000, 20000];
const d = loadPatch('data/patches/0.5.0');

/** P(a bone's offer holds at least one carved mod), on an empty Rare, at an assumed carved weight. */
function pCarvedInOffer(baseId: string, assumed: number): number {
  const base = d.bases.get(baseId);
  if (!base) throw new Error(`unknown base: ${baseId}`);
  const sum = (ids: readonly string[], carved: boolean) => ids.reduce((acc, id) => {
    const m = d.mods.get(id);
    if (!m) return acc;
    // A carved row's shipped weight is the assumption itself, so substitute rather than scale — that
    // way the candidate is read straight off the axis instead of through the shipped 1000.
    return acc + (carved ? assumed : modTierWeight(m, 0, LEVEL, 0));
  }, 0);
  const carvedW = sum(base.pools.desecrated.prefixes, true) + sum(base.pools.desecrated.suffixes, true);
  const normalW = sum(base.pools.normal.prefixes, false) + sum(base.pools.normal.suffixes, false);
  const perDraw = carvedW / (carvedW + normalW);
  return 1 - (1 - perDraw) ** DESECRATION_OFFER_COUNT;
}

const BASES = ['Body_Armours_str', 'Wands', 'Amulets', 'Rings'];
const [baseArg, bonesArg, hitsArg] = process.argv.slice(2);

if (!baseArg) {
  console.log('P(a bone\'s offer holds at least one carved mod), by assumed carved spawn weight:\n');
  console.log('weight'.padStart(8) + BASES.map((b) => b.padStart(20)).join(''));
  for (const w of CANDIDATES) {
    console.log(String(w).padStart(8)
      + BASES.map((b) => `${(pCarvedInOffer(b, w) * 100).toFixed(2)}%`.padStart(20)).join(''));
  }
  console.log('\nThe shipped assumption is 1000. Bone an empty Rare ~20 times, count how many OFFERS');
  console.log('contained a carved mod, then re-run as e.g.:');
  console.log('   npx tsx scripts/desecrate-weight.mts Body_Armours_str 20 3');
  process.exit(0);
}

const bones = Number(bonesArg);
const hits = Number(hitsArg);
if (!Number.isInteger(bones) || !Number.isInteger(hits) || bones <= 0 || hits < 0 || hits > bones) {
  console.error('usage: npx tsx scripts/desecrate-weight.mts <base> <bones observed> <offers holding a carved mod>');
  process.exit(1);
}

// Binomial log-likelihood over the weight axis. Coarse on purpose: the candidates differ by orders of
// magnitude, and the point is to separate them, not to quote a weight to three figures.
const logL = (p: number) => (hits === 0 ? 0 : hits * Math.log(p)) + (bones - hits ? (bones - hits) * Math.log(1 - p) : 0);
const grid: { w: number; p: number; ll: number }[] = [];
for (let e = 0; e <= 45; e++) {
  const w = Math.round(10 ** (e / 10)); // 1 → ~32,000, ten points per decade
  const p = pCarvedInOffer(baseArg, w);
  if (p <= 0 || p >= 1) continue;
  grid.push({ w, p, ll: logL(p) });
}
const best = grid.reduce((a, b) => (b.ll > a.ll ? b : a));
// Everything within 2 log-likelihood units of the peak — the usual rough interval.
const plausible = grid.filter((g) => best.ll - g.ll <= 2);
const observed = ((hits / bones) * 100).toFixed(1);

console.log(`${baseArg}: ${hits} of ${bones} offers held a carved mod (${observed}%)\n`);
console.log(`  best fit          carved weight ~ ${best.w}   (predicts ${(best.p * 100).toFixed(2)}%)`);
console.log(`  plausible range   ${plausible[0]!.w} – ${plausible[plausible.length - 1]!.w}`);
console.log(`  shipped           1000            (predicts ${(pCarvedInOffer(baseArg, 1000) * 100).toFixed(2)}%)`);
const shippedIn = plausible.some((g) => g.w <= 1000) && plausible.some((g) => g.w >= 1000);
console.log(`\n  ${shippedIn ? 'The shipped 1000 is inside that range — the assumption survives this sample.'
  : 'The shipped 1000 is OUTSIDE that range. Update DESECRATED_ASSUMED_WEIGHT in tools/refresh/apply_pools.mjs,'
    + '\n  re-run `npm run update-data`, and re-check docs/validation.md D4.'}`);
if (bones < 20) console.log(`\n  ${bones} bones is a thin sample; 20+ separates the candidates cleanly.`);
