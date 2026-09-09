import React, { useEffect, useMemo, useState } from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import { Button } from '../../components/ui/button';
import {
  loadStreamers, readGear, placedCount,
  type GearReading, type StreamerFile, type StreamerItem,
} from '../../lib/streamerGear';
import type { ImportedItem } from '../../lib/engineTypes';

/**
 * "Load a streamer's item" — start from gear somebody actually built, instead of from nothing.
 *
 * The hard question in the Item tab is not how to type an item in, it is what a finished item is
 * supposed to LOOK like. A player who has never seen a six-mod endgame staff has no idea which
 * modifiers are worth wanting, and the pickers will not tell them. Real gear will.
 *
 * IT IS A SNAPSHOT, AND IT SAYS SO. The resolving happened in a periodic job (`tools/streamers/`),
 * because it needs a column the browser's copy of the mod data does not carry; what ships is the
 * answer. So this panel shows the date and never claims to be live.
 *
 * IT NAMES WHAT IT LEFT OFF, EVERY TIME. `readGear` returns a sentence per dropped modifier and all
 * of them are printed. An item that silently differs from the streamer's is the failure mode worth
 * designing against: the plan would be for an item nobody owns, and nothing on screen would say so.
 */

const selectCls =
  'h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

/** One modifier of the selected item, as the character holds it. */
const ModLine: React.FC<{ data: PatchData; modId: string; tier: number; fractured: boolean; desecrated: boolean; sanctified: boolean }> =
  ({ data, modId, tier, fractured, desecrated, sanctified }) => (
    <li className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-[11px]">{data.mods.get(modId)?.text ?? modId}</span>
      <span className="text-[10px] text-muted-foreground">T{tier}</span>
      {fractured && <span className="text-[10px] text-amber-300">🔒 fractured</span>}
      {desecrated && <span className="text-[10px] text-purple-300">💀 desecrated</span>}
      {sanctified && (
        <span
          className="text-[10px] text-sky-300"
          title="Sanctified — this rolled higher than the modifier can normally reach, so it is read as the best tier."
        >
          ✨ sanctified
        </span>
      )}
    </li>
  );

const StreamerGear: React.FC<{ data: PatchData; onApply: (it: ImportedItem) => void }> = ({ data, onApply }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<StreamerFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [who, setWho] = useState(0);
  const [pick, setPick] = useState<number | null>(null);

  // Fetched on FIRST OPEN, never at page load. The gear file is a separate request precisely so that
  // a player who never opens this panel does not pay for it.
  useEffect(() => {
    if (!open || file || failed) return;
    let live = true;
    void loadStreamers().then(
      (f) => { if (live) setFile(f); },
      () => { if (live) setFailed(true); },
    );
    return () => { live = false; };
  }, [open, file, failed]);

  const character = file?.characters[who];
  const item: StreamerItem | undefined = pick === null ? undefined : character?.items[pick];
  const reading: GearReading | null = useMemo(
    () => (item ? readGear(data, item) : null),
    [data, item],
  );

  const apply = () => {
    if (!reading || reading.blocked) return;
    onApply(reading.item);
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
          🎮 Load a streamer’s item
        </span>
        <span className="text-xs text-muted-foreground">
          see real gear <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          {failed && (
            <p className="text-[11px] text-amber-300">
              Couldn’t load the gear file. Everything else on this tab still works.
            </p>
          )}
          {!file && !failed && <p className="text-[11px] text-muted-foreground">Loading gear…</p>}

          {file && character && (
            <>
              <p className="text-[11px] text-muted-foreground">
                Gear read from public {file.source} on <strong>{file.updated}</strong> — a snapshot, not
                live. Pick an item to see how it was built, then load it into the tab and plan from there.
              </p>

              {file.characters.length > 1 && (
                <label className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Character
                  </span>
                  <select
                    className={selectCls}
                    value={who}
                    onChange={(e) => { setWho(Number(e.target.value)); setPick(null); }}
                  >
                    {file.characters.map((c, i) => (
                      <option key={c.profile} value={i}>{c.character} — {c.className}</option>
                    ))}
                  </select>
                </label>
              )}

              <p className="text-xs">
                <strong>{character.character}</strong>
                <span className="text-muted-foreground">
                  {' '}· {character.className} · level {character.level} · {character.league}
                </span>
              </p>

              <ul className="flex flex-wrap gap-1">
                {character.items.map((it, i) => (
                  <li key={`${it.slot}-${it.name}`}>
                    <button
                      type="button"
                      onClick={() => setPick(pick === i ? null : i)}
                      aria-pressed={pick === i}
                      className={`rounded border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        pick === i ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-border'
                      }`}
                    >
                      <span className="text-muted-foreground">{it.slot}</span> {it.name}
                    </button>
                  </li>
                ))}
              </ul>

              {item && reading && (
                <div className="rounded border border-border/60 p-2 space-y-2">
                  <p className="text-xs">
                    <strong>{item.name}</strong>
                    <span className="text-muted-foreground"> · {item.baseName} · ilvl {item.level}</span>
                  </p>

                  <ul className="space-y-0.5">
                    {item.mods.map((m, i) => (
                      <ModLine
                        key={`${m.modId}-${i}`}
                        data={data}
                        modId={m.modId}
                        tier={m.tierDisplay}
                        fractured={m.fractured}
                        desecrated={m.desecrated}
                        sanctified={m.sanctified}
                      />
                    ))}
                  </ul>

                  {/* Every omission, always. This is the panel's whole claim to being trustworthy. */}
                  {reading.omitted.map((o) => (
                    <p key={o} className="text-[11px] text-amber-300">{o}</p>
                  ))}
                  {reading.blocked && <p className="text-[11px] text-amber-300">{reading.blocked}</p>}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={apply} disabled={reading.blocked !== undefined}>
                      Use this item
                    </Button>
                    <span className="text-[11px] text-muted-foreground">
                      {reading.blocked
                        ? 'Nothing to load — this item is finished.'
                        : reading.omitted.length === 0
                          ? `All ${placedCount(reading)} modifiers — this replaces what’s on the tab.`
                          : `${placedCount(reading)} of ${placedCount(reading) + reading.omitted.length} modifiers, for the reasons above.`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamerGear;
