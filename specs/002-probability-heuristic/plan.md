# Implementation Plan: Probability-Aware Heuristic

**Feature**: 002-probability-heuristic  
**Created**: November 19, 2025  
**Estimated Effort**: 1-2 focused workdays  
**Risk Level**: Medium (well-understood problem, clear solution)

## Implementation Strategy

### Phase 1: Currency Probability Calculation (Core)
**Duration**: 4-6 hours  
**Priority**: P1 - Must complete first

Implement actual probability calculation in each currency's `apply()` method, replacing hardcoded `0.0` values.

### Phase 2: Heuristic Integration
**Duration**: 30 minutes  
**Priority**: P1 - Depends on Phase 1

Update heuristic to incorporate cumulative probability with configurable exponent.

### Phase 3: Testing & Validation
**Duration**: 2-3 hours  
**Priority**: P1 - Validation critical

Comprehensive testing including unit tests, integration tests, and TestOptimalPath validation.

### Phase 4: Tuning & Optimization
**Duration**: 1-2 hours  
**Priority**: P2 - Performance refinement

Profile performance, tune exponent parameter, optimize hot paths if needed.

---

## Detailed Implementation Steps

### STEP 1: Setup and Baseline
**Duration**: 15 minutes

1.1. Create feature branch (✅ Done: `002-probability-heuristic`)
1.2. Run TestOptimalPath.java to capture baseline metrics
1.3. Document current performance: probability, time, memory
1.4. Set up profiling/monitoring hooks

**Deliverable**: Baseline metrics document
**Validation**: Test runs successfully, metrics recorded

---

### STEP 2: ExaltedOrb Probability (Pilot Implementation)
**Duration**: 45 minutes  
**Files**: `src/main/java/core/Currency/ExaltedOrb.java`

Start with ExaltedOrb as it has the simplest probability calculation.

**Current Code**:
```java
public List<Crafting_Candidate> apply(...) {
    Map<Crafting_Action, Double> actionMap = new HashMap<>();
    actionMap.put(this, 0.0);  // ← Problem
    // ... rest of apply logic
}
```

**New Code**:
```java
public List<Crafting_Candidate> apply(...) {
    Map<Crafting_Action, Double> actionMap = new HashMap<>();
    
    // Calculate actual probability
    double stepProbability = calculateExaltProbability(item, modifiers);
    actionMap.put(this, stepProbability);
    
    // ... rest of apply logic
}

private double calculateExaltProbability(Crafting_Item item, List<Modifier> modifiers) {
    // Count empty slots
    int emptyPrefixes = 3 - item.getAllCurrentPrefixModifiers().size();
    int emptySuffixes = 3 - item.getAllCurrentSuffixModifiers().size();
    int totalEmptySlots = emptyPrefixes + emptySuffixes;
    
    if (totalEmptySlots == 0) return 0.0;
    
    // Count available modifiers
    int availableMods = modifiers.size();
    if (availableMods == 0) return 0.0;
    
    // Probability = empty_slots / available_mods
    return (double) totalEmptySlots / availableMods;
}
```

**Unit Test**:
```java
@Test
public void testExaltedOrbProbability() {
    // Setup: Item with 1 empty slot, 10 available mods
    Crafting_Item item = createTestItem(2, 3); // 2 prefixes, 3 suffixes
    List<Modifier> mods = createModList(10);
    
    ExaltedOrb exalt = new ExaltedOrb();
    List<Crafting_Candidate> results = exalt.apply(item, ...);
    
    // Verify probability = 1/10 = 0.1
    for (Crafting_Candidate candidate : results) {
        ModifierEvent lastEvent = candidate.modifierHistory.get(candidate.modifierHistory.size() - 1);
        double prob = lastEvent.source.get(exalt);
        assertEquals(0.1, prob, 0.001);
    }
}
```

**Deliverable**: Working ExaltedOrb with unit test
**Validation**: Unit test passes, probability matches manual calculation

---

### STEP 3: Simple Currencies (Batch 1)
**Duration**: 2 hours  
**Files**:
- `src/main/java/core/Currency/TransmutationOrb.java`
- `src/main/java/core/Currency/AugmentationOrb.java`
- `src/main/java/core/Currency/RegalOrb.java`

Apply same pattern to currencies with straightforward probability calculations.

**TransmutationOrb**:
```java
private double calculateTransmuteProbability(Crafting_Item item, List<Modifier> modifiers) {
    // Transmutation picks one random mod from pool
    int totalMods = modifiers.size();
    if (totalMods == 0) return 0.0;
    return 1.0 / totalMods;
}
```

**AugmentationOrb**:
```java
private double calculateAugmentProbability(Crafting_Item item, List<Modifier> modifiers) {
    // Augmentation adds to empty slot with compatible type
    // Similar to Exalted but stricter filtering
    int emptySlots = countEmptySlotsForType(item, modifiers.get(0).type);
    int compatibleMods = modifiers.size();
    
    if (emptySlots == 0 || compatibleMods == 0) return 0.0;
    return 1.0 / compatibleMods;
}
```

**Deliverable**: Three currencies with unit tests
**Validation**: All unit tests pass

---

### STEP 4: Essence_currency (Complex Case)
**Duration**: 2 hours  
**Files**: `src/main/java/core/Currency/Essence_currency.java`

Most complex due to Perfect Essence + Omen interactions.

**Implementation**:
```java
private double calculateEssenceProbability(
    Crafting_Item item, 
    Modifier modifier, 
    ExaltedOrb.Omen omen
) {
    boolean isPerfectEssence = modifier.source == ModifierSource.PERFECT_ESSENCE;
    
    if (!isPerfectEssence) {
        // Regular essence always succeeds
        return 1.0;
    }
    
    // Perfect Essence with omen
    if (omen != null) {
        // Count target slots (prefix or suffix based on omen)
        boolean targetingPrefixes = (omen == ExaltedOrb.Omen.OmenofDextralCrystallisation);
        int targetSlots = targetingPrefixes ? 
            item.getAllCurrentPrefixModifiers().size() :
            item.getAllCurrentSuffixModifiers().size();
        
        // Check if adding to empty slot
        boolean hasEmptySlot = targetSlots < 3;
        if (hasEmptySlot) {
            return 1.0;  // Add to empty slot, always succeeds
        }
        
        // Replacing existing modifier
        if (targetSlots == 1) return 1.0;   // Only one option
        if (targetSlots == 2) return 0.5;   // Replace one of two
        if (targetSlots == 3) return 0.33;  // Replace one of three
    }
    
    // Perfect Essence without omen (add to empty slot)
    return 1.0;
}
```

**Unit Tests** (Multiple scenarios):
```java
@Test
public void testPerfectEssence_EmptySlot() {
    // Scenario: Perfect Essence + Omen, target has empty slot
    // Expected: 1.0 (add to empty slot)
}

@Test
public void testPerfectEssence_Replace2Slots() {
    // Scenario: Perfect Essence + Omen, target has 2 filled slots
    // Expected: 0.5 (replace one of two)
}

@Test
public void testPerfectEssence_Replace3Slots() {
    // Scenario: Perfect Essence + Omen, target has 3 filled slots
    // Expected: 0.33 (replace one of three)
}
```

**Deliverable**: Essence_currency with comprehensive unit tests
**Validation**: All scenarios pass, matches POE2 mechanics

---

### STEP 5: Remaining Currencies
**Duration**: 1 hour  
**Files**:
- `src/main/java/core/Currency/Desecrated_currency.java`
- `src/main/java/core/Currency/AnnulmentOrb.java`

**Desecrated_currency**: Similar to ExaltedOrb but with Desecrated mod pool
**AnnulmentOrb**: Probability = 1.0 / current_mod_count

**Deliverable**: All currencies with unit tests
**Validation**: Complete currency test suite passes

---

### STEP 6: Probability Update Integration
**Duration**: 30 minutes  
**Files**: 
- `src/main/java/core/Crafting/Crafting_Action.java` (interface methods)

Update the evaluate methods to extract probability and update candidates:

**Pattern**:
```java
default List<Crafting_Candidate> evaluateAffixes(...) {
    // ... existing logic to create items ...
    
    for (Crafting_Item items : Item_Evaluation) {
        double score = Crafting_Algorithm.heuristic(items, ...);
        
        if (score > candidate.score) {
            Crafting_Candidate newCandidate = candidate.NewStep(...);
            newCandidate.actions.add(this);
            
            // NEW: Extract and update cumulative probability
            ModifierEvent lastEvent = items.modifierHistory.get(items.modifierHistory.size() - 1);
            if (lastEvent.source != null && !lastEvent.source.isEmpty()) {
                double stepProb = lastEvent.source.values().iterator().next();
                newCandidate.updateProbability(stepProb);
            }
            
            CandidateListCopy.add(newCandidate);
        }
    }
}
```

**Deliverable**: Integration code in Crafting_Action
**Validation**: Probability flows from currency to candidate

---

### STEP 7: Heuristic Update
**Duration**: 30 minutes  
**Files**: 
- `src/main/java/core/Crafting/Crafting_Algorithm.java`
- `src/main/java/core/Crafting/BeamSearchConfig.java`

**Add to BeamSearchConfig**:
```java
public class BeamSearchConfig {
    // Existing fields...
    
    // NEW: Probability exponent for heuristic weighting
    private double probabilityExponent = 0.3;
    
    public double getProbabilityExponent() {
        return probabilityExponent;
    }
    
    public void setProbabilityExponent(double exponent) {
        this.probabilityExponent = exponent;
    }
}
```

**Update Heuristic**:
```java
public static double heuristic(
    Crafting_Item item, 
    List<Modifier> desiredMods,
    Map<String, Integer> CountDesiredModifierTags, 
    List<Modifier> undesiredMods,
    BeamSearchConfig config
) {
    // Existing state-based scoring (PRESERVED)
    double score = 0;
    double scorePrefix = Heuristic_Util.calculateAffixScore(
        item.getAllCurrentPrefixModifiers(), desiredMods, 
        CountDesiredModifierTags, 
        config.getDesiredModifierScore(), 
        config.getRelevantTagScore()
    );
    double scoreSuffix = Heuristic_Util.calculateAffixScore(
        item.getAllCurrentSuffixModifiers(), desiredMods, 
        CountDesiredModifierTags,
        config.getDesiredModifierScore(), 
        config.getRelevantTagScore()
    );
    score = scorePrefix + scoreSuffix;
    
    // NEW: Probability-weighted bonus
    if (item instanceof Crafting_Candidate) {
        Crafting_Candidate candidate = (Crafting_Candidate) item;
        double cumulativeProb = candidate.getCumulativeProbability();
        
        // Apply configurable exponent to dampen effect
        double probabilityBonus = Math.pow(cumulativeProb, config.getProbabilityExponent());
        
        // Multiply state score by probability bonus
        score *= probabilityBonus;
    }
    
    return score;
}
```

**Deliverable**: Updated heuristic with configurable exponent
**Validation**: Compilation succeeds, existing tests still pass

---

### STEP 8: TestOptimalPath Validation
**Duration**: 15 minutes  
**Files**: `src/main/java/core/Test/TestOptimalPath.java`

Run the test and verify results:

```bash
mvn exec:java -Dexec.mainClass="core.Test.TestOptimalPath"
```

**Expected Output**:
```
Algorithm's best probability: [≥5.6e-5]
Expected optimal probability: ~5.6e-4 (0.056%)

✓ Algorithm found near-optimal or better path
```

**Success Criteria**:
- Algorithm probability ≥ 5.6×10⁻⁵ (within 10× of optimal)
- Computation time ≤ 60 seconds
- No memory errors

**If Failed**:
- Check probability calculations (run unit tests)
- Try different exponent values [0.2, 0.25, 0.3, 0.35, 0.4]
- Profile to find bottlenecks

**Deliverable**: Passing TestOptimalPath
**Validation**: Test shows "✓ Algorithm found near-optimal or better path"

---

### STEP 9: Comprehensive Testing
**Duration**: 2 hours  
**Files**: Create new test suite

**Test Categories**:

1. **Unit Tests** (per currency):
   - Probability calculation correctness
   - Edge cases (0 mods, full slots, etc.)
   - Omen interactions (Essence only)

2. **Integration Tests**:
   - End-to-end probability tracking
   - Probability matches Probability_Analyzer
   - Multiple paths maintain distinct probabilities

3. **Regression Tests**:
   - Simple crafts (1-3 mods) still work
   - Complex crafts don't timeout
   - Memory usage within limits

4. **Performance Tests**:
   - Computation time vs baseline
   - Memory usage vs baseline
   - Profile hot paths

**Test File**:
```java
// src/test/java/core/Crafting/ProbabilityIntegrationTest.java
public class ProbabilityIntegrationTest {
    
    @Test
    public void testProbabilityConsistency() {
        // Run crafting algorithm
        CraftingResult result = runCrafting(...);
        Crafting_Candidate best = result.getPaths().get(0);
        
        // Get probability from search
        double searchProb = best.getCumulativeProbability();
        
        // Get probability from analyzer
        double analyzedProb = Probability_Analyzer.Analyze(paths).finalPercentage() / 100.0;
        
        // Verify match
        assertEquals(searchProb, analyzedProb, 0.01);
    }
    
    @Test
    public void testSimpleCraftsStillWork() {
        // Test 1-modifier craft
        // Test 2-modifier craft
        // Test 3-modifier craft
        // All should complete quickly and find reasonable paths
    }
    
    @Test
    public void testMemoryUsage() {
        // Run complex scenario
        // Verify memory stays within 50K pool limit
    }
}
```

**Deliverable**: Complete test suite
**Validation**: All tests pass

---

### STEP 10: Exponent Tuning
**Duration**: 1 hour  
**Files**: `src/main/java/core/Crafting/BeamSearchConfig.java`

Empirically determine best default exponent:

**Test Matrix**:
| Exponent | 10× Prob Impact | TestOptimalPath Result | Computation Time |
|----------|-----------------|------------------------|------------------|
| 0.20     | 1.58× score     | ?                      | ?                |
| 0.25     | 1.78× score     | ?                      | ?                |
| 0.30     | 2.00× score     | ?                      | ?                |
| 0.35     | 2.24× score     | ?                      | ?                |
| 0.40     | 2.51× score     | ?                      | ?                |

**Evaluation Criteria**:
- Best path probability (maximize)
- Computation time (minimize)
- Path intuitiveness (qualitative)

**Deliverable**: Tuned default exponent + ADR documenting choice
**Validation**: TestOptimalPath optimal with chosen exponent

---

### STEP 11: Documentation
**Duration**: 1 hour

**ADR**: Create `specs/002-probability-heuristic/ADR-001-probability-formulas.md`

Document:
- Probability calculation for each currency
- Rationale for formulas
- Edge case handling
- Exponent tuning results

**Code Comments**: Add to each currency class
```java
/**
 * Calculates step probability for ExaltedOrb application.
 * 
 * Formula: empty_slots / available_mods
 * 
 * Example: Item with 1 empty slot and 10 available mods → 0.1 (10%)
 * 
 * Edge Cases:
 * - No empty slots: 0.0 (cannot apply)
 * - No available mods: 0.0 (nothing to add)
 */
private double calculateExaltProbability(...) {
    // ...
}
```

**Deliverable**: ADR + inline documentation
**Validation**: Documentation review

---

### STEP 12: Final Validation & Commit
**Duration**: 30 minutes

**Final Checks**:
- ✅ TestOptimalPath passes
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Regression tests pass
- ✅ Memory usage within limits
- ✅ Computation time acceptable
- ✅ Documentation complete

**Commit**:
```bash
git add -A
git commit -m "feat: implement probability-aware heuristic

Moves probability calculation from post-processing into currency apply()
methods, enabling heuristic to factor path probability into scoring.

Results:
- TestOptimalPath: Algorithm finds path within 10× of optimal
- State-based scoring preserved (1000/250 weights)
- Memory usage within 50K pool limit
- Computation time ≤60s for complex scenarios

Changes:
- Updated 10 currency classes with probability calculation
- Modified heuristic to include probability bonus (configurable exponent)
- Added comprehensive test suite (unit + integration + regression)
- Created ADR-001 documenting probability formulas

Constitutional Compliance:
- ✅ Algorithm Integrity: Beam search structure preserved
- ✅ Performance First: Memory and timing within standards
- ✅ Code Quality: Full test coverage + documentation

Closes #[issue number if tracked]"
```

**Deliverable**: Feature complete and committed
**Validation**: CI/CD passes (if configured)

---

## Risk Mitigation Checklist

### Before Implementation
- [ ] Baseline metrics captured (TestOptimalPath current result)
- [ ] Unit test framework set up
- [ ] Probability_Analyzer reference understood

### During Implementation
- [ ] Start with simplest currency (ExaltedOrb)
- [ ] Validate each currency before proceeding
- [ ] Run TestOptimalPath after each major change
- [ ] Monitor memory usage during testing

### After Implementation
- [ ] TestOptimalPath passes (within 10× of optimal)
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Regression tests pass (no breakage in simple crafts)
- [ ] Memory profiling shows no issues
- [ ] Performance profiling shows <5% overhead
- [ ] Documentation complete

---

## Rollback Plan

If implementation fails or causes regressions:

1. **Immediate Rollback**:
   ```bash
   git reset --hard [baseline_commit]
   ```

2. **Partial Rollback** (if specific currency has issues):
   - Revert problem currency's probability calculation
   - Restore `actionMap.put(this, 0.0)` for that currency
   - Continue with other currencies

3. **Heuristic Rollback** (if probability bonus causes issues):
   - Comment out probability bonus in heuristic
   - Restore pure state-based scoring
   - Investigate why probability factor caused problems

---

## Success Metrics

### Primary Goal
✅ TestOptimalPath shows algorithm probability ≥5.6×10⁻⁵ (within 10× of optimal 5.6×10⁻⁴)

### Performance Goals
- ✅ Computation time ≤60 seconds
- ✅ Memory usage within 50K pool limit
- ✅ <5% computational overhead vs baseline

### Quality Goals
- ✅ 100% unit test pass rate
- ✅ Probability calculations match Probability_Analyzer
- ✅ No regressions in simple crafting scenarios

---

## Post-Implementation Tasks

1. Update v1.0 completion checklist (AC-3.4 path optimization)
2. Create pull request with comprehensive description
3. Request code review focusing on probability formulas
4. Update user documentation if needed
5. Monitor production performance after merge

