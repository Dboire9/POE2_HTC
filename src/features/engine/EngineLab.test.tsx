import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EngineMod, EngineResult } from '../../lib/engine';

// EngineLab holds all the target-picker RULES (family / one-essence / one-desecrated locks, the
// fracture toggle, the essence↔fracture conflict, reset, compute routing). Those live only in the
// component, so we drive the real component against a MOCKED facade with a tiny controlled mod set —
// the facade itself is tested separately in engine.test.ts. This isolates the interaction logic.

const tier = (display: number) => ({ display, name: `t${display}`, ilvl: 1, label: `T${display}`, range: '10–20' });
const mod = (
  id: string, text: string, type: 'prefix' | 'suffix', source: EngineMod['source'], family: string, tiers = 3,
): EngineMod => ({ id, text, type, family, source, tiers: Array.from({ length: tiers }, (_, i) => tier(i + 1)) });

// Two normal prefixes SHARING a family (siblings), two essence prefixes, a normal suffix, two desecrated
// suffixes — enough to exercise every "at most one / family exclusion" rule.
const NP = mod('np', 'Normal Prefix', 'prefix', 'normal', 'FamA');
const NP2 = mod('np2', 'Sibling Prefix', 'prefix', 'normal', 'FamA'); // same family as NP
const EP = mod('ep', 'Essence Prefix', 'prefix', 'essence', 'FamE');
const EP2 = mod('ep2', 'Essence Prefix Two', 'prefix', 'essence', 'FamE2');
const NS = mod('ns', 'Normal Suffix', 'suffix', 'normal', 'FamS');
const DS = mod('ds', 'Desecrated Suffix', 'suffix', 'desecrated', 'FamD', 1);
const DS2 = mod('ds2', 'Desecrated Suffix Two', 'suffix', 'desecrated', 'FamD2', 1);

const okFrontier: EngineResult = {
  frontier: [{ probability: 0.5, expected: 2, perAttempt: 1, expectedAttempts: 2, steps: [] }],
  plansEvaluated: 1, assumedOdds: false,
};

const mocks = vi.hoisted(() => ({
  optimize: vi.fn(),
  optimizeItem: vi.fn(),
  alternatives: vi.fn(),
  alternativesForItem: vi.fn(),
  // Unmocked, this ran the REAL model against the `{} as never` data below, threw, and (until the
  // solve was made resilient) took the whole lab result down with it — the frontier included.
  optimizeItemMarkov: vi.fn(),
}));

vi.mock('../../lib/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/engine')>();
  return {
    ...actual,
    loadEngine: () => Promise.resolve({ data: {} as never, prices: { currency: {}, omens: {} } as never }),
    listBases: () => [{ id: 'Wands', name: 'Wands', category: 'weapon' }],
    listMods: () => ({ prefixes: [NP, NP2, EP, EP2], suffixes: [NS] }),
    listDesecrated: () => [DS, DS2],
    // Needed once ItemActions renders here (see the tab-switch regression below): it calls these on
    // mount, and the stub `data` above has no real pools for the actual implementations to read.
    listPerfectEssences: () => [],
    currencyActions: () => [],
    optimize: mocks.optimize,
    optimizeItem: mocks.optimizeItem,
    alternatives: mocks.alternatives,
    alternativesForItem: mocks.alternativesForItem,
    optimizeItemMarkov: mocks.optimizeItemMarkov,
  };
});

// eslint-disable-next-line import/first
import EngineLab from './EngineLab';
// eslint-disable-next-line import/first
import { DEFAULT_EFFORT, EFFORT_PRESETS, setEffort } from '../../lib/searchEffort';

/** The picker row for a mod's text (the row div holding its "+"), from within the mod-picker card. */
const pickerRow = (text: string): HTMLElement => screen.getByText(text).closest('div') as HTMLElement;
const addButton = (text: string): HTMLElement => within(pickerRow(text)).getByRole('button');

async function loaded() {
  render(<EngineLab />);
  // Wait for loadEngine().then to resolve and the picker to appear.
  await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
}

/** A true-cost answer for a lab craft: two steps from a white base to the target. */
const labMarkov = {
  applicable: true, feasible: true, expectedCost: 43.2, converged: true, bound: 'exact', assumedOdds: false,
  nodes: [
    { key: 'w', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'normal' as const,
      isStart: true, isGoal: false, depth: 4, expectedCost: 43.2, visitRate: 1, action: 'Transmute (Greater)' },
    { key: 'm', present: ['Normal Prefix'], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'magic' as const,
      isStart: false, isGoal: false, depth: 3, expectedCost: 40, visitRate: 1, action: 'Regal' },
    { key: 'g', present: ['Normal Prefix', 'Normal Suffix'], blocked: [], junkPrefixes: 0, junkSuffixes: 0,
      rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0 },
  ],
  edges: [
    { from: 'w', to: 'm', action: 'Transmute (Greater)', prob: 0.06, regress: false },
    { from: 'm', to: 'g', action: 'Regal', prob: 0.04, regress: false },
  ],
};

beforeEach(() => {
  // RESET, not just re-stub: `mockReturnValue` leaves the call history intact, so `optimize` and
  // `optimizeItem` were accumulating calls across tests. The routing test below counts calls, and
  // passed only while it was the only test that computed — any new test that computes broke it.
  mocks.optimize.mockReset().mockReturnValue(okFrontier);
  mocks.optimizeItem.mockReset().mockReturnValue(okFrontier);
  mocks.alternatives.mockReset();
  mocks.alternativesForItem.mockReset();
  mocks.optimizeItemMarkov.mockReset().mockReturnValue(labMarkov);
  // The effort preset lives in a module-level store backed by localStorage, so a test that changes it
  // leaks into every test after it — and the one that does change it turns off the "raise Search
  // effort" advice the tests above assert on.
  setEffort(DEFAULT_EFFORT);
});

describe('EngineLab — loads and lists', () => {
  it('renders the base and its mods once the engine resolves', async () => {
    await loaded();
    expect(screen.getByText('Normal Prefix')).toBeInTheDocument();
    expect(screen.getByText('Desecrated Suffix')).toBeInTheDocument();
  });
});

describe('EngineLab — target picker rules', () => {
  it('adds a mod to the target and updates the count', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.getByText(/Target item \(1 mod\)/)).toBeInTheDocument();
  });

  it('family exclusion: adding a mod disables its same-family sibling in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    expect(addButton('Sibling Prefix')).not.toBeDisabled();
    await user.click(addButton('Normal Prefix'));
    expect(addButton('Sibling Prefix')).toBeDisabled(); // FamA already claimed
  });

  it('at most one essence-only mod: a second essence disables in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Essence Prefix'));
    expect(addButton('Essence Prefix Two')).toBeDisabled();
  });

  it('at most one desecrated mod: a second desecrated disables in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Desecrated Suffix'));
    expect(addButton('Desecrated Suffix Two')).toBeDisabled();
  });
});

describe('EngineLab — fracture toggle', () => {
  it('marks a normal target fractured and shows the badge', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    // The target row now has a 🔓 toggle; click it to fracture.
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    expect(screen.getByText('fractured')).toBeInTheDocument();
  });
});

describe('EngineLab — essence ↔ fracture are mutually exclusive', () => {
  it('a fractured mod present blocks adding an essence in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    // Now fractured ⇒ essence mods can't be added.
    expect(addButton('Essence Prefix')).toBeDisabled();
  });

  it('an essence present disables the fracture lock on a normal target', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(addButton('Essence Prefix'));
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    // The lock is disabled (can't fracture while an essence is in the craft).
    expect(within(targetRow).getByTitle(/Can’t fracture with an essence/i)).toBeDisabled();
  });
});

// REGRESSION. `EngineLab` renders the item tab as `mode === 'item' ? <ItemActions/> : (…)`, so
// switching tabs UNMOUNTS a component — and while each tab kept its work in local `useState`, that
// work was destroyed. For a 6-mod item that is roughly 15 searches and clicks, gone by accident. The
// state now lives in the shared workspace store, so unmounting costs nothing.
// A desecrated target from scratch can't be planned with fewer than three rollable mods: a Desecration
// needs a Rare, and the item only gets there via transmute → augment → regal, which the planner can
// only spend on mods you asked for. The generic empty-state blamed "a target tier gated above the item
// level" instead, which is a plausible but WRONG explanation — worse than no explanation, because it
// sends you to change the tier.
// The hint must ALSO not claim the craft is impossible in game: rolling throwaway mods, annulling them
// off (rarity survives an annul) and then Desecrating is a legal route the planner simply doesn't
// search. Saying otherwise would send a player away from a craft that works.
describe('EngineLab — the empty state gives the real reason', () => {
  it('explains the Rare prerequisite for a lone desecrated target', async () => {
    const user = userEvent.setup();
    mocks.optimize.mockReturnValue({ ...okFrontier, frontier: [] });
    await loaded();
    await user.click(addButton('Desecrated Suffix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));

    // A phrase unique to the empty state: "a Desecration needs a Rare" also appears in the picker's
    // explainer above, so matching that would pass before the solve had even finished.
    expect(await screen.findByText(/nothing to spend those three on/i)).toBeInTheDocument();
    // …and must NOT offer the misleading tier/ilvl advice for this case.
    expect(screen.queryByText(/gated above the item level/i)).toBeNull();
    // …and must own this as a planner limit, not tell the player the craft can't be done.
    expect(screen.getByText(/In game you can still do this/i)).toBeInTheDocument();
  });
});

describe('EngineLab — work survives a tab switch', () => {
  // It is ITEMACTIONS that gets unmounted — EngineLab stays mounted the whole time, rendering the
  // tabs — so the item you built is what used to die, not the Lab's target list. (Verified by
  // mutation: putting the Lab's `targets` back on local useState does NOT fail this suite, because
  // that state was never at risk.)
  it('keeps the item you built when you leave the item tab and come back', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);

    // Put a mod on the item, and confirm it landed.
    await user.click(screen.getByRole('button', { name: /Normal Prefix/ }));
    expect(await screen.findByTitle(/Remove from item/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Plan from scratch/i }));
    expect(screen.queryByPlaceholderText(/Search modifiers to add to your item/i)).toBeNull(); // unmounted

    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    expect(await screen.findByTitle(/Remove from item/i)).toBeInTheDocument();
  });

  it('remembers which tab you were on across a remount', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);

    // A fresh mount reads the store, which is exactly what a page reload does.
    cleanup();
    render(<EngineLab />);
    expect(await screen.findByPlaceholderText(/Search modifiers to add to your item/i)).toBeInTheDocument();
  });
});

describe('EngineLab — reset and compute routing', () => {
  it('reset clears the target list', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.getByText(/Target item/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.queryByText(/Target item/)).not.toBeInTheDocument();
  });

  it('routes a plain craft through optimize, and a fractured craft through optimizeItem', async () => {
    const user = userEvent.setup();
    await loaded();

    // Plain: add a normal mod and compute → optimize (from white).
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    // `waitFor`, because computing crosses a Worker boundary and is genuinely asynchronous. It used to
    // be a `setTimeout(…, 0)` that `user.click` happened to flush, so a bare assertion passed by luck —
    // then failed on CI once the extra hops didn't fit in the same tick.
    await waitFor(() => expect(mocks.optimize).toHaveBeenCalledTimes(1));
    expect(mocks.optimizeItem).not.toHaveBeenCalled();

    // Fracture it and recompute → optimizeItem (from the carved Rare).
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    await waitFor(() => expect(mocks.optimizeItem).toHaveBeenCalledTimes(1));
  });
});

// The Lab is the app's PRIMARY mode and had no true-cost model at all: `markovFromItem` required a
// Rare start, and a white base is Normal with nothing on it.
describe('EngineLab — the true cost of a craft from scratch', () => {
  it('shows the true expected cost and the route, not just the step frontier', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/True expected cost/i)).toBeInTheDocument();
    // The route names the add-chain, which is what a from-scratch craft actually is. (It appears in
    // both the visible route and the screen-reader copy of it, hence getAllBy.)
    expect((await screen.findAllByText(/Transmute \(Greater\)/)).length).toBeGreaterThan(0);
  });

  /**
   * A from-white solve seeds from a policy that never restarts — a real, if expensive, way to finish —
   * and works DOWN from it, so stopping early leaves a CEILING. The from-item solve on the other tab
   * starts at zero and climbs, leaving a floor. Both arrive at this panel through the same props, so
   * the sign has to come from `bound`; inferring it from `converged` prints the wrong inequality on
   * one of the two screens, which is the most precise-looking wrong figure the app can show.
   */
  it('renders an unfinished from-white solve as a ceiling, not a floor', async () => {
    mocks.optimizeItemMarkov.mockReturnValue({ ...labMarkov, converged: false, bound: 'upper' });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/^≤\s/)).toBeInTheDocument();
    expect(screen.getByText(/ceiling/i)).toBeInTheDocument();
    expect(screen.queryByText(/floor/i)).toBeNull();
  });

  it('renders an unfinished push-forward solve as a floor', async () => {
    mocks.optimizeItemMarkov.mockReturnValue({ ...labMarkov, converged: false, bound: 'lower' });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/^≥\s/)).toBeInTheDocument();
    expect(screen.getByText(/floor/i)).toBeInTheDocument();
    expect(screen.queryByText(/ceiling/i)).toBeNull();
  });

  /**
   * "Raise Search effort" is the right advice at four of the five presets and a dead end at the fifth.
   *
   * Reported from the live app: a six-mod craft came back as a ceiling while the user was ALREADY on
   * the highest setting the app offered, and was told to raise it. Telling someone to turn a dial that
   * is against its stop reads as the app not knowing its own state.
   */
  it('stops telling you to raise the effort once you are at the top of it', async () => {
    setEffort(EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.id);
    mocks.optimizeItemMarkov.mockReturnValue({ ...labMarkov, converged: false, bound: 'upper' });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    // `ceiling` is inside a <strong>; the advice is its sibling text, so assert on the paragraph.
    const warning = (await screen.findByText(/ceiling/i)).closest('p')!;
    expect(warning.textContent).not.toMatch(/raise/i);
    expect(warning.textContent).toMatch(/as tight as the solver gets/i);
    // It must NAME the top preset, not a word. This said "Maximum", which matched no rung on the
    // ladder — it was Patient, and is now Exhaustive — so the app sent people looking for a setting
    // that did not exist. Derived from the list, so renaming or adding a rung cannot re-break it.
    expect(warning.textContent).toContain(EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.label);
    // …and the standing hint under the control stops saying it too, or the advice just moves.
    expect(screen.queryByText(/Raise it if a result says/i)).toBeNull();
  });

  /**
   * The announcement quotes the same odds the panel shows, at the same scale.
   *
   * It had its own `toFixed(1)` and read "Best value: 0.0% per attempt" for a plan whose card, three
   * lines below, said 0.0000063% — a craft the app had just called achievable, announced to a screen
   * reader as impossible. `fmtPct` is FrontierView's, so the two cannot drift apart again.
   */
  it('announces a long-shot chance at its real scale, not rounded to zero', async () => {
    mocks.optimize.mockReturnValue({
      ...okFrontier,
      frontier: [{ probability: 6.3e-8, expected: 2, perAttempt: 1, expectedAttempts: 1.6e7, steps: [] }],
    });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    const said = await screen.findByText(/Best value:/);
    // The exact string FrontierView puts on the card for this probability — same scale, same digits.
    expect(said).toHaveTextContent('Best value: 0.0000063% per attempt');
    expect(said).not.toHaveTextContent(/Best value: 0\.0% /);
  });

  it('says a white base may simply be binned and rerolled', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/bin what you have and start again/i)).toBeInTheDocument();
  });

  // The frontier is what the user asked for and is already computed by the time the model runs. A
  // model that cannot represent some craft must say so in its own card, not delete the answer beside
  // it — which is exactly what happened while `optimizeItemMarkov` was unmocked here.
  it('explains a missing true cost rather than dropping the panel in silence', async () => {
    // The Lab reaches the same decline paths the Item tab does — an essence target, a shape the model
    // has no action for. Rendering the card only on success loses half the panel with no reason given,
    // which is the exact bug this repo already had to fix once on the other tab.
    mocks.optimizeItemMarkov.mockReturnValue({
      applicable: true, feasible: false, expectedCost: Infinity, converged: true, bound: 'exact', assumedOdds: false,
      nodes: [], edges: [], reason: 'this model has no Essence action yet',
    });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/No true expected cost for this craft/i)).toBeInTheDocument();
    expect(screen.getByText(/no Essence action yet/i)).toBeInTheDocument();
  });

  it('still returns the frontier when the true-cost model blows up', async () => {
    mocks.optimizeItemMarkov.mockImplementation(() => { throw new Error('no action for that'); });
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/success \/ attempt|chance per attempt/i)).toBeInTheDocument();
    // Exact match: the DECLINE card reads "No true expected cost for this craft", which a loose
    // /true expected cost/i would match and quietly invert this assertion.
    expect(screen.queryByText('True expected cost')).toBeNull();
    // …and the throw is reported rather than swallowed.
    expect(screen.getByText(/couldn’t handle this craft/i)).toBeInTheDocument();
  });
});

/**
 * SLOT ALTERNATIVES in the lab — "this slot can be X or Y, I don't care which".
 *
 * The fixture is built for it: NP and NP2 share family FamA, so before slots they were mutually
 * exclusive targets and the picker locked the second out. As ALTERNATIVES they are the ordinary case —
 * only one ever lands on the item, which is exactly what makes them interchangeable.
 */
describe('EngineLab — a slot with alternatives', () => {
  const orButton = (): HTMLElement => screen.getAllByRole('button', { name: /or…/i })[0]!;

  it('offers "or" on an ordinary target, so the feature can be found at all', async () => {
    const user = userEvent.setup();
    await loaded();
    expect(screen.queryByRole('button', { name: /or…/i })).toBeNull(); // nothing to group yet
    await user.click(addButton('Normal Prefix'));
    expect(orButton()).toBeInTheDocument();
  });

  /**
   * The family lock is the whole point of the exemption. NP2 shares FamA with NP, so the picker
   * disables it as an ordinary target — and must UN-disable it the moment you say "or", because
   * siblings are the commonest alternative there is.
   */
  it('unlocks a same-family sibling once you ask for an alternative', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(addButton('Sibling Prefix')).toBeDisabled();

    await user.click(orButton());
    expect(screen.getByText(/Pick a mod above to add as an/i)).toBeInTheDocument();
    expect(addButton('Sibling Prefix')).not.toBeDisabled();

    await user.click(addButton('Sibling Prefix'));
    expect(screen.getByText(/Any one of/i)).toBeInTheDocument();
    // One position on the item, two mods that can fill it — and the heading has to say both.
    expect(screen.getByText(/Target item \(1 slot, 2 mods\)/i)).toBeInTheDocument();
  });

  // Vocabulary only changes for someone who has just made a slot mean something; everyone else keeps
  // the words they had.
  it('keeps the old wording when nothing is grouped', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.getByText(/Target item \(1 mod\)/i)).toBeInTheDocument();
  });

  it('takes one pick per invitation, then returns to adding ordinary targets', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(orButton());
    await user.click(addButton('Sibling Prefix'));
    expect(screen.queryByText(/Pick a mod above to add as an/i)).toBeNull();
  });

  it('can be cancelled without adding anything', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(orButton());
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(screen.queryByText(/Pick a mod above to add as an/i)).toBeNull();
    expect(addButton('Sibling Prefix')).toBeDisabled(); // the family lock is back
  });

  /**
   * Removing a slot's second-to-last candidate leaves a position with one way to fill it — which is
   * an ordinary target, not a choice. Leaving the slot id on it would render a one-item "any one of"
   * box, which reads as a bug rather than as a setting.
   */
  it('ungroups a slot when it drops back to a single candidate', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(orButton());
    await user.click(addButton('Sibling Prefix'));
    expect(screen.getByText(/Any one of/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remove Sibling Prefix from the target/i }));
    expect(screen.queryByText(/Any one of/i)).toBeNull();
    expect(screen.getByText(/Target item \(1 mod\)/i)).toBeInTheDocument();
  });

  // The saving depends on how many slots the target has, and that is worth saying before someone
  // concludes from a full six-mod craft that alternatives do very little.
  it('says an alternative eases one slot, once one exists', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.queryByText(/eases/i)).toBeNull();
    await user.click(orButton());
    await user.click(addButton('Sibling Prefix'));
    expect(screen.getByText(/It eases/i)).toBeInTheDocument();
  });
});
