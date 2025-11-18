---
agent: speckit.tasks
---

You are breaking down implementation plans into actionable tasks for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Task Generation Context

**CRITICAL**: Tasks must be granular, testable, and aligned with POE2_HTC's constitution. Every task should preserve algorithm integrity while enabling v1.0 completion through memory optimization, performance tuning, and quality improvements.

### POE2_HTC Task Generation Principles

#### I. Constitution-Aligned Tasks
Every task must respect:
- **Algorithm Integrity**: No task should modify core beam search structure without explicit approval
- **Performance First**: Tasks must consider memory impact and computation time
- **Code Quality**: Frontend/backend separation, TypeScript strict mode
- **Testing Required**: Unit/integration tests for algorithm and IPC changes
- **v1.0 Priority**: Focus on remaining 15-20% completion

#### II. Task Granularity Rules
**Ideal Task Size**: 2-4 hours of focused work
- ✅ "Implement CandidatePool class with acquire/release methods"
- ✅ "Add memory monitoring endpoint to backend API"
- ✅ "Create progress bar component with cancellation button"
- ❌ "Optimize memory" (too vague, too large)
- ❌ "Fix performance issues" (unclear scope)
- ❌ "Improve UI" (needs breakdown)

#### III. Priority-Based Task Categories

**P1 (Critical - v1.0 Blockers)**:
- Memory optimization tasks (heap exhaustion fixes)
- Algorithm parameter tuning (beam width, scoring weights)
- Critical performance bottleneck resolution
- Mandatory testing for new algorithm components

**P2 (High - v1.0 Quality)**:
- Frontend UI/UX improvements (professional polish)
- Progress tracking and cancellation implementation
- Error handling and user feedback
- Integration testing for IPC

**P3 (Medium - v1.0 Polish)**:
- Documentation (technical and user guides)
- Edge case handling
- Performance monitoring and benchmarking
- Code refactoring for maintainability

**P4 (Low - Post-v1.0)**:
- Visual enhancements (nice-to-have)
- Additional POE2 mechanics (requires approval)
- Future optimization opportunities

### Task Structure Requirements

Each task must include:

#### 1. Task ID and Title
```
TSK-001: Implement object pooling for Crafting_Candidate
```

#### 2. Description
```
Create CandidatePool class to reuse Crafting_Candidate instances and reduce heap pressure during beam search calculations.
```

#### 3. Acceptance Criteria (Testable)
```
- [ ] CandidatePool class with configurable pool size
- [ ] acquire() method returns candidate from pool or creates new
- [ ] release() method returns candidate to pool for reuse
- [ ] Thread-safe implementation with concurrent access
- [ ] Unit tests with 95%+ coverage
- [ ] Memory usage reduced by ~70% in stress tests
```

#### 4. Technical Specifications
```
Location: src/main/java/core/Crafting/CandidatePool.java
Dependencies: None (standalone utility)
Memory Impact: Reduces heap allocation by ~70%
Constitution: Preserves algorithm structure (optimization only)
```

#### 5. Testing Requirements
```
- Unit tests: CandidatePool operations
- Integration: Full beam search with pooling enabled
- Performance: Before/after heap usage comparison
- Stress: 100 consecutive complex calculations
```

#### 6. Priority and Estimated Effort
```
Priority: P1 (Critical - heap exhaustion fix)
Effort: 3 hours
Dependencies: None
```

### POE2_HTC-Specific Task Categories

#### Memory Optimization Tasks (P1 - IMMEDIATE)
```
- TSK-XXX: Implement object pooling for Crafting_Candidate
- TSK-XXX: Replace ArrayList with efficient collections in beam storage
- TSK-XXX: Add JVM heap monitoring and early warning system
- TSK-XXX: Configure optimal GC settings for beam search workload
- TSK-XXX: Implement graceful degradation at 90% heap usage
```

#### Algorithm Parameter Tuning Tasks (P1 - HIGH PRIORITY)
```
- TSK-XXX: Create configurable beam width parameter system
- TSK-XXX: Optimize scoring weights (1000/250) through benchmarking
- TSK-XXX: Implement adaptive beam width based on complexity
- TSK-XXX: Add parameter validation and constraint checking
- TSK-XXX: Create unit tests for parameter optimization
```

#### Frontend Overhaul Tasks (P2)
```
- TSK-XXX: Refactor CraftingSimulator component with modern patterns
- TSK-XXX: Implement state management solution (Redux/Zustand)
- TSK-XXX: Create progress bar component with real-time updates
- TSK-XXX: Add cancellation button with confirmation dialog
- TSK-XXX: Polish dark mode theme with professional styling
```

#### IPC Communication Tasks (P2)
```
- TSK-XXX: Add progress polling endpoint to backend API
- TSK-XXX: Implement cancellation signal handling in backend
- TSK-XXX: Create frontend hook for backend communication
- TSK-XXX: Add error handling for IPC failures
- TSK-XXX: Write integration tests for IPC scenarios
```

#### Testing Tasks (P1/P2 - Mandatory)
```
- TSK-XXX: Write unit tests for new algorithm components
- TSK-XXX: Create memory stress tests for 6-modifier items
- TSK-XXX: Implement performance benchmarks for computation time
- TSK-XXX: Add integration tests for frontend-backend IPC
- TSK-XXX: Create regression tests for probability calculations
```

#### Documentation Tasks (P3)
```
- TSK-XXX: Write algorithm design document with mathematical notation
- TSK-XXX: Create architecture decision records (ADRs)
- TSK-XXX: Document API contracts for frontend-backend IPC
- TSK-XXX: Write setup and contribution guides
- TSK-XXX: Add inline JavaDoc for all public methods
```

### Task Dependency Management

**Dependency Types**:
- **Hard Dependency**: Task B cannot start until Task A completes
- **Soft Dependency**: Task B benefits from Task A but can proceed independently
- **Parallel**: Tasks can be worked on simultaneously

**Example Dependency Structure**:
```
TSK-001: Implement CandidatePool (P1, no deps)
  ├─ TSK-002: Integrate pool with Crafting_Algorithm (P1, hard dep on TSK-001)
  ├─ TSK-003: Add unit tests for CandidatePool (P1, soft dep on TSK-001)
  └─ TSK-004: Memory stress testing (P1, hard dep on TSK-002)

TSK-005: Add progress polling endpoint (P2, no deps)
  └─ TSK-006: Frontend progress bar component (P2, hard dep on TSK-005)
```

### Task Validation Rules

Before creating a task, verify:
- ✅ **Atomic**: Single, well-defined outcome
- ✅ **Testable**: Clear acceptance criteria
- ✅ **Estimated**: Reasonable effort estimate (2-4 hours ideal)
- ✅ **Constitutional**: Aligns with algorithm/performance principles
- ✅ **Prioritized**: Correct P1-P4 classification
- ✅ **Scoped**: Appropriate for v1.0 completion focus

**Red Flags** (Break down further):
- Task spans multiple architectural layers
- Unclear success criteria
- Estimated effort >8 hours
- Vague descriptions ("improve", "optimize" without specifics)
- Missing testing requirements

### Task Output Format

```markdown
## TSK-001: Implement Object Pooling for Crafting_Candidate

**Priority**: P1 (Critical - Heap Exhaustion Fix)
**Effort**: 3 hours
**Dependencies**: None

### Description
Create CandidatePool class to reuse Crafting_Candidate instances, reducing heap allocation during beam search. This addresses the critical heap space exhaustion issue without modifying algorithm structure.

### Technical Specifications
- **Location**: `src/main/java/core/Crafting/CandidatePool.java`
- **Pattern**: Object pooling with fixed capacity
- **Pool Size**: 50,000 pre-allocated instances
- **Thread Safety**: ConcurrentLinkedQueue for concurrent access
- **Memory Impact**: ~70% reduction in GC pressure
- **Constitution Compliance**: Algorithm structure preserved (optimization only)

### Acceptance Criteria
- [ ] CandidatePool class with configurable pool size (default 50k)
- [ ] `acquire()` method returns candidate from pool or creates new if empty
- [ ] `release()` method returns candidate to pool (resets state first)
- [ ] Thread-safe implementation supports concurrent beam search threads
- [ ] Pool statistics tracking (hits/misses) for monitoring
- [ ] Unit tests achieve 95%+ coverage
- [ ] Integration test shows 70% reduction in heap allocation

### Testing Requirements
- **Unit Tests**: Pool acquire/release cycles, thread safety, edge cases
- **Integration Tests**: Full beam search with pooling enabled
- **Performance Tests**: Before/after heap usage comparison
- **Stress Tests**: 100 consecutive complex 6-modifier calculations

### Implementation Notes
- Use `ConcurrentLinkedQueue` for lock-free performance
- Reset candidate state in `release()` to avoid data leakage
- Consider `ThreadLocal` pools for additional performance
- Add JMX metrics for pool monitoring

### Related Tasks
- TSK-002: Integrate CandidatePool with Crafting_Algorithm (hard dependency)
- TSK-003: Memory stress testing with pooling (hard dependency on TSK-002)
```

### POE2_HTC Task Generation Guidelines

**When Breaking Down Plans**:
1. **Identify architectural layers**: Frontend, Backend, Algorithm, Infrastructure
2. **Separate by concern**: Memory, Performance, UI, Testing, Documentation
3. **Order by dependency**: Foundation → Integration → Testing → Polish
4. **Prioritize by constitution**: Algorithm integrity > Performance > Quality > Polish

**Task Sizing Strategy**:
- **Small** (1-2h): Single method, component, or test file
- **Medium** (3-4h): Single class, component with tests, or integration scenario
- **Large** (5-8h): Multiple related components or complex integration (break down if possible)

**Testing Task Pattern**:
Every implementation task should have corresponding testing task(s):
- Implementation: TSK-XXX
- Unit Tests: TSK-XXX+1
- Integration Tests: TSK-XXX+2 (if needed)

### Success Criteria for Task Lists

A complete task list should:
- ✅ Cover all plan components
- ✅ Include testing for all new code
- ✅ Have clear dependency chains
- ✅ Prioritize P1 (v1.0 blockers) appropriately
- ✅ Specify memory/performance impact
- ✅ Align with constitutional principles
- ✅ Total to reasonable v1.0 completion effort

Remember: POE2_HTC tasks must be concrete, testable, and focused on v1.0 completion. Every task should preserve algorithm integrity while enabling the memory optimization and performance improvements needed for production release.