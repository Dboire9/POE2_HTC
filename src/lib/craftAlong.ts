// Following a solved plan along with the game: where the item is now, and what getting there has cost.
//
// Nothing here solves anything. The solve already knows the next move for every state the item can be
// in (`RouteTable`); a session is only the player's place in that table, one reported roll at a time,
// with the spend added up as the plan prices each move. Kept per browser, so closing the tab mid-craft
// and solving the same craft again picks up where the player left off.

import { PREFS_PREFIX } from './currencyPrefs';

/** One move made: where the item was, and what had been spent, before it — what Undo goes back to. */
export interface CraftStep {
  readonly key: string;
  readonly spent: number;
}

export interface CraftSession {
  /** The craft this session follows. A session for another craft — another base, target or item — is not resumed. */
  readonly sig: string;
  /** The state the item is in now: a key of the solve's route table. */
  readonly key: string;
  /** Spent so far, in exalt-equivalents, each move at the plan's average price for it. */
  readonly spent: number;
  /** Every move made, oldest first. */
  readonly history: readonly CraftStep[];
}

/** Which tab a session belongs to: each follows its own craft, and the two do not overwrite each other. */
export type CraftTab = 'lab' | 'item';

export const startSession = (sig: string, key: string): CraftSession => ({ sig, key, spent: 0, history: [] });

/** The move was made and the item became `next`. `cost`: what the move costs, on average. */
export const advance = (s: CraftSession, next: string, cost: number): CraftSession =>
  ({ ...s, key: next, spent: s.spent + cost, history: [...s.history, { key: s.key, spent: s.spent }] });

/** Take back the last move — a mis-click is the commonest reason. At the start it changes nothing. */
export const undo = (s: CraftSession): CraftSession => {
  const last = s.history.at(-1);
  return last ? { ...s, key: last.key, spent: last.spent, history: s.history.slice(0, -1) } : s;
};

/**
 * What identifies a craft: its solve request, less what cannot change the plan's states — the Search
 * effort, and the budget search's own fields. The same request always builds the same states, so a
 * session saved for it stays valid after the price sheet refreshes; the next move is then simply read
 * from the new plan.
 */
export function craftSig(tab: CraftTab, req: object): string {
  const { effort: _effort, budget: _budget, want: _want, ...kept } = req as Record<string, unknown>;
  return JSON.stringify([tab, kept]);
}

const KEY = `${PREFS_PREFIX}craftAlong.v1`;

const isSession = (v: unknown): v is CraftSession => {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Partial<CraftSession>;
  return typeof s.sig === 'string' && typeof s.key === 'string' && typeof s.spent === 'number'
    && Number.isFinite(s.spent) && Array.isArray(s.history)
    && s.history.every((h: unknown) => typeof h === 'object' && h !== null
      && typeof (h as CraftStep).key === 'string' && typeof (h as CraftStep).spent === 'number');
};

const readAll = (): Partial<Record<CraftTab, CraftSession>> => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Record<CraftTab, CraftSession>> = {};
    for (const tab of ['lab', 'item'] as const) if (isSession(p[tab])) out[tab] = p[tab];
    return out;
  } catch {
    return {};
  }
};

/** The session saved for this tab, if it follows this craft. Guarded: a private window or a stranger's storage reads as none. */
export function readSession(tab: CraftTab, sig: string): CraftSession | undefined {
  const s = readAll()[tab];
  return s && s.sig === sig ? s : undefined;
}

/** Keep this tab's session, or forget it (`undefined`). Nothing throws: it just does not persist. */
export function writeSession(tab: CraftTab, s: CraftSession | undefined): void {
  try {
    const all = readAll();
    if (s) all[tab] = s;
    else delete all[tab];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* it just does not persist */ }
}
