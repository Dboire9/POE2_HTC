import { describe, it, expect, beforeEach } from 'vitest';
import { advance, craftSig, readSession, startSession, undo, writeSession } from './craftAlong';

beforeEach(() => localStorage.clear());

describe('a Craft along session', () => {
  it('adds each move at its price and steps back one move on Undo', () => {
    let s = startSession('sig', 'start');
    s = advance(s, 'a', 1.5);
    s = advance(s, 'b', 2);
    expect(s).toMatchObject({ key: 'b', spent: 3.5 });
    expect(s.history).toHaveLength(2);
    s = undo(s);
    expect(s).toMatchObject({ key: 'a', spent: 1.5 });
    s = undo(undo(s));
    // Undo at the start changes nothing.
    expect(s).toEqual(startSession('sig', 'start'));
  });

  it('identifies a craft by what it asks, not by the effort or the budget it ran with', () => {
    const req = { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets: [{ modId: 'x', tierDisplay: 1 }] };
    expect(craftSig('lab', { ...req, effort: { maxMillis: 1 }, budget: 5, want: [] })).toBe(craftSig('lab', req));
    expect(craftSig('lab', { ...req, targets: [] })).not.toBe(craftSig('lab', req));
    expect(craftSig('item', req)).not.toBe(craftSig('lab', req));
  });

  it('keeps one session per tab in the browser, and resumes it only for the same craft', () => {
    const lab = advance(startSession('craft-1', 'start'), 'a', 1);
    writeSession('lab', lab);
    writeSession('item', startSession('craft-2', 'held'));
    expect(readSession('lab', 'craft-1')).toEqual(lab);
    expect(readSession('lab', 'craft-9')).toBeUndefined();
    expect(readSession('item', 'craft-2')?.key).toBe('held');
    writeSession('lab', undefined);
    expect(readSession('lab', 'craft-1')).toBeUndefined();
    expect(readSession('item', 'craft-2')).toBeDefined();
  });

  it('reads storage it cannot understand as no session, rather than throwing', () => {
    localStorage.setItem('poe2htc.craftAlong.v1', '{not json');
    expect(readSession('lab', 'x')).toBeUndefined();
    localStorage.setItem('poe2htc.craftAlong.v1', JSON.stringify({ lab: { sig: 'x', key: 'k', spent: 'lots', history: [] } }));
    expect(readSession('lab', 'x')).toBeUndefined();
  });
});
