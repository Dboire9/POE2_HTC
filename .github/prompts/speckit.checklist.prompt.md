---
agent: speckit.checklist
---

You are creating requirement quality validation checklists for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Checklist Purpose: Requirements Quality Validation

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements documentation, NOT implementation verification.

### NOT for Implementation Verification
- ❌ NOT "Verify the beam search calculates correctly"
- ❌ NOT "Test progress bar displays accurately"
- ❌ NOT "Confirm memory optimization works"
- ❌ NOT checking if code/implementation matches the spec

### FOR Requirements Quality Validation
- ✅ "Are memory impact requirements quantified with specific heap targets? [Clarity]"
- ✅ "Is 'optimized' defined with measurable performance criteria? [Completeness]"
- ✅ "Are algorithm preservation requirements consistent across all specs? [Consistency]"
- ✅ "Can computation time limits be objectively verified? [Measurability]"
- ✅ "Are cancellation requirements specified for all long operations? [Coverage]"

## POE2_HTC Checklist Context

### Project-Specific Requirements Quality Focus

**Constitution Alignment** (CRITICAL):
- Are algorithm integrity requirements explicitly stated?
- Is core beam search preservation clearly documented?
- Are parameter optimization boundaries defined?
- Do requirements distinguish structure changes vs. parameter tuning?

**Performance Standards** (CRITICAL):
- Are memory requirements quantified with heap targets?
- Is the 1-minute computation limit explicitly specified?
- Are progress tracking requirements detailed?
- Is cancellation capability clearly defined?

**Technical Architecture**:
- Are frontend/backend responsibilities clearly separated?
- Is TypeScript strict mode compliance documented?
- Are IPC communication patterns specified?
- Is state management approach defined?

### POE2_HTC Checklist Categories

#### Algorithm Integrity Requirements (CRITICAL)
Questions testing if algorithm requirements are well-specified:
- "Is core beam search structure preservation explicitly documented? [Completeness, Constitution]"
- "Are parameter optimization boundaries clearly defined (beam width, scoring weights)? [Clarity]"
- "Is the distinction between structure changes and parameter tuning unambiguous? [Clarity]"
- "Are algorithmic equivalence requirements specified for any simplifications? [Completeness]"
- "Is explicit approval required documented for algorithm behavior changes? [Governance]"

#### Memory & Performance Requirements (IMMEDIATE PRIORITY)
Questions testing if performance specs are measurable:
- "Are heap memory targets quantified with specific limits (e.g., <2GB for 6-modifier items)? [Clarity]"
- "Is the 1-minute computation time limit explicitly stated for complex scenarios? [Completeness]"
- "Are memory optimization strategies specified (pooling, efficient structures)? [Completeness]"
- "Is graceful degradation behavior defined when approaching memory limits? [Edge Case]"
- "Can memory impact be objectively measured for each feature? [Measurability]"
- "Are GC optimization requirements documented? [Gap]"

#### Progress & Cancellation Requirements
Questions about real-time feedback specifications:
- "Are progress indicator update frequencies specified (e.g., every 100ms)? [Clarity]"
- "Is cancellation mechanism behavior clearly defined? [Completeness]"
- "Are partial result handling requirements specified for interrupted operations? [Edge Case]"
- "Is frontend responsiveness during backend operations explicitly required? [Coverage]"

#### Architecture & Code Quality Requirements
Questions about architectural clarity:
- "Are frontend (Electron/React) and backend (Java) responsibilities clearly delineated? [Clarity]"
- "Is TypeScript strict mode compliance explicitly required? [Completeness]"
- "Are IPC communication patterns and data formats specified? [Clarity]"
- "Is state management approach (Redux/Zustand vs simple) decided and documented? [Gap]"
- "Are dependency addition criteria clearly defined? [Governance]"

#### Testing Requirements Quality
Questions about test specification completeness:
- "Are unit test requirements specified for all NEW algorithm components? [Coverage]"
- "Are integration test scenarios defined for IPC communication? [Completeness]"
- "Are memory stress test requirements detailed with specific scenarios? [Clarity]"
- "Are performance benchmark baselines and targets documented? [Measurability]"
- "Are regression test requirements specified for probability calculations? [Coverage]"

#### POE2 Domain Requirements (Boundary Validation)
Questions about game mechanics scope:
- "Are all POE2 mechanics documented as officially released? [Validation]"
- "Is explicit approval requirement documented for new mechanics? [Governance]"
- "Are speculative or unreleased features explicitly excluded? [Scope]"
- "Is league/season update compatibility clearly specified? [Completeness]"

### Checklist Item Patterns for POE2_HTC

#### Completeness Pattern
- "Are [requirement type] defined for [scenario/component]? [Completeness]"
- "Is [critical aspect] explicitly documented in requirements? [Gap]"

**Examples**:
- "Are memory optimization requirements defined for all algorithm components? [Completeness]"
- "Is cancellation capability specified for all operations >5 seconds? [Gap]"

#### Clarity Pattern
- "Is [vague term] quantified with specific [metric/criteria]? [Clarity]"
- "Can [requirement] be objectively measured/verified? [Measurability]"

**Examples**:
- "Is 'memory efficient' quantified with specific heap reduction targets? [Clarity]"
- "Can 'responsive UI' be objectively measured with timing thresholds? [Measurability]"

#### Consistency Pattern
- "Are [requirements] consistent between [section A] and [section B]? [Consistency]"
- "Is [terminology] used consistently across all specifications? [Consistency]"

**Examples**:
- "Are beam width parameters consistent across algorithm and performance specs? [Consistency]"
- "Is memory terminology (heap, GC, pooling) used consistently? [Consistency]"

#### Coverage Pattern
- "Are requirements defined for [edge case/scenario type]? [Coverage, Edge Case]"
- "Are [exception/error scenarios] addressed in requirements? [Coverage, Exception Flow]"

**Examples**:
- "Are requirements defined for heap exhaustion recovery scenarios? [Coverage, Exception Flow]"
- "Are edge cases specified for concurrent calculations? [Coverage, Edge Case]"

### Traceability Requirements (MANDATORY)

**Minimum**: ≥80% of checklist items MUST include traceability references:
- `[Spec §X.Y]` - Reference to specific spec section
- `[Gap]` - Identifies missing requirements
- `[Ambiguity]` - Flags unclear requirements
- `[Conflict]` - Identifies contradictory requirements
- `[Assumption]` - Questions undocumented assumptions

**Examples**:
- "Is heap memory target specified for object pooling? [Clarity, Spec §3.2]"
- "Are GC tuning requirements documented? [Gap]"
- "Do algorithm optimization and performance sections agree on beam width? [Consistency, Spec §2.1 vs §4.3]"

### POE2_HTC Checklist Types

#### Memory Optimization Checklist (`memory.md`)
Sample items:
- "Are heap memory targets quantified for each major component? [Clarity]"
- "Is object pooling strategy specified with pool sizes? [Completeness, Spec §3.2]"
- "Are GC algorithm and tuning parameters documented? [Gap]"
- "Is graceful degradation behavior defined at 90% heap usage? [Edge Case]"
- "Can memory optimization success be objectively measured? [Measurability]"
- "Are memory stress test scenarios detailed? [Coverage]"

#### Algorithm Requirements Checklist (`algorithm.md`)
Sample items:
- "Is core beam search structure preservation explicitly required? [Completeness, Constitution]"
- "Are parameter optimization boundaries (beam width, scoring) clearly defined? [Clarity, Spec §2.1]"
- "Is algorithmic equivalence required for all modifications? [Completeness, Constitution]"
- "Are approval requirements documented for algorithm changes? [Governance]"
- "Is the distinction between structure and parameter changes unambiguous? [Clarity]"

#### Performance Requirements Checklist (`performance.md`)
Sample items:
- "Is the 1-minute computation limit explicitly stated? [Completeness, Spec §4.1]"
- "Are progress update frequencies specified? [Clarity]"
- "Is cancellation mechanism behavior clearly defined? [Completeness]"
- "Are performance benchmarks defined with baselines and targets? [Measurability]"
- "Is frontend responsiveness quantified with specific thresholds? [Clarity, Gap]"

#### UI/UX Requirements Checklist (`ux.md`)
Sample items:
- "Are visual hierarchy requirements defined with specific styling? [Clarity]"
- "Is dark mode theming completely specified? [Completeness]"
- "Are interaction state requirements (hover, focus, active) documented? [Coverage]"
- "Is error message content and presentation detailed? [Clarity, Spec §5.3]"
- "Are accessibility requirements specified for all interactive elements? [Gap]"

### Checklist Generation Rules

**Item Construction**:
1. Start with question format: "Are...", "Is...", "Does..."
2. Focus on requirement quality dimension
3. Include specific POE2_HTC context
4. Add quality dimension tag: [Completeness], [Clarity], etc.
5. Add traceability: [Spec §X.Y], [Gap], [Conflict]

**Priority Focus**:
- P1 requirements (v1.0 blockers) get deeper scrutiny
- Constitutional requirements (algorithm, performance) are mandatory
- Memory optimization requirements are immediate priority
- Testing requirements must be comprehensive

**Coverage Strategy**:
- Primary scenarios: Main crafting calculation flow
- Alternate scenarios: Different currency paths
- Exception scenarios: Memory exhaustion, timeouts
- Recovery scenarios: Cancellation, error handling
- Non-functional: Performance, memory, responsiveness

### Success Criteria for Checklists

A quality checklist:
- ✅ Tests requirement quality, not implementation
- ✅ Covers all constitutional principles
- ✅ Includes ≥80% traceability references
- ✅ Focuses on v1.0 completion priorities
- ✅ Addresses critical memory and performance requirements
- ✅ Validates measurability of success criteria
- ✅ Identifies gaps, ambiguities, and conflicts

### Anti-Examples: What NOT To Do

**❌ WRONG - Testing Implementation**:
```
- [ ] Verify beam search calculates optimal paths correctly
- [ ] Test that progress bar updates in real-time
- [ ] Confirm memory pooling reduces heap usage by 70%
```

**✅ CORRECT - Testing Requirements Quality**:
```
- [ ] Are optimal path calculation criteria explicitly defined? [Completeness, Spec §2.1]
- [ ] Is progress bar update frequency specified (e.g., 100ms)? [Clarity, Gap]
- [ ] Is the 70% memory reduction target documented as success criteria? [Measurability, Spec §3.4]
```

Remember: POE2_HTC checklists validate that requirements are clear, complete, and ready for implementation - they are NOT tests of whether the implementation works correctly. Focus on requirement quality dimensions: Completeness, Clarity, Consistency, Measurability, Coverage.