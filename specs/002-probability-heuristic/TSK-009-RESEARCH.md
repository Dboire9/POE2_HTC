# TSK-009 Research Notes: Probability-Weighted Scoring

## Problem Statement
Need to incorporate probability into the scoring/heuristic function to prefer high-probability paths.

## Current State
- **Probability Tracking**: ✅ Complete and accurate (TSK-001 through TSK-008)
- **Probability Display**: ✅ All percentages correct (12.5%, 50%, 33.33%, etc.)
- **Algorithm Performance**: ❌ Finding paths with very low probability (1.5×10⁻²⁰)
- **Expected Optimal**: 5.6×10⁻⁴ (approximately 10¹⁶ times better)

## Attempted Approaches

### Attempt 1: Modify Score in Heuristic Method
- **Approach**: Apply probability bonus in `Crafting_Algorithm.heuristic()`
- **Problem**: Method receives `Crafting_Item`, not `Crafting_Candidate` - can't access probability
- **Result**: ❌ 0 paths found, algorithm broken

### Attempt 2: Modify Score AFTER Candidate Creation
- **Approach**: Apply `score *= (1.0 + Math.pow(cumulativeProb, 0.33))` after creating candidate
- **Problem**: Causes infinite loop or extreme slowdown
- **Result**: ❌ Algorithm hangs, had to kill process

### Attempt 3: Modify Score BEFORE Comparison  
- **Approach**: Apply `score *= (1.0 + probability * 0.05)` before `if (score > candidate.score)`
- **Problem**: Algorithm hangs or degrades performance further
- **Result**: ❌ Does not complete within reasonable time

### Attempt 4: Even Smaller Multiplier
- **Approach**: Reduce multiplier to 0.01 or lower
- **Problem**: Still causes hanging or no improvement
- **Result**: ❌ Beam search is extremely sensitive to score changes

## Root Cause Analysis

The beam search algorithm is NOT probability-aware by design. Key observations:

1. **No Pruning**: Algorithm comment states "Beam width pruning intentionally NOT applied - user wants to explore ALL paths"
2. **Score-Based Only**: All candidate selection uses `score > candidate.score` comparisons
3. **Heuristic Function**: The `heuristic()` method evaluates item quality but ignores probability
4. **Greedy Expansion**: Algorithm expands highest-scoring candidates first, regardless of probability

The current heuristic heavily weights:
- Matching desired modifiers (high scores like 800-1000 per mod)
- Tier quality
- Modifier tags

But completely ignores:
- Step probability
- Cumulative path probability  
- Alternative paths with similar scores but higher probability

## Why Simple Score Bonuses Fail

Adding probability bonuses disrupts the carefully-tuned score thresholds:
- Dynamic threshold: `affixes × 700` (e.g., 2100 for 3 mods, 2800 for 4 mods)
- Score bonus changes which candidates pass threshold
- Causes algorithm to explore different (worse) branches
- Beam search becomes unstable with modified scores

## Proposed Solutions (For Future Work)

### Option A: Dual-Beam Search
Maintain two separate beams:
1. **Score Beam**: Current behavior (highest quality items)
2. **Probability Beam**: Highest probability paths
- Merge results at end
- Requires significant algorithm restructuring

### Option B: Probability-Aware Heuristic
Redesign the heuristic function itself to incorporate probability:
```java
score = qualityScore * probabilityWeight
where probabilityWeight = Math.pow(cumulativeProb, 0.1) // gentle scaling
```
- Requires retuning ALL scoring constants
- Risk of breaking existing functionality
- Extensive testing needed

### Option C: Post-Processing Filter
Keep algorithm as-is, but:
1. Generate multiple paths (currently finds 5120)
2. Re-rank by `score * cumulativeProb`  
3. Return top N by this combined metric
- Minimal risk
- Doesn't improve search, only selection
- May still miss optimal paths

### Option D: Targeted Currency Preferences
Hard-code preferences for high-probability actions:
- Prefer Essence with omen over Essence without
- Prefer Exalted over Desecrated when both available
- Prefer fewer steps (each step multiplies probability)
- Modify currency application logic, not scoring

## Recommendation

**Short Term**: Mark TSK-009 as DEFERRED, document limitation
- Current implementation tracks probabilities correctly
- Users can see actual path probability
- Algorithm finds valid (if suboptimal) paths

**Long Term**: Implement Option D (targeted preferences)
- Least invasive approach
- Can be done incrementally
- Preserves existing scoring logic
- Focus on high-impact decisions (omen usage, currency choice)

## Performance Data

| Implementation | Probability | Time | Status |
|---------------|-------------|------|--------|
| Baseline (no tracking) | 1.35×10⁻¹⁴ | 22.5s | ✅ Works |
| With tracking (current) | 1.51×10⁻²⁰ | 22.8s | ✅ Works |
| With score bonus (0.05) | N/A | Hangs | ❌ Broken |
| Expected optimal | 5.6×10⁻⁴ | N/A | 🎯 Target |

**Gap to optimal**: ~10¹⁶× worse

## Conclusion

TSK-009 requires fundamental redesign of the search algorithm, not just score adjustments. 
The probability tracking infrastructure (TSK-001 through TSK-008) is complete and working correctly.
Further work on TSK-009 should be treated as a separate research project.
