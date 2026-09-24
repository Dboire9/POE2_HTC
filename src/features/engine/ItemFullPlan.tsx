import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { priceBasis } from '../../lib/engine';
import { modSourceLabel, modTextAtTier } from '../../lib/engineMap';
import { MIXED_TIER_NOTE, mixedTierAlternatives } from '../../lib/targetSlots';
import { slotsOfTargets } from '../../lib/gearTrade';
import { SearchEffort, SearchEffortHint } from './SearchEffort';
import SolveProgress from './SolveProgress';
import CurrencyExclusions from './CurrencyExclusions';
import { FreeSlotNote, FreeSlotRows, withSpare } from './FreeSlots';
import { GearTradeLink } from './GearTradeLink';
import RuneHint from './RuneHint';
import { FOCUS_RING, selectCls } from './ui';
import type { ItemCraft } from './useItemCraft';

/**
 * Adding a FREE slot, from the same `<select>` the mods come from.
 *
 * The sentinels can't collide with a mod id: every id in the data carries a `<baseId>/` prefix, and
 * neither of these has a slash. Only the side cap can refuse one — a free slot has no id to
 * duplicate, no family to clash and no source to count — and it is asked through `roomOnSide`, the
 * same helper the mod rows' cap check goes through.
 */
const ANY: Readonly<Record<string, 'prefix' | 'suffix'>> = { 'any:prefix': 'prefix', 'any:suffix': 'suffix' };

/** The Item tab's "Full plan to a target" card: what the item should end up as, and the Compute button. */
const ItemFullPlan: React.FC<{ it: ItemCraft }> = ({ it }) => {
  const {
    engine, rates, baseId, itemMods, copyItemToTarget, freeSlots, addSpare, modById, addTarget, addingTo,
    setAddingTo, spareBlock, targetable, perfect, desecratedTargets, blockFor, onItem, targetSlots, target,
    targetState, heldTier, patchTarget, removeTargetMod, startAlternative, spare, setSpare, computing,
    progress, cancel, compute, blockedBy, tookMs, clearPlan,
  } = it;
  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">What should the item end up as?</h3>
        <Button variant="outline" size="sm" onClick={copyItemToTarget} disabled={itemMods.length === 0}>
          Copy my current mods
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Pick the <strong>final</strong> mods you want. Any mod on your item that isn’t in this list is treated
        as junk and removed{freeSlots > 0 ? ' — except for the free slots below, which may keep one' : ''}.
        The plan below keeps everything you already have that’s in the target.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add a target mod</span>
          <select
            className={`${selectCls} min-w-72`} value=""
            onChange={(e) => {
              const side = ANY[e.target.value];
              if (side) { addSpare(side); return; }
              const m = modById.get(e.target.value);
              if (m) addTarget(m);
            }}
          >
            <option value="">— choose —</option>
            {/* Offered only while starting a NEW slot: an alternative answers "which of these
                would do?", and "anything" is not an answer to that but a different question about
                the whole slot. */}
            {addingTo === null && (['prefix', 'suffix'] as const).map((side) => {
              const why = spareBlock(side);
              return (
                <option key={side} value={`any:${side}`} disabled={why !== null}>
                  {side === 'prefix' ? 'P' : 'S'} · Any {side} — I don’t care what lands here
                  {why ? ` — ${why}` : ''}
                </option>
              );
            })}
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

      {/* Read before the rows are read. A slot is one POSITION on the item, so alternatives count
          once — and a slot counts as held if ANY of its candidates is, since whichever lands
          fills it. This is the answer to "how far along am I" that the list itself makes you
          assemble row by row. */}
      {targetSlots.length + freeSlots > 0 && (() => {
        const per = targetSlots.map((slot) => {
          const states = slot.members.map((i) => targetState(target[i]!));
          return states.includes('have') ? 'have' : states.includes('reroll') ? 'reroll' : 'add';
        });
        const n = (k: string): number => per.filter((x) => x === k).length;
        const parts: React.ReactNode[] = [];
        if (n('have') > 0) parts.push(<span key="h" className="text-emerald-600 dark:text-emerald-400"><strong>{n('have')}</strong> already on your item</span>);
        if (n('reroll') > 0) parts.push(<span key="r" className="text-amber-700 dark:text-amber-300"><strong>{n('reroll')}</strong> to re-roll</span>);
        if (n('add') > 0) parts.push(<span key="a" className="text-sky-700 dark:text-sky-300"><strong>{n('add')}</strong> to add</span>);
        // A free slot is in none of the three states above: nothing has to be there, so it is
        // neither held, nor to re-roll, nor to add. Left out of them and counted here instead.
        if (freeSlots > 0) parts.push(<span key="f" className="text-muted-foreground"><strong>{freeSlots}</strong> free</span>);
        return (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="font-semibold text-foreground">
              {targetSlots.length + freeSlots} slot{targetSlots.length + freeSlots === 1 ? '' : 's'}:
            </span>
            {parts.map((el, i) => (
              <React.Fragment key={i}>{i > 0 && <span className="text-muted-foreground">·</span>}{el}</React.Fragment>
            ))}
          </p>
        );
      })()}

      {/* The target as it stands in the list, before any solve: what it goes for, ready made. */}
      {engine && target.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          The target item, already made:
          <GearTradeLink
            data={engine.data} league={priceBasis(engine).league} baseId={baseId}
            slots={slotsOfTargets(target)} rarity="nonunique" label="the target item"
          />
        </p>
      )}

      {/* Same note as the Plan tab: these targets were always legal together, and the rune
          that fuses them is the part no plan would otherwise mention. */}
      {engine && (
        <RuneHint
          data={engine.data} baseId={baseId} targets={target}
          prices={engine.prices.currency} rates={rates}
        />
      )}
      {target.length + freeSlots > 0 && (
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
            const state = targetState(t);
            const heldLabel = mod.tiers.find((ti) => ti.display === held)?.label ?? `T${held}`;
            // A 10px badge on the right edge was the whole signal, and it read as decoration.
            // The stripe puts the state where the eye lands first and makes the list scannable
            // as three groups without reordering it — which the slots forbid, since a slot's
            // alternatives are one position and must stay together whatever state each is in.
            const stripe = state === 'have'
              ? 'border-l-4 border-l-emerald-500 bg-emerald-500/[0.07]'
              : state === 'reroll'
                ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.07]'
                : 'border-l-4 border-l-sky-500 bg-sky-500/[0.07]';
            return (
              <div key={t.modId} className={`flex flex-wrap items-center gap-2 rounded-md border border-border/60 px-2 py-1.5 ${stripe}`}>
                <Badge variant={mod.type === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">{mod.type === 'prefix' ? 'P' : 'S'}</Badge>
                {/* The sentence with the numbers this tier actually rolls. It read
                    "+# to Level of all Fire Spell Skills" — or worse, before the data fix,
                    "+1 …" from the WORST tier — beside a dropdown saying "T1 · of Inferno ·
                    ilvl 81 · 5–5", leaving the reader to join the two up. */}
                <span className="flex-1 min-w-40 text-sm">{modTextAtTier(mod, t.tierDisplay)}</span>
                {mod.source === 'desecrated' && <span className="text-[10px] rounded bg-rose-500/15 px-1 text-rose-600 dark:text-rose-300">desecrated</span>}
                {mod.source === 'perfect' && <span className="text-[10px] rounded bg-purple-500/15 px-1 text-purple-600 dark:text-purple-300">perfect essence</span>}
                {mod.source === 'alloy' && <span className="text-[10px] rounded bg-amber-500/15 px-1 text-amber-600 dark:text-amber-300">alloy</span>}
                {state === 'have' && (
                  <span
                    className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                    title={`Your item already has this at ${heldLabel} — the planner keeps it`}
                  >
                    ✓ on your item ({heldLabel})
                  </span>
                )}
                {state === 'reroll' && (
                  <span
                    className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
                    title={`Your item has this at ${heldLabel}, below the tier you want — the planner has to strip it and re-roll the slot, which costs more than an empty slot would`}
                  >
                    ↻ yours is {heldLabel} — must re-roll
                  </span>
                )}
                {state === 'add' && (
                  <span
                    className="shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300"
                    title="Not on your item — the plan has to land this one"
                  >
                    + to add
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
          <FreeSlotRows spare={spare} onRemove={(side) => { setSpare(withSpare(spare, side, -1)); clearPlan(); }} />
        </div>
      )}
      {/* `fromWhite` is false here by definition: this tab plans from an item you hold, and its
          step planner CAN use a free slot — it decides which junk to leave before spending an
          orb, where a from-white route would have to decide after the roll. */}
      <FreeSlotNote spare={spare} fromWhite={false} />
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
  );
};

export default ItemFullPlan;
