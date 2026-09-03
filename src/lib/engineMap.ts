// Presentation + mapping helpers for the browser facade (src/lib/engine.ts): they turn engine/optimizer
// values into the UI-shaped types (engineTypes.ts), and UI inputs back into engine targets. Kept out of
// engine.ts so the facade stays a thin public API. Pure — each takes a PatchData, never the memoized Engine.

import { resolveMod, familyAvailable } from '../../packages/engine/src/pool.ts';
import type { PatchData, ItemState, PlacedMod, CurrencyTier, Mod } from '../../packages/engine/src/types.ts';
import type { PlanStep } from '../../packages/engine/src/plan.ts';
import type { TierTarget, ParetoResult } from '../../packages/optimizer/src/optimize.ts';
import type { Alternative, AlternativeTarget, AlternativesResult, SlotChange } from '../../packages/optimizer/src/alternatives.ts';
import type { MarkovResult, McAction } from '../../packages/optimizer/src/markovFromItem.ts';
import type {
  EngineMod, EngineTier, EngineResult, EnginePlan, EngineStep, EngineSlot, EngineAlternative,
  EngineAlternatives, EngineMarkovResult, EnginePolicyNode, ExistingItem, TargetInput, AltTargetInput,
} from './engineTypes.ts';

// ── Labels ────────────────────────────────────────────────────────────────────

export function prettyName(id: string): string {
  return id.replace(/_/g, ' ');
}

const ORB_SUFFIX: Record<CurrencyTier, string> = { base: '', greater: ' (Greater)', perfect: ' (Perfect)' };
/** Desecration boss omen → its in-game name (Blackblooded=Kurgal, Liege=Amanamu, Sovereign=Ulaman). */
const BOSS_LABEL: Record<'blackblooded' | 'liege' | 'sovereign', string> = {
  blackblooded: 'Blackblooded', liege: 'Liege', sovereign: 'Sovereign',
};
/**
 * A boss omen's in-game name on its own, for anything that has to NAME the omen rather than draw a
 * whole step (the Quick currency check's Desecration rows). Same table as `stepLabel` uses, exported
 * rather than copied — two spellings of one omen is how a player ends up reading two different names
 * for the same purchase.
 */
export function bossOmenLabel(boss: keyof typeof BOSS_LABEL): string {
  return BOSS_LABEL[boss];
}

const CURRENCY_LABEL: Record<PlanStep['currency'], string> = {
  transmute: 'Transmutation', augment: 'Augmentation', regal: 'Regal', exalt: 'Exalted',
  alchemy: 'Alchemy', chaos: 'Chaos', annul: 'Annulment', desecrate: 'Desecration', essence: 'Essence', 'perfect-essence': 'Perfect Essence',
  // Still an Exalted Orb — the omen is what makes it land two mods, and it is named in the suffix
  // below rather than here, so the player reads which ORB to buy first and which omen to put on it.
  'greater-exalt': 'Exalted',
};

function tierLabel(display: number, tierCount: number, name: string, ilvl: number, range: string): string {
  const head = display === tierCount ? `T${display} · any` : `T${display}`;
  return `${head} · ${name} · ilvl ${ilvl}${range}`;
}

/** Essence mods label their tiers by essence level (the tier name already says "Greater Essence of …"). */
function essenceTierLabel(name: string, ilvl: number, range: string): string {
  return `${name} · ilvl ${ilvl}${range}`;
}

// ── Mod listing ─────────────────────────────────────────────────────────────

export function toEngineMod(data: PatchData, modId: string, type: 'prefix' | 'suffix'): EngineMod | null {
  const mod = data.mods.get(modId);
  if (!mod || mod.tiers.length === 0) return null;
  // Only rollable (normal) or regular-essence mods are craftable from white here. The essence pool
  // also holds perfect-essence-only mods (source 'perfect_essence') — those need the remove-and-add-
  // on-rare flow this optimizer doesn't model yet, so they aren't offered as targets.
  if (mod.source !== 'normal' && mod.source !== 'essence') return null;
  const isEssence = mod.source === 'essence';
  const n = mod.tiers.length;
  // Present best-first: engine tiers ascend by ilvl (index 0 = worst), so reverse for display.
  const tiers: EngineTier[] = mod.tiers
    .map((t, engineIndex) => {
      const display = n - engineIndex; // engineIndex n-1 (best) → display 1
      const r = t.ranges[0];
      const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
      const suffix = range ? ` · ${range}` : '';
      const label = isEssence ? essenceTierLabel(t.name, t.ilvl, suffix) : tierLabel(display, n, t.name, t.ilvl, suffix);
      return { display, name: t.name, ilvl: t.ilvl, label, range };
    })
    .sort((a, b) => a.display - b.display);
  return {
    id: mod.id, text: mod.text ?? mod.id, type, family: mod.family,
    ...(mod.families && mod.families.length > 1 ? { families: mod.families } : {}),
    source: isEssence ? 'essence' : 'normal', tiers,
  };
}

// ── Target mapping ──────────────────────────────────────────────────────────

/** UI tier display (1 = best) → engine minTierIndex (worst acceptable tier; display n ⇒ any tier). */
const minTierIndexOf = (data: PatchData, t: TargetInput): number => {
  // For an essence mod the tiers are its levels, so this picks the exact Lesser/Normal/Greater level.
  const n = resolveMod(data, t.modId).tiers.length;
  return Math.max(0, Math.min(n - 1, n - t.tierDisplay));
};

/** `slot` crosses UNCHANGED: it is an opaque grouping id on both sides, and inventing a new numbering
 *  here would only give two layers a chance to disagree about which candidates are alternatives. */
const slotOf = (t: TargetInput): { slot?: number } => (t.slot === undefined ? {} : { slot: t.slot });

export function toTierTargets(data: PatchData, targets: readonly TargetInput[]): TierTarget[] {
  return targets.map((t) => ({ modId: t.modId, minTierIndex: minTierIndexOf(data, t), ...slotOf(t) }));
}

export function toAltTargets(data: PatchData, targets: readonly AltTargetInput[]): AlternativeTarget[] {
  return targets.map((t) => ({
    modId: t.modId, minTierIndex: minTierIndexOf(data, t), ...slotOf(t),
    ...(t.pinned ? { pinned: true as const } : {}),
  }));
}

// ── Item building ─────────────────────────────────────────────────────────────

/** Turn a UI item description into the engine's ItemState (looks up mods, records their tier ilvl). */
export function buildItemState(data: PatchData, item: ExistingItem): ItemState {
  const base = data.bases.get(item.baseId);
  if (!base) throw new Error(`Unknown base: ${item.baseId}`);
  const place = (inputs: ExistingItem['prefixes']): PlacedMod[] =>
    inputs.map((m) => {
      const mod = resolveMod(data, m.modId);
      const n = mod.tiers.length;
      const idx = Math.max(0, Math.min(n - 1, n - m.tierDisplay)); // display 1 = best = last engine index
      const tierName = (mod.tiers[idx] ?? mod.tiers[0])?.name ?? '';
      // A mod from the desecrated POOL can only have arrived by Desecration, so it carries the flag
      // whether or not the player ticked it. An ORDINARY mod a bone placed looks like any other, which
      // is what the tick is for.
      const desecrated = m.desecrated === true || mod.source === 'desecrated';
      return {
        modId: m.modId, tierName,
        ...(m.fractured ? { fractured: true } : {}),
        ...(desecrated ? { desecrated: true } : {}),
      };
    });
  const prefixes = place(item.prefixes);
  const suffixes = place(item.suffixes);
  // Gates the Omen of Light annul: it needs something flagged to remove.
  const desecrated = [...prefixes, ...suffixes].some((m) => m.desecrated === true);
  const state = { base, level: item.level, rarity: item.rarity, prefixes, suffixes };
  return desecrated ? { ...state, desecrated: true } : state;
}

/** Why an add of `mod` onto `state` is impossible (side full / family taken / off-pool). */
export function addBlockedReason(data: PatchData, state: ItemState, mod: Mod): string {
  const onSide = mod.type === 'prefix' ? state.prefixes.length : state.suffixes.length;
  const cap = state.rarity === 'magic' ? 1 : 3;
  if (onSide >= cap) return `the ${mod.type} side is full`;
  if (!familyAvailable(data, state, mod)) return `its “${mod.family}” family is already on the item`;
  // A carved or essence-only mod IS craftable on this base — just not by the orb being asked about.
  // The catch-all below said "it can’t roll on this base", which is false for these three and sends
  // the player looking for a different base instead of a different currency. Name the currency that
  // can place it; that is the whole answer.
  if (mod.source === 'desecrated') return 'only a Desecration can add it';
  if (mod.source === 'perfect_essence') return 'only a Perfect Essence can add it';
  if (mod.source === 'essence') return 'only an Essence can add it';
  return 'it can’t roll on this base';
}

// ── Frontier / alternatives mapping ───────────────────────────────────────────

/** Map an optimizer ParetoResult into the UI-shaped EngineResult (shared by from-white and from-item). */
export function mapFrontier(data: PatchData, res: ParetoResult): EngineResult {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  const frontier: EnginePlan[] = res.frontier.map((plan) => ({
    probability: plan.probability,
    expected: plan.cost.expected,
    perAttempt: plan.cost.perAttempt,
    expectedAttempts: plan.cost.expectedAttempts,
    steps: plan.steps.map((step, i): EngineStep => {
      const sr = plan.result.steps[i]!;
      const orb = 'tier' in step ? step.tier : undefined;
      const essenceLevel = step.currency === 'essence' ? step.essenceLevel : undefined;
      // A side-constrained exalt/chaos uses an Exaltation omen (Sinistral = prefix, Dextral = suffix);
      // a perfect-essence step can carry a Sinistral/Dextral Crystallisation omen (constrains the removal).
      const constrainTo = (step.currency === 'exalt' || step.currency === 'chaos') ? step.constrainTo : undefined;
      const peOmen = step.currency === 'perfect-essence' ? step.omen : undefined;
      // Omen of Whittling — a CHAOS omen: the orb removes the lowest-LEVEL modifier rather than a
      // uniform one. Named in full because "+ Whittling" alone would not tell a player which orb it
      // modifies, and this is the only omen here that changes a REMOVAL on an adding currency.
      const whittling = step.currency === 'chaos' && step.omen === 'whittling';
      // Omen of Greater Exaltation: the orb adds TWO modifiers. Not optional on this step — it IS the
      // step — so it is derived from the currency rather than from a field, unlike every omen above.
      const doubled = step.currency === 'greater-exalt';
      // A desecration is constrained to its boss (the omen that targets the desecrated mod).
      const boss = step.currency === 'desecrate' ? step.boss : undefined;
      const omen = doubled ? ' + Omen of Greater Exaltation'
        : whittling ? ' + Omen of Whittling'
        : constrainTo ? (constrainTo === 'prefix' ? ' + Sinistral' : ' + Dextral')
        : peOmen ? (peOmen === 'sinistral' ? ' + Sinistral' : ' + Dextral')
        : boss ? ` + Omen of the ${BOSS_LABEL[boss]}` : '';
      const label = CURRENCY_LABEL[step.currency]
        + (orb ? ORB_SUFFIX[orb] : '')
        + (essenceLevel && essenceLevel !== 'normal' ? ` (${essenceLevel})` : '')
        + omen;
      // Each step names what it acts on: alchemy supplies 4 mods, chaos swaps one for another, annul
      // removes one, everything else adds one.
      const target = step.currency === 'alchemy' ? step.adds.map(text).join(' + ')
        : step.currency === 'greater-exalt' ? step.adds.map((a) => `+${text(a.modId)}`).join('  ')
        : step.currency === 'chaos' ? `−${text(step.remove)}  +${text(step.add)}`
        : step.currency === 'perfect-essence' ? `+${text(step.add)}  −${text(step.remove)} (random)`
        : step.currency === 'annul' ? `removes ${text(step.remove)}`
        : text(sr.target);
      return { n: i + 1, currency: step.currency, orb, label, target, prob: sr.prob };
    }),
  }));
  // Does anything here depend on the ASSUMED desecrated spawn weight? Only an UNOMENED Desecration
  // does: it draws by weight from the combined normal ∪ desecrated pool, and that weight is a
  // judgement call (see the note in tools/refresh/apply_pools.mjs). A boss-omened Desecration is
  // count-uniform and ignores weights entirely, so it stays exact. Computed here from the actual
  // steps rather than "did the target mention a desecrated mod", so the caveat appears exactly when
  // the numbers it qualifies are on screen.
  const assumedOdds = res.frontier.some((plan) =>
    plan.steps.some((step) => step.currency === 'desecrate' && step.boss === undefined));
  return {
    frontier, plansEvaluated: res.plansEvaluated, assumedOdds,
    ...(res.truncated ? { truncated: true } : {}),
  };
}

/** Engine slot → UI slot: turns minTierIndex back into a 1-based display tier and a compact label. */
function toEngineSlot(data: PatchData, slot: SlotChange): EngineSlot {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  if (slot.kind === 'dropped') return { kind: 'dropped', text: text(slot.from), fromText: text(slot.from) };
  const mod = resolveMod(data, slot.modId);
  const n = mod.tiers.length;
  const display = n - slot.minTierIndex;
  const r = mod.tiers[slot.minTierIndex]?.ranges[0];
  const range = r && r.length >= 2 ? `${r[0]}–${r[1]}` : '';
  const label = `T${display}${display === n ? ' · any' : ''}${range ? ` · ${range}` : ''}`;
  const kept = { kind: slot.kind, text: text(slot.modId), tierDisplay: display, tierLabel: label };
  // Only a CHANGED slot carries "what you asked for"; a kept slot's own text already says it.
  return slot.kind === 'swapped' ? { ...kept, fromText: text(slot.from) } : kept;
}

function actionLabel(data: PatchData, action: McAction): string {
  if (action.currency === 'exalt') {
    const sideLabel = action.side === 'prefix' ? 'Sinistral' : action.side === 'suffix' ? 'Dextral' : null;
    const strengthLabel = action.strength === 'base' ? null : action.strength === 'greater' ? 'Greater' : 'Perfect';
    if (sideLabel && strengthLabel) return `Exalt (${sideLabel}, ${strengthLabel})`;
    if (sideLabel) return `Exalt (${sideLabel})`;
    if (strengthLabel) return `Exalt (${strengthLabel})`;
    return 'Exalt';
  }
  if (action.currency === 'annul') {
    if (action.light) return 'Annul (Omen of Light)';
    const sideLabel = action.side === 'prefix' ? 'Sinistral' : action.side === 'suffix' ? 'Dextral' : null;
    return sideLabel ? `Annul (${sideLabel})` : 'Annul';
  }
  if (action.currency === 'desecrate') {
    const sideLabel = action.side === 'prefix' ? 'Sinistral' : action.side === 'suffix' ? 'Dextral' : null;
    // No boss omen — the untargeted draw over the whole pool. That is the only desecration available
    // on armour, so this is the common label, not an edge case: don't name an omen that isn't used.
    const boss = action.boss ? `Omen of the ${BOSS_LABEL[action.boss]}` : null;
    const parts = [boss, sideLabel].filter((x): x is string => x !== null);
    return parts.length > 0 ? `Desecrate (${parts.join(', ')})` : 'Desecrate';
  }
  if (action.currency === 'transmute' || action.currency === 'augment' || action.currency === 'regal') {
    const name = action.currency === 'transmute' ? 'Transmute'
      : action.currency === 'augment' ? 'Augment' : 'Regal';
    const strength = action.strength === 'base' ? null : action.strength === 'greater' ? 'Greater' : 'Perfect';
    return strength ? `${name} (${strength})` : name;
  }
  // Not a currency: abandoning the craft and buying another base. Named for what the player does, not
  // for what it costs — "Restart" beside a 0ex price would read as a bug rather than as a free reroll.
  if (action.currency === 'restart') return 'Start over with a new base';
  if (action.currency === 'perfect-essence') {
    const sideLabel = action.side === 'prefix' ? 'Sinistral' : action.side === 'suffix' ? 'Dextral' : null;
    return sideLabel ? `Perfect Essence (${sideLabel})` : 'Perfect Essence';
  }
  // A regular Essence is bought BY NAME, and the name is the tier: an essence mod's tiers are its
  // levels, so `tiers[tierIndex].name` is literally "Greater Essence of Alacrity" — the thing the
  // player puts in the trade search. Falling back to the level word keeps this honest if a data
  // refresh ever drops the name, rather than printing a level the sheet did not price.
  if (action.currency === 'essence') {
    const name = data.mods.get(action.target)?.tiers[action.tierIndex]?.name;
    return name ?? `${action.level === 'lesser' ? 'Lesser ' : action.level === 'greater' ? 'Greater ' : ''}Essence`;
  }
  return 'Chaos';
}

/** Map the from-item MDP result into UI shapes: mod-text node labels, human action names, layout depth. */
export function mapMarkov(data: PatchData, res: MarkovResult): EngineMarkovResult {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  /**
   * One filled position, named. The solver hands back the ids that COULD be filling it — several when
   * the position is same-family alternatives merged into one bit, because at that point nothing
   * downstream depends on which member landed and the state genuinely does not record it. "or" is
   * therefore the honest word: the item holds exactly one of these, and the plan works either way.
   */
  const label = (ids: readonly string[]): string => ids.map(text).join(' or ');
  const nodes: EnginePolicyNode[] = res.nodes.map((nd) => ({
    key: nd.key,
    present: nd.present.map(label),
    blocked: nd.blocked.map(label),
    junkPrefixes: nd.junkPrefixes,
    junkSuffixes: nd.junkSuffixes,
    rarity: nd.rarity,
    ...(nd.desecratedJunk ? { desecratedJunk: nd.desecratedJunk } : {}),
    ...(nd.desecratedTarget ? { desecratedTarget: label(nd.desecratedTarget) } : {}),
    isStart: nd.isStart,
    isGoal: nd.isGoal,
    // Steps-to-goal, taken from the solver rather than recomputed here. This used to be a second copy
    // of the same expression, and it silently went wrong the moment rarity joined the formula: a Magic
    // item is at least a Regal and an Annulment away however good its mods are, and a UI that didn't
    // know that would draw the solver's forward steps as steps backwards.
    depth: nd.depth,
    visitRate: nd.visitRate,
    expectedCost: nd.expectedCost,
    ...(nd.action ? { action: actionLabel(data, nd.action) } : {}),
  }));
  const edges = res.edges.map((e) => ({ from: e.from, to: e.to, action: actionLabel(data, e.action), prob: e.prob, regress: e.regress }));
  return {
    applicable: true, feasible: res.feasible, expectedCost: res.expectedCost,
    converged: res.converged, bound: res.bound,
    // Same rule as the frontier's: only an unomened Desecration leans on the assumed weight.
    assumedOdds: [...res.policy.values()].some((a) => a.currency === 'desecrate' && a.boss === undefined),
    nodes, edges,
    ...(res.bareCost !== undefined ? { bareCost: res.bareCost } : {}),
    ...(res.reason ? { reason: res.reason } : {}),
  };
}

export function mapAlternatives(data: PatchData, res: AlternativesResult): EngineAlternatives {
  const rows = res.frontier.map((a: Alternative): EngineAlternative => {
    const { dropped, swapped, valueRetained } = a.closeness;
    return {
      slots: a.slots.map((s) => toEngineSlot(data, s)),
      isTarget: dropped === 0 && swapped === 0 && valueRetained >= 1 - 1e-9,
      dropped, swapped, valueRetained,
      inBudget: a.inBudget,
      inBudgetMax: a.inBudgetMax,
      exact: a.inBudgetMax - a.inBudget < 1e-9,
      plan: mapFrontier(data, { frontier: [a.plan], plansEvaluated: 1 }).frontier[0]!,
    };
  });
  return { rows, nodesEvaluated: res.nodesEvaluated, truncated: res.truncated };
}
