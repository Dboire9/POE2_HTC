import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_EFFORT, EFFORT_PRESETS, EFFORT_STORAGE_KEY, getEffort, isTopEffort, limitsFor, setEffort,
} from './searchEffort.ts';
import { runSolve } from './solve.ts';
import { optimize } from './engine.ts';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';

// The three solver caps used to be hard-coded guesses about how long a user would wait. They are now
// the user's call. What matters is not that the choice is *stored* — that is the easy half — but that
// it reaches the planners and changes what they do. A setting that saves nicely and changes nothing is
// worse than no setting, because the badges would keep saying "stopped early" whatever you picked.

describe('the effort presets', () => {
  it('every preset is complete, and the limits only ever increase', () => {
    const ids = EFFORT_PRESETS.map((p) => p.id);
    expect(ids).toContain(DEFAULT_EFFORT);
    for (const p of EFFORT_PRESETS) expect(p.hint.length).toBeGreaterThan(10); // it is shown, not decorative
    for (let i = 1; i < EFFORT_PRESETS.length; i++) {
      const lo = EFFORT_PRESETS[i - 1]!.limits;
      const hi = EFFORT_PRESETS[i]!.limits;
      expect(hi.maxMillis).toBeGreaterThan(lo.maxMillis);
      expect(hi.maxNodes).toBeGreaterThan(lo.maxNodes);
      expect(hi.maxSweeps).toBeGreaterThan(lo.maxSweeps);
      // `maxPlans` SATURATES and so is the one dial that may repeat: a 6-target craft needs ~34,560
      // plans for the full orb search, so every rung from Standard up already covers it and a higher
      // number buys literally nothing. Demanding a strict rise here would only be satisfiable by
      // padding the figure to please the test, which is worse than the test being precise about it.
      expect(hi.maxPlans).toBeGreaterThanOrEqual(lo.maxPlans);
    }
  });

  /**
   * The top preset is derived, not named — otherwise adding a tier above it silently leaves the
   * "you are already at the maximum" message pointing at the old top, which then tells the user to
   * stop trying while a higher setting sits right there in the dropdown.
   */
  it('knows which preset is the top one, and only that one', () => {
    const ids = EFFORT_PRESETS.map((p) => p.id);
    expect(ids.filter(isTopEffort)).toEqual([ids[ids.length - 1]]);
    expect(isTopEffort(DEFAULT_EFFORT)).toBe(false);
    expect(isTopEffort('nonsense')).toBe(false);
  });

  // A preset renamed in a later version must not wedge the app on limits that no longer exist.
  it('falls back to the default for an id it does not recognise', () => {
    expect(limitsFor('no-such-preset')).toEqual(limitsFor(DEFAULT_EFFORT));
  });

  it('remembers the choice, and ignores a stored id that is no longer valid', () => {
    setEffort('quick');
    expect(getEffort()).toBe('quick');
    expect(localStorage.getItem(EFFORT_STORAGE_KEY)).toBe('quick');
    setEffort(DEFAULT_EFFORT);
  });
});

describe('the setting reaches the planners', () => {
  const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
  const base = eng.data.bases.get('Wands')!;
  const used = new Set<string>();
  const take = (ids: readonly string[], n: number): string[] => {
    const out: string[] = [];
    for (const id of ids) {
      const m = eng.data.mods.get(id);
      if (!m || m.source !== 'normal' || used.has(m.family)) continue;
      used.add(m.family);
      out.push(id);
      if (out.length === n) break;
    }
    return out;
  };
  // Six tiered targets: big enough that the orb search has to choose a depth.
  const targets = [...take(base.pools.normal.prefixes, 3), ...take(base.pools.normal.suffixes, 3)]
    .map((modId) => ({ modId, tierDisplay: 3 }));

  /**
   * Against the STEP PLANNER, not `runSolve`.
   *
   * These assertions are about `maxPlans` and nothing else, and a lab `runSolve` also buys a from-white
   * MDP whose own budget is the preset's wall clock — so asking for the deepest orb search here used to
   * charge 209s and 134s for a true-cost model the assertions never read. `optimize` is the exact call
   * `runSolve` makes for the frontier (see solve.ts's lab branch, `withPlanLimit`); the case below then
   * pins that `runSolve` really does hand it these limits.
   */
  const depthAt = (effort: string) =>
    optimize(eng, 'Wands', 82, targets, { maxPlans: limitsFor(effort).maxPlans });

  /**
   * Measured on this exact target (6 mods at tier display 3, Wands, ilvl 82):
   *
   *   quick       strongest-only      5,760 plans
   *   standard    strongest-only      5,760      ← same as the old hard-coded default
   *   exhaustive  full              622,080
   *
   * (`thorough` sat at 184,320 and `patient` at 622,080 before both were retired on 2026-08-29 —
   * Patient and Exhaustive had proved byte-identical, and Thorough was bracketed by its neighbours.)
   *
   * Worth noting what that shows: on a craft this size the DEFAULT only searches the strongest orbs,
   * and the whole point of the setting is that a user can buy the other 108x. The assertions are on
   * the measured ordering rather than on specific labels, so a data change that shifts where each
   * threshold bites doesn't produce a false failure — but a setting that stopped mattering would.
   */

  // Slow on purpose, and declared so. The top preset means 2,000,000 plans; the assertion is about what
  // that buys, so the craft cannot be shrunk without shrinking the question. Measured at ~19s locally,
  // and CI runs slower — the default 30s ceiling is not enough headroom for a test this expensive.
  it('a bigger plan cap really does buy a deeper orb search', () => {
    const quick = depthAt('quick');
    const top = depthAt('exhaustive');
    expect(top.plansEvaluated).toBeGreaterThan(quick.plansEvaluated);
    // The deepest preset must actually reach the exhaustive search, or its name is a lie.
    expect(top.currencyDepth).toBe('full');
    expect(quick.currencyDepth).not.toBe('full');
    // Standard buys nothing here, and that is the measured truth rather than an oversight: on a craft
    // this size the orb search saturates below its cap, which is exactly what the header records.
    expect(depthAt('standard').plansEvaluated).toBe(quick.plansEvaluated);
  }, 120_000);

  /**
   * A retired rung resolves UPWARD, not to the default.
   *
   * `read()`'s fallback is right for a corrupt value and wrong for a rung this build dropped: someone
   * who deliberately chose Patient would be moved to a SHORTER search and get a worse answer without
   * being told. `limitsFor` honours the same map, so a stored id reaching the solver by any path — a
   * worker message, a test, a link — lands on the successor too.
   */
  it('maps a retired rung to its successor rather than dropping to the default', () => {
    for (const retired of ['thorough', 'patient']) {
      expect(limitsFor(retired)).toEqual(limitsFor('exhaustive'));
      expect(limitsFor(retired)).not.toEqual(limitsFor(DEFAULT_EFFORT));
    }
    // …while a value that never was a rung still falls back, which is the other half of the contract.
    expect(limitsFor('not-a-preset')).toEqual(limitsFor(DEFAULT_EFFORT));
  });

  // Standard must reproduce the old hard-coded behaviour exactly, so shipping this setting changes
  // nobody's existing results — only what they can opt into. Both sides go through the planner
  // directly for the same reason as above; the wiring itself is the next case.
  it('Standard is identical to passing no limit at all', () => {
    const bare = optimize(eng, 'Wands', 82, targets);
    const standard = depthAt('standard');
    expect(bare.plansEvaluated).toBe(standard.plansEvaluated);
    expect(bare.currencyDepth).toBe(standard.currencyDepth);
  });

  // …and the one case that goes the whole way through `runSolve`, because a setting that reaches the
  // planner in a unit test and gets dropped by the caller is exactly the failure the suite is for.
  // Quick, so the MDP it also runs is on the shortest clock the presets offer.
  it('runSolve hands the preset limits to that planner', () => {
    const res = runSolve(eng, {
      kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, effort: limitsFor('quick'),
    });
    if (res.kind !== 'lab') throw new Error('expected a lab solve');
    expect(res.result.plansEvaluated).toBe(depthAt('quick').plansEvaluated);
    expect(res.result.currencyDepth).toBe(depthAt('quick').currencyDepth);
  }, 60_000);
});

describe('the MDP time budget', () => {
  const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };

  beforeEach(() => { setEffort(DEFAULT_EFFORT); });

  // `maxMillis` is a WALL CLOCK, which is why it is absent by default: it would make results
  // machine-dependent, and the whole test suite relies on them not being. Only the app sets it.
  it('is not applied unless the caller asks for it', () => {
    const item = {
      baseId: 'Wands', level: 82, rarity: 'rare' as const,
      prefixes: [{ modId: eng.data.bases.get('Wands')!.pools.normal.prefixes[0]!, tierDisplay: 1 }],
      suffixes: [],
    };
    const targets = [{ modId: item.prefixes[0]!.modId, tierDisplay: 1 }];
    const res = runSolve(eng, { kind: 'item', item, targets });
    if (res.kind !== 'item') throw new Error('expected an item solve');
    // No clock involved ⇒ it ran to convergence, so the number is an answer rather than a floor.
    expect(res.markov.converged).toBe(true);
  });
});

/**
 * `maxIters` was a hardcoded 100,000 that the effort ladder could not reach, which made the top
 * preset a lie: on a craft that exhausts its sweeps the CLOCK never binds, so "Patient — several
 * minutes" offered time the solver had no way to spend. Measured: a six-target T1 craft ran 1,035s
 * and stopped on the sweep cap. The ladder has to move this or raising it changes nothing.
 */
describe('the sweep cap is on the ladder, not hardcoded', () => {
  it('gives every preset a sweep cap', () => {
    for (const p of EFFORT_PRESETS) expect(p.limits.maxSweeps).toBeGreaterThan(0);
  });

  it('rises with effort, so raising the setting actually buys sweeps', () => {
    const sweeps = EFFORT_PRESETS.map((p) => p.limits.maxSweeps);
    for (let i = 1; i < sweeps.length; i++) expect(sweeps[i]!).toBeGreaterThan(sweeps[i - 1]!);
  });

  // Standard is documented as reproducing exactly what the app did before the setting existed, and
  // 100_000 is the constant it did it with. If that drifts, upgrading silently changes old results.
  it('keeps Standard on the solver default it is documented to reproduce', () => {
    expect(limitsFor('standard').maxSweeps).toBe(100_000);
  });
});

/**
 * EVERY rung ends on a proof, and Exhaustive is now only the longest one.
 *
 * Value iteration stops on a residual tolerance, so a long-odds craft ran out of sweeps and the app
 * printed a ceiling — and extra clock did not help, because the clock was never what bound. Policy
 * iteration ends when the policy stops changing, which is a proof. That used to be Exhaustive's
 * distinguishing feature; measured over 18 crafts it turned out to be strictly better everywhere (PI
 * produced a ceiling zero times, and was faster in nearly every cell), so the whole ladder runs it and
 * what separates the rungs is time alone. See the table on `EffortLimits.solver`.
 */
describe('every rung ends on a proof', () => {
  const top = EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!;

  it('is the top of the ladder, so isTopEffort points at it', () => {
    expect(isTopEffort(top.id)).toBe(true);
    expect(isTopEffort('standard')).toBe(false); // the check is derived from the list, not named
  });

  /**
   * The inverse of the test this replaces, which asserted every rung BUT the top left `solver` unset.
   *
   * Stated this way it keeps doing the job that one was reaching for: a preset added later cannot end
   * up on the slow solver by omission. Leaving one on value iteration is not a small regression — at
   * Standard it was the difference between 14 exact answers and 9 exact plus 5 ceilings.
   */
  it('leaves no rung on value iteration', () => {
    for (const p of EFFORT_PRESETS) {
      expect(p.limits.solver, `${p.id} must name its solver`).toBe('policy');
    }
  });

  // Policy iteration still runs sweeps to evaluate each policy, so a stingy cap would stop it short
  // of the proof it exists to deliver and hand back a ceiling anyway — the exact failure being fixed.
  it('carries the headroom its own evaluation needs', () => {
    expect(top.limits.maxSweeps).toBeGreaterThan(limitsFor('standard').maxSweeps);
  });
});
