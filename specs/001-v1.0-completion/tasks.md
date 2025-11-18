# POE2_HTC v1.0 Completion - Task Breakdown

**Feature**: Complete POE2_HTC to production-ready v1.0 release  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Task Execution Rules

- **Sequential vs Parallel**: Tasks marked [P] can run in parallel with other [P] tasks
- **Dependencies**: Must complete prerequisite tasks before dependent tasks
- **Estimation**: Each task is 2-4 hours (excluding testing/validation)
- **Testing**: Every implementation task has corresponding test task
- **Progress**: Mark tasks with [X] when completed

## Phase 1: Memory Optimization (CRITICAL - P1)

### Setup Tasks

**T1.1: Add reset() method to Crafting_Candidate**
- **ID**: T1.1
- **Priority**: P1
- **Effort**: 1 hour
- **Dependencies**: None
- **Description**: Add reset() method to clear candidate state for object reuse
- **Acceptance Criteria**:
  - [X] reset() method implemented overriding parent class
  - [X] Clears all mutable state (actions, modifiers, scores)
  - [X] Calls super.reset() to clear parent fields
  - [X] Does not break existing functionality
- **Technical Specs**:
  ```java
  @Override
  public void reset() {
      super.reset();
      this.actions.clear();
      this.percentage = 0.0;
      this.stopAnnul = false;
  }
  ```
- **Testing**: Unit test in Crafting_CandidateTest.java
- **Files**: `src/main/java/core/Crafting/Crafting_Candidate.java`
- **Traceability**: [Spec §R1.2]
- **Status**: ✅ COMPLETED

**T1.2: Create CandidatePool class** [P]
- **ID**: T1.2
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel with T1.1)
- **Description**: Implement thread-safe object pool for Crafting_Candidate reuse
- **Acceptance Criteria**:
  - [X] CandidatePool with acquire/release methods
  - [X] Thread-safe using ConcurrentLinkedQueue
  - [X] Configurable max pool size (default: 50,000)
  - [X] Metrics: size() method for monitoring
- **Technical Specs**: See plan.md §1.1
- **Testing**: Unit test for thread safety and basic operations
- **Files**: `src/main/java/core/Crafting/Utils/CandidatePool.java`
- **Traceability**: [Spec §R1.2]
- **Status**: ✅ COMPLETED

### Integration Tasks

**T1.3: Integrate CandidatePool into Crafting_Algorithm**
- **ID**: T1.3
- **Priority**: P1
- **Effort**: 8-10 hours (UPDATED - complexity discovered during implementation)
- **Dependencies**: T1.1, T1.2
- **Description**: Modify beam search to use object pooling for candidate creation
- **Acceptance Criteria**:
  - [X] Initialize pool in optimizeCrafting() with size 50,000
  - [ ] Replace `new Crafting_Candidate()` with `pool.acquire()` across ALL currency classes
  - [ ] Call `pool.release()` when candidates no longer needed
  - [ ] Ensure no double-release or use-after-release bugs
- **Technical Specs**:
  ```java
  CandidatePool pool = new CandidatePool(50000);
  // In loops:
  Crafting_Candidate c = pool.acquire();
  // ... use c ...
  pool.release(c);
  ```
- **Actual Integration Requirements** (discovered during implementation):
  - Modify `Crafting_Candidate.copy()` to accept CandidatePool parameter
  - Modify `Crafting_Item.copy()` to pass pool through to candidate creation
  - Update 8+ currency classes to use pooling:
    * TransmutationOrb.apply() - ~15 candidate creation sites
    * AugmentationOrb.apply() - ~10 sites
    * RegalOrb.apply() - ~20 sites
    * ExaltedOrb.apply() - ~25 sites
    * AnnulmentOrb.apply() - ~15 sites
    * Essence_currency.apply() - ~20 sites
    * Desecrated_currency.apply() - ~15 sites
  - Add pool.release() calls in Crafting_Algorithm after each currency application phase
  - Thread-safe pool passing through parallel executor service
  - Estimated ~2,000 LOC changes across 10+ files
- **Constitution Constraint**: Must preserve algorithm integrity per §I - no changes to scoring, heuristic, or probability logic
- **Testing**: Integration test with complex scenario
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`, `src/main/java/core/Crafting/Crafting_Candidate.java`, `src/main/java/core/Crafting/Crafting_Item.java`, `src/main/java/core/Currency/*.java` (8 files)
- **Traceability**: [Spec §R1.2]
- **Status**: 🔄 PARTIAL - Infrastructure ready (pool initialized), full integration deferred due to refactoring scope
- **Notes**: Pool initialization added with @SuppressWarnings annotation. Full integration requires refactoring .copy() method and currency operations to respect algorithm integrity constraints (see constitution §I). Complete integration requires architectural changes beyond current scope - recommend as separate sub-phase after T2 completion.

**T1.4: Test memory optimization with complex scenarios**
- **ID**: T1.4
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T1.3
- **Description**: Validate object pooling reduces heap pressure
- **Acceptance Criteria**:
  - [ ] Memory test: before/after heap measurements with JMX
  - [ ] 50% reduction in object allocation rate
  - [ ] No OutOfMemoryError on 6-modifier items
  - [ ] Performance regression <5% (pooling overhead acceptable)
- **Technical Specs**: See plan.md §5.2
- **Testing**: MemoryOptimizationTest.java
- **Files**: `src/test/java/core/Crafting/MemoryOptimizationTest.java`
- **Traceability**: [Spec §R1.2, R1.3]

### Streaming Optimization Tasks

**T1.5: Refactor processCandidateLists to use streams** [P]
- **ID**: T1.5
- **Priority**: P1
- **Effort**: 3 hours
- **Dependencies**: T1.4 (test before refactoring)
- **Description**: Replace list-based processing with streaming to reduce memory footprint
- **Acceptance Criteria**:
  - [ ] Use Stream API instead of ArrayList for candidate processing
  - [ ] Filter operations applied during streaming, not after
  - [ ] Lazy evaluation for intermediate operations
  - [ ] No performance regression (parallel streams where appropriate)
- **Technical Specs**:
  ```java
  Stream<Crafting_Candidate> candidateStream = candidates.stream()
      .map(this::processCandidate)
      .filter(c -> c.getScore() > threshold);
  ```
- **Testing**: Performance benchmark, memory test
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`
- **Traceability**: [Spec §R1.1]

**T1.6: Optimize deepCopy with lazy copying** [P]
- **ID**: T1.6
- **Priority**: P2
- **Effort**: 2 hours
- **Dependencies**: T1.5
- **Description**: Replace eager deepCopy with lazy copy-on-write semantics
- **Acceptance Criteria**:
  - [ ] Candidates only copied when modified
  - [ ] Immutable candidates shared across iterations
  - [ ] 30-40% reduction in peak memory usage
- **Technical Specs**: Use copy-on-write collections or custom lazy wrapper
- **Testing**: Memory test validates reduction
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`
- **Traceability**: [Spec §R1.1]

### Memory Monitoring Tasks

**T1.7: Create MemoryMonitor utility class** [P]
- **ID**: T1.7
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel)
- **Description**: Implement memory tracking with warning/critical thresholds
- **Acceptance Criteria**:
  - [ ] checkMemory() returns OK/WARNING/CRITICAL status
  - [ ] WARNING at 85% heap usage, CRITICAL at 95%
  - [ ] Thread-safe for concurrent checks
- **Technical Specs**: See plan.md §1.3
- **Testing**: Unit test with mock heap usage
- **Files**: `src/main/java/core/Crafting/Utils/MemoryMonitor.java`
- **Traceability**: [Spec §R1.3]

**T1.8: Integrate MemoryMonitor into beam search loop**
- **ID**: T1.8
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T1.7
- **Description**: Check memory every N iterations and handle gracefully
- **Acceptance Criteria**:
  - [ ] Check memory every 100 iterations
  - [ ] Log WARNING when memory high
  - [ ] Throw MemoryException with user-friendly message at CRITICAL
  - [ ] Cleanup resources before throwing exception
- **Technical Specs**:
  ```java
  if (iteration % 100 == 0) {
      MemoryStatus status = MemoryMonitor.checkMemory();
      if (status == CRITICAL) {
          throw new MemoryException("Calculation too complex...");
      }
  }
  ```
- **Testing**: Integration test triggering memory limit
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`
- **Traceability**: [Spec §R1.3]

## Phase 2: Algorithm Parameter Optimization (P1)

### Configuration Tasks

**T2.1: Create BeamSearchConfig class** [P]
- **ID**: T2.1
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Implement configuration class for beam width and scoring weights
- **Acceptance Criteria**:
  - [X] ItemComplexity enum (SIMPLE, MEDIUM, COMPLEX)
  - [X] calculateBeamWidth() based on complexity
  - [X] Getters/setters for scoring weights
  - [X] Immutable by default, builder pattern for testing
- **Technical Specs**: See plan.md §2.1
- **Testing**: Unit test for complexity calculation
- **Files**: `src/main/java/core/Crafting/BeamSearchConfig.java`
- **Traceability**: [Spec §R2.1]
- **Status**: ✅ COMPLETED

**T2.2: Integrate BeamSearchConfig into Crafting_Algorithm**
- **ID**: T2.2
- **Priority**: P1
- **Effort**: 5-6 hours (UPDATED - wiring complexity discovered)
- **Dependencies**: T2.1
- **Description**: Modify algorithm to use config for beam width and scoring
- **Acceptance Criteria**:
  - [X] Accept BeamSearchConfig as parameter (optional, defaults to standard config)
  - [X] Calculate complexity from desiredMods.size()
  - [X] Use config.calculateBeamWidth(complexity)
  - [ ] Use config scoring weights in heuristic
  - [ ] Implement beam width pruning in processCandidateLists()
- **Technical Specs**:
  ```java
  ItemComplexity complexity = ItemComplexity.from(desiredMods.size());
  int beamWidth = config.calculateBeamWidth(complexity);
  ```
- **Actual Integration Requirements** (discovered during implementation):
  - **Beam Width Pruning** (NOT YET IMPLEMENTED):
    * Add sorting + pruning in processCandidateLists() line ~180
    * Sort candidates by score descending
    * Keep only top N candidates (N = beamWidth)
    * Estimated ~100-200 LOC in Crafting_Algorithm.java
  - **Scoring Weight Wiring** (NOT YET IMPLEMENTED):
    * Modify Heuristic_Util.calculateAffixScore() signature to accept config
    * Pass config from Crafting_Algorithm → currency.apply() → Heuristic_Util
    * Replace hardcoded 1000/250 with config.getDesiredModifierScore() / config.getRelevantTagScore()
    * Update 8+ currency classes to pass config through
    * Estimated ~500-800 LOC changes across scoring functions
- **Current Status**:
  - ✅ Config class created with all fields and validation
  - ✅ Algorithm accepts config parameter
  - ✅ Complexity calculated and beam width computed
  - ❌ Beam width NOT used for pruning (all candidates kept)
  - ❌ Scoring weights NOT wired (Heuristic_Util uses hardcoded 1000/250)
- **Testing**: Unit test with different configs
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`, `src/main/java/core/Crafting/Utils/Heuristic_Util.java`, `src/main/java/core/Currency/*.java` (8 files)
- **Traceability**: [Spec §R2.1, R2.2]
- **Status**: 🔄 PARTIAL - Config accepted, complexity calculated, beam width computed. Pruning and scoring weight integration deferred.
- **Notes**: Beam width pruning and scoring weight wiring require additional refactoring to respect algorithm integrity per Constitution §I. See TODO comments in Crafting_Algorithm.java for full integration strategy.

### Benchmark Tasks

**T2.3: Create BenchmarkSuite with test cases** [P]
- **ID**: T2.3
- **Priority**: P1
- **Effort**: 4 hours
- **Dependencies**: None (can run parallel)
- **Description**: Build benchmark suite with 10-20 test cases covering simple/medium/complex scenarios
- **Acceptance Criteria**:
  - [X] BenchmarkCase class with item, desired mods, expected path, max time
  - [X] At least 10 cases covering all complexity levels (11 cases total)
  - [X] Known optimal paths for accuracy validation
  - [X] runBenchmark() method measures time and accuracy
- **Technical Specs**: See plan.md §2.2
- **Testing**: Self-validating (is a test suite)
- **Files**: `src/main/java/core/Crafting/BenchmarkSuite.java`
- **Traceability**: [Spec §R2.2]
- **Status**: ✅ COMPLETE
- **Implementation Details**:
  - 11 concrete test cases across all complexity levels:
    * SIMPLE (3 cases): 1-2 mods, < 5 sec targets
    * MEDIUM (4 cases): 3-4 mods, < 20 sec targets
    * COMPLEX (4 cases): 5-6 mods, < 60 sec targets (constitution requirement)
  - Real items: Bows, Helmets, Rings, Body Armor, Weapons, Amulets, Wands
  - Realistic modifier combinations: Physical/elemental damage, defenses, resistances, utility
  - Comprehensive reporting with pass/fail, timing, scoring
  - Command-line executable for CI/CD integration
- **Notes**: Threshold tuning needed - default 0.001 too strict for most cases. Recommend threshold optimization as part of T2.4 parameter search.

**T2.4: Run parameter search for optimal weights**
- **ID**: T2.4
- **Priority**: P1
- **Effort**: 3 hours (+ computation time)
- **Dependencies**: T2.2, T2.3
- **Description**: Grid search over scoring weight combinations to find optimal values
- **Acceptance Criteria**:
  - [ ] Test weight combinations: (800-1200, 200-300)
  - [ ] Measure accuracy (path quality) vs speed
  - [ ] Document results in ADR
  - [ ] Update BeamSearchConfig defaults with optimal weights
- **Technical Specs**:
  ```java
  for (int desired = 800; desired <= 1200; desired += 50) {
      for (int tag = 200; tag <= 300; tag += 10) {
          BeamSearchConfig config = new BeamSearchConfig(desired, tag);
          BenchmarkResult result = benchmarkSuite.runBenchmark(config);
          // Record results
      }
  }
  ```
- **Testing**: Automated script, results in docs/ADR-002-scoring-weights.md
- **Files**: `src/test/java/core/Crafting/ParameterSearchTest.java`, `docs/architecture-decisions/ADR-002-scoring-weights.md`
- **Traceability**: [Spec §R2.2]

**T2.5: Validate optimized parameters with regression tests**
- **ID**: T2.5
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T2.4
- **Description**: Ensure new parameters don't regress existing functionality
- **Acceptance Criteria**:
  - [ ] All benchmark cases pass with new weights
  - [ ] No increase in computation time >10%
  - [ ] Path quality equal or better than baseline
- **Testing**: Regression test suite
- **Files**: `src/test/java/core/Crafting/RegressionTest.java`
- **Traceability**: [Spec §R2.2]

**T2.6: Formalize threshold countdown pattern in CraftingExecutor** [NEW]
- **ID**: T2.6
- **Priority**: P1 (HIGH - critical for production readiness)
- **Effort**: 3 hours
- **Dependencies**: T2.3 (BenchmarkSuite validates need)
- **Description**: Move threshold countdown from TestAlgo into CraftingExecutor as official production pattern
- **Rationale**: Default threshold 0.001 (0.1%) too strict - BenchmarkSuite shows 0 results for most cases. TestAlgo countdown pattern (50% → 0%) is the OFFICIAL approach for both testing AND production.
- **Acceptance Criteria**:
  - [X] Create ThresholdConfig class with customizable parameters:
    * startThreshold (default: 50%)
    * stepSize (default: 1%)
    * minThreshold (default: 0%)
    * maxIterations (default: 51)
  - [X] Move countdown logic INTO CraftingExecutor.runCrafting()
  - [X] Return metadata: which threshold succeeded, iterations taken
  - [X] Document in JavaDoc as official pattern (not workaround)
  - [X] Update TestAlgo to use formalized API
  - [ ] Update BenchmarkSuite to use formalized pattern
  - [ ] Unit tests for ThresholdConfig parameter validation
- **Technical Specs**:
  ```java
  public static CraftingResult runCrafting(
      Crafting_Item item,
      List<Modifier> desiredMods,
      List<Modifier> undesiredMods,
      ThresholdConfig config
  ) {
      // Progressive threshold relaxation with early termination
      // Returns CraftingResult with paths + execution metadata
  }
  ```
- **Implementation Status**: ✅ MOSTLY COMPLETE
  - ✅ ThresholdConfig class with standard/fast/thorough/fixed presets
  - ✅ CraftingExecutor.runCrafting() with ThresholdConfig parameter
  - ✅ CraftingResult metadata tracking (threshold, iterations, duration, success)
  - ✅ TestAlgo migrated to use new API
  - ✅ Legacy runCrafting(double) marked @Deprecated for backward compat
  - ⏳ BenchmarkSuite integration (straightforward, just use ThresholdConfig.standard())
  - ⏳ Unit tests for ThresholdConfig (validation, edge cases, iteration logic)
- **Benefits**:
  - Speed: Finds high-probability paths in <5 seconds
  - Coverage: Falls back to lower probabilities if no fast paths exist
  - User Experience: Progressive refinement feels responsive
  - Production-Ready: Official algorithm, not temporary workaround
- **Testing**: Integration test with countdown, unit test for ThresholdConfig
- **Files**: `src/main/java/core/Crafting/CraftingExecutor.java`, `src/main/java/core/Crafting/ThresholdConfig.java`, `src/main/java/core/Test/TestAlgo.java` (updated)
- **Traceability**: [Spec §R2.3]
- **Status**: ✅ COMPLETE (core implementation), ⏳ TESTS PENDING
- **Expected Impact**: 80-90% reduction in average computation time for viable crafting paths

## Phase 3: Progress Tracking & Cancellation (P1)

### Backend Tasks

**T3.1: Create ProgressTracker class** [P]
- **ID**: T3.1
- **Priority**: P1
- **Effort**: 3 hours
- **Dependencies**: None
- **Status**: ✅ COMPLETE
- **Description**: Implement session-based progress tracking with cancellation support
- **Acceptance Criteria**:
  - [X] SessionProgress with atomic counters
  - [X] Percent, elapsed time, estimated remaining calculations
  - [X] Thread-safe ConcurrentHashMap for sessions
  - [X] cancel() and isCancelled() methods
- **Technical Specs**: See plan.md §3.1
- **Testing**: Unit test for thread safety
- **Files**: `src/main/java/core/Crafting/ProgressTracker.java`, `src/main/java/core/Test/TestProgressTracker.java`
- **Traceability**: [Spec §R3.2, R3.3]
- **Implementation Notes**:
  - ✅ ProgressTracker.java (332 lines): Thread-safe session-based tracking with ConcurrentHashMap
  - ✅ SessionProgress inner class: Atomic counters (completed/total iterations), time tracking
  - ✅ Progress calculations: getPercent(), getElapsedMs(), getEstimatedRemainingMs()
  - ✅ Cancellation: isCancelled() + cancel() methods with AtomicBoolean
  - ✅ Session management: startSession(), getProgress(), incrementProgress(), endSession()
  - ✅ JSON serialization: toJson() for HTTP endpoint responses
  - ✅ TestProgressTracker.java (621 lines, 16 tests, 100% pass): Basic functionality, edge cases, 
        session management, thread safety (concurrent increments/cancellation/session creation)
  - ✅ Build: mvn compile successful, all tests pass (java core.Test.TestProgressTracker)
  - ✅ Commit: 7c2b670 "feat(progress): Implement ProgressTracker for real-time monitoring..."
  - 📝 Ready for integration: T3.2 (HTTP endpoints), T3.3 (algorithm integration)

**T3.2: Add progress endpoints to ServerMain** [P]
- **ID**: T3.2
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel with T3.1)
- **Status**: ✅ COMPLETE
- **Description**: Implement HTTP endpoints for progress querying and cancellation
- **Acceptance Criteria**:
  - [X] GET /api/progress/{sessionId} returns JSON progress data
  - [X] POST /api/cancel/{sessionId} cancels computation
  - [X] Proper error handling (404 if session not found, 400 for bad requests)
- **Technical Specs**:
  ```java
  // GET /api/progress/{sessionId}
  // Returns: { "percent": 45.2, "elapsedMs": 12000, "estimatedRemainingMs": 14500, "cancelled": false }
  
  // POST /api/cancel/{sessionId}
  // Returns: { "success": true, "sessionId": "..." }
  ```
- **Testing**: Integration test with mock requests
- **Files**: `src/main/java/core/ServerMain.java`, `src/main/java/core/Test/TestProgressEndpoints.java`
- **Traceability**: [Spec §R3.2, R3.3]
- **Implementation Notes**:
  - ✅ ProgressHandler class (43 lines): GET /api/progress/{sessionId} → JSON response
  - ✅ CancelHandler class (45 lines): POST /api/cancel/{sessionId} → cancels session
  - ✅ URL path parsing: Extracts sessionId from path segments
  - ✅ Error handling: 400 (bad request), 404 (not found), 405 (method not allowed)
  - ✅ TestProgressEndpoints.java (365 lines, 7 tests): Integration tests for endpoint validation
  - ✅ Manual testing: curl verified all status codes (404, 400, 405)
  - ✅ Build: mvn compile successful
  - ✅ Commit: d3721eb "feat(api): Add progress tracking and cancellation HTTP endpoints..."
  - 📝 Ready for T3.3 (algorithm integration) and T3.4 (frontend hook)

**T3.3: Integrate ProgressTracker into Crafting_Algorithm**
- **ID**: T3.3
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T3.1
- **Description**: Call progress tracker throughout beam search loop
- **Acceptance Criteria**:
  - [ ] Accept sessionId parameter (optional)
  - [ ] Call progressTracker.startSession() at start
  - [ ] Call incrementProgress() every iteration
  - [ ] Check isCancelled() every iteration, throw CancelledException if true
  - [ ] Call endSession() in finally block
- **Technical Specs**:
  ```java
  try {
      ProgressTracker.startSession(sessionId, totalIterations);
      for (int i = 0; i < totalIterations; i++) {
          if (ProgressTracker.getProgress(sessionId).isCancelled()) {
              throw new CancelledException("User cancelled");
          }
          // ... beam search iteration ...
          ProgressTracker.getProgress(sessionId).incrementProgress();
      }
  } finally {
      ProgressTracker.endSession(sessionId);
  }
  ```
- **Testing**: Integration test with progress checks
- **Files**: `src/main/java/core/Crafting/Crafting_Algorithm.java`
- **Traceability**: [Spec §R3.2, R3.3]

### Frontend Tasks

**T3.4: Create useCalculationProgress hook** [P]
- **ID**: T3.4
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel)
- **Description**: React hook for polling progress from backend
- **Acceptance Criteria**:
  - [ ] Poll every 100ms while sessionId active
  - [ ] Return progress data: percent, elapsed, estimated remaining
  - [ ] Handle errors gracefully
  - [ ] Cleanup interval on unmount
- **Technical Specs**: See plan.md §3.2
- **Testing**: Component test with mock fetch
- **Files**: `src/hooks/useCalculationProgress.ts`
- **Traceability**: [Spec §R3.2]

**T3.5: Create ProgressBar component** [P]
- **ID**: T3.5
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel)
- **Description**: Visual progress bar with ETA and cancel button
- **Acceptance Criteria**:
  - [ ] Progress bar visual with percentage
  - [ ] Display elapsed time and estimated remaining
  - [ ] Cancel button always accessible
  - [ ] Smooth transitions (CSS animations)
- **Technical Specs**: See plan.md §3.2
- **Testing**: Component test with Storybook/Vitest
- **Files**: `src/components/ProgressBar.tsx`
- **Traceability**: [Spec §R3.2, R3.3]

**T3.6: Integrate progress tracking into CraftingSimulator**
- **ID**: T3.6
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T3.4, T3.5
- **Description**: Connect progress hook and component to crafting simulator
- **Acceptance Criteria**:
  - [ ] Generate unique sessionId (UUID) for each calculation
  - [ ] Pass sessionId to backend in request
  - [ ] Display ProgressBar during calculation
  - [ ] Cancel button calls cancel endpoint
- **Technical Specs**:
  ```typescript
  const sessionId = crypto.randomUUID();
  const { progress } = useCalculationProgress(sessionId);
  // ... send sessionId to backend ...
  {isCalculating && progress && <ProgressBar {...progress} onCancel={handleCancel} />}
  ```
- **Testing**: Integration test full flow
- **Files**: `src/components/CraftingSimulator.tsx`
- **Traceability**: [Spec §R3.2, R3.3]

## Phase 4: Frontend State Management (P2)

### State Hook Tasks

**T4.1: Create useCraftingSimulator hook**
- **ID**: T4.1
- **Priority**: P2
- **Effort**: 3 hours
- **Dependencies**: T3.6 (progress tracking integration)
- **Description**: Centralized state management hook for crafting simulator
- **Acceptance Criteria**:
  - [ ] CraftingState interface with all state fields
  - [ ] calculate() method with AbortController
  - [ ] cancel() method propagates to backend
  - [ ] Error mapping function with user-friendly messages
  - [ ] TypeScript strict mode (no 'any' types)
- **Technical Specs**: See plan.md §4.1
- **Testing**: Unit test with mock fetch
- **Files**: `src/hooks/useCraftingSimulator.ts`
- **Traceability**: [Spec §R4.1, R4.2]

**T4.2: Refactor CraftingSimulator to use state hook**
- **ID**: T4.2
- **Priority**: P2
- **Effort**: 2 hours
- **Dependencies**: T4.1
- **Description**: Replace inline state management with custom hook
- **Acceptance Criteria**:
  - [ ] Remove useState calls from component
  - [ ] Use useCraftingSimulator hook
  - [ ] Component focused on rendering, not business logic
  - [ ] No 'any' types, all props typed
- **Technical Specs**:
  ```typescript
  const { state, calculate, cancel } = useCraftingSimulator();
  ```
- **Testing**: Component test validates behavior unchanged
- **Files**: `src/components/CraftingSimulator.tsx`
- **Traceability**: [Spec §R4.1]

### Error Handling Tasks

**T4.3: Create ErrorDisplay component** [P]
- **ID**: T4.3
- **Priority**: P2
- **Effort**: 2 hours
- **Dependencies**: None (can run parallel)
- **Description**: User-friendly error display with suggestions
- **Acceptance Criteria**:
  - [ ] Display error type, message, and suggestions
  - [ ] Different styles for different error types (heap, timeout, network)
  - [ ] Dismiss button to clear error
  - [ ] Accessible (ARIA labels)
- **Technical Specs**:
  ```typescript
  interface ErrorDisplayProps {
      error: CraftingError;
      onDismiss: () => void;
  }
  ```
- **Testing**: Component test with all error types
- **Files**: `src/components/ErrorDisplay.tsx`
- **Traceability**: [Spec §R4.2]

**T4.4: Integrate ErrorDisplay into CraftingSimulator**
- **ID**: T4.4
- **Priority**: P2
- **Effort**: 1 hour
- **Dependencies**: T4.2, T4.3
- **Description**: Show errors from state in ErrorDisplay component
- **Acceptance Criteria**:
  - [ ] Display error when state.error is not null
  - [ ] Dismiss clears error from state
  - [ ] Error shown above results area
- **Testing**: Integration test error flow
- **Files**: `src/components/CraftingSimulator.tsx`
- **Traceability**: [Spec §R4.2]

### UI Polish Tasks

**T4.5: Implement dark mode consistency** [P]
- **ID**: T4.5
- **Priority**: P3
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Ensure all components use consistent dark mode colors
- **Acceptance Criteria**:
  - [ ] All components use Tailwind dark: classes
  - [ ] Consistent color palette (shadcn/ui theme)
  - [ ] No light mode leaks in dark mode
- **Testing**: Visual regression test
- **Files**: All components in `src/components/`
- **Traceability**: [Spec §R4.3]

**T4.6: Add smooth transitions and animations** [P]
- **ID**: T4.6
- **Priority**: P3
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Polish UI with CSS transitions
- **Acceptance Criteria**:
  - [ ] Button hover states animate
  - [ ] Progress bar fills smoothly
  - [ ] Error displays slide in
  - [ ] Results fade in on completion
- **Testing**: Visual inspection
- **Files**: Component CSS/Tailwind classes
- **Traceability**: [Spec §R4.3]

## Phase 5: Testing & Quality Assurance (P1/P2)

### Unit Test Tasks

**T5.1: Write unit tests for CandidatePool** [P]
- **ID**: T5.1
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T1.2
- **Description**: Comprehensive tests for object pooling
- **Acceptance Criteria**:
  - [ ] testAcquireRelease: basic acquire/release flow
  - [ ] testThreadSafety: 10 threads, 100 operations each
  - [ ] testMaxPoolSize: pool doesn't exceed limit
  - [ ] testReset: data cleared between reuses
- **Testing**: JUnit 5 tests
- **Files**: `src/test/java/core/Crafting/CandidatePoolTest.java`
- **Traceability**: [Spec §R5.1]

**T5.2: Write unit tests for BeamSearchConfig** [P]
- **ID**: T5.2
- **Priority**: P1
- **Effort**: 1 hour
- **Dependencies**: T2.1
- **Description**: Test config calculations and validation
- **Acceptance Criteria**:
  - [ ] testComplexityCalculation: correct complexity for different mod counts
  - [ ] testBeamWidthCalculation: correct width for each complexity
  - [ ] testScoringWeights: getters/setters work correctly
- **Testing**: JUnit 5 tests
- **Files**: `src/test/java/core/Crafting/BeamSearchConfigTest.java`
- **Traceability**: [Spec §R5.1]

**T5.3: Write unit tests for ProgressTracker** [P]
- **ID**: T5.3
- **Priority**: P1
- **Effort**: 2 hours
- **Dependencies**: T3.1
- **Description**: Test progress tracking and cancellation
- **Acceptance Criteria**:
  - [ ] testProgressCalculation: percent, elapsed, ETA correct
  - [ ] testCancellation: cancel flag works
  - [ ] testConcurrentSessions: multiple sessions don't interfere
  - [ ] testSessionCleanup: endSession removes data
- **Testing**: JUnit 5 tests
- **Files**: `src/test/java/core/Crafting/ProgressTrackerTest.java`
- **Traceability**: [Spec §R5.1]

**T5.4: Write unit tests for MemoryMonitor** [P]
- **ID**: T5.4
- **Priority**: P1
- **Effort**: 1 hour
- **Dependencies**: T1.7
- **Description**: Test memory status detection
- **Acceptance Criteria**:
  - [ ] testMemoryStatus: correct status for different heap usage
  - [ ] testThresholds: WARNING at 85%, CRITICAL at 95%
- **Testing**: JUnit 5 tests with mock heap
- **Files**: `src/test/java/core/Crafting/MemoryMonitorTest.java`
- **Traceability**: [Spec §R5.1]

### Memory Test Tasks

**T5.5: Write memory optimization tests**
- **ID**: T5.5
- **Priority**: P1
- **Effort**: 3 hours
- **Dependencies**: T1.4 (already done during integration)
- **Description**: Formal memory tests for CI pipeline
- **Acceptance Criteria**:
  - [ ] testHeapUsageBeforeAfter: measure heap impact
  - [ ] testNoOutOfMemory: 6-modifier items complete
  - [ ] testMemoryLeaks: repeated calculations stable
  - [ ] Automated in CI with JMX metrics
- **Testing**: MemoryOptimizationTest.java
- **Files**: `src/test/java/core/Crafting/MemoryOptimizationTest.java`
- **Traceability**: [Spec §R5.2]

### Integration Test Tasks

**T5.6: Write IPC integration tests** [P]
- **ID**: T5.6
- **Priority**: P2
- **Effort**: 3 hours
- **Dependencies**: T3.2, T3.6
- **Description**: Test frontend-backend communication
- **Acceptance Criteria**:
  - [ ] testCalculateEndpoint: HTTP POST /api/calculate
  - [ ] testProgressEndpoint: HTTP GET /api/progress/{sessionId}
  - [ ] testCancelEndpoint: HTTP POST /api/cancel/{sessionId}
  - [ ] testErrorPropagation: backend errors reach frontend
- **Testing**: Integration test with running server
- **Files**: `src/test/java/integration/IPCIntegrationTest.java`, `src/test/integration/frontend.test.ts`
- **Traceability**: [Spec §R5.3]

### Performance Benchmark Tasks

**T5.7: Write performance benchmark suite**
- **ID**: T5.7
- **Priority**: P1
- **Effort**: 3 hours
- **Dependencies**: T2.3 (benchmark suite exists)
- **Description**: Formal performance tests for CI pipeline
- **Acceptance Criteria**:
  - [ ] benchmarkSimpleItem: <5 seconds
  - [ ] benchmarkMediumItem: <30 seconds
  - [ ] benchmarkComplexItem: <60 seconds
  - [ ] Automated in CI with time tracking
- **Testing**: PerformanceBenchmarkTest.java
- **Files**: `src/test/java/core/Crafting/PerformanceBenchmarkTest.java`
- **Traceability**: [Spec §R5.4]

**T5.8: Set up CI performance tracking**
- **ID**: T5.8
- **Priority**: P2
- **Effort**: 2 hours
- **Dependencies**: T5.7
- **Description**: Track performance over time in CI
- **Acceptance Criteria**:
  - [ ] Benchmarks run on every PR
  - [ ] Results stored for comparison
  - [ ] Alert if regression >10%
- **Testing**: CI configuration
- **Files**: `.github/workflows/performance.yml`
- **Traceability**: [Spec §R5.4]

## Phase 6: Documentation (P3)

### Technical Documentation Tasks

**T6.1: Write algorithm design document** [P]
- **ID**: T6.1
- **Priority**: P3
- **Effort**: 4 hours
- **Dependencies**: None
- **Description**: Comprehensive algorithm explanation with math notation
- **Acceptance Criteria**:
  - [ ] Mathematical notation for beam search
  - [ ] Scoring function formulas
  - [ ] Heuristic explanations
  - [ ] Complexity analysis
- **Testing**: Review by team
- **Files**: `docs/algorithm-design.md`
- **Traceability**: [Spec §R6.1]

**T6.2: Write architecture decision records** [P]
- **ID**: T6.2
- **Priority**: P3
- **Effort**: 3 hours
- **Dependencies**: None
- **Description**: Document key architectural decisions
- **Acceptance Criteria**:
  - [ ] ADR-001: Beam search algorithm choice
  - [ ] ADR-002: Object pooling for memory optimization
  - [ ] ADR-003: HTTP-based IPC protocol
  - [ ] ADR-004: Scoring weight optimization results
- **Testing**: Review by team
- **Files**: `docs/architecture-decisions/ADR-*.md`
- **Traceability**: [Spec §R6.1]

### Code Documentation Tasks

**T6.3: Add JavaDoc to core classes** [P]
- **ID**: T6.3
- **Priority**: P2
- **Effort**: 3 hours
- **Dependencies**: None
- **Description**: Document all public methods with JavaDoc
- **Acceptance Criteria**:
  - [ ] Crafting_Algorithm: all public methods documented
  - [ ] CandidatePool: all public methods documented
  - [ ] BeamSearchConfig: all public methods documented
  - [ ] Generated JavaDoc builds without warnings
- **Testing**: `mvn javadoc:javadoc` succeeds
- **Files**: All Java classes in `src/main/java/core/`
- **Traceability**: [Spec §R6.2]

**T6.4: Add TSDoc to frontend hooks/components** [P]
- **ID**: T6.4
- **Priority**: P2
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Document all exported functions and components
- **Acceptance Criteria**:
  - [ ] useCraftingSimulator: function and interface documented
  - [ ] useCalculationProgress: function and interface documented
  - [ ] All components: props interfaces documented
- **Testing**: TypeScript compiler checks
- **Files**: All TypeScript files in `src/hooks/` and `src/components/`
- **Traceability**: [Spec §R6.2]

### User Documentation Tasks

**T6.5: Update README.md with v1.0 features** [P]
- **ID**: T6.5
- **Priority**: P3
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Update README with new features and screenshots
- **Acceptance Criteria**:
  - [ ] List v1.0 features (progress tracking, memory optimization, etc.)
  - [ ] Updated screenshots showing new UI
  - [ ] Performance metrics (computation times)
- **Testing**: Review by team
- **Files**: `README.md`
- **Traceability**: [Spec §R6.3]

**T6.6: Write troubleshooting guide** [P]
- **ID**: T6.6
- **Priority**: P3
- **Effort**: 2 hours
- **Dependencies**: None
- **Description**: Document common issues and solutions
- **Acceptance Criteria**:
  - [ ] Heap space errors: how to increase heap size
  - [ ] Slow calculations: optimization suggestions
  - [ ] Connection errors: backend not running
  - [ ] Platform-specific issues
- **Testing**: Review by team
- **Files**: `docs/troubleshooting.md`
- **Traceability**: [Spec §R6.3]

## Phase 7: Final Polish & Release (P1)

### Testing & Validation

**T7.1: Run full test suite and fix failures**
- **ID**: T7.1
- **Priority**: P1
- **Effort**: 4 hours
- **Dependencies**: All previous tasks
- **Description**: Ensure all tests pass before release
- **Acceptance Criteria**:
  - [ ] All unit tests pass (>80% coverage)
  - [ ] All memory tests pass (no OOM)
  - [ ] All integration tests pass (IPC working)
  - [ ] All performance benchmarks pass (<60s complex)
- **Testing**: `mvn test && npm test`
- **Files**: N/A (validation task)
- **Traceability**: [Spec - Success Criteria]

**T7.2: Manual testing of end-to-end scenarios**
- **ID**: T7.2
- **Priority**: P1
- **Effort**: 3 hours
- **Dependencies**: T7.1
- **Description**: Test full user workflows
- **Acceptance Criteria**:
  - [ ] Simple item calculation works
  - [ ] Complex item calculation completes
  - [ ] Progress tracking displays correctly
  - [ ] Cancellation works instantly
  - [ ] Error messages are user-friendly
- **Testing**: Manual QA
- **Files**: N/A (validation task)
- **Traceability**: [Spec - Success Criteria]

### Release Preparation

**T7.3: Update CHANGELOG.md with v1.0 changes**
- **ID**: T7.3
- **Priority**: P1
- **Effort**: 1 hour
- **Dependencies**: All implementation tasks
- **Description**: Document all changes for v1.0 release
- **Acceptance Criteria**:
  - [ ] All new features listed
  - [ ] All bug fixes listed
  - [ ] Breaking changes documented (if any)
  - [ ] Migration guide included (if needed)
- **Testing**: Review by team
- **Files**: `CHANGELOG.md`
- **Traceability**: [Spec - Success Criteria]

**T7.4: Tag v1.0.0 release**
- **ID**: T7.4
- **Priority**: P1
- **Effort**: 0.5 hours
- **Dependencies**: T7.1, T7.2, T7.3
- **Description**: Create Git tag and GitHub release
- **Acceptance Criteria**:
  - [ ] Git tag v1.0.0 created
  - [ ] GitHub release created with changelog
  - [ ] Release binaries built for Windows/macOS/Linux
  - [ ] Release notes include known issues (if any)
- **Testing**: Release validation
- **Files**: Git tags, GitHub releases
- **Traceability**: [Spec - Success Criteria]

## Task Summary

**Total Tasks**: 52  
**By Priority**:
- P1 (Critical): 31 tasks (~62 hours)
- P2 (High): 13 tasks (~26 hours)
- P3 (Medium): 8 tasks (~16 hours)

**Total Estimated Effort**: ~104 hours (13 days full-time)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel

## Checklist Compliance

Before marking phase complete, verify:
- [ ] All phase tasks completed
- [ ] Tests written and passing
- [ ] Code documented (JavaDoc/TSDoc)
- [ ] Constitutional compliance checked
- [ ] No regressions introduced
- [ ] Performance targets met
- [ ] Memory targets met

## References

- [Specification](./spec.md)
- [Technical Plan](./plan.md)
- [Constitution](../../memory/constitution.md)
- [Implementation Patterns](../../../.github/prompts/speckit.implement.prompt.md)
