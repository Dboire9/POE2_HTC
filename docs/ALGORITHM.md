# POE2 HTC Crafting Algorithm — In-Depth Explanation

> **What changed:** earlier versions of POE2 HTC used a **Beam Search** that *simulated* millions of
> crafting sequences on a multithreaded Java backend. That approach is retired. The engine is now
> **analytic**: it computes each plan's probability *exactly* from the modifier weight pools, and the
> optimizer returns a **cost ↔ success Pareto frontier**. It's pure TypeScript, runs client-side, and
> uses Monte-Carlo simulation only to *validate* the exact math. This document describes the current
> design.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Why Analytic Instead of Search](#why-analytic-instead-of-search)
3. [Core Concepts](#core-concepts)
4. [Per-Currency Probability](#per-currency-probability)
5. [Evaluating a Plan](#evaluating-a-plan)
6. [Expected-Cost Model](#expected-cost-model)
7. [The Pareto Optimizer](#the-pareto-optimizer)
8. [From an Existing Item](#from-an-existing-item)
9. [Monte-Carlo Validation](#monte-carlo-validation)
10. [Worked Example](#worked-example)

---

## Problem Statement

Given a **base item** and a set of **desired modifiers** (with target tiers), find crafting sequences
that reach the goal, and report each one's **success probability** and **expected cost**.

Path of Exile 2 crafting is a constrained combinatorial system:

- Up to **3 prefixes + 3 suffixes** (magic items hold 1 + 1).
- Currencies with distinct behaviors — Transmutation, Augmentation, Regal, Exalted, Chaos, Annulment,
  Alchemy, Essences, Desecration — each in base/greater/perfect tiers where applicable.
- **Modifier weights** determine roll odds; **families** are exclusion groups (at most one mod per
  family per item); **item-level gates** restrict which tiers can appear; **omens** constrain currency
  outcomes.

The goal is exactness and speed: precise probabilities, computed locally in milliseconds.

---

## Why Analytic Instead of Search

Simulation answers "how often did we succeed in N trials?" — with sampling noise, a runtime cost that
grows with the precision you want, and no exact number for rare outcomes. But PoE2 currency outcomes
are **weighted draws from a known pool**, so each step's probability is a closed-form ratio, and a
plan's probability is the product of its steps'. There's nothing to sample.

Consequences:

- **Exact** probabilities, including for very rare crafts, with no variance.
- **Fast** — evaluating a plan is a handful of pool sums, not thousands of trials.
- **Composable** — expected cost and the Pareto frontier fall out of the same per-step numbers.

Simulation is retained, but only as an independent check on the analytic engine (see
[Monte-Carlo Validation](#monte-carlo-validation)).

---

## Core Concepts

**Weight pool.** For a given item state, side (prefix/suffix), and item level, the *addable* mods are
those that can still roll: correct side, family not already present, item level ≥ the tier's ilvl, and
tier ≥ the currency's tier floor. Each has an integer weight `w`. The chance a single random add lands
a specific target tier is

```
P(target) = w(target) / Σ w(addable)
```

**Family exclusion.** Each mod belongs to a `family`; an item may hold at most one mod per family.
A family already on the item removes *all* of that family's tiers from the addable pool — this is what
makes ordering matter and is the source of many subtle probability differences.

**Item-level gates.** A tier with `ilvl = k` can only appear on an item of level ≥ k. Higher item
level → more (and higher) tiers in the pool → different odds.

**Currency tier floors.** base / greater / perfect currencies floor the accessible tiers at
`0 / 35 / 50` respectively, biasing rolls toward better tiers.

**Omens.** Omens constrain currency behavior — e.g. an **Exaltation** omen forces the added mod's side
(**Sinistral** = prefix, **Dextral** = suffix); annul omens constrain which mod is removed. The engine
models them as options on the relevant step.

---

## Per-Currency Probability

Each currency has an exact probability function in `packages/engine/src/probability.ts`, returning an
`f64` in `[0,1]`:

| Currency | What it does | Probability of the target outcome |
|----------|--------------|-----------------------------------|
| **Transmutation** | white → magic, +1 mod | `w(target) / Σ w(addable on the whole item)` |
| **Augmentation** | magic, +1 mod | over the pool minus the existing mod's family/side |
| **Regal** | magic → rare, +1 mod | like augmentation, on the rare pool |
| **Exalted** | rare, +1 mod into an open slot | `w(target) / Σ w(addable)`; a Sinistral/Dextral omen restricts the pool to one side |
| **Chaos** | remove one random mod, add one (PoE2) | `P(remove hits a non-target) × P(add lands target)` |
| **Annulment** | remove one random mod | `1 / (#mods)` that it removes the named one (omen-constrained variants supported) |
| **Alchemy** | white → rare with 4 random mods | probability the 4 draws include the chosen targets (an *opener*) |
| **Essence** | forces a specific mod | deterministic for the forced mod; the rest roll normally |
| **Desecration** | boss/desecrated pool add | over the desecrated pool |

Every function honors family exclusion, item-level gates, and tier floors described above.

---

## Evaluating a Plan

A **plan** is an ordered list of `PlanStep`s (`packages/engine/src/plan.ts`). To evaluate it:

1. Start from an `ItemState` (a white base via `whiteItem`, or an item you already own).
2. For each step, compute its exact probability *in the current state* (`stepProbability`), then apply
   the step to advance the state (`applyStep`) as if it succeeded.
3. The plan's overall success is the **product** of the per-step probabilities; each step also reports
   its own probability.

```
P(plan) = Π_k  P(step_k | state after steps 1..k-1)
```

`evaluatePlan(data, base, level, steps)` runs from white; `evaluatePlanFrom(data, startState, steps)`
runs from any state (this powers the from-item flow). Because state is threaded through, the engine
naturally accounts for how earlier mods shrink later pools via family exclusion.

---

## Expected-Cost Model

Beyond probability, plans are ranked by **expected cost** in exalt-equivalents (prices from
`prices.json`). Many PoE2 currencies destroy progress on a miss (a bad Regal, an Exalt that rolls the
wrong mod), so you retry from an earlier state. The model used is **restart-on-first-failure**:

```
E = ( Σ_k  c_k · S_{k-1} ) / S_n
```

where `c_k` is step *k*'s orb price, `S_k` is the cumulative success probability through step *k*
(`S_0 = 1` from white), and `S_n` is the plan's overall success. This charges each step for how often
you reach it and divides by how often the whole plan lands — the standard closed form for "keep
retrying until it works." Implemented in `packages/optimizer/src/cost.ts`.

---

## The Pareto Optimizer

`optimizePareto(data, prices, base, targets, opts)` (`packages/optimizer/src/optimize.ts`) turns a set
of target mods/tiers into ranked plans:

1. **Generate candidate sequences.** Enumerate sensible ways to reach the targets — the order to add
   mods, which currency fills each slot (transmute/augment/regal/exalt, essences for essence-only
   mods, alchemy as a 4-mod opener), and whether to spend an omen to constrain a side. Illegal shapes
   (too many mods, wrong side count, off-pool mods, family clashes) are pruned up front by
   `validate.ts`.
2. **Evaluate each analytically.** Every candidate is scored with `evaluatePlan` (exact probability)
   and `planExpectedCost` (expected cost).
3. **Keep the Pareto frontier.** A plan is kept only if **no other plan is both cheaper *and* at least
   as likely**. The result is the trade-off curve from *cheapest* to *surest*, not a single "best"
   answer — the user chooses where on the curve they want to sit.

The frontier, plus how many plans were evaluated and the currency depth explored, is returned as a
`ParetoResult`. The facade (`src/lib/engine.ts`) maps it to the UI shape and renders it in
`FrontierView.tsx`.

---

## From an Existing Item

The engine also plans from an item you already hold (`optimizeFromItem` / the facade's
`optimizeItem`). Two modes:

- **Per-use odds** (`currencyActions`) — for an item in hand, the *exact single-orb* probability of
  each applicable currency's outcome. It deliberately reports per-use odds, **not** a total budget:
  currencies that change the item on a miss (chaos rerolls, annul removes a random mod) make the true
  cost depend on your retry strategy.
- **From-item planner** — multi-step plans to a target, starting from the item's current mods, using a
  **reset-to-your-item** cost model: on a failure you restart from *your item* (keeping its good mods),
  the CoE-style approximation `E = (Σ c_k·S_{k-1}) / S_n` with `S_0` = the starting item. It is not a
  full chaos-spam Markov model; see [validation.md](validation.md).

---

## Monte-Carlo Validation

The analytic engine is checked against a seeded Monte-Carlo simulator (`simulate.ts`,
`mulberry32` PRNG): run a plan tens of thousands of times, count successes and per-step rates, and
confirm they match the exact numbers within tolerance. Used in tests only, never in the hot path.
Mechanics with no Java-era counterpart (chaos, alchemy, existing-item) are validated this way and
cross-checked against [craftofexile.com/?game=poe2](https://craftofexile.com/?game=poe2); divergences
are logged in [validation.md](validation.md). The ported mechanics are additionally anchored to frozen
golden fixtures via the differential tests.

---

## Worked Example

Target: **Bow** with **T1 `#% increased Physical Damage`** (prefix) and **T2 `#% increased Attack
Speed`** (suffix), item level 82.

1. **Transmutation** on the white bow — chance it rolls the T1 phys prefix is `w(T1 phys) / Σ w(all
   addable mods at ilvl 82)`.
2. **Regal** to go rare and add a second mod, or **Augment**-then-**Regal**, etc. — each ordering is a
   distinct candidate; the phys prefix already on the item removes its family from later pools.
3. **Exalted** to add the attack-speed suffix (optionally with a **Dextral** omen to force the suffix
   side, raising that step's odds at the cost of the omen).

Each candidate's overall probability is the product of its steps; its expected cost uses the
restart-on-failure formula. The optimizer returns the frontier — perhaps a cheap low-odds plan
(raw exalt slam) and a pricier high-odds plan (omen-constrained) — and the UI shows both so you can
pick your risk/cost point.
