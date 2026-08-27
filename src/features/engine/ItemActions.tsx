import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import {
  loadEngine, listBases, listMods, listPerfectEssences, listDesecrated, currencyActions,
  priceBasis,
  modFamilies,
  type EngineBase, type EngineMod, type ExistingItem, type ItemModInput, type CurrencyAction,
  type TargetInput, type EngineResult, type EngineMarkovResult,
} from '../../lib/engine';
import { solve, isCancelled, prewarm } from '../../lib/engineClient';
import type { SolveProgress as Progress } from '../../lib/solve';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import { SearchEffort, SearchEffortHint } from './SearchEffort';
import { useField, useOnChange } from '../../lib/workspace';
import { nextSlotId, slotsOf, whyNotAdd } from '../../lib/targetSlots';
import { exactExalts, formatBoundedCost, formatCost, formatIn, pickUnit } from '../../lib/currency';
import FrontierView from './FrontierView';
import PolicyGraph from './PolicyGraph';
import PriceBasisNote from './PriceBasisNote';
import SolveProgress from './SolveProgress';
import CurrencyExclusions from './CurrencyExclusions';
import BaseSelect from './BaseSelect';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

// Bare <button>s miss the Button component's ring (button.tsx), falling back to the browser default —
// visible, but inconsistent with the rest of the app.
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

function fmtPct(p: number): string {
  const pct = p * 100;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.01) return `${pct.toFixed(3)}%`;
  if (pct <= 0) return '0%';
  return `${pct.toPrecision(2)}%`;
}

/** Plain-language odds for a single orb: "guaranteed" at P=1, else "≈ 1 in N each orb". */
function oddsText(p: number): string {
  if (p >= 1) return 'guaranteed';
  if (p <= 0) return '—';
  return `≈ 1 in ${Math.round(1 / p).toLocaleString()} each orb`;
}

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

  // Option 1 (quick check) selections.
  const [addModId, setAddModId] = useState<string | null>(null);
  const [removeModId, setRemoveModId] = useState<string | null>(null);

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
  }, []);

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
    setPrefixes([]); setSuffixes([]); setAddModId(null); setRemoveModId(null);
    setTarget([]); setPlan(null); setPlanErr(null); setSearch('');
  });
  // Dropping to magic can overflow the 1-per-side cap; trim to keep the item legal.
  useEffect(() => {
    setPrefixes((p) => p.slice(0, CAP[rarity]));
    setSuffixes((s) => s.slice(0, CAP[rarity]));
    setPlan(null); setPlanErr(null);
  }, [rarity]);

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
    if (removeModId === modId) setRemoveModId(null);
    if (addModId === modId) setAddModId(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pick = (list: readonly EngineMod[]) =>
      (q ? list.filter((m) => m.text.toLowerCase().includes(q)) : list).filter((m) => !onItem.has(m.id));
    return { prefixes: pick(pool.prefixes), suffixes: pick(pool.suffixes) };
  }, [pool, search, onItem]);

  // "Mod to add" (quick-check) — currency can only add NORMAL mods, so desecrated ones are excluded here.
  const addable = useMemo(
    () => [...pool.prefixes, ...pool.suffixes].filter((m) => !onItem.has(m.id) && m.source === 'normal'),
    [pool, onItem],
  );
  const itemMods = useMemo(
    () => [...prefixes, ...suffixes].map((m) => modById.get(m.modId)).filter((m): m is EngineMod => !!m),
    [prefixes, suffixes, modById],
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

  // ── Option 1: quick currency check ──────────────────────────────────────────
  const actions: CurrencyAction[] = useMemo(() => {
    if (!engine || !baseId || (!addModId && !removeModId)) return [];
    const sel: { addModId?: string; removeModId?: string } = {};
    if (addModId) sel.addModId = addModId;
    if (removeModId) sel.removeModId = removeModId;
    try { return currencyActions(engine, item, sel); } catch { return []; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, baseId, level, rarity, prefixes, suffixes, addModId, removeModId]);

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
        <>
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold">What do you want to do?</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mod to add</span>
                <select className={`${selectCls} min-w-72`} value={addModId ?? ''} onChange={(e) => setAddModId(e.target.value || null)}>
                  <option value="">— none —</option>
                  {addable.map((m) => <option key={m.id} value={m.id}>{m.type === 'prefix' ? 'P' : 'S'} · {m.text}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mod to sacrifice (Chaos / Annul)</span>
                <select className={`${selectCls} min-w-72`} value={removeModId ?? ''} onChange={(e) => setRemoveModId(e.target.value || null)}>
                  <option value="">— none —</option>
                  {itemMods.map((m) => <option key={m.id} value={m.id}>{m.type === 'prefix' ? 'P' : 'S'} · {m.text}</option>)}
                </select>
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              These odds are the chance of a <strong>single orb</strong> doing exactly what you asked. How many
              orbs it takes in total depends on your retry strategy — that’s the “Full plan” tab.
            </p>
          </Card>

          {actions.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Currency options</h2>
              {actions.map((a) => (
                // Key by label, not currency: Annulment appears twice (plain + Omen of Light) when the
                // sacrifice is a desecrated mod, and those must be distinct React keys.
                <Card key={a.label} className="p-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                  <div className="min-w-40">
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                  <div className="flex-1" />
                  {a.feasible ? (
                    <>
                      <div className="text-right">
                        <div className="text-xl font-bold tabular-nums text-primary">{fmtPct(a.prob)}</div>
                        <div className="text-[11px] text-muted-foreground">{oddsText(a.prob)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground w-24 text-right" title={exactExalts(a.cost)}>
                        {formatCost(a.cost, rates)} / orb
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">can’t apply — {a.reason}</div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-1">
              Pick a <strong>mod to add</strong> and/or a <strong>mod to sacrifice</strong> above to see what each currency can do.
            </p>
          )}
        </>
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
                  {[...addable, ...perfect, ...desecratedTargets].map((m) => {
                    const why = blockFor(m);
                    return (
                      <option key={m.id} value={m.id} disabled={why !== null}>
                        {m.type === 'prefix' ? 'P' : 'S'} · {m.text}
                        {m.source === 'perfect' ? ' · Perfect Essence' : m.source === 'desecrated' ? ' · Desecrated' : ''}
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
                  const have = onItem.has(t.modId);
                  return (
                    <div key={t.modId} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
                      <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{mod.type === 'prefix' ? 'P' : 'S'}</Badge>
                      <span className="flex-1 min-w-40 text-sm">{mod.text}</span>
                      {mod.source === 'desecrated' && <span className="text-[10px] rounded bg-rose-500/15 px-1 text-rose-600 dark:text-rose-300">desecrated</span>}
                      {mod.source === 'perfect' && <span className="text-[10px] rounded bg-purple-500/15 px-1 text-purple-600 dark:text-purple-300">perfect essence</span>}
                      {have && <span className="text-[10px] rounded bg-emerald-500/15 px-1 text-emerald-600 dark:text-emerald-300">already have</span>}
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

          {/* This panel shows TWO cost models and the note used to describe only one of them, labelled
              just "Cost model:". Worse, the one it described is the optimistic fiction — fromItem.ts
              says so in its own header — while "True expected cost" below it deliberately models the
              opposite. Naming both is the honest version, and it explains why the two numbers differ. */}
          <p className="text-[11px] text-muted-foreground px-1">
            <strong>Two cost models below.</strong> The step plan assumes that on a miss you reset to <em>your</em>{' '}
            item and retry — so it never throws away the mods you started with, but it also assumes you can replace
            that item for free, which for an item you already hold you cannot. <strong>True expected cost</strong>{' '}
            makes no such assumption: a miss leaves you in a worse state and the policy digs out of it in place.
            The two can differ by any amount and in <em>either</em> direction — a step plan is one fixed sequence
            where every slam must hit one named mod, so on a long-shot target it reads far <em>above</em> the true
            cost, while the policy adapts and takes whatever lands.
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
              // A held item cannot be replaced for free, so the restart-model ranking is fiction here:
              // it buries 158.7ex Annuls behind a 0.1% gate to avoid paying for them and calls the
              // result "cheapest". Lead with the likeliest route instead.
              freeRestart={false}
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
