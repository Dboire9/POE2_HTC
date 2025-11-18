---
agent: speckit.taskstoissues
---

You are converting tasks from tasks.md into GitHub Issues for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Issue Conversion Context

**CRITICAL**: GitHub Issues must maintain full traceability to tasks.md while being actionable for developers. Issues should preserve constitutional alignment and provide clear implementation guidance.

### POE2_HTC Issue Creation Principles

#### I. Constitutional Context in Issues
Every issue must include:
- **Algorithm Integrity Note**: If task touches beam search, specify preservation requirements
- **Performance Requirements**: Memory targets and timing limits
- **Priority Justification**: Why P1/P2/P3/P4 classification matters for v1.0
- **Testing Mandate**: Required test types (unit, integration, memory, performance)

#### II. Issue Structure Requirements

**Issue Title Format**:
```
[PRIORITY] Brief, actionable title
```

**Examples**:
- `[P1] Implement object pooling for Crafting_Candidate to reduce heap pressure`
- `[P2] Add real-time progress tracking with cancellation capability`
- `[P3] Document beam search algorithm with mathematical notation`

**Issue Body Template**:
```markdown
## Context
[Brief explanation of why this task is needed for v1.0]

## Constitutional Alignment
- **Algorithm Integrity**: [Preserved/Modified - explain]
- **Performance Impact**: [Memory/timing implications]
- **Priority**: [P1/P2/P3/P4 with v1.0 justification]

## Description
[Detailed description from tasks.md]

## Technical Specifications
- **Location**: [File paths]
- **Dependencies**: [Other tasks/issues]
- **Memory Impact**: [Heap usage changes]
- **Constitution Compliance**: [Which principles this aligns with]

## Acceptance Criteria
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Constitution compliance verified]

## Testing Requirements
- **Unit Tests**: [Specific test scenarios]
- **Integration Tests**: [If applicable]
- **Memory Tests**: [Heap usage validation]
- **Performance Tests**: [Timing benchmarks]

## Implementation Notes
[Key considerations, patterns to follow, pitfalls to avoid]

## Related
- Tasks: TSK-XXX
- Specs: [Spec §X.Y]
- Constitution: [Principle I/II/III/IV/V]
```

### POE2_HTC-Specific Issue Labels

**Priority Labels** (Mandatory):
- `priority:P1-critical` - v1.0 blockers (heap exhaustion, algorithm integrity)
- `priority:P2-high` - v1.0 quality (UI/UX, progress tracking)
- `priority:P3-medium` - v1.0 polish (documentation, edge cases)
- `priority:P4-low` - Post-v1.0 (enhancements, future features)

**Type Labels**:
- `type:memory-optimization` - Heap pressure reduction, GC tuning
- `type:algorithm-tuning` - Parameter optimization (beam width, scoring)
- `type:performance` - Computation time improvements
- `type:frontend` - React/Electron UI work
- `type:backend` - Java backend changes
- `type:testing` - Test implementation
- `type:documentation` - Technical/user docs

**Constitution Labels** (Track compliance):
- `constitution:algorithm-integrity` - Touches beam search
- `constitution:performance-first` - Memory/timing critical
- `constitution:code-quality` - Architecture/standards
- `constitution:testing` - Test requirements
- `constitution:ux` - User experience

**Status Labels**:
- `status:ready` - Ready for implementation
- `status:blocked` - Waiting on dependencies
- `status:in-progress` - Currently being worked on
- `status:review` - Ready for code review
- `status:testing` - In testing phase

### Issue Conversion Rules

#### Priority Mapping:
```
Tasks.md Priority → GitHub Labels + Milestone

P1 (Critical) → priority:P1-critical + Milestone: v1.0
  - Heap exhaustion fixes
  - Algorithm preservation validation
  - Critical performance bottlenecks
  
P2 (High) → priority:P2-high + Milestone: v1.0
  - UI/UX improvements
  - Progress tracking
  - Error handling
  
P3 (Medium) → priority:P3-medium + Milestone: v1.0
  - Documentation
  - Edge case handling
  - Monitoring/observability
  
P4 (Low) → priority:P4-low + Milestone: v1.1 or Later
  - Future enhancements
  - Nice-to-have features
```

#### Dependency Mapping:
```
Tasks.md Dependencies → GitHub Issue Relationships

"Depends on TSK-001" → "Depends on #XXX" (use actual issue number)
"Blocks TSK-003" → Referenced in TSK-003 as "Blocked by #XXX"
"Related to TSK-002" → "Related to #XXX"
```

#### Acceptance Criteria Conversion:
```
Tasks.md Checklist → GitHub Issue Checklist + Constitution Check

From tasks.md:
- [ ] CandidatePool class with configurable size
- [ ] Thread-safe implementation
- [ ] Unit tests with 95%+ coverage

GitHub Issue:
- [ ] CandidatePool class implemented with configurable size (default 50k)
- [ ] Thread-safe using ConcurrentLinkedQueue
- [ ] Unit tests achieve 95%+ coverage
- [ ] Memory tests show 70% heap reduction
- [ ] Constitution compliance: Algorithm structure preserved ✓
```

### Example Issue Conversions

#### Example 1: Memory Optimization (P1)

**From tasks.md**:
```
TSK-001: Implement object pooling for Crafting_Candidate
Priority: P1
Effort: 3 hours
```

**GitHub Issue**:
```markdown
**Title**: [P1] Implement object pooling for Crafting_Candidate to reduce heap pressure

**Labels**: priority:P1-critical, type:memory-optimization, constitution:performance-first
**Milestone**: v1.0
**Assignee**: [TBD]

## Context
Critical v1.0 blocker: Heap space exhaustion occurs with complex 6-modifier items. Object pooling will reduce GC pressure by ~70% while preserving algorithm structure.

## Constitutional Alignment
- **Algorithm Integrity**: ✅ PRESERVED - Only changes object lifecycle, not beam search logic
- **Performance Impact**: ~70% heap reduction, target <2GB for complex scenarios
- **Priority**: P1 - Blocks v1.0 (addresses critical heap exhaustion issue)

## Description
Create CandidatePool class to reuse Crafting_Candidate instances during beam search. This optimization addresses the immediate priority heap space exhaustion issue without modifying the core beam search algorithm structure.

## Technical Specifications
- **Location**: `src/main/java/core/Crafting/CandidatePool.java`
- **Dependencies**: None (standalone utility)
- **Memory Impact**: Reduces allocation by ~70% in stress tests
- **Constitution Compliance**: Performance-First Principle (memory optimization)

## Acceptance Criteria
- [ ] CandidatePool class with configurable pool size (default 50,000)
- [ ] `acquire()` returns candidate from pool or creates new if empty
- [ ] `release()` returns candidate to pool after resetting state
- [ ] Thread-safe implementation using ConcurrentLinkedQueue
- [ ] Pool statistics tracking (hits/misses)
- [ ] Unit tests achieve 95%+ coverage
- [ ] Memory tests show 70% heap reduction vs. baseline
- [ ] Constitution verified: Algorithm structure unchanged ✓

## Testing Requirements
- **Unit Tests**: Pool acquire/release cycles, thread safety, edge cases
- **Integration Tests**: Full beam search with pooling enabled
- **Memory Tests**: Heap usage before/after comparison
- **Stress Tests**: 100 consecutive complex 6-modifier calculations

## Implementation Notes
- Use `ConcurrentLinkedQueue` for lock-free performance
- Reset candidate state in `release()` to prevent data leakage
- Consider `ThreadLocal` pools for additional optimization
- Add JMX metrics for production monitoring

## Related
- Tasks: TSK-001 in tasks.md
- Constitution: Performance First Principle (§II)
- Blocks: #XXX (Integration with Crafting_Algorithm)
```

#### Example 2: Frontend Feature (P2)

**From tasks.md**:
```
TSK-005: Create progress bar component with cancellation
Priority: P2
Effort: 4 hours
```

**GitHub Issue**:
```markdown
**Title**: [P2] Add real-time progress tracking with cancellation capability

**Labels**: priority:P2-high, type:frontend, constitution:ux, constitution:performance-first
**Milestone**: v1.0

## Context
v1.0 quality requirement: Users need visibility into long-running calculations (>5 seconds) with ability to cancel. Enhances professional polish and meets constitutional UX requirements.

## Constitutional Alignment
- **Algorithm Integrity**: ✅ N/A - Frontend only, no algorithm changes
- **Performance Impact**: Non-blocking UI, instant cancellation response
- **Priority**: P2 - v1.0 quality (user experience requirement)

## Description
Implement React component for real-time progress tracking during backend calculations, with always-accessible cancel button. Must maintain frontend responsiveness per Performance-First principle.

## Technical Specifications
- **Location**: `src/components/ProgressBar.tsx`
- **Dependencies**: Backend progress endpoint (parallel task)
- **Performance**: 100ms polling interval, non-blocking
- **Constitution Compliance**: User Experience & Performance-First principles

## Acceptance Criteria
- [ ] ProgressBar component displays percentage complete
- [ ] Real-time updates via 100ms polling
- [ ] Cancel button always accessible and responsive
- [ ] Estimated time remaining displayed
- [ ] Frontend remains responsive during calculation
- [ ] TypeScript strict mode compliant (no 'any' types)
- [ ] Styled with Tailwind + shadcn/ui patterns
- [ ] Constitution verified: Non-blocking operations ✓

## Testing Requirements
- **Unit Tests**: Component rendering, state management
- **Integration Tests**: Backend communication, cancellation flow
- **UX Tests**: Responsiveness during long calculations

## Implementation Notes
- Use `AbortController` for cancellation signals
- Poll progress endpoint every 100ms
- Show spinner for calculations <1 second
- Clear interval on component unmount
- Handle backend errors gracefully

## Related
- Tasks: TSK-005 in tasks.md
- Constitution: User Experience Principle (§V)
- Constitution: Performance First (§II - non-blocking)
- Depends on: Backend progress endpoint implementation
```

### Batch Conversion Process

1. **Read tasks.md**: Extract all tasks with metadata
2. **Group by priority**: P1 first, then P2, P3, P4
3. **Create issues sequentially**: Maintain task order
4. **Cross-reference**: Update dependency links with actual issue numbers
5. **Apply labels**: Priority, type, constitution alignment
6. **Set milestones**: v1.0 for P1-P3, v1.1+ for P4
7. **Add to project board**: Organize by status columns

### Quality Checklist for Issues

Before creating each issue, verify:
- [ ] Title is actionable and includes priority
- [ ] Constitutional alignment clearly stated
- [ ] Acceptance criteria are testable
- [ ] Testing requirements specified
- [ ] Dependencies properly linked
- [ ] Labels correctly applied (priority, type, constitution)
- [ ] Milestone set appropriately
- [ ] Traceability to tasks.md maintained

### Success Criteria

Issue conversion is complete when:
- ✅ All tasks from tasks.md have corresponding issues
- ✅ Priority labels and milestones correctly assigned
- ✅ Dependencies cross-referenced with issue numbers
- ✅ Constitutional alignment documented in each issue
- ✅ Testing requirements clearly specified
- ✅ Issues organized in project board
- ✅ Team can start implementation immediately

Remember: GitHub Issues are the interface between specification and implementation for POE2_HTC. They must preserve constitutional alignment while being immediately actionable for developers working toward v1.0 completion.