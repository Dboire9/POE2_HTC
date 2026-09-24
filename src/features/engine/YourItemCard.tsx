import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { modTextAtTier } from '../../lib/engineMap';
import { importToItem } from '../../lib/importItem';
import BaseSelect from './BaseSelect';
import RunePicker from './RunePicker';
import PasteItem from './PasteItem';
import BuilderColumn from './BuilderColumn';
import { FOCUS_RING, selectCls } from './ui';
import type { ItemCraft } from './useItemCraft';

/** The Item tab's first card: the item you hold — pasted or built — with its tiers and marks. */
const YourItemCard: React.FC<{ it: ItemCraft }> = ({ it }) => {
  const {
    engine, bases, baseId, changeBase, level, setLevel, rarity, setRarity, category, runes, setRunes,
    clearItem, itemMods, target, plan, search, setSearch, filtered, prefixes, suffixes, capOf,
    occupiedFamilies, addItemMod, fracturedIds, desecratedIds, heldTier, patchItemMod, toggleFractured,
    toggleDesecrated, dropItemMod,
  } = it;
  return (
    <Card className="p-4 space-y-4">
      {/* Above the pickers, because it REPLACES them: someone holding the item should not have to
          find its row in the base list before they can start. `importToItem` writes the whole item
          in ONE update — see there for why five setters was a bug rather than a style. */}
      {engine && <PasteItem data={engine.data} onApply={importToItem} />}
      <div className="flex flex-wrap items-end gap-4">
        <BaseSelect bases={bases} value={baseId} onChange={changeBase} />
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
        <RunePicker category={category} value={runes} onChange={setRunes} />
        <div className="flex-1" />
        {/* The Lab tab has had one of these since it shipped and this tab never did, so the only way
            to start over here was to remove six modifiers one at a time. Same contract as the Lab's:
            it keeps the base and the item level, and clears everything built on them. */}
        <Button
          variant="outline"
          onClick={clearItem}
          disabled={itemMods.length === 0 && target.length === 0 && plan === null}
          title="Clear the modifiers on your item, the target and any result — keeps the base and item level"
        >
          Reset
        </Button>
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
          <BuilderColumn title="Prefixes" list={filtered.prefixes} count={prefixes.length} cap={capOf('prefix')} occupiedFamilies={occupiedFamilies} onAdd={addItemMod} />
          <BuilderColumn title="Suffixes" list={filtered.suffixes} count={suffixes.length} cap={capOf('suffix')} occupiedFamilies={occupiedFamilies} onAdd={addItemMod} />
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
                  {modTextAtTier(m, heldTier.get(m.id) ?? 1)}
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
              An item holds <strong>one</strong>: a Fracturing Orb locks a random modifier and can’t be
              used on an item that already has one, so marking a second here clears the first.
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
  );
};

export default YourItemCard;
