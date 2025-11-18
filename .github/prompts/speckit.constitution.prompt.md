---
agent: speckit.constitution
---

You are creating a project constitution for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Constitution Creation Guidelines

**CRITICAL**: This constitution establishes the foundational principles for a performance-critical, algorithm-integrity-focused project nearing v1.0 completion.

### Core Project Context

**Project Identity**: POE2 How To Craft is a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms. Built with Electron + React frontend and Java backend for maximum computational efficiency.

**Current State**: ~80% complete, with critical memory optimization and algorithm tuning remaining
**Critical Issue**: Heap space exhaustion under complex scenarios (immediate priority)
**Architecture**: Frontend (Electron/React) + Backend (Java) with HTTP-based IPC

### Mandatory Constitutional Principles

#### I. Algorithm Integrity (CRITICAL - NON-NEGOTIABLE)
- Core beam search algorithm structure MUST be preserved
- Only parameter optimization allowed (beam width, scoring weights, heuristics)  
- Any algorithmic changes require explicit approval
- Algorithmic equivalence required for any simplifications
- Current scoring: 1000 points for desired modifiers, 250 for relevant tags (optimizable)

#### II. Performance First (CRITICAL - Speed is Everything)
- Maximum computation time: 1 minute for complex scenarios (6-modifier rare items)
- **IMMEDIATE PRIORITY**: Resolve heap space exhaustion failures
- Memory-efficient data structures mandatory
- Real-time progress indicators required (% complete, estimated time)
- Instant cancellation capability
- Non-blocking frontend operations
- Support multithreaded processing

#### III. Code Quality & Architecture (MANDATORY)
- Strict separation between frontend (Electron/React) and backend (Java)
- Reactive programming patterns in React
- TypeScript strict mode - no 'any' types without explicit justification
- Minimal, justified dependencies
- Code designed for multi-league evolution

#### IV. Testing Standards (COMPREHENSIVE)
- Unit tests for all NEW core algorithm components
- Integration tests for frontend-backend IPC
- Validation tests for probability calculations vs. manual cases
- Regression tests to prevent breaking existing functionality
- Memory tests for heap usage under load
- Performance benchmarks for computation time tracking

#### V. User Experience & Domain Knowledge
- Modern dark mode interface with professional polish
- Clear visual feedback during computations
- All essential POE2 mechanics implemented (currencies, omens, modifiers)
- New game mechanics ONLY upon explicit approval
- No unreleased/speculative content
- Easy league/season updates

### Required Constitution Sections

#### Performance Standards
- **Memory Management**: Heap optimization strategies, object reuse, GC pressure reduction
- **Optimization Strategies**: Algorithm pruning, caching, parallel processing
- **Quality Metrics**: 99% calculations < 1 minute, zero heap failures, zero crashes

#### Development Workflow
- **User Stories Required**: Clear functional specifications for all changes
- **v1.0 Completion Focus**: Algorithm optimization, frontend overhaul, probability refinement, documentation
- **Documentation Standards**: JavaDoc, TSDoc, mathematical notation, implementation details

#### Technical Constraints
- **Memory**: Every byte matters for complex calculations
- **Algorithm Parameters**: Currently unoptimized (beam width, scoring weights)
- **Frontend Architecture**: Open to component tree optimization
- **State Management**: Use optimal solution (Redux/Zustand vs. simple patterns)

### v1.0 Completion Roadmap (15-20% Remaining)

1. **Algorithm Optimization (HIGH PRIORITY)**
   - Parameter tuning (beam width, scoring weights, heuristics)
   - Memory optimization to resolve heap issues
   - Performance profiling and bottleneck elimination

2. **Frontend Overhaul**
   - Component architecture refactoring if beneficial
   - Modern UI/UX with professional polish
   - Optimal state management implementation
   - UI responsiveness under all conditions

3. **Probability & Heuristic Refinement**
   - Better probability calculations and accuracy
   - Edge case handling for complex scenarios
   - Validation against known manual cases

4. **Professional Documentation**
   - Both mathematical notation AND implementation-focused
   - Algorithm design documents
   - Architecture decision records
   - API documentation and setup guides

### Constitutional Requirements

#### Governance Framework
- Constitution supersedes all development practices
- Performance optimization is first-class concern
- Stability and correctness > new features
- Algorithm integrity while allowing parameter optimization
- Amendment process with explicit approval and migration plans

#### Success Metrics for v1.0
- **Memory**: No heap space failures under reasonable scenarios
- **Performance**: 99% calculations complete within 1 minute
- **Stability**: No crashes or freezes during operation
- **User Experience**: Professional, polished interface
- **Documentation**: Complete technical and user documentation
- **Code Quality**: Maintainable, well-tested, optimized codebase

#### Technical Debt Recognition
- Memory management (heap exhaustion)
- Algorithm parameters (unoptimized)
- Documentation gaps
- Frontend architecture optimization potential

### Output Requirements

Create a constitution that:
1. **Establishes clear principles** for algorithm integrity and performance
2. **Addresses critical issues** (heap space exhaustion)
3. **Defines v1.0 completion path** with specific priorities
4. **Sets quality standards** for production-ready software
5. **Provides governance framework** for ongoing development

The constitution must be actionable, measurable, and focused on completing the remaining 15-20% of POE2_HTC development while maintaining the highest quality standards.

Remember: This is a performance-critical application where algorithm integrity and computational efficiency are paramount. The constitution must protect the core beam search while enabling the optimizations needed for production release.