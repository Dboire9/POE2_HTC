import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import {
  loadEngine, listBases, listMods, listDesecrated,
  priceBasis,
  modFamilies,
  type EngineBase, type EngineMod, type EngineResult, type TargetInput, type ExistingItem,
  type EngineAlternatives, type AltTargetInput,
} from '../../lib/engine';
import { solve, isCancelled, prewarm } from '../../lib/engineClient';
import type { SolveProgress as Progress } from '../../lib/solve';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import ItemActions from './ItemActions';
import FrontierView from './FrontierView';
import AlternativesView from './AlternativesView';
import SolveProgress from './SolveProgress';
import BaseSelect from './BaseSelect';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

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
  readonly count: number;
  readonly occupiedFamilies: ReadonlySet<string>;
  readonly essenceUsed: boolean;
  readonly hasFractured: boolean;
  readonly desecratedUsed: boolean;
  readonly pickTier: Record<string, number>;
  readonly onPickTier: (modId: string, tier: number) => void;
  readonly onAdd: (mod: EngineMod, tier: number) => void;
}

// Module-level (NOT defined inside EngineLab): a component created inside render gets a fresh identity
// each render, so React would remount this whole subtree on every keystroke — dropping the search box's
// focus and detaching the "+" buttons mid-interaction. Hoisting it fixes both.
const ModColumn: React.FC<ModColumnProps> = ({
  title, list, count, occupiedFamilies, essenceUsed, hasFractured, desecratedUsed, pickTier, onPickTier, onAdd,
}) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{count}/3</span>
    </div>
    <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
      {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {list.map((m) => {
        const sideFull = count >= 3;
        const famTaken = modFamilies(m).some((f) => occupiedFamilies.has(f));
        const isEssence = m.source === 'essence';
        const essenceBlocked = isEssence && (essenceUsed || hasFractured);
        const desecratedBlocked = m.source === 'desecrated' && desecratedUsed;
        const disabled = sideFull || famTaken || essenceBlocked || desecratedBlocked;
        const reason = famTaken
          ? `Family “${m.family}” is already on the item — one mod per family`
          : essenceBlocked ? (essenceUsed ? 'Only one essence-only mod per craft'
            : 'Can’t use an essence with a fractured mod — an essence needs a Magic start, a fracture forces a Rare')
          : desecratedBlocked ? 'An item can hold at most one desecrated mod'
          : sideFull ? 'This side is full (max 3)' : '';
        const tier = pickTier[m.id] ?? 1;
        return (
          <div
            key={m.id}
            className={`flex items-center gap-1.5 px-2 py-1 ${disabled ? 'opacity-40' : ''}`}
            title={disabled ? reason : m.id}
          >
            <span className="flex-1 min-w-0 truncate text-sm">{m.text}</span>
            {isEssence && <span className="shrink-0 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">ess</span>}
            {m.source === 'desecrated' && <span className="shrink-0 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desec</span>}
            <select
              className={`${selectCls} h-7 py-0 pr-1 text-xs shrink-0`}
              value={tier}
              disabled={disabled}
              onChange={(e) => onPickTier(m.id, Number(e.target.value))}
              title={isEssence ? 'Essence level' : 'Target tier (or better)'}
            >
              {m.tiers.map((ti) => <option key={ti.display} value={ti.display}>{tierOption(m, ti)}</option>)}
            </select>
            <button
              onClick={() => onAdd(m, tier)}
              disabled={disabled}
              className="shrink-0 grid h-7 w-7 place-items-center rounded-md border border-border text-lg leading-none hover:bg-accent disabled:cursor-not-allowed"
              title={disabled ? reason : `Add “${m.text}” at ${tierOption(m, m.tiers.find((x) => x.display === tier) ?? m.tiers[0]!)}`}
            >
              +
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

  const [baseId, setBaseId] = useState<string>('');
  const [level, setLevel] = useState<number>(82);
  const [targets, setTargets] = useState<TargetInput[]>([]);
  const [search, setSearch] = useState('');
  // Per-mod tier chosen in the picker BEFORE adding (default T1 = display 1); the "+" commits mod+tier.
  const [pickTier, setPickTier] = useState<Record<string, number>>({});
  // Targets the user marks as already FRACTURED ("carved") on the base — the craft starts from a Rare
  // holding these (locked, never removed) and rolls the rest around them (routes via the from-item planner).
  const [fractured, setFractured] = useState<Set<string>>(new Set());
  // Targets pinned as non-negotiable: the budget search never relaxes, swaps or drops them.
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  // Optional spend cap (exalt-equivalents). Empty ⇒ no alternatives panel; the frontier alone is shown.
  const [budget, setBudget] = useState<string>('');

  const [result, setResult] = useState<EngineResult | null>(null);
  const [alts, setAlts] = useState<EngineAlternatives | null>(null);
  const [altBudget, setAltBudget] = useState<number>(0);
  const [runErr, setRunErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);
  const [mode, setMode] = useState<'plan' | 'item'>('plan');

  useEffect(() => {
    prewarm(); // spin up the solver worker alongside the data load, not on the first click
    loadEngine()
      .then((eng) => {
        setEngine(eng);
        setData(eng.data);
        const bases = listBases(eng.data);
        setBaseId(bases.find((b) => b.id === 'Wands')?.id ?? bases[0]?.id ?? '');
      })
      .catch((e) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const bases: EngineBase[] = useMemo(() => (data ? listBases(data) : []), [data]);
  // The target pool = rollable + essence mods (listMods) PLUS desecrated mods, which are craftable via
  // a Desecration (from white: build a Rare, then Desecrate; from an item: Desecrate onto an open slot).
  const mods = useMemo(() => {
    if (!(data && baseId)) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    const m = listMods(data, baseId);
    const des = listDesecrated(data, baseId);
    return {
      prefixes: [...m.prefixes, ...des.filter((x) => x.type === 'prefix')],
      suffixes: [...m.suffixes, ...des.filter((x) => x.type === 'suffix')],
    };
  }, [data, baseId]);
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...mods.prefixes, ...mods.suffixes]) m.set(x.id, x);
    return m;
  }, [mods]);

  // Reset the craft when the base changes.
  useEffect(() => {
    setTargets([]);
    setResult(null);
    setAlts(null);
    setRunErr(null);
    setSearch('');
    setPickTier({});
    setFractured(new Set());
    setPinned(new Set());
  }, [baseId]);

  const selectedIds = useMemo(() => new Set(targets.map((t) => t.modId)), [targets]);
  const prefixCount = targets.filter((t) => modById.get(t.modId)?.type === 'prefix').length;
  const suffixCount = targets.filter((t) => modById.get(t.modId)?.type === 'suffix').length;
  // A regular essence needs a Magic item and turns it Rare, so at most one essence-only mod per craft.
  const essenceUsed = targets.some((t) => modById.get(t.modId)?.source === 'essence');
  const desecratedUsed = targets.some((t) => modById.get(t.modId)?.source === 'desecrated');
  const normalTargets = targets.filter((t) => modById.get(t.modId)?.source === 'normal').length;
  // A regular essence needs a MAGIC start; a fractured mod makes the craft start from a RARE. They can't
  // coexist in one plan — flag it so the UI blocks the combination instead of erroring at compute time.
  const essenceFractureConflict = essenceUsed && fractured.size > 0;

  // Family exclusion: an item holds at most one mod per family. Families already claimed by a target
  // are locked out of the picker so an impossible (always-0%) target can't be built in the first place.
  const occupiedFamilies = useMemo(() => {
    const s = new Set<string>();
    for (const t of targets) for (const fam of modFamilies(modById.get(t.modId))) s.add(fam);
    return s;
  }, [targets, modById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pick = (list: readonly EngineMod[]) =>
      (q ? list.filter((m) => m.text.toLowerCase().includes(q)) : list).filter((m) => !selectedIds.has(m.id));
    return { prefixes: pick(mods.prefixes), suffixes: pick(mods.suffixes) };
  }, [mods, search, selectedIds]);

  const addTarget = (mod: EngineMod, tierDisplay = 1) => {
    if (targets.some((t) => t.modId === mod.id)) return;
    if (mod.type === 'prefix' && prefixCount >= 3) return;
    if (mod.type === 'suffix' && suffixCount >= 3) return;
    if (modFamilies(mod).some((f) => occupiedFamilies.has(f))) return; // one mod per family (any of them)
    if (mod.source === 'essence' && essenceUsed) return; // one essence-only mod per craft
    if (mod.source === 'essence' && fractured.size > 0) return; // essence needs Magic; a fracture forces Rare
    if (mod.source === 'desecrated' && desecratedUsed) return; // an item holds at most one desecrated mod
    setTargets((t) => [...t, { modId: mod.id, tierDisplay }]);
  };
  const removeTarget = (modId: string) => {
    setTargets((t) => t.filter((x) => x.modId !== modId));
    setFractured((f) => { const n = new Set(f); n.delete(modId); return n; });
    setPinned((p) => { const n = new Set(p); n.delete(modId); return n; });
  };
  const patchTarget = (modId: string, patch: Partial<TargetInput>) =>
    setTargets((t) => t.map((x) => (x.modId === modId ? { ...x, ...patch } : x)));
  // Mark a target as already fractured on the base (locked) — or clear it. Locking a NEW one is blocked
  // while an essence is in the craft (essence needs Magic, a fracture forces a Rare start); unlocking is
  // always allowed so the user can resolve the conflict.
  const toggleFractured = (modId: string) => {
    if (!fractured.has(modId) && essenceUsed) return;
    setFractured((f) => { const n = new Set(f); n.has(modId) ? n.delete(modId) : n.add(modId); return n; });
  };
  // Pin a target as non-negotiable so the budget search never relaxes/swaps/drops it.
  const togglePinned = (modId: string) =>
    setPinned((p) => { const n = new Set(p); n.has(modId) ? n.delete(modId) : n.add(modId); return n; });

  // Clear the whole craft (targets, tier picks, fractured marks, results) — keeps the base + item level.
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

    const handle = solve({
      kind: 'lab',
      from: fromItem ? { item: carvedItem() } : { baseId, level },
      targets,
      ...(hasBudget ? { budget: b, want } : {}),
    }, (p) => { if (current()) setProgress(p); });
    cancelRef.current = handle.cancel;

    handle.promise
      .then((res) => {
        if (!current() || res.kind !== 'lab') return;
        setResult(res.result);
        setAlts(res.alts);
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
        <button className={tabCls(mode === 'plan')} onClick={() => setMode('plan')}>Plan from scratch</button>
        <button className={tabCls(mode === 'item')} onClick={() => setMode('item')}>I have an item</button>
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
              Budget <span className="font-normal normal-case opacity-70">(optional)</span>
            </span>
            <input
              type="number" min={0} step="any" value={budget} placeholder="ex"
              onChange={(e) => setBudget(e.target.value)}
              className={`${selectCls} w-28`}
              title="What you're willing to spend, in Exalted-Orb equivalents. Adds a panel showing the closest items this much money can actually finish."
            />
          </label>
          <div className="flex-1" />
          <Button variant="outline" onClick={reset} disabled={targets.length === 0 && !result} size="lg">
            Reset
          </Button>
          <Button onClick={compute} disabled={!canCompute} size="lg">
            Compute frontier
          </Button>
        </div>

        {computing && <SolveProgress progress={progress} onCancel={cancel} />}

        {/* Mod picker */}
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modifiers to add as targets…"
            className={`${selectCls} w-full mb-2`}
          />
          <div className="flex gap-4">
            <ModColumn
              title="Prefixes" list={filtered.prefixes} count={prefixCount}
              occupiedFamilies={occupiedFamilies} essenceUsed={essenceUsed} hasFractured={fractured.size > 0}
              desecratedUsed={desecratedUsed} pickTier={pickTier} onPickTier={onPickTier} onAdd={addTarget}
            />
            <ModColumn
              title="Suffixes" list={filtered.suffixes} count={suffixCount}
              occupiedFamilies={occupiedFamilies} essenceUsed={essenceUsed} hasFractured={fractured.size > 0}
              desecratedUsed={desecratedUsed} pickTier={pickTier} onPickTier={onPickTier} onAdd={addTarget}
            />
          </div>
        </div>
      </Card>

      {/* Selected targets */}
      {targets.length > 0 && (
        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-bold">Target item ({targets.length} mod{targets.length !== 1 ? 's' : ''})</h3>
          <div className="space-y-2">
            {targets.map((t) => {
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
                    title={mod.source === 'essence' ? 'Essence level (fixes value, ilvl gate, and price)' : 'Target tier (or better)'}
                  >
                    {mod.tiers.map((ti) => (
                      <option key={ti.display} value={ti.display}>{ti.label}</option>
                    ))}
                  </select>
                  {canFracture && (() => {
                    // Locking a new fracture is blocked while an essence is in the craft (incompatible
                    // starts); an already-locked one can still be unlocked to resolve the conflict.
                    const lockBlocked = !isFractured && essenceUsed;
                    return (
                      <button
                        onClick={() => toggleFractured(t.modId)}
                        disabled={lockBlocked}
                        className={`px-0.5 ${isFractured ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'} ${lockBlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title={lockBlocked
                          ? 'Can’t fracture with an essence in the craft — an essence needs a Magic start, a fracture forces a Rare'
                          : isFractured ? 'Fractured (carved on the base) — click to unlock'
                          : 'Mark as already fractured on the base (locked; the craft starts from a Rare holding it)'}
                      >
                        {isFractured ? '🔒' : '🔓'}
                      </button>
                    );
                  })()}
                  {/* Pin only means something to the budget search, so don't offer it without a budget. */}
                  {budget.trim() !== '' && (
                    <button
                      onClick={() => !isFractured && togglePinned(t.modId)}
                      disabled={isFractured}
                      className={`px-0.5 ${isPinned ? 'opacity-100' : 'opacity-40 hover:opacity-100'} ${isFractured ? 'cursor-not-allowed' : ''}`}
                      title={isFractured
                        ? 'A fractured mod is already locked, so it’s never relaxed'
                        : isPinned
                          ? 'Pinned — the budget search will never relax, swap or drop this. Click to unpin.'
                          : 'Pin as non-negotiable: the budget search will never relax, swap or drop it'}
                    >
                      📌
                    </button>
                  )}
                  <button
                    onClick={() => removeTarget(t.modId)}
                    className="text-muted-foreground hover:text-destructive px-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          {essenceFractureConflict && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              ⚠ This craft can’t be planned: a regular <strong>essence</strong> needs a <strong>Magic</strong> item,
              but a <strong>fractured</strong> mod makes the craft start from a <strong>Rare</strong>. Unlock the
              fractured mod (🔒→🔓) or remove the essence-only mod. To end up with a fractured mod, craft the item
              from white first, then fracture it — that last step doesn’t change this plan’s odds.
            </p>
          )}
          {essenceUsed && (
            <p className="text-[11px] text-muted-foreground">
              Essence-only mods can only be applied by an essence (on a Magic item, turning it Rare).
              The level you pick fixes the value, its item-level gate, and the essence’s price — so the
              target must also include at least one rollable mod for the essence to land on.
            </p>
          )}
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
              Desecration using the boss omen that targets them — odds are a count-uniform 1-in-N over
              that boss’s pool (weights are unknown, so this is an approximation).
              {normalTargets < 3 && fractured.size === 0 && (
                <> From scratch, a Desecration needs a Rare first, so include <strong>3 rollable mods</strong> (or
                start from an item) — otherwise there’s no way to reach Rare and the plan will be empty.</>
              )}
            </p>
          )}
        </Card>
      )}

      {/* Results */}
      {runErr && (
        <Card className="p-4">
          <p className="text-destructive font-medium text-sm">Cannot craft this target</p>
          <p className="text-sm text-muted-foreground mt-1">{runErr}</p>
        </Card>
      )}

      {result && !runErr && <FrontierView result={result} priceBasis={engine ? priceBasis(engine) : undefined} />}
      {alts && !runErr && <AlternativesView alts={alts} budget={altBudget} />}
      </>)}
    </div>
  );
};

export default EngineLab;
