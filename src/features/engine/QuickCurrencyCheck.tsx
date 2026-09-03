import React, { useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import {
  currencyActions,
  type CurrencyAction, type EngineMod, type ExistingItem, type loadEngine,
} from '../../lib/engine';
import { exactExalts, formatChance, formatCost, type Rates } from '../../lib/currency';
import { modSourceLabel } from '../../lib/engineMap';

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

/**
 * Plain-language odds for a single orb: "guaranteed" at P=1, else "≈ 1 in N each orb".
 *
 * N carries a decimal below 10. Rounding it to an integer everywhere was fine while nothing on this
 * panel cleared ~50%, and then the boss-omened Desecration arrived at 70.4% and rendered as
 * **"≈ 1 in 1 each orb"** — which reads as a certainty, directly under a number saying it is not.
 * A decimal holds the relative error at 5% across the whole range, the same as rounding does above 10.
 *
 * Above 95% even a decimal cannot: N is then under 1.05, which shows as "1 in 1.0" and lies the same
 * way. "1 in N" is simply the wrong idiom that close to certain, so it stops being used — the exact
 * percentage sits on the line above, and only P=1 is ever allowed to say "guaranteed".
 */
export function oddsText(p: number): string {
  if (p >= 1) return 'guaranteed';
  if (p <= 0) return '—';
  if (p >= 0.95) return 'almost every orb';
  const n = 1 / p;
  const shown = n < 10 ? n.toFixed(1).replace(/\.0$/, '') : Math.round(n).toLocaleString();
  return `≈ 1 in ${shown} each orb`;
}

/**
 * "What does one orb do?" — the odds a single currency does exactly what you asked, for every orb that
 * could do it.
 *
 * Its own component because it shares nothing with the full planner beside it but the item: no solve,
 * no worker, no targets, no policy. Extracting it took `ItemActions` off 983 lines, seventeen short of
 * the threshold this project treats as a blocker, with the essence and orb-strength rows still to come.
 *
 * **It owns its two selections**, which is what fixed a divergence the parent had. The parent cleared
 * them imperatively from `dropItemMod` and from the base-change reset — but not from the rarity trim,
 * which silently drops mods when a Rare becomes Magic. A selection left pointing at a trimmed mod then
 * rendered a blocked "Orb of Annulment — can't apply" row underneath a dropdown displaying "— none —",
 * because a `<select>` whose value matches no option shows the first one. Derived clamping cannot have
 * that bug: a selection the lists no longer offer is not a selection.
 */
const QuickCurrencyCheck: React.FC<{
  engine: Awaited<ReturnType<typeof loadEngine>>;
  item: ExistingItem;
  /** Mods a currency could ADD — normal mods not already on the item, plus the carved ones a bone places. */
  addable: readonly EngineMod[];
  /** Mods on the item, which are the ones a Chaos or an Annulment could take off. */
  itemMods: readonly EngineMod[];
  rates?: Rates;
}> = ({ engine, item, addable, itemMods, rates }) => {
  const [addPick, setAddPick] = useState<string | null>(null);
  const [removePick, setRemovePick] = useState<string | null>(null);

  // Clamped against the live lists rather than cleared by whoever changed them — see the note above.
  const addModId = addPick !== null && addable.some((m) => m.id === addPick) ? addPick : null;
  const removeModId = removePick !== null && itemMods.some((m) => m.id === removePick) ? removePick : null;

  const actions: CurrencyAction[] = useMemo(() => {
    if (!addModId && !removeModId) return [];
    const sel: { addModId?: string; removeModId?: string } = {};
    if (addModId) sel.addModId = addModId;
    if (removeModId) sel.removeModId = removeModId;
    try { return currencyActions(engine, item, sel); } catch { return []; }
    // `item` is rebuilt every render by the parent, so depend on its contents, not its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, item.baseId, item.level, item.rarity, item.prefixes, item.suffixes, addModId, removeModId]);

  return (
    <>
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-bold">What do you want to do?</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mod to add</span>
            <select className={`${selectCls} min-w-72`} value={addModId ?? ''} onChange={(e) => setAddPick(e.target.value || null)}>
              <option value="">— none —</option>
              {addable.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.type === 'prefix' ? 'P' : 'S'} · {m.text}{modSourceLabel(m.source)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mod to sacrifice (Chaos / Annul)</span>
            <select className={`${selectCls} min-w-72`} value={removeModId ?? ''} onChange={(e) => setRemovePick(e.target.value || null)}>
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
                    <div className="text-xl font-bold tabular-nums text-primary">{formatChance(a.prob)}</div>
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
  );
};

export default QuickCurrencyCheck;
