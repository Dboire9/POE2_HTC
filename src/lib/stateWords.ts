// Plain words for a state of a craft, and for what one move did to it — what a player following the
// plan reads beside the game. Both are read off the plan's own states, so they can only say what the
// plan knows: which wanted mods are on the item, which are stuck below their tier, and how many mods
// nobody asked for sit on each side.

import type { EnginePolicyEdge, EnginePolicyNode } from './engineTypes';
import { changesBetween } from './policyPath';

const WORDS = ['no', 'one', 'two', 'three'];
const count = (n: number, one: string): string => `${WORDS[n] ?? n} ${one}${n > 1 ? 'es' : ''}`;

/** The label of the move that bins the item for a fresh base (engineMap's `actionLabel`). */
export const START_OVER = 'Start over with a new base';

/**
 * The item a state stands for: "Rare · Spell Damage + Cast Speed, and one prefix you did not ask for".
 *
 * `plain` names the start when it is a bare base ("A plain tablet"). `blockers` adds what has to come
 * off before the craft can go on — a wanted mod rolled below its tier, a mod of a wanted one's family,
 * a mod a Desecration placed. The Tablets tab leaves them out: its list has always read without them.
 */
export function describeItem(n: EnginePolicyNode, plain: string, blockers = true): string {
  if (n.isStart && n.rarity === 'normal') return plain;
  const kind = n.rarity === 'magic' ? 'Magic' : n.rarity === 'rare' ? 'Rare' : 'Normal';
  const junk = n.junkPrefixes + n.junkSuffixes === 0 ? ''
    : [n.junkPrefixes ? count(n.junkPrefixes, 'prefix') : '', n.junkSuffixes ? count(n.junkSuffixes, 'suffix') : ''].filter(Boolean).join(' + ');
  const held = n.present.map((m) => m.text).join(' + ');
  const parts = [held, junk && (held ? `${junk} you did not ask for` : `${junk}, none of them wanted`)].filter(Boolean);
  const item = `${kind} · ${parts.join(', and ') || 'nothing on it'}`;
  if (!blockers) return item;
  const stuck = [
    ...n.blocked.map((m) => `${m.text} is below the tier you asked`),
    ...(n.obstacles ?? []).map((m) => `${m.text} blocks a mod you want`),
  ];
  const carved = n.desecratedTarget ? `${n.desecratedTarget} came from a Desecration`
    : n.desecratedJunk ? `the unwanted ${n.desecratedJunk} came from a Desecration` : '';
  return [item, ...stuck, carved].filter(Boolean).join('; ');
}

/** "a prefix", "two suffixes". */
const some = (n: number, side: 'prefix' | 'suffix'): string => (n === 1 ? `a ${side}` : count(n, side));
const verb = (n: number, one: string, many: string): string => (n === 1 ? one : many);
/** A button reads as a sentence, and "a prefix you did not ask for lands" starts one. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * What one outcome of a move DID to the item, as the player sees it: "Spell Damage lands", "a prefix you
 * did not ask for lands", "Cast Speed is removed". `next` undefined, or the state itself, is an outcome
 * that leaves the item where it was as far as the plan is concerned — a Chaos swapping one unwanted
 * mod for another on the same side.
 */
export function outcomeWords(node: EnginePolicyNode, next: EnginePolicyNode | undefined, edge: EnginePolicyEdge): string {
  if (!next || next.key === node.key) return 'Nothing that helps — the item counts the same as before';
  const c = changesBetween(node, next, edge);
  const parts: string[] = [];
  if (c.gained.length > 0) parts.push(`${c.gained.join(' and ')} ${verb(c.gained.length, 'lands', 'land')}`);
  if (c.blocked.length > 0) parts.push(`${c.blocked.join(' and ')} ${verb(c.blocked.length, 'lands', 'land')} below the tier you asked`);
  if (c.lost.length > 0) parts.push(`${c.lost.join(' and ')} ${verb(c.lost.length, 'is', 'are')} removed`);
  // Into the goal the junk counts say nothing (the goal is drawn clean), and a finished item is finished
  // whatever else sits on it, so only the way there is worth a word.
  if (!next.isGoal) {
    for (const side of ['prefix', 'suffix'] as const) {
      const d = side === 'prefix' ? c.junk.prefixes : c.junk.suffixes;
      if (d > 0) parts.push(`${some(d, side)} you did not ask for ${verb(d, 'lands', 'land')}`);
      if (d < 0) parts.push(`${some(-d, side)} you did not want ${verb(-d, 'is', 'are')} removed`);
    }
  }
  if (next.isGoal) return parts.length > 0 ? cap(`${parts.join(' · ')} — finished`) : 'Finished';
  return parts.length > 0 ? cap(parts.join(' · ')) : 'Nothing that helps — the item counts the same as before';
}
