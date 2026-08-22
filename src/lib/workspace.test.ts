import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { PREFS_PREFIX } from './currencyPrefs';
import {
  STORAGE_KEY, decodeWorkspace, defaultWorkspace, encodeWorkspace, getWorkspace, setWorkspace,
  useField, type Workspace,
} from './workspace';

const data = loadPatch('data/patches/0.5.0');
const wands = data.bases.get('Wands')!;
const P = wands.pools.normal.prefixes.slice(0, 3);
const S = wands.pools.normal.suffixes.slice(0, 2);

const filled = (): Workspace => ({
  mode: 'item',
  lab: {
    baseId: 'Wands', level: 79,
    targets: [{ modId: P[0]!, tierDisplay: 1 }, { modId: S[0]!, tierDisplay: 4 }],
    fractured: new Set([P[0]!]),
    pinned: new Set([S[0]!]),
    budget: '600',
  },
  item: {
    baseId: 'Wands', level: 81, rarity: 'rare',
    prefixes: [{ modId: P[1]!, tierDisplay: 2, fractured: true }],
    suffixes: [{ modId: S[1]!, tierDisplay: 3 }],
    subMode: 'plan',
    target: [{ modId: P[2]!, tierDisplay: 1 }],
  },
});

describe('URL codec — a workspace survives the round trip', () => {
  it('preserves every field, including the Sets', () => {
    const before = filled();
    const out = decodeWorkspace(encodeWorkspace(before), data);
    expect(out).not.toBeNull();
    expect(out!.dropped).toEqual([]);
    expect(out!.workspace).toEqual(before);
    // toEqual compares Sets structurally; assert the type survived too, since the components call
    // `.has()` on these and an array would fail silently at runtime rather than in the diff.
    expect(out!.workspace.lab.fractured).toBeInstanceOf(Set);
  });

  it('keeps an empty workspace empty rather than inventing defaults', () => {
    const out = decodeWorkspace(encodeWorkspace(defaultWorkspace()), data);
    expect(out!.workspace).toEqual(defaultWorkspace());
  });

  // The prefix strip is what keeps a link short; it has to survive being put back.
  it('strips the base prefix from ids on the wire and restores it on the way out', () => {
    const payload = encodeWorkspace(filled());
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    expect(json).not.toContain('Wands/'); // …carried once as the base, never per mod
    expect(decodeWorkspace(payload, data)!.workspace.lab.targets[0]!.modId).toBe(P[0]);
  });

  it('produces a link short enough to paste for a full 6-mod craft', () => {
    const big = filled();
    const six = [...wands.pools.normal.prefixes.slice(0, 3), ...wands.pools.normal.suffixes.slice(0, 3)];
    const payload = encodeWorkspace({
      ...big,
      lab: { ...big.lab, targets: six.map((modId) => ({ modId, tierDisplay: 1 })) },
    });
    expect(payload.length).toBeLessThan(1500);
  });
});

describe('URL codec — a link from another build must degrade, not crash', () => {
  // `resolveMod` THROWS on an unknown id, so an unvalidated link would take the planner down rather
  // than lose a mod. A data refresh renaming or removing a mod is the realistic way this happens.
  it('drops mods this build no longer knows, and reports them', () => {
    const ws = filled();
    const payload = encodeWorkspace({
      ...ws,
      lab: { ...ws.lab, targets: [...ws.lab.targets, { modId: 'Wands/NoSuchModAnyMore', tierDisplay: 1 }] },
    });
    const out = decodeWorkspace(payload, data)!;
    expect(out.dropped).toContain('Wands/NoSuchModAnyMore');
    expect(out.workspace.lab.targets.map((t) => t.modId)).not.toContain('Wands/NoSuchModAnyMore');
    expect(out.workspace.lab.targets).toHaveLength(2); // the real ones survived
  });

  it('drops a base that no longer exists rather than planning against nothing', () => {
    const ws = filled();
    const payload = encodeWorkspace({ ...ws, lab: { ...ws.lab, baseId: 'Trebuchets' } });
    const out = decodeWorkspace(payload, data)!;
    expect(out.dropped).toContain('Trebuchets');
    expect(out.workspace.lab.baseId).toBe('');
  });

  it.each([
    ['not base64 at all', '!!!!'],
    ['truncated', encodeWorkspace(filled()).slice(0, 12)],
    ['valid base64, not JSON', btoa('hello there')],
    ['empty', ''],
  ])('returns null for a payload that is %s', (_label, payload) => {
    expect(decodeWorkspace(payload, data)).toBeNull();
  });

  // A future format must be refused outright: silently reading v2 with v1's rules would produce a
  // workspace that looks plausible and isn't.
  it('refuses a version it does not understand', () => {
    const wrong = btoa(JSON.stringify({ v: 99, m: 'p', l: {}, i: {} }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeWorkspace(wrong, data)).toBeNull();
  });
});

describe('store', () => {
  beforeEach(() => {
    localStorage.clear();
    setWorkspace(defaultWorkspace());
  });

  it('round-trips through localStorage with Sets intact', () => {
    setWorkspace(filled());
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.lab.fractured).toEqual([...filled().lab.fractured]); // arrays on disk…
    expect(getWorkspace().lab.fractured).toBeInstanceOf(Set); // …Sets in memory
  });

  // main.tsx wipes localStorage on a CACHE_VERSION bump. The user's work is not a cache, and losing it
  // on an upgrade would be indistinguishable from the bug this whole change fixes.
  it('lives under the prefix that survives the cache wipe', () => {
    expect(STORAGE_KEY.startsWith(PREFS_PREFIX)).toBe(true);
  });
});

describe('useField — a useState-shaped view of the store', () => {
  beforeEach(() => setWorkspace(defaultWorkspace()));

  it('sets a value directly', () => {
    const { result } = renderHook(() => useField('lab', 'level'));
    act(() => result.current[1](66));
    expect(getWorkspace().lab.level).toBe(66);
  });

  // The components rely on this form: setFractured((f) => { const n = new Set(f); …; return n; }).
  it('supports functional updates over the previous value', () => {
    const { result } = renderHook(() => useField('lab', 'fractured'));
    act(() => result.current[1]((f) => new Set([...f, 'a'])));
    act(() => result.current[1]((f) => new Set([...f, 'b'])));
    expect([...getWorkspace().lab.fractured].sort()).toEqual(['a', 'b']);
  });

  // Two updates in one tick must both land. Reading the render-time snapshot instead of the store
  // would make the second silently discard the first — e.g. removing a target also clears its pin.
  it('does not lose an update when two land in the same tick', () => {
    const { result: targets } = renderHook(() => useField('lab', 'targets'));
    const { result: pinned } = renderHook(() => useField('lab', 'pinned'));
    act(() => {
      targets.current[1]([{ modId: 'x', tierDisplay: 1 }]);
      pinned.current[1](new Set(['x']));
    });
    expect(getWorkspace().lab.targets).toHaveLength(1);
    expect([...getWorkspace().lab.pinned]).toEqual(['x']);
  });

  it('re-renders subscribers when another component changes the same field', () => {
    const { result } = renderHook(() => useField('item', 'rarity'));
    expect(result.current[0]).toBe('rare');
    act(() => setWorkspace({ ...getWorkspace(), item: { ...getWorkspace().item, rarity: 'magic' } }));
    expect(result.current[0]).toBe('magic');
  });
});
