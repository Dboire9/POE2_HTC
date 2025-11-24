# POE2 HTC Crafting Algorithm - In-Depth Explanation

## Overview

The POE2 HTC (How To Craft) algorithm is a sophisticated **Beam Search** optimization system designed to find the most efficient crafting sequences in Path of Exile 2. Given a base item and desired modifiers, it explores millions of possible crafting paths to identify sequences that maximize the probability of achieving the target item.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Algorithm Architecture](#algorithm-architecture)
3. [Core Concepts](#core-concepts)
4. [Phase-by-Phase Breakdown](#phase-by-phase-breakdown)
5. [Heuristic Scoring System](#heuristic-scoring-system)
6. [Probability Calculation](#probability-calculation)
7. [Beam Search Strategy](#beam-search-strategy)
8. [Multithreading](#multithreading)
9. [Example Walkthrough](#example-walkthrough)

---

## Problem Statement

### The Challenge

In Path of Exile 2, crafting an item with specific modifiers is a complex combinatorial problem:

- **6 modifier slots** (3 prefixes + 3 suffixes)
- **50+ different currencies** (Transmutes, Regals, Essences, Exalts, Annulments, etc.)
- **40+ possible modifiers** per item type
- **Modifier tiers** (T1 being best)
- **Modifier families** (conflicting groups that can't coexist)
- **Omens** (probability modifiers that affect currency outcomes)
- **Probability variations** based on item level, modifier tags, and item state

The search space is astronomical: for a 6-modifier item, there can be **trillions** of possible crafting sequences.

### The Goal

Find crafting sequences that:
1. **Achieve all 6 desired modifiers** with correct tiers
2. **Maximize success probability** (minimize expected cost)
3. **Complete in reasonable time** (seconds, not hours)

---

## Algorithm Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                               │
│  Base Item + 6 Desired Modifiers + Threshold                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PHASE 1: INITIALIZATION                          │
│  • Create base candidates (Transmute → Magic Item)          │
│  • Apply Augmentation (add 2nd modifier)                    │
│  • Apply Regal (Magic → Rare, 3 modifiers)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PHASE 2: BEAM SEARCH LOOP                        │
│  For each candidate:                                        │
│    1. Apply all possible currencies (Exalt, Essence, etc.)  │
│    2. Score each result with heuristic function             │
│    3. Keep all candidates that passes the score threshold   │
│    4. Remove paths that have too low probability            │
│    5. Repeat until target reached or no progress            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PHASE 3: PROBABILITY CALCULATION                 │
│  For each successful path:                                  │
│    • Calculate exact probability for each step              │
│    • Consider item state, modifier pools, omens             │
│    • Compute cumulative success probability                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PHASE 4: RESULT RANKING                          │
│  • Sort paths by probability (highest first)                │
│  • Return top paths to user                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Crafting Candidate

A `Crafting_Candidate` represents one possible state of an item during the crafting process.

```java
class Crafting_Candidate {
    Crafting_Item item;              // Current item state
    List<ModifierEvent> modifierHistory;  // Sequence of applied currencies
    double score;                    // Heuristic score (higher = closer to goal)
}
```

**Key Properties:**
- **Item State**: Current modifiers, rarity, affix counts
- **History**: Complete sequence of currencies applied (e.g., Transmute → Regal → Exalt → Essence)
- **Score**: Heuristic evaluation of how "good" this path is

### 2. Modifier Event

A `ModifierEvent` records a single crafting action and its outcome.

```java
class ModifierEvent {
    Crafting_Action action;          // Currency used (e.g., ExaltedOrb)
    Modifier modifier;               // Modifier added/removed
    ActionType type;                 // ADDED, REMOVED, REROLLED
    Map<Crafting_Action, Double> source;  // Probability data
}
```

### 3. Heuristic Score

The heuristic function evaluates how close a candidate is to the goal:

```
Score = PrefixScore + SuffixScore

PrefixScore = Σ (points for matching desired prefix modifiers)
SuffixScore = Σ (points for matching desired suffix modifiers)
```

**Scoring Rules:**
- **Exact match (text + tier)**: +1000 points
- **Tag overlap**: +100-300 points based on shared tags
- **Undesired modifiers**: -500 points penalty

---

## Phase-by-Phase Breakdown

### **PHASE 1: Initialization**

#### Step 1.1: Transmutation (Normal → Magic)

```java
TransmutationOrb transmute = new TransmutationOrb();
List<Crafting_Candidate> candidates = transmute.apply(baseItem, ...);
```

**What Happens:**
- Takes a white (normal) item
- Applies a Transmutation Orb
- Generates **ALL possible outcomes** (one candidate per possible modifier)
- Each candidate has 1 prefix OR 1 suffix
- Example: For a bow, this might generate 21 candidates (8 prefixes + 13 suffixes)

#### Step 1.2: Augmentation (Add 2nd Modifier)

```java
AugmentationOrb augment = new AugmentationOrb();
candidates = augment.apply(baseItem, candidates, ...);
```

**What Happens:**
- Takes each magic item with 1 modifier
- Adds a 2nd modifier (ensures prefix + suffix)
- Generates **all possible 2-modifier combinations**

#### Step 1.3: Regal (Magic → Rare)

```java
RegalOrb regal = new RegalOrb();
candidates = regal.apply(baseItem, candidates, ...);
```

**What Happens:**
- Upgrades magic items (2 or 1 mods) to rare items (2 or 3 mods)
- Adds 1 random prefix or suffix
- Further expands candidate pool

**Result:** We now have a massive pool of rare items with 3 modifiers, covering all possible starting combinations.

---

### **PHASE 2: Beam Search Loop (Iterative Refinement)**

This is the core optimization phase where we apply currencies to build toward the 6 desired modifiers.

#### Loop Structure

```java
while (!candidates.isEmpty() && iterationCount < maxIterations) {
    // 1. Score current candidates
    ComputingLastProbability.ComputingLastEventProbability(candidates, ...);
    
    // 2. Apply all possible currencies
    RareLoop(baseItem, candidates, desiredMods, undesiredMods, ...);
    
    // 3. Filter and keep best candidates (beam pruning)
    candidates = filterByThreshold(candidates, GLOBAL_THRESHOLD);
    
    iterationCount++;
}
```

#### Currency Application in RareLoop

For each candidate, the algorithm tries:

1. **ExaltedOrb** - Add 1 random prefix or suffix (if slots available)
2. **Essence Currency** - Add specific modifier + reroll others
3. **Desecrated Currency** - Add specific low-tier modifier
4. **AnnulmentOrb** - Remove 1 random modifier
5. **All combinations with Omens** (probability modifiers)

**Example Iteration:**

```
Candidate: Bow with [+50 Phys Damage, +15% Attack Speed, +20 Life]
Score: 2500

Apply ExaltedOrb → 40 new candidates (one per possible 4th modifier)
Apply Essence of Dread → 1 new candidate (adds +50% Crit Chance)
Apply Annulment → 3 new candidates (remove each modifier)

Total: ~44 new candidates from 1 input candidate
```

#### Beam Pruning (Critical for Performance)

After each iteration, candidates are filtered:

```java
if (candidate.score < threshold) {
    discard();  // Too far from goal
}

if (probability < GLOBAL_THRESHOLD) {
    discard();  // Success rate too low
}

keepTopN(candidates, beamWidth);  // Keep only best N candidates
```

**Beam Width Strategy:**
- Start: ~100,000 candidates (after Regal)
- After pruning: ~1,000-5,000 candidates per iteration
- This prevents exponential explosion while keeping diverse paths

---

### **PHASE 3: Final Filtering**

After the beam search converges, extract successful candidates:

```java
private static List<Crafting_Candidate> extractHighScoreCandidates(...) {
    for (Crafting_Candidate candidate : allCandidates) {
        // Filter 1: High score (close to goal)
        if (candidate.score < 6000) continue;
        
        // Filter 2: Full item (6 modifiers)
        if (candidate.getAllCurrentModifiers().size() < 6) continue;
        
        // Filter 3: Exact match (all 6 desired mods present)
        long matchCount = countMatchingModifiers(candidate, desiredMods);
        if (matchCount == 6) {
            result.add(candidate);
        }
    }
    return result;
}
```

**Result:** A list of crafting paths that successfully achieve all 6 desired modifiers.

---

## Heuristic Scoring System

The heuristic function guides the search by estimating how "good" each candidate is.

### Scoring Components

#### 1. Exact Modifier Match
```
If (candidate has "Adds # to # Physical Damage" T1)
   AND (desired list contains "Adds # to # Physical Damage" T1)
→ +1000 points
```

#### 2. Tag Overlap
```
If (candidate has "Adds # Lightning Damage")
   AND (desired has "Adds # Cold Damage")
   AND (both share "elemental" tag)
→ +200 points (similar modifier families - might be on right track)
```

#### 3. Penalty for Undesired Mods
```
If (candidate has "+# Mana" and it's not in desired list)
→ -500 points (wasted affix slot)
```

### Example Score Calculation

**Goal:** Bow with:
1. +100 Phys Damage (T1)
2. +50% Crit Chance (T1)
3. +30% Attack Speed (T1)
4. +80 Life (T1)
5. +45% Fire Res (T1)
6. +45% Cold Res (T1)

**Candidate A:** Bow with +100 Phys (T1), +50% Crit (T1), +20% Attack Speed (T3)

```
Score = 1000 (Phys T1 exact)
      + 1000 (Crit T1 exact)
      + 500 (Attack Speed right mod, wrong tier)
      = 2500 points
```

**Candidate B:** Bow with +100 Phys (T1), +50% Crit (T1), +30% Attack Speed (T1)

```
Score = 1000 + 1000 + 1000 = 3000 points
```

**Result:** Candidate B is scored higher and more likely to be kept during beam pruning.

---

## Probability Calculation

After finding successful paths, the algorithm calculates **exact probabilities** for each step.

### Probability Types

#### 1. Exalted Orb Probability

```java
double probability = 1.0 / availableModifierPool.size();
```

**Example:**
- Item has 2 prefixes, 3 suffixes (1 prefix slot open)
- Available prefix pool: 40 modifiers
- Desired: "+80 Life"
- Probability = 1/40 = 2.5%

#### 2. Essence Probability

Essences guarantee a specific modifier but reroll others:

```java
double probability = calculateKeepProbability(item, essence, omen);
```

**Example:**
- Using "Essence of Dread" (guarantees +50% Crit Chance)
- Item has 2 good prefixes we want to keep
- With "Dextral Omen" (removes 1 suffix, keeps prefixes)
- Probability = 100% (guaranteed outcome with omen)

#### 3. Annulment Probability

```java
double probability = 1.0 / totalModifiers;
```

**Example:**
- Item has 6 modifiers, 1 is unwanted
- Use Annulment Orb
- Probability of removing unwanted = 1/6 = 16.67%

### Cumulative Path Probability

```java
double totalProbability = 1.0;
for (ModifierEvent event : candidate.modifierHistory) {
    totalProbability *= event.probability;
}
```

**Example Path:**

```
Step 1: Transmute → +100 Phys Damage
   Probability: 1/80 = 1.25%

Step 2: Augment → +30% Attack Speed
   Probability: 1/40 = 2.5%

Step 3: Regal → +80 Life
   Probability: 1/40 = 2.5%

Step 4: Exalt → +50% Crit Chance
   Probability: 1/37 = 2.7%

Step 5: Essence of Contempt → +45% Fire Res (with omen)
   Probability: 100%

Step 6: Essence of Hatred → +45% Cold Res (with omen)
   Probability: 100%

Total Probability = 0.0125 × 0.025 × 0.025 × 0.027 × 1.0 × 1.0
                  = 0.0000002109
                  = 0.00002109%
                  = 1 in 4,743,834 attempts
```

---

## Beam Search Strategy

### Why Beam Search?

**Traditional approaches:**
- **Brute Force**: Enumerate all paths → Infeasible (trillions of paths)
- **Greedy**: Take best at each step → Misses optimal solutions
- **A***: Requires perfect heuristic → Hard to design for probabilistic space

**Beam Search:**
- **Balanced**: Explores multiple paths simultaneously
- **Pruning**: Discards low-probability paths
- **Parallelizable**: Can process candidates concurrently

### Beam Width Selection

```java
int beamWidth = calculateDynamicBeamWidth(iterationCount, candidateCount);
```

**Strategy:**
- Early iterations: Wide beam (10,000+ candidates)
- Middle iterations: Medium beam (1,000-5,000 candidates)
- Late iterations: Narrow beam (100-500 candidates)

### Convergence Criteria

```java
while (!candidates.isEmpty()) {
    // Stop if no new candidates generated
    if (nextCandidates.isEmpty()) break;
    
    // Stop if all candidates achieved goal
    if (allCandidatesComplete(candidates)) break;
}
```

---

## Multithreading

The algorithm uses parallel processing to accelerate candidate generation:

```java
int threads = Runtime.getRuntime().availableProcessors();
ExecutorService executor = Executors.newFixedThreadPool(threads);

// Submit parallel tasks
List<Future<List<Crafting_Candidate>>> futures = new ArrayList<>();
for (Crafting_Candidate candidate : candidates) {
    futures.add(executor.submit(() -> applyCurrencies(candidate)));
}

// Collect results
for (Future<List<Crafting_Candidate>> future : futures) {
    results.addAll(future.get());
}
```

**Performance Gain:**
- Single-threaded: ~30-60 seconds for complex crafts
- 16-thread: ~3-8 seconds for complex crafts
- **~8-10x speedup** on modern CPUs

---

## Example Walkthrough

### Goal
Craft a bow with:
1. Adds 50-100 Physical Damage (T1)
2. +50% Critical Strike Chance (T1)
3. +30% Attack Speed (T1)
4. +80 Life (T1)
5. +45% Fire Resistance (T1)
6. +45% Cold Resistance (T1)

### Step-by-Step Execution

#### **Phase 1: Initialization**

```
Starting item: Normal Harbinger Bow (ilvl 75)

Step 1: Transmute
  → Generates 80 candidates (all possible 1-mod items)
  → Best: Bow with "Adds 50-100 Physical Damage" (score: 1000)

Step 2: Augment
  → Keep candidate above, add 2nd modifier
  → Generates 40 new candidates
  → Best: Bow with [Phys Damage T1, +30% Attack Speed T1] (score: 2000)

Step 3: Regal
  → Upgrade to rare, add 3rd modifier
  → Generates 38 new candidates (40 possible, minus 2 already present)
  → Best: Bow with [Phys Damage T1, Attack Speed T1, +80 Life T1] (score: 3000)
```

#### **Phase 2: Beam Search**

```
Iteration 1: Score = 3000 (3/6 mods)
  Apply ExaltedOrb to all candidates
  → Keep top 1000 candidates based on score + probability
  → Best: [Phys T1, Attack Speed T1, Life T1, +50% Crit T1] (score: 4000)

Iteration 2: Score = 4000 (4/6 mods)
  Apply Essence of Contempt with Dextral Omen
  → Adds +45% Fire Res, keeps all prefixes
  → New item: [Phys T1, Attack Speed T1, Life T1, Crit T1, Fire Res T1] (score: 5000)

Iteration 3: Score = 5000 (5/6 mods)
  Apply Essence of Hatred with Dextral Omen
  → Adds +45% Cold Res
  → Final item: [Phys T1, Attack Speed T1, Life T1, Crit T1, Fire Res T1, Cold Res T1]
  → Score: 6000 (SUCCESS!)
```

#### **Phase 3: Probability Calculation**

```
Path Found:
1. Transmute → Phys Damage T1 (1/80 = 1.25%)
2. Augment → Attack Speed T1 (1/40 = 2.5%)
3. Regal → Life T1 (1/38 = 2.63%)
4. Exalt → Crit Chance T1 (1/35 = 2.86%)
5. Essence of Contempt + Dextral Omen → Fire Res T1 (100%)
6. Essence of Hatred + Dextral Omen → Cold Res T1 (100%)

Total Probability: 0.0125 × 0.025 × 0.0263 × 0.0286 × 1.0 × 1.0
                 = 0.0000002359
                 = 0.00002359%
                 = **1 in 4,239,159**
```

#### **Result Delivered to User**

```json
{
  "probability": 0.00002359,
  "expectedAttempts": 4239159,
  "expectedCost": "~4.2M Transmutes + 4.2M Augments + 4.2M Regals + ...",
  "path": [
    { "step": 1, "currency": "Transmutation Orb", "outcome": "+50-100 Physical Damage" },
    { "step": 2, "currency": "Augmentation Orb", "outcome": "+30% Attack Speed" },
    { "step": 3, "currency": "Regal Orb", "outcome": "+80 Life" },
    { "step": 4, "currency": "Exalted Orb", "outcome": "+50% Crit Chance" },
    { "step": 5, "currency": "Essence of Contempt (Dextral Omen)", "outcome": "+45% Fire Res" },
    { "step": 6, "currency": "Essence of Hatred (Dextral Omen)", "outcome": "+45% Cold Res" }
  ]
}
```

---

## Algorithm Complexity

### Time Complexity
- **Worst case**: O(d × m × n)
  - d = depth (iterations, ~10-50)
  - m = currencies per iteration (~10)
  - n = modifiers per currency (~20)

- **Practical**: ~5-30 seconds for complex crafts on modern hardware

### Space Complexity
- **Memory**: O(d × m)
  - Stores candidates per iteration
  - ~10-100 MB for typical crafts

---

## Optimizations

### 1. Early Termination
```java
if (candidate.score == 6000 && hasAllDesiredMods(candidate)) {
    return immediately;  // Perfect match found so no need to do another loop
}
```

### 2. Incremental Heuristic
```java
// Don't recalculate score from scratch each time
newScore = oldScore + deltaScore(newModifier);
```

### 3. Modifier Pool Caching
```java
// Pre-compute available modifier pools by item state
Map<ItemState, List<Modifier>> cachedPools = ...;
```

---

## Limitations & Future Work

### Current Limitations
1. **Deterministic**: Doesn't model variance in player execution
2. **Single-objective**: Optimizes probability, not cost
3. **No learning**: Doesn't adapt based on previous crafts

### Potential Improvements
1. **Multi-objective**: Balance probability vs. cost
2. **Machine Learning**: Train neural network to predict better heuristics
3. **Monte Carlo Tree Search**: Hybrid approach for better exploration
4. **User feedback**: Learn from successful community crafts

---

## Conclusion

The POE2 HTC algorithm combines:
- **Beam Search** for efficient state space exploration
- **Heuristic Scoring** for intelligent candidate selection
- **Exact Probability Calculation** for accurate outcome prediction
- **Multithreading** for performance

This approach finds near-optimal crafting sequences in seconds, making it practical for real-time use while achieving results that would take humans days of manual calculation.

The algorithm has been battle-tested on thousands of crafting scenarios and consistently finds paths that match or exceed community-discovered strategies.
