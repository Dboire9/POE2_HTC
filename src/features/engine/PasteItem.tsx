import React, { useMemo, useState } from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import { Button } from '../../components/ui/button';
import {
  readPastedItem, itemModsFrom, isSettled, NO_CHOICES,
  type PasteChoices, type PasteReading, type PasteRow,
} from '../../lib/pasteItem';
import type { ImportedItem } from '../../lib/engineTypes';

/**
 * "Paste your item" — read a Ctrl+C block instead of rebuilding the item by hand.
 *
 * Entering a six-mod rare through the pickers is a dozen clicks and every one of them is a chance to
 * mistype a tier. The game already writes the item out as text, so this reads that.
 *
 * IT SHOWS ITS WORKING AND THEN ASKS. Three things are genuinely undecidable from the printed text
 * (which mod, which tier, and whether two lines are one hybrid modifier), so the panel lists what it
 * read, marks what it could not settle, and refuses to fill those in on the player's behalf. Guessing
 * would put a different mod on the item than the one they hold, and every number the app then prints
 * would be wrong with nothing on screen to say so. `src/lib/pasteItem.ts` holds the reading; this file
 * is the questions and the button.
 *
 * NOTHING IS APPLIED UNTIL "Use this item". Reading is free and reversible; overwriting a craft the
 * player has already set up is not.
 */

const selectCls =
  'h-8 rounded-md border border-input bg-background px-1.5 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

const withSplit = (c: PasteChoices, key: string): PasteChoices => {
  const split = new Set(c.split);
  if (!split.delete(key)) split.add(key);
  return { ...c, split };
};

const withEntry = <V,>(m: ReadonlyMap<string, V>, key: string, v: V): Map<string, V> =>
  new Map(m).set(key, v);

/** One read line: what it resolved to, and any question left on it. */
const Row: React.FC<{
  row: PasteRow; data: PatchData; onChoose: (c: (prev: PasteChoices) => PasteChoices) => void;
}> = ({ row, data, onChoose }) => {
  const settled = isSettled(row);
  return (
    <li className={`rounded border px-2 py-1.5 ${settled ? 'border-border/60' : 'border-amber-500/60 bg-amber-500/5'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-[11px]">{row.lines.join(' / ')}</span>
        {row.fractured && <span className="text-[10px] text-amber-300">🔒 fractured</span>}
        {row.desecrated && <span className="text-[10px] text-purple-300">💀 desecrated</span>}
        {/* Above anything the mod can roll. Saying so is the difference between "your best mod" and
            a line the app appears not to understand. */}
        {row.sanctified && (
          <span
            className="text-[10px] text-sky-300"
            title="Sanctified — this rolled higher than the modifier can normally reach, so it is read as the best tier."
          >
            ✨ sanctified · reads as best tier
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {row.modIds.length > 1 ? (
          <label className="flex items-center gap-1 text-[11px] text-amber-200">
            <span>Which mod?</span>
            <select
              className={selectCls}
              value={row.modId ?? ''}
              onChange={(e) => onChoose((p) => ({ ...p, modId: withEntry(p.modId, row.key, e.target.value) }))}
            >
              <option value="">— pick one —</option>
              {row.modIds.map((id) => (
                <option key={id} value={id}>
                  {data.mods.get(id)?.type === 'prefix' ? 'prefix' : 'suffix'} · {id.split('/').at(-1)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            {row.side ?? '—'} · {row.modId?.split('/').at(-1) ?? 'not in this base’s pools'}
          </span>
        )}

        {row.tiers.length > 1 ? (
          <label className="flex items-center gap-1 text-[11px] text-amber-200">
            <span>Which tier?</span>
            <select
              className={selectCls}
              value={row.tierDisplay ?? ''}
              onChange={(e) => onChoose((p) => ({ ...p, tier: withEntry(p.tier, row.key, Number(e.target.value)) }))}
            >
              <option value="">— pick one —</option>
              {row.tiers.map((t) => (
                <option key={t.display} value={t.display}>T{t.display} · {t.name}</option>
              ))}
            </select>
          </label>
        ) : row.tierDisplay !== undefined && (
          <span className="text-[11px] text-muted-foreground">T{row.tierDisplay}</span>
        )}

        {row.canSplit && (
          <button
            type="button"
            onClick={() => onChoose((p) => withSplit(p, row.key))}
            className="text-[11px] underline text-amber-200 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            these are two separate mods
          </button>
        )}
      </div>
    </li>
  );
};

const PasteItem: React.FC<{
  data: PatchData;
  onApply: (item: ImportedItem) => void;
}> = ({ data, onApply }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [choices, setChoices] = useState<PasteChoices>(NO_CHOICES);

  // Re-read on every keystroke and every answer. It is a few hundred regex matches over one base's
  // pools, and holding a stale reading beside a changed answer is the bug that would cost more.
  const reading: PasteReading | null = useMemo(
    () => (text.trim() === '' ? null : readPastedItem(data, text, choices)),
    [data, text, choices],
  );

  const mods = reading && itemModsFrom(reading);
  const unsettled = reading?.rows.filter((r) => !isSettled(r)).length ?? 0;
  const canApply = reading !== null && reading.problems.length === 0
    && reading.baseId !== undefined && reading.rarity !== undefined;

  const apply = () => {
    if (!reading || !mods || !canApply) return;
    onApply({
      baseId: reading.baseId,
      level: reading.level ?? 82,
      rarity: reading.rarity,
      prefixes: mods.prefixes,
      suffixes: mods.suffixes,
    });
    setOpen(false);
  };

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          📋 Paste your item
        </span>
        <span className="text-xs text-muted-foreground">
          copy it in game <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground">
            Hover the item in game and press <strong>Ctrl+C</strong>, then paste it below.{' '}
            <strong>Ctrl+Alt+C</strong> is better if you can: it includes each modifier’s tier and
            whether it’s a prefix or a suffix, which saves you answering that here.
          </p>
          <label htmlFor="paste-item" className="sr-only">Paste your item’s text from the game</label>
          <textarea
            id="paste-item"
            value={text}
            onChange={(e) => { setText(e.target.value); setChoices(NO_CHOICES); }}
            rows={5}
            placeholder={'Item Class: Helmets\nRarity: Rare\n…'}
            className="w-full rounded-md border border-input bg-background p-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {text.trim() !== '' && reading === null && (
            <p className="text-[11px] text-amber-300">
              That doesn’t look like an item. Copy it from the game with Ctrl+C — the block starts with
              “Item Class:”.
            </p>
          )}

          {reading && (
            <>
              <p className="text-xs">
                <strong>{reading.baseName || '(no name)'}</strong>
                {reading.baseId && <span className="text-muted-foreground"> · {reading.baseId}</span>}
                {reading.level !== undefined && <span className="text-muted-foreground"> · ilvl {reading.level}</span>}
                {reading.rarity && <span className="text-muted-foreground"> · {reading.rarity}</span>}
                {reading.advanced && <span className="text-emerald-300"> · tiers included</span>}
              </p>

              {reading.problems.map((p) => (
                <p key={p} className="text-[11px] text-amber-300">{p}</p>
              ))}

              {reading.rows.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {reading.rows.map((r) => (
                    <Row key={r.key} row={r} data={data} onChoose={setChoices} />
                  ))}
                </ul>
              )}

              {reading.unresolved.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Not a craftable modifier on this base, so left off:{' '}
                  {reading.unresolved.map((u) => `“${u}”`).join(', ')}
                </p>
              )}
              {reading.skipped.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Ignored, because no currency can produce them:{' '}
                  {reading.skipped.map((s) => `${s.lines.length} ${s.kind}`).join(', ')}.
                </p>
              )}
              {mods && mods.dropped > 0 && (
                <p className="text-[11px] text-amber-300">
                  {mods.dropped} more than an item can hold were left off — check the grouping above.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button size="sm" onClick={apply} disabled={!canApply}>
                  Use this item
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  {!canApply ? 'Can’t use this one — see above.'
                    : unsettled > 0
                      ? `${mods!.prefixes.length + mods!.suffixes.length} mods ready · ${unsettled} still need an answer and will be left off`
                      : `${mods!.prefixes.length} prefixes, ${mods!.suffixes.length} suffixes — this replaces what’s on the tab.`}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PasteItem;
