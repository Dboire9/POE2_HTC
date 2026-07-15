import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import {
  loadEngine, listBases, listMods, listPerfectEssences, currencyActions, optimizeItem,
  type EngineBase, type EngineMod, type ExistingItem, type ItemModInput, type CurrencyAction,
  type TargetInput, type EngineResult,
} from '../../lib/engine';
import FrontierView from './FrontierView';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

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

const ItemActions: React.FC = () => {
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof loadEngine>> | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [baseId, setBaseId] = useState('');
  const [level, setLevel] = useState(82);
  const [rarity, setRarity] = useState<'magic' | 'rare'>('rare');
  const [prefixes, setPrefixes] = useState<ItemModInput[]>([]);
  const [suffixes, setSuffixes] = useState<ItemModInput[]>([]);
  const [search, setSearch] = useState('');

  const [subMode, setSubMode] = useState<'check' | 'plan'>('check');

  // Option 1 (quick check) selections.
  const [addModId, setAddModId] = useState<string | null>(null);
  const [removeModId, setRemoveModId] = useState<string | null>(null);

  // Option 2 (full plan) target + result.
  const [target, setTarget] = useState<TargetInput[]>([]);
  const [plan, setPlan] = useState<EngineResult | null>(null);
  const [planErr, setPlanErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    loadEngine()
      .then((eng) => {
        setEngine(eng);
        const bases = listBases(eng.data);
        setBaseId(bases.find((b) => b.id === 'Wands')?.id ?? bases[0]?.id ?? '');
      })
      .catch((e) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const bases: EngineBase[] = useMemo(() => (engine ? listBases(engine.data) : []), [engine]);
  // Only rollable (normal) mods can sit on / be added to an item in this view.
  const pool = useMemo(() => {
    if (!engine || !baseId) return { prefixes: [] as EngineMod[], suffixes: [] as EngineMod[] };
    const m = listMods(engine.data, baseId);
    const normal = (l: readonly EngineMod[]) => l.filter((x) => x.source === 'normal');
    return { prefixes: normal(m.prefixes), suffixes: normal(m.suffixes) };
  }, [engine, baseId]);
  // Perfect essences: only offered as TARGETS in the from-item flow (a Perfect Essence adds its
  // guaranteed mod on a Rare while removing one random mod). Not shown in the current-item builder.
  const perfect = useMemo(
    () => (engine && baseId ? listPerfectEssences(engine.data, baseId) : []),
    [engine, baseId],
  );
  const modById = useMemo(() => {
    const m = new Map<string, EngineMod>();
    for (const x of [...pool.prefixes, ...pool.suffixes, ...perfect]) m.set(x.id, x);
    return m;
  }, [pool, perfect]);

  // Reset everything when the base changes.
  useEffect(() => {
    setPrefixes([]); setSuffixes([]); setAddModId(null); setRemoveModId(null);
    setTarget([]); setPlan(null); setPlanErr(null); setSearch('');
  }, [baseId]);
  // Dropping to magic can overflow the 1-per-side cap; trim to keep the item legal.
  useEffect(() => {
    setPrefixes((p) => p.slice(0, CAP[rarity]));
    setSuffixes((s) => s.slice(0, CAP[rarity]));
    setPlan(null); setPlanErr(null);
  }, [rarity]);

  const onItem = useMemo(() => new Set([...prefixes, ...suffixes].map((m) => m.modId)), [prefixes, suffixes]);
  const occupiedFamilies = useMemo(() => {
    const s = new Set<string>();
    for (const id of onItem) { const fam = modById.get(id)?.family; if (fam) s.add(fam); }
    return s;
  }, [onItem, modById]);

  const cap = CAP[rarity];
  const addItemMod = (mod: EngineMod) => {
    if (onItem.has(mod.id) || occupiedFamilies.has(mod.family)) return;
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

  const addable = useMemo(() => [...pool.prefixes, ...pool.suffixes].filter((m) => !onItem.has(m.id)), [pool, onItem]);
  const itemMods = useMemo(
    () => [...prefixes, ...suffixes].map((m) => modById.get(m.modId)).filter((m): m is EngineMod => !!m),
    [prefixes, suffixes, modById],
  );

  const item: ExistingItem = { baseId, level, rarity, prefixes, suffixes };

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
  const targetIds = useMemo(() => new Set(target.map((t) => t.modId)), [target]);
  const targetFamilies = useMemo(() => {
    const s = new Set<string>();
    for (const t of target) { const fam = modById.get(t.modId)?.family; if (fam) s.add(fam); }
    return s;
  }, [target, modById]);
  const targetPre = target.filter((t) => modById.get(t.modId)?.type === 'prefix').length;
  const targetSuf = target.filter((t) => modById.get(t.modId)?.type === 'suffix').length;
  const addTarget = (mod: EngineMod) => {
    if (targetIds.has(mod.id) || targetFamilies.has(mod.family)) return;
    if (mod.type === 'prefix' ? targetPre >= 3 : targetSuf >= 3) return;
    setTarget((t) => [...t, { modId: mod.id, tierDisplay: 1 }]);
    setPlan(null);
  };
  const copyItemToTarget = () => {
    setTarget([...prefixes, ...suffixes].map((m) => ({ modId: m.modId, tierDisplay: modById.get(m.modId)?.tiers.length ?? 1 })));
    setPlan(null);
  };
  const patchTarget = (modId: string, tierDisplay: number) =>
    setTarget((t) => t.map((x) => (x.modId === modId ? { ...x, tierDisplay } : x)));

  const compute = () => {
    if (!engine || target.length === 0) return;
    setComputing(true); setPlanErr(null);
    setTimeout(() => {
      try { setPlan(optimizeItem(engine, item, target)); }
      catch (e) { setPlan(null); setPlanErr(e instanceof Error ? e.message : String(e)); }
      finally { setComputing(false); }
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
  if (!engine) {
    return <div className="flex items-center gap-3 p-8 text-muted-foreground"><Spinner /> Loading patch data…</div>;
  }

  const ModColumn: React.FC<{ title: string; list: readonly EngineMod[]; count: number }> = ({ title, list, count }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{count}/{cap}</span>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
        {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
        {list.map((m) => {
          const disabled = count >= cap || occupiedFamilies.has(m.family);
          return (
            <button
              key={m.id}
              onClick={() => addItemMod(m)}
              disabled={disabled}
              className="flex w-full items-center gap-2 text-left px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              title={occupiedFamilies.has(m.family) ? `“${m.family}” family already on the item` : count >= cap ? 'This side is full' : 'Add to your item'}
            >
              <span className="flex-1 min-w-0 truncate">{m.text}</span>
              {occupiedFamilies.has(m.family) && <span className="shrink-0 text-[10px] text-muted-foreground">family in use</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const subTabCls = (active: boolean) =>
    `px-3 py-1.5 rounded ${active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="space-y-4">
      {/* Your item */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base</span>
            <select className={`${selectCls} min-w-56`} value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modifiers to add to your item…"
            className={`${selectCls} w-full mb-2`}
          />
          <div className="flex gap-4">
            <ModColumn title="Prefixes" list={filtered.prefixes} count={prefixes.length} />
            <ModColumn title="Suffixes" list={filtered.suffixes} count={suffixes.length} />
          </div>
        </div>

        {itemMods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {itemMods.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1 text-sm">
                <Badge variant={m.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{m.type === 'prefix' ? 'P' : 'S'}</Badge>
                {m.text}
                <button onClick={() => dropItemMod(m.id)} className="text-muted-foreground hover:text-destructive" title="Remove from item">✕</button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Sub-mode toggle */}
      <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        <button className={subTabCls(subMode === 'check')} onClick={() => setSubMode('check')}>Quick currency check</button>
        <button className={subTabCls(subMode === 'plan')} onClick={() => setSubMode('plan')}>Full plan to a target</button>
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
                <Card key={a.currency} className="p-3 flex flex-wrap items-center gap-x-6 gap-y-1">
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
                      <div className="text-xs text-muted-foreground w-24 text-right">{a.cost.toFixed(2)} ex / orb</div>
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
                  {[...addable, ...perfect].filter((m) => !targetIds.has(m.id)).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.type === 'prefix' ? 'P' : 'S'} · {m.text}{m.source === 'perfect' ? ' · Perfect Essence' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {target.length > 0 && (
              <div className="space-y-2">
                {target.map((t) => {
                  const mod = modById.get(t.modId);
                  if (!mod) return null;
                  const have = onItem.has(t.modId);
                  return (
                    <div key={t.modId} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
                      <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{mod.type === 'prefix' ? 'P' : 'S'}</Badge>
                      <span className="flex-1 min-w-40 text-sm">{mod.text}</span>
                      {have && <span className="text-[10px] rounded bg-emerald-500/15 px-1 text-emerald-600 dark:text-emerald-300">already have</span>}
                      <select className={selectCls} value={t.tierDisplay} onChange={(e) => patchTarget(t.modId, Number(e.target.value))} title="Target tier (or better)">
                        {mod.tiers.map((ti) => <option key={ti.display} value={ti.display}>{ti.label}</option>)}
                      </select>
                      <button onClick={() => { setTarget((x) => x.filter((y) => y.modId !== t.modId)); setPlan(null); }} className="text-muted-foreground hover:text-destructive px-1" title="Remove from target">✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button onClick={compute} disabled={rarity !== 'rare' || target.length === 0 || computing} size="lg">
                {computing ? 'Computing…' : 'Compute plan'}
              </Button>
              {rarity !== 'rare' && <span className="text-xs text-muted-foreground">The full planner needs a Rare item (use the quick check for Magic).</span>}
            </div>
          </Card>

          <p className="text-[11px] text-muted-foreground px-1">
            Cost model: on a miss the plan resets to <em>your</em> item and retries — it never throws away the good
            mods you started with. (It assumes you can reproduce that starting item.)
          </p>

          {planErr && (
            <Card className="p-4">
              <p className="text-destructive font-medium text-sm">Cannot plan this craft</p>
              <p className="text-sm text-muted-foreground mt-1">{planErr}</p>
            </Card>
          )}
          {plan && !planErr && (
            <FrontierView
              result={plan}
              title="Cheapest → surest routes"
              emptyHint={<p>No route reaches this target from your item — usually the target needs more mods than
                fit, or a tier gated above the item level.</p>}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ItemActions;
