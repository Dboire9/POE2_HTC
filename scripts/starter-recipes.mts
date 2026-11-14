// The starter recipes (starterRecipes.ts), measured the way the card will run them: each through the
// app's own path (`runSolve`, the Lab, from a white base, essence twins applied, `priceBasis: 'found'`) at
// Standard — its 15 s clock and 100k sweeps. The found basis plans on the FOUND sheet whole (scarcity
// weights, a Transmute as 1) whatever trade sheet the engine holds, a fresh base at `FOUND_BASE_WEIGHT`.
// The test (`starterRecipes.test.ts`) holds each to settling within Standard's sweeps with the clock lifted,
// and holds each recipe's stated bases; this is the half it cannot hold: how long each takes.
//
//   npx tsx scripts/starter-recipes.mts                      the shipped list, STARTER_RECIPES
//   npx tsx scripts/starter-recipes.mts candidates [weapon] [shapes]
//                                                            the shapes compared (below); `weapon` keeps the
//                                                            rows whose weapon starts with it, `shapes` is a
//                                                            comma list ("a,c1")
//   npx tsx scripts/starter-recipes.mts sensitivity          each found weight, and the base weight, halved
//                                                            and doubled: which shipped plans change
//
// Per row: recipe, item level, the targets as tiers (`@n` marks a slot of alternatives), the expected total
// in scarcity weights, `bound`, seconds (`!` past 1.5 s), what the plan uses on average — every currency by
// name, and the bases (1 + its start overs) — EXACT, from the solved plan (`markov.uses`, `markov.restarts`),
// and the plan: the route most finishing crafts take, and what its first move can land.
//
// The gate, and the exit code: every shipped recipe at every level it is offered and measured (its first
// and last level, and each of LEVELS inside its range) is exact and plans the same on the live and the
// frozen trade sheet (the found basis must read neither); its stated `bases` is the floor and ceiling of
// what it measured; and each weapon's easy recipe uses fewer bases than its better one at every level
// both are offered and measured. Time it alone: a loaded machine spreads it.
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { loadFrozenPrices } from '../packages/optimizer/src/frozenPrices.ts';
import { FOUND_BASE_WEIGHT, FOUND_PRICES, FOUND_WEIGHTS } from '../packages/optimizer/src/foundPrices.ts';
import type { Prices } from '../packages/optimizer/src/cost.ts';
import { runSolve, type SolveRequest } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { mainLine } from '../src/lib/policyPath.ts';
import type { EngineMarkovResult, TargetInput } from '../src/lib/engineTypes.ts';
import type { Engine } from '../src/lib/engine.ts';
import { STARTER_RECIPES, TIER_SLACK, modWords, targetsAt, type StarterRecipe } from '../src/lib/starterRecipes.ts';

const patch = 'data/patches/0.5.0';
const data = loadShippedPatch(patch);
/** The engine the app holds: the live trade sheet. A found-basis solve must not read it. */
const live: Engine = { data, prices: loadPrices(patch) };
/** The same engine on the frozen trade sheet — the control for that. */
const frozen: Engine = { data, prices: loadFrozenPrices() };

/** The item levels measured, inside a recipe's range; its first and last levels are measured too. */
const LEVELS = [8, 12, 16, 25, 33, 40, 46, 55, 60, 65];

// ---- the candidates: the shapes compared ----

interface Candidate {
  readonly weapon: string;
  /**
   * a: two modifiers (the attack weapons' better recipe). b: three. c1–c5: one or two fixed and a slot any
   * one of several fills. On attack weapons c1 adds "increased Physical or flat elemental" to (a), c2 widens
   * (a)'s Physical to any flat damage, c3 swaps (a)'s Attack Speed for that slot, c4 (the easy recipe) adds
   * the increased Physical and Accuracy hybrid to c3's slot, c5 Elemental Damage with Attacks as well. On
   * casters and Sceptres c1 (shipped) lets (a)'s first modifier be its Mana hybrid, c2 adds a third slot.
   * v: the shipped caster recipe on an element-locked base.
   */
  readonly shape: string;
  readonly recipe: StarterRecipe;
  readonly slack: number;
}

/** A recipe on `baseId` from slots of modifier ids within `modBase` ("LocalPhysicalDamage"). */
const recipe = (name: string, baseId: string, slots: readonly (readonly string[])[], modBase = baseId): StarterRecipe => ({
  name, weapon: baseId, grade: 'better', baseId, levels: { from: 1, to: 100 }, bases: { from: 0, to: 0 },
  slots: slots.map((ids) => {
    const modIds = ids.map((m) => `${modBase}/${m}`);
    return { modIds, words: modIds.map((id) => modWords(data.mods.get(id)?.text ?? id)).join(' or ') };
  }),
});

const ATTACK = ['Bows', 'Crossbows', 'Quarterstaves', 'Spears', 'OneHand_Maces', 'TwoHand_Maces'];
const CASTER = ['Wands', 'Staves'];
const PHYS = 'LocalPhysicalDamage';
const SPEED = 'LocalIncreasedAttackSpeed';
const PCT = 'LocalPhysicalDamagePercent';
const ELE = ['LocalFireDamage', 'LocalColdDamage', 'LocalLightningDamage'];
const PCT_ACC = 'LocalIncreasedPhysicalDamagePercentAndAccuracyRating';
const ELE_PCT = 'IncreasedWeaponElementalDamagePercent';
const SPELLS = ['WeaponSpellDamage', 'WeaponSpellDamageAndMana'];
const CAST = 'IncreasedCastSpeed';

const shapes = (weapon: string, baseId: string): Omit<Candidate, 'slack'>[] => {
  const c = (shape: string, name: string, slots: readonly (readonly string[])[]) =>
    ({ weapon, shape, recipe: recipe(name, baseId, slots) });
  if (ATTACK.includes(baseId)) {
    return [
      c('a', 'phys + speed', [[PHYS], [SPEED]]),
      c('b', 'phys + speed + %phys', [[PHYS], [SPEED], [PCT]]),
      c('c1', 'phys + speed + any(%phys, flat ele)', [[PHYS], [SPEED], [PCT, ...ELE]]),
      c('c2', 'any flat + speed', [[PHYS, ...ELE], [SPEED]]),
      c('c3', 'phys + any(%phys, flat ele)', [[PHYS], [PCT, ...ELE]]),
      c('c4', 'phys + any(%phys, %phys+accuracy, flat ele)', [[PHYS], [PCT, PCT_ACC, ...ELE]]),
      c('c5', 'phys + any(%phys, %phys+accuracy, flat ele, %ele attacks)', [[PHYS], [PCT, PCT_ACC, ...ELE, ELE_PCT]]),
    ];
  }
  if (CASTER.includes(baseId)) {
    return [
      c('a', 'spell + cast', [['WeaponSpellDamage'], [CAST]]),
      c('b', 'spell + cast + spell level', [['WeaponSpellDamage'], [CAST], ['GlobalIncreaseSpellSkillGemLevelWeapon']]),
      c('c1', 'any(spell, spell+mana) + cast', [SPELLS, [CAST]]),
      c('c2', 'spell + cast + any(spell+mana, mana)', [['WeaponSpellDamage'], [CAST], ['WeaponSpellDamageAndMana', 'IncreasedMana']]),
    ];
  }
  return [
    c('a', 'spirit + allies damage', [['LocalIncreasedSpiritPercent'], ['AlliesInPresenceAllDamage']]),
    c('b', 'spirit + allies damage + minion level',
      [['LocalIncreasedSpiritPercent'], ['AlliesInPresenceAllDamage'], ['GlobalIncreaseMinionSpellSkillGemLevelWeapon']]),
    c('c1', 'any(spirit, spirit+mana) + allies damage',
      [['LocalIncreasedSpiritPercent', 'LocalIncreasedSpiritAndMana'], ['AlliesInPresenceAllDamage']]),
    c('c2', 'spirit + allies damage + any(allies speed, cast speed)',
      [['LocalIncreasedSpiritPercent'], ['AlliesInPresenceAllDamage'], ['AlliesInPresenceIncreasedAttackSpeed', 'AlliesInPresenceIncreasedCastSpeed']]),
  ];
};

const WEAPONS: readonly [string, string][] = [
  ['Bow', 'Bows'], ['Crossbow', 'Crossbows'], ['Quarterstaff', 'Quarterstaves'], ['Spear', 'Spears'],
  ['One Hand Mace', 'OneHand_Maces'], ['Two Hand Mace', 'TwoHand_Maces'], ['Wand', 'Wands'], ['Staff', 'Staves'],
  ['Sceptre', 'Sceptres'],
];
const CANDIDATES: readonly Candidate[] = [
  ...WEAPONS.flatMap(([weapon, baseId]) => shapes(weapon, baseId).flatMap((c) => [1, 2].map((slack) => ({ ...c, slack })))),
  // The shipped caster recipe on each element-locked base: the same modifiers, on a smaller pool.
  ...CASTER.flatMap((parent) => ['fire', 'cold', 'lightning', 'physical', 'chaos'].map((e) => ({
    weapon: `${parent === 'Wands' ? 'Wand' : 'Staff'} (${e})`, shape: 'v', slack: TIER_SLACK,
    recipe: recipe('any(spell, spell+mana) + cast', `${parent}_${e}`, [SPELLS, [CAST]], parent),
  }))),
];

// ---- one solve, read the way the card will read it ----

const effort = limitsFor('standard');
/** The request the card makes: a white base at `level`, planned on the found sheet. */
const foundRequest = (baseId: string, level: number, targets: readonly TargetInput[]): SolveRequest =>
  ({ kind: 'lab', from: { baseId, level }, targets, priceBasis: 'found', effort });

const solve = (eng: Engine, req: SolveRequest): { m: EngineMarkovResult; s: number } => {
  const t0 = performance.now();
  const m = runSolve(eng, req).markov;
  return { m, s: (performance.now() - t0) / 1000 };
};

/** Bases a craft uses on average: the first, and one per start over. Undefined without exact counts. */
const basesOf = (m: EngineMarkovResult): number | undefined => (m.restarts === undefined ? undefined : 1 + m.restarts);

/** What the plan uses, every currency by name — "7.4 Transmute, 0.8 Lesser Essence of Abrasion" — and its bases. */
const showUses = (m: EngineMarkovResult): string => (m.uses === undefined ? '-'
  : `${m.uses.map((u) => `${u.count.toFixed(2)} ${u.label}`).join(', ')}; ${basesOf(m)!.toFixed(2)} bases`);

/** The plan's moves along the route most finishing crafts take. */
const movesOf = (m: EngineMarkovResult): string[] => mainLine(m).steps.map((s) => s.action);

/** The plan in a line: those moves, each with what it aims for and the odds of landing it. */
const planOf = (m: EngineMarkovResult): string => {
  const line = mainLine(m);
  if (line.steps.length === 0) return '(no route)';
  return line.steps.map((s) => {
    const aims = s.changes.gained.map((g) => g.replace(/\n/g, ' / ')).join(' + ');
    return `${s.action}${aims ? ` [aims for ${aims}, ${(100 * s.advance).toFixed(0)}%]` : ''}`;
  }).join(' → ');
};

/**
 * The plan's first fork: what its first move can land, and what the plan does next on each — every
 * outcome it keeps, with its odds, and the share it starts over on. "Transmute: Attack Speed 5% → Lesser
 * Essence of Abrasion; …; else start over (90%)". A position the solver merged (alternatives it cannot tell
 * apart) reads as its route text.
 */
const forkOf = (m: EngineMarkovResult): string => {
  const start = m.nodes.find((n) => n.isStart);
  if (!start?.action) return '';
  const byKey = new Map(m.nodes.map((n) => [n.key, n]));
  // Whatever the route does not draw onward from the first move is a start over, so it is the remainder.
  let keptShare = 0;
  const kept: string[] = [];
  for (const e of m.edges.filter((x) => x.from === start.key).sort((a, b) => b.prob - a.prob)) {
    const to = byKey.get(e.to);
    if (!to || to.key === start.key || to.isRestart || to.action === 'Start over with a new base') continue;
    keptShare += e.prob;
    const what = to.present.map((p) => p.text.replace(/\n/g, ' / ')).join(' + ') || 'nothing asked';
    kept.push(`${what} ${(100 * e.prob).toFixed(1)}% → ${to.isGoal ? 'done' : to.action}`);
  }
  return `${start.action}: ${kept.join('; ')}; else start over (${(100 * (1 - keptShare)).toFixed(0)}%)`;
};

const tiersOf = (targets: readonly TargetInput[]): string => targets.map((t) =>
  `${t.modId.split('/')[1]!.replace(/^Local/, '')} T${t.tierDisplay}${t.slot === undefined ? '' : `@${t.slot}`}`).join(', ');

const show = (m: EngineMarkovResult): string => (!m.feasible ? 'none'
  : `${m.bound === 'upper' ? '≤ ' : m.bound === 'lower' ? '≥ ' : ''}${m.expectedCost.toFixed(1)}`);

/** What one row measured: exact or not, and — when exact — its total and the bases it uses. */
interface Row { readonly level: number; readonly exact: boolean; readonly total?: number; readonly bases?: number }

/**
 * One recipe at one level, printed. A level it is not offered at counts as exact. With `control`, the same
 * request is solved on that engine too, and a row whose answer moves with the trade sheet is not exact.
 */
const row = (label: string, rec: StarterRecipe, level: number, slack: number, control?: Engine): Row => {
  const at = targetsAt(data, rec, level, slack);
  const head = `${label.padEnd(30)} ${String(level).padStart(2)}`;
  if (!at) { console.log(`${head}  not offered (fewer than two modifiers roll)`); return { level, exact: true }; }
  const req = foundRequest(rec.baseId, level, at.targets);
  const { m, s } = solve(live, req);
  let exact = m.applicable && m.feasible && m.bound === 'exact' && m.uses !== undefined;
  let note = '';
  if (control) {
    const c = solve(control, req).m;
    const same = c.bound === m.bound && c.expectedCost === m.expectedCost && c.restarts === m.restarts
      && JSON.stringify(c.uses) === JSON.stringify(m.uses);
    if (!same) { exact = false; note = `  MOVES WITH THE TRADE SHEET: ${show(c)} on the frozen one`; }
  }
  console.log(`${head}  ${show(m).padStart(8)}  ${(m.feasible ? m.bound : '-').padEnd(5)} ${s.toFixed(2).padStart(5)}s${s > 1.5 ? '!' : ' '} `
    + `${tiersOf(at.targets)}${at.dropped.length ? ` (dropped ${at.dropped.join(', ')})` : ''}${note}\n`
    + `      uses: ${showUses(m)}\n`
    + `      plan: ${exact ? planOf(m) : (m.reason ?? '').slice(0, 100)}`
    + `${exact ? `\n      first move: ${forkOf(m)}` : ''}`);
  const bases = basesOf(m);
  return { level, exact, ...(exact ? { total: m.expectedCost } : {}), ...(bases === undefined ? {} : { bases }) };
};

/** The levels a shipped recipe is measured at: each of `levels` inside its range, and its first and last. */
const levelsOf = (rec: StarterRecipe, levels: readonly number[]): number[] =>
  [...new Set([rec.levels.from, ...levels, rec.levels.to])].filter((l) => l >= rec.levels.from && l <= rec.levels.to).sort((a, b) => a - b);

const span = (xs: readonly number[], digits: number): string =>
  (xs.length ? `${Math.min(...xs).toFixed(digits)}–${Math.max(...xs).toFixed(digits)}` : '-');

// One small solve first, untimed: the first solve in a process also pays for compiling the solver, which
// would otherwise land on whichever row came first.
solve(live, foundRequest('Quarterstaves', 25, [{ modId: `Quarterstaves/${PHYS}`, tierDisplay: 8 }, { modId: `Quarterstaves/${SPEED}`, tierDisplay: 7 }]));

const which = process.argv[2] ?? 'shipped';

if (which === 'candidates') {
  const weapon = (process.argv[3] ?? '').toLowerCase();
  const only = process.argv[4]?.split(',');
  const pool = CANDIDATES.filter((c) => (!weapon || c.weapon.toLowerCase().startsWith(weapon)) && (!only || only.includes(c.shape)));
  console.log(`candidates: ${pool.length} recipe shapes, found basis, Standard, base weight ${FOUND_BASE_WEIGHT}`);
  for (const c of pool) {
    console.log(`\n=== ${c.weapon} · ${c.shape} · ${c.recipe.name} · slack ${c.slack}`);
    for (const level of LEVELS) row(c.weapon, c.recipe, level, c.slack);
  }
  process.exit(0);
}

if (which === 'sensitivity') {
  // Each weight halved and doubled in turn, and the base weight likewise. The found basis always plans on
  // the shipped found sheet, so a variant sheet is handed to the solve DIRECTLY — the engine holding it as
  // its sheet, the start over at the base weight (`baseCost`) and the counts asked for (`uses`) — which is
  // what the found basis does with the shipped one: the first check below holds the two the same. A plan
  // has CHANGED when the moves along its route differ, or any state's move does; the total moves with every
  // weight and says nothing on its own.
  // A few levels across the range, and each recipe's last: where a recipe stops is where it is most likely
  // to stop settling.
  const SENSITIVITY_LEVELS = [16, 25, 40, 55];
  const direct = (prices: Prices, baseCost: number, baseId: string, level: number, targets: readonly TargetInput[]) =>
    solve({ data, prices }, { kind: 'lab', from: { baseId, level }, targets, baseCost, uses: true, effort }).m;
  type Variant = { readonly name: string; readonly prices: Prices; readonly baseCost: number };
  const variants: Variant[] = [];
  for (const key of Object.keys(FOUND_WEIGHTS)) {
    for (const f of [0.5, 2]) {
      variants.push({ name: `${key} ×${f}`, prices: { ...FOUND_PRICES, currency: { ...FOUND_WEIGHTS, [key]: FOUND_WEIGHTS[key]! * f } }, baseCost: FOUND_BASE_WEIGHT });
    }
  }
  for (const f of [0.5, 2]) variants.push({ name: `base ×${f}`, prices: FOUND_PRICES, baseCost: FOUND_BASE_WEIGHT * f });
  console.log(`sensitivity: ${STARTER_RECIPES.length} recipes at levels ${SENSITIVITY_LEVELS.join(', ')} and each one's last, `
    + `${variants.length} sheets (each found weight and the base weight halved and doubled)`);
  const cases = STARTER_RECIPES.flatMap((rec) => [...new Set([...SENSITIVITY_LEVELS, rec.levels.to])]
    .filter((l) => l >= rec.levels.from && l <= rec.levels.to)
    .map((level) => ({ rec, level, targets: targetsAt(data, rec, level)!.targets })));
  const baseline = cases.map((c) => solve(live, foundRequest(c.rec.baseId, c.level, c.targets)).m);
  // The check: the shipped sheet handed directly answers what the found basis answers.
  let mismatch = 0;
  cases.forEach((c, i) => {
    const d = direct(FOUND_PRICES, FOUND_BASE_WEIGHT, c.rec.baseId, c.level, c.targets);
    if (d.expectedCost !== baseline[i]!.expectedCost || d.restarts !== baseline[i]!.restarts) mismatch++;
  });
  console.log(mismatch === 0 ? 'the found sheet handed directly answers what the found basis does, on every case'
    : `the found sheet handed directly DIFFERS from the found basis on ${mismatch} cases`);
  const policyOf = (m: EngineMarkovResult): Map<string, string> =>
    new Map(m.nodes.filter((n) => n.action !== undefined).map((n) => [n.key, n.action!]));
  let notExact = 0;
  for (const v of variants) {
    const changed: string[] = [];
    const totals: number[] = [];
    let states = 0;
    cases.forEach((c, i) => {
      const m = direct(v.prices, v.baseCost, c.rec.baseId, c.level, c.targets);
      if (m.bound !== 'exact' || !m.feasible) { notExact++; changed.push(`${c.rec.name} ${c.level}: not exact`); return; }
      const was = baseline[i]!;
      totals.push(m.expectedCost / was.expectedCost);
      const before = movesOf(was).join(' → ');
      const after = movesOf(m).join(' → ');
      const old = policyOf(was);
      const moved = [...policyOf(m)].filter(([k, a]) => old.has(k) && old.get(k) !== a);
      states += moved.length;
      if (before !== after || moved.length > 0) {
        changed.push(`${c.rec.name} ${c.level}: ${before === after ? `route unchanged (${before})` : `${before} ⇒ ${after}`}`
          + `${moved.length ? `; ${moved.length} state(s) move: ${moved.slice(0, 2).map(([k, a]) => `${old.get(k)} ⇒ ${a}`).join(', ')}` : ''}`
          + ` — total ${was.expectedCost.toFixed(1)} ⇒ ${m.expectedCost.toFixed(1)}, bases ${basesOf(was)?.toFixed(2)} ⇒ ${basesOf(m)?.toFixed(2)}`);
      }
    });
    const range = totals.length ? `totals ×${Math.min(...totals).toFixed(2)}–${Math.max(...totals).toFixed(2)}` : '';
    console.log(`\n${v.name.padEnd(20)} ${range.padEnd(20)} ${changed.length === 0 ? 'no plan changes'
      : `${changed.length} of ${cases.length} plans change (${states} state moves):`}`);
    for (const l of changed) console.log(`    ${l}`);
  }
  console.log(notExact === 0 ? '\nevery variant solve exact' : `\n${notExact} variant solves not exact`);
  process.exit(notExact === 0 && mismatch === 0 ? 0 : 1);
}

if (which !== 'shipped') {
  console.error(`unknown mode "${which}": run with no argument (the shipped list), "candidates" or "sensitivity"`);
  process.exit(2);
}

console.log(`STARTER_RECIPES: ${STARTER_RECIPES.length} recipes, found basis, Standard, slack ${TIER_SLACK}, `
  + `base weight ${FOUND_BASE_WEIGHT}; each row also solved on the frozen trade sheet as the control`);
let failures = 0;
let rows = 0;
const spreads: string[] = [];
const measured = new Map<StarterRecipe, Row[]>();
for (const rec of STARTER_RECIPES) {
  console.log(`\n=== ${rec.name} (${rec.weapon}, ${rec.grade}; ${rec.baseId}), offered ${rec.levels.from}–${rec.levels.to}, `
    + `stated ${rec.bases.from}–${rec.bases.to} bases: ${rec.slots.map((s) => s.words).join('; ')}`);
  const got = levelsOf(rec, LEVELS).map((level) => row(rec.name, rec, level, TIER_SLACK, frozen));
  measured.set(rec, got);
  rows += got.length;
  failures += got.filter((r) => !r.exact).length;
  const bases = got.flatMap((r) => r.bases ?? []);
  // The stated range holds every level, and is tight: the floor of the fewest and the ceiling of the most.
  const lo = Math.floor(Math.min(...bases));
  const hi = Math.ceil(Math.max(...bases));
  const stated = lo === rec.bases.from && hi === rec.bases.to;
  if (!stated) failures++;
  spreads.push(`${rec.name.padEnd(30)} ${rec.grade.padEnd(6)}  weights ${span(got.flatMap((r) => r.total ?? []), 1).padEnd(11)}  `
    + `bases ${span(bases, 2).padEnd(11)}  stated ${rec.bases.from}–${rec.bases.to}${stated ? '' : `  WRONG: the measured range is ${lo}–${hi}`}`);
}
console.log('\n--- per recipe, over its offered levels measured: weights, bases (exact), the stated range ---');
for (const l of spreads) console.log(l);
// A weapon's easy recipe has to be the one that uses fewer bases, at every level both are offered.
console.log('\n--- easy against better, by weapon ---');
for (const easy of STARTER_RECIPES.filter((r) => r.grade === 'easy')) {
  const better = STARTER_RECIPES.find((r) => r.weapon === easy.weapon && r.grade === 'better');
  if (!better) continue;
  const b = new Map(measured.get(better)!.map((r) => [r.level, r.bases]));
  const worse = measured.get(easy)!.filter((r) => b.has(r.level) && !((r.bases ?? Infinity) < (b.get(r.level) ?? -Infinity)));
  if (worse.length) failures += worse.length;
  console.log(`${easy.weapon.padEnd(14)} ${worse.length === 0 ? 'easy uses fewer bases at every shared level'
    : `easy NOT fewer at ${worse.map((r) => r.level).join(', ')}`}`);
}
console.log(failures === 0 ? `\nGATE PASSED: all ${rows} offered rows exact, stated ranges hold, easy fewer than better`
  : `\nGATE FAILED: ${failures} failures over ${rows} offered rows`);
process.exit(failures === 0 ? 0 : 1);
