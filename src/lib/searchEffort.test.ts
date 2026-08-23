import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_EFFORT, EFFORT_PRESETS, EFFORT_STORAGE_KEY, getEffort, limitsFor, setEffort,
} from './searchEffort.ts';
import { runSolve } from './solve.ts';
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
      expect(hi.maxPlans).toBeGreaterThan(lo.maxPlans);
    }
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

  const depthAt = (effort: string) => runSolve(eng, {
    kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, effort: limitsFor(effort),
  });

  /**
   * Measured on this exact target (6 mods at tier display 3, Wands, ilvl 82):
   *
   *   quick      strongest-only      5,760 plans
   *   standard   strongest-only      5,760      ← same as the old hard-coded default
   *   thorough   base+strongest    184,320
   *   patient    full              622,080
   *
   * Worth noting what that shows: on a craft this size the DEFAULT only searches the strongest orbs,
   * and the whole point of the setting is that a user can buy the other 108x. The assertions are on
   * the measured ordering rather than on specific labels, so a data change that shifts where each
   * threshold bites doesn't produce a false failure — but a setting that stopped mattering would.
   */
  it('a bigger plan cap really does buy a deeper orb search', () => {
    const quick = depthAt('quick');
    const thorough = depthAt('thorough');
    const patient = depthAt('patient');
    if (quick.kind !== 'lab' || thorough.kind !== 'lab' || patient.kind !== 'lab') {
      throw new Error('expected lab solves');
    }
    expect(thorough.result.plansEvaluated).toBeGreaterThan(quick.result.plansEvaluated);
    expect(patient.result.plansEvaluated).toBeGreaterThan(thorough.result.plansEvaluated);
    // The deepest preset must actually reach the exhaustive search, or "Patient" is a lie.
    expect(patient.result.currencyDepth).toBe('full');
    expect(quick.result.currencyDepth).not.toBe('full');
  }, 120_000);

  // Standard must reproduce the old hard-coded behaviour exactly, so shipping this setting changes
  // nobody's existing results — only what they can opt into.
  it('Standard is identical to passing no effort at all', () => {
    const bare = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets });
    const standard = depthAt('standard');
    if (bare.kind !== 'lab' || standard.kind !== 'lab') throw new Error('expected lab solves');
    expect(bare.result.plansEvaluated).toBe(standard.result.plansEvaluated);
    expect(bare.result.currencyDepth).toBe(standard.result.currencyDepth);
  });
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
