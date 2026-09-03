import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { modSourceLabel } from '../../lib/engineMap';
import {
  loadEngine, listBases, listMods, listPerfectEssences, listDesecrated,
  priceBasis,
  modFamilies,
  type EngineBase, type EngineMod, type ExistingItem, type ItemModInput,
  type EngineResult, type EngineMarkovResult,
} from '../../lib/engine';
import { solve, isCancelled, prewarm } from '../../lib/engineClient';
import type { SolveProgress as Progress } from '../../lib/solve';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import { SearchEffort, SearchEffortHint } from './SearchEffort';
import { useField, useOnChange } from '../../lib/workspace';
import { MIXED_TIER_NOTE, mixedTierAlternatives, nextSlotId, slotsOf, whyNotAdd } from '../../lib/targetSlots';
import { exactExalts, formatBoundedCost, formatCost, type Rates } from '../../lib/currency';
import FrontierView from './FrontierView';
import PolicyGraph from './PolicyGraph';
import PriceBasisNote from './PriceBasisNote';
import SolveProgress from './SolveProgress';
import CurrencyExclusions from './CurrencyExclusions';
import BaseSelect from './BaseSelect';
import QuickCurrencyCheck from './QuickCurrencyCheck';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

// Bare <button>s miss the Button component's ring (button.tsx), falling back to the browser default —
// visible, but inconsistent with the rest of the app.
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

/**
 * What the item you are holding is actually worth to this craft.
 *
 * "I have four of the six, I just need two more" feels two-thirds done. Measured on a 6-target T2
 * Wand it is **4.4%** — the last mod alone is 53% of the craft and the first three together are 0.27%
 * of it (docs/validation.md, 2026-09-03). Cost is back-loaded because every mod added leaves fewer
 * open slots for the next one to land in, while a miss then needs an Annulment that picks uniformly
 * and can take what was banked. Nothing on screen said this, and counting mods invites exactly the
 * wrong conclusion, so the panel says it in currency.
 *
 * The comparison is free: `bareCost` is a value the solve already computed for another state in the
 * same lattice, not a second solve.
 *
 * Three things it refuses to do:
 *  - **Claim a figure it cannot stand behind.** Shown only when `bound` is `exact`. Both numbers come
 *    from one solve, so when that solve ran out of clock they are two floors on values still climbing
 *    and their DIFFERENCE is not a bound on anything.
 *  - **Assume progress is positive.** A dirty item costs more than a clean one because the junk has to
 *    come off, and that is worth saying plainly rather than rendering as a negative percentage.
 *  - **State the obvious.** A bare start IS the baseline, so there is nothing to compare and the row
 *    does not appear — which is also what silences it on the Lab tab, where every craft starts bare.
 */
const ItemWorth: React.FC<{ markov: EngineMarkovResult; rates?: Rates }> = ({ markov, rates }) => {
  const bare = markov.bareCost;
  if (bare === undefined || markov.bound !== 'exact') return null;
  const start = markov.nodes.find((n) => n.isStart);
  const bareStart = start !== undefined && start.present.length === 0 && start.blocked.length === 0
    && start.junkPrefixes === 0 && start.junkSuffixes === 0;
  if (bareStart || bare <= 0) return null;

  const worth = bare - markov.expectedCost;
  const share = worth / bare;
  return (
    <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
      {worth > 0 ? (
        <>
          <strong className="text-foreground">
            Your item has done {share < 0.001 ? 'under 0.1' : (share * 100).toFixed(1)}% of this craft
          </strong>{' '}
          — it saves <span title={exactExalts(worth)}>{formatCost(worth, rates)}</span> against the same
          base carrying none of these mods. The rest is in what you still need: cost is back-loaded,
          because every mod already on the item leaves fewer open slots for the next one to land in.
          <strong> Counting mods overstates how far along you are.</strong>
        </>
      ) : (
        <>
          <strong className="text-foreground">Your item is behind a clean start</strong> — finishing it
          costs <span title={exactExalts(-worth)}>{formatCost(-worth, rates)}</span> more than the same
          base carrying none of these mods, because what you do not want has to come off first, and an
          Annulment takes a mod at random rather than the one you picked.
        </>
      )}
    </p>
  );
};

/** Rarity → per-side slot cap (magic = 1 prefix + 1 suffix, rare = 3 + 3). */
const CAP: Record<'magic' | 'rare', number> = { magic: 1, rare: 3 };

interface BuilderColumnProps {
  readonly title: string;
  readonly list: readonly EngineMod[];
  readonly count: number;
  readonly cap: number;
  readonly occupiedFamilies: ReadonlySet<string>;
  readonly onAdd: (mod: EngineMod) => void;
}

// Module-level, not defined inside ItemActions: a component created in render gets a new identity each
// render and would remount this subtree every keystroke (dropping the search box's focus).
const BuilderColumn: React.FC<BuilderColumnProps> = ({ title, list, count, cap, occupiedFamilies, onAdd }) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{count}/{cap}</span>
    </div>
    <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
      {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {list.map((m) => {
        const famTaken = modFamilies(m).some((f) => occupiedFamilies.has(f));
        const disabled = count >= cap || famTaken;
        const reason = famTaken ? `“${m.family}” family already on the item` : count >= cap ? 'This side is full' : '';
        // Disabled buttons aren't focusable, so a title-only reason is unreachable. `family in use`
        // was already shown visually for one case; this makes the rest reachable the same way.
        const reasonId = disabled ? `item-why-${m.id}` : undefined;
        return (
          <button
            key={m.id}
            onClick={() => onAdd(m)}
            disabled={disabled}
            className={`flex w-full items-center gap-2 text-left px-2 py-1.5 text-sm hover:bg-accent ${FOCUS_RING} disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
            aria-label={`Add ${m.text} to your item`}
            {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            title={reason || (m.source === 'desecrated' ? 'Add this desecrated mod to your item (occupies a slot; Omen of Light can target it)' : 'Add to your item')}
          >
            <span className="flex-1 min-w-0 truncate">{m.text}</span>
            {m.source === 'desecrated' && <span className="shrink-0 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desecrated</span>}
            {famTaken && <span className="shrink-0 text-[10px] text-muted-foreground">family in use</span>}
            {reasonId && <span id={reasonId} className="sr-only">{reason}</span>}
          </button>
        );
      })}
    </div>
  </div>
);

const ItemActions: React.FC = () => {
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof loadEngine>> | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

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

  // Option 2 (full plan) target + result.
  const [target, setTarget] = useField('item', 'target');
  const [plan, setPlan] = useState<EngineResult | null>(null);
  const [markov, setMarkov] = useState<EngineMarkovResult | null>(null);
  const [planErr, setPlanErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  // How long the last solve took. The progress bar carries a live timer, but it unmounts on completion,
  // so the one moment you want the number — after it finishes — was the one moment it wasn't there.
  const [tookMs, setTookMs] = useState<number | null>(null);
  // Collapsed by default whenever the true-cost model answered — see `trueCostAnswered`.
  const [showRoutes, setShowRoutes] = useState(false);
  const excludedKeys = toExcludedKeys(useExclusions());
  const effort = useEffort();
  // Exalts-per-chaos / per-divine, so a huge cost reads as a quantity rather than a wall of digits.
  const rates = engine ? priceBasis(engine).rates : undefined;
  // Held so the Cancel button can reach the running solve; refs, not state, because changing them must
  // not re-render.
  const cancelRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    // Start the solver worker now rather than on the first click, so pressing Compute doesn't also pay
    // for spinning one up and fetching the snapshot into it.
    prewarm();
    loadEngine()
      .then((eng) => {
        setEngine(eng);
        const bases = listBases(eng.data);
        // Only DEFAULT the base — never overwrite one restored from the workspace, or a reload would
        // silently drag the user back to Wands.
        setBaseId((b) => b || bases.find((x) => x.id === 'Wands')?.id || bases[0]?.id || '');
      })
      .catch((e) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, [setBaseId]);

  const bases: EngineBase[] = useMemo(() => (engine ? listBases(engine.data) : []), [engine]);
  // The item builder offers rollable (normal) mods AND desecrated mods — a real item can carry a
  // desecrated mod, and modelling it matters (it eats a slot + family, and it's the sole Omen-of-Light
  // target). Desecrated mods are NOT in `addable` below: no modelled currency can ADD one to the item.
  const pool = useMemo(() => {
    if (!engine || !baseId) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    const m = listMods(engine.data, baseId);
    const normal = (l: readonly EngineMod[]) => l.filter((x) => x.source === 'normal');
    const des = listDesecrated(engine.data, baseId);
    const desOf = (type: 'prefix' | 'suffix') => des.filter((x) => x.type === type);
    return {
      prefixes: [...normal(m.prefixes), ...desOf('prefix')],
      suffixes: [...normal(m.suffixes), ...desOf('suffix')],
    };
  }, [engine, baseId]);
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

  // Reset everything when the base changes — but NOT on mount. This component is unmounted on every
  // tab switch, so firing on mount would destroy the restored item each time you came back.
  useOnChange(baseId, () => {
    setPrefixes([]); setSuffixes([]);
    setTarget([]); setPlan(null); setPlanErr(null); setSearch('');
  });
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
  // Toggle a current mod's fractured lock: it can't be removed and is excluded from random removal.
  const toggleFractured = (modId: string) => {
    const flip = (l: readonly ItemModInput[]) => l.map((x) => (x.modId === modId ? { ...x, fractured: !x.fractured } : x));
    setPrefixes(flip);
    setSuffixes(flip);
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

  const cap = CAP[rarity];
  const addItemMod = (mod: EngineMod) => {
    if (onItem.has(mod.id) || modFamilies(mod).some((f) => occupiedFamilies.has(f))) return;
    const cur = mod.type === 'prefix' ? prefixes : suffixes;
    if (cur.length >= cap) return;
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

  // "Mod to add" (quick-check) — currency can only add NORMAL mods, so desecrated ones are excluded
  // here, and so is anything already on the item: no orb can add a mod you have.
  const addable = useMemo(
    () => [...pool.prefixes, ...pool.suffixes].filter((m) => !onItem.has(m.id) && m.source === 'normal'),
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
    () => [...pool.prefixes, ...pool.suffixes].filter((m) => m.source === 'normal'),
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

  const item: ExistingItem = { baseId, level, rarity, prefixes, suffixes };
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
    whyNotAdd(mod, target, modById, addingTo === null ? {} : { intoSlot: addingTo });
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
  const copyItemToTarget = () => {
    setTarget([...prefixes, ...suffixes].map((m) => ({ modId: m.modId, tierDisplay: modById.get(m.modId)?.tiers.length ?? 1 })));
    setPlan(null);
  };
  const patchTarget = (modId: string, tierDisplay: number) =>
    setTarget((t) => t.map((x) => (x.modId === modId ? { ...x, tierDisplay } : x)));

  // Runs in a Web Worker: this is the multi-second solve (a 3-target craft takes ~3.9s), and running it
  // here would lock the page for its whole duration. The old `setTimeout(…, 0)` tried to let a spinner
  // paint first, but that is a race against the frame deadline and lost about half the time.
  const compute = () => {
    if (!engine || target.length === 0) return;
    // Starting a solve supersedes any running one (engineClient cancels it). Stamp this run so the
    // superseded one's callbacks can be ignored — otherwise its `finally` would clear `computing`
    // while its replacement is still going, and the UI would look idle mid-solve.
    const runId = ++runIdRef.current;
    const current = () => runIdRef.current === runId;

    setComputing(true); setPlanErr(null); setProgress(null); setTookMs(null);
    const startedAt = Date.now();
    const handle = solve(
      {
        kind: 'item', item, targets: target, effort: limitsFor(effort),
        ...(excludedKeys.length > 0 ? { excluded: excludedKeys } : {}),
      },
      (p) => { if (current()) setProgress(p); },
    );
    cancelRef.current = handle.cancel;
    handle.promise
      .then((res) => {
        if (!current() || res.kind !== 'item') return;
        setPlan(res.plan);
        // The honest expected cost + optimal-policy graph (push-forward MDP). Falls back silently to the
        // frontier alone when the target isn't MDP-modellable (perfect-essence / desecrate).
        setMarkov(res.markov);
      })
      .catch((e) => {
        if (!current() || isCancelled(e)) return; // cancelling is what the user asked for, not an error
        setPlan(null); setMarkov(null); setPlanErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!current()) return;
        cancelRef.current = null;
        setComputing(false); setProgress(null); setTookMs(Date.now() - startedAt);
      });
  };

  // Cancelling leaves this run current, so the rejection above still runs the `finally` that resets the
  // button — no need to unwind state here.
  const cancel = () => { cancelRef.current?.(); };

  if (loadErr) {
    return (
      <Card className="p-6">
        <p className="text-destructive font-medium">Failed to load engine data</p>
        <p className="text-sm text-muted-foreground mt-1">{loadErr}</p>
      </Card>
    );
  }
  if (!engine) {
    return <div className="flex items-center gap-3 p-8 text-muted-foreground"><Spinner /> Loading patch data…</div>;
  }

  const subTabCls = (active: boolean) =>
    `px-3 py-1.5 rounded ${active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="space-y-4">
      {/* Your item */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <BaseSelect bases={bases} value={baseId} onChange={setBaseId} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item level</span>
            <input
              type="number" min={1} max={100} value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className={`${selectCls} w-24`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rarity</span>
            <select className={selectCls} value={rarity} onChange={(e) => setRarity(e.target.value as 'magic' | 'rare')}>
              <option value="rare">Rare (3 + 3)</option>
              <option value="magic">Magic (1 + 1)</option>
            </select>
          </label>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Mods already on your item</p>
          <label htmlFor="item-mod-search" className="sr-only">Search modifiers to add to your item</label>
          <input
            id="item-mod-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modifiers to add to your item…"
            className={`${selectCls} w-full mb-2`}
          />
          {/* Stacks on a phone. A bare `flex` kept both columns side by side at every width, so
              on a narrow screen each got half of it and the mod text was crushed to nothing. */}
          <div className="flex flex-col sm:flex-row gap-4">
            <BuilderColumn title="Prefixes" list={filtered.prefixes} count={prefixes.length} cap={cap} occupiedFamilies={occupiedFamilies} onAdd={addItemMod} />
            <BuilderColumn title="Suffixes" list={filtered.suffixes} count={suffixes.length} cap={cap} occupiedFamilies={occupiedFamilies} onAdd={addItemMod} />
          </div>
        </div>

        {itemMods.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {itemMods.map((m) => {
                const isFractured = fracturedIds.has(m.id);
                // A desecrated-POOL mod could only have arrived by Desecration, so it is always
                // flagged and there is nothing to toggle; an ordinary one has to be told to us.
                const alwaysDesecrated = m.source === 'desecrated';
                const isDesecrated = alwaysDesecrated || desecratedIds.has(m.id);
                return (
                  <span
                    key={m.id}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm ${isFractured ? 'border-amber-500/60 bg-amber-500/10' : 'border-border/60'}`}
                  >
                    <Badge variant={m.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{m.type === 'prefix' ? 'P' : 'S'}</Badge>
                    {m.text}
                    {/* The tier this mod is ROLLED AT, not a tier you are asking for. It decides
                        whether the planner keeps the mod or has to strip it, so it is the difference
                        between a craft that is nearly done and one that is not started. */}
                    <select
                      className="h-6 rounded border border-input bg-background px-1 text-[11px]"
                      value={heldTier.get(m.id) ?? 1}
                      onChange={(e) => patchItemMod(m.id, Number(e.target.value))}
                      aria-label={`Tier this mod is rolled at: ${m.text}`}
                      title="The tier this mod is actually rolled at"
                    >
                      {m.tiers.map((ti) => <option key={ti.display} value={ti.display}>{ti.label}</option>)}
                    </select>
                    {isDesecrated && <span className="rounded bg-rose-500/20 px-1 text-[10px] text-rose-700 dark:text-rose-300">desecrated</span>}
                    {isFractured && <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-700 dark:text-amber-300">fractured</span>}
                    <button
                      onClick={() => toggleFractured(m.id)}
                      aria-pressed={isFractured}
                      aria-label={`Fractured (locked on the item): ${m.text}`}
                      className={`px-0.5 ${FOCUS_RING} ${isFractured ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
                      title={isFractured ? 'Fractured (locked) — click to unlock' : 'Mark fractured: locked on the item, can’t be removed'}
                    >
                      <span aria-hidden="true">{isFractured ? '🔒' : '🔓'}</span>
                    </button>
                    {!alwaysDesecrated && (
                      <button
                        onClick={() => toggleDesecrated(m.id)}
                        aria-pressed={isDesecrated}
                        aria-label={`Placed by a Desecration: ${m.text}`}
                        className={`px-0.5 ${FOCUS_RING} ${isDesecrated ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                        title={isDesecrated
                          ? 'Placed by a Desecration — click to unmark'
                          : 'Mark as placed by a Desecration: blocks desecrating this item again until it’s removed'}
                      >
                        <span aria-hidden="true">💀</span>
                      </button>
                    )}
                    <button
                      onClick={() => dropItemMod(m.id)}
                      className={`text-muted-foreground hover:text-destructive ${FOCUS_RING}`}
                      aria-label={`Remove ${m.text} from your item`}
                      title="Remove from item"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </span>
                );
              })}
            </div>
            {(desecratedIds.size > 0 || itemMods.some((m) => m.source === 'desecrated')) && (
              <p className="text-[11px] text-muted-foreground">
                💀 A Desecration flags the mod it placed, whether that mod came from the desecrated pool
                or is an ordinary one. While the flag is on the item the Well of Souls won’t touch it
                again — so removing that mod is what lets you desecrate a second time.
              </p>
            )}
            {fracturedIds.size > 0 && (
              <p className="text-[11px] text-muted-foreground">
                🔒 Fractured mods are locked — the planner keeps them, never removes them, and they’re excluded
                from what an Annulment / Chaos / Essence can randomly remove (so those odds go up).
              </p>
            )}
            {itemMods.some((m) => m.source === 'desecrated') && (
              <p className="text-[11px] text-muted-foreground">
                <span className="text-rose-600 dark:text-rose-300">desecrated</span> mods occupy a slot and a
                family like any other mod — that alone shifts your other currency odds. Pick one as the mod to
                sacrifice below and you’ll get an <strong>Annulment + Omen of Light</strong> option that removes
                it for certain (a plain Annulment only hits it 1-in-N at random).
              </p>
            )}
          </>
        )}
      </Card>

      {/* Sub-mode toggle */}
      <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        <button
          className={`${subTabCls(subMode === 'check')} ${FOCUS_RING}`}
          onClick={() => setSubMode('check')}
          aria-pressed={subMode === 'check'}
        >
          Quick currency check
        </button>
        <button
          className={`${subTabCls(subMode === 'plan')} ${FOCUS_RING}`}
          onClick={() => setSubMode('plan')}
          aria-pressed={subMode === 'plan'}
        >
          Full plan to a target
        </button>
      </div>

      {subMode === 'check' ? (
        <QuickCurrencyCheck engine={engine} item={item} addable={checkAddable} itemMods={itemMods} rates={rates} />
      ) : (
        <>
          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">What should the item end up as?</h3>
              <Button variant="outline" size="sm" onClick={copyItemToTarget} disabled={itemMods.length === 0}>
                Copy my current mods
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pick the <strong>final</strong> mods you want. Any mod on your item that isn’t in this list is treated
              as junk and removed. The plan below keeps everything you already have that’s in the target.
            </p>

            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add a target mod</span>
                <select
                  className={`${selectCls} min-w-72`} value=""
                  onChange={(e) => { const m = modById.get(e.target.value); if (m) addTarget(m); }}
                >
                  <option value="">— choose —</option>
                  {/* Every mod that cannot be added is DISABLED with its reason, rather than filtered
                      away or — as before — left selectable and silently ignored. This list used to
                      hide the one-desecrated and one-essence cases and enforce nothing else, so
                      picking a fourth prefix, or a mod whose family was taken, was a dead choice with
                      no explanation anywhere. A <select> gives no room for a described-by node, so the
                      reason rides in the option's own text: it is the only place a screen reader,
                      a keyboard and a touch user all reach it. */}
                  {[...targetable, ...perfect, ...desecratedTargets].map((m) => {
                    const why = blockFor(m);
                    return (
                      <option key={m.id} value={m.id} disabled={why !== null}>
                        {m.type === 'prefix' ? 'P' : 'S'} · {m.text}
                        {modSourceLabel(m.source)}
                        {/* Which of these you already hold is the thing this panel was worst at
                            saying. The row it becomes says it too, but by then you have picked. */}
                        {onItem.has(m.id) ? ' · on your item' : ''}
                        {why ? ` — ${why}` : ''}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
            {addingTo !== null && (
              <p className="flex flex-wrap items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-[11px] text-sky-700 dark:text-sky-300">
                <span>Choose a mod above to add as an <strong>alternative</strong> — the slot is filled by whichever one lands.</span>
                <button onClick={() => setAddingTo(null)} className={`underline ${FOCUS_RING}`}>Cancel</button>
              </p>
            )}

            {target.length > 0 && (
              <div className="space-y-2">
                {/* By SLOT, not by target: a slot with alternatives is one position on the item and has
                    to read as one, or a three-way choice looks like three mods you must all get. */}
                {targetSlots.map((slot) => {
                  const key = slot.id === undefined ? `solo-${target[slot.members[0]!]!.modId}` : `slot-${slot.id}`;
                  const rows = slot.members.map((memberIndex) => {
                  const t = target[memberIndex]!;
                  const mod = modById.get(t.modId);
                  if (!mod) return null;
                  // Three states, not two. A target is a mod you already have AT A GOOD ENOUGH ROLL,
                  // a mod you have but too low — which is worse than not having it, because the slot
                  // and family are occupied and the bad roll has to be stripped first — or a mod that
                  // is simply not on the item yet. The list showed only "already have", keyed on the
                  // mod id alone, so the middle case rendered as the first: green, reassuring, and the
                  // exact opposite of the truth. Lower display = better roll, so "good enough" is
                  // `held <= wanted`, the same "this tier or better" the target selector means.
                  const held = heldTier.get(t.modId);
                  const satisfied = held !== undefined && held <= t.tierDisplay;
                  const tooLow = held !== undefined && held > t.tierDisplay;
                  return (
                    <div key={t.modId} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
                      <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{mod.type === 'prefix' ? 'P' : 'S'}</Badge>
                      <span className="flex-1 min-w-40 text-sm">{mod.text}</span>
                      {mod.source === 'desecrated' && <span className="text-[10px] rounded bg-rose-500/15 px-1 text-rose-600 dark:text-rose-300">desecrated</span>}
                      {mod.source === 'perfect' && <span className="text-[10px] rounded bg-purple-500/15 px-1 text-purple-600 dark:text-purple-300">perfect essence</span>}
                      {satisfied && (
                        <span className="text-[10px] rounded bg-emerald-500/15 px-1 text-emerald-600 dark:text-emerald-300">
                          already have
                        </span>
                      )}
                      {tooLow && (
                        <span
                          className="text-[10px] rounded bg-amber-500/15 px-1 text-amber-700 dark:text-amber-300"
                          title={`Your item has this at ${mod.tiers.find((ti) => ti.display === held)?.label ?? `T${held}`}, below the tier you want — the planner has to remove it and re-roll the slot`}
                        >
                          have {mod.tiers.find((ti) => ti.display === held)?.label ?? `T${held}`} — must re-roll
                        </span>
                      )}
                      {held === undefined && (
                        <span className="text-[10px] rounded bg-sky-500/15 px-1 text-sky-700 dark:text-sky-300">
                          to add
                        </span>
                      )}
                      <select
                        className={selectCls}
                        value={t.tierDisplay}
                        onChange={(e) => patchTarget(t.modId, Number(e.target.value))}
                        aria-label={`Target tier for ${mod.text}`}
                        title="Target tier (or better)"
                      >
                        {mod.tiers.map((ti) => <option key={ti.display} value={ti.display}>{ti.label}</option>)}
                      </select>
                      <button
                        onClick={() => removeTargetMod(t.modId)}
                        className={`text-muted-foreground hover:text-destructive px-1 ${FOCUS_RING}`}
                        aria-label={`Remove ${mod.text} from the target`}
                        title="Remove from target"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </div>
                  );
                  });
                  const orButton = (
                    <button
                      onClick={() => startAlternative(slot.members[0]!)}
                      className={`shrink-0 rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/50 ${FOCUS_RING}`}
                      title="Add an alternative: this slot is filled by whichever of its mods lands, so you don’t have to pick one"
                    >
                      <span aria-hidden="true">⊕ </span>or…
                    </button>
                  );
                  if (slot.members.length === 1) {
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">{rows}</div>
                        {orButton}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="rounded-md border border-sky-500/40 bg-sky-500/5 p-1.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 px-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                          Any one of
                        </span>
                        {orButton}
                      </div>
                      {rows}
                      {mixedTierAlternatives(slot, target, modById) && (
                        /* A PLANNER note, not a game rule: the craft is legal and the answer identical.
                           Same-family alternatives merge whatever tiers you ask of them; different-family
                           ones can only be folded together while they are indistinguishable, and a
                           different tier is the one difference the player controls. */
                        <p className="px-0.5 text-[11px] text-muted-foreground">{MIXED_TIER_NOTE}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {targetSlots.some((sl) => sl.members.length > 1) && (
              <p className="text-[11px] text-muted-foreground">
                ⊕ An alternative slot is filled by whichever of its mods lands, so it never costs you a
                choice. It eases <strong>one</strong> slot, though — expect a bigger saving on a short
                target than on a full six-mod one.
              </p>
            )}

            <CurrencyExclusions />

            {computing ? (
              <SolveProgress progress={progress} onCancel={cancel} />
            ) : (
              <>
                {/* This tab always OBEYED the effort setting (`limitsFor(effort)` below) but never
                    rendered the control, so a from-item craft ran under whatever was last picked on
                    the Lab tab with no way to see or change it. */}
                <div className="flex flex-wrap items-end gap-3">
                  <SearchEffort />
                  <div className="flex-1" />
                  {/* The reason a disabled button is disabled belongs NEXT TO IT. This message used to
                      share the button's row; moving it below the effort hint left the button greyed out
                      with an unrelated paragraph between it and its explanation, which reads as a broken
                      button rather than an unmet precondition. */}
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <Button onClick={compute} disabled={blockedBy !== null} size="lg">
                      Compute plan
                    </Button>
                    {blockedBy && <span className="text-xs text-muted-foreground">{blockedBy}</span>}
                  </div>
                </div>
                <SearchEffortHint />
                {tookMs !== null && (
                  <p className="text-[11px] text-muted-foreground" role="status">
                    Last solve took <strong className="tabular-nums">{(tookMs / 1000).toFixed(1)}s</strong>.
                  </p>
                )}
              </>
            )}
          </Card>

          {/* This panel used to show TWO cost totals and the note described only one of them, labelled
              just "Cost model:". Naming both was the honest version then. The step plan's total is now
              gone entirely — it priced replacing your item for free on every miss, which for an item
              you hold you cannot do, and which no player does from a white base either — so there is
              one total left and the note's job changed: not "why do these two numbers differ" but
              "what are the routes below, given they no longer carry one". */}
          <p className="text-[11px] text-muted-foreground px-1">
            <strong>One total, and a set of routes.</strong> <strong>True expected cost</strong> is the whole
            answer: a miss leaves you in a worse state and the policy digs out of it in place, taking whatever
            lands. The step routes below are the simpler view — each is one <em>fixed</em> sequence where every
            slam must hit a named mod, so they tell you the odds of a clean run and what that run costs, and on a
            long-shot target they will look far harder than the true cost, because the policy is allowed to adapt
            and they are not.
          </p>

          {planErr && (
            <Card className="p-4">
              {/* Says "plan", not "craft" — the failure is this planner's, and some of the messages
                  underneath are its own restrictions rather than game rules. See docs/copy-audit.md. */}
              <p className="text-destructive font-medium text-sm">The planner can’t plan this craft</p>
              <p className="text-sm text-muted-foreground mt-1">{planErr}</p>
            </Card>
          )}
          {/* When the MDP doesn't model this craft the true-cost card simply wasn't rendered, so the
              panel lost half its content with no explanation — and its `reason`, which says exactly
              why, was carried across the worker boundary and then never shown to anyone.
              The condition is the NEGATION of the true-cost card's below, deliberately: there are two
              ways to have no figure. `applicable: false` is set by the facade before the model runs
              (a regular-essence target), while the model's own refusals come back through `mapMarkov`,
              which hardcodes `applicable: true` and reports `feasible: false`. Keying this card on
              `!applicable` alone caught the first and missed the second, so a Magic item — the case it
              was written for — still showed nothing at all. */}
          {plan && !planErr && markov && !trueCostAnswered && markov.reason && (
            <Card className="p-4">
              <p className="text-sm font-medium">No true expected cost for this craft</p>
              <p className="text-sm text-muted-foreground mt-1">{markov.reason}</p>
            </Card>
          )}
          {plan && !planErr && markov?.applicable && markov.feasible && (
            <Card className="p-4 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold">True expected cost</h3>
                {/* An unconverged solve is a BOUND, not an estimate, and `bound` says which way it
                    leans — from here it is always a floor, because a craft on the item in your stash
                    never restarts, so value iteration starts at 0 and climbs. Rendering it as a bare
                    number would be the most precise-looking wrong figure in the app. */}
                <span className="text-2xl font-bold tabular-nums text-primary" title={exactExalts(markov.expectedCost)}>
                  {formatBoundedCost(markov.bound, markov.expectedCost, rates)}
                </span>
              </div>
              {markov.bound === 'lower' && (
                <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                  ⚠ The solver stopped before this number settled, so it is a <strong>floor</strong> — the real
                  cost is at least this and may be far higher. That happens when every route is a very long
                  shot, which is itself the answer: on this target, it isn’t close.
                </p>
              )}
              <ItemWorth markov={markov} rates={rates} />
              <p className="text-[11px] text-muted-foreground">
                The honest average spend to reach this target, playing the optimal policy — it weighs
                Greater/Perfect Exalts and side omens, and <strong>recovers in place</strong> after a bad roll
                rather than restarting. The step routes below are the simpler per-plan view: one fixed sequence,
                priced as though a miss handed you a free replacement item. That makes their cost neither an
                upper nor a lower bound on this one. <strong>“True” describes the model, not the money</strong>{' '}
                — it is honest about how crafting actually behaves; the price sheet it is multiplied by is
                still an estimate.
              </p>
              {engine && <PriceBasisNote basis={priceBasis(engine)} exactOdds={!markov.assumedOdds} />}
              <PolicyGraph result={markov} rates={rates} />
              <p className="text-[11px] text-muted-foreground">
                Each square is an item state, from your item (left) to the target (right). Solid arrows are
                progress; dashed amber arrows are <strong>bricks</strong> — a bad roll (a miss, or a target
                rolled <strong>below its tier</strong> so its family is blocked) that sends you back a step,
                which the policy then digs out of.
              </p>
            </Card>
          )}
          {plan && !planErr && trueCostAnswered && !showRoutes && (
            <button
              type="button"
              onClick={() => setShowRoutes(true)}
              aria-expanded={false}
              className="w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-muted/40"
            >
              <span className="font-medium text-foreground">Step-by-step routes</span>
              {/* NOT the cheapest expected cost. That figure is the free-restart total — billions of
                  divine on a long-shot craft — and putting it on the button meant you met the number
                  without ever opening the section. The route count is the honest summary. */}
              {plan.frontier.length > 0 && (
                <span className="tabular-nums"> ({plan.frontier.length})</span>
              )}
              {/* Deliberately NOT a restatement of the two-cost-models paragraph above — that one
                  explains the models; this one says why the number behind this button is safe to
                  ignore. Saying it twice reads as the panel arguing with itself. */}
              <span className="block mt-0.5">
                Every slam here must hit one <em>named</em> mod, where the policy above takes whatever
                lands — which is why this figure is so much larger. Kept for completeness.
              </span>
            </button>
          )}
          {plan && !planErr && trueCostAnswered && showRoutes && (
            <button
              type="button"
              onClick={() => setShowRoutes(false)}
              aria-expanded
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Hide step-by-step routes
            </button>
          )}
          {plan && !planErr && (!trueCostAnswered || showRoutes) && (
            <FrontierView
              priceBasis={engine ? priceBasis(engine) : undefined}
              result={plan}
              title="Step-by-step routes (per-plan view)"
              emptyHint={excludedKeys.length > 0 ? (
                <p>No route avoids the {excludedKeys.length} currenc{excludedKeys.length === 1 ? 'y' : 'ies'} you
                  excluded. Untick some under “Currency I don’t have” to widen the search.</p>
              ) : (
                <p>No route reaches this target from your item — usually the target needs more mods than
                  fit, or a tier gated above the item level.</p>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ItemActions;
