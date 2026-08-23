// UI-shaped types for the browser facade (src/lib/engine.ts). Kept in their own module so the facade
// and its presentation/mapping helpers (engineMap.ts) share one vocabulary without a circular import.

import type { CurrencyTier } from '../../packages/engine/src/types.ts';
import type { PlanStep } from '../../packages/engine/src/plan.ts';
import type { CurrencyDepth } from '../../packages/optimizer/src/optimize.ts';

export interface EngineBase {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}

/** One selectable tier of a mod, presented best-first (`display` 1 = T1 = best). */
export interface EngineTier {
  /** 1-based, 1 = best (T1). Equal to `tierCount` for the worst tier (⇒ "any tier"). */
  readonly display: number;
  readonly name: string;
  readonly ilvl: number;
  readonly label: string;
  /** The roll range as "min–max" (e.g. "165–179"), or "" for a value-less mod. */
  readonly range: string;
}

export interface EngineMod {
  readonly id: string;
  readonly text: string;
  readonly type: 'prefix' | 'suffix';
  /** Primary family-exclusion group — an item may hold at most one mod per family. */
  readonly family: string;
  /** All exclusion groups, when the mod spans more than one (a desecrated "+Str +Int" blocks both).
   * Absent for the ordinary single-family case; use `modFamilies()` rather than reading it directly. */
  readonly families?: readonly string[];
  /** 'normal' = rollable with currency; 'essence' = obtainable only by a regular essence (tiers = levels);
   * 'perfect' = a perfect-essence mod (added on a Rare by a Perfect Essence, which removes one random mod);
   * 'desecrated' = a desecrated ("carved by the Abyss") mod — occupies a slot/family and is the sole
   * target an Omen of Light annul can remove for certain. */
  readonly source: 'normal' | 'essence' | 'perfect' | 'desecrated';
  /** Tiers best-first (T1 … Tn); for essence mods these are the Greater→Lesser essence levels. */
  readonly tiers: readonly EngineTier[];
}

/** Where the cost numbers come from, so the UI can say how firm they are. Every "expected cost" the
 *  app shows is the probability math multiplied by this sheet — if the sheet is estimated, the costs
 *  are estimates too, however exact the probabilities are. */
export interface EnginePriceBasis {
  /** True when the sheet is hand-authored guesswork rather than observed market data. */
  readonly estimated: boolean;
  /** ISO date the sheet was last touched, if known. */
  readonly asOf?: string;
  readonly patch?: string;
  /** Exalt-equivalents, normally. */
  readonly unit?: string;
  /** Which parts are estimated, when the sheet is part-observed and part-guessed. */
  readonly caveat?: string;
}

/** Every exclusion group a UI mod belongs to — the single accessor the UI should use, so a
 * multi-family mod (a desecrated "+Str +Int") blocks and is blocked by all of its groups, not just
 * the primary one. Tolerates undefined so callers can pass a Map lookup straight in. */
export function modFamilies(mod: { family: string; families?: readonly string[] } | undefined): readonly string[] {
  if (!mod) return [];
  if (mod.families && mod.families.length > 0) return mod.families;
  return mod.family ? [mod.family] : [];
}

export interface EngineBaseMods {
  readonly prefixes: readonly EngineMod[];
  readonly suffixes: readonly EngineMod[];
}

/** A desired mod for the optimizer: which mod, and what tier (1-based from best). For an essence-only
 * mod the tier is the essence level (Greater = best); essence-ness is inherent to the mod, not a flag. */
export interface TargetInput {
  readonly modId: string;
  /** 1-based from best; `tierCount` = worst = "any tier". */
  readonly tierDisplay: number;
}

export interface EngineStep {
  readonly n: number;
  readonly currency: PlanStep['currency'];
  readonly orb?: CurrencyTier;
  readonly label: string;
  readonly target: string;
  readonly prob: number;
}

export interface EnginePlan {
  readonly probability: number;
  readonly expected: number;
  readonly perAttempt: number;
  readonly expectedAttempts: number;
  readonly steps: readonly EngineStep[];
}

export interface EngineResult {
  readonly frontier: readonly EnginePlan[];
  readonly plansEvaluated: number;
  readonly currencyDepth: CurrencyDepth;
}

/** A modifier currently sitting on an item the user already holds. */
export interface ItemModInput {
  readonly modId: string;
  /** 1-based from best (matches the picker); only affects which tier ilvl is recorded. */
  readonly tierDisplay: number;
  /** Fractured ("carved"): locked on the item — never removed, and out of the random-removal pool. */
  readonly fractured?: boolean;
}

/** An item the user already owns: a magic or rare base carrying these prefixes/suffixes. */
export interface ExistingItem {
  readonly baseId: string;
  readonly level: number;
  readonly rarity: 'magic' | 'rare';
  readonly prefixes: readonly ItemModInput[];
  readonly suffixes: readonly ItemModInput[];
}

/** One currency's outcome on the current item: the exact per-use probability, plus feasibility. */
export interface CurrencyAction {
  readonly currency: PlanStep['currency'];
  readonly label: string;
  /** Human description of the outcome, e.g. "removes X, adds Y" or "adds Y to an open suffix". */
  readonly detail: string;
  /** Exact probability that ONE use produces this outcome (0 if the action can't apply here). */
  readonly prob: number;
  /** Price of a single orb, in exalt-equivalents (informational — not a total budget). */
  readonly cost: number;
  readonly feasible: boolean;
  /** Why the action can't apply (only when infeasible). */
  readonly reason?: string;
}

/** A desired mod for the alternatives search: pinned mods are never relaxed, swapped or dropped. */
export interface AltTargetInput extends TargetInput {
  readonly pinned?: boolean;
}

/** What became of one desired slot in an alternative (slot order matches your target). */
export interface EngineSlot {
  readonly kind: 'kept' | 'swapped' | 'dropped';
  /** The mod you'd end up with (for a drop, the mod you'd lose). */
  readonly text: string;
  /** What you originally asked for — set only when this slot changed. */
  readonly fromText?: string;
  /** 1-based from best; absent for a dropped slot. */
  readonly tierDisplay?: number;
  /** Compact tier label, e.g. "T2 · 125–149" or "T8 · any". */
  readonly tierLabel?: string;
}

export interface EngineAlternative {
  readonly slots: readonly EngineSlot[];
  /** True for the row that is exactly your target — no relaxation at all. */
  readonly isTarget: boolean;
  readonly dropped: number;
  readonly swapped: number;
  /** Mean fraction of the asked-for stat value still guaranteed, [0,1]. */
  readonly valueRetained: number;
  /** P(you finish inside the budget), conservative. Exact unless `exact` is false. */
  readonly inBudget: number;
  /** Upper bound — the true chance is in [inBudget, inBudgetMax]. */
  readonly inBudgetMax: number;
  /** False when the prices weren't commensurable, so the odds are a bracket, not a point. */
  readonly exact: boolean;
  /** The best way to spend the budget on THIS item. */
  readonly plan: EnginePlan;
}

export interface EngineAlternatives {
  /** Closest-first; the odds strictly rise down the list. */
  readonly rows: readonly EngineAlternative[];
  readonly nodesEvaluated: number;
  /** The node cap stopped the search early — farther alternatives may be missing. */
  readonly truncated: boolean;
  readonly currencyDepth: CurrencyDepth;
}

// ── From-item MDP (true expected cost + optimal-policy graph) ──────────────────

/** One state (square) in the optimal-policy graph for a from-item craft. */
export interface EnginePolicyNode {
  readonly key: string;
  /** Target-mod texts present (at ≥ their wanted tier) in this state. */
  readonly present: readonly string[];
  /** Target-mod texts whose family is occupied by a below-tier ("off-tier") roll — annul before re-adding. */
  readonly blocked: readonly string[];
  readonly junkPrefixes: number;
  readonly junkSuffixes: number;
  /** Side carrying an unwanted DESECRATED mod, if any — it blocks re-desecrating until it's removed. */
  readonly desecratedJunk?: 'prefix' | 'suffix';
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /** Steps-to-goal ranking (0 = goal); used to lay the graph out left→right. */
  readonly depth: number;
  /** Minimum expected cost (exalt-equivalents) to reach the target from here. */
  readonly expectedCost: number;
  /** Human label of the optimal currency here (absent at the goal), e.g. "Annul (Sinistral)". */
  readonly action?: string;
}

/** One policy transition (arrow). `regress` marks a brick — the outcome that sends you backward. */
export interface EnginePolicyEdge {
  readonly from: string;
  readonly to: string;
  readonly action: string;
  readonly prob: number;
  readonly regress: boolean;
}

export interface EngineMarkovResult {
  /** False when the MDP doesn't model this target (e.g. a perfect-essence/desecrate mod) — use the frontier. */
  readonly applicable: boolean;
  /** False when a target can't roll at this item level (cost ∞). */
  readonly feasible: boolean;
  readonly reason?: string;
  /** True expected cost under the optimal push-forward policy (no restart). */
  readonly expectedCost: number;
  /** False when value iteration hit its sweep cap instead of converging — then `expectedCost` is a
   *  LOWER BOUND and the UI must render it as "≥ x". See MarkovResult.converged. */
  readonly converged: boolean;
  readonly nodes: readonly EnginePolicyNode[];
  readonly edges: readonly EnginePolicyEdge[];
}
