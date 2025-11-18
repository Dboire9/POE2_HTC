---
agent: speckit.analyze
---

You are analyzing specifications, plans, and tasks for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Analysis Objectives

**CRITICAL**: Identify inconsistencies, duplications, ambiguities, and underspecified items across spec.md, plan.md, and tasks.md before implementation. The constitution is NON-NEGOTIABLE - any conflicts with constitutional principles are automatically CRITICAL.

### POE2_HTC Analysis Context

**Project State**: ~80% complete, focusing on v1.0 completion (remaining 15-20%)
**Critical Issue**: Heap space exhaustion under complex scenarios
**Constitution Authority**: Algorithm integrity and performance-first principles are absolute
**Analysis Focus**: Prevent implementation of specs that violate constitution or miss critical requirements

### Constitutional Validation (CRITICAL)

The POE2_HTC Constitution principles are **NON-NEGOTIABLE**. Flag as CRITICAL any violation of:

#### I. Algorithm Integrity Violations (CRITICAL)
- Changes to core beam search structure without explicit approval
- Modifications that don't maintain algorithmic equivalence
- Unclear distinction between parameter optimization (allowed) vs. structural changes (forbidden)
- Missing approval verification for algorithm behavior changes

**Detection Patterns**:
- "refactor beam search", "redesign algorithm", "new search approach"
- Changes to fundamental search logic without "parameter" or "optimization" qualifiers
- Modifications to beam search without explicit algorithm preservation statements

#### II. Performance-First Violations (CRITICAL)
- Missing memory impact analysis for new features
- No heap optimization strategy for memory-intensive operations
- Computation time requirements exceeding 1-minute limit
- Missing progress indicators or cancellation capability
- Blocking frontend operations during backend processing

**Detection Patterns**:
- New features without memory footprint analysis
- Operations without timeout/cancellation mechanisms
- Synchronous frontend calls to backend
- Missing heap usage considerations

#### III. Code Quality Violations (MANDATORY)
- Blurred frontend/backend boundaries
- TypeScript 'any' types without explicit justification
- Unjustified new dependencies
- Missing consideration for multi-league evolution

**Detection Patterns**:
- Frontend code handling business logic
- Backend code manipulating UI state
- New dependencies without justification
- Hard-coded POE2 season-specific values

#### IV. Testing Violations (COMPREHENSIVE)
- Missing memory stress tests for new algorithm components
- No integration tests for IPC changes
- Missing probability validation against manual cases
- No regression tests for critical paths

**Detection Patterns**:
- New algorithm features without unit tests
- IPC changes without integration tests
- Probability calculations without validation
- Performance changes without benchmarks

#### V. User Experience & Domain Violations
- POE2 mechanics not officially released
- Speculative or unreleased content
- Missing progress feedback for long operations
- Poor error handling or user feedback

**Detection Patterns**:
- "upcoming league", "future mechanic", "anticipated feature"
- Operations >5 seconds without progress indicators
- Generic error messages without actionable guidance

### Analysis Detection Passes

#### A. Duplication Detection
**Focus**: Near-duplicate requirements across spec.md, plan.md, tasks.md

**POE2_HTC Specific Patterns**:
- Multiple mentions of "memory optimization" with different phrasing
- Redundant "beam search" parameter tuning tasks
- Duplicate progress indicator requirements
- Overlapping frontend/backend IPC specifications

**Flag HIGH if**: Duplicates differ in critical details (may cause conflicting implementations)

#### B. Ambiguity Detection (HIGH SIGNAL)
**Focus**: Vague requirements without measurable criteria

**POE2_HTC Red Flags**:
- "optimize memory" without specific heap targets
- "improve performance" without timing metrics
- "better UI" without specific improvements
- "efficient algorithm" without performance baselines
- Placeholders: TODO, TKTK, ???, `<placeholder>`, TBD

**Flag HIGH if**: Ambiguity affects algorithm integrity or performance targets

#### C. Underspecification Detection
**Focus**: Missing critical information for implementation

**POE2_HTC Critical Gaps**:
- Memory features without heap usage limits
- Algorithm changes without equivalence verification
- Performance requirements without computation time limits
- Frontend changes without responsiveness guarantees
- Backend operations without cancellation mechanisms

**Flag CRITICAL if**: Missing information could violate constitution

#### D. Constitution Alignment (CRITICAL)
**Focus**: Conflicts with MUST principles in constitution

**Automatic CRITICAL Flags**:
- Any algorithm structure change without approval reference
- Features without memory impact analysis
- Operations potentially exceeding 1-minute limit
- Missing mandatory testing categories
- New POE2 mechanics without approval verification

#### E. Coverage Gap Detection
**Focus**: Requirements without implementation tasks, tasks without requirements

**POE2_HTC Priorities**:
- P1 requirements MUST have tasks (v1.0 blockers)
- Memory optimization tasks MUST map to performance requirements
- Algorithm parameter tuning MUST map to optimization requirements
- Non-functional requirements (performance, memory) MUST have tasks

**Flag CRITICAL if**: P1 requirement has zero tasks
**Flag HIGH if**: Memory/performance requirement unmapped

#### F. Inconsistency Detection
**Focus**: Contradictions and terminology drift

**POE2_HTC Specific Checks**:
- Algorithm terminology: "beam search" vs "search algorithm" vs "optimization"
- Memory terminology: "heap", "memory pool", "GC optimization" used consistently?
- Frontend stack: React patterns, state management approach consistent?
- Backend stack: Java version, Maven configuration, threading model consistent?
- Priority conflicts: P1 task depending on P3 completion

**Flag CRITICAL if**: Algorithm or architecture contradictions
**Flag HIGH if**: Priority/dependency contradictions

### Severity Assignment (POE2_HTC Calibrated)

#### CRITICAL (Blocks v1.0 Release)
- Violates constitution MUST principles
- Algorithm integrity compromise
- Missing core memory optimization specification
- P1 requirement with zero coverage
- Heap space issue not addressed
- Performance requirements missing/contradictory

#### HIGH (Risks Quality/Timeline)
- Duplicate requirements with conflicting details
- Ambiguous memory/performance attributes
- Missing testing strategy for algorithm changes
- Unmapped non-functional requirements
- Frontend/backend boundary violations

#### MEDIUM (Technical Debt Risk)
- Terminology drift across documents
- Missing edge case specifications
- Incomplete documentation requirements
- Minor coverage gaps in P2/P3 features

#### LOW (Polish/Optimization)
- Style inconsistencies
- Minor redundancy in phrasing
- Documentation format preferences
- P4 feature gaps (post-v1.0)

### Analysis Output Format

Generate a **token-efficient** Markdown report with:

#### 1. Executive Summary
```
Total Issues: X (CRITICAL: N, HIGH: N, MEDIUM: N, LOW: N)
Constitution Violations: N
Coverage Rate: X% (requirements with ≥1 task)
Key Blockers: [Top 3 critical issues]
```

#### 2. Critical Issues Table (Max 20 rows)
| ID | Category | Severity | Location | Summary | Constitution Impact |
|----|----------|----------|----------|---------|---------------------|
| C1 | Constitution | CRITICAL | spec.md:L45 | Algorithm change without approval | Violates Principle I |

#### 3. Coverage Analysis
| Requirement | Priority | Has Tasks? | Task IDs | Constitution Category |
|-------------|----------|------------|----------|----------------------|
| Memory optimization | P1 | ❌ | None | Performance-First |

#### 4. Constitution Compliance Report
```
✅ Algorithm Integrity: N specs compliant, M violations
✅ Performance First: N specs compliant, M violations
✅ Code Quality: N specs compliant, M violations
✅ Testing Standards: N specs compliant, M violations
✅ User Experience: N specs compliant, M violations
```

#### 5. Recommendations (Prioritized)
```
IMMEDIATE (Before Any Implementation):
1. [Specific action for critical issue]
2. [Specific action for critical issue]

BEFORE v1.0:
1. [Specific action for high-priority issue]
2. [Specific action for high-priority issue]

TECHNICAL DEBT (Post-v1.0):
1. [Specific action for medium/low issues]
```

### Token Efficiency Rules

- **Limit findings to 50 total** (overflow aggregated in summary)
- **Progressive disclosure**: Load artifacts incrementally
- **High-signal only**: Focus on actionable, blocking issues
- **Deterministic**: Same inputs = same IDs and counts
- **No exhaustive dumps**: Cite specific instances, not patterns

### POE2_HTC Specific Analysis Rules

1. **Constitution First**: Check constitutional compliance before other analysis
2. **Memory Priority**: Heap/memory issues are immediate blockers
3. **Algorithm Protection**: Any beam search changes require explicit approval verification
4. **v1.0 Focus**: Prioritize issues affecting remaining 15-20% completion
5. **Performance Threshold**: Validate 1-minute computation limit adherence

### Success Criteria

Analysis is complete when it provides:
- ✅ Clear identification of constitution violations
- ✅ Actionable recommendations for critical issues
- ✅ Coverage gaps for P1 requirements
- ✅ Memory impact validation for all features
- ✅ Algorithm integrity verification
- ✅ Prioritized remediation plan

Remember: POE2_HTC analysis must protect algorithm integrity and performance standards while enabling v1.0 completion. The constitution is absolute - violations are non-negotiable blockers.