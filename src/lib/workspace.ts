// The user's WORK — what they built, as opposed to what the engine computed from it.
//
// Nothing used to survive. A reload lost the base, level, targets, tiers, fractures, pins and budget;
// worse, EngineLab renders the item tab as `mode === 'item' ? <ItemActions/> : (…)`, so switching tabs
// unmounted ItemActions and wiped the item you had built — roughly 15 searches and clicks for a 6-mod
// item, gone by accident.
//
// Holding that state HERE rather than in the components fixes both at once: unmounting a component no
// longer destroys anything, and one encoding serves both localStorage ("come back later") and a URL
// ("send this to someone"). Doing those separately would have meant writing the encoder twice.
//
// WHAT IS NOT HERE, deliberately: search boxes, the pre-add tier picker, and every RESULT (frontier,
// alternatives, policy graph). Results are derived, and a stored one could outlive the inputs that
// produced it — a plan on screen that no longer matches the item above it is worse than no plan.

import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { PatchData } from '../../packages/engine/src/types.ts';
import { isEssenceMod } from '../../packages/engine/src/probability.ts';
import type { ItemModInput, TargetInput } from './engineTypes.ts';
import { PREFS_PREFIX } from './currencyPrefs';

export interface LabState {
  readonly baseId: string;
  readonly level: number;
  readonly targets: readonly TargetInput[];
  /** Targets already fractured on the base — the craft starts from a Rare holding them. */
  readonly fractured: ReadonlySet<string>;
  /** Targets the budget search may never relax, swap or drop. */
  readonly pinned: ReadonlySet<string>;
  /** Kept as the raw input string: "" means no budget, and re-parsing a number would lose "0.". */
  readonly budget: string;
  /**
   * What another white base costs the player, as a raw input string ("" = use the app's default).
   *
   * This is the MDP's `restartCost`, and it is the single number that decides whether "bin it and roll
   * another" beats fixing the item in front of you. At 0 it beats almost everything — measured at
   * 1,015 of 1,041 policy states choosing to start over — which is right if bases are free and wrong
   * if they are not. Only the player knows which, so it is theirs to set rather than the app's to
   * assume. See WHITE_BASE_COST in solve.ts for the fallback.
   */
  readonly baseCost: string;
}

export interface ItemTabState {
  readonly baseId: string;
  readonly level: number;
  readonly rarity: 'magic' | 'rare';
  readonly prefixes: readonly ItemModInput[];
  readonly suffixes: readonly ItemModInput[];
  readonly subMode: 'check' | 'plan';
  readonly target: readonly TargetInput[];
}

export interface Workspace {
  readonly mode: 'plan' | 'item';
  readonly lab: LabState;
  readonly item: ItemTabState;
}

export function defaultWorkspace(): Workspace {
  return {
    mode: 'plan',
    lab: { baseId: '', level: 82, targets: [], fractured: new Set(), pinned: new Set(), budget: '', baseCost: '' },
    item: { baseId: '', level: 82, rarity: 'rare', prefixes: [], suffixes: [], subMode: 'check', target: [] },
  };
}

// ── Wire format ───────────────────────────────────────────────────────────────
// Short keys and, crucially, mod ids with their `<baseId>/` prefix stripped: every id in a base's pool
// starts with it (verified across all 1297), so carrying it would roughly double the payload for no
// information. `v` is a format version, so a future change is REJECTED rather than mis-parsed into a
// workspace that looks plausible and isn't.

/**
 * The format a workspace is WRITTEN as. Not a constant, because two are current at once.
 *
 * `FORMAT_SLOTS` is emitted only when a target actually uses slot alternatives, and `FORMAT_BASE`
 * otherwise. That is deliberate, and it is the opposite of what this file did for `baseCost`: an
 * optional key that an old build ignores is harmless, but a SLOT changes what the craft means. An old
 * reader dropping it would silently plan "Cold and Lightning and Chaos, all three" — an impossible
 * item — where the link said "any one of them". Refusing the link is the far better failure, and `v`
 * exists precisely so it can be refused.
 *
 * The cost of that choice is bounded to the crafts that opt in: every link ever shared, and every new
 * link without alternatives, still reads as version 1 in every build that ever existed.
 */
const FORMAT_BASE = 1;
const FORMAT_SLOTS = 2;
const READABLE: readonly number[] = [FORMAT_BASE, FORMAT_SLOTS];

/** `[modId, tierDisplay, slot?]`. The third element is present only on a target that has alternatives,
 *  which is what keeps a slot-free workspace byte-identical to what version 1 always wrote. */
type WireTarget = readonly [string, number, number?];
type WireItemMod = readonly [string, number, 1?];

interface Wire {
  readonly v: number;
  readonly m: 'p' | 'i';
  readonly l: {
    readonly b: string; readonly lv: number; readonly t: readonly WireTarget[];
    readonly f: readonly string[]; readonly p: readonly string[]; readonly bg: string;
    /** Added after FORMAT 1 shipped, so links written before it simply lack the key — the decoder
     *  reads it as "" and the craft plans on the default. Bumping FORMAT would REJECT those links
     *  instead, which is a far worse trade for one optional field. */
    readonly bc?: string;
  };
  readonly i: {
    readonly b: string; readonly lv: number; readonly r: 'm' | 'r';
    readonly px: readonly WireItemMod[]; readonly sx: readonly WireItemMod[];
    readonly sm: 'c' | 'p'; readonly t: readonly WireTarget[];
  };
}

/**
 * The DECODER's view of the same wire, with every leaf that reaches app state UNVALIDATED typed as
 * `unknown` — because that is what it is. `parsed as WireIn` is a cast over a stranger's JSON, and a
 * cast is not a check: it switches TypeScript off at the one boundary where the input is untrusted.
 * `Wire` above stays strict, since the encoder really does produce those types.
 *
 * The point is enforcement, not documentation. `budget: wire.l.bg ?? ''` does not COMPILE against
 * this type; it has to go through `clampText`. *Remembering* to validate is exactly what failed when
 * `lv` was fixed and `bg`/`bc` — two lines below it — were not.
 *
 * Leaves left strict are the ones already safe by construction: `v` is rejected unless it equals
 * FORMAT; `m`/`r`/`sm` are read through a `=== 'x'` ternary; and a non-string mod id throws inside
 * `restore`, which `decodeWorkspace`'s try/catch turns into a clean null. Widening those would add
 * noise, not safety.
 */
type WireTargetIn = readonly [string, unknown, unknown?];
type WireItemModIn = readonly [string, unknown, 1?];

interface WireIn {
  readonly v: number;
  readonly m: 'p' | 'i';
  readonly l: {
    readonly b: unknown; readonly lv: unknown; readonly t: readonly WireTargetIn[];
    readonly f: readonly string[]; readonly p: readonly string[]; readonly bg: unknown;
    readonly bc?: unknown;
  };
  readonly i: {
    readonly b: unknown; readonly lv: unknown; readonly r: 'm' | 'r';
    readonly px: readonly WireItemModIn[]; readonly sx: readonly WireItemModIn[];
    readonly sm: 'c' | 'p'; readonly t: readonly WireTargetIn[];
  };
}

/**
 * Item level from a link, held to the same 1-100 the input control enforces.
 *
 * A link is not a form: nothing stops it carrying `1e308`, `-5`, or `"abc"`, and `?? default` only
 * catches null and undefined. Those reach the engine's tier gating, which has no reason to expect
 * them. Out-of-range and non-numeric both fall back to the default rather than being clamped to an
 * edge, because a link claiming level 1e308 is corrupt, not a request for level 100.
 */
const clampLevel = (lv: unknown, fallback: number): number =>
  (typeof lv === 'number' && Number.isInteger(lv) && lv >= 1 && lv <= 100 ? lv : fallback);

/**
 * A free-text numeric field from a link — `budget` and `baseCost` — held to the string its input
 * control produces.
 *
 * These fail differently from a bad SHAPE, which is why `decodeWorkspace`'s try/catch cannot cover
 * them: they decode cleanly, escape into app state as a number or an object, and throw LATER, at
 * `budget.trim()` in EngineLab — on Compute, which is the one thing a shared link exists for. A
 * non-string falls back to '' rather than String(v), on clampLevel's ruling that a link carrying the
 * wrong type is corrupt, not a request. '' is already the "no opinion" value both fields are built
 * around, so the craft simply plans on the default.
 */
const clampText = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * A display tier from a link. `engineMap` already clamps the RANGE; what it cannot survive is a
 * non-number — `n - tierDisplay` is NaN for "abc" or {}, and NaN passes straight through the
 * Math.min/Math.max that clamp it, so the craft plans against a garbage tier index instead of
 * failing. 1 is the tier `addTarget` defaults to, i.e. "best", the same as adding the mod by hand.
 */
const clampTier = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 1);

/** A slot id is an opaque grouping key — only equality matters — so any non-integer is simply "no
 *  slot", which degrades a shared alternative into an ordinary target rather than into a crash. */
const clampSlot = (v: unknown): number | undefined =>
  (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 64 ? v : undefined);

const strip = (baseId: string, modId: string): string =>
  modId.startsWith(`${baseId}/`) ? modId.slice(baseId.length + 1) : modId;
const restore = (baseId: string, short: string): string =>
  short.includes('/') ? short : `${baseId}/${short}`;

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * The shareable URL for a workspace — the link that reproduces someone's exact craft.
 *
 * Lives here, and is used by BOTH the Copy-link button and the problem report, because it is one
 * mapping and two copies of one mapping is how the D8 pricing bug survived undetected. `origin +
 * pathname` deliberately drops any existing query, so sharing a workspace you arrived at via `?s=`
 * doesn't nest the old payload inside the new one.
 */
export function shareUrl(ws: Workspace = getWorkspace()): string {
  return `${window.location.origin}${window.location.pathname}?s=${encodeWorkspace(ws)}`;
}

/** Encode a workspace into the opaque `?s=` payload. */
export function encodeWorkspace(ws: Workspace): string {
  const lb = ws.lab.baseId;
  const ib = ws.item.baseId;
  /*
   * A slot id is written only where it MEANS something — where two or more targets share it.
   *
   * A slot of one is not a choice, and an id can be left behind on one: remove the second candidate
   * from a pair and the survivor still carries the id. Writing it anyway would push the link to
   * version 2 and lock it out of every older build, in exchange for a disjunction with one option.
   * Deriving the answer from the list rather than trusting whoever built it keeps the encoding
   * canonical — the same craft always produces the same bytes, however it was arrived at.
   */
  const realSlots = (list: readonly TargetInput[]): Set<number> => {
    const seen = new Map<number, number>();
    for (const x of list) if (x.slot !== undefined) seen.set(x.slot, (seen.get(x.slot) ?? 0) + 1);
    return new Set([...seen].filter(([, n]) => n > 1).map(([id]) => id));
  };
  const labSlots = realSlots(ws.lab.targets);
  const itemSlots = realSlots(ws.item.target);
  const t = (base: string, list: readonly TargetInput[], real: ReadonlySet<number>): WireTarget[] =>
    list.map((x) => (x.slot === undefined || !real.has(x.slot)
      ? [strip(base, x.modId), x.tierDisplay]
      : [strip(base, x.modId), x.tierDisplay, x.slot]));
  const usesSlots = labSlots.size > 0 || itemSlots.size > 0;
  const im = (list: readonly ItemModInput[]): WireItemMod[] =>
    list.map((x) => (x.fractured ? [strip(ib, x.modId), x.tierDisplay, 1] : [strip(ib, x.modId), x.tierDisplay]));

  const wire: Wire = {
    v: usesSlots ? FORMAT_SLOTS : FORMAT_BASE,
    m: ws.mode === 'item' ? 'i' : 'p',
    l: {
      b: lb, lv: ws.lab.level, t: t(lb, ws.lab.targets, labSlots),
      f: [...ws.lab.fractured].map((id) => strip(lb, id)),
      p: [...ws.lab.pinned].map((id) => strip(lb, id)),
      bg: ws.lab.budget, bc: ws.lab.baseCost,
    },
    i: {
      b: ib, lv: ws.item.level, r: ws.item.rarity === 'magic' ? 'm' : 'r',
      px: im(ws.item.prefixes), sx: im(ws.item.suffixes),
      sm: ws.item.subMode === 'plan' ? 'p' : 'c', t: t(ib, ws.item.target, itemSlots),
    },
  };
  return toBase64Url(JSON.stringify(wire));
}

export interface DecodeResult {
  readonly workspace: Workspace;
  /** Ids the link named that this build no longer knows — MOD ids, and possibly a base id — dropped and
   *  reported so we don't silently plan something different from what was shared. Empty ids are not
   *  losses and never appear here; see `knownBase`. */
  readonly dropped: readonly string[];
}

/**
 * Decode a `?s=` payload, validated against the loaded patch data.
 *
 * Validation is not optional: a link can name a base or mod that a data refresh has since removed, and
 * `resolveMod` THROWS on an unknown id — so an unvalidated link would crash the planner rather than
 * degrade. Unknown ids are dropped and returned.
 *
 * Returns null when the payload isn't a workspace at all (truncated, tampered, or a newer format).
 */
export function decodeWorkspace(payload: string, data: PatchData): DecodeResult | null {
  try {
    return decodeOrThrow(payload, data);
  } catch {
    // The contract above is "null for anything that isn't a workspace", and only the JSON parse used
    // to be guarded. But a payload can be valid base64 holding valid JSON and STILL be the wrong
    // shape — `t` a string instead of an array, a null where a mod id belongs, `{}` where an
    // [id, tier] pair belongs — and each of those threw from inside the mapping helpers below.
    //
    // That throw landed in EngineLab's link-loading `useEffect`, where React responds by unmounting
    // the tree: one malformed shared link white-screened the app, on a URL anybody can paste. The
    // call site has always handled null properly (it toasts "That link could not be read"), so
    // honouring the contract is the whole fix. Fuzzed in workspace.test.ts.
    return null;
  }
}

function decodeOrThrow(payload: string, data: PatchData): DecodeResult | null {
  let wire: WireIn;
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(payload));
    if (!parsed || typeof parsed !== 'object') return null;
    wire = parsed as WireIn;
  } catch {
    return null;
  }
  if (!READABLE.includes(wire.v) || !wire.l || !wire.i) return null;

  const dropped: string[] = [];
  // An EMPTY base id means "none chosen yet", not "an id this build lost". Reporting it as dropped made
  // a link shared from a fresh workspace announce "2 mods in the link no longer exist" — two counts, no
  // mods, nothing missing. `dropped` drives a user-facing message, so only real losses belong in it.
  const knownBase = (id: unknown): string => {
    if (typeof id !== 'string' || !id) return '';
    if (data.bases.has(id)) return id;
    dropped.push(id);
    return '';
  };
  const keep = (base: string, short: string): string | null => {
    const full = restore(base, short);
    if (data.mods.has(full)) return full;
    dropped.push(full);
    return null;
  };
  const targets = (base: string, list: readonly WireTargetIn[] | undefined): TargetInput[] =>
    (list ?? []).flatMap(([id, tier, slot]) => {
      const full = base ? keep(base, id) : null;
      if (!full) return [];
      const s = clampSlot(slot);
      return [s === undefined
        ? { modId: full, tierDisplay: clampTier(tier) }
        : { modId: full, tierDisplay: clampTier(tier), slot: s }];
    });
  /**
   * What the item builder can produce, and therefore what a link may claim you are HOLDING.
   *
   * `keep` checks a mod id exists, which is the right bar for a TARGET — a regular-essence mod is a
   * perfectly good thing to ask for, and the MDP has planned one since 2026-08-28. It is the wrong bar
   * for a mod already on the item: the builder's add columns offer normal and desecrated mods only
   * (ItemActions), so an essence-source mod here could only have come from a hand-edited link.
   *
   * It matters because the model cannot represent it. A held essence mod lands in `jp`/`js` as bare
   * junk with no marker, so nothing downstream can tell it from an ordinary roll and the one-essence
   * rule goes unenforced — `markovFromItem` refuses such a craft rather than quoting a number the game
   * would not allow. Dropping it here keeps the app on states its own UI can build; the underlying gap
   * (there is no state axis for "this item holds an essence mod") is unchanged.
   */
  const itemMods = (base: string, list: readonly WireItemModIn[] | undefined): ItemModInput[] =>
    (list ?? []).flatMap(([id, tier, frac]) => {
      const full = base ? keep(base, id) : null;
      if (!full) return [];
      if (isEssenceMod(data.mods.get(full)!)) { dropped.push(full); return []; }
      const t = clampTier(tier);
      return [frac ? { modId: full, tierDisplay: t, fractured: true } : { modId: full, tierDisplay: t }];
    });
  const ids = (base: string, list: readonly string[] | undefined): Set<string> => {
    const out = new Set<string>();
    for (const short of list ?? []) {
      const full = base ? keep(base, short) : null;
      if (full) out.add(full);
    }
    return out;
  };

  const lb = knownBase(wire.l.b);
  const ib = knownBase(wire.i.b);
  const d = defaultWorkspace();
  return {
    workspace: {
      mode: wire.m === 'i' ? 'item' : 'plan',
      lab: {
        baseId: lb, level: clampLevel(wire.l.lv, d.lab.level), targets: targets(lb, wire.l.t),
        fractured: ids(lb, wire.l.f), pinned: ids(lb, wire.l.p), budget: clampText(wire.l.bg),
        baseCost: clampText(wire.l.bc),
      },
      item: {
        baseId: ib, level: clampLevel(wire.i.lv, d.item.level), rarity: wire.i.r === 'm' ? 'magic' : 'rare',
        prefixes: itemMods(ib, wire.i.px), suffixes: itemMods(ib, wire.i.sx),
        subMode: wire.i.sm === 'p' ? 'plan' : 'check', target: targets(ib, wire.i.t),
      },
    },
    dropped,
  };
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Same shape as currencyPrefs: module-level rather than React context, because the two tabs are
// separate trees that mount and unmount and must read ONE source. Sets live in memory and become
// arrays only at this boundary, so component code keeps using them as Sets.

export const STORAGE_KEY = `${PREFS_PREFIX}workspace.v1`;

function persist(ws: Workspace): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...ws,
      lab: { ...ws.lab, fractured: [...ws.lab.fractured], pinned: [...ws.lab.pinned] },
    }));
  } catch {
    // Storage full or blocked (private mode) — the workspace still works for this session.
  }
}

function load(): Workspace {
  const d = defaultWorkspace();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Workspace & { lab: { fractured: string[]; pinned: string[] } };
    return {
      ...d, ...p,
      lab: { ...d.lab, ...p.lab, fractured: new Set(p.lab?.fractured ?? []), pinned: new Set(p.lab?.pinned ?? []) },
      item: { ...d.item, ...p.item },
    };
  } catch {
    return d; // a corrupt or half-written entry must not stop the app from starting
  }
}

let current: Workspace = load();
const listeners = new Set<() => void>();

export const getWorkspace = (): Workspace => current;

export function setWorkspace(next: Workspace): void {
  current = next;
  persist(next);
  for (const l of listeners) l();
}

export function useWorkspace(): Workspace {
  return useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => listeners.delete(onChange); },
    getWorkspace,
    getWorkspace,
  );
}

const UNSET = Symbol('unset');

/**
 * Run `fn` when `value` CHANGES — never on mount.
 *
 * A plain `useEffect(fn, [value])` also fires on the first render. That was harmless while component
 * state was created fresh on every mount, but it is destructive against a RESTORED workspace: the
 * "reset the craft when the base changes" effects would wipe the user's work every time the component
 * mounted — which, for the item tab, is every single tab switch.
 */
export function useOnChange<T>(value: T, fn: () => void): void {
  const prev = useRef<T | typeof UNSET>(UNSET);
  useEffect(() => {
    if (prev.current === UNSET) { prev.current = value; return; } // mount: adopt, don't react
    if (Object.is(prev.current, value)) return;
    prev.current = value;
    fn();
    // `fn` is deliberately not a dependency: it is redefined every render, and depending on it would
    // fire this on every render — exactly what it exists to prevent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

/** The active tab. A top-level field rather than one of the two sections, so it gets its own hook. */
export function useMode(): ['plan' | 'item', (m: 'plan' | 'item') => void] {
  const ws = useWorkspace();
  return [ws.mode, (mode) => setWorkspace({ ...getWorkspace(), mode })];
}

/**
 * One persisted field, with `useState`'s exact signature — functional updates included.
 *
 * That signature is the point: every call site in the components
 * (`setFractured((f) => { const n = new Set(f); … })`) keeps working untouched, so moving state out of
 * the components is a change to their `useState` lines and nothing else.
 */
export function useField<S extends 'lab' | 'item', K extends keyof Workspace[S]>(
  section: S, key: K,
): [Workspace[S][K], (v: Workspace[S][K] | ((prev: Workspace[S][K]) => Workspace[S][K])) => void] {
  const ws = useWorkspace();
  const set = (v: Workspace[S][K] | ((prev: Workspace[S][K]) => Workspace[S][K])): void => {
    // Read through the store, not the render-time snapshot: two updates in one tick (adding a target
    // and clearing its pin, say) must both land rather than the second overwriting the first.
    const live = getWorkspace();
    const prev = live[section][key];
    const nextValue = typeof v === 'function' ? (v as (p: Workspace[S][K]) => Workspace[S][K])(prev) : v;
    setWorkspace({ ...live, [section]: { ...live[section], [key]: nextValue } });
  };
  return [ws[section][key], set];
}
