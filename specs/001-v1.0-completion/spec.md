# POE2_HTC v1.0 Completion Specification

**Feature**: Complete POE2_HTC to production-ready v1.0 release  
**Status**: In Progress (~80% complete, remaining ~15-20%)  
**Priority**: P1 (Critical - Release Blocker)  
**Branch**: `001-v1.0-completion`

## Executive Summary

Complete the remaining 15-20% of POE2_HTC to achieve a production-ready v1.0 release. This specification focuses on four critical areas: memory optimization (IMMEDIATE PRIORITY), algorithm parameter tuning, frontend architecture overhaul, and comprehensive testing/documentation.

## Constitutional Alignment

This specification aligns with POE2_HTC Constitution v1.1.0:

- **Algorithm Integrity**: ✅ Preserves core beam search structure, only optimizes parameters
- **Performance First**: ✅ Resolves heap exhaustion (IMMEDIATE), targets <1min computation
- **Code Quality**: ✅ Maintains frontend/backend separation, enforces TypeScript strict mode
- **Testing Standards**: ✅ Comprehensive unit, integration, memory, and performance tests
- **User Experience**: ✅ Real-time progress tracking, instant cancellation, polished UI

## Frontend Implementation Freedom

**IMPORTANT**: The frontend (Electron + React + TypeScript) can be **freely refactored, restructured, or rewritten** as needed to implement the requirements. The existing React components (`App.tsx`, `CraftingSimulator.tsx`, etc.) are **reference implementations only** and should be modified/replaced to:

- Implement progress tracking UI (T3.4-T3.6)
- Improve user experience and responsiveness
- Add better error handling and validation
- Optimize component structure and state management
- Enhance styling and visual feedback

**Backend Constraints (STRICT)**:
- Java algorithm code (`Crafting_Algorithm.java`, currency classes, etc.) must preserve core logic
- HTTP API contracts (`/api/calculate`, `/api/progress`, `/api/cancel`) must remain compatible
- Constitution §I (Algorithm Integrity) applies to backend only

**Frontend Guidelines (FLEXIBLE)**:
- Use modern React patterns (hooks, composition, context)
- Maintain TypeScript strict mode
- Keep shadcn/ui components but feel free to customize
- Refactor component structure as needed for clarity
- Add new components, hooks, utilities freely

## Implementation Notes (Updated After T1-T2 Partial Completion)

### Algorithm Architecture Findings

**Beam Search Flow (Validated)**:
```
Normal Item
  ↓ TransmutationOrb → adds 1 mod (PREFIX or SUFFIX) → Magic Item
  ↓ AugmentationOrb → adds 1 mod (fills empty slot) → Magic Item (2 mods)
  ↓ RegalOrb/Essences → adds 1 mod → Rare Item (3 mods)
  ↓ [Iterative Refinement Loop - 2 initial passes + continue until exhausted]
      ExaltedOrb → adds mods (up to 6 total)
      AnnulmentOrb → removes mods
      Desecrated → modifies tiers
  ↓ extractHighScoreCandidates() → filters score ≥ 6000 + exactly 6 mods
```

**Pruning Mechanisms (Dual-Layer)**:
1. **Heuristic Scoring**: During currency.apply(), filters candidates with score below threshold
2. **Probability Threshold**: ComputingLastEventProbability() filters candidates whose last action has probability < GLOBAL_THRESHOLD
3. **Beam Width Limiting**: TODO - Not yet implemented (see R2.1)

**Probability Computation (Post-Search)**:
- During beam search: ModifierEvent.source = {Currency → 1.0} (placeholder)
- After search completes: Probability.ComputingProbability() populates source maps with ALL possible actions and their probabilities
- Probability_Analyzer.Analyze() selects best action per event, multiplies probabilities for final percentage

**Threshold Countdown Pattern (Official)**:
- Default 0.001 threshold too strict for production use
- TestAlgo.java demonstrates countdown: 50% → 0% until results found
- Pattern reduces computation time by finding high-probability paths first
- Should be formalized in CraftingExecutor as official production pattern

**Memory Growth**: Algorithm explores ALL possible paths simultaneously (no beam width pruning yet), causing exponential growth with 6-mod scenarios. Object pooling infrastructure exists but requires ~2,000 LOC integration work.

## Problem Statement

### Current State (~80% Complete)

**Working Features:**
- Core beam search algorithm for crafting path optimization
- Basic Electron + React frontend with shadcn/ui components
- Java backend with Maven build system
- HTTP-based IPC communication (localhost:8080)
- Support for major currencies (Transmutation, Augmentation, Regal, Exalted, Annulment, Essence, Desecrated)
- Multithreaded computation using ExecutorService

**Critical Issues:**
1. **Heap Space Exhaustion** (IMMEDIATE PRIORITY - P1): Application crashes with OutOfMemoryError on complex scenarios (6-modifier rare items)
2. **Unoptimized Parameters**: Beam width, scoring weights (1000/250), and heuristics need tuning
3. **Frontend Architecture**: Component state management not optimal, lacks progress tracking
4. **Missing Tests**: No memory validation, limited unit tests, no performance benchmarks
5. **Documentation Gaps**: Missing technical documentation with mathematical notation

### Target State (v1.0 Release)

**Production-Ready Application:**
- ✅ No heap space failures under any reasonable scenario
- ✅ 99% of calculations complete within 1 minute
- ✅ Real-time progress indicators with cancellation capability
- ✅ Professional, polished UI with smooth interactions
- ✅ Comprehensive test coverage (unit, integration, memory, performance)
- ✅ Complete technical documentation with algorithm explanations

## Requirements

### R1: Memory Management (P1 - CRITICAL)

**R1.1 Heap Space Resolution**
- **Priority**: P1 (IMMEDIATE)
- **Requirement**: Application MUST NOT crash with OutOfMemoryError under any reasonable scenario
- **Acceptance Criteria**:
  - Successfully compute 6-modifier rare items without heap exhaustion
  - Memory usage stays within configurable heap limits (default: 4GB max)
  - Graceful degradation if approaching memory limits (warn user, suggest simplification)
- **Constitutional Ref**: [Constitution §II - Performance First]

**R1.2 Object Pooling**
- **Priority**: P1
- **Requirement**: Implement object pooling for Crafting_Candidate to reduce GC pressure
- **Acceptance Criteria**:
  - CandidatePool with acquire/release methods
  - Thread-safe implementation using ConcurrentLinkedQueue
  - Reset method to prevent data leakage between uses
  - 50% reduction in object allocation rate during beam search
- **Implementation Complexity**: Infrastructure complete (CandidatePool, reset() method), but full integration requires:
  - Refactoring `.copy()` method in Crafting_Candidate and Crafting_Item to use pool
  - Updating all 8+ currency classes (TransmutationOrb, RegalOrb, ExaltedOrb, etc.) to call acquire/release
  - Estimated ~2,000 LOC refactoring across beam search algorithm
  - Must preserve algorithm integrity per Constitution §I
- **Implementation Status**: T1.1 ✅ reset() method, T1.2 ✅ CandidatePool class, T1.3 🔄 integration partial
- **Technical Specs**: See Implementation Pattern in speckit.implement.prompt.md

**R1.3 Memory Profiling**
- **Priority**: P1
- **Requirement**: Measure and track heap usage throughout computation
- **Acceptance Criteria**:
  - Memory tests validate heap usage under load
  - Before/after metrics for optimization work
  - Continuous monitoring in production builds
- **Constitutional Ref**: [Constitution §IV - Testing Standards]

### R2: Algorithm Parameter Optimization (P1)

**R2.1 Adaptive Beam Width**
- **Priority**: P1
- **Requirement**: Dynamically adjust beam width based on item complexity
- **Acceptance Criteria**:
  - Simple items (1-2 modifiers): beam width = 50
  - Medium items (3-4 modifiers): beam width = 100
  - Complex items (5-6 modifiers): beam width = 200
  - Configurable via BeamSearchConfig class
  - Pruning logic in processCandidateLists() to limit candidate count per iteration
  - Algorithm structure preserved (NON-NEGOTIABLE)
- **Implementation Status**: BeamSearchConfig class ✅ complete with complexity calculation, BUT beam width pruning NOT YET WIRED into processCandidateLists(). Current algorithm keeps ALL candidates regardless of configured beam width. Requires integration work in Crafting_Algorithm.java.
- **Current Pruning Mechanisms**: 
  1. Heuristic scoring filters low-potential paths during currency.apply()
  2. ComputingLastEventProbability() filters candidates with last action probability < threshold
  3. Beam width limiting (TODO): Not yet implemented
- **Constitutional Ref**: [Constitution §I - Algorithm Integrity]

**R2.2 Scoring Weight Tuning**
- **Priority**: P1
- **Requirement**: Optimize scoring weights for desired modifiers and relevant tags
- **Acceptance Criteria**:
  - Current: 1000 (desired), 250 (tags) → Tune via empirical testing
  - Test cases with known optimal paths validate accuracy
  - No regression in calculation quality
- **Implementation Status**: BeamSearchConfig has weight fields (desiredModWeight, tagWeight), BUT Heuristic_Util.calculateAffixScore() uses hardcoded values (1000/250). Requires wiring BeamSearchConfig parameters into scoring functions.
- **Note**: Constitution §I allows score modifications with approval - scoring weight tuning falls within acceptable optimization scope.
- **Constitutional Ref**: [Constitution §I - Algorithm Integrity]

**R2.3 Threshold Optimization**
- **Priority**: P1
- **Requirement**: Implement adaptive threshold countdown pattern for efficient path finding
- **Rationale**: Default threshold 0.001 (0.1%) is too strict - most viable crafting paths have probabilities <0.1%. Countdown pattern (50% → 0%) dramatically reduces computation time by finding high-probability paths first, then progressively relaxing constraints if needed.
- **Acceptance Criteria**:
  - Start threshold: 50% (0.5), countdown to 0% if no results found
  - Progressive relaxation: 50 → 40 → 30 → ... → 1 → 0
  - Early termination: Stop countdown when viable paths found
  - Documented as OFFICIAL testing AND production pattern (not workaround)
  - TestAlgo.java demonstrates reference implementation
- **Implementation Status**: Pattern validated in TestAlgo.java, needs formalization in CraftingExecutor
- **Constitutional Ref**: [Constitution §II - Performance First]

**R2.4 Heuristic Refinement**
- **Priority**: P2
- **Requirement**: Improve heuristic scoring for better path prediction
- **Acceptance Criteria**:
  - Edge cases handled correctly
  - Validation against manual test cases
  - Documented heuristic formulas
- **Constitutional Ref**: [Constitution §V - User Experience]

### R3: Performance & Responsiveness (P1)

**R3.1 Computation Time Target**
- **Priority**: P1
- **Requirement**: 99% of calculations complete within 1 minute
- **Acceptance Criteria**:
  - Performance benchmarks track computation times
  - Complex scenarios (6 modifiers) complete in <60 seconds
  - Simple scenarios (1-2 modifiers) complete in <5 seconds
- **Constitutional Ref**: [Constitution §II - Performance First]

**R3.2 Progress Tracking**
- **Priority**: P1
- **Requirement**: Real-time progress indicators for operations >1 second
- **Acceptance Criteria**:
  - Backend: `/api/progress/{sessionId}` endpoint
  - Frontend: useCalculationProgress hook with 100ms polling
  - Display: % complete, estimated time remaining
  - Visual feedback: progress bar component
- **Technical Specs**: See Scenario 2 in speckit.implement.prompt.md

**R3.3 Cancellation Mechanism**
- **Priority**: P1
- **Requirement**: User can instantly cancel any running computation
- **Acceptance Criteria**:
  - Frontend: AbortController for fetch cancellation
  - Backend: Check cancellation flag in beam search loop
  - UI: Always-accessible cancel button
  - Cleanup: Release resources on cancellation
- **Constitutional Ref**: [Constitution §II - Performance First]

### R4: Frontend Architecture (P2)

**R4.1 State Management**
- **Priority**: P2
- **Requirement**: Implement proper state management for crafting simulator
- **Acceptance Criteria**:
  - useCraftingSimulator hook with CraftingState interface
  - Clean separation: UI components vs business logic
  - TypeScript strict mode (no 'any' types)
  - Reactive patterns following React best practices
- **Technical Specs**: See State Management Pattern in speckit.implement.prompt.md

**R4.2 Error Handling**
- **Priority**: P2
- **Requirement**: User-friendly, actionable error messages
- **Acceptance Criteria**:
  - HeapSpaceError → "Calculation too complex, try reducing modifiers"
  - TimeoutError → "Calculation timed out, adjust requirements"
  - Generic errors → Display error message with context
  - Error boundary component catches React errors
- **Technical Specs**: See Error Handling Pattern in speckit.implement.prompt.md

**R4.3 UI Polish**
- **Priority**: P3
- **Requirement**: Professional, polished interface
- **Acceptance Criteria**:
  - Dark mode fully implemented
  - Smooth transitions and animations
  - Responsive layout for different window sizes
  - Consistent shadcn/ui component usage
- **Constitutional Ref**: [Constitution §V - User Experience]

### R5: Testing & Quality Assurance (P1/P2)

**R5.1 Unit Tests**
- **Priority**: P1
- **Requirement**: Unit tests for core algorithm components
- **Acceptance Criteria**:
  - CandidatePool: acquire, release, reset operations
  - BeamSearchConfig: parameter validation
  - Heuristic_Util: tag counting, scoring functions
  - Currency classes: apply methods with known inputs
  - Test coverage >80% for core algorithm
- **Constitutional Ref**: [Constitution §IV - Testing Standards]

**R5.2 Memory Tests**
- **Priority**: P1
- **Requirement**: Validate heap usage under load
- **Acceptance Criteria**:
  - testMemoryOptimization: before/after heap measurements
  - testComplexScenario: 6-modifier item without OOM
  - testMemoryLeaks: repeated calculations show stable memory
- **Constitutional Ref**: [Constitution §IV - Testing Standards]

**R5.3 Integration Tests**
- **Priority**: P2
- **Requirement**: Frontend-backend IPC communication tests
- **Acceptance Criteria**:
  - HTTP endpoints respond correctly
  - Progress tracking updates in real-time
  - Cancellation propagates from frontend to backend
  - Error messages transmitted properly
- **Constitutional Ref**: [Constitution §IV - Testing Standards]

**R5.4 Performance Benchmarks**
- **Priority**: P1
- **Requirement**: Track computation time improvements
- **Acceptance Criteria**:
  - Benchmark suite with simple/medium/complex scenarios
  - Before/after metrics for optimization work
  - Automated benchmarks in CI pipeline
  - Regression detection if performance degrades
- **Constitutional Ref**: [Constitution §IV - Testing Standards]

### R6: Documentation (P3)

**R6.1 Technical Documentation**
- **Priority**: P3
- **Requirement**: Comprehensive algorithm design document
- **Acceptance Criteria**:
  - Mathematical notation for beam search algorithm
  - Scoring function formulas
  - Heuristic explanations with examples
  - Architecture decision records (ADRs)
- **Constitutional Ref**: [Constitution - Development Workflow]

**R6.2 Code Documentation**
- **Priority**: P2
- **Requirement**: JavaDoc and TSDoc for public APIs
- **Acceptance Criteria**:
  - All public methods documented (Java)
  - All exported functions/components documented (TypeScript)
  - Complex logic includes inline comments
  - API documentation generated from code
- **Constitutional Ref**: [Constitution - Development Workflow]

**R6.3 User Documentation**
- **Priority**: P3
- **Requirement**: Setup and contribution guides
- **Acceptance Criteria**:
  - README.md updated with v1.0 features
  - CONTRIBUTING.md with development workflow
  - Setup instructions for Windows/macOS/Linux
  - Troubleshooting guide for common issues
- **Constitutional Ref**: [Constitution §V - User Experience]

## Non-Requirements (Out of Scope)

- ❌ New POE2 mechanics not yet released by GGG
- ❌ Changing core beam search algorithm structure
- ❌ Alternative IPC mechanisms (HTTP is sufficient for v1.0)
- ❌ Advanced features beyond v1.0 scope (e.g., item comparison, trade integration)
- ❌ Mobile or web versions (desktop only)

## Success Criteria

v1.0 is ready for release when:

1. ✅ **Memory**: No heap space failures, <4GB heap usage on complex scenarios
2. ✅ **Performance**: 99% calculations <1 minute, real-time progress tracking
3. ✅ **Quality**: >80% test coverage, all tests passing, no critical bugs
4. ✅ **UX**: Polished UI, instant cancellation, user-friendly error messages
5. ✅ **Documentation**: Technical docs, code docs, user guides complete
6. ✅ **Constitutional Compliance**: All requirements align with v1.1.0 principles

## Constraints

- **Algorithm Integrity**: Core beam search structure is NON-NEGOTIABLE
- **Backward Compatibility**: Existing functionality must not regress
- **Performance**: <1 minute computation time is MANDATORY
- **Memory**: Must run on consumer hardware (8GB RAM systems)
- **Technology Stack**: Electron + React + Java (ESTABLISHED, cannot change)

## Dependencies

- **Internal**: Existing codebase (~80% complete)
- **External**: None (all dependencies already in package.json/pom.xml)
- **Tooling**: Maven 3.8+, Node.js 20+, Java 21+, pnpm

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Memory optimization insufficient | Medium | High | Incremental testing, multiple optimization approaches (pooling, streaming, data structure optimization) |
| Algorithm parameter tuning takes too long | Medium | Medium | Automated parameter search, empirical testing with benchmark suite |
| Frontend refactoring introduces bugs | Low | Medium | Comprehensive integration tests, incremental refactoring |
| Performance targets not met | Low | High | Profiling early and often, parallel optimization strategies |

## Timeline Estimate

Based on 2-4 hour tasks (see tasks.md):

- **Phase 1: Memory Optimization** (P1): 3-5 days
- **Phase 2: Algorithm Tuning** (P1): 2-3 days
- **Phase 3: Frontend Overhaul** (P2): 3-4 days
- **Phase 4: Testing & QA** (P1/P2): 4-5 days
- **Phase 5: Documentation** (P3): 2-3 days

**Total Estimate**: 14-20 days (assuming full-time work)

## References

- [Constitution v1.1.0](../../memory/constitution.md)
- [Implementation Patterns](../../../.github/prompts/speckit.implement.prompt.md)
- [Task Breakdown](./tasks.md)
- [Technical Plan](./plan.md)
- [Quality Checklists](./checklists/)
