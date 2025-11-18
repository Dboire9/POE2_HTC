<!--
SYNC IMPACT REPORT
==================
Version Change: Template → 1.0.0
Initial Constitution Creation: 2025-11-18

Modified Principles:
- NEW: Algorithm Integrity (CRITICAL - NON-NEGOTIABLE)
- NEW: Performance First (CRITICAL - Speed is Everything) 
- NEW: Code Quality & Architecture (MANDATORY)
- NEW: Testing Standards (COMPREHENSIVE)
- NEW: User Experience & Domain Knowledge

Added Sections:
- Performance Standards (memory management, optimization strategies, quality metrics)
- Development Workflow (user stories, v1.0 completion focus, documentation standards)

Templates Requiring Updates:
⚠ PENDING: .specify/templates/plan-template.md (ensure Constitution Check aligns with performance-first principles)
⚠ PENDING: .specify/templates/spec-template.md (ensure scope/requirements alignment with algorithm integrity requirements)
⚠ PENDING: .specify/templates/tasks-template.md (ensure task categorization reflects performance and memory optimization priorities)

Follow-up TODOs: None - all placeholders resolved with concrete project values
-->

# POE2_HTC Constitution

**POE2 How To Craft** is a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms. Built with Electron + React frontend and Java backend for maximum computational efficiency.

## Core Principles

### I. Algorithm Integrity (CRITICAL - NON-NEGOTIABLE)
The core beam search algorithm is established and MUST be preserved. The fundamental algorithm structure and logic cannot be altered without explicit approval. Current priority is optimizing parameters (beam width values, scoring function weights of 1000 for desired modifiers and 250 for relevant tags, heuristic parameters and pruning strategies), not changing core algorithm. Any simplifications must be algorithmically equivalent. Modifications that change algorithm behavior require explicit approval.

### II. Performance First (CRITICAL - Speed is Everything)
Maximum computation time of 1 minute for most complex scenarios (6-modifier rare items with full currency paths). IMMEDIATE PRIORITY: resolve heap space exhaustion failures (current critical issue). Memory-efficient data structures, aggressive memory optimization, real-time progress indicators (% complete, estimated time remaining), instant cancellation capability, and non-blocking frontend operations are mandatory. Support multithreaded processing and leverage parallel computing effectively.

### III. Code Quality & Architecture (MANDATORY)
Strict separation between frontend (Electron/React) and backend (Java). Follow reactive programming patterns in React with optimal state management (Redux/Zustand for complex state, useState/useContext for simple cases). TypeScript usage is strict - no 'any' types without explicit justification and documentation. Every dependency must be justified and serve a clear purpose. Code designed for multi-league evolution and easy updates.

### IV. Testing Standards (COMPREHENSIVE)
Unit tests required for all NEW core algorithm components. Integration tests for IPC communication between frontend and backend. Validation tests for probability calculations against known manual test cases. Regression tests to prevent breaking existing functionality. Memory tests to validate heap usage under load. Performance benchmarks to track computation time improvements.

### V. User Experience & Domain Knowledge
Modern dark mode interface with professional polish. Clear visual feedback during computations with progress bars, estimated time remaining, and always-accessible cancel button. All essential POE2 mechanics, currencies, and omens are implemented. New game mechanics added ONLY upon explicit approval. No unreleased/speculative content. Designed for easy league/season updates when requested.

## Performance Standards

**Memory Management (IMMEDIATE PRIORITY)**: Must resolve out-of-memory failures. Optimize object creation and garbage collection. Implement memory pooling to reuse objects and reduce GC pressure. Every byte matters for complex calculations.

**Optimization Strategies**: Algorithm pruning to reduce search space intelligently. Caching systems for intermediate results where applicable. Parallel processing to leverage multi-core systems effectively. Optimized IPC using most efficient communication method.

**Quality Metrics**: 99% of calculations complete within 1 minute. No heap space failures under any reasonable scenario. No crashes or freezes during normal operation. Professional, polished interface with smooth interactions.

## Development Workflow

**User Stories Required**: Changes require clear functional specifications. New features must consider both frontend and backend implications. Breaking changes require migration guides. Documentation updates required for all additions.

**v1.0 Completion Focus (Remaining ~15-20%)**:
1. Algorithm Optimization (HIGH PRIORITY) - Parameter tuning, memory optimization, performance profiling
2. Frontend Overhaul - Component architecture refactoring, modern UI/UX, optimal state management
3. Probability & Heuristic Refinement - Accuracy improvements, edge case handling, validation
4. Professional Documentation - Both mathematical notation and implementation-focused explanations

**Documentation Standards**: JavaDoc for all public methods (Java backend), TSDoc for exported functions/components (TypeScript frontend), comprehensive algorithm design document with mathematical formulas, architecture decision records, API documentation, setup/contribution guides.

## Technical Debt and Known Issues

**Memory Management (CRITICAL)**: Heap space exhaustion under complex scenarios - immediate resolution required for v1.0
**Algorithm Parameters**: Unoptimized beam width and scoring weights - tuning needed for optimal performance
**Documentation Gaps**: Missing comprehensive technical documentation with mathematical notation
**Frontend Architecture**: Potential for component tree optimization and modern state management implementation

## Success Metrics for v1.0

**Memory Performance**: No heap space failures under any reasonable scenario, efficient object creation and garbage collection
**Computation Time**: 99% of calculations complete within 1 minute, optimized algorithm parameters
**System Stability**: No crashes or freezes during normal operation, robust error handling
**User Experience**: Professional, polished interface with smooth interactions and real-time feedback
**Code Quality**: Maintainable, well-tested, and optimized codebase with comprehensive documentation
**Algorithm Integrity**: Core beam search logic preserved while achieving optimal parameter configuration

## Governance

This constitution supersedes all other development practices. All changes must verify compliance with these principles. Performance optimization is a first-class concern equal to functionality. Stability and correctness take priority over new features. Algorithm integrity must be maintained while allowing parameter optimization.

**Constitutional Enforcement**: Every development decision must demonstrate alignment with algorithm integrity and performance-first principles. Memory optimization takes precedence over feature additions until heap issues are resolved. Code changes affecting the beam search algorithm require explicit constitutional compliance verification.

**Amendment Process**: Constitution changes require explicit approval, documentation of rationale, and migration plan for affected code. Breaking changes to core principles require unanimous agreement. Algorithm integrity modifications are subject to additional review and testing requirements. Version increments follow semantic versioning (MAJOR for backward incompatible changes, MINOR for new principles/sections, PATCH for clarifications).

**Development Priorities**: v1.0 completion takes precedence over new features. Memory optimization, algorithm parameter tuning, and performance profiling are first-class development activities. Quality gates prevent regression in algorithm behavior or performance characteristics.

**Version**: 1.1.0 | **Ratified**: 2025-11-18 | **Last Amended**: 2025-11-18

---

*This constitution establishes the foundational principles for completing POE2_HTC v1.0 - a production-ready, performance-critical application where algorithm integrity and computational efficiency are paramount.*
