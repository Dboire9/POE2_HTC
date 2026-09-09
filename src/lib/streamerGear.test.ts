import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { readGear, placedCount, type StreamerFile, type StreamerItem } from './streamerGear';

const data = loadPatch('data/patches/0.5.0');
const file = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as StreamerFile;
const gear = file.characters[0]!;
const itemAt = (slot: string): StreamerItem => {
  const it = gear.items.find((i) => i.slot === slot);
  if (!it) throw new Error(`no ${slot} in the shipped gear file`);
  return it;
};

/**
 * The shipped gear file against the shipped patch data.
 *
 * These run on REAL data on purpose — the file is written by a job on one schedule and the mod data
 * refreshed on another, so the two can drift apart, and this suite is where that has to surface. A
 * synthetic fixture would keep passing forever while the app quietly stopped recognising the gear.
 */
describe('the shipped gear file agrees with the shipped patch data', () => {
  it('names a base and a patch this app knows', () => {
    expect(file.patch).toBe(data.patch);
    for (const it of gear.items) {
      expect(data.bases.has(it.baseId), `${it.name} sits on ${it.baseId}`).toBe(true);
    }
  });

  it('names only modifiers this app still has', () => {
    const missing = gear.items.flatMap((it) =>
      it.mods.map((m) => m.modId).filter((id) => !data.mods.has(id)),
    );
    expect(missing, 'a refresh of one file without the other').toEqual([]);
  });
});

describe('readGear', () => {
  it('splits a real item onto the side each modifier actually belongs to', () => {
    const helm = itemAt('Helm');
    const r = readGear(data, helm);

    expect(r.item.baseId).toBe(helm.baseId);
    expect(r.item.level).toBe(helm.level);
    expect(r.item.rarity).toBe('rare');
    // Not merely "six mods landed": each one on the side its own mod entry declares. Reading the side
    // off the data is the whole reason this cannot be done from the gear file alone.
    for (const m of r.item.prefixes) expect(data.mods.get(m.modId)!.type).toBe('prefix');
    for (const m of r.item.suffixes) expect(data.mods.get(m.modId)!.type).toBe('suffix');
    expect(placedCount(r)).toBe(helm.mods.length);
    expect(r.omitted).toEqual([]);
  });

  it('carries each modifier’s tier and its fractured / desecrated flags across', () => {
    const helm = itemAt('Helm');
    const r = readGear(data, helm);
    const placed = [...r.item.prefixes, ...r.item.suffixes];
    for (const m of helm.mods) {
      const got = placed.find((p) => p.modId === m.modId);
      expect(got, m.modId).toBeDefined();
      expect(got!.tierDisplay).toBe(m.tierDisplay);
      expect(got!.fractured ?? false).toBe(m.fractured);
      expect(got!.desecrated ?? false).toBe(m.desecrated);
    }
  });

  /**
   * The Passion of Aldur case, on the real staff that produced it.
   *
   * Two `Gain as Extra Fire` of ONE family — an item the game allows and `ItemState` cannot hold. The
   * second must come off, and the reader must SAY it came off: planning a six-mod craft against a
   * five-mod item, with nothing on screen to explain the missing one, is the failure this exists for.
   */
  it('drops the second modifier of one family, and says which family and why', () => {
    const staff = itemAt('Weapon');
    expect(staff.familyConflict.length, 'the fixture is the Aldur staff').toBeGreaterThan(0);

    const r = readGear(data, staff);
    expect(placedCount(r)).toBe(staff.mods.length - 1);
    expect(r.omitted).toHaveLength(1);
    expect(r.omitted[0]).toContain('two modifiers of the');
    expect(r.omitted[0]).toContain('Passion of Aldur');

    // The invariant the drop exists to protect: no family twice on the item handed to the tab.
    const families = [...r.item.prefixes, ...r.item.suffixes]
      .flatMap((m) => data.mods.get(m.modId)!.families ?? [data.mods.get(m.modId)!.family]);
    expect(new Set(families).size).toBe(families.length);
  });

  it('carries a modifier the job could not read into the omissions', () => {
    const cross = itemAt('Weapon2');
    expect(cross.unresolved.length, 'the fixture has an unreadable line').toBeGreaterThan(0);
    const r = readGear(data, cross);
    expect(r.omitted.join(' ')).toContain(cross.unresolved[0]!);
  });

  it('says the gear file is out of date when it names a modifier this app has not got', () => {
    const r = readGear(data, { ...itemAt('Helm'), mods: [
      { modId: 'Helmets_str/NoSuchModifier', tierDisplay: 1, fractured: false, desecrated: false, sanctified: false },
    ] });
    expect(placedCount(r)).toBe(0);
    expect(r.omitted[0]).toContain('out of date');
  });

  /** An item holds three a side. A fourth is reported, never silently cut. */
  it('reports a fourth modifier of one side rather than dropping it quietly', () => {
    const helm = itemAt('Helm');
    // Four DIFFERENT prefixes of four different families, so the cap is the only thing that can stop
    // the fourth — otherwise this test would pass on the family rule and prove nothing about the cap.
    const prefixes = [...data.mods.values()]
      .filter((m) => m.type === 'prefix' && data.bases.get(helm.baseId)!.pools.normal.prefixes.includes(m.id));
    const chosen: string[] = [];
    const seen = new Set<string>();
    for (const m of prefixes) {
      if (seen.has(m.family)) continue;
      seen.add(m.family);
      chosen.push(m.id);
      if (chosen.length === 4) break;
    }
    expect(chosen).toHaveLength(4);

    const r = readGear(data, { ...helm, mods: chosen.map((id) => (
      { modId: id, tierDisplay: 1, fractured: false, desecrated: false, sanctified: false }
    )) });
    expect(r.item.prefixes).toHaveLength(3);
    expect(r.omitted).toHaveLength(1);
    expect(r.omitted[0]).toContain('4th prefix');
  });

  it('refuses a Corrupted item, because no currency can modify it further', () => {
    const r = readGear(data, { ...itemAt('Helm'), corrupted: true });
    expect(r.blocked).toContain('Corrupted');
  });

  it('leaves `blocked` unset on an ordinary item', () => {
    expect(readGear(data, itemAt('Helm')).blocked).toBeUndefined();
  });

  /**
   * The claim the panel makes when it prints nothing: an empty `omitted` means the import is exact.
   * Asserted across the whole character rather than on one item, since it is the panel's only promise.
   */
  it('accounts for every modifier of every item — placed, or explained', () => {
    for (const it of gear.items) {
      const r = readGear(data, it);
      expect(placedCount(r) + r.omitted.length, it.name)
        .toBe(it.mods.length + it.unresolved.length);
    }
  });
});
