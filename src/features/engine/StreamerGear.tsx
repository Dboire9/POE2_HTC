import React, { useEffect, useMemo, useState } from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  loadStreamers, readGear, placedCount,
  type GearReading, type StreamerFile, type StreamerItem,
} from '../../lib/streamerGear';
import type { ImportedItem } from '../../lib/engineTypes';

/**
 * "Streamer gear" — a tab for looking at items somebody actually built.
 *
 * The hard question in the Item tab is not how to type an item in, it is what a finished item is
 * supposed to LOOK like. A player who has never seen a six-mod endgame staff has no idea which
 * modifiers are worth wanting, and the pickers will not tell them. Real gear will.
 *
 * IT CRAFTS NOTHING ITSELF. Picking an item hands it to the Item tab and switches there, so there is
 * one crafting surface rather than two that have to agree.
 *
 * IT IS A SNAPSHOT, AND IT SAYS SO. The resolving happened in a periodic job (`tools/streamers/`),
 * because it needs a column the browser's copy of the mod data does not carry; what ships is the
 * answer. So this shows the date and never claims to be live.
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

const StreamerGear: React.FC<{ data: PatchData; onApply: (item: ImportedItem) => void }> = ({ data, onApply }) => {
  const [file, setFile] = useState<StreamerFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [who, setWho] = useState(0);
  const [pick, setPick] = useState<number | null>(null);

  // The gear file is its own request, made when this tab is first shown — a player who never opens it
  // does not download it.
  useEffect(() => {
    let live = true;
    void loadStreamers().then(
      (f) => { if (live) setFile(f); },
      () => { if (live) setFailed(true); },
    );
    return () => { live = false; };
  }, []);

  const character = file?.characters[who];
  const item: StreamerItem | undefined = pick === null ? undefined : character?.items[pick];
  const reading: GearReading | null = useMemo(
    () => (item ? readGear(data, item) : null),
    [data, item],
  );

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-bold">Gear other people are wearing</h3>
        <p className="text-[11px] text-muted-foreground">
          Pick an item to see how it was built, then load it into <strong>I have an item</strong> and
          plan from there — what to keep, what to re-roll, and what it would cost to finish.
        </p>

        {failed && (
          <p className="text-[11px] text-amber-300">
            Couldn’t load the gear file. Everything else in the app still works.
          </p>
        )}
        {!file && !failed && <p className="text-[11px] text-muted-foreground">Loading gear…</p>}

        {file && character && (
          <>
            <p className="text-[11px] text-muted-foreground">
              Read from public {file.source} on <strong>{file.updated}</strong> — a snapshot, not live.
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
          </>
        )}
      </Card>

      {item && reading && (
        <Card className="p-4 space-y-2">
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

          {/* Every omission, always. This is the tab's whole claim to being trustworthy. */}
          {reading.omitted.map((o) => (
            <p key={o} className="text-[11px] text-amber-300">{o}</p>
          ))}
          {reading.blocked && <p className="text-[11px] text-amber-300">{reading.blocked}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => { if (!reading.blocked) onApply(reading.item); }}
              disabled={reading.blocked !== undefined}
            >
              Use this item →
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {reading.blocked
                ? 'Nothing to load — this item is finished.'
                : reading.omitted.length === 0
                  ? `All ${placedCount(reading)} modifiers, onto the Item tab.`
                  : `${placedCount(reading)} of ${placedCount(reading) + reading.omitted.length} modifiers, for the reasons above.`}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StreamerGear;
