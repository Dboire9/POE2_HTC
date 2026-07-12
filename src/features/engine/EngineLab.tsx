import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import {
  loadEngine, listBases, listMods, optimize,
  type EngineBase, type EngineMod, type EngineResult, type TargetInput,
} from '../../lib/engine';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import ItemActions from './ItemActions';
import FrontierView from './FrontierView';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

const EngineLab: React.FC = () => {
  const [data, setData] = useState<PatchData | null>(null);
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof loadEngine>> | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [baseId, setBaseId] = useState<string>('');
  const [level, setLevel] = useState<number>(82);
  const [targets, setTargets] = useState<TargetInput[]>([]);
  const [search, setSearch] = useState('');

  const [result, setResult] = useState<EngineResult | null>(null);
  const [runErr, setRunErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [mode, setMode] = useState<'plan' | 'item'>('plan');

  useEffect(() => {
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
  const mods = useMemo(() => (data && baseId ? listMods(data, baseId) : { prefixes: [], suffixes: [] }), [data, baseId]);
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...mods.prefixes, ...mods.suffixes]) m.set(x.id, x);
    return m;
  }, [mods]);

  // Reset the craft when the base changes.
  useEffect(() => {
    setTargets([]);
    setResult(null);
    setRunErr(null);
    setSearch('');
  }, [baseId]);

  const selectedIds = useMemo(() => new Set(targets.map((t) => t.modId)), [targets]);
  const prefixCount = targets.filter((t) => modById.get(t.modId)?.type === 'prefix').length;
  const suffixCount = targets.filter((t) => modById.get(t.modId)?.type === 'suffix').length;
  // A regular essence needs a Magic item and turns it Rare, so at most one essence-only mod per craft.
  const essenceUsed = targets.some((t) => modById.get(t.modId)?.source === 'essence');

  // Family exclusion: an item holds at most one mod per family. Families already claimed by a target
  // are locked out of the picker so an impossible (always-0%) target can't be built in the first place.
  const occupiedFamilies = useMemo(() => {
    const s = new Set<string>();
    for (const t of targets) {
      const fam = modById.get(t.modId)?.family;
      if (fam) s.add(fam);
    }
    return s;
  }, [targets, modById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pick = (list: readonly EngineMod[]) =>
      (q ? list.filter((m) => m.text.toLowerCase().includes(q)) : list).filter((m) => !selectedIds.has(m.id));
    return { prefixes: pick(mods.prefixes), suffixes: pick(mods.suffixes) };
  }, [mods, search, selectedIds]);

  const addTarget = (mod: EngineMod) => {
    if (targets.some((t) => t.modId === mod.id)) return;
    if (mod.type === 'prefix' && prefixCount >= 3) return;
    if (mod.type === 'suffix' && suffixCount >= 3) return;
    if (occupiedFamilies.has(mod.family)) return; // one mod per family
    if (mod.source === 'essence' && essenceUsed) return; // one essence-only mod per craft
    setTargets((t) => [...t, { modId: mod.id, tierDisplay: 1 }]);
  };
  const removeTarget = (modId: string) => setTargets((t) => t.filter((x) => x.modId !== modId));
  const patchTarget = (modId: string, patch: Partial<TargetInput>) =>
    setTargets((t) => t.map((x) => (x.modId === modId ? { ...x, ...patch } : x)));

  const compute = () => {
    if (!engine || targets.length === 0) return;
    setComputing(true);
    setRunErr(null);
    // Defer so the spinner paints before the (synchronous) search runs.
    setTimeout(() => {
      try {
        setResult(optimize(engine, baseId, level, targets));
      } catch (e) {
        setResult(null);
        setRunErr(e instanceof Error ? e.message : String(e));
      } finally {
        setComputing(false);
      }
    }, 0);
  };

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

  const canCompute = targets.length > 0 && !computing;

  const ModColumn: React.FC<{ title: string; list: readonly EngineMod[]; count: number }> = ({ title, list, count }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{count}/3</span>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
        {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
        {list.map((m) => {
          const sideFull = count >= 3;
          const famTaken = occupiedFamilies.has(m.family);
          const isEssence = m.source === 'essence';
          const essenceBlocked = isEssence && essenceUsed;
          const disabled = sideFull || famTaken || essenceBlocked;
          const reason = famTaken
            ? `Family “${m.family}” is already on the item — one mod per family`
            : essenceBlocked ? 'Only one essence-only mod per craft'
            : sideFull ? 'This side is full (max 3)' : m.id;
          return (
            <button
              key={m.id}
              onClick={() => addTarget(m)}
              disabled={disabled}
              className="flex w-full items-center gap-2 text-left px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              title={reason}
            >
              <span className="flex-1 min-w-0 truncate">{m.text}</span>
              {isEssence && <span className="shrink-0 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">essence</span>}
              {famTaken && <span className="shrink-0 text-[10px] text-muted-foreground">family in use</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

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
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base</span>
            <select className={`${selectCls} min-w-56`} value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item level</span>
            <input
              type="number" min={1} max={100} value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className={`${selectCls} w-24`}
            />
          </label>
          <div className="flex-1" />
          <Button onClick={compute} disabled={!canCompute} size="lg">
            {computing ? 'Computing…' : 'Compute frontier'}
          </Button>
        </div>

        {/* Mod picker */}
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modifiers to add as targets…"
            className={`${selectCls} w-full mb-2`}
          />
          <div className="flex gap-4">
            <ModColumn title="Prefixes" list={filtered.prefixes} count={prefixCount} />
            <ModColumn title="Suffixes" list={filtered.suffixes} count={suffixCount} />
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
              return (
                <div key={t.modId} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
                  <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">
                    {mod.type === 'prefix' ? 'P' : 'S'}
                  </Badge>
                  <span className="flex-1 min-w-40 text-sm">
                    {mod.text}
                    {mod.source === 'essence' && (
                      <span className="ml-1.5 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">essence-only</span>
                    )}
                  </span>
                  <select
                    className={selectCls}
                    value={t.tierDisplay}
                    onChange={(e) => patchTarget(t.modId, { tierDisplay: Number(e.target.value) })}
                    title={mod.source === 'essence' ? 'Essence level (fixes value, ilvl gate, and price)' : 'Target tier (or better)'}
                  >
                    {mod.tiers.map((ti) => (
                      <option key={ti.display} value={ti.display}>{ti.label}</option>
                    ))}
                  </select>
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
          {essenceUsed && (
            <p className="text-[11px] text-muted-foreground">
              Essence-only mods can only be applied by an essence (on a Magic item, turning it Rare).
              The level you pick fixes the value, its item-level gate, and the essence’s price — so the
              target must also include at least one rollable mod for the essence to land on.
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

      {result && !runErr && <FrontierView result={result} />}
      </>)}
    </div>
  );
};

export default EngineLab;
