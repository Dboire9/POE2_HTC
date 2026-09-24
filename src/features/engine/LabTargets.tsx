import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { priceBasis } from '../../lib/engine';
import { MIXED_TIER_NOTE, mixedTierAlternatives } from '../../lib/targetSlots';
import { modTextAtTier } from '../../lib/engineMap';
import { slotsOfTargets } from '../../lib/gearTrade';
import { FreeSlotNote, FreeSlotRows, withSpare } from './FreeSlots';
import { GearTradeLink } from './GearTradeLink';
import RuneHint from './RuneHint';
import { FOCUS_RING, selectCls } from './ui';
import type { LabCraft } from './useLabCraft';

/** The Plan tab's second card: the item being aimed at, slot by slot, and what each choice means. */
const LabTargets: React.FC<{ lab: LabCraft }> = ({ lab }) => {
  const {
    targets, freeSlots, slots, engine, baseId, addingTo, setAddingTo, modById, fractured, pinned,
    regularEssenceUsed, patchTarget, toggleFractured, togglePinned, pinEffect, removeTarget,
    startAlternative, spare, setSpare, essenceFractureConflict, desecratedUsed, bossTargetable, normalTargets,
  } = lab;
  if (!(targets.length > 0 || freeSlots > 0)) return null;
  return (
    <Card className="p-4 space-y-2">
      {/* A craft with no alternatives keeps the words it always had. "Slots" is the precise term
          but it is only worth teaching to someone who has just made a slot mean something — and a
          free slot is exactly that, so it switches to the precise wording too.
          "named" is added only where a free slot makes "2 mods" ambiguous about whether the free
          one counts; a craft with alternatives alone keeps the sentence it has always had. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">
          {targets.length === slots.length && freeSlots === 0
            ? `Target item (${targets.length} mod${targets.length !== 1 ? 's' : ''})`
            : `Target item (${slots.length + freeSlots} slot${slots.length + freeSlots !== 1 ? 's' : ''}, `
              + `${targets.length} mod${targets.length !== 1 ? 's' : ''}${freeSlots > 0 ? ' named' : ''})`}
        </h3>
        {/* The item as it stands in the list, before any solve: what it goes for, ready made. */}
        {engine && targets.length > 0 && (
          <GearTradeLink
            data={engine.data} league={priceBasis(engine).league} baseId={baseId}
            slots={slotsOfTargets(targets)} rarity="nonunique" label="the target item"
          />
        )}
      </div>
      {/* Two "gain as extra" targets are already legal — different families — so this unlocks
          nothing; it says what a rune would make of them, which nobody would otherwise think of. */}
      {engine && (
        <RuneHint
          data={engine.data} baseId={baseId} targets={targets}
          prices={engine.prices.currency} rates={priceBasis(engine).rates}
        />
      )}
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
                {/* Resolved against the tier chosen on THIS row, the same as the Item tab. The
                    picker list above deliberately keeps its `#`: no tier has been chosen there,
                    so a number would be a claim about a roll the reader has not asked for. */}
                {modTextAtTier(mod, t.tierDisplay)}
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
              {mixedTierAlternatives(slot, targets, modById) && (
                /* A PLANNER note, not a game rule: the craft is legal and the answer identical.
                   Same-family alternatives merge whatever tiers you ask of them; different-family
                   ones can only be folded together while they are indistinguishable, and a
                   different tier is the one difference the player controls. */
                <p className="px-0.5 text-[11px] text-muted-foreground">{MIXED_TIER_NOTE}</p>
              )}
            </div>
          );
        })}
        {/* Last, because a free slot is what you have NOT decided — reading the named positions
            first and "and one more, whatever" after is the order the player thinks in. */}
        <FreeSlotRows spare={spare} onRemove={(side) => setSpare(withSpare(spare, side, -1))} />
      </div>
      <FreeSlotNote spare={spare} fromWhite={fractured.size === 0} />
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
  );
};

export default LabTargets;
