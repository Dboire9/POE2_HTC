// A checked method (packages/optimizer/src/markovMethod.ts) in the words the Plan tab shows: which rule,
// which item, which moves, and — when it cannot be costed — one plain sentence saying where and why.
// States are worded by `describeItem` and moves by `actionLabel`, the same words Craft along and the
// route use, so a state reads the same in all three places.

import type { PatchData } from '../../packages/engine/src/types.ts';
import type { McAction } from '../../packages/optimizer/src/markovActions.ts';
import type {
  MethodCheck, MoveSpec, NotPossibleWhy, RuleRef,
} from '../../packages/optimizer/src/markovMethod.ts';
import { decodeState } from '../../packages/optimizer/src/markovState.ts';
import type { EngineMethodResult, EngineMethodRow, EngineMethodStop, TargetInput } from './engineTypes.ts';
import { actionLabel, mapReplay, tableNode } from './engineMap.ts';
import { describeItem } from './stateWords.ts';

/** How many "where it costs you" rows a result carries; the rest are summed into `elsewhere`. */
export const METHOD_ROWS = 5;

/** What a Normal item is called — it never holds a modifier (Craft along's word for it). */
const PLAIN = 'A white base';

export const ruleLabel = (r: RuleRef): string => (r === 'otherwise' ? 'Otherwise' : `Rule ${r + 1}`);

const RARITY: Record<'normal' | 'magic' | 'rare', string> = { normal: 'Normal', magic: 'Magic', rare: 'Rare' };

/** A move the method names but this craft has no action for (an Essence slot with no Essence), by its spec. */
function specLabel(spec: MoveSpec): string {
  if (spec.currency === 'essence') return `the Essence for slot ${spec.slot + 1}`;
  if (spec.currency === 'perfect-essence') return `a Perfect Essence for slot ${spec.slot + 1}`;
  return spec.currency;
}

/** The clause after "but": why the move cannot be played on this item. */
export function whyWords(why: NotPossibleWhy, rarity: 'normal' | 'magic' | 'rare', action?: McAction): string {
  const side = action && 'side' in action && action.side ? action.side : undefined;
  const here = RARITY[rarity];
  switch (why) {
    case 'excluded': return 'it is in your “currency I don’t have” list';
    case 'unpriced': return 'the price sheet has no price for it, so it cannot be costed';
    case 'needs-normal': return `it works on a Normal item, and here the item is already ${here}`;
    case 'needs-magic': return rarity === 'rare'
      ? 'it works on a Magic item, and here the item is already Rare'
      : 'it works on a Magic item, and here the item is still Normal';
    case 'needs-rare': return `it works on a Rare item, and here the item is still ${here}`;
    case 'no-room': return side ? `there is no room for another ${side} here` : 'the item has no room for another modifier here';
    case 'nothing-to-remove': return side ? `there is no ${side} on the item to remove` : 'there is nothing on the item to remove';
    case 'no-desecrated-mod': return 'no modifier on the item came from a Desecration';
    case 'already-desecrated': return 'the item already carries a modifier a Desecration placed, and it can hold only one';
    case 'no-desecration': return 'Desecration is not part of this craft’s plan';
    case 'boss-not-here': return 'a boss omen cannot be used on this base';
    case 'boss-not-modelled': return 'the true cost only plays a boss omen whose modifiers include one you asked for';
    case 'no-essence': return 'no Essence gives that slot’s modifier in this craft';
    case 'no-perfect-essence': return 'no Perfect Essence gives that slot’s modifier in this craft';
    case 'cannot-start-over': return 'this craft starts from an item you hold, and the true cost never buys another';
    case 'no-effect': return 'it cannot be played on this item';
  }
}

/** A method that could not be checked at all — the craft itself would not set up. */
export const methodUnavailable = (reason: string): EngineMethodResult => ({
  ok: false, stop: { kind: 'unavailable', message: `The method could not be checked: ${reason}.` },
});

/** A checked method, worded. `targets` are the craft's as asked, for the tier each mod is named at. */
export function mapMethod(data: PatchData, check: MethodCheck, targets: readonly TargetInput[]): EngineMethodResult {
  const t = check.table;
  const node = (i: number) => tableNode(data, t, i, targets);
  const where = (i: number): string => describeItem(node(i), PLAIN);
  if (!check.ok) {
    const s = check.stop;
    let stop: EngineMethodStop;
    if (s.kind === 'not-possible') {
      const move = s.action ? actionLabel(data, s.action) : specLabel(s.spec);
      const w = whyWords(s.why, decodeState(t.keys[s.state]!).rarity, s.action);
      const item = where(s.state);
      stop = {
        kind: s.kind, rule: ruleLabel(s.rule), move, why: s.why, whyWords: w, where: item, node: node(s.state),
        message: `${ruleLabel(s.rule)} says ${move}, but ${w}. The item there: ${item}.`,
      };
    } else if (s.kind === 'never-finishes') {
      const item = where(s.state);
      const a = t.act[s.state]!;
      const move = a >= 0 ? actionLabel(data, t.actions[a]!) : undefined;
      stop = {
        kind: s.kind, rule: ruleLabel(s.rule), ...(move ? { move } : {}), where: item, node: node(s.state),
        message: `Your method never finishes from: ${item}${move ? ` (${ruleLabel(s.rule)} plays ${move} there)` : ''}.`,
      };
    } else if (s.kind === 'invalid') {
      stop = { kind: s.kind, rule: ruleLabel(s.rule), message: `${ruleLabel(s.rule)} names slot ${s.slot + 1}, which this craft does not have.` };
    } else {
      stop = { kind: s.kind, message: 'Your method finishes, but its loops are too long to cost here.' };
    }
    return { ok: false, stop };
  }

  const rows: EngineMethodRow[] = check.losses.slice(0, METHOD_ROWS).map((l) => ({
    rule: ruleLabel(l.rule), where: where(l.state), node: node(l.state),
    yourMove: actionLabel(data, l.move), bestMove: actionLabel(data, l.best),
    visits: l.visits, costsYou: l.loss,
  }));
  const rest = check.losses.slice(METHOD_ROWS);
  const notes: string[] = [];
  if (check.keepsOffers) {
    notes.push('Where your method plays a Desecration, it is costed keeping the offered modifier the best plan would keep.');
  }
  if (check.folded.length > 0) {
    const names = [...new Set(check.folded.map((a) => actionLabel(data, a)))].join(', ');
    notes.push(`Where it plays ${names}, a cheaper move does exactly the same there; your move is costed at its own price.`);
  }
  return {
    ok: true, cost: check.cost, best: { cost: check.bestCost, bound: check.bound },
    ...(check.gap !== undefined ? { gap: check.gap } : {}),
    where: rows,
    ...(rest.length > 0 ? { elsewhere: { states: rest.length, costsYou: rest.reduce((s, l) => s + l.loss, 0) } } : {}),
    ...(check.replay?.ok ? { replay: mapReplay(data, check.replay) } : {}),
    ...(check.replay && !check.replay.ok ? { replayReason: check.replay.reason } : {}),
    keepsOffers: check.keepsOffers,
    notes,
  };
}
