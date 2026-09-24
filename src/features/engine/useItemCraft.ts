import { useEffect, useMemo, useState } from 'react';
import {
  listBases, listMods, listPerfectEssences, listDesecrated, priceBasis, modFamilies, isRollable,
  type EngineBase, type EngineMod, type ExistingItem, type ItemModInput, type TargetInput,
  type EngineResult, type EngineMarkovResult,
} from '../../lib/engine';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import { useField } from '../../lib/workspace';
import { nextSlotId, roomOnSide, slotsOf, whyNotAdd } from '../../lib/targetSlots';
import { withSpare } from './FreeSlots';
import type { Spare } from '../../../packages/optimizer/src/slots.ts';
import { NO_SPARE } from '../../../packages/optimizer/src/slots.ts';
import { limitsWithRunes } from '../../../packages/engine/src/runes.ts';
import { useDefaultBase, useEngine } from './useEngine';
import { useSolveRunner } from './useSolveRunner';
import type { SolveRequest } from '../../lib/solve';
import { craftSig } from '../../lib/craftAlong';

/** Rarity → per-side slot cap (magic = 1 prefix + 1 suffix, rare = 3 + 3). */
export const CAP: Record<'magic' | 'rare', number> = { magic: 1, rare: 3 };

/**
 * Everything the Item tab knows and does: the item you hold, the target, the solve and its result.
 *
 * Called by `ItemActions`, which unmounts whenever another tab is picked, so a result here does not
 * survive a tab switch — the item and target do, because they live in the workspace store.
 */
export function useItemCraft() {
  const { engine, loadErr } = useEngine(useDefaultBase('item'));

  // In the shared workspace store, not local state: this component is UNMOUNTED whenever the user
  // switches to the plan tab (EngineLab renders it conditionally), which used to throw away the whole
  // item they had built. `useField` keeps useState's signature, so nothing below changes.
  const [baseId, setBaseId] = useField('item', 'baseId');
  const [level, setLevel] = useField('item', 'level');
  const [rarity, setRarity] = useField('item', 'rarity');
  const [prefixes, setPrefixes] = useField('item', 'prefixes');
  const [suffixes, setSuffixes] = useField('item', 'suffixes');
  const [search, setSearch] = useState('');

  const [subMode, setSubMode] = useField('item', 'subMode');
  // Runes socketed in the item you hold: they change what it may HOLD, so the builder's per-side caps
  // and the target picker's rules both read them, and they travel with the item to every planner.
  const [runes, setRunes] = useField('item', 'runes');

  // Option 2 (full plan) target + result.
  const [target, setTarget] = useField('item', 'target');
  // Positions on the finished item the player doesn't care about — the same target-side setting the
  // Lab tab has, read by the same guard and sent to the same solve.
  const [spare, setSpare] = useField('item', 'spare');
  const freeSlots = spare.prefixes + spare.suffixes;
  // The free slots the LAST SOLVE ran with. The policy graph's "Junk to clear" is a claim about that
  // solve, so it must not follow the live setting once the answer is on screen.
  const [markovSpare, setMarkovSpare] = useState<Spare>(NO_SPARE);
  // What the result on screen was solved FOR, for its trade searches — the fields may change after it.
  const [solvedFor, setSolvedFor] = useState<{ readonly baseId: string; readonly targets: readonly TargetInput[] } | null>(null);
  const [plan, setPlan] = useState<EngineResult | null>(null);
  const [markov, setMarkov] = useState<EngineMarkovResult | null>(null);
  const [planErr, setPlanErr] = useState<string | null>(null);
  // Set when a solve failed because the site was redeployed under this tab — see AppUpdatedNotice.
  const [stale, setStale] = useState(false);
  const runner = useSolveRunner();
  // How long the last solve took. The progress bar carries a live timer, but it unmounts on completion,
  // so the one moment you want the number — after it finishes — was the one moment it wasn't there.
  const [tookMs, setTookMs] = useState<number | null>(null);
  // Collapsed by default whenever the true-cost model answered — see `trueCostAnswered`.
  const [showRoutes, setShowRoutes] = useState(false);
  // Which craft the result on screen is, for Craft along to pick up a saved place in (`craftSig`).
  const [alongSig, setAlongSig] = useState<string | null>(null);
  const excludedKeys = toExcludedKeys(useExclusions());
  const effort = useEffort();
  // Exalts-per-chaos / per-divine, so a huge cost reads as a quantity rather than a wall of digits.
  const rates = engine ? priceBasis(engine).rates : undefined;

  const bases: EngineBase[] = useMemo(() => (engine ? listBases(engine.data) : []), [engine]);
  // The item builder offers ROLLABLE mods AND desecrated mods — a real item can carry a desecrated
  // mod, and modelling it matters (it eats a slot + family, and it's the sole Omen-of-Light target).
  // Desecrated mods are NOT in `addable` below: no modelled currency can ADD one to the item.
  // "Rollable" includes a rune pool's modifiers once that rune is ticked — see `isRollable`.
  const pool = useMemo(() => {
    if (!engine || !baseId) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    // With the ticked runes, so the builder offers what the item can actually hold — untick the rune
    // and its modifiers leave the list, exactly as they leave the pool the planners roll from.
    const m = listMods(engine.data, baseId, runes);
    const normal = (l: readonly EngineMod[]) => l.filter((x) => isRollable(x.source));
    const des = listDesecrated(engine.data, baseId);
    const desOf = (type: 'prefix' | 'suffix') => des.filter((x) => x.type === type);
    return {
      prefixes: [...normal(m.prefixes), ...desOf('prefix')],
      suffixes: [...normal(m.suffixes), ...desOf('suffix')],
    };
  }, [engine, baseId, runes]);
  // Perfect essences + desecrated mods: offered as TARGETS in the from-item flow (a Perfect Essence
  // adds its mod while removing one random mod; a Desecration adds a desecrated mod via its boss omen).
  // Not shown in the current-item builder's add columns.
  const perfect = useMemo(
    () => (engine && baseId ? listPerfectEssences(engine.data, baseId) : []),
    [engine, baseId],
  );
  const desecratedTargets = useMemo(
    () => (engine && baseId ? listDesecrated(engine.data, baseId) : []),
    [engine, baseId],
  );
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...pool.prefixes, ...pool.suffixes, ...perfect, ...desecratedTargets]) m.set(x.id, x);
    return m;
  }, [pool, perfect, desecratedTargets]);

  /**
   * Empty the craft, keeping the base and item level — the same contract as the Lab tab's Reset.
   *
   * `markov` and `tookMs` are cleared too. Neither is rendered without `plan`, so leaving them was not
   * visible, but "Last solve took 3.2s" beside an empty item is a claim about work that no longer
   * relates to anything on screen.
   */
  const clearItem = () => {
    setPrefixes([]); setSuffixes([]);
    setTarget([]); setPlan(null); setMarkov(null); setPlanErr(null); setSearch(''); setTookMs(null);
    // Free slots are part of the TARGET, so they go with it — a base change that left "any suffix"
    // behind would carry a position from a craft the player has finished with.
    setSpare(NO_SPARE);
  };

  /**
   * Picking a different base clears the item, because the modifiers on it belong to the base they
   * came from.
   *
   * A HANDLER, not an effect watching `baseId`. An import changes the base too, and it brings the
   * modifiers that go with it — a value watcher cannot tell those two intents apart, and silently
   * emptied every imported item whose base was not the one already on screen, which is nearly all of
   * them. The base picker is the only place the user changes a base, so that is where the clear goes.
   */
  const changeBase = (id: string) => { setBaseId(id); clearItem(); };
  // Dropping to magic can overflow the 1-per-side cap; trim to keep the item legal.
  //
  // This is a synchronous setState in an effect, which `react-hooks/set-state-in-effect` flags, and
  // the flag is right about the mechanism: it costs a second render pass. It is still correct here,
  // and the alternatives are worse. Deriving the trimmed lists during render would only hide the
  // overflow rather than fix it — the STORE would keep the illegal item, and a share link encoded
  // from it would hand someone a two-suffix Magic wand. Trimming inside the rarity setter would put
  // the invariant in one call site instead of on the state it constrains. So the item is repaired
  // where it lives, once, on the transition that can break it.
  useEffect(() => {
    setPrefixes((p) => p.slice(0, CAP[rarity]));
    setSuffixes((s) => s.slice(0, CAP[rarity]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(null); setPlanErr(null);
  }, [rarity, setPrefixes, setSuffixes]);

  const onItem = useMemo(() => new Set([...prefixes, ...suffixes].map((m) => m.modId)), [prefixes, suffixes]);
  const fracturedIds = useMemo(
    () => new Set([...prefixes, ...suffixes].filter((m) => m.fractured).map((m) => m.modId)),
    [prefixes, suffixes],
  );
  /**
   * Toggle a mod's fractured lock. **At most one per item**, so marking a second clears the first.
   *
   * This is a GAME RULE, and it comes from the Fracturing Orb's own text in the RePoE dump rather than
   * from anyone's recollection: *"Fracture a random modifier on a rare item with at least 4 modifiers,
   * locking it in place"*, and — the half that caps it — *"Cannot be used on Fractured items."* One orb
   * fractures one mod, and it refuses an item that already carries one, so two is unreachable. The orb
   * is the only fracture source in the dump (`CurrencyFractureRare`; the Shard combines into it, and
   * `Fractured Fossil` is a PoE1 leftover).
   *
   * Clearing rather than refusing, the same way `toggleDesecrated` handles the one-carved-mod rule: a
   * player fixing a mistake wants the new mark to take, not a control that goes dead with no reason
   * given.
   *
   * NOT gated on "at least 4 modifiers", which is a rule about APPLYING the orb, not about the item
   * afterwards — annul a fractured 4-mod Rare down to two and the fracture stays. Enforcing it here
   * would refuse a real item, which is the copy-audit failure in a new place.
   */
  const toggleFractured = (modId: string) => {
    const on = !fracturedIds.has(modId);
    const set = (l: readonly ItemModInput[]) => l.map((x) => (
      x.modId === modId ? { ...x, fractured: on } : { ...x, fractured: false }));
    setPrefixes(set);
    setSuffixes(set);
    setPlan(null);
  };
  const desecratedIds = useMemo(
    () => new Set([...prefixes, ...suffixes].filter((m) => m.desecrated).map((m) => m.modId)),
    [prefixes, suffixes],
  );
  /**
   * Mark which mod a Desecration placed. **At most one**, so marking a second clears the first.
   *
   * The app cannot work this out for itself. A bone flags whatever it applied — an ordinary mod just
   * as much as one from the desecrated pool — and a flagged ordinary mod is indistinguishable from an
   * exalted one by inspection. But it is what stops the item being desecrated again, so a plan that
   * assumes it away offers a move the game refuses.
   */
  const toggleDesecrated = (modId: string) => {
    const on = !desecratedIds.has(modId);
    const set = (l: readonly ItemModInput[]) => l.map((x) => (
      x.modId === modId ? { ...x, desecrated: on } : { ...x, desecrated: false }));
    setPrefixes(set);
    setSuffixes(set);
    setPlan(null);
  };
  const occupiedFamilies = useMemo(() => {
    const s = new Set<string>();
    for (const id of onItem) for (const fam of modFamilies(modById.get(id))) s.add(fam);
    return s;
  }, [onItem, modById]);

  // A Magic item holds one per side whatever is socketed; a Rare holds what its runes allow, which is
  // why the two sides can differ (Serle's Triumph raises the suffix one alone).
  const category = bases.find((b) => b.id === baseId)?.category ?? '';
  const limits = useMemo(() => limitsWithRunes(category, runes), [category, runes]);
  const capOf = (type: 'prefix' | 'suffix'): number =>
    (rarity === 'magic' ? CAP.magic : type === 'prefix' ? limits.prefixes : limits.suffixes);
  const addItemMod = (mod: EngineMod) => {
    if (onItem.has(mod.id) || modFamilies(mod).some((f) => occupiedFamilies.has(f))) return;
    const cur = mod.type === 'prefix' ? prefixes : suffixes;
    if (cur.length >= capOf(mod.type)) return;
    (mod.type === 'prefix' ? setPrefixes : setSuffixes)((l) => [...l, { modId: mod.id, tierDisplay: 1 }]);
  };
  const dropItemMod = (modId: string) => {
    setPrefixes((l) => l.filter((x) => x.modId !== modId));
    setSuffixes((l) => l.filter((x) => x.modId !== modId));
    // No selection to clear: the Quick check clamps its two picks against the lists it is handed, so a
    // mod that leaves the item stops being selectable by construction rather than by remembering to
    // say so here — which the rarity trim below never did.
  };

  /**
   * What tier each mod on the item is actually rolled at, 1 = best.
   *
   * Every held mod used to be recorded at `tierDisplay: 1` with no control to change it, so the app
   * assumed your item carried the BEST roll of everything on it. The engine has always graded a held
   * mod against the tier you asked for — `classifyStart` marks it `present` at or above that floor and
   * `blocked` below, and blocked means it has to come OFF before the slot can be re-rolled — so the
   * whole `blocked` branch was unreachable from the UI, and a T8 you would have to annul away was
   * reported as a mod you already had. Measured on a Wand wanting T1 `#% increased Chaos Damage`:
   * 439,140 ex holding it at T1 against 501,850 ex holding it at T8, a 14% difference the app could
   * not be told about.
   */
  const heldTier = useMemo(
    () => new Map([...prefixes, ...suffixes].map((m) => [m.modId, m.tierDisplay])),
    [prefixes, suffixes],
  );
  const patchItemMod = (modId: string, tierDisplay: number): void => {
    const set = (l: readonly ItemModInput[]) => l.map((x) => (x.modId === modId ? { ...x, tierDisplay } : x));
    setPrefixes(set);
    setSuffixes(set);
    setPlan(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pick = (list: readonly EngineMod[]) =>
      (q ? list.filter((m) => m.text.toLowerCase().includes(q)) : list).filter((m) => !onItem.has(m.id));
    return { prefixes: pick(pool.prefixes), suffixes: pick(pool.suffixes) };
  }, [pool, search, onItem]);

  // "Mod to add" (quick-check) — currency can only add ROLLABLE mods, so desecrated ones are excluded
  // here, and so is anything already on the item: no orb can add a mod you have. A rune pool's
  // modifiers ARE rollable once the rune is socketed, which is the whole point of socketing it.
  const addable = useMemo(
    () => [...pool.prefixes, ...pool.suffixes].filter((m) => !onItem.has(m.id) && isRollable(m.source)),
    [pool, onItem],
  );
  /**
   * What the TARGET picker offers, which is a different question and had the wrong answer.
   *
   * It reused `addable`, so a mod already on the item could not be named as a target at all — and
   * "I have this wand, I want the mana roll better" is the commonest from-item craft there is. The
   * only way to express it was `Copy my current mods`, which copies everything at its worst tier.
   * Nothing here needs the exclusion: `whyNotAdd` reasons about the TARGET list (duplicates, side
   * caps, families, the essence rules) and never about what the item happens to hold.
   */
  const targetable = useMemo(
    () => [...pool.prefixes, ...pool.suffixes].filter((m) => isRollable(m.source)),
    [pool],
  );
  const itemMods = useMemo(
    () => [...prefixes, ...suffixes].map((m) => modById.get(m.modId)).filter((m): m is EngineMod => !!m),
    [prefixes, suffixes, modById],
  );
  // Mods only an ESSENCE can place. Not in `pool` (which is the item builder's list, and no essence is
  // on an item you already hold by way of the builder) but a real answer to "what adds this".
  const essenceMods = useMemo(() => {
    if (!engine || !baseId) return [] as EngineMod[];
    const m = listMods(engine.data, baseId);
    return [...m.prefixes, ...m.suffixes].filter((x) => x.source === 'essence');
  }, [engine, baseId]);
  // The Quick check's own add list: every mod SOME currency can place, which is the question the panel
  // answers. Carved mods came first, because a Desecration is the only thing that places one and
  // leaving them out left the panel silent on exactly what a player holding a bone was asking. The
  // essence sources are the same argument — the panel now has rows that can place them, so offering
  // them is what stops "how do I get this mod" being answerable everywhere but here.
  const checkAddable = useMemo(
    () => [...addable, ...essenceMods, ...perfect, ...desecratedTargets].filter((m) => !onItem.has(m.id)),
    [addable, essenceMods, perfect, desecratedTargets, onItem],
  );

  const item: ExistingItem = { baseId, level, rarity, prefixes, suffixes, ...(runes.length ? { runes } : {}) };
  /**
   * Why "Compute plan" is unavailable, or null when it isn't. Two conditions disabled the button and
   * only one of them said anything — with a Rare item and no targets picked it simply greyed out and
   * offered no reason at all. A disabled control that doesn't say what it wants is indistinguishable
   * from a broken one.
   */
  const blockedBy: string | null = target.length === 0
    ? 'Pick at least one target mod above.'
    : null;
  /**
   * Did the true-cost model actually answer? ONE predicate, because two things hang off it and they
   * must never disagree: the "No true expected cost" card renders when this is false, and the step
   * routes collapse behind a disclosure when it is true.
   *
   * When it answered, the step routes are a strictly worse model of the same craft — measured on the
   * reported craft they read ~5,000,000x higher, and even handing them Perfect orbs (worth 1,116x)
   * leaves them ~68,000x out, because a step plan is one fixed sequence in which every slam must hit a
   * NAMED mod while the policy takes whatever lands. So they stop competing for attention. When it did
   * NOT answer — a Magic item, an essence target — they are the only view there is, and stay open.
   */
  const trueCostAnswered = markov !== null && markov.applicable && markov.feasible;

  // ── Option 2: full plan target ──────────────────────────────────────────────
  const targetSlots = useMemo(() => slotsOf(target, modById), [target, modById]);
  // Which slot the next pick joins, or null for a new one. See EngineLab for the same state: the
  // picker's rules change with it, so it cannot be a mode a button remembers privately.
  const [addingTo, setAddingTo] = useState<number | null>(null);
  // The family / one-essence / one-desecrated bookkeeping this tab used to keep for itself now lives
  // in `whyNotAdd`, which both tabs share — so the two can no longer disagree about what is legal or
  // about how to say why.
  // The same guard EngineLab uses. This tab had its own copy, worded differently and — in the picker
  // below — not enforced at all: a fourth prefix was a dead choice that silently did nothing.
  const blockFor = (mod: EngineMod): string | null =>
    whyNotAdd(mod, target, modById,
      addingTo === null ? { limits, spare } : { intoSlot: addingTo, limits, spare });
  const spareBlock = (side: 'prefix' | 'suffix'): string | null =>
    (roomOnSide(side, target, modById, { limits, spare }) > 0
      ? null
      : `this side is full (max ${side === 'prefix' ? limits.prefixes : limits.suffixes})`);
  const addSpare = (side: 'prefix' | 'suffix') => {
    if (spareBlock(side) !== null) return;
    setSpare(withSpare(spare, side, 1));
    setAddingTo(null);
    setPlan(null);
  };
  const addTarget = (mod: EngineMod) => {
    if (blockFor(mod) !== null) return;
    const slot = addingTo;
    setTarget((t) => [...t, slot === null ? { modId: mod.id, tierDisplay: 1 } : { modId: mod.id, tierDisplay: 1, slot }]);
    setAddingTo(null);
    setPlan(null);
  };
  /** Stamp a slot id on a lone target so a second candidate has something to join. */
  const startAlternative = (index: number) => {
    const existing = target[index]?.slot;
    if (existing !== undefined) { setAddingTo(existing); return; }
    const id = nextSlotId(target);
    setTarget((t) => t.map((x, i) => (i === index ? { ...x, slot: id } : x)));
    setAddingTo(id);
  };
  const removeTargetMod = (modId: string) => {
    setTarget((t) => {
      const next = t.filter((x) => x.modId !== modId);
      // A slot down to one candidate is no longer a choice — drop the id so it reads as a plain row.
      const alone = new Map<number, number>();
      for (const x of next) if (x.slot !== undefined) alone.set(x.slot, (alone.get(x.slot) ?? 0) + 1);
      return next.map((x) => (x.slot !== undefined && alone.get(x.slot) === 1
        ? { modId: x.modId, tierDisplay: x.tierDisplay } : x));
    });
    setPlan(null);
  };
  /**
   * "Copy my current mods" — the target becomes what the item already is.
   *
   * It used to copy every mod at `tiers.length`, the WORST tier, which meant "any tier or better".
   * That was the only honest option while a held mod had no tier of its own: claiming T1 would have
   * asserted a roll the player never told us about. Now that the item builder carries the real tier,
   * copying it is both more accurate and what the button's name promises — and the target still comes
   * out satisfied, since `held <= wanted` holds when the two are equal.
   */
  const copyItemToTarget = () => {
    setTarget([...prefixes, ...suffixes].map((m) => ({ modId: m.modId, tierDisplay: m.tierDisplay })));
    setPlan(null);
  };
  /**
   * Which of three things a target is, relative to the item you hold.
   *
   * One function because three things read it — the row's stripe, its badge, and the tally above the
   * list — and a reader comparing a green stripe against a "must re-roll" badge would trust neither.
   * Lower display = better roll, so "good enough" is `held <= wanted`: exactly the "this tier or
   * better" the target selector already means.
   */
  const targetState = (t: TargetInput): 'have' | 'reroll' | 'add' => {
    const held = heldTier.get(t.modId);
    if (held === undefined) return 'add';
    return held <= t.tierDisplay ? 'have' : 'reroll';
  };

  const patchTarget = (modId: string, tierDisplay: number) =>
    setTarget((t) => t.map((x) => (x.modId === modId ? { ...x, tierDisplay } : x)));
  // A change to the target's free slots outdates the answer on screen, like every other target edit.
  const clearPlan = () => setPlan(null);

  // Runs in a Web Worker: this is the multi-second solve (a 3-target craft takes ~3.9s), and running it
  // here would lock the page for its whole duration. The old `setTimeout(…, 0)` tried to let a spinner
  // paint first, but that is a race against the frame deadline and lost about half the time.
  const compute = () => {
    if (!engine || target.length === 0) return;
    setPlanErr(null); setStale(false); setTookMs(null);
    const req: SolveRequest = {
      kind: 'item', item, targets: target, effort: limitsFor(effort),
      ...(excludedKeys.length > 0 ? { excluded: excludedKeys } : {}),
      ...(freeSlots > 0 ? { spare } : {}),
    };
    runner.run(
      req,
      {
        onResult: (res) => {
          if (res.kind !== 'item') return;
          setPlan(res.plan);
          // The honest expected cost + optimal-policy graph (push-forward MDP). Falls back silently to the
          // frontier alone when the target isn't MDP-modellable (perfect-essence / desecrate).
          setMarkov(res.markov);
          setMarkovSpare(spare);
          setSolvedFor({ baseId, targets: target });
          setAlongSig(craftSig('item', req));
        },
        onError: (e, appUpdated) => {
          setPlan(null); setMarkov(null);
          // A redeploy under this tab, not a planner failure — see AppUpdatedNotice.
          if (appUpdated) { setStale(true); return; }
          setPlanErr(e instanceof Error ? e.message : String(e));
        },
        onSettled: (ms) => setTookMs(ms),
      },
    );
  };

  return {
    engine, loadErr, rates, bases, baseId, changeBase, level, setLevel, rarity, setRarity, runes, setRunes,
    category, prefixes, suffixes, search, setSearch, filtered, capOf, occupiedFamilies, addItemMod,
    itemMods, clearItem, fracturedIds, desecratedIds, heldTier, patchItemMod, toggleFractured,
    toggleDesecrated, dropItemMod, subMode, setSubMode, item, checkAddable,
    target, spare, setSpare, freeSlots, modById, targetable, perfect, desecratedTargets, onItem,
    addingTo, setAddingTo, blockFor, spareBlock, addSpare, addTarget, startAlternative, removeTargetMod,
    copyItemToTarget, targetState, patchTarget, clearPlan, targetSlots, excludedKeys, blockedBy,
    plan, markov, markovSpare, solvedFor, alongSig, planErr, stale, trueCostAnswered, showRoutes, setShowRoutes,
    tookMs, computing: runner.computing, progress: runner.progress, cancel: runner.cancel, compute,
  };
}

/** The Item tab, as its pieces read it. */
export type ItemCraft = ReturnType<typeof useItemCraft>;
