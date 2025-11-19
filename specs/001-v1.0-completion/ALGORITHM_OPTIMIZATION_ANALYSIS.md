# Algorithm Optimization Analysis

**Date**: 2025-11-19  
**Issue**: Algorithm finding paths with probability 10¹⁰x worse than optimal  
**Test Case**: 6-modifier weapon craft (3 prefixes, 3 suffixes)

## Executive Summary

The beam search algorithm is finding extremely suboptimal crafting paths due to a **state-based heuristic that ignores path probability**. The current scoring function only considers *what modifiers are present*, not *how likely the path is to succeed*.

**Test Results**:
- Expected optimal probability: ~5.6×10⁻⁴ (0.056%)
- Algorithm found probability: 1.35×10⁻¹⁴ (0.0000000000014%)
- **Performance gap: 41,374,408,024× worse** (41 billion times)

## Root Cause Analysis

### Current Heuristic Design

**File**: `Crafting_Algorithm.java` → `heuristic()` method  
**Scoring Logic**:
```java
score = (matched_desired_mods × 1000) + (relevant_tag_matches × 250)
```

**What it considers**:
- ✅ How many desired modifiers are currently on the item
- ✅ How many relevant tags match on non-desired modifiers
- ✅ Penalizes having too many tags (>1 over desired)

**What it IGNORES**:
- ❌ **Cumulative probability** of the path taken to reach this state
- ❌ **Path length** (more steps = exponentially worse probability)
- ❌ **Step quality** (100% success vs 25-50% gambles)
- ❌ **Replacement cost** (replacing already-obtained desired mods)
- ❌ **Future flexibility** (keeping slots open for high-probability additions)

### Why This Matters

Probabilities **multiply** along a path:
- Path A: 1.0 × 1.0 × 0.5 = **0.5** (50%)
- Path B: 0.5 × 0.5 × 0.5 = **0.125** (12.5%)
- Path C: 0.33 × 0.33 × 0.25 = **0.027** (2.7%)

**Current behavior**: All three paths score identically if they end with the same modifiers, even though Path A is **18.5× better** than Path C.

## Test Case Comparison

### User's Optimal Path (Manual Strategy)

```
1. Transmutation → Get '% increased Physical Damage' (~10%)
2. Essence → Add 'Adds Physical Damage' T3 (100%)
3. Perfect Essence of Electricity → Add 'Extra Lightning' (100%)
   → Now have 3 prefixes complete ✓
4. Exalted Orb #1 → Add random suffix (~15%)
5. Exalted Orb #2 → Add random suffix (~15%)
   → Now have 3 prefixes + 2 random suffixes
6. Perfect Essence + Suffix Omen → Replace suffix with desired (100%)
7. Perfect Essence + Suffix Omen → Replace suffix with desired (50%)
8. Desecrated → Add/replace final suffix (50%)

Combined probability: 0.10 × 1.0 × 1.0 × 0.15 × 0.15 × 1.0 × 0.5 × 0.5 
                    = 5.625×10⁻⁴ (0.056%)
```

**Key insights**:
- Uses essences to **ADD** all prefixes first (100% success each)
- Fills suffix slots with cheap exalts (low cost, disposable)
- Then **replaces** suffixes with Perfect Essence + Omen
- Minimizes number of gambles (only exalts and final replacements)
- 8 steps total

### Algorithm's Found Path

```
1. Transmutation → '% increased Physical Damage' (0%)
2. Augmentation → '% increased Attack Speed' (0%)
3. Essence → Add 'Adds Physical Damage' (100%)
4. Desecrated → Add 'Cost Efficiency' [unwanted] (33%)
5. Essence → REPLACE with 'Extra Fire' [wrong element] (50%)
6. Desecrated → Add 'Cost Efficiency' [unwanted] (33%)
7. Essence → REPLACE with 'Onslaught' [correct] (33%)
8. Essence → REPLACE with 'Attack Skills' [correct] (33%)
9. Desecrated → Add 'Lightning Penetration' (50%)
10. Essence → REPLACE with 'Extra Lightning' [finally] (25%)

Combined probability: 1.35×10⁻¹⁴
```

**Problems**:
- Uses Desecrated to add unwanted modifiers (wasted steps)
- Replaces essence-added mod in step 5 (extra Fire → Lightning later)
- Multiple low-probability replacements (25%, 33%, 50%)
- 10 steps instead of 8 (each step multiplies probability)
- Doesn't prioritize completing prefixes before moving to suffixes

## Why the Algorithm Makes Poor Choices

### Scenario 1: Essence Timing

**Option A** (optimal): Use essence to ADD prefix when slot is empty (100%)  
**Option B** (suboptimal): Fill slot with transmutation, then REPLACE with essence (0% × 50% = 0%)

**Current heuristic scoring**: Both options score the same if they end with the desired prefix!

The algorithm doesn't see that Option A is **infinitely better** (100% vs 0%).

### Scenario 2: Path Length

**Option A**: 3 steps with probabilities [1.0, 1.0, 0.5] = **0.5** (50%)  
**Option B**: 5 steps with probabilities [0.5, 1.0, 1.0, 0.5, 0.5] = **0.125** (12.5%)

**Current heuristic scoring**: If both end with same mods, they score identically.

The algorithm doesn't penalize longer paths, even though Option A is **4× better**.

### Scenario 3: Replacement vs Addition

**Current item**: Has 2 desired prefixes + 1 wrong prefix  
**Option A**: Essence with prefix omen → Replace wrong prefix (50% to improve)  
**Option B**: Essence with suffix omen → Add desired suffix (100% success)

**Current heuristic**: Prefers Option A (gets prefix closer to complete)  
**Optimal choice**: Option B (100% guaranteed progress)

The algorithm doesn't factor in success probability when ranking candidates.

## Proposed Solutions

### Solution 1: Probability-Weighted Scoring (Recommended)

Modify heuristic to include cumulative path probability:

```java
public static double heuristic(Crafting_Item item, ...) {
    double baseScore = calculateCurrentStateScore(item, desiredMods, ...);
    double pathProbability = item.getCumulativeProbability();
    
    // Combine state quality with path probability
    // Higher probability paths get exponentially higher scores
    return baseScore * Math.pow(pathProbability, 0.5);  // Square root dampens effect
}
```

**Benefits**:
- ✅ Directly optimizes for what we care about (success probability)
- ✅ Minimal code changes (add probability tracking to Crafting_Candidate)
- ✅ Automatically prefers shorter paths (fewer probability multiplications)
- ✅ Naturally avoids risky replacements when safe additions exist

**Risks**:
- May require tuning the exponent (0.5 in example) to balance exploration
- Very low probability paths might get pruned too early

### Solution 2: Path Length Penalty

Add explicit penalty for longer paths:

```java
public static double heuristic(Crafting_Item item, ...) {
    double baseScore = calculateCurrentStateScore(item, desiredMods, ...);
    int pathLength = item.modifierHistory.size();
    
    // Penalize longer paths
    double lengthPenalty = Math.pow(0.95, pathLength - 6);  // Exponential decay after 6 steps
    
    return baseScore * lengthPenalty;
}
```

**Benefits**:
- ✅ Simple to implement
- ✅ Encourages efficient paths
- ✅ Doesn't require tracking probabilities

**Risks**:
- ❌ Doesn't directly optimize for probability
- ❌ Arbitrary penalty factor needs tuning
- ❌ Might miss optimal paths that happen to be longer

### Solution 3: Multi-Objective Scoring

Create composite score with weighted factors:

```java
public static double heuristic(Crafting_Item item, ...) {
    double stateScore = calculateCurrentStateScore(item, desiredMods, ...);
    double probScore = item.getCumulativeProbability() * 10000;  // Scale up
    double lengthScore = 1000 / (1 + item.modifierHistory.size());
    
    // Weighted combination
    return (stateScore * 0.5) + (probScore * 0.3) + (lengthScore * 0.2);
}
```

**Benefits**:
- ✅ Balances multiple objectives
- ✅ Tunable via weights
- ✅ Can incorporate domain knowledge

**Risks**:
- ❌ Complex to tune (3+ weights to balance)
- ❌ Weights may need adjustment per item type/scenario
- ❌ More code complexity

## Recommended Implementation

**Phase 1** (Immediate): Implement Solution 1 (Probability-Weighted Scoring)

1. Add cumulative probability tracking to `Crafting_Candidate`:
   ```java
   private double cumulativeProbability = 1.0;
   
   public void updateProbability(double stepProbability) {
       this.cumulativeProbability *= stepProbability;
   }
   ```

2. Update all currency `apply()` methods to track step probability
3. Modify heuristic to include probability factor:
   ```java
   return baseScore * Math.pow(item.getCumulativeProbability(), 0.3);
   ```
4. Test with TestOptimalPath.java - verify algorithm finds better path

**Phase 2** (Validation): Compare with manual optimal path

1. Run TestOptimalPath.java again
2. Target: Algorithm should find path within 10× of optimal
3. Tune probability exponent (0.3 ± 0.2) to balance exploration vs exploitation

**Phase 3** (Regression Testing): Ensure no negative impact

1. Run existing test suite
2. Compare results on known crafting scenarios
3. Verify memory usage remains within limits (Constitution §I)
4. Update BeamSearchConfig with new tuning parameters

## Impact Assessment

### Algorithm Integrity Checklist (AC-3.*)

- **AC-3.1** (Perfect Essence logic): ✅ Already correct, just poorly timed
- **AC-3.2** (Omen interaction): ✅ Working correctly
- **AC-3.3** (Probability calculation): ⚠️  **Calculated correctly but not USED in scoring**
- **AC-3.4** (Path optimization): ❌ **CRITICAL BUG** - This issue

### Performance Impact

- Probability tracking: O(1) per step (single multiplication)
- Heuristic calculation: Adds one Math.pow() call per candidate
- Memory: Negligible (one double per candidate)
- **Expected**: <1% performance overhead

### User-Visible Changes

- **Before**: Algorithm suggests paths with ~10⁻¹⁴ probability
- **After**: Algorithm should find paths with ~10⁻⁴ probability
- **Improvement**: **10¹⁰× better recommendations** (10 billion times)

## Test Plan

### Unit Tests

```java
@Test
public void testProbabilityWeightedScoring() {
    // Create two candidates with same mods but different probabilities
    Crafting_Candidate highProb = createCandidateWithProbability(0.5);
    Crafting_Candidate lowProb = createCandidateWithProbability(0.01);
    
    double scoreHigh = heuristic(highProb, ...);
    double scoreLow = heuristic(lowProb, ...);
    
    // High probability path should score significantly better
    assertTrue(scoreHigh > scoreLow * 2);
}
```

### Integration Tests

1. **TestOptimalPath.java**: Verify algorithm finds path close to user's manual strategy
2. **TestAlgo.java**: Verify 6-modifier scenario finds path >10⁻⁶ probability
3. **Memory test**: Ensure probability tracking doesn't break CandidatePool

### Regression Tests

- Run full test suite against existing scenarios
- Compare recommendations before/after (should improve or stay similar)
- Verify no pathological cases (algorithm stuck, infinite loops, etc.)

## Related Issues

- **ADR-002** (Scoring weights): May need to revise weight recommendations
- **Memory optimization** (Constitution §I): Probability tracking is lightweight
- **AC-4.* checklist** (Heuristic edge cases): This fixes a major edge case

## References

- Test output: `TestOptimalPath.java` (11/19/2025)
- Algorithm: `Crafting_Algorithm.java`, lines 346-382 (`heuristic()` method)
- Scoring utility: `Heuristic_Util.java`, lines 31-64 (`calculateAffixScore()`)
- Configuration: `BeamSearchConfig.java` (scoring weights 1000/250)

---

**Conclusion**: The current heuristic is fundamentally flawed for path optimization because it scores **states** rather than **paths**. By incorporating cumulative probability into scoring, the algorithm will naturally prefer high-probability paths, shorter routes, and efficient strategies - exactly what expert players use.
