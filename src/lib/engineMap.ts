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
const CURRENCY_LABEL: Record<PlanStep['currency'], string> = {
  transmute: 'Transmutation', augment: 'Augmentation', regal: 'Regal', exalt: 'Exalted',
  alchemy: 'Alchemy', chaos: 'Chaos', annul: 'Annulment', desecrate: 'Desecration', essence: 'Essence', 'perfect-essence': 'Perfect Essence',
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
  return { id: mod.id, text: mod.text ?? mod.id, type, family: mod.family, source: isEssence ? 'essence' : 'normal', tiers };
}

// ── Target mapping ──────────────────────────────────────────────────────────

/** UI tier display (1 = best) → engine TierTarget minTierIndex (worst acceptable tier; display n ⇒ any). */
export function toTierTargets(data: PatchData, targets: readonly TargetInput[]): TierTarget[] {
  return targets.map((t) => {
    const n = resolveMod(data, t.modId).tiers.length;
    // For an essence mod the tiers are its levels, so this picks the exact Lesser/Normal/Greater level.
    return { modId: t.modId, minTierIndex: Math.max(0, Math.min(n - 1, n - t.tierDisplay)) };
  });
}

export function toAltTargets(data: PatchData, targets: readonly AltTargetInput[]): AlternativeTarget[] {
  return targets.map((t) => {
    const n = resolveMod(data, t.modId).tiers.length;
    const minTierIndex = Math.max(0, Math.min(n - 1, n - t.tierDisplay));
    return t.pinned ? { modId: t.modId, minTierIndex, pinned: true } : { modId: t.modId, minTierIndex };
  });
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
      return m.fractured ? { modId: m.modId, tierName, fractured: true } : { modId: m.modId, tierName };
    });
  const prefixes = place(item.prefixes);
  const suffixes = place(item.suffixes);
  // The desecrated flag gates the Omen of Light annul, so set it whenever a desecrated mod is on the item.
  const desecrated = [...prefixes, ...suffixes].some((m) => data.mods.get(m.modId)?.source === 'desecrated');
  const state = { base, level: item.level, rarity: item.rarity, prefixes, suffixes };
  return desecrated ? { ...state, desecrated: true } : state;
}

/** Why an add of `mod` onto `state` is impossible (side full / family taken / off-pool). */
export function addBlockedReason(data: PatchData, state: ItemState, mod: Mod): string {
  const onSide = mod.type === 'prefix' ? state.prefixes.length : state.suffixes.length;
  const cap = state.rarity === 'magic' ? 1 : 3;
  if (onSide >= cap) return `the ${mod.type} side is full`;
  if (!familyAvailable(data, state, mod)) return `its “${mod.family}” family is already on the item`;
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
      // A desecration is constrained to its boss (the omen that targets the desecrated mod).
      const boss = step.currency === 'desecrate' ? step.boss : undefined;
      const omen = constrainTo ? (constrainTo === 'prefix' ? ' + Sinistral' : ' + Dextral')
        : peOmen ? (peOmen === 'sinistral' ? ' + Sinistral' : ' + Dextral')
        : boss ? ` + Omen of the ${BOSS_LABEL[boss]}` : '';
      const label = CURRENCY_LABEL[step.currency]
        + (orb ? ORB_SUFFIX[orb] : '')
        + (essenceLevel && essenceLevel !== 'normal' ? ` (${essenceLevel})` : '')
        + omen;
      // Each step names what it acts on: alchemy supplies 4 mods, chaos swaps one for another, annul
      // removes one, everything else adds one.
      const target = step.currency === 'alchemy' ? step.adds.map(text).join(' + ')
        : step.currency === 'chaos' ? `−${text(step.remove)}  +${text(step.add)}`
        : step.currency === 'perfect-essence' ? `+${text(step.add)}  −${text(step.remove)} (random)`
        : step.currency === 'annul' ? `removes ${text(step.remove)}`
        : text(sr.target);
      return { n: i + 1, currency: step.currency, orb, label, target, prob: sr.prob };
    }),
  }));
  return { frontier, plansEvaluated: res.plansEvaluated, currencyDepth: res.currencyDepth };
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

function actionLabel(action: McAction): string {
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
    const boss = `Omen of the ${BOSS_LABEL[action.boss]}`;
    return sideLabel ? `Desecrate (${boss}, ${sideLabel})` : `Desecrate (${boss})`;
  }
  if (action.currency === 'perfect-essence') {
    const sideLabel = action.side === 'prefix' ? 'Sinistral' : action.side === 'suffix' ? 'Dextral' : null;
    return sideLabel ? `Perfect Essence (${sideLabel})` : 'Perfect Essence';
  }
  return 'Chaos';
}

/** Map the from-item MDP result into UI shapes: mod-text node labels, human action names, layout depth. */
export function mapMarkov(data: PatchData, res: MarkovResult, nTargets: number): EngineMarkovResult {
  const text = (id: string): string => data.mods.get(id)?.text ?? id;
  const nodes: EnginePolicyNode[] = res.nodes.map((nd) => ({
    key: nd.key,
    present: nd.present.map(text),
    blocked: nd.blocked.map(text),
    junkPrefixes: nd.junkPrefixes,
    junkSuffixes: nd.junkSuffixes,
    ...(nd.desecratedJunk ? { desecratedJunk: nd.desecratedJunk } : {}),
    isStart: nd.isStart,
    isGoal: nd.isGoal,
    // Steps-to-goal = missing targets + off-tier blocks (each needs an annul then a re-add) + junk to
    // clear, counting an unwanted desecrated mod as junk. Goal = 0; used for the left→right layout.
    depth: (nTargets - nd.present.length) + nd.blocked.length + nd.junkPrefixes + nd.junkSuffixes
      + (nd.desecratedJunk ? 1 : 0),
    expectedCost: nd.expectedCost,
    ...(nd.action ? { action: actionLabel(nd.action) } : {}),
  }));
  const edges = res.edges.map((e) => ({ from: e.from, to: e.to, action: actionLabel(e.action), prob: e.prob, regress: e.regress }));
  return {
    applicable: true, feasible: res.feasible, expectedCost: res.expectedCost, nodes, edges,
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
      plan: mapFrontier(data, { frontier: [a.plan], plansEvaluated: 1, currencyDepth: res.currencyDepth }).frontier[0]!,
    };
  });
  return { rows, nodesEvaluated: res.nodesEvaluated, truncated: res.truncated, currencyDepth: res.currencyDepth };
}
