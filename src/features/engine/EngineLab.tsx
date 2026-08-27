import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import {
  loadEngine, listBases, listMods, listDesecrated, listPerfectEssences, recommendedIndex, bossOmenAllowed,
  priceBasis,
  modFamilies,
  type EngineBase, type EngineMod, type EngineResult, type TargetInput, type ExistingItem,
  type EngineAlternatives, type AltTargetInput, type EngineMarkovResult,
} from '../../lib/engine';
import { solve, isCancelled, prewarm } from '../../lib/engineClient';
import type { SolveProgress as Progress } from '../../lib/solve';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { EFFORT_PRESETS, isTopEffort, limitsFor, useEffort } from '../../lib/searchEffort';
import { SearchEffort, SearchEffortHint } from './SearchEffort';
import {
  decodeWorkspace, getWorkspace, setWorkspace, shareUrl, useField, useMode, useOnChange,
} from '../../lib/workspace';
import { toast } from 'sonner';
import { nextSlotId, slotCounts, slotsOf, whyNotAdd } from '../../lib/targetSlots';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import ItemActions from './ItemActions';
import FrontierView, { fmtPct } from './FrontierView';
import AlternativesView from './AlternativesView';
import PolicyGraph from './PolicyGraph';
import SolveProgress from './SolveProgress';
import CurrencyExclusions from './CurrencyExclusions';
import { exactExalts, formatBoundedCost, formatCost } from '../../lib/currency';
import BaseSelect from './BaseSelect';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

// Bare <button>s don't get the Button component's ring (button.tsx), so they fall back to the browser
// default — visible, but inconsistent with the rest of the app. This gives them the same one.
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

// Tier label for the picker dropdown: "T1 · 165–179" — a compact tier name plus the roll range. Normal
// mods use "T1"…"Tn" ("Tn · any" for the any-tier worst); essence mods use the level (Lesser/Normal/
// Greater). The full name/ilvl label is shown in the target list once added.
function tierHead(mod: EngineMod, ti: EngineMod['tiers'][number]): string {
  if (mod.source === 'desecrated') return 'desecrated';
  if (mod.source === 'essence') {
    const m = ti.name.match(/^(Lesser|Greater) Essence of/);
    return m ? m[1]! : 'Normal';
  }
  return ti.display === mod.tiers.length ? `T${ti.display} · any` : `T${ti.display}`;
}
function tierOption(mod: EngineMod, ti: EngineMod['tiers'][number]): string {
  const head = tierHead(mod, ti);
  return ti.range ? `${head} · ${ti.range}` : head;
}

interface ModColumnProps {
  readonly title: string;
  readonly list: readonly EngineMod[];
  /** SLOTS used on this side, not mods — a slot with three alternatives still fills one. */
  readonly count: number;
  /**
   * Why this mod can't be added, or null. The column used to work the rules out itself from four
   * separate flags; it now asks, because the answer depends on something it has no business knowing —
   * whether the next pick starts a new slot or joins an existing one, where the side cap and the
   * family rule both change. See `whyNotAdd`.
   */
  readonly blockFor: (mod: EngineMod) => string | null;
  readonly pickTier: Record<string, number>;
  readonly onPickTier: (modId: string, tier: number) => void;
  readonly onAdd: (mod: EngineMod, tier: number) => void;
}

// Module-level (NOT defined inside EngineLab): a component created inside render gets a fresh identity
// each render, so React would remount this whole subtree on every keystroke — dropping the search box's
// focus and detaching the "+" buttons mid-interaction. Hoisting it fixes both.
const ModColumn: React.FC<ModColumnProps> = ({
  title, list, count, blockFor, pickTier, onPickTier, onAdd,
}) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{count}/3</span>
    </div>
    <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
      {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {list.map((m) => {
        const isEssence = m.source === 'essence';
        const isPerfect = m.source === 'perfect';
        const reason = blockFor(m) ?? '';
        const disabled = reason !== '';
        const tier = pickTier[m.id] ?? 1;
        // A disabled button is not focusable, so a `title` explaining WHY is unreachable by keyboard,
        // screen reader and touch alike. Render the reason as real text and point the controls at it.
        const reasonId = disabled ? `why-${m.id}` : undefined;
        return (
          <div
            key={m.id}
            className={`flex items-center gap-1.5 px-2 py-1 ${disabled ? 'opacity-40' : ''}`}
            title={disabled ? reason : m.id}
          >
            <span className="flex-1 min-w-0 truncate text-sm">{m.text}</span>
            {isEssence && <span className="shrink-0 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">ess</span>}
            {isPerfect && <span className="shrink-0 rounded bg-fuchsia-500/15 px-1 text-[10px] text-fuchsia-600 dark:text-fuchsia-300">perf</span>}
            {m.source === 'desecrated' && <span className="shrink-0 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desec</span>}
            {reasonId && <span id={reasonId} className="sr-only">{reason}</span>}
            <select
              className={`${selectCls} h-7 py-0 pr-1 text-xs shrink-0`}
              value={tier}
              disabled={disabled}
              onChange={(e) => onPickTier(m.id, Number(e.target.value))}
              // "T1 · 165–179" means nothing without knowing which mod it belongs to.
              aria-label={`${isEssence ? 'Essence level' : 'Target tier'} for ${m.text}`}
              {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            >
              {m.tiers.map((ti) => <option key={ti.display} value={ti.display}>{tierOption(m, ti)}</option>)}
            </select>
            <button
              onClick={() => onAdd(m, tier)}
              disabled={disabled}
              className="shrink-0 grid h-7 w-7 place-items-center rounded-md border border-border text-lg leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
              aria-label={`Add ${m.text} at ${tierOption(m, m.tiers.find((x) => x.display === tier) ?? m.tiers[0]!)}`}
              {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

const EngineLab: React.FC = () => {
  const [data, setData] = useState<PatchData | null>(null);
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof loadEngine>> | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

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

  const [result, setResult] = useState<EngineResult | null>(null);
  const [alts, setAlts] = useState<EngineAlternatives | null>(null);
  const [markov, setMarkov] = useState<EngineMarkovResult | null>(null);
  const [altBudget, setAltBudget] = useState<number>(0);
  const [runErr, setRunErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const excludedKeys = toExcludedKeys(useExclusions());
  const effort = useEffort();
  // "Raise Search effort" is the app's standing answer to a solve that stopped early, and it is good
  // advice at every preset but the top one — where it points at a control with nothing above it. The
  // honest thing there is to say the solver has given everything it has.
  const topped = isTopEffort(effort);
  // Name the actual top preset rather than hardcoding a word. This said "Maximum", which matched no
  // preset on the ladder at all — it was Patient, and is now Exhaustive — so the app was telling
  // people to look for a setting that did not exist.
  const topLabel = EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.label;
  const tightenAdvice = topped
    ? <>at <strong>{topLabel}</strong> this is as tight as the solver gets</>
    : <>raise <strong>Search effort</strong> to tighten the price</>;
  const finishAdvice = topped
    ? <>This is <strong>{topLabel}</strong> already — the craft is beyond what the solver can settle.</>
    : <>Raise <strong>Search effort</strong> to let it finish.</>;
  const cancelRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);
  const [mode, setMode] = useMode();

  useEffect(() => {
    prewarm(); // spin up the solver worker alongside the data load, not on the first click
    loadEngine()
      .then((eng) => {
        setEngine(eng);
        setData(eng.data);
        const bases = listBases(eng.data);
        // Only DEFAULT the base — never overwrite one restored from the workspace, or a reload would
        // silently drag the user back to Wands.
        setBaseId((b) => b || bases.find((x) => x.id === 'Wands')?.id || bases[0]?.id || '');
      })
      .catch((e) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const bases: EngineBase[] = useMemo(() => (data ? listBases(data) : []), [data]);
  // The target pool = rollable + regular-essence mods (listMods) PLUS desecrated mods (Desecration on
  // a Rare) PLUS perfect-essence mods (a Perfect Essence on a Rare, which adds its mod while eating
  // one at random). All three need the item Rare first, so all three depend on the add-chain reaching
  // Regal — the planner reports it when a target can't get there.
  const mods = useMemo(() => {
    if (!(data && baseId)) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    const m = listMods(data, baseId);
    const extra = [...listDesecrated(data, baseId), ...listPerfectEssences(data, baseId)];
    return {
      prefixes: [...m.prefixes, ...extra.filter((x) => x.type === 'prefix')],
      suffixes: [...m.suffixes, ...extra.filter((x) => x.type === 'suffix')],
    };
  }, [data, baseId]);
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...mods.prefixes, ...mods.suffixes]) m.set(x.id, x);
    return m;
  }, [mods]);

  // Reset the craft when the base changes — but NOT on mount, or a restored workspace would be wiped
  // the moment it loaded.
  useOnChange(baseId, () => {
    setTargets([]);
    setResult(null);
    setAlts(null);
    setRunErr(null);
    setSearch('');
    setPickTier({});
    setFractured(new Set());
    setPinned(new Set());
  });


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
  const normalTargets = targets.filter((t) => modById.get(t.modId)?.source === 'normal').length;
  // Via the facade's UI-shaped base list rather than the raw PatchData — same source the rest of
  // this component uses, so it can't disagree with what the picker is showing.
  const bossTargetable = bossOmenAllowed(bases.find((b) => b.id === baseId)?.category ?? '');
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
    }),
    [targets, modById, addingTo, fractured],
  );

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
  const toggleFractured = (modId: string) => {
    if (!fractured.has(modId) && regularEssenceUsed) return;
    setFractured((f) => { const n = new Set(f); n.has(modId) ? n.delete(modId) : n.add(modId); return n; });
  };
  // Pin a target as non-negotiable so the budget search never relaxes/swaps/drops it.
  const togglePinned = (modId: string) =>
    setPinned((p) => { const n = new Set(p); n.has(modId) ? n.delete(modId) : n.add(modId); return n; });

  // Clear the whole craft (targets, tier picks, fractured marks, results) — keeps the base + item level.
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

  // A shared link wins over whatever was saved locally — you clicked it expecting to see that item —
  // but never silently: the previous workspace is snapshotted so the toast can put it back.
  useEffect(() => {
    if (!data) return; // ids can only be validated once the patch data is loaded
    const payload = new URLSearchParams(window.location.search).get('s');
    if (!payload) return;
    // Drop `?s=` immediately, so a later reload doesn't re-apply a stale link over newer work.
    window.history.replaceState(null, '', window.location.pathname);
    const decoded = decodeWorkspace(payload, data);
    if (!decoded) {
      toast.error('That link could not be read', { description: 'It looks truncated or is from a newer version.' });
      return;
    }
    const previous = getWorkspace();
    setWorkspace(decoded.workspace);
    const missing = decoded.dropped.length;
    toast.success('Loaded from link', {
      description: missing > 0
        // "mods" was wrong: `dropped` can also hold a base id this build doesn't have. Counting a base
        // as a mod sends the reader looking for a missing modifier that was never the problem.
        ? `${missing} entr${missing === 1 ? 'y' : 'ies'} in the link aren’t part of this build and were left out.`
        : undefined,
      action: { label: 'Undo', onClick: () => setWorkspace(previous) },
    });
  }, [data]);

  // What a screen reader should hear when a solve lands. Derived, not stored: it must never describe
  // a result that is no longer on screen.
  const outcome = !result ? '' : result.frontier.length === 0
    ? 'No achievable plan — every route scored zero.'
    : `${result.frontier.length} plan${result.frontier.length === 1 ? '' : 's'} found.`
      + (() => {
        const best = result.frontier[recommendedIndex(result.frontier)] ?? result.frontier[0];
        return best ? ` Best value: ${fmtPct(best.probability)} per attempt.` : '';
      })()
      + (alts ? ` ${alts.rows.length} budget alternative${alts.rows.length === 1 ? '' : 's'} listed.` : '');

  const reset = () => {
    setTargets([]);
    setPickTier({});
    setFractured(new Set());
    setPinned(new Set());
    setResult(null);
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
  const compute = () => {
    if (!engine || targets.length === 0) return;
    const runId = ++runIdRef.current; // see ItemActions.compute — guards against a superseded run
    const current = () => runIdRef.current === runId;

    setComputing(true);
    setRunErr(null);
    setProgress(null);

    const fromItem = fractured.size > 0;
    const b = Number(budget);
    const hasBudget = budget.trim() !== '' && Number.isFinite(b) && b > 0;
    const want: AltTargetInput[] = targets.map((t) => (pinned.has(t.modId) ? { ...t, pinned: true } : t));
    // A blank field means "no opinion", which is NOT the same as zero — it defers to the app's default.
    // 0 typed explicitly is a real answer (bases are free) and must reach the solver as one, so the
    // test is on the string being non-empty, not on the number being truthy.
    const bc = Number(baseCost);
    const hasBaseCost = baseCost.trim() !== '' && Number.isFinite(bc) && bc >= 0;

    const handle = solve({
      kind: 'lab',
      from: fromItem ? { item: carvedItem() } : { baseId, level },
      targets,
      ...(hasBudget ? { budget: b, want } : {}),
      ...(hasBaseCost ? { baseCost: bc } : {}),
      effort: limitsFor(effort),
      ...(excludedKeys.length > 0 ? { excluded: excludedKeys } : {}),
    }, (p) => { if (current()) setProgress(p); });
    cancelRef.current = handle.cancel;

    handle.promise
      .then((res) => {
        if (!current() || res.kind !== 'lab') return;
        setResult(res.result);
        setAlts(res.alts);
        setMarkov(res.markov);
        if (res.alts) setAltBudget(b);
      })
      .catch((e) => {
        if (!current() || isCancelled(e)) return;
        setResult(null);
        setAlts(null);
        setRunErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!current()) return;
        cancelRef.current = null;
        setComputing(false);
        setProgress(null);
      });
  };

  const cancel = () => { cancelRef.current?.(); };

  if (loadErr) {
    return (
      <Card className="p-6">
        <p className="text-destructive font-medium">Failed to load engine data</p>
        <p className="text-sm text-muted-foreground mt-1">{loadErr}</p>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center gap-3 p-8 text-muted-foreground">
        <Spinner /> Loading patch data…
      </div>
    );
  }

  const canCompute = targets.length > 0 && !computing && !essenceFractureConflict;

  const onPickTier = (modId: string, t: number) => setPickTier((p) => ({ ...p, [modId]: t }));

  const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded ${active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        <button
          className={`${tabCls(mode === 'plan')} ${FOCUS_RING}`}
          onClick={() => setMode('plan')}
          aria-pressed={mode === 'plan'}
        >
          Plan from scratch
        </button>
        <button
          className={`${tabCls(mode === 'item')} ${FOCUS_RING}`}
          onClick={() => setMode('item')}
          aria-pressed={mode === 'item'}
        >
          I have an item
        </button>
      </div>

      {mode === 'item' ? <ItemActions /> : (<>
      {/* Setup */}
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget <span className="font-normal normal-case opacity-70">(exalts, optional)</span>
            </span>
            <input
              type="number" min={0} step="any" value={budget} placeholder="ex"
              onChange={(e) => setBudget(e.target.value)}
              className={`${selectCls} w-28`}
              title="What you're willing to spend, in Exalted-Orb equivalents. Adds a panel showing the closest items this much money can actually finish."
            />
          </label>
          {/* Only a from-WHITE craft can start over, so this is the one place the number means
              anything — a carved base is an item you hold and the planner may not bin it. */}
          {fractured.size === 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Base cost <span className="font-normal normal-case opacity-70">(exalts, optional)</span>
              </span>
              <input
                type="number" min={0} step="any" value={baseCost} placeholder="0"
                onChange={(e) => setBaseCost(e.target.value)}
                className={`${selectCls} w-28`}
                title="What another white base costs you. At 0 the planner will bin a nearly-finished item rather than pay to fix it — right if bases are free, wrong if they aren't."
              />
            </label>
          )}
          <SearchEffort />
          <div className="flex-1" />
          <Button variant="outline" onClick={share} disabled={targets.length === 0 && mode === 'plan'} size="lg" title="Copy a link that reproduces this workspace">
            Copy link
          </Button>
          <Button variant="outline" onClick={reset} disabled={targets.length === 0 && !result} size="lg">
            Reset
          </Button>
          <Button onClick={compute} disabled={!canCompute} size="lg">
            Find plans
          </Button>
        </div>

        <SearchEffortHint />

        <CurrencyExclusions />

        {computing && <SolveProgress progress={progress} onCancel={cancel} />}

        {/* The one place a finished solve is announced. `polite` so it waits for a pause rather than
            interrupting, and it lives outside the conditional above so the region exists before the
            text lands — a live region inserted together with its content is often not announced. */}
        <p className="sr-only" role="status" aria-live="polite">
          {computing ? '' : runErr ? `Could not compute: ${runErr}` : outcome}
        </p>

        {/* Mod picker */}
        <div>
          <label htmlFor="lab-mod-search" className="sr-only">Search modifiers to add as targets</label>
          <input
            id="lab-mod-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modifiers to add as targets…"
            className={`${selectCls} w-full mb-2`}
          />
          {/* Stacks on a phone. A bare `flex` kept both columns side by side at every width, so
              on a narrow screen each got half of it and the mod text was crushed to nothing. */}
          <div className="flex flex-col sm:flex-row gap-4">
            <ModColumn
              title="Prefixes" list={filtered.prefixes} count={counts.prefix}
              blockFor={blockFor} pickTier={pickTier} onPickTier={onPickTier} onAdd={addTarget}
            />
            <ModColumn
              title="Suffixes" list={filtered.suffixes} count={counts.suffix}
              blockFor={blockFor} pickTier={pickTier} onPickTier={onPickTier} onAdd={addTarget}
            />
          </div>
        </div>
      </Card>

      {/* Selected targets */}
      {targets.length > 0 && (
        <Card className="p-4 space-y-2">
          {/* A craft with no alternatives keeps the words it always had. "Slots" is the precise term
              but it is only worth teaching to someone who has just made a slot mean something. */}
          <h3 className="text-sm font-bold">
            {targets.length === slots.length
              ? `Target item (${targets.length} mod${targets.length !== 1 ? 's' : ''})`
              : `Target item (${slots.length} slot${slots.length !== 1 ? 's' : ''}, ${targets.length} mods)`}
          </h3>
          {addingTo !== null && (
            <p className="flex flex-wrap items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-[11px] text-sky-700 dark:text-sky-300">
              <span>Pick a mod above to add as an <strong>alternative</strong> — the slot is filled by whichever one lands.</span>
              <button
                onClick={() => setAddingTo(null)}
                className={`underline ${FOCUS_RING}`}
              >Cancel</button>
            </p>
          )}
          <div className="space-y-2">
            {/* Rendered by SLOT, not by target: a slot with alternatives is one position on the item
                and has to read as one, or a three-way choice looks like three mods you must all get. */}
            {slots.map((slot) => {
              const key = slot.id === undefined ? `solo-${targets[slot.members[0]!]!.modId}` : `slot-${slot.id}`;
              const isGroup = slot.members.length > 1;
              const rows = slot.members.map((memberIndex) => {
              const t = targets[memberIndex]!;
              const mod = modById.get(t.modId);
              if (!mod) return null;
              const isFractured = fractured.has(t.modId);
              const canFracture = mod.source === 'normal'; // only a rollable mod can be pre-carved on the base
              const isPinned = pinned.has(t.modId) || isFractured; // a carved mod is pinned by definition
              return (
                <div key={t.modId} className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 ${isFractured ? 'border-amber-500/60 bg-amber-500/10' : 'border-border/60'}`}>
                  <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">
                    {mod.type === 'prefix' ? 'P' : 'S'}
                  </Badge>
                  <span className="flex-1 min-w-40 text-sm">
                    {mod.text}
                    {mod.source === 'essence' && (
                      <span className="ml-1.5 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">essence-only</span>
                    )}
                    {mod.source === 'desecrated' && (
                      <span className="ml-1.5 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desecrated</span>
                    )}
                    {isFractured && <span className="ml-1.5 rounded bg-amber-500/20 px-1 text-[10px] text-amber-700 dark:text-amber-300">fractured</span>}
                  </span>
                  <select
                    className={selectCls}
                    value={t.tierDisplay}
                    disabled={isFractured}
                    onChange={(e) => patchTarget(t.modId, { tierDisplay: Number(e.target.value) })}
                    aria-label={`${mod.source === 'essence' ? 'Essence level' : 'Target tier'} for ${mod.text}`}
                    title={mod.source === 'essence' ? 'Essence level (fixes value, ilvl gate, and price)' : 'Target tier (or better)'}
                  >
                    {mod.tiers.map((ti) => (
                      <option key={ti.display} value={ti.display}>{ti.label}</option>
                    ))}
                  </select>
                  {canFracture && (() => {
                    // Locking a new fracture is blocked while an essence is in the craft (incompatible
                    // starts); an already-locked one can still be unlocked to resolve the conflict.
                    const lockBlocked = !isFractured && regularEssenceUsed;
                    const why = lockBlocked
                      ? 'Can’t fracture with an essence in the craft — an essence needs a Magic start, a fracture forces a Rare'
                      : isFractured ? 'Fractured (carved on the base) — click to unlock'
                      : 'Mark as already fractured on the base (locked; the craft starts from a Rare holding it)';
                    // A disabled control can't be focused, so its reason has to exist as text elsewhere.
                    const whyId = lockBlocked ? `why-fracture-${t.modId}` : undefined;
                    return (
                      <>
                        {whyId && <span id={whyId} className="sr-only">{why}</span>}
                        <button
                          onClick={() => toggleFractured(t.modId)}
                          disabled={lockBlocked}
                          aria-pressed={isFractured}
                          aria-label={`Fractured on the base: ${mod.text}`}
                          {...(whyId ? { 'aria-describedby': whyId } : {})}
                          className={`px-0.5 ${FOCUS_RING} ${isFractured ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'} ${lockBlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title={why}
                        >
                          <span aria-hidden="true">{isFractured ? '🔒' : '🔓'}</span>
                        </button>
                      </>
                    );
                  })()}
                  {/* A pin only BITES in the budget search, but it stays togglable without a budget so the
                      craft can be set up in either order. Hiding it meant typing a budget, pinning, then
                      clearing the budget silently stranded the pins: still stored, no longer visible or
                      reachable. The title carries the state instead — the control is honest about being
                      dormant rather than absent. */}
                  {isFractured && (
                    <span id={`why-pin-${t.modId}`} className="sr-only">
                      A fractured mod is already locked, so it’s never relaxed
                    </span>
                  )}
                  <button
                    onClick={() => !isFractured && togglePinned(t.modId)}
                    disabled={isFractured}
                    aria-pressed={isPinned}
                    aria-label={`Pin as non-negotiable: ${mod.text}`}
                    {...(isFractured ? { 'aria-describedby': `why-pin-${t.modId}` } : {})}
                    className={`px-0.5 ${FOCUS_RING} ${isPinned ? 'opacity-100' : 'opacity-40 hover:opacity-100'} ${isFractured ? 'cursor-not-allowed' : ''}`}
                    title={isFractured
                      ? 'A fractured mod is already locked, so it’s never relaxed'
                      : isPinned
                        ? `Pinned — ${pinEffect}. Click to unpin.`
                        : `Pin as non-negotiable: ${pinEffect}`}
                  >
                    <span aria-hidden="true">📌</span>
                  </button>
                  <button
                    onClick={() => removeTarget(t.modId)}
                    className={`text-muted-foreground hover:text-destructive px-1 ${FOCUS_RING}`}
                    aria-label={`Remove ${mod.text} from the target`}
                    title="Remove"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              );
              });
              /* An "or" invitation belongs on every slot — the affordance IS the discovery, and a
                 control that only appeared on slots already grouped could never be found. */
              const orButton = (
                <button
                  onClick={() => startAlternative(slot.members[0]!)}
                  className={`shrink-0 rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/50 ${FOCUS_RING}`}
                  title={`Add an alternative: this slot is filled by whichever of its mods lands, so you don’t have to pick one`}
                >
                  <span aria-hidden="true">⊕ </span>or…
                </button>
              );
              if (!isGroup) {
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
                </div>
              );
            })}
          </div>
          {slots.some((sl) => sl.members.length > 1) && (
            /* Answered honestly rather than left to be discovered: an alternative eases ONE slot, so a
               target with six of them gains far less than a small one. Measured on Wands from white —
               a three-way slot took a 4-slot craft 62% cheaper and a 6-slot craft 23% cheaper. */
            <p className="text-[11px] text-muted-foreground">
              ⊕ An alternative slot is filled by whichever of its mods lands, so it never costs you a
              choice. It eases <strong>one</strong> slot, though — expect a bigger saving on a short
              target than on a full six-mod one.
            </p>
          )}
          {essenceFractureConflict && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ This craft can’t be planned: a regular <strong>essence</strong> needs a <strong>Magic</strong> item,
              but a <strong>fractured</strong> mod makes the craft start from a <strong>Rare</strong>. Unlock the
              fractured mod (🔒→🔓) or remove the essence-only mod. To end up with a fractured mod, craft the item
              from white first, then fracture it — that last step doesn’t change this plan’s odds.
            </p>
          )}
          {regularEssenceUsed && (
            <p className="text-[11px] text-muted-foreground">
              Essence-only mods can only be applied by an essence (on a Magic item, turning it Rare).
              The level you pick fixes the value, its item-level gate, and the essence’s price — so the
              target must also include at least one rollable mod for the essence to land on.
            </p>
          )}
          {/* The pin's only other explanation is a tooltip — which touch never shows, and a screen reader
              only reaches on focus. So this line is always visible: the problem is discovery, not recall.
              It states the TRADE-OFF rather than just the mechanic, because the obvious-looking default
              (pin everything) is the one setting that breaks the panel: all three relaxation moves skip a
              pinned slot, so a fully pinned target collapses the frontier to the exact item alone. */}
          <p className="text-[11px] text-muted-foreground">
            📌 Pins a mod as <strong>non-negotiable</strong>. Given a budget, the search relaxes, swaps or
            drops <strong>unpinned</strong> mods to find something you can actually afford — so pin only
            what you’d never trade away. Pin everything and there’s nothing left for it to search.
          </p>
          {fractured.size > 0 && (
            <p className="text-[11px] text-muted-foreground">
              🔒 Fractured mods are treated as already carved on the base — the plan starts from a Rare
              holding them and rolls the rest around them (using the keep-your-item cost model). They’re
              never rerolled and are excluded from what an Annulment / Chaos can hit.
            </p>
          )}
          {desecratedUsed && (
            <p className="text-[11px] text-muted-foreground">
              <span className="text-rose-600 dark:text-rose-300">desecrated</span> mods are added by a
              Desecration. A bone offers <strong>three</strong> modifiers and you keep one — you can’t
              decline, so if all three are bad you still take one.{' '}
              {bossTargetable ? (
                <>The boss omen that targets this mod narrows each of the three to a count-uniform
                1-in-N over that boss’s pool (weights are unknown, so this is an approximation).</>
              ) : (
                <>The boss omens are <strong>Weapon or Jewellery only</strong>, so on this base the
                draw can’t be narrowed — and it isn’t over desecrated mods alone, since{' '}
                <strong>ordinary mods sit in the same pool</strong>. On a Body Armour the desecrated mod
                you asked for turns up in the offer about <strong>1 time in 45</strong>; you are only
                stuck with a desecrated mod you didn’t want when all three are, about 1 in 3,300.</>
              )}
              {normalTargets < 3 && fractured.size === 0 && (
                <> From scratch, a Desecration needs a Rare first, so include <strong>3 rollable mods</strong> (or
                start from an item) — otherwise this search comes back empty. (In game you could instead
                roll three throwaway mods and annul them off; the planner doesn’t look for that.)</>
              )}
            </p>
          )}
        </Card>
      )}

      {/* Results */}
      {/* "Cannot craft this target" asserted about the GAME over a message that may only describe a
          restriction of this planner (some throws are real rules like ">3 prefixes"; others are not).
          Naming the planner is accurate either way, and the message underneath carries the specifics. */}
      {runErr && (
        <Card className="p-4">
          <p className="text-destructive font-medium text-sm">The planner can’t build this target</p>
          <p className="text-sm text-muted-foreground mt-1">{runErr}</p>
        </Card>
      )}

      {/* Same rule as ItemActions: there are two ways to have no true cost and the card must cover
          both, or the panel loses half its content with no explanation. Keyed on the NEGATION of the
          condition below so the two are exhaustive by construction. */}
      {markov && !runErr && result && !(markov.applicable && markov.feasible) && markov.reason && (
        <Card className="p-4">
          <p className="text-sm font-medium">No true expected cost for this craft</p>
          <p className="text-sm text-muted-foreground mt-1">{markov.reason}</p>
        </Card>
      )}

      {/* The true expected cost + policy route, the same model the Item tab uses. From a white base the
          policy may also simply start over, which is why its number is believable here (see
          WHITE_BASE_COST in solve.ts). */}
      {markov && !runErr && markov.applicable && markov.feasible && (
        <Card className="p-4 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold">True expected cost</h3>
            <span className="text-2xl font-bold tabular-nums text-primary" title={exactExalts(markov.expectedCost)}>
              {formatBoundedCost(markov.bound, markov.expectedCost, engine ? priceBasis(engine).rates : undefined)}
            </span>
          </div>
          {/* Which way an unfinished solve leans depends on how it was started, so the copy follows
              `bound` rather than guessing. From a white base the solver seeds from a policy that never
              restarts — a real, if expensive, way to finish — and works DOWN from it, so stopping early
              leaves a ceiling. From an item it starts at zero and works up, leaving a floor. */}
          {markov.bound === 'upper' && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ The solver stopped before this number settled, so it is a <strong>ceiling</strong> — the
              real cost is at most this, and usually well under it. The route below is already the right
              shape — {tightenAdvice}.
            </p>
          )}
          {markov.bound === 'lower' && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ The solver stopped before this number settled, so it is a <strong>floor</strong> — the
              real cost is at least this and may be higher. {finishAdvice}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            The average spend to reach this target playing the optimal policy — it weighs orb strengths
            and side omens, recovers in place after a bad roll, and, when another base costs less than
            the repair, may also decide the cheapest move is to
            {' '}<strong>bin what you have and start again</strong>.
            The step routes below are the simpler per-plan view: one fixed sequence, every slam hitting
            a named mod.
          </p>
          <PolicyGraph result={markov} rates={engine ? priceBasis(engine).rates : undefined} />
        </Card>
      )}

      {result && !runErr && (
        <FrontierView
          result={result}
          priceBasis={engine ? priceBasis(engine) : undefined}
          // Ordered most specific first: a wrong-but-plausible reason is worse than none, and the
          // generic tier-gate message was being shown for a craft that simply never reaches Rare.
          emptyHint={desecrationNeedsRare ? (
                <p>A Desecration needs a <strong>Rare</strong> item, and from scratch the item only
                  becomes Rare after three mods (Transmutation → Augmentation → Regal). This target
                  has {normalTargets} rollable mod{normalTargets === 1 ? '' : 's'}, so the planner has
                  nothing to spend those three on.{' '}
                  <strong>In game you can still do this</strong>: roll three throwaway mods, annul them
                  off (the item stays Rare), then Desecrate. The planner doesn’t search that yet — every
                  step it builds adds a mod you asked for, so it can’t propose filler. Until it does,
                  add rollable mods until there are three, or start from a Rare item you already hold.</p>
              ) : excludedKeys.length > 0 ? (
                <p>No plan avoids the {excludedKeys.length} currenc{excludedKeys.length === 1 ? 'y' : 'ies'} you
                  excluded. Untick some under “Currency I don’t have” to widen the search — or the target may be
                  out of reach anyway, which this can’t tell you without re-running it unrestricted.</p>
              ) : undefined}
        />
      )}
      {alts && !runErr && <AlternativesView alts={alts} budget={altBudget} rates={engine ? priceBasis(engine).rates : undefined} />}
      </>)}
    </div>
  );
};

export default EngineLab;
