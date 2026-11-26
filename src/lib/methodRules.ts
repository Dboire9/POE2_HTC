// "Check my method", the editor's side: what a player can write in a rule on THIS craft, in the words the
// Plan tab uses, and where the rules are kept. Nothing here checks a method — that is
// packages/optimizer/src/markovMethod.ts, reached through the `kind: 'method'` solve request (solve.ts).
//
// A rule's conditions read a SLOT (one target row, any of its alternatives) — never one alternative —
// because the solver's states cannot tell alternatives apart (markovMethod.ts says why). Slots are
// numbered as the solve numbers them: the slot groups in the order their first target appears
// (`slotIndexGroups`), which is the Plan tab's own row order.

import type { PatchData } from '../../packages/engine/src/types.ts';
import { allowsAction, type McAction } from '../../packages/optimizer/src/markovActions.ts';
import type { CurrencyPolicy } from '../../packages/optimizer/src/cost.ts';
import { decodeState } from '../../packages/optimizer/src/markovState.ts';
import { slotIndexGroups } from '../../packages/optimizer/src/slots.ts';
import type { RouteTable } from '../../packages/optimizer/src/markovRoute.ts';
import { bossOmenAllowed } from '../../packages/engine/src/probability.ts';
import type { Condition, EngineMarkovResult, Method, MethodRule, MoveSpec } from './engineTypes.ts';
import type { SolveRequest } from './solve.ts';
import { PREFS_PREFIX } from './currencyPrefs.ts';
import { START_OVER } from './stateWords.ts';

type Side = 'prefix' | 'suffix';
type Strength = 'base' | 'greater' | 'perfect';
export type LabRequest = Extract<SolveRequest, { readonly kind: 'lab' }>;
export type MethodRequest = Extract<SolveRequest, { readonly kind: 'method' }>;

/** One slot of the craft as a rule names it, and the Essences the solve could play for it. */
export interface MethodSlot {
  /** Its targets' names, alternatives joined with "or" — as the graph names a position. */
  readonly name: string;
  /** A regular Essence's modifier among the slot's positions (an Essence twin included), if any. */
  readonly essence?: string;
  /** A Perfect Essence's modifier among them, if any. */
  readonly perfect?: string;
}

/** What the editor offers on this craft. */
export interface MethodCraftInfo {
  readonly slots: readonly MethodSlot[];
  /** Desecration is part of this craft's plan: its moves and the "Desecrated modifier" test are offered. */
  readonly desecration: boolean;
  /** The base takes a boss omen (weapons and jewellery). */
  readonly boss: boolean;
  /** "Start over" is a move: a craft from a white base. */
  readonly canRestart: boolean;
  /** The currencies the SOLVE ran without — the method is checked under the same rules. */
  readonly policy: CurrencyPolicy | undefined;
}

const modText = (data: PatchData, id: string): string => (data.mods as PatchData['mods'] | undefined)?.get(id)?.text ?? id;

/**
 * The editor's view of a solved craft. With the solve's table the slots' Essences are read off its
 * positions (an Essence twin of a rolled target is one), and Desecration is in play exactly when its
 * states carry the Desecration flag; without one, off the targets as asked.
 */
export function methodCraftInfo(data: PatchData, req: LabRequest, given: RouteTable | undefined): MethodCraftInfo {
  // Read defensively: the panel sits inside the Plan tab's result with no error boundary of its own, so a
  // table or data it cannot read must leave it with less to offer, never take the tab down.
  const routes = given && Array.isArray(given.positions) && Array.isArray(given.keys) && Array.isArray(given.slotMasks)
    ? given : undefined;
  const targets = req.targets;
  const groups = slotIndexGroups(targets);
  const baseId = 'item' in req.from ? req.from.item.baseId : req.from.baseId;
  const category = (data.bases as PatchData['bases'] | undefined)?.get(baseId)?.category ?? '';
  const sourceOf = (id: string): string | undefined => (data.mods as PatchData['mods'] | undefined)?.get(id)?.source;
  const slots = groups.map((g, s): MethodSlot => {
    const names = [...new Set(g.map((i) => modText(data, targets[i]!.modId)))];
    const ids = routes
      ? routes.positions.flatMap((pos, p) => ((routes.slotMasks[s] ?? 0) & (1 << p) ? pos : []))
      : g.map((i) => targets[i]!.modId);
    const essence = ids.find((id) => sourceOf(id) === 'essence');
    const perfect = ids.find((id) => sourceOf(id) === 'perfect_essence');
    return { name: names.join(' or '), ...(essence ? { essence } : {}), ...(perfect ? { perfect } : {}) };
  });
  const desecration = routes
    ? routes.keys.some((k) => decodeState(k).flagged !== 0)
    : targets.some((t) => sourceOf(t.modId) === 'desecrated');
  return {
    slots, desecration, boss: bossOmenAllowed(category),
    canRestart: routes ? routes.canRestart : !('item' in req.from),
    policy: req.excluded && req.excluded.length > 0 ? { excluded: new Set(req.excluded) } : undefined,
  };
}

// ── Moves ─────────────────────────────────────────────────────────────────────────────────────────

/** The move picker's first select: which currency. Essences are one entry per slot ("essence:2"). */
export type MoveKind = string;

export const STRENGTHS: readonly { readonly value: Strength; readonly label: string }[] = [
  { value: 'base', label: 'Basic' }, { value: 'greater', label: 'Greater' }, { value: 'perfect', label: 'Perfect' },
];

const ORB_LABEL = {
  chaos: 'Chaos Orb', exalt: 'Exalted Orb', annul: 'Orb of Annulment', regal: 'Regal Orb',
  transmute: 'Orb of Transmutation', augment: 'Orb of Augmentation',
} as const;
/** In the order "Currency I don't have" lists them (CURRENCY_GROUPS), Alchemy left out: the true cost never plays it. */
const ORBS = ['chaos', 'exalt', 'annul', 'regal', 'transmute', 'augment'] as const;

/** Each side omen a move can take, by the move — the omens' own names (OMEN_GROUP). */
const SIDE_OMENS: Record<'exalt' | 'annul' | 'perfect-essence' | 'desecrate', readonly { value: Side; label: string }[]> = {
  exalt: [{ value: 'prefix', label: 'Omen of Sinistral Exaltation' }, { value: 'suffix', label: 'Omen of Dextral Exaltation' }],
  annul: [{ value: 'prefix', label: 'Omen of Sinistral Annulment' }, { value: 'suffix', label: 'Omen of Dextral Annulment' }],
  'perfect-essence': [
    { value: 'prefix', label: 'Omen of Sinistral Crystallisation' }, { value: 'suffix', label: 'Omen of Dextral Crystallisation' },
  ],
  desecrate: [{ value: 'prefix', label: 'Omen of Sinistral Necromancy' }, { value: 'suffix', label: 'Omen of Dextral Necromancy' }],
};
export const BOSS_OMENS = [
  { value: 'blackblooded', label: 'Omen of the Blackblooded' },
  { value: 'liege', label: 'Omen of the Liege' },
  { value: 'sovereign', label: 'Omen of the Sovereign' },
] as const;
export const ECHOES_LABEL = 'Omen of Abyssal Echoes';
export const LIGHT_LABEL = 'Omen of Light';

export function moveKindOf(m: MoveSpec): MoveKind {
  return m.currency === 'essence' || m.currency === 'perfect-essence' ? `${m.currency}:${m.slot}` : m.currency;
}

/** The action a spec stands for, as far as the exclusion list reads it — `undefined` for an Essence with none. */
function asAction(m: MoveSpec, info: MethodCraftInfo, level = 'normal'): McAction | undefined {
  if (m.currency === 'essence') {
    const id = info.slots[m.slot]?.essence;
    return id ? { currency: 'essence', target: id, tierIndex: 0, level } : undefined;
  }
  if (m.currency === 'perfect-essence') {
    const id = info.slots[m.slot]?.perfect;
    return id ? { currency: 'perfect-essence', target: id, ...(m.side ? { side: m.side } : {}) } : undefined;
  }
  if (m.currency === 'restart') return { currency: 'restart', cost: 0 };
  return m;
}

/**
 * Whether the player has every currency and omen this move spends — the solve's own permission
 * (`allowsAction`). A regular Essence is bought at whichever level the solve finds cheapest, so it is
 * allowed while any level is.
 */
export function moveAllowed(m: MoveSpec, info: MethodCraftInfo): boolean {
  if (m.currency === 'essence') {
    return ['lesser', 'normal', 'greater'].some((lvl) => {
      const a = asAction(m, info, lvl);
      return a !== undefined && allowsAction(info.policy, a);
    });
  }
  const a = asAction(m, info);
  return a !== undefined && allowsAction(info.policy, a);
}

/** A move of this kind as first picked: the first strength the player has, no omen. */
export function defaultMove(kind: MoveKind, info: MethodCraftInfo): MoveSpec {
  const [cur, slotText] = kind.split(':');
  const slot = Number(slotText);
  const strength = (c: 'transmute' | 'augment' | 'regal' | 'exalt'): Strength =>
    STRENGTHS.find((s) => moveAllowed({ currency: c, strength: s.value }, info))?.value ?? 'base';
  switch (cur) {
    case 'transmute': case 'augment': case 'regal': case 'exalt': return { currency: cur, strength: strength(cur) };
    case 'chaos': return { currency: 'chaos' };
    case 'annul': return { currency: 'annul' };
    case 'essence': return { currency: 'essence', slot };
    case 'perfect-essence': return { currency: 'perfect-essence', slot };
    case 'desecrate': return moveAllowed({ currency: 'desecrate' }, info) ? { currency: 'desecrate' } : { currency: 'desecrate', ancient: true };
    default: return { currency: 'restart' };
  }
}

export interface Option { readonly value: string; readonly label: string }
export interface OptionGroup { readonly label: string; readonly options: readonly Option[] }

/** Said beside a choice the player marked as a currency they don't have (it is shown only while picked). */
export const NOT_OWNED = ' (in your “currency I don’t have” list)';

/**
 * The currencies a move can be, grouped as "Currency I don't have" groups them, offering only what the
 * player has (`current` stays listed, marked, so a saved rule never silently changes).
 */
export function moveKindOptions(info: MethodCraftInfo, current: MoveSpec): OptionGroup[] {
  const keep = (m: MoveSpec): boolean => moveAllowed(m, info) || moveKindOf(m) === moveKindOf(current);
  const mark = (m: MoveSpec, label: string): string => (moveAllowed(m, info) ? label : `${label}${NOT_OWNED}`);
  const orbs: Option[] = [];
  for (const c of ORBS) {
    const m = defaultMove(c, info);
    // A strength-bearing orb is offered while any strength is: its own select narrows it.
    const any = c === 'chaos' || c === 'annul'
      ? keep(m)
      : STRENGTHS.some((s) => moveAllowed({ currency: c, strength: s.value }, info)) || moveKindOf(current) === c;
    if (any) orbs.push({ value: c, label: c === 'chaos' || c === 'annul' ? mark(m, ORB_LABEL[c]) : ORB_LABEL[c] });
  }
  const essences: Option[] = [];
  info.slots.forEach((s, i) => {
    const e: MoveSpec = { currency: 'essence', slot: i };
    if (s.essence && keep(e)) essences.push({ value: moveKindOf(e), label: mark(e, `Essence for ${s.name}`) });
  });
  info.slots.forEach((s, i) => {
    const e: MoveSpec = { currency: 'perfect-essence', slot: i };
    if (s.perfect && (moveAllowed(e, info) || SIDE_OMENS['perfect-essence'].some((o) => moveAllowed({ ...e, side: o.value }, info)) || moveKindOf(current) === moveKindOf(e))) {
      essences.push({ value: moveKindOf(e), label: `Perfect Essence for ${s.name}` });
    }
  });
  const groups: OptionGroup[] = [{ label: 'Orbs', options: orbs }];
  if (essences.length > 0) groups.push({ label: 'Essences', options: essences });
  const bones = moveAllowed({ currency: 'desecrate' }, info) || moveAllowed({ currency: 'desecrate', ancient: true }, info);
  if ((info.desecration && bones) || current.currency === 'desecrate') {
    groups.push({ label: 'Desecration (bones)', options: [{ value: 'desecrate', label: 'Desecration' }] });
  }
  if (info.canRestart || current.currency === 'restart') {
    groups.push({ label: 'Start over', options: [{ value: 'restart', label: START_OVER }] });
  }
  return groups.filter((g) => g.options.length > 0);
}

/** The strengths (or, for a Desecration, the bone's grade) the player has for this move. */
export function gradeOptions(m: MoveSpec, info: MethodCraftInfo): Option[] {
  if (m.currency === 'desecrate') {
    const { ancient: _a, ...plain } = m;
    return [
      { spec: plain, value: 'preserved', label: 'Preserved bone' },
      { spec: { ...plain, ancient: true as const }, value: 'ancient', label: 'Ancient bone' },
    ].filter((o) => moveAllowed(o.spec, info) || (o.value === 'ancient') === (m.ancient === true))
      .map((o) => ({ value: o.value, label: moveAllowed(o.spec, info) ? o.label : `${o.label}${NOT_OWNED}` }));
  }
  if (!('strength' in m)) return [];
  return STRENGTHS.filter((s) => moveAllowed({ ...m, strength: s.value }, info) || s.value === m.strength)
    .map((s) => ({ value: s.value, label: moveAllowed({ ...m, strength: s.value }, info) ? s.label : `${s.label}${NOT_OWNED}` }));
}

/** The side omen (or Light) a move can take: '' for none. Empty when the move takes none. */
export function omenOptions(m: MoveSpec, info: MethodCraftInfo): Option[] {
  if (m.currency !== 'exalt' && m.currency !== 'annul' && m.currency !== 'perfect-essence' && m.currency !== 'desecrate') return [];
  const now = omenOf(m);
  const base = withOmen(m, '');
  const all: { value: string; label: string; spec: MoveSpec }[] = [
    { value: '', label: 'no side omen', spec: base },
    ...SIDE_OMENS[m.currency].map((o) => ({ value: o.value, label: o.label, spec: { ...base, side: o.value } as MoveSpec })),
    ...(m.currency === 'annul' ? [{ value: 'light', label: LIGHT_LABEL, spec: { ...base, light: true } as MoveSpec }] : []),
  ];
  return all.filter((o) => moveAllowed(o.spec, info) || o.value === now)
    .map((o) => ({ value: o.value, label: moveAllowed(o.spec, info) ? o.label : `${o.label}${NOT_OWNED}` }));
}

export function omenOf(m: MoveSpec): string {
  if (m.currency === 'annul' && m.light) return 'light';
  return 'side' in m && m.side ? m.side : '';
}

/** The move with its side omen (or Light) set to `value`. */
export function withOmen(m: MoveSpec, value: string): MoveSpec {
  const { side: _s, light: _l, ...rest } = m as MoveSpec & { side?: Side; light?: true };
  if (value === 'light') return { ...rest, light: true } as MoveSpec;
  if (value === 'prefix' || value === 'suffix') return { ...rest, side: value } as MoveSpec;
  return rest;
}

/** The boss omens a Desecration can take here ('' for none), where the base takes one at all. */
export function bossOptions(m: MoveSpec, info: MethodCraftInfo): Option[] {
  if (m.currency !== 'desecrate' || (!info.boss && !m.boss)) return [];
  const { boss: _b, ...plain } = m;
  const all = [{ value: '', label: 'no boss omen', spec: plain },
    ...BOSS_OMENS.map((o) => ({ value: o.value, label: o.label, spec: { ...plain, boss: o.value } }))];
  return all.filter((o) => moveAllowed(o.spec, info) || o.value === (m.boss ?? ''))
    .map((o) => ({ value: o.value, label: moveAllowed(o.spec, info) ? o.label : `${o.label}${NOT_OWNED}` }));
}

/** Whether an Omen of Abyssal Echoes can be offered on this Desecration (the player has it, or it is set). */
export function echoesOffered(m: MoveSpec, info: MethodCraftInfo): boolean {
  if (m.currency !== 'desecrate') return false;
  return m.echoes === true || moveAllowed({ ...m, echoes: true }, info);
}

// ── Conditions ────────────────────────────────────────────────────────────────────────────────────

/** The condition picker's first select: what the rule tests. */
export type Subject = string;

export function subjectOf(c: Condition): Subject {
  switch (c.kind) {
    case 'slot': return `slot:${c.slot}`;
    case 'junk': return `junk:${c.side}`;
    case 'open': return `open:${c.side}`;
    default: return c.kind;
  }
}

export function subjectOptions(info: MethodCraftInfo): OptionGroup[] {
  return [
    { label: 'A modifier you want', options: info.slots.map((s, i) => ({ value: `slot:${i}`, label: s.name })) },
    {
      label: 'The rest of the item',
      options: [
        { value: 'junk:prefix', label: 'Prefixes you did not ask for' },
        { value: 'junk:suffix', label: 'Suffixes you did not ask for' },
        { value: 'junk:total', label: 'Modifiers you did not ask for' },
        { value: 'open:prefix', label: 'Open prefixes' },
        { value: 'open:suffix', label: 'Open suffixes' },
        { value: 'rarity', label: 'Rarity' },
        ...(info.desecration ? [{ value: 'bone', label: 'Desecrated modifier' }] : []),
      ],
    },
  ];
}

/** A condition on this subject as first picked. */
export function defaultCondition(subject: Subject): Condition {
  const [kind, arg] = subject.split(':');
  switch (kind) {
    case 'slot': return { kind: 'slot', slot: Number(arg), is: 'present' };
    case 'junk': return { kind: 'junk', side: arg === 'prefix' || arg === 'suffix' ? arg : 'total', op: '>=', n: 1 };
    case 'open': return { kind: 'open', side: arg === 'suffix' ? 'suffix' : 'prefix', op: '>=', n: 1 };
    case 'bone': return { kind: 'bone', is: 'junk' };
    default: return { kind: 'rarity', is: 'rare' };
  }
}

export const SLOT_STATES: readonly Option[] = [
  { value: 'present', label: 'is on the item' },
  { value: 'missing', label: 'is missing' },
  { value: 'blocked', label: 'is blocked (below your tier, or its family taken)' },
];
export const COMPARES: readonly Option[] = [
  { value: '=', label: '=' }, { value: '>=', label: '≥' }, { value: '<=', label: '≤' },
];
export const RARITIES: readonly Option[] = [
  { value: 'normal', label: 'Normal' }, { value: 'magic', label: 'Magic' }, { value: 'rare', label: 'Rare' },
];
export const BONES: readonly Option[] = [
  { value: 'none', label: 'none on the item' },
  { value: 'junk', label: 'one you did not ask for' },
  { value: 'wanted', label: 'one you asked for' },
];

/** A rule as first added: no condition yet, the first move the player has. */
export function newRule(info: MethodCraftInfo): MethodRule {
  const first = moveKindOptions(info, { currency: 'exalt', strength: 'base' })[0]?.options[0]?.value ?? 'exalt';
  return { when: [{ kind: 'rarity', is: 'rare' }], move: defaultMove(first, info) };
}

/** An empty method: no rules, and the otherwise row starts over where it can. */
export function emptyMethod(info: MethodCraftInfo): Method {
  return { rules: [], otherwise: info.canRestart ? { currency: 'restart' } : { currency: 'chaos' } };
}

// ── The request ───────────────────────────────────────────────────────────────────────────────────

/**
 * The check of `method` on the craft a Plan-tab solve ran: the same inputs, so the lattice is rebuilt
 * exactly, and its table and bound, so the best plan is not solved again.
 */
export function methodRequest(req: LabRequest, method: Method, markov: EngineMarkovResult): MethodRequest {
  return {
    kind: 'method', from: req.from, targets: req.targets, method,
    ...(req.baseCost !== undefined ? { baseCost: req.baseCost } : {}),
    ...(req.rebuyable ? { rebuyable: true } : {}),
    ...(req.fillOnFinish ? { fillOnFinish: true } : {}),
    ...(req.effort ? { effort: req.effort } : {}),
    ...(req.excluded && req.excluded.length > 0 ? { excluded: req.excluded } : {}),
    ...(req.runes && req.runes.length > 0 ? { runes: req.runes } : {}),
    ...(req.spare ? { spare: req.spare } : {}),
    ...(markov.routes ? { best: { routes: markov.routes, bound: markov.bound } } : {}),
  };
}

// ── Kept per craft ────────────────────────────────────────────────────────────────────────────────

/**
 * Which craft a method belongs to: where it starts and what it aims for. Not the exclusions, the base
 * cost or the Search effort — a player who changes those still has the same method; another target list
 * is another craft, and starts empty.
 */
export const methodSig = (req: LabRequest): string => JSON.stringify([req.from, req.targets]);

const KEY = `${PREFS_PREFIX}method.v1`;
/** Crafts remembered — the most recent first. Enough for a few crafts a player switches between. */
const KEPT = 20;

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isSide = (v: unknown): boolean => v === undefined || v === 'prefix' || v === 'suffix';
const isOp = (v: unknown): boolean => v === '=' || v === '>=' || v === '<=';

function isCondition(v: unknown): v is Condition {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  switch (c.kind) {
    case 'slot': return isNum(c.slot) && (c.is === 'present' || c.is === 'missing' || c.is === 'blocked');
    case 'junk': return (c.side === 'prefix' || c.side === 'suffix' || c.side === 'total') && isOp(c.op) && isNum(c.n);
    case 'open': return (c.side === 'prefix' || c.side === 'suffix') && isOp(c.op) && isNum(c.n);
    case 'rarity': return c.is === 'normal' || c.is === 'magic' || c.is === 'rare';
    case 'bone': return c.is === 'none' || c.is === 'junk' || c.is === 'wanted';
    default: return false;
  }
}

function isMove(v: unknown): v is MoveSpec {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Record<string, unknown>;
  const strength = m.strength === 'base' || m.strength === 'greater' || m.strength === 'perfect';
  switch (m.currency) {
    case 'transmute': case 'augment': case 'regal': return strength;
    case 'exalt': return strength && isSide(m.side);
    case 'chaos': case 'restart': return true;
    case 'annul': return isSide(m.side) && (m.light === undefined || m.light === true);
    case 'essence': return isNum(m.slot);
    case 'perfect-essence': return isNum(m.slot) && isSide(m.side);
    case 'desecrate':
      return isSide(m.side) && (m.ancient === undefined || m.ancient === true) && (m.echoes === undefined || m.echoes === true)
        && (m.boss === undefined || BOSS_OMENS.some((b) => b.value === m.boss));
    default: return false;
  }
}

/** A method as stored — anything else (another build's shape, a stranger's storage) reads as none. */
export function isMethod(v: unknown): v is Method {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Record<string, unknown>;
  return Array.isArray(m.rules) && isMove(m.otherwise) && m.rules.every((r: unknown) => {
    if (typeof r !== 'object' || r === null) return false;
    const x = r as Record<string, unknown>;
    return Array.isArray(x.when) && x.when.every(isCondition) && isMove(x.move);
  });
}

type Kept = readonly { readonly sig: string; readonly method: Method }[];

const readAll = (): Kept => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p: unknown = JSON.parse(raw);
    return Array.isArray(p)
      ? p.filter((e: unknown): e is Kept[number] => typeof e === 'object' && e !== null
        && typeof (e as { sig?: unknown }).sig === 'string' && isMethod((e as { method?: unknown }).method))
      : [];
  } catch {
    return [];
  }
};

/** The method saved for this craft, if any. A private window or unreadable storage reads as none. */
export function readMethod(sig: string): Method | undefined {
  return readAll().find((e) => e.sig === sig)?.method;
}

/** Keep this craft's method (most recent first). Nothing throws: it just does not persist. */
export function writeMethod(sig: string, method: Method): void {
  try {
    const next = [{ sig, method }, ...readAll().filter((e) => e.sig !== sig)].slice(0, KEPT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* it just does not persist */ }
}
