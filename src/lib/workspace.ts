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

const FORMAT = 1;

type WireTarget = readonly [string, number];
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
  const t = (base: string, list: readonly TargetInput[]): WireTarget[] =>
    list.map((x) => [strip(base, x.modId), x.tierDisplay]);
  const im = (list: readonly ItemModInput[]): WireItemMod[] =>
    list.map((x) => (x.fractured ? [strip(ib, x.modId), x.tierDisplay, 1] : [strip(ib, x.modId), x.tierDisplay]));

  const wire: Wire = {
    v: FORMAT,
    m: ws.mode === 'item' ? 'i' : 'p',
    l: {
      b: lb, lv: ws.lab.level, t: t(lb, ws.lab.targets),
      f: [...ws.lab.fractured].map((id) => strip(lb, id)),
      p: [...ws.lab.pinned].map((id) => strip(lb, id)),
      bg: ws.lab.budget, bc: ws.lab.baseCost,
    },
    i: {
      b: ib, lv: ws.item.level, r: ws.item.rarity === 'magic' ? 'm' : 'r',
      px: im(ws.item.prefixes), sx: im(ws.item.suffixes),
      sm: ws.item.subMode === 'plan' ? 'p' : 'c', t: t(ib, ws.item.target),
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
  let wire: Wire;
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(payload));
    if (!parsed || typeof parsed !== 'object') return null;
    wire = parsed as Wire;
  } catch {
    return null;
  }
  if (wire.v !== FORMAT || !wire.l || !wire.i) return null;

  const dropped: string[] = [];
  // An EMPTY base id means "none chosen yet", not "an id this build lost". Reporting it as dropped made
  // a link shared from a fresh workspace announce "2 mods in the link no longer exist" — two counts, no
  // mods, nothing missing. `dropped` drives a user-facing message, so only real losses belong in it.
  const knownBase = (id: string): string =>
    (!id || data.bases.has(id) ? id : (dropped.push(id), ''));
  const keep = (base: string, short: string): string | null => {
    const full = restore(base, short);
    if (data.mods.has(full)) return full;
    dropped.push(full);
    return null;
  };
  const targets = (base: string, list: readonly WireTarget[] | undefined): TargetInput[] =>
    (list ?? []).flatMap(([id, tier]) => {
      const full = base ? keep(base, id) : null;
      return full ? [{ modId: full, tierDisplay: tier }] : [];
    });
  const itemMods = (base: string, list: readonly WireItemMod[] | undefined): ItemModInput[] =>
    (list ?? []).flatMap(([id, tier, frac]) => {
      const full = base ? keep(base, id) : null;
      if (!full) return [];
      return [frac ? { modId: full, tierDisplay: tier, fractured: true } : { modId: full, tierDisplay: tier }];
    });
  const ids = (base: string, list: readonly string[] | undefined): Set<string> => {
    const out = new Set<string>();
    for (const short of list ?? []) {
      const full = base ? keep(base, short) : null;
      if (full) out.add(full);
    }
    return out;
  };

  const lb = knownBase(wire.l.b ?? '');
  const ib = knownBase(wire.i.b ?? '');
  const d = defaultWorkspace();
  return {
    workspace: {
      mode: wire.m === 'i' ? 'item' : 'plan',
      lab: {
        baseId: lb, level: wire.l.lv ?? d.lab.level, targets: targets(lb, wire.l.t),
        fractured: ids(lb, wire.l.f), pinned: ids(lb, wire.l.p), budget: wire.l.bg ?? '',
        baseCost: wire.l.bc ?? '',
      },
      item: {
        baseId: ib, level: wire.i.lv ?? d.item.level, rarity: wire.i.r === 'm' ? 'magic' : 'rare',
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
