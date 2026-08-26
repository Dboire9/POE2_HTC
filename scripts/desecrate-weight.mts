// D4 — pin down DESECRATED_ASSUMED_WEIGHT from what a bone actually offers in game.
//
// poe2db publishes no spawn weight for carved rows (it reports 1 for every one), so all 527 are set to
// an assumed weight in tools/refresh/apply_pools.mjs. That was already "the single largest unverified
// number in the app"; since bones became the cheapest way to add an ORDINARY mod it also sets the
// price of every craft on armour and weapons — measured at a 4x swing across the plausible range.
//
// The saving grace is that it is cheap to observe. A bone offers three modifiers, so N bones show 3N
// of them; all you have to record is how many of those were carved ("carved by the Abyss"). The
// candidate weights predict wildly different rates, so a couple of dozen bones settles it.
//
// COUNT MODIFIERS, NOT OFFERS. An earlier version of this script asked how many OFFERS held at least
// one carved mod, and a sample recorded as modifiers was read as offers — which inflated the fitted
// weight by 50% (2,512 read as 3,981) before the reporter caught it. Modifiers are also the better
// statistic: 3N Bernoulli draws instead of N, for the same bones spent, so the interval is tighter.
//
//   npx tsx scripts/desecrate-weight.mts                        # what to expect, per base
//   npx tsx scripts/desecrate-weight.mts Body_Armours_str 20 11 # 20 bones (60 mods shown), 11 carved
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import { modTierWeight } from '../packages/engine/src/pool.ts';
import { DESECRATION_OFFER_COUNT } from '../packages/engine/src/probability.ts';

const LEVEL = 82;
const CANDIDATES = [1, 10, 100, 500, 1000, 2000, 4000, 5000, 20000];
const d = loadPatch('data/patches/0.5.0');

/**
 * The weight the SHIPPED data actually carries, read rather than restated.
 *
 * This used to be a literal 1000 in four places, which quietly became wrong the moment the constant
 * moved — the script would have gone on reporting the old number as "shipped" and comparing the
 * interval against it. Reading it from the snapshot means the script cannot disagree with the data
 * it is judging.
 */
const SHIPPED = (() => {
  for (const m of d.mods.values()) if (m.source === 'desecrated' && m.tiers[0]) return m.tiers[0].weight;
  throw new Error('no desecrated mods in the snapshot — has the pool build run?');
})();

/** P(any ONE offered modifier is carved), on an empty Rare, at an assumed carved weight. */
function pCarvedPerDraw(baseId: string, assumed: number): number {
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
  return carvedW / (carvedW + normalW);
}

/** P(an offer holds at least one carved mod) — the shape of the table, not what the fit consumes. */
const pCarvedInOffer = (baseId: string, assumed: number): number =>
  1 - (1 - pCarvedPerDraw(baseId, assumed)) ** DESECRATION_OFFER_COUNT;

const BASES = ['Body_Armours_str', 'Wands', 'Amulets', 'Rings'];
const [baseArg, bonesArg, hitsArg] = process.argv.slice(2);

if (!baseArg) {
  console.log('P(a bone\'s offer holds at least one carved mod), by assumed carved spawn weight:\n');
  console.log('weight'.padStart(8) + BASES.map((b) => b.padStart(20)).join(''));
  for (const w of CANDIDATES) {
    console.log(String(w).padStart(8)
      + BASES.map((b) => `${(pCarvedInOffer(b, w) * 100).toFixed(2)}%`.padStart(20)).join(''));
  }
  console.log(`\nThe shipped weight is ${SHIPPED}. Bone an empty Rare ~20 times and count the carved`);
  console.log('MODIFIERS across every offer (3 per bone), not the offers that held one, then re-run:');
  console.log('   npx tsx scripts/desecrate-weight.mts Body_Armours_str 20 11');
  process.exit(0);
}

const bones = Number(bonesArg);
const carved = Number(hitsArg);
const shown = bones * DESECRATION_OFFER_COUNT; // every bone puts three modifiers in front of you
if (!Number.isInteger(bones) || !Number.isInteger(carved) || bones <= 0 || carved < 0 || carved > shown) {
  console.error('usage: npx tsx scripts/desecrate-weight.mts <base> <bones observed> <carved MODIFIERS seen>');
  console.error(`  (a bone shows ${DESECRATION_OFFER_COUNT} modifiers, so N bones show 3N — count those, not the offers)`);
  process.exit(1);
}

// Binomial log-likelihood over the weight axis, on the DRAWS rather than the offers — every modifier
// shown is one Bernoulli trial. Coarse on purpose: the candidates differ by orders of magnitude, and
// the point is to separate them, not to quote a weight to three figures.
const logL = (p: number) =>
  (carved === 0 ? 0 : carved * Math.log(p)) + (shown - carved ? (shown - carved) * Math.log(1 - p) : 0);
const grid: { w: number; p: number; ll: number }[] = [];
for (let e = 0; e <= 45; e++) {
  const w = Math.round(10 ** (e / 10)); // 1 → ~32,000, ten points per decade
  const p = pCarvedPerDraw(baseArg, w);
  if (p <= 0 || p >= 1) continue;
  grid.push({ w, p, ll: logL(p) });
}
const best = grid.reduce((a, b) => (b.ll > a.ll ? b : a));
// Everything within 2 log-likelihood units of the peak — the usual rough interval.
const plausible = grid.filter((g) => best.ll - g.ll <= 2);
const observed = ((carved / shown) * 100).toFixed(1);

console.log(`${baseArg}: ${carved} carved of ${shown} modifiers shown by ${bones} bones (${observed}%)\n`);
console.log(`  best fit          carved weight ~ ${best.w}   (predicts ${(best.p * 100).toFixed(2)}% per draw)`);
console.log(`  plausible range   ${plausible[0]!.w} – ${plausible[plausible.length - 1]!.w}`);
console.log(`  shipped           ${String(SHIPPED).padEnd(16)}(predicts ${(pCarvedPerDraw(baseArg, SHIPPED) * 100).toFixed(2)}% per draw)`);
const shippedIn = plausible.some((g) => g.w <= SHIPPED) && plausible.some((g) => g.w >= SHIPPED);
console.log(`\n  ${shippedIn ? `The shipped ${SHIPPED} is inside that range — it survives this sample.`
  : `The shipped ${SHIPPED} is OUTSIDE that range. Update DESECRATED_ASSUMED_WEIGHT in tools/refresh/apply_pools.mjs,`
    + '\n  re-run `npm run update-data`, and re-check docs/validation.md D4.'}`);
if (bones < 20) console.log(`\n  ${bones} bones is a thin sample; 20+ separates the candidates cleanly.`);
