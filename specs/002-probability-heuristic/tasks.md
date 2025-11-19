# Tasks - Probability-Aware Heuristic Implementation

**Feature**: 002-probability-heuristic  
**Goal**: Upgrade beam search to find paths within 10× of optimal probability  
**Success Criteria**: TestOptimalPath.java passes with algorithm finding paths ≥5.6×10⁻⁵ probability

---

## Phase 1: Foundation - Probability Calculation Infrastructure

### TSK-001: Add Probability Calculation to TransmutationOrb

**Priority**: P1 (Critical - Foundation)  
**Effort**: 2 hours  
**Dependencies**: None

#### Description
Implement accurate step probability calculation in TransmutationOrb.apply() method. Calculate probability based on mod pool size and desired modifiers. This establishes the pattern for other currency classes.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/TransmutationOrb.java`
- **Formula**: `probability = 1.0 / allowedModifiers.size()`
- **Pattern**: Calculate before creating candidates, store in actionMap
- **Constitution Compliance**: No algorithm structure changes (currency logic only)

#### Acceptance Criteria
- [ ] TransmutationOrb calculates probability per modifier
- [ ] Probability stored in actionMap (not hardcoded 0.0)
- [ ] Formula: `1.0 / total_allowed_mods` for each affix type
- [ ] Unit test validates probability matches expected calculation
- [ ] Integration test: probability flows to Crafting_Candidate

#### Testing Requirements
- **Unit Tests**: Probability calculation for various mod pool sizes
- **Edge Cases**: Empty mod pool, single modifier
- **Integration**: Verify actionMap contains non-zero probability

#### Implementation Notes
```java
// Calculate actual probability for this transmutation
List<Modifier> allowedMods = item.base.getNormalAllowedPrefixes();
double probability = allowedMods.isEmpty() ? 0.0 : 1.0 / allowedMods.size();

Map<Crafting_Action, Double> actionMap = new HashMap<>();
actionMap.put(this, probability);  // NOT 0.0!
```

---

### TSK-002: Add Probability Calculation to AugmentationOrb

**Priority**: P1 (Critical - Foundation)  
**Effort**: 2 hours  
**Dependencies**: TSK-001 (soft - follows same pattern)

#### Description
Implement step probability in AugmentationOrb.apply(). Similar to TransmutationOrb but considers existing modifiers on item.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/AugmentationOrb.java`
- **Formula**: `probability = 1.0 / available_mods_for_empty_slot`
- **Constraint**: Only adds to empty affix slots
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Probability calculated based on remaining empty slots
- [ ] Returns 0.0 if no empty slots available
- [ ] Stored in actionMap with calculated value
- [ ] Unit tests validate probability for various item states
- [ ] Matches TransmutationOrb pattern

#### Testing Requirements
- **Unit Tests**: Probability with 0, 1, 2 existing mods
- **Edge Cases**: Item with full prefixes/suffixes
- **Integration**: Probability flows through candidate creation

---

### TSK-003: Add Probability Calculation to ExaltedOrb

**Priority**: P1 (Critical - Foundation)  
**Effort**: 3 hours  
**Dependencies**: TSK-001, TSK-002 (soft - follows pattern)

#### Description
Implement probability for ExaltedOrb considering mod pool filtering by item level, existing families, and affix slot availability.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/ExaltedOrb.java`
- **Formula**: `probability = empty_slots / total_eligible_mods`
- **Complexity**: Must filter by family conflicts and item level
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Probability accounts for empty affix slots (1-3 available)
- [ ] Formula: `(empty_prefix_slots + empty_suffix_slots) / eligible_mods.size()`
- [ ] Filters out existing modifier families
- [ ] Respects item level restrictions
- [ ] Unit tests for various slot configurations
- [ ] Integration test validates ~10-20% typical probability

#### Testing Requirements
- **Unit Tests**: 
  - Item with 0/3 prefixes, 0/3 suffixes → high probability
  - Item with 2/3 prefixes, 2/3 suffixes → lower probability
  - Item with family conflicts → reduced pool
- **Integration**: TestOptimalPath shows correct exalt probability

#### Implementation Notes
```java
// Count empty slots
int emptyPrefixSlots = 3 - item.getAllCurrentPrefixModifiers().size();
int emptySuffixSlots = 3 - item.getAllCurrentSuffixModifiers().size();
int totalEmptySlots = emptyPrefixSlots + emptySuffixSlots;

// Filter eligible mods (no family conflicts, item level OK)
List<Modifier> eligibleMods = filterByFamilyAndItemLevel(allMods, item);

double probability = totalEmptySlots > 0 && !eligibleMods.isEmpty() 
    ? (double) totalEmptySlots / eligibleMods.size() 
    : 0.0;
```

---

### TSK-004: Add Probability Calculation to Desecrated_currency

**Priority**: P1 (Critical - Foundation)  
**Effort**: 2.5 hours  
**Dependencies**: TSK-003 (soft - similar logic)

#### Description
Implement probability for Desecrated currency, accounting for corrupted mod pool and replacement vs addition logic.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/Desecrated_currency.java`
- **Formula**: Similar to ExaltedOrb but with corrupted mod pool
- **Behavior**: Can add or replace modifiers
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Probability calculated from corrupted mod pool
- [ ] Accounts for both addition and replacement scenarios
- [ ] Typical probability: 33-50% based on pool size
- [ ] Unit tests for add vs replace paths
- [ ] Integration test validates Desecrated probability in TestOptimalPath

#### Testing Requirements
- **Unit Tests**: Addition probability, replacement probability
- **Edge Cases**: Full item (must replace), empty slots (can add)
- **Integration**: Verify ~50% probability in optimal path

---

### TSK-005: Add Probability Calculation to Essence_currency (Complex)

**Priority**: P1 (Critical - Most Complex)  
**Effort**: 5 hours  
**Dependencies**: TSK-001 through TSK-004 (pattern established)

#### Description
Implement probability for Essence_currency with Perfect Essence + Omen combinations. This is the most complex currency due to multiple probability scenarios.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/Essence_currency.java`
- **Probabilities**:
  - Perfect Essence alone (ADD): 100% (1.0)
  - Perfect Essence + Omen, 3 slots full: 33.33% (1/3)
  - Perfect Essence + Omen, 2 slots full: 50% (1/2)
  - Perfect Essence + Omen, 1 slot full: 100% (1.0)
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Perfect Essence ADD (empty slot): probability = 1.0
- [ ] Perfect Essence REPLACE + Omen:
  - 3 filled slots → 0.3333 (1/3 chance to hit non-desired)
  - 2 filled slots → 0.5 (1/2 chance)
  - 1 filled slot → 1.0 (100% - replaces the only one)
- [ ] Handles prefix vs suffix omen correctly
- [ ] Unit tests for all 4 probability scenarios
- [ ] Integration test: TestOptimalPath essences show 100%, 50%, 33%

#### Testing Requirements
- **Unit Tests**:
  - ADD scenario (empty slot): 100%
  - REPLACE 3/3 with omen: 33.33%
  - REPLACE 2/3 with omen: 50%
  - REPLACE 1/3 with omen: 100%
- **Integration**: Verify probabilities in TestOptimalPath path display

#### Implementation Notes
```java
// Determine if ADD or REPLACE
boolean isAdd = (isPrefix && prefixCount < 3) || (isSuffix && suffixCount < 3);

if (isAdd) {
    probability = 1.0;  // Perfect Essence always adds to empty slot
} else if (hasOmen) {
    int filledSlots = isPrefix ? prefixCount : suffixCount;
    // Omen targets specific slot: probability = 1 / filled_slots
    probability = 1.0 / filledSlots;
} else {
    probability = 0.0;  // Can't replace without omen
}
```

---

### TSK-006: Add Probability Calculation to RegalOrb

**Priority**: P1 (Critical - Foundation)  
**Effort**: 2 hours  
**Dependencies**: TSK-003 (similar to ExaltedOrb)

#### Description
Implement probability for RegalOrb (magic to rare upgrade), similar logic to ExaltedOrb but for magic items.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/RegalOrb.java`
- **Formula**: Same as ExaltedOrb (adds random modifier)
- **Context**: Converts MAGIC → RARE rarity
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Probability formula matches ExaltedOrb pattern
- [ ] Only applies to MAGIC rarity items
- [ ] Accounts for existing modifiers on magic item (1-2)
- [ ] Unit tests validate probability calculation
- [ ] Integration test confirms rarity upgrade + probability

#### Testing Requirements
- **Unit Tests**: Magic item with 1 mod, magic item with 2 mods
- **Edge Cases**: Item already rare (should not apply)
- **Integration**: Regal probability flows to candidates

---

### TSK-007: Add Probability Calculation to AnnulmentOrb

**Priority**: P2 (High - Completeness)  
**Effort**: 2 hours  
**Dependencies**: None (independent)

#### Description
Implement probability for AnnulmentOrb (removes random modifier). Probability = 1 / total_modifiers.

#### Technical Specifications
- **Location**: `src/main/java/core/Currency/AnnulmentOrb.java`
- **Formula**: `probability = 1.0 / total_current_modifiers`
- **Behavior**: Removes one random modifier
- **Constitution Compliance**: Currency logic only

#### Acceptance Criteria
- [ ] Probability = 1 / total modifiers on item
- [ ] Returns 0.0 if item has no modifiers
- [ ] Unit tests for items with 1-6 modifiers
- [ ] Integration test validates annul probability

#### Testing Requirements
- **Unit Tests**: 1 mod (100%), 3 mods (33%), 6 mods (16.67%)
- **Edge Cases**: No modifiers (0%)
- **Integration**: Annul steps show correct probability

---

## Phase 2: Integration - Probability Tracking in Candidates

### TSK-008: Update Crafting_Action.evaluateAffixes to Track Probability

**Priority**: P1 (Critical - Integration Point)  
**Effort**: 3 hours  
**Dependencies**: TSK-001 through TSK-007 (needs probability in actionMap)

#### Description
Modify Crafting_Action.evaluateAffixes() to extract probability from actionMap and call candidate.updateProbability(). This connects currency probabilities to candidate tracking.

#### Technical Specifications
- **Location**: `src/main/java/core/Crafting/Crafting_Action.java`
- **Methods**: `evaluateAffixes()`, `evaluateAffixeswithAug()`, `CreateListAndEvaluateAffixes()`
- **Pattern**: After creating candidate, extract probability from last ModifierEvent
- **Constitution Compliance**: Plumbing only, no algorithm changes

#### Acceptance Criteria
- [ ] All three evaluate methods extract probability from actionMap
- [ ] Call `newCandidate.updateProbability(stepProbability)` for each candidate
- [ ] Handle edge case: probability = 0.0 (skip update)
- [ ] Unit tests verify probability flows to candidates
- [ ] Integration test: candidates have cumulative probability set

#### Testing Requirements
- **Unit Tests**: Mock currency with known probability, verify candidate updates
- **Integration**: Run simple 3-step craft, verify cumulative probability = p1 × p2 × p3
- **Edge Cases**: 0.0 probability, 1.0 probability

#### Implementation Notes
```java
// After creating newCandidate in evaluateAffixes()
if (!items.modifierHistory.isEmpty()) {
    ModifierEvent lastEvent = items.modifierHistory.get(items.modifierHistory.size() - 1);
    if (lastEvent.source != null && !lastEvent.source.isEmpty()) {
        double stepProbability = lastEvent.source.values().iterator().next();
        if (stepProbability > 0.0) {
            newCandidate.updateProbability(stepProbability);
        }
    }
}
```

---

### TSK-009: Update Crafting_Algorithm.heuristic() to Factor Probability

**Priority**: P1 (Critical - Core Change)  
**Effort**: 2 hours  
**Dependencies**: TSK-008 (candidates have probability)

#### Description
Modify heuristic() to multiply base score by probability bonus using cube root dampening: `score *= Math.pow(cumulativeProbability, 0.33)`.

#### Technical Specifications
- **Location**: `src/main/java/core/Crafting/Crafting_Algorithm.java`
- **Formula**: `score *= Math.pow(candidate.getCumulativeProbability(), 0.33)`
- **Exponent**: 0.33 (cube root) balances exploration vs exploitation
- **Constitution Compliance**: Heuristic modification allowed per Constitution §I

#### Acceptance Criteria
- [ ] Heuristic multiplies base score by probability factor
- [ ] Exponent = 0.33 (cube root)
- [ ] Only applies if item is Crafting_Candidate instance
- [ ] Gracefully handles probability = 0.0 (score remains unchanged or 0)
- [ ] Unit tests verify score boosting for high-probability paths
- [ ] Integration test: TestOptimalPath shows improved path selection

#### Testing Requirements
- **Unit Tests**:
  - High probability (0.5) → score boost ~1.26×
  - Medium probability (0.1) → score boost ~0.77×
  - Low probability (0.01) → score boost ~0.46×
- **Integration**: TestOptimalPath finds better path after change

#### Implementation Notes
```java
// At end of heuristic() method, before return
if (item instanceof Crafting_Candidate) {
    Crafting_Candidate candidate = (Crafting_Candidate) item;
    double cumulativeProb = candidate.getCumulativeProbability();
    
    if (cumulativeProb > 0.0) {
        // Cube root dampens effect: 10× prob → 2.15× score, 100× prob → 4.64× score
        double probabilityBonus = Math.pow(cumulativeProb, 0.33);
        score *= probabilityBonus;
    }
}
```

---

## Phase 3: Validation - Testing & Tuning

### TSK-010: Create Unit Tests for Probability Calculations

**Priority**: P1 (Critical - Quality Gate)  
**Effort**: 4 hours  
**Dependencies**: TSK-001 through TSK-007

#### Description
Comprehensive unit test suite validating all currency probability calculations match expected formulas.

#### Technical Specifications
- **Location**: `src/test/java/core/Currency/ProbabilityCalculationTest.java`
- **Framework**: JUnit 5
- **Coverage Target**: 95%+ for all currency probability logic
- **Constitution Compliance**: Testing only

#### Acceptance Criteria
- [ ] Test suite for each currency class (7 classes)
- [ ] Each test validates formula correctness
- [ ] Edge cases: empty pools, full items, family conflicts
- [ ] Test passes with 95%+ code coverage
- [ ] All tests pass in CI pipeline

#### Testing Requirements
- **TransmutationOrb**: Various mod pool sizes
- **AugmentationOrb**: 0-2 existing modifiers
- **ExaltedOrb**: Empty slots, family conflicts, item level
- **Desecrated**: Add vs replace scenarios
- **Essence**: All 4 omen probability cases
- **RegalOrb**: Magic item scenarios
- **AnnulmentOrb**: 1-6 modifiers

---

### TSK-011: Validate Probabilities Match Probability_Analyzer

**Priority**: P1 (Critical - Correctness Validation)  
**Effort**: 3 hours  
**Dependencies**: TSK-008, TSK-009

#### Description
Integration test ensuring probabilities calculated during beam search match post-facto Probability_Analyzer calculations. This validates correctness.

#### Technical Specifications
- **Location**: `src/test/java/core/Integration/ProbabilityConsistencyTest.java`
- **Approach**: Run beam search, extract candidate probabilities, compare to Probability_Analyzer
- **Tolerance**: ±0.1% variance allowed
- **Constitution Compliance**: Testing only

#### Acceptance Criteria
- [ ] Test runs full beam search on 3-modifier item
- [ ] Extracts cumulative probability from winning candidate
- [ ] Runs Probability_Analyzer on same candidate
- [ ] Probabilities match within 0.1% tolerance
- [ ] Test documents any discrepancies
- [ ] All edge cases pass (essences, omens, desecrated)

#### Testing Requirements
- **Simple Path**: Transmute → Aug → Essence (should be identical)
- **Complex Path**: Include Perfect Essence + Omen (50% scenario)
- **Edge Cases**: Paths with annulments, regals

---

### TSK-012: Run TestOptimalPath and Validate 10× Improvement

**Priority**: P1 (Critical - Success Criteria)  
**Effort**: 2 hours  
**Dependencies**: TSK-001 through TSK-011 (full implementation)

#### Description
Execute TestOptimalPath.java and verify algorithm finds path with probability ≥5.6×10⁻⁵ (within 10× of optimal 5.6×10⁻⁴).

#### Technical Specifications
- **Location**: `src/main/java/core/Test/TestOptimalPath.java` (existing)
- **Target**: Algorithm probability ≥ 5.6×10⁻⁵
- **Current**: 1.35×10⁻¹⁴ (must improve by ~10⁹×)
- **Constitution Compliance**: Testing only

#### Acceptance Criteria
- [ ] TestOptimalPath runs without errors
- [ ] Algorithm finds path with probability ≥ 5.6×10⁻⁵
- [ ] Performance: completes within 60 seconds
- [ ] Memory: stays within 50K candidate pool limit
- [ ] Output shows probability comparison and improvement factor
- [ ] Test passes consistently (3/3 runs)

#### Testing Requirements
- **Baseline**: Document current probability (1.35×10⁻¹⁴)
- **Target**: Achieve ≥5.6×10⁻⁵ (10× worse than optimal is acceptable)
- **Stretch**: Achieve ≥5.6×10⁻⁴ (match user's optimal path)
- **Regression**: Original TestAlgo.java still passes

---

### TSK-013: Tune Probability Exponent for Optimal Balance

**Priority**: P2 (High - Performance Optimization)  
**Effort**: 3 hours  
**Dependencies**: TSK-012 (baseline established)

#### Description
Experiment with probability exponent values (0.2 to 0.5) to find optimal balance between exploration and exploitation. Document findings in ADR.

#### Technical Specifications
- **Location**: `src/main/java/core/Crafting/Crafting_Algorithm.java` (heuristic method)
- **Parameter**: Exponent in `Math.pow(cumulativeProbability, exponent)`
- **Test Range**: 0.2, 0.25, 0.3, 0.33, 0.4, 0.5
- **Metrics**: Final probability, computation time, memory usage
- **Constitution Compliance**: Tuning only

#### Acceptance Criteria
- [ ] Test each exponent value (6 runs minimum)
- [ ] Document results: probability, time, memory for each
- [ ] Create graph showing exponent vs final probability
- [ ] Recommend optimal exponent with justification
- [ ] Update ADR-002 with tuning results
- [ ] Commit chosen exponent to codebase

#### Testing Requirements
- **Test Case**: TestOptimalPath.java (6-modifier bow)
- **Metrics Per Run**:
  - Final probability achieved
  - Computation time (ms)
  - Memory usage (heap)
  - Path length (steps)
- **Analysis**: Trade-off between exploration (low exponent) and exploitation (high exponent)

#### Implementation Notes
```java
// Make exponent configurable for testing
private static final double PROBABILITY_EXPONENT = 0.33;  // Tunable parameter

// In heuristic()
double probabilityBonus = Math.pow(cumulativeProb, PROBABILITY_EXPONENT);
```

**Expected Results**:
- Low exponent (0.2): More exploration, finds diverse paths
- Medium exponent (0.33): Balanced (cube root)
- High exponent (0.5): More exploitation, faster convergence

---

## Phase 4: Regression & Performance Testing

### TSK-014: Run Full Regression Test Suite

**Priority**: P1 (Critical - No Regressions)  
**Effort**: 2 hours  
**Dependencies**: TSK-012 (implementation complete)

#### Description
Execute all existing tests to ensure no regressions in probability calculations, path finding, or memory usage.

#### Technical Specifications
- **Location**: All `src/test/java/` directories
- **Command**: `mvn clean test`
- **Coverage**: All existing unit and integration tests
- **Constitution Compliance**: Testing only

#### Acceptance Criteria
- [ ] All existing tests pass (0 failures)
- [ ] No new compiler warnings introduced
- [ ] Code coverage remains ≥85%
- [ ] TestAlgo.java still passes (original test)
- [ ] No memory leaks detected in stress tests
- [ ] Performance within acceptable bounds (±10%)

#### Testing Requirements
- **Unit Tests**: All currency, crafting, algorithm tests
- **Integration Tests**: Full crafting scenarios
- **Performance Tests**: Computation time benchmarks
- **Memory Tests**: Heap usage under load

---

### TSK-015: Benchmark Performance Impact of Probability Tracking

**Priority**: P2 (High - Performance Validation)  
**Effort**: 3 hours  
**Dependencies**: TSK-014 (regression baseline)

#### Description
Measure performance overhead of probability tracking and heuristic modification. Ensure within acceptable bounds (<10% slowdown).

#### Technical Specifications
- **Metrics**: Computation time, heap usage, GC pressure
- **Test Cases**: Simple (3-mod), Medium (4-mod), Complex (6-mod)
- **Baseline**: Current implementation (pre-probability)
- **Constitution Compliance**: Performance monitoring only

#### Acceptance Criteria
- [ ] Benchmark suite measures before/after performance
- [ ] Computation time overhead <10%
- [ ] Memory overhead <5%
- [ ] GC time increase <10%
- [ ] Document results in performance report
- [ ] Identify any bottlenecks for future optimization

#### Testing Requirements
- **Test Cases**:
  - Simple: 3 modifiers, fast path
  - Medium: 4 modifiers, moderate complexity
  - Complex: 6 modifiers (TestOptimalPath scenario)
- **Metrics**:
  - Total computation time (ms)
  - Peak heap usage (MB)
  - GC time (ms)
  - Iterations performed

---

## Phase 5: Documentation & Cleanup

### TSK-016: Update ADR-002 with Probability Scoring

**Priority**: P2 (High - Documentation)  
**Effort**: 2 hours  
**Dependencies**: TSK-013 (tuning complete)

#### Description
Update Architecture Decision Record ADR-002 (Scoring Weights) to document probability factor addition, exponent choice, and rationale.

#### Technical Specifications
- **Location**: `specs/001-v1.0-completion/ADR-002-scoring-weights.md`
- **Content**: Probability bonus formula, exponent rationale, tuning results
- **Constitution Compliance**: Documentation only

#### Acceptance Criteria
- [ ] ADR documents probability bonus formula
- [ ] Explains exponent choice (0.33) with rationale
- [ ] Includes tuning results (TSK-013)
- [ ] Shows example score calculations
- [ ] References TestOptimalPath improvement
- [ ] Committed to repository

---

### TSK-017: Document Probability Calculation Patterns

**Priority**: P3 (Medium - Developer Guide)  
**Effort**: 2 hours  
**Dependencies**: TSK-001 through TSK-007

#### Description
Create developer documentation explaining probability calculation patterns for each currency type, aiding future maintenance.

#### Technical Specifications
- **Location**: `docs/probability-calculations.md` (new file)
- **Content**: Formula, code examples, edge cases for each currency
- **Audience**: Future developers/maintainers
- **Constitution Compliance**: Documentation only

#### Acceptance Criteria
- [ ] Document covers all 7 currency classes
- [ ] Each entry includes: formula, code snippet, examples, edge cases
- [ ] Explains Perfect Essence omen probabilities clearly
- [ ] Includes diagrams for complex scenarios
- [ ] Committed to repository

---

### TSK-018: Add Inline JavaDoc to Probability Methods

**Priority**: P3 (Medium - Code Quality)  
**Effort**: 2 hours  
**Dependencies**: TSK-001 through TSK-009

#### Description
Add comprehensive JavaDoc comments to all new probability calculation methods and heuristic modifications.

#### Technical Specifications
- **Locations**: All modified currency classes, Crafting_Algorithm, Crafting_Candidate
- **Standard**: JavaDoc with @param, @return, @throws
- **Constitution Compliance**: Documentation only

#### Acceptance Criteria
- [ ] All new methods have JavaDoc
- [ ] Probability formulas documented in comments
- [ ] Edge cases mentioned in @throws or @note
- [ ] Heuristic modification documented with rationale
- [ ] JavaDoc generates without warnings

---

## Summary

**Total Tasks**: 18  
**Priority Breakdown**:
- P1 (Critical): 12 tasks (foundation, integration, validation)
- P2 (High): 5 tasks (optimization, performance, documentation)
- P3 (Medium): 1 task (code quality)

**Estimated Total Effort**: ~48 hours (6-8 days focused work)

**Critical Path**:
1. Phase 1 (TSK-001 to TSK-007): Implement probability in all currencies - 18.5 hours
2. Phase 2 (TSK-008 to TSK-009): Integrate probability tracking - 5 hours
3. Phase 3 (TSK-010 to TSK-013): Validate and tune - 12 hours
4. Phase 4 (TSK-014 to TSK-015): Performance validation - 5 hours
5. Phase 5 (TSK-016 to TSK-018): Documentation - 6 hours

**Dependencies**:
- Phase 2 requires Phase 1 complete (currencies must calculate probability first)
- Phase 3 validation requires Phase 2 complete (integration must work)
- Phase 4 can run in parallel with Phase 5
- TSK-013 (tuning) informs TSK-016 (ADR update)

**Success Metrics**:
- ✅ TestOptimalPath.java passes with probability ≥5.6×10⁻⁵
- ✅ All regression tests pass (no functionality broken)
- ✅ Performance overhead <10%
- ✅ Probabilities match Probability_Analyzer validation
- ✅ Constitution §I preserved (algorithm structure unchanged)
