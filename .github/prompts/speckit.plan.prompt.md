---
agent: speckit.plan
---

You are creating a technical implementation plan for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Planning Context

**CRITICAL**: Implementation plans must align with POE2_HTC's established architecture while enabling v1.0 completion. The tech stack is largely ESTABLISHED - focus on optimization strategies, architectural refinements, and component integration approaches.

### Established Architecture (NON-NEGOTIABLE)

**Frontend Stack** (ESTABLISHED):
- **Desktop Framework**: Electron (cross-platform desktop application)
- **UI Framework**: React with TypeScript (strict mode)
- **UI Components**: shadcn/ui (modern component library)
- **Styling**: Tailwind CSS + PostCSS
- **Build Tool**: Vite (fast development and optimized builds)
- **IPC Communication**: HTTP-based backend communication (optimizable)

**Backend Stack** (ESTABLISHED):
- **Language**: Java 21+ (high-performance computation)
- **Build Tool**: Apache Maven 3.8+
- **Core Algorithm**: Beam search (structure is NON-NEGOTIABLE)
- **Threading**: Multithreaded processing capability
- **API**: HTTP server on localhost:8080

**Current State**: ~80% complete with established patterns
**Critical Issue**: Heap space exhaustion requiring memory optimization

### Planning Principles for POE2_HTC

#### I. Respect Established Architecture
Plans must work WITHIN the existing architecture, not replace it:
- ✅ Optimize existing Electron + React + Java stack
- ✅ Enhance HTTP-based IPC (consider named pipes/sockets if beneficial)
- ✅ Improve React state management (Redux/Zustand if needed)
- ❌ No framework replacements (no Vue, Angular, different desktop frameworks)
- ❌ No language changes (Java backend is established)

#### II. Algorithm Preservation (CRITICAL)
- Core beam search structure MUST remain intact
- Plans focus on parameter optimization, not algorithm redesign
- Memory optimization through data structure improvements, not algorithm changes
- Any algorithmic modifications require explicit approval statements

#### III. Performance-First Planning
Every plan must address:
- **Memory Optimization**: Heap usage reduction strategies
- **Computation Time**: How to maintain <1 minute for complex scenarios
- **Progress Tracking**: Real-time progress and cancellation mechanisms
- **Frontend Responsiveness**: Non-blocking operations during backend processing

#### IV. v1.0 Completion Focus
Plans should prioritize the remaining 15-20%:
1. **Algorithm Optimization** (HIGH PRIORITY) - Memory fixes, parameter tuning
2. **Frontend Overhaul** - Modern UI/UX, component refactoring
3. **Probability Refinement** - Accuracy improvements
4. **Documentation** - Technical and user guides

### Technical Planning Framework

#### Component Architecture Decisions

**Frontend Component Structure**:
```
src/
  components/
    CraftingSimulator.tsx    [Established - may refactor]
    CurrencySelector.tsx      [Established]
    ItemSelector.tsx          [Established]
    ModifierSelector.tsx      [Established]
    Results.tsx               [Established]
    QuickTestButton.tsx       [Established]
    ui/                       [shadcn/ui components]
```

**State Management Decision Points**:
- **Simple State** (useState/useContext): When to use?
- **Complex State** (Redux/Zustand): When is complexity justified?
- **Server State**: React Query for backend communication?
- **Performance State**: Progress tracking, cancellation signals

**Backend Structure**:
```
src/main/java/
  core/
    Crafting/                [Beam search algorithm - ESTABLISHED]
      Crafting_Algorithm.java
      Crafting_Candidate.java
      CraftingExecutor.java
    Currency/                [Currency implementations]
    Item_modifiers/          [POE2 modifier data]
    Items/                   [Item definitions]
```

#### Memory Optimization Planning (IMMEDIATE PRIORITY)

Plans must specify:
- **Object Pooling**: Which objects to pool (Crafting_Candidate, intermediate results)?
- **Data Structure Optimization**: More efficient collections for large datasets?
- **GC Tuning**: JVM heap settings, GC algorithm selection?
- **Memory Monitoring**: Real-time tracking and early warning systems?
- **Graceful Degradation**: Behavior when approaching memory limits?

**Example Plan Format**:
```
Memory Optimization Strategy:
- Implement object pool for Crafting_Candidate (reuse up to 10k instances)
- Replace ArrayList with more memory-efficient structures for beam storage
- Configure JVM: -Xmx4G -XX:+UseG1GC for better GC performance
- Add MemoryMonitor service to track heap usage every 100ms
- Implement early termination at 90% heap usage with user notification
```

#### Performance Architecture Planning

Plans must address:
- **Computation Management**: How to stay within 1-minute limit?
- **Progress Reporting**: WebSocket vs. polling for real-time updates?
- **Cancellation Mechanism**: Thread interruption strategy?
- **Async Operations**: Which operations run async, which sync?
- **Resource Limits**: Thread pool sizing, beam width constraints?

**Example Plan Format**:
```
Performance Architecture:
- Beam width: Start at 100, auto-adjust based on complexity
- Thread pool: Fixed pool of [CPU cores - 1] threads
- Progress updates: 100ms polling via REST endpoint
- Cancellation: Interrupt flag checked every beam iteration
- Timeout: User-configurable (default 60s) with warning at 80%
```

#### IPC Communication Planning

Current: HTTP-based (localhost:8080)
Considerations for optimization:
- **HTTP REST** (current): Simple but higher overhead
- **Named Pipes**: Lower latency for local communication
- **Shared Memory**: Maximum performance but complex
- **WebSockets**: Real-time bi-directional for progress updates

**Decision Criteria**:
- Performance impact measurement required
- Complexity vs. benefit analysis
- Cross-platform compatibility (Windows/macOS/Linux)

#### Testing Strategy Planning

Plans must include:
- **Unit Tests**: Which new components require tests?
- **Integration Tests**: IPC communication scenarios
- **Memory Tests**: Heap stress testing with complex items
- **Performance Benchmarks**: Baseline and target metrics
- **Regression Tests**: Prevent breaking existing functionality

### Plan Output Requirements

Each plan must include:

#### 1. Architecture Decision Records (ADRs)
```
Decision: [What you're deciding]
Context: [Why this decision is needed]
Options Considered: [Alternative approaches]
Decision: [Chosen approach]
Consequences: [Positive and negative impacts]
Constitution Alignment: [How this preserves algorithm/performance]
```

#### 2. Component Breakdown
```
Frontend Components:
  - Component A: [Purpose, props, state management approach]
  - Component B: [Purpose, dependencies, performance considerations]

Backend Components:
  - Service A: [Purpose, threading model, memory footprint]
  - Service B: [Purpose, algorithm impact, testing approach]
```

#### 3. Data Flow Diagrams
```
User Action → Frontend Component → IPC → Backend Service → Algorithm → Results
[Specify data formats, validation points, error handling at each step]
```

#### 4. Memory & Performance Specifications
```
Memory Budget:
  - Component A: Max XMB heap
  - Component B: Object pool size
  - Total: Target heap usage

Performance Targets:
  - Operation A: Max Xms
  - Operation B: Must be non-blocking
  - Total: 99% of calculations <60s
```

#### 5. Implementation Phases
```
Phase 1 (Week 1): [High-priority items]
Phase 2 (Week 2): [Medium-priority items]
Phase 3 (Week 3): [Polish and testing]
```

#### 6. Testing Checklist
```
- [ ] Unit tests for new algorithm components
- [ ] Integration tests for IPC changes
- [ ] Memory stress tests (6-modifier items)
- [ ] Performance benchmarks
- [ ] Regression tests
```

### POE2_HTC-Specific Planning Constraints

**Cannot Change**:
- ❌ Electron + React frontend framework
- ❌ Java backend language
- ❌ Core beam search algorithm structure
- ❌ POE2 mechanics already implemented

**Can Optimize**:
- ✅ React component architecture and state management
- ✅ Java data structures and memory management
- ✅ Algorithm parameters (beam width, scoring weights)
- ✅ IPC communication mechanism
- ✅ Threading and concurrency approach

**Must Address**:
- ✅ Heap space exhaustion (IMMEDIATE)
- ✅ Computation time optimization
- ✅ Progress tracking and cancellation
- ✅ Frontend responsiveness
- ✅ Professional UI/UX polish

### Plan Validation Checklist

Before finalizing, verify:
- ✅ Respects established architecture (no framework replacements)
- ✅ Preserves algorithm integrity (beam search structure intact)
- ✅ Addresses memory optimization (heap issue solutions)
- ✅ Meets performance targets (<1 minute computation)
- ✅ Includes comprehensive testing strategy
- ✅ Aligns with v1.0 completion priorities
- ✅ Specifies measurable success criteria
- ✅ Documents architectural decisions with rationale

### Example Plan Structure for POE2_HTC

```
# Implementation Plan: Memory Optimization for Beam Search

## Architecture Decision
Decision: Implement object pooling for Crafting_Candidate instances
Context: Heap exhaustion from creating millions of candidate objects
Constitution Alignment: Preserves algorithm structure, optimizes memory only

## Component Changes
Backend:
  - New: CandidatePool (object pool manager)
  - Modified: Crafting_Algorithm (use pool instead of new)
  - Modified: CraftingExecutor (pool cleanup on completion)

## Data Flow
Calculation Request → CraftingExecutor → CandidatePool.acquire() → 
Beam Search → Process Candidates → CandidatePool.release() → Results

## Memory Specifications
- Pool Size: 50,000 pre-allocated candidates
- Memory Savings: ~70% reduction in GC pressure
- Heap Target: <2GB for complex 6-modifier scenarios

## Implementation Phases
Phase 1: Create CandidatePool with unit tests
Phase 2: Integrate with Crafting_Algorithm
Phase 3: Memory stress testing and tuning

## Testing Strategy
- Unit: CandidatePool acquire/release cycles
- Integration: Full beam search with pooling
- Performance: Before/after heap usage comparison
- Stress: 100 consecutive complex calculations
```

Remember: POE2_HTC plans must work WITHIN the established architecture, focus on optimization rather than replacement, and prioritize resolving the critical heap space issue while maintaining algorithm integrity.