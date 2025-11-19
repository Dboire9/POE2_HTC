# Specification: Probability-Aware Heuristic Optimization

**Feature ID**: 002-probability-heuristic  
**Created**: November 19, 2025  
**Status**: Draft  
**Priority**: P1 (Critical - v1.0 Blocker)  
**Constitutional Compliance**: Algorithm Integrity §I

## Executive Summary

Upgrade the beam search heuristic to incorporate cumulative path probability into scoring decisions, enabling the algorithm to find crafting paths that are 10¹⁰× more optimal than current results while preserving algorithm structure and maintaining performance standards.

## Problem Statement

### Current Issue
The crafting algorithm finds paths with probability **1.35×10⁻¹⁴** when paths with probability **5.6×10⁻⁴** are achievable - a **41 billion times performance gap**. This critically undermines the core value proposition of finding optimal crafting strategies.

### Root Cause
The beam search heuristic scores **item states** (which modifiers are present) but ignores **path probabilities** (likelihood of achieving that state):

```java
// Current heuristic (state-based only)
score = (desired_mods_matched × 1000) + (relevant_tags × 250)
// Problem: Two paths with same end state score identically
// regardless of probability difference (e.g., 50% vs 0.001%)
```

**Why this happens**:
- All currency classes set `actionMap.put(this, 0.0)` during beam search
- Actual probabilities calculated **after** search by `Probability_Analyzer`
- Heuristic has no probability data to factor into candidate rankings

### Impact
- **User Trust**: Manual strategies outperform algorithm by 10¹⁰×
- **Recommendation Quality**: Algorithm suggests extremely unlikely paths
- **v1.0 Readiness**: Critical bug affecting AC-3.4 (path optimization) checklist

## User Scenarios

### Primary Scenario: 6-Modifier Rare Bow
**Actor**: POE2 player seeking optimal crafting strategy  
**Goal**: Craft bow with 6 specific modifiers at highest probability

**Current Experience** (Broken):
1. User selects 6 desired modifiers
2. Algorithm explores paths, scores by state only
3. Returns path with 1.35×10⁻¹⁴ probability (effectively impossible)
4. User realizes manual strategy has 5.6×10⁻⁴ probability
5. **Outcome**: User loses trust in algorithm recommendations

**Expected Experience** (Fixed):
1. User selects 6 desired modifiers
2. Algorithm explores paths, scores by state AND probability
3. Returns path with ≥5.6×10⁻⁵ probability (within 10× of optimal)
4. User validates path matches intuition about high-probability moves
5. **Outcome**: User trusts and follows algorithm recommendation

### Test Case Validation
**Reference**: `TestOptimalPath.java`

**User's Manual Strategy** (Optimal):
```
1. Transmutation → Get base prefix (~10%)
2. Essence → Add physical damage T3 (100%)
3. Perfect Essence → Add lightning damage (100%)
   → 3 prefixes complete
4. Exalted #1 → Add random suffix (~15%)
5. Exalted #2 → Add random suffix (~15%)
6. Perfect Essence + Omen → Replace suffix (100%)
7. Perfect Essence + Omen → Replace suffix (50%)
8. Desecrated → Final suffix (50%)

Combined: 0.10 × 1.0 × 1.0 × 0.15 × 0.15 × 1.0 × 0.5 × 0.5 = 5.6×10⁻⁴
```

**Algorithm's Current Path** (Broken):
```
10 steps with multiple 25-33% gambles
Combined: 1.35×10⁻¹⁴
```

**Success Criteria**:
- Algorithm finds path with probability ≥5.6×10⁻⁵ (within 10× of optimal)
- Path length ≤10 steps
- Computation time ≤60 seconds
- Memory usage stays within 50K candidate pool limit

## Functional Requirements

### FR-1: Probability Tracking in Currency Classes
**Priority**: P1 (Critical)  
**Constitutional Compliance**: ✅ Algorithm Integrity (additive enhancement)

Each currency's `apply()` method MUST calculate and store actual step probability:

```java
// Instead of:
actionMap.put(this, 0.0);

// Implement:
double stepProbability = calculateActualProbability(item, modifiers);
actionMap.put(this, stepProbability);
```

**Affected Classes** (~10 files):
- `TransmutationOrb`: Probability = 1.0 / modifier_pool_size
- `AugmentationOrb`: Probability = 1.0 / remaining_slot_compatible_mods
- `ExaltedOrb`: Probability = empty_slots / total_available_mods
- `Essence_currency`: Complex (see FR-1.1)
- `Desecrated_currency`: Similar to ExaltedOrb with Desecrated pool
- `AnnulmentOrb`: Probability = 1.0 / current_modifier_count
- `RegalOrb`: Similar to Augmentation

**Acceptance Criteria**:
- Each currency calculates probability based on item state
- Probabilities stored in actionMap during apply()
- Probability values match Probability_Analyzer post-facto calculations (±0.01%)
- Unit tests verify probability formulas for each currency

### FR-1.1: Perfect Essence Omen Probabilities
**Priority**: P1 (Critical)  
**Complexity**: High

Perfect Essence with omens has variable probability based on slot availability:

```java
if (perfect_essence_with_omen) {
    if (target_slots_empty) {
        probability = 1.0;  // Add to empty slot
    } else if (target_slots == 1) {
        probability = 1.0;  // Replace only option
    } else if (target_slots == 2) {
        probability = 0.5;  // Replace one of two
    } else if (target_slots == 3) {
        probability = 0.33; // Replace one of three
    }
}
```

**Acceptance Criteria**:
- Handles all omen types (Dextral/Sinistral for prefix/suffix targeting)
- Correctly calculates probability for each slot configuration
- Matches observed POE2 game mechanics
- Integration test validates against known scenarios

### FR-2: Cumulative Probability Tracking
**Priority**: P1 (Critical)  
**Status**: Field already added to `Crafting_Candidate`

Track multiplicative probability along each path:

```java
// Already implemented in Crafting_Candidate:
public double cumulativeProbability = 1.0;

public void updateProbability(double stepProbability) {
    this.cumulativeProbability *= stepProbability;
}
```

**Integration Points**:
- Called after each currency apply() with extracted stepProbability
- Copied during candidate deep copy operations
- Reset to 1.0 when candidate returned to pool

**Acceptance Criteria**:
- Probability tracked through entire search
- Correctly handles edge cases (0.0, 1.0, very small values)
- Memory overhead ≤8 bytes per candidate (one double)
- Integration test verifies end-to-end tracking

### FR-3: Probability-Weighted Heuristic
**Priority**: P1 (Critical)  
**Constitutional Compliance**: ✅ Algorithm Integrity (heuristic enhancement allowed)

Incorporate cumulative probability into heuristic scoring:

```java
public static double heuristic(Crafting_Item item, ..., BeamSearchConfig config) {
    // Existing state-based scoring (PRESERVED)
    double score = 0;
    score += calculateAffixScore(prefixes, ...);
    score += calculateAffixScore(suffixes, ...);
    
    // NEW: Probability bonus
    if (item instanceof Crafting_Candidate) {
        Crafting_Candidate candidate = (Crafting_Candidate) item;
        double cumulativeProb = candidate.getCumulativeProbability();
        
        // Dampen with exponent to balance exploration vs exploitation
        // Exponent range: 0.2 to 0.4 (tunable)
        double probabilityBonus = Math.pow(cumulativeProb, 0.3);
        
        score *= probabilityBonus;
    }
    
    return score;
}
```

**Rationale for Exponent**:
- **0.3 (recommended)**: 10× better probability → 2× better score
- **0.2 (more exploration)**: 10× better probability → 1.58× better score  
- **0.4 (more exploitation)**: 10× better probability → 2.5× better score

**Acceptance Criteria**:
- Heuristic includes probability factor
- Exponent configurable via BeamSearchConfig
- Default exponent = 0.3 (subject to tuning)
- State-based scoring preserved (1000/250 weights)
- Unit test verifies scoring formula

### FR-4: Probability Validation
**Priority**: P2 (High)

Validate that calculated probabilities match Probability_Analyzer:

```java
// Unit test pattern
@Test
public void testProbabilityConsistency() {
    // 1. Run currency apply() during search
    double searchTimeProbability = candidate.getCumulativeProbability();
    
    // 2. Run Probability_Analyzer post-facto
    double analyzedProbability = Probability_Analyzer.Analyze(paths).finalPercentage();
    
    // 3. Verify match within tolerance
    assertEquals(searchTimeProbability, analyzedProbability, 0.01);
}
```

**Acceptance Criteria**:
- Probabilities match within 1% tolerance
- Test covers all currency types
- Test covers omen interactions
- Regression test for complex scenarios

## Success Criteria

### Technical Metrics
- ✅ **Optimization Goal**: Algorithm finds paths ≥10⁻⁵ probability (within 10× of optimal 5.6×10⁻⁴)
- ✅ **Performance**: Computation time ≤60 seconds for 6-modifier items
- ✅ **Memory**: Stays within 50K candidate pool limit
- ✅ **Accuracy**: Probabilities match Probability_Analyzer within 1%

### User Experience Metrics
- ✅ **TestOptimalPath.java**: Shows "✓ Algorithm found near-optimal or better path"
- ✅ **Path Quality**: Recommended paths use high-probability moves (essences, omens)
- ✅ **Intuition Match**: Paths align with expert player strategies

### Constitutional Compliance
- ✅ **Algorithm Structure**: Beam search logic unchanged
- ✅ **Scoring Weights**: 1000/250 preserved
- ✅ **Beam Width**: Logic unchanged
- ✅ **Memory Efficiency**: CandidatePool usage unchanged

## Key Entities

### Crafting_Candidate
```java
public class Crafting_Candidate extends Crafting_Item {
    // NEW: Probability tracking
    public double cumulativeProbability = 1.0;
    
    public void updateProbability(double stepProbability) {
        this.cumulativeProbability *= stepProbability;
    }
    
    public double getCumulativeProbability() {
        return this.cumulativeProbability;
    }
}
```

### Currency Action Map
```java
// Before (broken):
Map<Crafting_Action, Double> actionMap = new HashMap<>();
actionMap.put(this, 0.0);  // ← Always zero!

// After (fixed):
Map<Crafting_Action, Double> actionMap = new HashMap<>();
double probability = calculateStepProbability(item, modifiers);
actionMap.put(this, probability);  // ← Actual probability
```

### Heuristic Scoring
```java
// State-based score (preserved)
double stateScore = (desiredMods × 1000) + (tags × 250);

// Probability bonus (new)
double probabilityBonus = Math.pow(cumulativeProbability, 0.3);

// Combined score
double finalScore = stateScore × probabilityBonus;
```

## Assumptions

1. **Probability Formulas**: Basic probability calculations (uniform distribution over mod pools) are sufficient for accurate results
2. **Exponent Tuning**: Default exponent of 0.3 provides good balance (subject to empirical validation)
3. **Memory Impact**: Adding one double per candidate (8 bytes) is negligible
4. **Performance**: Probability calculations add <1% computational overhead
5. **Correctness**: Current Probability_Analyzer formulas are correct reference

## Dependencies

### Internal
- `Crafting_Candidate`: Already has probability field (FR-2)
- `Crafting_Algorithm`: Heuristic modification (FR-3)
- All currency classes: Probability calculation (FR-1)
- `Probability_Analyzer`: Validation reference (FR-4)

### External
- None (self-contained within Java backend)

### Testing
- `TestOptimalPath.java`: Primary validation
- Unit tests for each currency probability calculation
- Integration tests for end-to-end probability tracking

## Out of Scope

### Explicitly Excluded
- ❌ **Beam Width Changes**: Constitution §I forbids architectural changes
- ❌ **Scoring Weight Changes**: ADR-002 weights (1000/250) must be preserved
- ❌ **Search Structure Changes**: Beam search logic must remain intact
- ❌ **New POE2 Mechanics**: Focus only on fixing existing algorithm
- ❌ **UI Changes**: Backend-only optimization

### Future Enhancements (Post-v1.0)
- Advanced probability models (non-uniform distributions)
- Adaptive exponent based on search progress
- Multi-objective optimization (probability + currency cost)

## Risks & Mitigation

### Risk 1: Probability Calculation Complexity
**Severity**: Medium  
**Likelihood**: High  
**Impact**: Implementation takes longer than estimated

**Mitigation**:
- Start with simplest currency (ExaltedOrb)
- Validate against Probability_Analyzer before proceeding
- Use unit tests to catch formula errors early
- Document probability calculation for each currency

### Risk 2: Exponent Tuning Required
**Severity**: Low  
**Likelihood**: Medium  
**Impact**: Default exponent doesn't balance exploration/exploitation

**Mitigation**:
- Make exponent configurable via BeamSearchConfig
- Test with values [0.2, 0.25, 0.3, 0.35, 0.4]
- Run TestOptimalPath.java to measure impact
- Document tuning process in ADR

### Risk 3: Performance Degradation
**Severity**: Medium  
**Likelihood**: Low  
**Impact**: Probability calculations slow down search

**Mitigation**:
- Profile before/after with complex scenarios
- Optimize probability calculation hot paths
- Use caching if needed (e.g., mod pool sizes)
- Target <1% computational overhead

### Risk 4: Regression in Other Scenarios
**Severity**: High  
**Likelihood**: Low  
**Impact**: Fix improves 6-mod case but breaks simpler crafts

**Mitigation**:
- Run full test suite before/after
- Create regression tests for known good scenarios
- Validate that simpler crafts still work (1-3 mods)
- Monitor memory usage across scenarios

## Notes

### Investigation Context
This specification builds on comprehensive investigation documented in:
- `ALGORITHM_OPTIMIZATION_ANALYSIS.md`: Root cause analysis
- `OPTIMIZATION_IMPLEMENTATION_SUMMARY.md`: Failed attempt learnings
- `INVESTIGATION_SUMMARY.md`: Executive summary

### Key Insights from Investigation
1. **Path length penalty failed**: Made algorithm explore exponentially more paths
2. **Probability tracking infrastructure exists**: Just not connected to heuristic
3. **Solution is well-understood**: Clear implementation path identified
4. **Validation harness ready**: TestOptimalPath.java provides clear pass/fail

### Constitutional Compliance Verification
✅ **§I Algorithm Integrity**: Preserved
- Core beam search structure unchanged
- Heuristic enhancement (explicitly allowed)
- Scoring weights preserved (1000/250)
- Beam width logic unchanged

✅ **§II Performance First**: Maintained
- Target computation time ≤60s (existing standard)
- Memory within 50K pool limit (existing standard)
- Probability calculations lightweight (<1% overhead)

✅ **§III Code Quality**: Enhanced
- Clear separation: probability calculation vs heuristic
- Unit tests for all currency classes
- Integration tests for end-to-end flow
- Documentation of probability formulas

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-19 | Initial | Created specification based on investigation |

