# Algorithm Optimization - Implementation Summary

**Date**: 2025-11-19  
**Status**: Path length penalty implemented but insufficient
**Next Steps**: Requires actual probability tracking in currency apply() methods

## What Was Done

### 1. Analysis (✅ COMPLETE)
- Created comprehensive analysis document: `ALGORITHM_OPTIMIZATION_ANALYSIS.md`
- Identified root cause: Heuristic scores states, not paths
- Documented 41-billion-times performance gap
- Created TestOptimalPath.java to validate hypothesis

### 2. Solution Attempts

#### Attempt 1: Probability Tracking (❌ BLOCKED)
**Goal**: Track cumulative probability in Crafting_Candidate  
**Implementation**:
- Added `cumulativeProbability` field to Crafting_Candidate
- Added `updateProbability()` and `getCumulativeProbability()` methods
- Modified `copy()`, `copyFrom()`, and `reset()` to handle probability

**Why it failed**:
All currency classes set `actionMap.put(this, 0.0)` - probabilities are calculated **after** the search completes, not during exploration. To fix this properly requires:
1. Calculate actual step probabilities in each currency's `apply()` method
2. Modify 10+ currency classes (TransmutationOrb, AugmentationOrb, ExaltedOrb, Essence_currency, Desecrated_currency, etc.)
3. Handle complex cases: Perfect Essence with omens (50%, 33%, 25% depending on slots)
4. Risk introducing bugs in probability calculations

**Verdict**: Too invasive for immediate fix, requires careful design

#### Attempt 2: Path Length Penalty (⚠️ INSUFFICIENT)
**Goal**: Penalize longer paths indirectly  
**Implementation**:
```java
int extraSteps = Math.max(0, pathLength - 6);
double efficiencyMultiplier = 1.0 / (1.0 + 0.15 * extraSteps);
score *= efficiencyMultiplier;
```

**Penalties applied**:
- +2 extra steps: 24% penalty
- +4 extra steps: 44% penalty  
- +6 extra steps: 57% penalty

**Why it's insufficient**:
- Algorithm now explores MORE paths (times out in 60 seconds)
- Penalty not strong enough to overcome high scores from matching mods
- Doesn't distinguish between high-probability steps (100%) and gambles (25%)
- Still fundamentally scoring states, not path quality

**Current status**: Code committed but algorithm performance degraded

## Test Results

### Before Optimization
```
Algorithm found: 1.35×10⁻¹⁴ probability
Path: 10 steps with multiple low-probability gambles
Runtime: ~12 seconds
```

### After Path Length Penalty
```
Runtime: >60 seconds (timeout)
Status: Algorithm exploring many more paths but not converging
```

## Root Cause Analysis (Updated)

The fundamental problem is **architectural**:

1. **Probabilities calculated post-facto**: `Probability_Analyzer` calculates probabilities AFTER search completes
2. **Action map always 0.0**: All currency classes set `actionMap.put(this, 0.0)`
3. **Heuristic sees no probability data**: Cannot factor probabilities into scoring
4. **Path length penalty too weak**: Cannot overcome 1000-point bonus for matching desired mod

### Why Path Length Penalty Fails

Example scenario:
- **Path A** (optimal): 8 steps, gets 6 desired mods → Score: 6000 × 0.77 = **4620**
- **Path B** (suboptimal): 10 steps, gets 6 desired mods → Score: 6000 × 0.63 = **3780**

Path A scores higher, but:
- Both paths explore 1000s of intermediate states
- Algorithm can't tell which 8-step path will succeed until it reaches end
- Explores all possible 8-10 step combinations
- With no probability guidance, explores exponentially many paths

## What Actually Needs to Happen

###  Proper Solution: Probability-Aware Beam Search

**Phase 1**: Add probability calculation to currency classes
```java
// Example: ExaltedOrb.java
public List<Crafting_Candidate> apply(...) {
    Map<Crafting_Action, Double> actionMap = new HashMap<>();
    
    // Calculate actual probability for this specific situation
    int emptySlots = countEmptySlots(item);
    int totalMods = item.base.getAllowedMods().size();
    double probability = (double) emptySlots / totalMods;
    
    actionMap.put(this, probability);  // NOT 0.0!
    
    // ... rest of apply logic
}
```

**Phase 2**: Update all currency classes
- TransmutationOrb: Calculate based on mod pool size
- AugmentationOrb: Calculate based on remaining slots
- ExaltedOrb: Calculate based on empty slots and mod pool
- Essence_currency: Handle Perfect Essence omen probabilities (100%, 50%, 33%, 25%)
- Desecrated_currency: Calculate based on mod pool and slot availability
- AnnulmentOrb: Calculate removal probability
- RegalOrb: Similar to Augmentation

**Phase 3**: Update heuristic to use probability
```java
if (item instanceof Crafting_Candidate) {
    Crafting_Candidate candidate = (Crafting_Candidate) item;
    double cumulativeProb = candidate.getCumulativeProbability();
    
    // Even small exponent (0.2) gives strong signal
    // 10× better probability → 1.58× better score
    // 100× better probability → 2.51× better score
    double probabilityBonus = Math.pow(cumulativeProb, 0.2);
    score *= probabilityBonus;
}
```

**Phase 4**: Test and tune
- Verify algorithm finds paths within 10× of optimal
- Tune exponent (0.1 to 0.4 range)
- Ensure memory usage stays within Constitution §I limits

## Recommendation

**Do NOT merge path length penalty to main branch**. Instead:

1. **Revert to baseline** (remove path length penalty)
2. **Create feature branch** for probability tracking
3. **Implement Phase 1-4** systematically
4. **Test thoroughly** before merging

**Estimated effort**:
- Phase 1-2: 4-6 hours (modify 10+ currency classes)
- Phase 3: 30 minutes (heuristic update, already drafted)
- Phase 4: 2-3 hours (testing and tuning)
- **Total**: 1-2 days of focused work

## Files Modified (Current State)

### Crafting_Candidate.java
- ✅ Added `cumulativeProbability` field
- ✅ Added `updateProbability()` and `getCumulativeProbability()` methods
- ✅ Updated `copy()`, `copyFrom()`, `reset()` methods
- **Status**: Safe to keep, no side effects

### Crafting_Algorithm.java
- ⚠️  Added path length penalty to `heuristic()`
- **Status**: REVERT - causes timeouts

### Crafting_Action.java  
- ❌ Briefly added ModifierEvent import (reverted)
- **Status**: Clean

## Key Insights

1. **Quick fixes don't work** - this is a deep architectural issue
2. **Probability data exists** - it's just calculated at the wrong time
3. **Solution is clear** - move probability calculation earlier in pipeline
4. **Risk is manageable** - probability formulas are well-understood
5. **Testing is crucial** - must verify probabilities match Probability_Analyzer results

## Next Steps (When Ready to Implement)

1. Create feature branch: `feature/probability-aware-heuristic`
2. Start with ExaltedOrb (simplest case)
3. Write unit test comparing probability calculation to Probability_Analyzer
4. Once validated, apply pattern to other currencies
5. Update heuristic with probability bonus
6. Run TestOptimalPath.java - should find path within 10× of optimal
7. Merge to main

---

**Conclusion**: The analysis was correct, but a proper fix requires systematic work across multiple files. The path length penalty was a valiant attempt but insufficient. Recommend proceeding with full probability tracking implementation when time permits.
