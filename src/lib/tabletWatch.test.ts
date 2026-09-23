import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addMine, hide, prefsFor, readWatch, removeMine, unhideAll } from './tabletWatch';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
const keyOf = (mods: readonly { id: string }[]) => `T|${mods.map((m) => m.id).sort().join(',')}`;

describe('the watch list a player changed, kept in their browser', () => {
  it('keeps their own sets per tablet, once each, and the ones they hid, until they show them again', () => {
    let s = readWatch();
    s = addMine(s, 'T', [{ id: 'a' }], keyOf);
    s = addMine(s, 'T', [{ id: 'a' }], keyOf); // once
    s = hide(s, 'T|b');
    s = hide(s, 'U|c');
    expect(readWatch()).toEqual({ mine: { T: [[{ id: 'a' }]] }, hidden: ['T|b', 'U|c'] });
    expect(prefsFor(readWatch(), 'T').mine).toEqual([[{ id: 'a' }]]);
    s = removeMine(s, 'T', 'T|a', keyOf);
    unhideAll(s, 'T'); // only this tablet's
    expect(readWatch()).toEqual({ mine: { T: [] }, hidden: ['U|c'] });
  });

  it('reads nothing it cannot trust, and survives storage that throws', () => {
    localStorage.setItem('poe2htc.tablets.watch', '{"mine":{"T":[[{"id":"a"}],"junk",[]]},"hidden":["k",3]}');
    expect(readWatch()).toEqual({ mine: { T: [[{ id: 'a' }]] }, hidden: ['k'] });
    localStorage.setItem('poe2htc.tablets.watch', 'not json');
    expect(readWatch()).toEqual({ mine: {}, hidden: [] });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => hide(readWatch(), 'k')).not.toThrow();
  });
});
