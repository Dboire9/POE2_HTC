import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import type { MarkovProgress } from '../../packages/optimizer/src/markovFromItem.ts';
import {
  optimize, optimizeItem, optimizeItemMarkov, alternatives, listMods, routeFor, type ExistingItem,
} from './engine.ts';
import { mainLine } from './policyPath.ts';
import { listTablets, ruledOutBy, standIns, standInJunk } from './tablets.ts';
import { runSolve, toFraction, type SolveProgress, type SolveRequest } from './solve.ts';

// `runSolve` exists so a compute can cross a Worker boundary as a plain message. Its entire job is to
// dispatch to the same planner calls the UI used to make inline, so the thing worth testing is that it
// really is the same computation — a regrouping, not a rewrite. Everything else about the worker
// (postMessage plumbing, terminate-to-cancel) lives in files jsdom cannot exercise, which is exactly
// why the logic was pulled out to here.
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const mods = listMods(eng.data, 'Wands');
const p0 = mods.prefixes[0]!.id;
const s0 = mods.suffixes[0]!.id;

// The item must NOT already satisfy `targets`. It used to: the item held p0 and s0 and the targets
// were p0 and s0 at the same tier, so the start state was already the goal — and `markovFromItem` now
// short-circuits that in ~1 ms without building a state space (see its `isAccepting` guard). Every
// test below that needs a real solve — progress messages, sweep limits — was silently measuring the
// solver grinding through a lattice for a craft that was already finished, and passed only because
// that waste existed. Hold ONE of them and ask for both.
const item: ExistingItem = {
  baseId: 'Wands', level: 82, rarity: 'rare',
  prefixes: [{ modId: p0, tierDisplay: 99 }], suffixes: [],
};
const targets = [{ modId: p0, tierDisplay: 99 }, { modId: s0, tierDisplay: 99 }];

describe('runSolve — dispatches to the same planners the UI called inline', () => {
  it('lab from a white base matches optimize()', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets });
    expect(got.kind).toBe('lab');
    if (got.kind !== 'lab') return;
    expect(got.result).toEqual(optimize(eng, 'Wands', 82, targets));
    expect(got.alts).toBeNull(); // no budget ⇒ the near-miss question wasn't asked
  });

  it('lab from a carved item matches optimizeItem()', () => {
    const got = runSolve(eng, { kind: 'lab', from: { item }, targets });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.result).toEqual(optimizeItem(eng, item, targets));
  });

  /**
   * Socketed runes have to reach EVERY planner in a solve, exactly as `excluded` does: a frontier built
   * without them beside a model built with them would be two answers to different questions.
   *
   * Serle's Triumph is the visible case — four suffixes are refused outright without it — and it rides
   * in on the OPTIONS from white, where there is no item to carry it, and on the ITEM everywhere else.
   */
  /**
   * The Spirit Star Sceptre's craft: two Alloys, which need Astrid's Creativity, plus three rolled
   * modifiers to carry a white base up to Rare for them.
   *
   * Chosen over a four-suffix craft (Serle's Triumph, the other visible rune) because this one is small
   * enough to solve twice inside a test — the four-suffix lattice took 47 s here, which is a
   * measurement, not a check.
   */
  const twoAlloys = [
    'Sceptres/LocalIncreasedSpiritPercent', 'Sceptres/AlliesInPresenceAllResistances',
    'Sceptres/AlliesInPresenceAllDamage', 'Sceptres/PerfectEssence_MinionGainPuppetMasterOnCommand',
    'Sceptres/PerfectEssence_MaximumPuppeteerStacks',
  ].map((modId) => ({ modId, tierDisplay: 99 }));

  it('carries socketed runes to the from-white planners', () => {
    const runes = ['astrids-creativity'];
    const from = { baseId: 'Sceptres', level: 82 };
    const got = runSolve(eng, { kind: 'lab', from, targets: twoAlloys, runes });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.result).toEqual(optimize(eng, 'Sceptres', 82, twoAlloys, { runes }));
    // …and the same craft without the rune is a different answer: an item holds one crafted modifier.
    const bare = runSolve(eng, { kind: 'lab', from, targets: twoAlloys });
    if (bare.kind !== 'lab') throw new Error('wrong kind');
    expect(bare.result).not.toEqual(got.result);
    // ~17 s alone; over 60 s once the whole suite runs beside it (measured 62–69 s, 2026-09-23), so the
    // limit is set for the loaded machine — the same call craftedCap.test made.
  }, 300_000);

  it('carries them onto the item a from-item solve is handed', () => {
    const runes = ['astrids-creativity'];
    const got = runSolve(eng, { kind: 'item', item, targets, runes });
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.plan).toEqual(optimizeItem(eng, { ...item, runes }, targets));
  });

  // Declared timeout: the near-miss search runs a full Pareto solve per relaxed target, ~8s locally.
  // CI is slower than the 30s default allows for a test that is legitimately this expensive.
  it('lab with a budget also answers the near-miss question', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toEqual(alternatives(eng, 'Wands', 82, targets, 600));
  }, 60_000);

  // The UI passes '' when the budget box is empty and NaN can reach here from a half-typed number;
  // neither should be treated as "budget zero", which would claim nothing at all is affordable.
  it.each([undefined, 0, -5, NaN])('skips the budget search for %s', (budget) => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: budget as number });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toBeNull();
  });

  /**
   * The base price is the MDP's `restartCost`, and it is the number that decides whether "bin it and
   * roll another" beats repairing the item in hand. At 0 it beats nearly everything — measured at
   * 1,015 of 1,041 policy states choosing to start over — so a player for whom bases are NOT free was
   * getting advice built on someone else's economy. Two assertions, because the cost alone could move
   * for any number of reasons: the price has to reach the model AND change what it does.
   *
   * FROZEN prices, for the same reason the policy-iteration block below uses them: the claim is about
   * the SOLVER — that `restartCost` reaches the model and changes the policy — not about this week's
   * market. The second assertion counts "Start over" nodes in the returned graph, and that graph is
   * the visit-ranked closure, so its SHAPE moves with the sheet even when the model's behaviour has
   * not. A live refresh flipped the count 6/26 the wrong way on 2026-09-03 with no code change behind
   * it; the same run passed against the previous sheet.
   */
  it('charges the base price the player set, and stops binning items when it bites', () => {
    const frozenEng = { data: eng.data, prices: loadFrozenPrices() };
    const solveAt = (baseCost?: number) => {
      const got = runSolve(frozenEng, {
        kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets,
        ...(baseCost === undefined ? {} : { baseCost }),
      });
      if (got.kind !== 'lab') throw new Error('wrong kind');
      if (!got.markov.applicable || !got.markov.feasible) throw new Error('no model');
      return got.markov;
    };
    const free = solveAt(0);
    const dear = solveAt(50);
    expect(dear.expectedCost).toBeGreaterThan(free.expectedCost);
    const binning = (m: typeof free) =>
      m.nodes.filter((n) => n.action?.startsWith('Start over')).length;
    expect(binning(dear)).toBeLessThan(binning(free));
    // Omitted ⇒ WHITE_BASE_COST, which is 0 — so the default must agree with an explicit 0 rather
    // than quietly being some other number.
    expect(solveAt(undefined).expectedCost).toBeCloseTo(free.expectedCost, 6);
  }, 60_000);

  // A held item cannot be thrown away and re-bought, so the price must not reach that model at all.
  it('ignores a base price on a craft that starts from an item you hold', () => {
    const at = (baseCost: number) => {
      const got = runSolve(eng, { kind: 'lab', from: { item }, targets, baseCost });
      if (got.kind !== 'lab') throw new Error('wrong kind');
      return got.markov;
    };
    expect(at(50)).toEqual(at(0));
  });

  /**
   * Only a from-white Lab solve carries the solved policy. It is the one craft with an "instead" to
   * price — an item you buy against a white base — and the table is the whole lattice, so nothing else
   * pays to ship it. The echoed `restartCost` is what the Lab's "worth up to" is summed against, read
   * from the result because the Base cost field can change after the solve.
   */
  // Craft along follows the plan move by move on every tab, so every exact solve carries it — but only a
  // white base can start over, so only it carries a restart cost.
  it('carries the solved policy on every solve, and a restart cost only from a white base', () => {
    const white = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 7 });
    const carved = runSolve(eng, { kind: 'lab', from: { item }, targets });
    const held = runSolve(eng, { kind: 'item', item, targets });
    if (white.kind !== 'lab' || carved.kind !== 'lab' || held.kind !== 'item') throw new Error('wrong kind');
    expect(white.markov.restartCost).toBe(7);
    for (const m of [white.markov, carved.markov, held.markov]) expect(m.routes).toBeDefined();
    for (const m of [carved.markov, held.markov]) expect(m.restartCost).toBeUndefined();
  });

  it('draws the route from any starting item of a Lab result, ready for the graph', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 7 });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    const m = got.markov;
    const starts = m.holdings!.filter((h) => h.present.length === 1);
    expect(new Set(starts.map((h) => h.rarity))).toEqual(new Set(['magic', 'rare']));
    for (const h of starts) {
      const route = routeFor(eng, m, h.key)!;
      expect(route.expectedCost).toBe(h.cost);
      // `holdings[].present` is still a list of labels; a graph NODE's positions carry the side and
      // the asked tier besides, so the two are compared on the text they share.
      expect(route.nodes[0]!).toMatchObject({ isStart: true, rarity: h.rarity });
      expect(route.nodes[0]!.present.map((p) => p.text)).toEqual(h.present);
      // A route answers one question; the craft's table, rows and bare cost stay with the craft.
      expect(route.routes).toBeUndefined();
      expect(route.holdings).toBeUndefined();
      expect(route.restartCost).toBe(7);
      const fresh = route.nodes.filter((n) => n.isRestart);
      expect(fresh.length).toBeLessThanOrEqual(1);
      for (const n of fresh) expect(n.expectedCost).toBe(m.expectedCost);
    }
    expect(routeFor(eng, m, 'not-a-state')).toBeNull();
  });

  // "Play it out" on the gear tabs: the same solve, its plan then played on real items to a clock of its own
  // — seconds, which the bar has to show moving, under its own label, to the end.
  it('plays the plan out when asked, on both gear tabs, and only then', () => {
    const plain = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 7 });
    if (plain.kind !== 'lab') throw new Error('wrong kind');
    expect(plain.markov.replay).toBeUndefined();
    for (const req of [
      { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 7, playOut: true },
      { kind: 'item', item, targets, playOut: true },
    ] satisfies SolveRequest[]) {
      const seen: SolveProgress[] = [];
      const m = runSolve(eng, req, (p) => seen.push(p)).markov;
      const r = m.replay!;
      expect(r.runs).toBeGreaterThan(1_000);
      expect(r.seen).toEqual([]);
      expect(r.costPercentiles).toHaveLength(101);
      // The line-by-line bill adds up to what the crafts spent — restarts included, at the base price.
      expect(r.spendByMove.reduce((a, l) => a + l.spent, 0)).toBeCloseTo(r.meanCost, 6);
      expect(seen.filter((p) => p.phase === 'playout').length).toBeGreaterThan(1);
      for (let i = 1; i < seen.length; i++) expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
      expect(seen[seen.length - 1]).toEqual({ phase: 'playout', fraction: 1 });
      if (req.kind === 'lab') {
        expect(m.expectedCost).toBeCloseTo(plain.markov.expectedCost, 9);
        expect(r.spendByMove.find((l) => l.label === 'Start over with a new base')?.count).toBeGreaterThan(0);
      }
    }
  });

  it('item returns both the frontier and the MDP, matching the direct calls', () => {
    const got = runSolve(eng, { kind: 'item', item, targets });
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.plan).toEqual(optimizeItem(eng, item, targets));
    // With the solved policy kept, as the Item tab asks for it (Craft along reads it).
    expect(got.markov).toEqual(optimizeItemMarkov(eng, item, targets, { keepRoutes: true }));
  });

  // A progress callback must not perturb the answer — it is observation, not participation.
  it('produces identical results with and without a progress callback', () => {
    const quiet = runSolve(eng, { kind: 'item', item, targets });
    const noisy = runSolve(eng, { kind: 'item', item, targets }, () => {});
    expect(noisy).toEqual(quiet);
  });
});

describe('progress reporting', () => {
  it('advances monotonically and finishes at 1', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'item', item, targets }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(1);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
    expect(seen[0]!.fraction).toBe(0);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  });

  // The phases are weighted because they are nowhere near equal — but WHICH one dominates depends on
  // the craft, and the old weights were fitted to one of them. A 3-target craft spends ~89% building
  // actions (VI converges in tens of sweeps); a 5-target craft spends 0.2% there and ~99% in VI, which
  // never converges. Under the old 0.85 weight that second craft filled 85% of the bar in 54ms and
  // then crawled for 24 seconds. The assertion is on the ORDERING and the endpoints, plus the one
  // property that matters — no single phase owns most of the bar — rather than on fitted constants.
  it('weights the phases without letting any one of them own the bar', () => {
    const actions = toFraction({ phase: 'actions', done: 100, total: 100 });
    const compile = toFraction({ phase: 'compile', done: 100, total: 100 });
    expect(toFraction({ phase: 'actions', done: 0, total: 100 })).toBe(0);
    expect(actions).toBeGreaterThan(0);
    expect(compile).toBeGreaterThan(actions);
    expect(toFraction({ phase: 'solve', done: 1, total: 1 })).toBe(1);
    // Neither end of the bar may be a cliff: whichever phase turns out to dominate, there is room left.
    expect(actions).toBeLessThanOrEqual(0.5);
    expect(compile).toBeLessThanOrEqual(0.6);
  });

  it('never divides by zero when a phase has nothing to do', () => {
    for (const phase of ['actions', 'compile', 'solve'] as const) {
      const f = toFraction({ phase, done: 0, total: 0 } satisfies MarkovProgress);
      expect(Number.isFinite(f)).toBe(true);
    }
  });

  // A lab compute WITH a budget is slow — the budget search visits up to 200 nodes, each a full Pareto
  // run (~7.3s at 6 targets) — but it used to report nothing at all, so the bar sat at 0% for the whole
  // wait while only the elapsed counter moved. It now follows the node count.
  it('reports progress through the budget search, which is the slow half of a lab compute', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(1);
    expect(seen.some((p) => p.phase === 'alternatives')).toBe(true);
    // Monotone ACROSS phases too — planning must hand over to the search without the bar going back.
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
    expect(seen[0]!.fraction).toBeLessThan(0.2);
    // …and it must finish AT the top. The node cap is a ceiling, not a forecast, so a search that
    // stops early (196 of 200 is typical) would otherwise strand the bar just short of done.
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  });

  // REGRESSION. A from-scratch compute with no budget reported nothing at all — the bar sat at 0%
  // while the elapsed counter ticked. Both of its phases report now: the step planner, then the
  // true-cost model, which is the slow one when there is no budget search to follow.
  it('reports through both phases of a lab compute with no budget', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.some((p) => p.phase === 'plan')).toBe(true);
    // The model's own phases — a bar that went quiet through them is what this test exists to stop.
    expect(seen.some((p) => p.phase === 'actions' || p.phase === 'solve')).toBe(true);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
  });

  // With a budget, planning is ~1% of the wall clock (64ms against 7.3s at 6 targets), so it must not
  // eat the bar — otherwise the search that follows would have almost none of it left.
  it('keeps planning to a thin slice when a budget search follows it', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 }, (p) => seen.push(p));
    const planned = seen.filter((p) => p.phase === 'plan');
    expect(planned.length).toBeGreaterThan(0);
    for (const p of planned) expect(p.fraction).toBeLessThanOrEqual(0.1);
  });

  // A watch list adds a replay that runs to its own ~2s clock after a model that, on a tablet, is done in
  // ~30ms. It reported nothing, so the bar sat full through the whole replay — which reads as hung.
  it('reports through the replay a watch list adds, and gives it most of the bar', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, {
      kind: 'lab', from: { baseId: 'Tablets_ritual', level: 100 }, baseCost: 1,
      targets: [{ modId: 'Tablets/MapDroppedGoldIncrease', tierDisplay: 1 }],
      watch: [['Tablets/MapAdditionalModifier']],
    }, (p) => seen.push(p));
    const replayed = seen.filter((p) => p.phase === 'replay');
    expect(replayed.length).toBeGreaterThan(10);
    for (const p of seen.filter((q) => q.phase === 'actions' || q.phase === 'compile' || q.phase === 'solve')) {
      expect(p.fraction).toBeLessThanOrEqual(0.4);
    }
    expect(replayed[0]!.fraction).toBeLessThan(0.5);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
    // …and it ends on the replay's own label, not by jumping back to the model's.
    expect(seen[seen.length - 1]).toEqual({ phase: 'replay', fraction: 1 });
  });

  it('leaves the budget search results unchanged when a progress callback is attached', () => {
    const req = { kind: 'lab' as const, from: { baseId: 'Wands', level: 82 }, targets, budget: 600 };
    expect(runSolve(eng, req, () => {})).toEqual(runSolve(eng, req));
  });
});

/**
 * The Search-effort setting has to REACH the solver, and this is the only test that can tell.
 *
 * `maxIters` was a hardcoded 100,000 the ladder could not touch, so on a craft that exhausts its
 * sweeps the clock never bound and "Patient — several minutes" bought exactly nothing. Asserting the
 * preset table alone cannot catch that: a preset can carry a perfectly good number that no one passes
 * on. Deleting the one line in `runSolve` that threads it left every other test green.
 *
 * So this test is behavioural. One sweep cannot converge anything; a full budget converges this
 * craft. If the wiring goes, the two runs stop differing and the test fails.
 */
/**
 * TODO 20: with a bone priced, a from-white craft is solved without bones first and that plan seeds the
 * solve with them (markovBoneFree.ts). The frozen sheet prices a Wand's bone; three Wand targets a tier
 * below the top. How much faster that is, and which crafts it rescues at Standard, is a measurement
 * (docs/validation.md): a sweep window that separated the two solves here closed when the junk-family
 * correction (TODO 23) changed how fast both converge, so this pins what the page shows instead.
 */
describe('a from-white craft with a bone priced', () => {
  const frozen = { data: eng.data, prices: loadFrozenPrices() };
  const wand = eng.data.bases.get('Wands')!.pools.normal;
  const three = [wand.prefixes[0]!, wand.prefixes[1]!, wand.suffixes[0]!].map((modId) => ({ modId, tierDisplay: 2 }));
  const capped = { maxMillis: 60_000, maxNodes: 100, maxSweeps: 100_000, solver: 'policy' as const };
  const white = { baseId: 'Wands', level: 82, rarity: 'normal' as const, prefixes: [], suffixes: [] };

  it('is solved without bones first, and reaches the two-phase solve’s exact answer', () => {
    const alone = optimizeItemMarkov(frozen, white, three, { restartCost: 0, solver: 'policy' });
    expect(alone).toMatchObject({ feasible: true, bound: 'exact' });

    const seen: SolveProgress[] = [];
    const got = runSolve(frozen, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets: three, effort: capped }, (p) => seen.push(p));
    expect(got.markov).toMatchObject({ applicable: true, feasible: true, bound: 'exact' });
    expect(got.markov.withoutBones).toBeUndefined();
    expect(got.markov.expectedCost).toBeCloseTo(alone.expectedCost, 6);
    // The bar: the solve without bones under its own label, then the one with them, never backwards.
    const labels = seen.map((p) => p.phase);
    expect(labels.indexOf('withoutBones')).toBeGreaterThan(-1);
    expect(labels.lastIndexOf('withoutBones')).toBeLessThan(labels.lastIndexOf('solve'));
    for (let i = 1; i < seen.length; i++) expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    expect(seen[seen.length - 1]).toEqual({ phase: 'solve', fraction: 1 });
  });

  it('keeps an item held to one solve of its own', () => {
    const seen: SolveProgress[] = [];
    const carved = runSolve(frozen, { kind: 'lab', from: { item: { ...item, prefixes: [] } }, targets: three, effort: capped }, (p) => seen.push(p));
    expect(carved.markov.withoutBones).toBeUndefined();
    expect(seen.some((p) => p.phase === 'withoutBones')).toBe(false);
  });
});

describe('Search effort reaches value iteration, not just the preset table', () => {
  const generous = { maxMillis: 60_000, maxNodes: 200 };
  const run = (maxSweeps: number) =>
    runSolve(eng, { kind: 'item', item, targets, effort: { ...generous, maxSweeps } });

  it('a one-sweep budget cannot converge', () => {
    const got = run(1);
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.markov?.converged).toBe(false);
  });

  it('a full budget does', () => {
    const got = run(100_000);
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.markov?.converged).toBe(true);
  });
});

/**
 * The whole point of putting policy iteration on every rung, asserted end to end through `runSolve`.
 *
 * Value iteration stops on a residual TOLERANCE, so when it runs out the app can only say "at most x".
 * Policy iteration stops on a CERTIFICATE — the policy stopped changing, so no action anywhere improves
 * on it — and returns the exact cost. Measured across 18 crafts, PI produced a ceiling zero times.
 *
 * Bounded by SWEEPS rather than by the clock, deliberately: a wall-clock cap would make this flaky by
 * construction, green on a slow machine and red on a fast one. Sweep counts are deterministic.
 */
/**
 * A planner that DECLINES a craft must not take the other planner's answer with it.
 *
 * `markovOrReason` has always protected the frontier from a model failure. Nothing protected the
 * reverse until it became reachable: the step planner throws on a lone essence-only target ("needs a
 * Magic item first — include at least one rollable mod"), and the MDP learned to buy an Essence on
 * 2026-08-28 — so from that day the app was throwing away an answer it had.
 */
describe('a planner that declines does not delete the other one', () => {
  const essenceOnly = (): SolveRequest => {
    const wands = listMods(eng.data, 'Wands');
    const ess = [...wands.prefixes, ...wands.suffixes].find((m) => m.source === 'essence')!;
    return {
      kind: 'lab', from: { baseId: 'Wands', level: 82 },
      targets: [{ modId: ess.id, tierDisplay: 99 }],
    };
  };

  it('a lone essence target still returns the model’s answer', () => {
    const got = runSolve(eng, essenceOnly());
    if (got.kind !== 'lab') throw new Error('wrong kind');
    // The step planner refused the shape…
    expect(got.result.frontier).toEqual([]);
    expect(got.result.reason).toMatch(/step planner can.t lay out this craft/i);
    expect(got.result.reason).toMatch(/rollable mod/i); // …carrying its OWN sentence, not a generic one
    // …and the model answered anyway, which is the whole point.
    expect(got.markov?.feasible).toBe(true);
    expect(got.markov.expectedCost).toBeGreaterThan(0);
    expect(Number.isFinite(got.markov.expectedCost)).toBe(true);
  }, 120_000);

  it('leaves a craft both planners CAN do completely untouched', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.result.frontier.length).toBeGreaterThan(0);
    expect(got.result.reason).toBeUndefined(); // no reason means nothing was caught
  });

  /**
   * The budgeted path survives too.
   *
   * The near-miss search runs the SAME planner per relaxed target, so it can throw the same way — but
   * it does not on THIS input, and the test says so rather than pretending otherwise: relaxing a
   * one-target craft produces sub-crafts that never hit the lone-essence guard. Its catch in
   * `runSolve` is therefore defensive, reachable only when every relaxation still leaves an
   * essence-only target standing alone. What this pins is the property that matters either way — a
   * budget must not turn a working compute into a thrown one.
   */
  it('survives the budgeted path too', () => {
    const got = runSolve(eng, { ...essenceOnly(), budget: 600 } as SolveRequest);
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.markov?.feasible).toBe(true);
    expect(got.result.reason).toMatch(/step planner can.t lay out this craft/i);
  }, 120_000);
});

describe('policy iteration answers where value iteration can only bound', () => {
  // FROZEN prices for this block alone. The claim is about the SOLVERS — that policy iteration is
  // exact where value iteration can only bound, at the same sweep budget — but whether a given craft
  // is hard enough to separate them depends on what the orbs cost, and the sheet now refreshes daily.
  // On 2026-09-02 the omens went live from poe.ninja's Ritual feed and this craft became easy enough
  // that VI settled it too, so the test failed while asserting something still true of the solvers.
  // Everything else in this file keeps reading the shipped sheet.
  //
  // Desecration excluded for the same reason. Until 2026-09-10 a price gate kept bones off this ring
  // (the collarbone is 7.69ex on this sheet, over three Exalts); bones now compete at any price, and
  // with them the craft is easy enough to settle inside 2,000 sweeps, so "too small for either" had
  // nothing left to refuse. Excluding them is the lattice these numbers were measured on.
  const frozen = { data: eng.data, prices: loadFrozenPrices() };
  const ring = {
    kind: 'lab', from: { baseId: 'Rings', level: 82 }, excluded: ['desecrate'],
    targets: [
      { modId: 'Rings/IncreasedLife', tierDisplay: 99 }, { modId: 'Rings/IncreasedMana', tierDisplay: 99 },
      { modId: 'Rings/ColdResistance', tierDisplay: 99 }, { modId: 'Rings/ChaosResistance', tierDisplay: 99 },
    ],
  } as const;
  const solve = (maxSweeps: number, solver: 'value' | 'policy') => {
    const got = runSolve(frozen, {
      ...ring, effort: { maxMillis: 120_000, maxNodes: 200, maxSweeps, solver },
    });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    return got.markov;
  };

  it('turns a ceiling into an exact answer at the same budget', () => {
    const vi = solve(5_000, 'value');
    const pi = solve(5_000, 'policy');
    expect(vi.bound).toBe('upper');   // ≤ 8,906 — an honest ceiling, and 11x the truth
    expect(pi.bound).toBe('exact');   // 781.82
    // A from-white solve truncates DOWNWARD, so VI's ceiling must sit above the exact cost. If this
    // ever inverts, the bound is being read the wrong way round somewhere.
    expect(vi.expectedCost).toBeGreaterThan(pi.expectedCost);
  }, 60_000);

  /**
   * …and it cannot turn a number into a refusal, which is what makes the swap safe rather than merely
   * better on average.
   *
   * "No number" comes from PHASE A failing, and phase A is plain value iteration on both paths —
   * `markovFromItem` returns `fail(...)` before it reads the solver choice. So a budget too small for
   * phase A must refuse identically under both, and this craft at 2,000 sweeps is exactly that budget.
   */
  it('refuses identically when the budget is too small for either', () => {
    expect(solve(2_000, 'value').feasible).toBe(false);
    expect(solve(2_000, 'policy').feasible).toBe(false);
  }, 60_000);
});

/**
 * A tablet's lattice is a few hundred states, so the Tablets tab asks for `smallLattice`: policy
 * iteration from the heuristic seed, each policy costed by solving its chain outright. Its rarest
 * four-modifier crafts never settled otherwise — at Standard the sweeps ran out in ~1.5 s, and even
 * at Exhaustive's 20,000,000 they "settled" short of the answer, so policy iteration flipped between
 * two plans for good (598M ↔ 324M ex, Ritual's four rarest).
 */
describe('smallLattice — a tablet solved the sure way', () => {
  const tablet = (mods: string[], smallLattice: boolean) => runSolve(eng, {
    kind: 'lab', from: { baseId: 'Tablets_ritual', level: 100 },
    targets: mods.map((m) => ({ modId: `Tablets/${m}`, tierDisplay: 1 })), baseCost: 100, fillOnFinish: true,
    effort: { maxMillis: 15_000, maxNodes: 200, maxSweeps: 100_000, solver: 'policy' }, excluded: ['annul'], smallLattice,
  });
  const cost = (r: ReturnType<typeof runSolve>) => (r.kind === 'lab' ? r.markov : undefined)!;

  it('gives the same cost where the usual solve already settles', () => {
    const mods = ['MapMonsterEffectiveness', 'MapDroppedItemRarityIncrease', 'RitualTributeIncrease', 'RitualRerollCostIncrease'];
    const usual = cost(tablet(mods, false));
    const sure = cost(tablet(mods, true));
    expect(usual.bound).toBe('exact');
    expect(sure.bound).toBe('exact');
    expect(Math.abs(sure.expectedCost - usual.expectedCost) / usual.expectedCost).toBeLessThan(1e-6);
  });

  it('draws the route the way the crafts that finish go — the Chaos included', () => {
    // Reported 2026-09-23: "we say fresh tablets + chaos, but there we only have trans and regal". The
    // line followed only outcomes that moved strictly closer, and from a plain tablet the one such
    // outcome is the 0.3% Transmute that lands the reroll outright — never the Chaos.
    const r = runSolve(eng, {
      kind: 'lab', from: { baseId: 'Tablets_ritual', level: 100 },
      targets: [{ modId: 'Tablets/RitualAdditionalReroll', tierDisplay: 1 }], baseCost: 130,
      spare: { prefixes: 2, suffixes: 1 }, fillOnFinish: true, excluded: ['annul'], smallLattice: true,
    });
    const steps = mainLine(cost(r)).steps;
    // Since the junk-family correction (TODO 23, 2026-09-24) the Chaos trades the junk suffix for a
    // junk PREFIX — clearing the suffix side, its family out of the pool — and an Exalt then lands the
    // reroll. The line still shows the Chaos the report asked about.
    expect(steps.map((s) => s.action.split(' ')[0])).toEqual(['Transmute', 'Regal', 'Chaos', 'Exalt']);
    const chaos = steps[2]!;
    expect(chaos.changes.junk).toEqual({ prefixes: 1, suffixes: -1 });
    expect(chaos.repeats).toBeGreaterThan(0.4); // a junk suffix for a junk suffix: play it again
    expect(steps[3]!.changes.gained).toEqual(['Ritual Altars in Map allow rerolling Favours # additional times']);
    // The Regal on the way can land it too, and says so.
    expect(steps[1]!.lands).toBeGreaterThan(0.003);
  });

  /**
   * Magic tablets someone already rolled, priced off the solve. Fishing a Ritual reroll (a suffix), one
   * holding only a prefix is worth about a plain one — a Transmute lands a prefix half the time anyway —
   * and one holding only a suffix about half. For a Temple Rare Monsters + Crystal pair (one of each side)
   * both are worth ~0.84 plain ones (2026-09-23).
   */
  it('prices a Magic tablet already rolled against a plain one, from the solve itself', () => {
    const worth = (base: string, mods: string[], spare: { prefixes: number; suffixes: number }, plain: number) => {
      const m = cost(runSolve(eng, {
        kind: 'lab', from: { baseId: base, level: 100 }, targets: mods.map((modId) => ({ modId, tierDisplay: 1 })),
        baseCost: plain, spare, fillOnFinish: true, excluded: ['annul'], smallLattice: true,
      }));
      const at = new Map(m.routes!.keys.map((k, i) => [k as string, i]));
      const list = standIns((k) => { const i = at.get(k); return i === undefined ? undefined : m.routes!.value[i]; }, m.expectedCost, plain);
      expect(list.map((x) => x.side)).toEqual(['prefix', 'suffix']);
      return (side: 'prefix' | 'suffix') => list.find((x) => x.side === side)!.worth / plain;
    };
    const reroll = worth('Tablets_ritual', ['Tablets/RitualAdditionalReroll'], { prefixes: 2, suffixes: 1 }, 130);
    expect(reroll('prefix')).toBeGreaterThan(0.9);
    expect(reroll('prefix')).toBeLessThan(1.1);
    expect(reroll('suffix')).toBeLessThan(0.7);
    const pair = worth('Tablets_temple', ['Tablets/MapRarePackIncrease', 'Tablets/IncursionTokenChance'], { prefixes: 1, suffixes: 1 }, 442);
    expect(pair('prefix')).toBeCloseTo(0.84, 1);
    expect(pair('suffix')).toBeCloseTo(0.84, 1);
  });

  /**
   * Planning from a Magic tablet off the market, bought again on every start over (`rebuyable`). Priced
   * at exactly what the tip says it is worth against a plain tablet, the craft from it costs exactly what
   * the craft from plain tablets does — the tip's worth and this plan are the same arithmetic, both ways.
   */
  it('plans from a Magic tablet bought again on each start over, agreeing with what it is worth', () => {
    const t = listTablets(eng.data).find((x) => x.id === 'Tablets_ritual')!;
    const chosen = ['Tablets/RitualAdditionalReroll'];
    const base = {
      kind: 'lab' as const, targets: chosen.map((modId) => ({ modId, tierDisplay: 1 })), spare: { prefixes: 2, suffixes: 1 },
      fillOnFinish: true, excluded: ['annul'], smallLattice: true,
    };
    const plain = cost(runSolve(eng, { ...base, from: { baseId: t.id, level: 100 }, baseCost: 130 }));
    const at = new Map(plain.routes!.keys.map((k, i) => [k as string, i]));
    for (const w of standIns((k) => { const i = at.get(k); return i === undefined ? undefined : plain.routes!.value[i]; }, plain.expectedCost, 130)) {
      const junk = standInJunk(t, chosen, ruledOutBy(eng.data, chosen), w.side)!;
      expect(chosen).not.toContain(junk);
      const magic = cost(runSolve(eng, {
        ...base, baseCost: w.worth, rebuyable: true,
        from: { item: { baseId: t.id, level: 100, rarity: 'magic',
          prefixes: w.side === 'prefix' ? [{ modId: junk, tierDisplay: 1 }] : [], suffixes: w.side === 'suffix' ? [{ modId: junk, tierDisplay: 1 }] : [] } },
      }));
      expect(magic.bound).toBe('exact');
      expect(magic.restartCost).toBe(w.worth); // a start over buys another Magic one
      // Equal up to the solver's own accuracy, which is RELATIVE (~1e-3 by contract, `MarkovOptions.tolerance`)
      // and set by the sheet's cheapest orb — so an absolute 0.005 ex on a ~10,000 ex craft (5e-7) passed
      // only while the sheet happened to allow it, and failed the price bot on 2026-09-26 at 1.7e-6 when
      // the Transmute halved. 1e-4 is still ten times inside the contract; a wrong start-over price misses
      // by whole exalts.
      expect(Math.abs((w.worth + magic.expectedCost) / (130 + plain.expectedCost) - 1)).toBeLessThan(1e-4);
    }
  });

  it('solves the rarest four the usual solve cannot put a number on', () => {
    const rarest = ['MapAdditionalExile', 'MapAdditionalStoneCircle', 'MapAdditionalModifier', 'MapAdditionalUniqueMonsterModifier'];
    expect(cost(tablet(rarest, false)).feasible).toBe(false);
    const sure = cost(tablet(rarest, true));
    expect(sure.feasible).toBe(true);
    expect(sure.bound).toBe('exact');
    // Hundreds of millions of exalts: ~1 roll in 150 × 1 in 70 × 1 in 200 × 1 in 150 a side, rerolled.
    expect(sure.expectedCost).toBeGreaterThan(1e8);
  });
});

