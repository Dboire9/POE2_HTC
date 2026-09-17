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
    baseCost: '2.5',
    runes: ['astrids-creativity'],
    // No FREE SLOTS here on purpose: the version tests below strip the runes off this fixture and
    // assert it falls back to version 1, which a free slot would silently prevent.
    spare: { prefixes: 0, suffixes: 0 },
  },
  item: {
    baseId: 'Wands', level: 81, rarity: 'rare',
    prefixes: [{ modId: P[1]!, tierDisplay: 2, fractured: true }],
    suffixes: [{ modId: S[1]!, tierDisplay: 3 }],
    subMode: 'plan',
    target: [{ modId: P[2]!, tierDisplay: 1 }],
    runes: ['serles-triumph'],
    spare: { prefixes: 0, suffixes: 0 },
  },
});

/** The wire object a payload carries, for the tests that care what was written rather than read. */
const wireOf = (payload: string): { v: number; l: { ru?: string[] }; i: { ru?: string[] } } => {
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
};

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

describe('URL codec — socketed runes', () => {
  /**
   * A rune changes what the item may HOLD — a second crafted modifier, a fourth suffix — so a build
   * that ignored `ru` would not lose a detail: it would plan a craft the player never described. The
   * link says so in its version, exactly as slot alternatives do, and an old build refuses it.
   */
  it('marks a link that names a rune, and leaves every other link at version 1', () => {
    expect(wireOf(encodeWorkspace(filled())).v).toBe(3);
    const ws = filled();
    const none = { ...ws, lab: { ...ws.lab, runes: [] }, item: { ...ws.item, runes: [] } };
    expect(wireOf(encodeWorkspace(none)).v).toBe(1);
    // …and writes nothing at all for a craft with no runes, so those links keep their old bytes.
    expect(wireOf(encodeWorkspace(none)).l.ru).toBeUndefined();
  });

  it('carries each tab’s runes back', () => {
    const out = decodeWorkspace(encodeWorkspace(filled()), data)!;
    expect(out.workspace.lab.runes).toEqual(['astrids-creativity']);
    expect(out.workspace.item.runes).toEqual(['serles-triumph']);
  });

  /** A rune this build has never heard of is a real loss: the craft it describes allows something this
   *  one will not, so it is reported rather than quietly dropped into a stricter craft. */
  it('drops a rune it does not know, and reports it', () => {
    const ws = filled();
    const payload = encodeWorkspace({ ...ws, lab: { ...ws.lab, runes: ['astrids-creativity', 'rune-from-0-6'] } });
    const out = decodeWorkspace(payload, data)!;
    expect(out.dropped).toContain('rune-from-0-6');
    expect(out.workspace.lab.runes).toEqual(['astrids-creativity']);
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

  /**
   * A link may ask for an essence mod; it may not claim you are already holding one.
   *
   * The two directions differ because the model does. A regular-essence TARGET is planned properly
   * (the MDP gained an Essence action on 2026-08-28). A HELD essence mod has no state axis at all — it
   * lands in the junk counts with no marker, so the one-essence-per-item rule cannot be enforced
   * around it — and the item builder never offers one, so only a hand-edited link can produce it.
   */
  it('drops an essence mod claimed as already ON the item, but keeps it as a target', () => {
    const ws = filled();
    const ess = [...data.mods.values()].find((m) => m.source === 'essence' && m.id.startsWith('Wands/'))!;
    const payload = encodeWorkspace({
      ...ws,
      lab: { ...ws.lab, targets: [...ws.lab.targets, { modId: ess.id, tierDisplay: 1 }] },
      item: {
        ...ws.item,
        prefixes: ess.type === 'prefix'
          ? [...ws.item.prefixes, { modId: ess.id, tierDisplay: 1 }] : ws.item.prefixes,
        suffixes: ess.type === 'suffix'
          ? [...ws.item.suffixes, { modId: ess.id, tierDisplay: 1 }] : ws.item.suffixes,
      },
    });
    const out = decodeWorkspace(payload, data)!;
    const held = [...out.workspace.item.prefixes, ...out.workspace.item.suffixes].map((m) => m.modId);
    expect(held).not.toContain(ess.id);
    expect(out.dropped).toContain(ess.id);
    // …and the same id as a TARGET is untouched, which is the half that must keep working.
    expect(out.workspace.lab.targets.map((t) => t.modId)).toContain(ess.id);
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

  /**
   * A link shared BEFORE a field existed must still open.
   *
   * `baseCost` was added to the wire after FORMAT 1 shipped, without bumping the version — bumping it
   * would have made every link anyone had already sent decode to null, which is a far worse trade for
   * one optional field. So the missing key has to read as "use the default" rather than as corruption.
   */
  it('opens a link written before the base price existed', () => {
    const b64 = encodeWorkspace(filled()).replace(/-/g, '+').replace(/_/g, '/');
    const wire = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
    expect(wire.l.bc).toBe('2.5'); // or the deletion below proves nothing
    delete wire.l.bc;
    const old = btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const out = decodeWorkspace(old, data);
    expect(out).not.toBeNull();
    expect(out!.workspace.lab.baseCost).toBe('');
    expect(out!.workspace.lab.budget).toBe('600'); // the rest of the link is untouched
  });

  /**
   * A shared link is UNTRUSTED INPUT — a public URL anyone can hand you or mistype.
   *
   * Only the JSON parse used to be guarded, so a payload that was valid base64 holding valid JSON of
   * the WRONG SHAPE threw from inside the mapping helpers. That throw landed in EngineLab's loading
   * `useEffect`, where React unmounts the tree: one malformed link white-screened the whole app.
   *
   * Every case below crashed before the fix. `decodeWorkspace` promises null for anything that is not
   * a workspace, and the call site already renders that as "That link could not be read".
   */
  it.each([
    ['a targets list that is not a list', { v: 1, m: 'p', l: { b: 'Wands', lv: 'abc', t: 'notarray' }, i: {} }],
    ['a null where a mod id belongs', { v: 1, m: 'p', l: { b: 'Wands', t: [[null, null]] }, i: { b: 'Wands', px: [[1, 2, 3]] } }],
    ['objects where [id, tier] pairs belong', { v: 1, m: 'p', l: { b: {}, lv: {}, t: [{}] }, i: { b: [], sx: [{}] } }],
    ['a wire with null sections', { v: 1, m: 'p', l: null, i: null }],
    ['JSON that is not an object at all', []],
  ])('returns null rather than throwing on %s', (_label, wire) => {
    const payload = btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(() => decodeWorkspace(payload, data)).not.toThrow();
    expect(decodeWorkspace(payload, data)).toBeNull();
  });

  /**
   * A link is not a form, so nothing stops it carrying a level the input control would refuse. `??`
   * only catches null and undefined, so 1e308 sailed through to the engine's tier gating.
   */
  it('refuses an item level a link has no business carrying', () => {
    const wire = { v: 1, m: 'p', l: { b: 'Wands', lv: 1e308, t: [] }, i: { b: 'Wands' } };
    const payload = btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const out = decodeWorkspace(payload, data);
    expect(out).not.toBeNull();
    expect(out!.workspace.lab.level).toBe(defaultWorkspace().lab.level);
  });

  // A future format must be refused outright: silently reading v2 with v1's rules would produce a
  // workspace that looks plausible and isn't.
  it('refuses a version it does not understand', () => {
    const wrong = btoa(JSON.stringify({ v: 99, m: 'p', l: {}, i: {} }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeWorkspace(wrong, data)).toBeNull();
  });
});

/**
 * The mirror of the malformed-shape table above, and the reason that table was not enough.
 *
 * Those cases THROW inside the decoder, so the try/catch converts them into a clean null. These do
 * not. `bg`, `bc` and a target's tier decode without complaint and escape into app state carrying the
 * WRONG TYPE, where they throw later: `budget.trim()` runs in EngineLab on every Compute, which is
 * the one thing a shared link exists for. A link carrying `bg: 5` therefore killed the app for
 * whoever opened it, and no try/catch anywhere could have caught it.
 *
 * `clampLevel` fixed `lv` and missed `bg`/`bc` sitting two lines below it. The `WireIn` type is what
 * stops the next field repeating that — these tests pin the behaviour, the type pins the habit.
 */
describe('URL codec — a link that decodes cleanly must not smuggle a wrong TYPE into app state', () => {
  const link = (wire: unknown): string =>
    btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const lab = (over: Record<string, unknown>): string =>
    link({
      v: 1, m: 'p',
      l: { b: 'Wands', lv: 79, t: [], f: [], p: [], bg: '', bc: '', ...over },
      i: { b: 'Wands' },
    });

  it.each([[5], [{}], [[]], [true], [1e308]])('holds budget to a string when the link carries %j', (bg) => {
    const out = decodeWorkspace(lab({ bg }), data);
    expect(out).not.toBeNull();
    expect(out!.workspace.lab.budget).toBe('');
    expect(() => out!.workspace.lab.budget.trim()).not.toThrow(); // what EngineLab does on Compute
  });

  it.each([[7], [{}], [[]], [true]])('holds baseCost to a string when the link carries %j', (bc) => {
    const out = decodeWorkspace(lab({ bc }), data);
    expect(out).not.toBeNull();
    expect(out!.workspace.lab.baseCost).toBe('');
    expect(() => out!.workspace.lab.baseCost.trim()).not.toThrow();
  });

  // The quieter failure of the two: a tier reaches `n - tierDisplay` in engineMap, and NaN passes
  // straight through the Math.min/Math.max that clamp the range — so a non-number plans a garbage
  // tier index instead of crashing. `null` is in here for a different reason: it arithmetics as 0,
  // which silently selects the WORST tier rather than the best one the player would have added.
  it.each([['abc'], [{}], [null], [true]])('falls back to the best tier when a target carries %j', (tier) => {
    const out = decodeWorkspace(lab({ t: [[P[0]!, tier]] }), data);
    expect(out).not.toBeNull();
    const t = out!.workspace.lab.targets[0]!;
    expect(t.tierDisplay).toBe(1);
    expect(Number.isNaN(5 - t.tierDisplay)).toBe(false); // engineMap's expression, verbatim
  });

  it('leaves a legitimate tier alone', () => {
    const out = decodeWorkspace(lab({ t: [[P[0]!, 4]] }), data);
    expect(out!.workspace.lab.targets[0]!.tierDisplay).toBe(4);
  });

  // A non-string base is corrupt, not a base this build LOST, so it must not land in `dropped` —
  // that list renders as "... no longer exists", which with an object in it reads
  // "[object Object] no longer exists": a claim about the data that is simply untrue.
  it.each([[5], [{}], [[]]])('blanks a non-string base without claiming it once existed', (b) => {
    const out = decodeWorkspace(lab({ b }), data);
    expect(out).not.toBeNull();
    expect(out!.workspace.lab.baseId).toBe('');
    expect(out!.dropped).toEqual([]);
  });

  it('still reports a base that really did exist and is now gone', () => {
    const out = decodeWorkspace(lab({ b: 'NoSuchBase' }), data);
    expect(out!.workspace.lab.baseId).toBe('');
    expect(out!.dropped).toEqual(['NoSuchBase']);
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

/**
 * SLOT ALTERNATIVES on the wire.
 *
 * A slot changes what a craft MEANS: "any one of Cold, Lightning, Chaos" against "Cold and Lightning
 * and Chaos, all three" — the second being an item that cannot exist. An older build silently dropping
 * the grouping would therefore plan something the link never said, which is the exact failure the `v`
 * field exists to prevent. So a link carrying alternatives is written as version 2 and refused by
 * builds that predate them, while everything else keeps writing version 1.
 */
describe('slot alternatives round-trip, without stranding old links', () => {
  const ver = (payload: string): number =>
    JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).v;

  const withSlots = (): Workspace => {
    const w = defaultWorkspace();
    return {
      ...w,
      lab: {
        ...w.lab, baseId: 'Wands',
        targets: [
          { modId: P[0]!, tierDisplay: 1, slot: 0 },
          { modId: P[1]!, tierDisplay: 3, slot: 0 },
          { modId: S[0]!, tierDisplay: 2 },
        ],
      },
    };
  };

  it('carries the grouping and the per-candidate tiers through a link', () => {
    const back = decodeWorkspace(encodeWorkspace(withSlots()), data)!;
    expect(back.workspace.lab.targets).toEqual([
      { modId: P[0]!, tierDisplay: 1, slot: 0 },
      { modId: P[1]!, tierDisplay: 3, slot: 0 },
      { modId: S[0]!, tierDisplay: 2 },
    ]);
  });

  it('writes version 2 only when a craft actually uses alternatives', () => {
    expect(ver(encodeWorkspace(withSlots()))).toBe(2);
    // `filled()` names socketed runes, which carry a version of their own — take them off so this
    // says what it means: no ALTERNATIVES, so not version 2.
    const f = filled();
    const noRunes = { ...f, lab: { ...f.lab, runes: [] }, item: { ...f.item, runes: [] } };
    expect(ver(encodeWorkspace(noRunes))).toBe(1);
    expect(ver(encodeWorkspace(defaultWorkspace()))).toBe(1);
  });

  /**
   * A slot of ONE is not a choice, and an id gets left on one whenever a two-candidate slot loses a
   * candidate. Writing it would push the link to version 2 — locking it out of every older build — in
   * exchange for a disjunction with a single option. The encoder derives which slots are real rather
   * than trusting the list it was handed, so the same craft always produces the same bytes.
   */
  it('drops a slot id that no longer groups anything, and stays on version 1', () => {
    const w = withSlots();
    const orphaned: Workspace = {
      ...w,
      lab: { ...w.lab, targets: w.lab.targets.filter((t) => t.modId !== P[1]!) },
    };
    const payload = encodeWorkspace(orphaned);
    expect(ver(payload)).toBe(1);
    expect(decodeWorkspace(payload, data)!.workspace.lab.targets)
      .toEqual([{ modId: P[0]!, tierDisplay: 1 }, { modId: S[0]!, tierDisplay: 2 }]);
  });

  // Version 1 links were written before slots existed and must keep opening, untouched.
  it('still opens every link written before slots existed', () => {
    const back = decodeWorkspace(encodeWorkspace(filled()), data)!;
    for (const t of back.workspace.lab.targets) expect(t.slot).toBeUndefined();
  });

  // A slot id is an opaque grouping key. Rubbish in it must degrade the target to "no slot" rather
  // than reach app state — the same rule every other leaf on this wire follows.
  it('reads a nonsense slot id as no slot at all', () => {
    const bad = btoa(JSON.stringify({
      v: 2, m: 'p',
      l: { b: 'Wands', lv: 80, t: [[P[0]!.replace('Wands/', ''), 1, 'boom']], f: [], p: [], bg: '' },
      i: { b: '', lv: 80, r: 'r', px: [], sx: [], sm: 'c', t: [] },
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const back = decodeWorkspace(bad, data);
    expect(back).not.toBeNull();
    expect(back!.workspace.lab.targets[0]!.slot).toBeUndefined();
  });
});

// ── A link cannot carry an item the app can no longer build ──────────────────
// Both pickers cap fractured marks at one (the Fracturing Orb locks "a random modifier" and "cannot be
// used on Fractured items"), so a link carrying two describes a state nothing can produce. It crashes
// nothing — every planner filters `!fractured` and copes with any number — it quietly returns odds for
// an item that cannot exist, which is why `?? default` was never the guard a link needed.
describe('decodeWorkspace — one fractured modifier survives, not two', () => {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  it('keeps one of several fractured targets on the base', () => {
    const wire = {
      v: 1, m: 'p',
      l: { b: 'Wands', lv: 82, t: [], f: ['IncreasedMana', 'LocalAttributeRequirements'], p: [] },
      i: { b: 'Wands', lv: 82 },
    };
    const got = decodeWorkspace(b64(wire), data)?.workspace;
    expect(got?.lab.fractured.size).toBe(1);
  });

  // Across BOTH sides, because the cap is per ITEM and a link can put one on each.
  it('keeps one fractured mod across the prefix and suffix lists', () => {
    const wire = {
      v: 1, m: 'i',
      l: { b: 'Wands', lv: 82, t: [], f: [], p: [] },
      i: {
        b: 'Wands', lv: 82, r: 'r',
        px: [['IncreasedMana', 1, 1]],
        sx: [['LocalAttributeRequirements', 1, 1]],
      },
    };
    const got = decodeWorkspace(b64(wire), data)?.workspace;
    const all = [...(got?.item.prefixes ?? []), ...(got?.item.suffixes ?? [])];
    expect(all.length).toBe(2);                                     // both mods survive…
    expect(all.filter((m) => m.fractured === true)).toHaveLength(1); // …only one stays locked
  });

  it('leaves an ordinary link alone', () => {
    const wire = {
      v: 1, m: 'i',
      l: { b: 'Wands', lv: 82, t: [], f: [], p: [] },
      i: { b: 'Wands', lv: 82, r: 'r', px: [['IncreasedMana', 1, 1]], sx: [['LocalAttributeRequirements', 1]] },
    };
    const got = decodeWorkspace(b64(wire), data)?.workspace;
    expect(got?.item.prefixes[0]?.fractured).toBe(true);
    expect(got?.item.suffixes[0]?.fractured).toBeUndefined();
  });
});


/**
 * The tab rides in the share link, and a THIRD one was added after links had been in the wild for a
 * while. Both directions matter: a `gear` link must come back as `gear`, and a link an older build
 * could not have written must not take the app down.
 */
describe('the tab in a share link', () => {
  it('round-trips the gear tab', () => {
    const out = decodeWorkspace(encodeWorkspace({ ...defaultWorkspace(), mode: 'gear' }), data);
    expect(out!.workspace.mode).toBe('gear');
  });

  it('round-trips each of the three tabs', () => {
    for (const mode of ['plan', 'item', 'gear'] as const) {
      const out = decodeWorkspace(encodeWorkspace({ ...defaultWorkspace(), mode }), data);
      expect(out!.workspace.mode, mode).toBe(mode);
    }
  });

  /**
   * A stranger's link. `m` is untrusted like every other leaf, so an unrecognised one opens the tab a
   * first-time visitor gets rather than throwing — a white screen from a crafted URL is the failure
   * this decoder exists to prevent.
   */
  it('falls back to the plan tab on a mode it does not recognise', () => {
    const b64 = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const link = JSON.parse(atob(
      encodeWorkspace(defaultWorkspace()).replace(/-/g, '+').replace(/_/g, '/'),
    )) as Record<string, unknown>;

    for (const m of ['z', '', 42, null, {}]) {
      const out = decodeWorkspace(b64({ ...link, m }), data);
      expect(out, JSON.stringify(m)).not.toBeNull();
      expect(out!.workspace.mode, JSON.stringify(m)).toBe('plan');
    }
  });
});

/**
 * FREE SLOTS on the wire.
 *
 * A free slot changes what "finished" means — the item may end up carrying a modifier nobody named —
 * so the link says so in its version and an older build refuses it, exactly as slot alternatives and
 * socketed runes do. Measured on the craft the feature was built for: an old reader dropping `sp`
 * would plan the strict item and quote 366.84 ex for a link describing 191.27.
 */
describe('URL codec — free slots', () => {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const raw = (payload: string): Record<string, { sp?: unknown }> =>
    JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  const withFree = (): Workspace => {
    const w = filled();
    return {
      ...w,
      lab: { ...w.lab, spare: { prefixes: 0, suffixes: 1 } },
      item: { ...w.item, spare: { prefixes: 2, suffixes: 0 } },
    };
  };

  it('carries each tab’s free slots back', () => {
    const out = decodeWorkspace(encodeWorkspace(withFree()), data)!;
    expect(out.workspace.lab.spare).toEqual({ prefixes: 0, suffixes: 1 });
    expect(out.workspace.item.spare).toEqual({ prefixes: 2, suffixes: 0 });
  });

  it('writes version 4 only when a craft actually leaves one free', () => {
    expect(wireOf(encodeWorkspace(withFree())).v).toBe(4);
    // `filled()` names socketed runes, which carry a version of their own — so this asserts the
    // FALLBACK is to that, not that the whole scheme collapses to 1.
    expect(wireOf(encodeWorkspace(filled())).v).toBe(3);
    expect(wireOf(encodeWorkspace(defaultWorkspace())).v).toBe(1);
  });

  it('writes nothing at all for a craft with none, so those links keep their old bytes', () => {
    const w = raw(encodeWorkspace(filled()));
    expect(w.l!.sp).toBeUndefined();
    expect(w.i!.sp).toBeUndefined();
  });

  /**
   * A link is not a form. `?? default` catches null and undefined and nothing else, so a hand-written
   * `sp` can carry a negative, a fraction, a string or a count no item could hold. Those are read as
   * zero rather than reported as a loss: unlike an unknown rune id this is not a feature the build
   * lacks, it is a number that was never legal.
   */
  it('clamps a free-slot count that no item could have', () => {
    const link = raw(encodeWorkspace(withFree()));
    for (const sp of [[99, 1], [-1, 2], ['a', 1], [1.5, 1], [null, 3], 'nope', {}, []]) {
      const out = decodeWorkspace(b64({ ...link, l: { ...link.l, sp } }), data);
      expect(out, JSON.stringify(sp)).not.toBeNull();
      const got = out!.workspace.lab.spare;
      expect(got.prefixes, JSON.stringify(sp)).toBeGreaterThanOrEqual(0);
      expect(got.prefixes, JSON.stringify(sp)).toBeLessThanOrEqual(3);
      expect(Number.isInteger(got.suffixes), JSON.stringify(sp)).toBe(true);
    }
    // …and spelled out for the two that matter: too many is dropped, a good one beside it survives.
    const out = decodeWorkspace(b64({ ...link, l: { ...link.l, sp: [99, 2] } }), data)!;
    expect(out.workspace.lab.spare).toEqual({ prefixes: 0, suffixes: 2 });
  });

  /** A link written before free slots existed has no `sp`, and must read as a craft that has none. */
  it('reads a link with no sp as no free slots', () => {
    const link = raw(encodeWorkspace(filled()));
    const out = decodeWorkspace(b64(link), data)!;
    expect(out.workspace.lab.spare).toEqual({ prefixes: 0, suffixes: 0 });
    expect(out.workspace.item.spare).toEqual({ prefixes: 0, suffixes: 0 });
  });
});
