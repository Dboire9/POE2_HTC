import React, { useMemo, useState } from 'react';
import {
  listBases, listMods, listDesecrated, listPerfectEssences, bossOmenAllowed, isRollable,
  type Engine, type EngineBase, type EngineMod, type EngineResult, type TargetInput, type ExistingItem,
  type EngineAlternatives, type AltTargetInput, type EngineMarkovResult,
} from '../../lib/engine';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import { withSpare } from './FreeSlots';
import type { Spare } from '../../../packages/optimizer/src/slots.ts';
import { NO_SPARE } from '../../../packages/optimizer/src/slots.ts';
import { limitsWithRunes } from '../../../packages/engine/src/runes.ts';
import { shareUrl, useField } from '../../lib/workspace';
import { toast } from 'sonner';
import { nextSlotId, roomOnSide, slotCounts, slotsOf, whyNotAdd } from '../../lib/targetSlots';
import { formatChance } from '../../lib/currency';
import { useSolveRunner } from './useSolveRunner';
import type { SolveRequest } from '../../lib/solve';
import { craftSig } from '../../lib/craftAlong';
import { gearPriceKey, gearPrices, type PriceEntry, type TypedPrice } from '../../lib/typedPrices';
import { slotsOfTargets } from '../../lib/gearTrade';

/**
 * A solve the Plan tab ran, and what its answer describes: the request, and the fields it was built
 * from. The fields can change after it and the result on screen cannot, so everything that labels the
 * result reads from here — and it is kept whole so "Play it out" runs exactly this craft again.
 */
interface LabRun {
  readonly req: SolveRequest;
  /** The Search effort it ran at: the start panel's "compute again" steps up from THIS, not the dropdown. */
  readonly effortId: string;
  /**
   * The free slots it ran with. The graph says how much junk really has to go, which is a claim about
   * the SOLVE — reading the live setting would let it change under a result computed with another one.
   */
  readonly spare: Spare;
  /** Its base and targets — a trade search for "this item" has to name the item the numbers describe. */
  readonly solvedFor: { readonly baseId: string; readonly targets: readonly TargetInput[] };
  /** The budget the alternatives were searched under. */
  readonly budget: number;
}

/**
 * Everything the Plan tab knows and does: the craft being built, the rules the picker enforces, the
 * solve, and its result.
 *
 * A hook called by `EngineLab`, not state inside the tab's own component, and that is load-bearing:
 * `EngineLab` never unmounts, so the Lab keeps its result while the player looks at another tab. A
 * component that rendered only on the Plan tab would drop it on every switch. The Item tab has always
 * lost its result that way, and says so in its own comments.
 */
export function useLabCraft(engine: Engine | null) {
  const data = engine?.data ?? null;

  // The user's WORK lives in the shared workspace store, not here: this component's sibling
  // (ItemActions) is unmounted whenever you switch tabs, and local state died with it. `useField`
  // keeps useState's exact signature so every call site below is untouched.
  const [baseId, setBaseId] = useField('lab', 'baseId');
  const [level, setLevel] = useField('lab', 'level');
  const [targets, setTargets] = useField('lab', 'targets');
  const [search, setSearch] = useState('');
  // Per-mod tier chosen in the picker BEFORE adding (default T1 = display 1); the "+" commits mod+tier.
  const [pickTier, setPickTier] = useState<Record<string, number>>({});
  // Targets the user marks as already FRACTURED ("carved") on the base — the craft starts from a Rare
  // holding these (locked, never removed) and rolls the rest around them (routes via the from-item planner).
  const [fractured, setFractured] = useField('lab', 'fractured');
  // Targets pinned as non-negotiable: the budget search never relaxes, swaps or drops them.
  const [pinned, setPinned] = useField('lab', 'pinned');
  // Optional spend cap (exalt-equivalents). Empty ⇒ no alternatives panel; the frontier alone is shown.
  const [budget, setBudget] = useField('lab', 'budget');
  // What a pin will actually do, which depends on whether there is a budget for it to constrain.
  const pinEffect = budget.trim() !== ''
    ? 'the budget search will never relax, swap or drop it'
    : 'saved for when you set a budget; that search will never relax, swap or drop it';
  const [baseCost, setBaseCost] = useField('lab', 'baseCost');
  // Runes socketed in the item being crafted. They change what it may HOLD, so they reach the picker's
  // rules (`limits` below) and every planner in the solve, not just the words on the page.
  const [runes, setRunes] = useField('lab', 'runes');
  // Positions on the finished item the player doesn't care about. Part of the TARGET, not of the item,
  // so it clears with the rest of the craft when the base changes.
  const [spare, setSpare] = useField('lab', 'spare');

  const [result, setResult] = useState<EngineResult | null>(null);
  const [alts, setAlts] = useState<EngineAlternatives | null>(null);
  const [markov, setMarkov] = useState<EngineMarkovResult | null>(null);
  // Bumped per solve result, so a panel keyed on it starts fresh — typed prices belong to ONE craft's rows.
  // Not by a play-out, which is the same craft again.
  const [markovRun, setMarkovRun] = useState(0);
  const [solved, setSolved] = useState<LabRun | null>(null);
  const markovEffort = solved?.effortId ?? '';
  const markovSpare = solved?.spare ?? NO_SPARE;
  const solvedFor = solved?.solvedFor ?? null;
  const altBudget = solved?.budget ?? 0;
  // Which craft the result on screen is, for Craft along to pick up a saved place in (`craftSig`).
  const alongSig = solved ? craftSig('lab', solved.req) : null;
  // What the finished item sells for, as the player typed it — kept per item (`gearPriceKey`), so the
  // same craft solved again, today or next week, finds it.
  const [salePrices, setSalePrices] = useState<Record<string, TypedPrice>>(gearPrices.read);
  const saleKey = solvedFor ? gearPriceKey(solvedFor.baseId, slotsOfTargets(solvedFor.targets)) : null;
  const sale = saleKey === null ? undefined : salePrices[saleKey];
  const setSale = (price: PriceEntry | undefined): void => {
    if (saleKey !== null) setSalePrices(gearPrices.write(saleKey, price));
  };
  const [runErr, setRunErr] = useState<string | null>(null);
  // The site was redeployed under this tab, so the solve could not load what it needed. Not an error
  // the player can act on except by reloading, so it gets its own notice rather than `runErr`'s card.
  const [stale, setStale] = useState(false);
  const runner = useSolveRunner();
  const excludedKeys = toExcludedKeys(useExclusions());
  const effort = useEffort();

  const bases: EngineBase[] = useMemo(() => (data ? listBases(data) : []), [data]);
  // The target pool = rollable + regular-essence mods (listMods) PLUS desecrated mods (Desecration on
  // a Rare) PLUS perfect-essence mods (a Perfect Essence on a Rare, which adds its mod while eating
  // one at random). All three need the item Rare first, so all three depend on the add-chain reaching
  // Regal — the planner reports it when a target can't get there.
  const mods = useMemo(() => {
    if (!(data && baseId)) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    // The ticked runes go IN, so the picker offers exactly what the solve will roll: a "Can roll …"
    // rune's modifiers are in the pool only while its rune is socketed, and untick it and they leave.
    const m = listMods(data, baseId, runes);
    const extra = [...listDesecrated(data, baseId), ...listPerfectEssences(data, baseId)];
    return {
      prefixes: [...m.prefixes, ...extra.filter((x) => x.type === 'prefix')],
      suffixes: [...m.suffixes, ...extra.filter((x) => x.type === 'suffix')],
    };
  }, [data, baseId, runes]);
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...mods.prefixes, ...mods.suffixes]) m.set(x.id, x);
    return m;
  }, [mods]);

  /**
   * Picking a different base clears the craft, because the targets name modifiers of the base they
   * were chosen on.
   *
   * A HANDLER on the picker, not an effect watching `baseId`. Watching the value cannot tell a base
   * PICK from the other two things that move it — a share link being applied, and an item being sent
   * here to be crafted from scratch — and it wiped both. Measured: a link naming any base other than
   * the one already on screen arrived with every target stripped. Test 4 in the e2e suite missed it
   * twice over, by sharing the default base AND by reopening the link in a page that still had the
   * original `localStorage`.
   */
  const clearCraft = () => {
    setTargets([]);
    setResult(null);
    setMarkov(null);
    setAlts(null);
    setRunErr(null);
    setSearch('');
    setPickTier({});
    setFractured(new Set());
    setPinned(new Set());
    setSpare(NO_SPARE);
  };
  const changeBase = (id: string) => { setBaseId(id); clearCraft(); };

  const selectedIds = useMemo(() => new Set(targets.map((t) => t.modId)), [targets]);
  // A regular essence needs a Magic item and turns it Rare, so at most one essence-only mod per craft.
  // One ESSENCE modifier per item, regular and perfect counted TOGETHER — a Perfect Essence can't go
  // on an item already holding an essence mod. (UI source names: 'essence' and 'perfect'; the engine
  // calls the latter 'perfect_essence' — `isEssenceMod` is the canonical rule.)
  // The one-essence-per-item CAP now lives in `whyNotAdd`, shared with the other tab. What stays here
  // is the narrower question the fracture rules key off: a REGULAR essence needs a Magic start, which
  // a fractured mod (forcing a Rare) makes impossible — while a Perfect Essence wants a Rare, so a
  // fracture is no obstacle to it at all. Conflating the two would block a legal combination.
  const regularEssenceUsed = targets.some((t) => modById.get(t.modId)?.source === 'essence');
  const desecratedUsed = targets.some((t) => modById.get(t.modId)?.source === 'desecrated');
  const normalTargets = targets.filter((t) => isRollable(modById.get(t.modId)?.source)).length;
  // Via the facade's UI-shaped base list rather than the raw PatchData — same source the rest of
  // this component uses, so it can't disagree with what the picker is showing.
  const category = bases.find((b) => b.id === baseId)?.category ?? '';
  const bossTargetable = bossOmenAllowed(category);
  // What the item can hold once its runes are in — the same rule the planners read off the base.
  const limits = useMemo(() => limitsWithRunes(category, runes), [category, runes]);
  // From white the item is Normal, and a Desecration needs a RARE — reached via transmute → augment →
  // regal, three adds the from-white planner can only spend on mods you asked for (every PlanStep it
  // builds names a target mod; there is no filler concept). With fewer than three rollable targets
  // every ordering scores 0, which the generic "impossible on this base/level" message explains
  // wrongly. Note the CRAFT is not impossible — roll junk, annul it off (rarity survives), Desecrate —
  // it is outside the search space, and the hint has to say which.
  const desecrationNeedsRare = desecratedUsed && normalTargets < 3 && fractured.size === 0;
  // A regular essence needs a MAGIC start; a fractured mod makes the craft start from a RARE. They can't
  // coexist in one plan — flag it so the UI blocks the combination instead of erroring at compute time.
  const essenceFractureConflict = regularEssenceUsed && fractured.size > 0;

  // The finished item's positions. A slot holding three alternatives still fills ONE of them, which is
  // why the 3-per-side limit counts these and not `targets`.
  const slots = useMemo(() => slotsOf(targets, modById), [targets, modById]);
  const counts = useMemo(() => slotCounts(targets, modById), [targets, modById]);
  // Which slot the next pick joins, or null to start a new one. The picker's rules change with it —
  // joining a slot exempts the side cap and the slot's own families — so it has to be state the guard
  // can see, not a mode the button remembers privately.
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const blockFor = React.useCallback(
    (mod: EngineMod): string | null => whyNotAdd(mod, targets, modById, {
      ...(addingTo === null ? {} : { intoSlot: addingTo }),
      hasFractured: fractured.size > 0,
      limits,
      spare,
    }),
    [targets, modById, addingTo, fractured, limits, spare],
  );
  /**
   * The "Any …" row's own guard, which is the side cap and nothing else.
   *
   * None of the other rules in `whyNotAdd` can apply: a free slot has no id to duplicate, no family to
   * clash, no source to count against the one-essence or one-desecrated caps. So this asks the one
   * question that IS shared — is there room on the side — through the same `roomOnSide` the mod rows
   * ask it through, rather than restating a cap that could then drift from theirs.
   */
  const spareBlock = (side: 'prefix' | 'suffix'): string | null =>
    (roomOnSide(side, targets, modById, { limits, spare }) > 0
      ? null
      : `This side is full (max ${side === 'prefix' ? limits.prefixes : limits.suffixes})`);
  const addSpare = (side: 'prefix' | 'suffix') => { setSpare(withSpare(spare, side, 1)); setAddingTo(null); };

  /*
   * Offer "Any …" only when the picker is showing its whole list and starting a new slot.
   *
   * A SEARCH is the obvious half: the row matches no query, so leaving it in would put the one result
   * that ignored what you typed at the top of the list. Joining a slot is the less obvious half and the
   * more important one — an alternative answers "which of these would do?", and "anything" is not an
   * answer to that question but a different question about the whole slot. A slot that already offers
   * "anything" among its alternatives is not a choice at all.
   */
  const offerSpare = search.trim() === '' && addingTo === null;
  /** Free slots across both sides — positions on the item, so counted with `slots` and not with mods. */
  const freeSlots = spare.prefixes + spare.suffixes;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pick = (list: readonly EngineMod[]) =>
      (q ? list.filter((m) => m.text.toLowerCase().includes(q)) : list).filter((m) => !selectedIds.has(m.id));
    return { prefixes: pick(mods.prefixes), suffixes: pick(mods.suffixes) };
  }, [mods, search, selectedIds]);

  // One guard, shared with the picker's disabled state and with the other tab — so a mod can never be
  // rejected here for a reason the picker did not show, which is how a dead "+" used to happen.
  const addTarget = (mod: EngineMod, tierDisplay = 1) => {
    if (blockFor(mod) !== null) return;
    const slot = addingTo;
    setTargets((t) => [...t, slot === null ? { modId: mod.id, tierDisplay } : { modId: mod.id, tierDisplay, slot }]);
    setAddingTo(null); // one pick per invitation; grouping three means asking three times, visibly
  };
  /**
   * Give a lone target a slot id so the next pick can join it, and open the picker on that slot.
   *
   * A target with no `slot` is its own slot already — the id is only needed so a second candidate has
   * something to point at. Stamping it here rather than at add time keeps every craft that never uses
   * alternatives free of slot ids entirely, which is what lets a share link stay on the old format.
   */
  const startAlternative = (index: number) => {
    const existing = targets[index]?.slot;
    if (existing !== undefined) { setAddingTo(existing); return; }
    const id = nextSlotId(targets);
    setTargets((t) => t.map((x, i) => (i === index ? { ...x, slot: id } : x)));
    setAddingTo(id);
  };
  const removeTarget = (modId: string) => {
    setTargets((t) => {
      const next = t.filter((x) => x.modId !== modId);
      // A slot down to its last candidate is no longer a choice, so drop the id and let it render as
      // an ordinary row. Leaving it would show a one-item "any one of" box, which reads as a bug.
      const alone = new Map<number, number>();
      for (const x of next) if (x.slot !== undefined) alone.set(x.slot, (alone.get(x.slot) ?? 0) + 1);
      return next.map((x) => (x.slot !== undefined && alone.get(x.slot) === 1
        ? { modId: x.modId, tierDisplay: x.tierDisplay } : x));
    });
    setFractured((f) => { const n = new Set(f); n.delete(modId); return n; });
    setPinned((p) => { const n = new Set(p); n.delete(modId); return n; });
  };
  const patchTarget = (modId: string, patch: Partial<TargetInput>) =>
    setTargets((t) => t.map((x) => (x.modId === modId ? { ...x, ...patch } : x)));
  // Mark a target as already fractured on the base (locked) — or clear it. Locking a NEW one is blocked
  // while an essence is in the craft (essence needs Magic, a fracture forces a Rare start); unlocking is
  // always allowed so the user can resolve the conflict.
  //
  // ONE per base, so marking a second clears the first — the Fracturing Orb's own text: it locks "a
  // random modifier" and "cannot be used on Fractured items", so a second is unreachable in game. The
  // Item tab enforces the same cap on the item you hold.
  const toggleFractured = (modId: string) => {
    if (!fractured.has(modId) && regularEssenceUsed) return;
    setFractured((f) => (f.has(modId) ? new Set<string>() : new Set([modId])));
  };
  // Pin a target as non-negotiable so the budget search never relaxes/swaps/drops it.
  const togglePinned = (modId: string) =>
    setPinned((p) => { const n = new Set(p); if (n.has(modId)) n.delete(modId); else n.add(modId); return n; });

  // Encode the whole workspace into a link. The state already lives in one store, so this is a
  // serialisation, not a second source of truth.
  const share = async () => {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied', { description: 'It reproduces this base, targets, tiers and budget.' });
    } catch {
      // Clipboard is permission-gated and unavailable over plain http on some browsers — still give
      // them the link rather than failing silently.
      toast.message('Copy this link', { description: url });
    }
  };

  // What a screen reader should hear when a solve lands. Derived, not stored: it must never describe
  // a result that is no longer on screen.
  // A planner that declined scored nothing, so it must not be announced as one whose every route scored
  // zero — the same distinction FrontierView draws on screen, heard the same way.
  const outcome = !result ? '' : result.frontier.length === 0
    ? (result.reason ? 'No step-by-step route for this craft.' : 'No achievable plan — every route scored zero.')
    : `${result.frontier.length} plan${result.frontier.length === 1 ? '' : 's'} found.`
      + (() => {
        // Whatever the top card says, said the same way. This is the one channel a screen-reader user
        // cannot check against the cards, so it must not make a claim the cards have stopped making —
        // it announced "Best value: …" long after that badge was withdrawn from the dearest plan.
        const best = result.frontier.at(-1); // the frontier ends surest; the cards lead with it
        if (!best) return '';
        return ` Likeliest: ${formatChance(best.probability)} per attempt.`;
      })()
      + (alts ? ` ${alts.rows.length} budget alternative${alts.rows.length === 1 ? '' : 's'} listed.` : '');

  // Clear the whole craft (targets, tier picks, fractured marks, results) — keeps the base + item level.
  const reset = () => {
    setTargets([]);
    setPickTier({});
    setFractured(new Set());
    setPinned(new Set());
    setResult(null);
    setMarkov(null);
    setAlts(null);
    setRunErr(null);
    setSearch('');
  };

  // A carved base IS a Rare holding those mods, so a fractured craft is the from-item planner with them locked.
  const carvedItem = (): ExistingItem => {
    const carved = (type: 'prefix' | 'suffix') =>
      targets.filter((t) => fractured.has(t.modId) && modById.get(t.modId)?.type === type)
        .map((t) => ({ modId: t.modId, tierDisplay: t.tierDisplay, fractured: true }));
    return { baseId, level, rarity: 'rare', prefixes: carved('prefix'), suffixes: carved('suffix') };
  };

  // Runs in the same Web Worker as the from-item planner. These calls are fast (a few ms), so this is
  // about having ONE compute path rather than a fast one here and a slow one there — and about the main
  // thread never running the optimizer at all.
  const run = (job: LabRun, playOut = false) => {
    setRunErr(null);
    setStale(false);
    runner.run(playOut ? { ...job.req, playOut: true } : job.req, {
      onResult: (res) => {
        if (res.kind !== 'lab') return;
        setResult(res.result);
        setAlts(res.alts);
        setMarkov(res.markov);
        if (!playOut) setMarkovRun((n) => n + 1);
        setSolved(job);
      },
      onError: (e, appUpdated) => {
        setResult(null);
        setAlts(null);
        if (appUpdated) { setMarkov(null); setStale(true); return; }
        setRunErr(e instanceof Error ? e.message : String(e));
      },
    });
  };

  const compute = (effortId: string = effort) => {
    if (!engine || targets.length === 0) return;

    const fromItem = fractured.size > 0;
    const b = Number(budget);
    const hasBudget = budget.trim() !== '' && Number.isFinite(b) && b > 0;
    const want: AltTargetInput[] = targets.map((t) => (pinned.has(t.modId) ? { ...t, pinned: true } : t));
    // A blank field means "no opinion", which is NOT the same as zero — it defers to the app's default.
    // 0 typed explicitly is a real answer (bases are free) and must reach the solver as one, so the
    // test is on the string being non-empty, not on the number being truthy.
    const bc = Number(baseCost);
    const hasBaseCost = baseCost.trim() !== '' && Number.isFinite(bc) && bc >= 0;

    const req: SolveRequest = {
      kind: 'lab',
      from: fromItem ? { item: carvedItem() } : { baseId, level },
      targets,
      ...(hasBudget ? { budget: b, want } : {}),
      ...(hasBaseCost ? { baseCost: bc } : {}),
      effort: limitsFor(effortId),
      ...(excludedKeys.length > 0 ? { excluded: excludedKeys } : {}),
      ...(runes.length > 0 ? { runes } : {}),
      ...(freeSlots > 0 ? { spare } : {}),
    };
    run({ req, effortId, spare, solvedFor: { baseId, targets }, budget: b });
  };

  /**
   * "Play it out": the craft on screen solved again, and its plan played out on real items — the spread
   * of what one craft costs. The request that produced the result, not the fields as they stand now,
   * so the spread describes the numbers it sits beside.
   */
  const playOut = () => { if (solved) run(solved, true); };

  const canCompute = targets.length > 0 && !runner.computing && !essenceFractureConflict;
  const onPickTier = (modId: string, t: number) => setPickTier((p) => ({ ...p, [modId]: t }));

  return {
    engine, data, bases, baseId, level, setLevel, changeBase, category, limits, runes, setRunes,
    budget, setBudget, baseCost, setBaseCost, targets, fractured, pinned, pinEffect, spare, setSpare,
    freeSlots, search, setSearch, pickTier, onPickTier, filtered, counts, slots, modById,
    addingTo, setAddingTo, blockFor, spareBlock, addSpare, offerSpare,
    addTarget, startAlternative, removeTarget, patchTarget, toggleFractured, togglePinned,
    regularEssenceUsed, desecratedUsed, normalTargets, bossTargetable, desecrationNeedsRare,
    essenceFractureConflict, excludedKeys,
    result, alts, altBudget, markov, markovRun, markovEffort, markovSpare, solvedFor, alongSig, runErr, stale,
    sale, setSale, saleKey,
    computing: runner.computing, progress: runner.progress, cancel: runner.cancel, compute, playOut, canCompute,
    share, reset, outcome,
  };
}

/** The Plan tab, as its pieces read it. */
export type LabCraft = ReturnType<typeof useLabCraft>;
