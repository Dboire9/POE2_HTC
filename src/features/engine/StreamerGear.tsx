import React, { useEffect, useMemo, useState } from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  loadStreamers, readGear, placedCount, goalCount,
  type GearReading, type StreamerFile, type StreamerItem,
} from '../../lib/streamerGear';
import type { ImportedItem } from '../../lib/engineTypes';
import { craftFromScratch, importToItem, useAsTarget } from '../../lib/importItem';

/**
 * "Streamer gear" — a tab for looking at items somebody actually built.
 *
 * The hard question in the Item tab is not how to type an item in, it is what a finished item is
 * supposed to LOOK like. A player who has never seen a six-mod endgame staff has no idea which
 * modifiers are worth wanting, and the pickers will not tell them. Real gear will.
 *
 * IT CRAFTS NOTHING ITSELF. It hands the item to one of the two planning tabs and switches there, so
 * there is one crafting surface rather than two that have to agree — and THREE ways to read the same
 * item, because they are genuinely different questions:
 *
 *   - **I own this** — it becomes the item you hold, and the tab plans from it.
 *   - **Craft it from scratch** — its modifiers become targets on a white base of the same kind.
 *   - **Aim at it** — its modifiers become the target while YOUR item stays put, which is the
 *     "I already have two of these six, what now?" question.
 *
 * THE TWO GOAL ROUTES SEND `goal`, NOT `item`, AND ON ONE REAL ITEM THOSE DIFFER. A staff carrying
 * two `Gain as Extra Fire` cannot be held by this planner — one family, twice — but it is perfectly
 * craftable: roll fire AND cold, then socket a Passion of Aldur, which converts the cold one. Sending
 * the five-modifier version would have quoted a cheaper craft for an item nobody owns.
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

/** The three routes out of this tab, injectable so a test can watch them without a workspace. */
export interface GearRoutes {
  readonly own: (it: ImportedItem) => void;
  readonly scratch: (it: ImportedItem) => void;
  readonly aim: (it: ImportedItem) => void;
}

export const DEFAULT_ROUTES: GearRoutes = {
  own: importToItem, scratch: craftFromScratch, aim: useAsTarget,
};

const StreamerGear: React.FC<{ data: PatchData; routes?: GearRoutes }> = ({ data, routes = DEFAULT_ROUTES }) => {
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
  const blocked = reading?.blocked !== undefined;
  const skipped = character?.skipped ?? [];
  const uniques = skipped.filter((s) => s.rarity === 'Unique');
  const unread = skipped.filter((s) => s.rarity !== 'Unique');

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-bold">Gear other people are wearing</h3>
        <p className="text-[11px] text-muted-foreground">
          Pick an item to see how it was built, then load it into <strong>I have an item</strong> and
          plan from there — what to keep, what to re-roll, and what it would cost to finish.
        </p>
        {/* Each clause here is a true, current limitation — keep it that way. When one is fixed, delete
            its clause rather than leaving a caveat that no longer applies. */}
        <p className="rounded border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-[11px] text-amber-300">
          <strong>Beta — still being finished.</strong> A handful of streamers for now, and their gear is
          a snapshot we refresh by hand rather than live. A few item bases aren’t in this app’s data yet,
          so those items can’t be read, and a Sanctified roll counts as the best normal tier, so that
          item really cost more. The tab always says what it left out.
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

            {/* Whole items, held to the same rule as modifiers: nothing this character wears is left
                off without a sentence. Uniques are counted — none is craftable. Rares are NAMED, because
                each one is a gap in this app's data rather than anything about the item. */}
            {skipped.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                <strong>Not shown:</strong>
                {uniques.length > 0 && (
                  <> {uniques.length} Unique{uniques.length === 1 ? '' : 's'} — a Unique can’t be crafted.</>
                )}
                {unread.length > 0 && (
                  <>
                    {' '}{unread.length} Rare{unread.length === 1 ? '' : 's'} this app can’t read yet:
                    <ul className="ml-4 list-disc">
                      {unread.map((s) => <li key={`${s.slot}-${s.name}`}>{s.name} ({s.slot}) — {s.reason}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}
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

          <p className="text-[11px] text-muted-foreground pt-1">
            {reading.blocked
              ? 'Nothing to take from this one — it is finished.'
              : reading.omitted.length === 0
                ? `All ${placedCount(reading)} modifiers come across.`
                : `${placedCount(reading)} of ${placedCount(reading) + reading.omitted.length} modifiers come across as the item you hold, for the reasons above.`}
          </p>

          {/* The craft that actually produces this item, when it is not the item itself. Printed
              BEFORE the buttons, because it changes what two of the three of them do. */}
          {reading.rune && (
            <p className="rounded border border-sky-500/40 bg-sky-500/5 px-2 py-1.5 text-[11px] text-sky-200">
              <strong>This one was made with a rune.</strong> It holds two modifiers of one family,
              which no amount of currency can roll — so the craft aims at{' '}
              <strong>{goalCount(reading)} cross-family modifiers</strong> (
              {reading.rune.converts.join(' and ')}) and finishes by socketing a{' '}
              <strong>{reading.rune.rune}</strong>, which converts them all to {reading.rune.element}.
              <em> Craft this from scratch</em> and <em>I have some of these</em> plan that craft;
              {' '}<em>I own this one</em> loads the {placedCount(reading)} this planner can hold.
              <br />{reading.rune.caveat}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => routes.scratch(reading.goal)} disabled={blocked}>
              Craft this from scratch →
            </Button>
            <Button size="sm" variant="outline" onClick={() => routes.aim(reading.goal)} disabled={blocked}>
              I have some of these →
            </Button>
            <Button size="sm" variant="outline" onClick={() => routes.own(reading.item)} disabled={blocked}>
              I own this one →
            </Button>
          </div>
          {/* Which tab each lands on, and what it does to work already on that tab. Three buttons that
              all say "→" and none of which says where is how a player loses a craft they had set up. */}
          <ul className="text-[11px] text-muted-foreground space-y-0.5">
            <li><strong>Craft this from scratch</strong> — plans it on a white {item.baseName} from
              nothing, on <em>Plan from scratch</em>.</li>
            {/* `{' '}` is load-bearing: JSX drops whitespace between an element and text across a
                line break, and this rendered as "I have an itemand leaves" in the browser. */}
            <li><strong>I have some of these</strong> — makes it the target on <em>I have an item</em>{' '}
              and leaves your own item alone, so the plan covers only what you are missing.</li>
            <li><strong>I own this one</strong> — puts it on <em>I have an item</em> as the item you
              hold, replacing what is there.</li>
          </ul>
        </Card>
      )}
    </div>
  );
};

export default StreamerGear;
