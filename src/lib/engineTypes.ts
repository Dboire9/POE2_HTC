// UI-shaped types for the browser facade (src/lib/engine.ts). Kept in their own module so the facade
// and its presentation/mapping helpers (engineMap.ts) share one vocabulary without a circular import.

import type { CurrencyTier } from '../../packages/engine/src/types.ts';
import type { PlanStep } from '../../packages/engine/src/plan.ts';
import type { RouteTable } from '../../packages/optimizer/src/markovRoute.ts';

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
  /** The first roll range as "min–max" (e.g. "165–179"), a bare "5" when fixed, "" when value-less. */
  readonly range: string;
  /**
   * One formatted value per `#` in the mod's text, in order — 153 mods carry two or three.
   *
   * Kept beside `range` rather than replacing it because they answer different questions: `range` is a
   * compact suffix for a tier LABEL, these are what the sentence reads with the numbers filled in.
   */
  readonly values: readonly string[];
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
   * 'desecrated' = a mod from the base's desecrated pool — occupies a slot/family and is the sole
   * target an Omen of Light annul can remove for certain. */
  /**
   * Where the mod can come from. `'alloy'` is a Perfect Essence by MECHANIC — the engine's own source
   * stays `perfect_essence` and every planner treats the two identically — and a different currency by
   * NAME and PRICE, which is all this distinction is for.
   */
  readonly source: 'normal' | 'essence' | 'perfect' | 'alloy' | 'desecrated' | 'rune';
  /**
   * The rune that offers it, when `source` is `'rune'` — its id in `packages/engine/src/runes.ts`.
   *
   * The engine's own source for these stays `'normal'`, because once the rune is socketed an Exalt
   * rolls them like anything else. This is the UI half of that split, as `'alloy'` is for a currency
   * whose mechanic is likewise unchanged: it exists so a picker can name where the modifier came from
   * and offer it only while its rune is ticked.
   */
  readonly rune?: string;
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
  /** The league these prices are from — what a trade search has to be pointed at to mean anything. */
  readonly league?: string;
  /** Exalts per Chaos / per Divine, so the UI can show a huge cost in a unit a player can picture
   *  instead of a wall of digits. See `src/lib/currency.ts`. */
  readonly rates?: { readonly chaos?: number; readonly divine?: number };
}

/** Every exclusion group a UI mod belongs to — the single accessor the UI should use, so a
 * multi-family mod (a desecrated "+Str +Int") blocks and is blocked by all of its groups, not just
 * the primary one. Tolerates undefined so callers can pass a Map lookup straight in. */
export function modFamilies(
  mod: { family: string; families?: readonly string[]; source?: EngineMod['source'] } | undefined,
): readonly string[] {
  if (!mod) return [];
  const own = mod.families && mod.families.length > 0 ? mod.families : mod.family ? [mod.family] : [];
  // The UI's mirror of `familiesOf` (pool.ts): a crafted modifier — Essence, Perfect Essence or Alloy
  // — excludes only other crafted ones, so the picker allows a crafted mod beside a rolled mod of the
  // same family, which is what real items do. A caller passing a bare `{ family }` has no source and
  // keeps the plain groups.
  return mod.source === 'essence' || mod.source === 'perfect' || mod.source === 'alloy'
    ? own.map((f) => `crafted:${f}`)
    : own;
}

/**
 * Can currency roll this modifier onto an item?
 *
 * `'rune'` counts, and that is the whole reason this exists rather than `source === 'normal'` written
 * out at each site. A rune-pool modifier is ordinary once its rune is socketed — the engine's own
 * source for it IS `normal`, and every planner already treats it that way — so a picker testing for
 * `'normal'` alone would offer a solve the engine is perfectly willing to run, and hide the modifiers
 * the player ticked the rune to get.
 *
 * Deliberately NOT used by the fracture checkbox: claiming you can buy a base with a rune-pool
 * modifier already carved on it is untraced, so that stays the narrower `'normal'`.
 */
export const isRollable = (source: EngineMod['source'] | undefined): boolean =>
  source === 'normal' || source === 'rune';

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
  /**
   * Which SLOT of the finished item this mod fills. Targets sharing a slot are ALTERNATIVES — any one
   * of them satisfies it — so a target may name more candidates than the six mods an item holds.
   *
   * Absent means a slot of its own, which is what every target meant before slots existed. Tiers stay
   * per candidate: `T1 Extra Cold or T3 Extra Lightning` is a legal slot.
   */
  readonly slot?: number;
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
  /** True when a search cap stopped the planner early — the UI must offer more Search effort. */
  readonly truncated?: boolean;
  /**
   * Why there is no frontier, when the planner DECLINED rather than searched and found nothing.
   *
   * The two are different answers and must not render alike: "nothing this search tried worked" sends
   * the reader off adjusting a tier, which is useless advice when the planner refused the craft's shape
   * outright (a lone essence-only target, say). `runSolve`'s `frontierOrReason` carries the planner's
   * own sentence here, and `FrontierView` prefers it over its generic hint.
   */
  readonly reason?: string;
  /** True when a shown number depends on an ASSUMED spawn weight. The UI must say so — see
   *  PriceBasisNote's `exactOdds`. */
  readonly assumedOdds: boolean;
  /** WHICH assumption, so the note can name it. Naming the wrong one is its own false claim: a craft
   *  with a pool rune socketed and no Desecration in it was still told it "uses a Desecration". */
  readonly assumedFrom?: 'desecration' | 'rune-pool' | 'both';
}

/** A modifier currently sitting on an item the user already holds. */
export interface ItemModInput {
  readonly modId: string;
  /** 1-based from best (matches the picker); only affects which tier ilvl is recorded. */
  readonly tierDisplay: number;
  /** Fractured: locked on the item — never removed, and out of the random-removal pool. */
  readonly fractured?: boolean;
  /**
   * This mod was placed by a Desecration.
   *
   * An item carries at most one, and while it does the Well of Souls will not touch the item again —
   * so removing it is what frees the item to be desecrated. The flag belongs to the MOD, not to the
   * pool it came from, so a bone that placed an ORDINARY mod marks it the same way; that mod is then
   * indistinguishable from an exalted one, which is why the player has to tell us. A desecrated-pool
   * mod is treated as flagged regardless.
   */
  readonly desecrated?: boolean;
}

/**
 * An item to craft from: a base carrying these prefixes/suffixes.
 *
 * `normal` is a bare white base with no mods. The Item tab never offers it — you do not "already own"
 * a white item in any interesting sense — but the Lab's from-scratch craft is exactly that, and it
 * needs the same shape to reach the true-cost model.
 */
export interface ExistingItem {
  readonly baseId: string;
  readonly level: number;
  readonly rarity: 'normal' | 'magic' | 'rare';
  readonly prefixes: readonly ItemModInput[];
  readonly suffixes: readonly ItemModInput[];
  /**
   * Runes socketed in it, by their poe.ninja id (`packages/engine/src/runes.ts`).
   *
   * They change what the item may HOLD — Astrid's Creativity a second crafted modifier, Serle's
   * Triumph a fourth suffix — so every planner has to see them. `buildItemState` applies them once.
   */
  readonly runes?: readonly string[];
}

/** Opts for a from-white call, which has no item to carry its runes. */
export interface RuneChoice {
  readonly runes?: readonly string[];
}

/**
 * What an "I already have this item" import hands the Item tab.
 *
 * `ExistingItem` with the tab's own narrower rarity — the tab offers Rare and Magic, and a white item
 * is not something anyone pastes — and with mutable lists, which is what the tab's setters take. It
 * exists so the paste box and the streamer picker fill the tab through ONE contract rather than two
 * inline prop types that could drift apart.
 */
export interface ImportedItem {
  readonly baseId: string;
  readonly level: number;
  readonly rarity: 'magic' | 'rare';
  readonly prefixes: ItemModInput[];
  readonly suffixes: ItemModInput[];
  /** Runes socketed in the item this was read from, as `ExistingItem.runes`. An imported item that
   *  dropped them would claim to hold less than it does — four suffixes would become illegal. */
  readonly runes?: readonly string[];
}

/**
 * Something to craft TOWARD: a base, its item level, and the targets. A target list rather than an
 * item, because a slot may name alternatives — "Extra Cold or Extra Lightning", whichever lands — and no
 * item can hold a disjunction. What the Lab and the Item tab's plan both take as a goal.
 */
export interface CraftGoal {
  readonly baseId: string;
  readonly level: number;
  readonly targets: readonly TargetInput[];
  /**
   * Runes the craft is planned WITH, when the goal came from a real item that has them socketed.
   *
   * Part of the goal rather than of the item because they change what the finished item may hold: aim
   * at four suffixes without naming the Serle's Triumph that allows them and every planner refuses a
   * craft the streamer has already done.
   */
  readonly runes?: readonly string[];
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
}

// ── From-item MDP (true expected cost + optimal-policy graph) ──────────────────

/** One state (square) in the optimal-policy graph for a from-item craft. */
/**
 * One POSITION of a policy state, named for a reader.
 *
 * `text` is what it always was — the modifier, or several joined with "or" when same-family
 * alternatives merged into one position. The other two are what turn a comma-separated run-on into
 * something scannable: which side of the item it sits on, and the tier it was asked at.
 *
 * `tier` is the tier the TARGET named, not a roll the state records — a present position means "at
 * that tier or better", and the state deliberately does not remember which. Absent when the caller
 * gave no target list, and absent for a merged position whose members were asked at different tiers
 * (the case `mixedTierAlternatives` warns about), where one number would speak for two asks.
 */
export interface PolicyMod {
  readonly text: string;
  readonly type: 'prefix' | 'suffix';
  /** 1 = best. See above for when it is absent. */
  readonly tier?: number;
}

export interface EnginePolicyNode {
  readonly key: string;
  /** Target positions present (at ≥ their wanted tier) in this state. */
  readonly present: readonly PolicyMod[];
  /** Target positions whose family another roll holds — the mod below its wanted tier, or a DIFFERENT mod
   *  of the same family on the same side (markovSiblings.ts). Either way: annul before re-adding. */
  readonly blocked: readonly PolicyMod[];
  /** Mods nobody asked for that hold a target's family from the other side, or two targets' at once
   *  (markovSiblings.ts). Junk that also blocks. Absent when there are none. */
  readonly obstacles?: readonly PolicyMod[];
  readonly junkPrefixes: number;
  readonly junkSuffixes: number;
  /** The item's rarity in this state — a from-white craft climbs Normal → Magic → Rare, and a 2-mod
   *  Magic item must not render as the 2-mod Rare item it is not. */
  readonly rarity: 'normal' | 'magic' | 'rare';
  /** Set when the mod a Desecration placed is JUNK, naming the side it sits on. It blocks
   *  re-desecrating until it's removed. */
  readonly desecratedJunk?: 'prefix' | 'suffix';
  /** Set when the mod a Desecration placed is one of your TARGETS — its text. Blocks re-desecrating
   *  just the same, which is why keeping it can cost more than it looks. */
  readonly desecratedTarget?: string;
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /** The white base a route from a BOUGHT item ends at when the policy starts over — drawn, never
   *  walked, because what follows is the from-scratch plan. Only on a Lab route from a starting item. */
  readonly isRestart?: true;
  /** Steps-to-goal ranking (0 = goal); used to lay the graph out left→right. */
  readonly depth: number;
  /**
   * How much this state matters to a run that SUCCEEDS — expected visits per successful attempt.
   *
   * This is what decides which states the graph draws, and the obvious metric is the wrong one. Plain
   * visit frequency ranks the FAILURES first: on a craft with a free base ~98% of states choose
   * "start over", so they are entered constantly while every one of them shows the same action and
   * the same cost (they all share V(start)). A real 6-target T2 craft drew ten boxes at 90% coverage
   * and nine read "Start over with a new base · 2,132 div" — statistically faithful and useless. The
   * spine a player needs sat below 99%.
   *
   * So it is weighted by the probability of reaching the goal from here. A state whose best move is
   * to restart has no route onward and drops out; what is left is the path the craft actually takes.
   * Restart edges are still DRAWN from the states that survive — they are the back-arrows, and how
   * often a step throws you back is precisely what the reader needs to see.
   *
   * Expected VISITS, not a probability: one attempt can pass through the same state twice, so this
   * can exceed 1. Ranking, not odds.
   */
  readonly visitRate: number;
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

/** One candidate starting item: target modifiers already on it, and what finishing then costs. */
export interface EngineHolding {
  /** Target-mod texts already on the item, one per filled slot; interchangeable alternatives read
   *  "Cold or Lightning". */
  readonly present: readonly string[];
  readonly cost: number;
  /** A Magic and a Rare holding the same mods finish differently — only the Magic one can Regal. */
  readonly rarity: 'magic' | 'rare';
  /** The solver's state for this item, so the Lab can draw the route from it. */
  readonly key: string;
}

export interface EngineMarkovResult {
  /** False when the MDP doesn't model this target (e.g. a perfect-essence/desecrate mod) — use the frontier. */
  readonly applicable: boolean;
  /** False when a target can't roll at this item level (cost ∞). */
  readonly feasible: boolean;
  readonly reason?: string;
  /** Set when there is no number because the solve ran out of clock or sweeps — the one failure a
   *  higher Search effort can fix. See MarkovResult.stoppedEarly. */
  readonly stoppedEarly?: true;
  /** True expected cost under the optimal policy. */
  readonly expectedCost: number;
  /** False when value iteration hit its sweep cap instead of converging — then `expectedCost` is a
   *  bound rather than an answer, and `bound` says which one. See MarkovResult.converged. */
  readonly converged: boolean;
  /** Which side of the truth `expectedCost` falls on: render "x", "≥ x" or "≤ x" from THIS, never
   *  from `converged` alone — a from-item solve truncates upward and a from-white solve downward, so
   *  assuming either direction prints a confidently wrong figure. See MarkovResult.bound. */
  readonly bound: 'exact' | 'lower' | 'upper';
  /** True when a shown number depends on an ASSUMED spawn weight. The UI must say so — see
   *  PriceBasisNote's `exactOdds`. */
  readonly assumedOdds: boolean;
  /** WHICH assumption, so the note can name it rather than guessing — see `EngineResult`. */
  readonly assumedFrom?: 'desecration' | 'rune-pool' | 'both';
  /**
   * What the same craft would cost from a BARE item of this rarity — none of the targets, no junk.
   *
   * The zero point `expectedCost` is progress against, and it is free: the solver already computes a
   * value for every state and this is one of them. It exists because "how many of my targets are
   * already on" is a bad proxy for how far along you are — holding four of six measured at 4.4% of
   * the cost, not 67% (docs/validation.md, 2026-09-03).
   *
   * `expectedCost` can EXCEED it — measured, not assumed: a Wand holding three junk mods and none of
   * the targets came out 489 ex WORSE than an empty base. Any UI must handle that sign. Absent when
   * the start is already the target, or unreachable.
   */
  readonly bareCost?: number;
  /**
   * Every clean item the craft could START from, priced — "which of these should I already have?"
   *
   * Free: value iteration solves the whole lattice and each of these is one cell of it, so this is a
   * table lookup rather than a solve per candidate. Same `bound` as `expectedCost`. Magic and Rare
   * rows; the empty Rare is one, and equals `bareCost` only when the craft starts Rare. Each assumes
   * NO junk in the other slots, so a real listing costs at least this to finish — see
   * `startingItem.ts`, which is the only thing that should read it.
   */
  readonly holdings?: readonly EngineHolding[];
  /**
   * What another white base costs, as this solve priced it — present exactly when starting over was a
   * move (a from-white Lab craft). Read from the RESULT, not from the Base cost field, which the
   * player can edit after solving.
   */
  readonly restartCost?: number;
  /**
   * The solved policy over the whole lattice, opaque to the UI: `routeFor` walks it to draw the route
   * from any starting item without solving again. From-white Lab solves only, exact ones only.
   */
  readonly routes?: RouteTable;
  /**
   * The solved policy PLAYED on real items (markovReplay.ts), when the solve was asked to — what
   * following it really costs, and how often each watched modifier or combination turned up on the way.
   *
   * `seen[k]` lines up with the `watch` entries the request named, as a share of the crafts played:
   * `runs` is how many that was, which a caller showing the number has to weigh (a long craft plays
   * fewer). Absent when no replay was asked for, or when the route uses a move the replay declines to
   * approximate — `replayReason` then says which.
   */
  readonly replay?: {
    readonly runs: number;
    readonly seen: readonly number[];
    readonly meanCost: number;
    readonly stdErr: number;
    /** What one craft cost, 0th–100th percentile (101 values) — see `ReplayResult.costPercentiles`. */
    readonly costPercentiles: readonly number[];
    /** What selling priced sets on the way brought back, per craft — see `ReplayResult.sales`. */
    readonly sales?: { readonly revenue: number; readonly perEntry: readonly number[] };
    /** What following the plan spends, per craft on average, by currency (`restart` = a fresh base). */
    readonly movesPerCraft: Readonly<Record<string, number>>;
  };
  readonly replayReason?: string;
  readonly nodes: readonly EnginePolicyNode[];
  readonly edges: readonly EnginePolicyEdge[];
}
