# Investigation Summary: Algorithm Optimization Issue

**Date**: 2025-11-19  
**Investigator**: GitHub Copilot  
**Issue**: Algorithm finding paths 10¹⁰× worse than user's manual optimal strategy  
**Status**: Investigated, root cause identified, solution designed (not yet implemented)

## Executive Summary

A critical algorithm quality issue was discovered and thoroughly investigated. The beam search heuristic scores **states** (how many desired mods are present) rather than **paths** (probability of achieving that state). This causes the algorithm to find extremely suboptimal crafting strategies.

**Impact**: Algorithm recommendations are **41 billion times worse** than optimal in tested scenario  
**Cause**: Heuristic cannot see probability data (calculated post-facto)  
**Solution**: Move probability calculation into currency apply() methods  
**Status**: Solution designed but not implemented (requires 1-2 days effort)

## Investigation Process

### Discovery
User tested 6-modifier weapon craft and observed:
- User's manual strategy: ~5.6×10⁻⁴ probability (0.056%)
- Algorithm's recommendation: 1.35×10⁻¹⁴ probability
- **Gap**: 4.1×10¹⁰ times worse (41 billion)

### Analysis
Created comprehensive analysis in `ALGORITHM_OPTIMIZATION_ANALYSIS.md`:
- Documented user's optimal path (8 steps, mostly 100% moves)
- Documented algorithm's path (10 steps, multiple 25-50% gambles)
- Identified root cause: state-based scoring vs. path-based optimization
- Proposed three solution approaches

### Solution Attempts

**Attempt 1: Probability Tracking**  
Added `cumulativeProbability` to Crafting_Candidate  
❌ Blocked: All currencies set probability to 0.0, calculated post-search

**Attempt 2: Path Length Penalty**  
Penalized longer paths indirectly (15% per extra step)  
❌ Failed: Algorithm explores exponentially more paths, times out

### Root Cause
```
Currency.apply() → actionMap.put(this, 0.0)  // ← Problem!
                                               ← Probabilities not calculated
                                               ← until Probability_Analyzer runs
                                               ← after search completes
Heuristic       → Cannot factor probability  
                → Scores only current state
                → Ignores path taken
```

## Deliverables

### Documentation
1. **ALGORITHM_OPTIMIZATION_ANALYSIS.md** (6 pages)
   - Comprehensive root cause analysis
   - Test case comparison (user vs algorithm paths)
   - Three proposed solutions with trade-offs
   - Implementation recommendations

2. **OPTIMIZATION_IMPLEMENTATION_SUMMARY.md** (4 pages)
   - Attempt 1 details (probability tracking)
   - Attempt 2 details (path length penalty)
   - Why each approach failed
   - Proper solution design with code examples

3. **This document** (summary for quick reference)

### Code Artifacts
1. **TestOptimalPath.java** (NEW)
   - Validates user's optimal path calculation
   - Compares to algorithm result
   - Prints warning when gap exceeds 10×
   - **Status**: Committed, ready for regression testing

2. **Crafting_Candidate.java** (MODIFIED)
   - Added `cumulativeProbability` field
   - Added `updateProbability()` and `getCumulativeProbability()` methods
   - Updated copy/reset methods
   - **Status**: Harmless (field unused but ready for future)

3. **Crafting_Algorithm.java** (REVERTED)
   - Temporarily added path length penalty
   - Reverted due to performance degradation
   - **Status**: Back to baseline

## Solution Design (Not Yet Implemented)

### Phase 1: Add Probability Calculation to Currencies
```java
// Example: ExaltedOrb.java
public List<Crafting_Candidate> apply(...) {
    // Calculate actual probability
    int emptySlots = countEmptySlots(item);
    int totalMods = item.base.getAllowedMods().size();
    double probability = (double) emptySlots / totalMods;
    
    Map<Crafting_Action, Double> actionMap = new HashMap<>();
    actionMap.put(this, probability);  // NOT 0.0!
    
    // Continue with existing logic...
}
```

**Files to modify**: (~10 currency classes)
- TransmutationOrb.java
- AugmentationOrb.java  
- ExaltedOrb.java
- Essence_currency.java (complex: handle Perfect Essence omen probabilities)
- Desecrated_currency.java
- AnnulmentOrb.java
- RegalOrb.java
- Others as needed

### Phase 2: Update Heuristic
```java
// Crafting_Algorithm.java heuristic() method
if (item instanceof Crafting_Candidate) {
    Crafting_Candidate candidate = (Crafting_Candidate) item;
    double cumulativeProb = candidate.getCumulativeProbability();
    
    // Cube root dampens effect while still providing strong signal
    // 10× better probability → 2.15× better score
    // 100× better probability → 4.64× better score
    double probabilityBonus = Math.pow(cumulativeProb, 0.33);
    score *= probabilityBonus;
}
```

### Phase 3: Test and Validate
1. Unit tests: Verify probability calculations match Probability_Analyzer
2. Integration test: Run TestOptimalPath.java
3. Target: Find paths within 10× of optimal
4. Tune exponent (0.2 to 0.4 range)

### Estimated Effort
- Phase 1: 4-6 hours (systematic currency updates)
- Phase 2: 30 minutes (heuristic already drafted)
- Phase 3: 2-3 hours (testing and tuning)
- **Total**: 1-2 focused workdays

## Recommendation

**DO NOT** attempt quick fixes. The investigation revealed this is an architectural issue requiring systematic work.

**Proper approach**:
1. Create feature branch: `feature/probability-aware-heuristic`
2. Implement Phase 1-3 systematically
3. Validate with TestOptimalPath.java before merging
4. Document any probability formula decisions in ADR

**Why this is important**:
- Core value proposition: Find optimal crafting paths
- Current: Recommendations are 10¹⁰× worse than manual strategies
- User trust depends on quality recommendations
- This is a **critical bug** for v1.0

## Impact on v1.0 Checklists

### Algorithm Integrity (AC-3.*)
- AC-3.3: Probability calculation ✅ (correct, just too late)
- AC-3.4: Path optimization ❌ **CRITICAL BUG** (this issue)

### Testing & Documentation (TD-*)
- TD-4.3: Algorithm validation ⚠️ (needs regression test)
- TD-4.4: Edge case testing ⚠️ (optimal path is edge case)

## Files Modified/Created

### New Files
- `specs/001-v1.0-completion/ALGORITHM_OPTIMIZATION_ANALYSIS.md`
- `specs/001-v1.0-completion/OPTIMIZATION_IMPLEMENTATION_SUMMARY.md`
- `specs/001-v1.0-completion/INVESTIGATION_SUMMARY.md` (this file)
- `src/main/java/core/Test/TestOptimalPath.java`

### Modified Files  
- `src/main/java/core/Crafting/Crafting_Candidate.java` (added probability field/methods)
- `src/main/java/core/Crafting/Crafting_Algorithm.java` (reverted to baseline)

### Status
- ✅ All documentation complete
- ✅ Test harness created
- ✅ Solution designed
- ❌ Solution not yet implemented
- ✅ Code at working baseline (no regressions)

## Next Steps (When Ready)

1. Review documentation with stakeholders
2. Prioritize implementation (v1.0 vs v1.1)
3. Create feature branch
4. Implement Phase 1-3
5. Validate with TestOptimalPath.java
6. Update checklists (AC-3.4, TD-4.3, TD-4.4)
7. Merge and deploy

---

**Conclusion**: A thorough investigation identified a critical algorithm quality issue. The root cause is well-understood, and a clear solution path exists. Implementation requires systematic work but is straightforward. The investigation deliverables provide all necessary context for future implementation.
