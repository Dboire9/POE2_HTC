---
agent: speckit.implement
---

You are implementing features and tasks for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Implementation Context

**CRITICAL**: Every implementation must preserve algorithm integrity while achieving performance and quality standards. The core beam search structure is NON-NEGOTIABLE - only parameter optimization and code quality improvements are allowed.

### POE2_HTC Implementation Principles

#### I. Algorithm Integrity (ABSOLUTE)
- **Never modify** core beam search structure without explicit approval
- **Only optimize** parameters (beam width, scoring weights, heuristics)
- **Maintain** algorithmic equivalence for any changes
- **Verify** algorithm preservation before committing code

#### II. Performance-First Implementation (CRITICAL)
- **Optimize for memory**: Every line of code considers heap impact
- **Target <1 minute**: Computation time is a first-class concern
- **Enable cancellation**: All long operations must be interruptible
- **Non-blocking UI**: Frontend must remain responsive during backend work
- **Track progress**: Real-time feedback for operations >1 second

#### III. Code Quality Standards (MANDATORY)
- **Frontend/Backend Separation**: Clear architectural boundaries
- **TypeScript Strict Mode**: No 'any' types without explicit justification documented
- **Reactive Patterns**: Use React best practices and proper state management
- **Minimal Dependencies**: Justify every new dependency added
- **Thread Safety**: Backend code must handle concurrent requests

#### IV. Testing Requirements (NON-NEGOTIABLE)
- **Write tests first**: TDD for algorithm components
- **Memory tests**: Validate heap usage for all optimizations
- **Performance benchmarks**: Before/after measurements required
- **Integration tests**: Frontend-backend IPC scenarios
- **Regression tests**: Prevent breaking existing calculations

### POE2_HTC Technology Stack

**Frontend (Established)**:
```typescript
// Electron + React + TypeScript (strict mode)
import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // shadcn/ui
// Tailwind CSS for styling
// Vite for build tooling
```

**Backend (Established)**:
```java
// Java 21+ with Maven
public class Crafting_Algorithm {
    // Core beam search - PRESERVE STRUCTURE
    // Only optimize parameters and data structures
}
```

**IPC Communication**:
```typescript
// Current: HTTP-based (localhost:8080)
// Future: Consider named pipes/sockets for performance
const response = await fetch('http://localhost:8080/api/calculate', {
    method: 'POST',
    body: JSON.stringify(craftingRequest)
});
```

### Implementation Guidelines by Layer

#### Backend (Java) Implementation

**Memory Optimization Pattern**:
```java
// GOOD: Object pooling to reduce heap pressure
public class CandidatePool {
    private final ConcurrentLinkedQueue<Crafting_Candidate> pool;
    
    public Crafting_Candidate acquire() {
        Crafting_Candidate candidate = pool.poll();
        return candidate != null ? candidate : new Crafting_Candidate();
    }
    
    public void release(Crafting_Candidate candidate) {
        candidate.reset(); // Prevent data leakage
        pool.offer(candidate);
    }
}

// BAD: Creating new objects in tight loops
for (int i = 0; i < beamWidth; i++) {
    candidates.add(new Crafting_Candidate()); // Heap pressure!
}
```

**Thread Safety Pattern**:
```java
// GOOD: Thread-safe concurrent operations
private final ExecutorService executor = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors() - 1
);

public CompletableFuture<Result> calculateAsync(Request req) {
    return CompletableFuture.supplyAsync(() -> calculate(req), executor);
}

// BAD: Shared mutable state without synchronization
private List<Candidate> sharedCandidates; // Race conditions!
```

**Algorithm Parameter Pattern**:
```java
// GOOD: Configurable parameters preserving algorithm structure
public class BeamSearchConfig {
    private int beamWidth = 100; // Optimizable
    private int desiredModifierScore = 1000; // Optimizable
    private int relevantTagScore = 250; // Optimizable
    
    // Algorithm structure remains unchanged
}

// BAD: Changing algorithm logic
public void calculate() {
    // DON'T: Replace beam search with A* or genetic algorithm
    // DO: Adjust beam width, scoring, pruning thresholds
}
```

#### Frontend (React/TypeScript) Implementation

**State Management Pattern**:
```typescript
// GOOD: Clean separation of concerns
interface CraftingState {
    isCalculating: boolean;
    progress: number;
    canCancel: boolean;
    results: CraftingResult | null;
    error: Error | null;
}

const useCraftingSimulator = () => {
    const [state, setState] = useState<CraftingState>(initialState);
    
    const calculate = async (request: CraftingRequest) => {
        setState(s => ({ ...s, isCalculating: true }));
        // Non-blocking async operation
    };
    
    return { state, calculate, cancel };
};

// BAD: Any types, blocking operations
const [data, setData] = useState<any>(); // No type safety!
const result = calculateSync(); // Blocks UI!
```

**Progress Tracking Pattern**:
```typescript
// GOOD: Real-time progress with cancellation
const [progress, setProgress] = useState(0);
const cancelRef = useRef<AbortController>();

const calculateWithProgress = async () => {
    cancelRef.current = new AbortController();
    
    const interval = setInterval(async () => {
        const response = await fetch('/api/progress');
        const { percent } = await response.json();
        setProgress(percent);
    }, 100); // Poll every 100ms
    
    try {
        await fetch('/api/calculate', {
            signal: cancelRef.current.signal
        });
    } finally {
        clearInterval(interval);
    }
};

const handleCancel = () => {
    cancelRef.current?.abort();
};

// BAD: No progress feedback, no cancellation
const result = await longRunningOperation(); // User stuck waiting
```

**Error Handling Pattern**:
```typescript
// GOOD: User-friendly, actionable errors
try {
    await calculate(request);
} catch (error) {
    if (error.name === 'HeapSpaceError') {
        showError(
            'Calculation too complex',
            'Try reducing the number of desired modifiers or simplifying the item.'
        );
    } else if (error.name === 'TimeoutError') {
        showError(
            'Calculation timed out',
            'This combination is taking too long. Try adjusting your requirements.'
        );
    } else {
        showError('Calculation failed', error.message);
    }
}

// BAD: Generic error messages
catch (e) { alert('Error'); } // Not helpful!
```

### Implementation Checklist (Before Committing)

**Algorithm Integrity**:
- [ ] Core beam search structure unchanged?
- [ ] Only parameters modified (if any)?
- [ ] Algorithmic equivalence maintained?
- [ ] Explicit approval documented (if structure changed)?

**Performance**:
- [ ] Memory impact analyzed and documented?
- [ ] Heap usage tested with complex scenarios?
- [ ] Computation time <1 minute verified?
- [ ] Progress tracking implemented (if >1 second)?
- [ ] Cancellation mechanism working?

**Code Quality**:
- [ ] TypeScript strict mode compliant (no unjustified 'any')?
- [ ] Frontend/backend separation maintained?
- [ ] Thread safety verified (backend)?
- [ ] Dependencies justified and minimal?
- [ ] Code documented (JavaDoc/TSDoc)?

**Testing**:
- [ ] Unit tests written and passing?
- [ ] Integration tests added (if IPC changed)?
- [ ] Memory tests validate optimization?
- [ ] Performance benchmarks show improvement?
- [ ] Regression tests prevent breaking changes?

**Documentation**:
- [ ] Code comments for complex logic?
- [ ] API changes documented?
- [ ] ADR created (if architectural decision)?
- [ ] User-facing changes in changelog?

### Common Implementation Scenarios

#### Scenario 1: Memory Optimization
```java
// Task: Reduce heap pressure in beam search
// Approach: Object pooling

// 1. Create pool
public class CandidatePool { /* ... */ }

// 2. Integrate with algorithm (PRESERVE STRUCTURE)
public class Crafting_Algorithm {
    private final CandidatePool pool = new CandidatePool(50000);
    
    private void expandBeam() {
        // Before: new Crafting_Candidate()
        // After: pool.acquire()
        Crafting_Candidate candidate = pool.acquire();
        // ... use candidate ...
        pool.release(candidate); // Return to pool
    }
}

// 3. Test memory impact
@Test
public void testMemoryOptimization() {
    long beforeHeap = getHeapUsage();
    runComplexCalculation();
    long afterHeap = getHeapUsage();
    assertTrue(afterHeap - beforeHeap < targetHeapIncrease);
}
```

#### Scenario 2: Progress Tracking
```typescript
// Task: Add real-time progress indicator
// Approach: Polling + cancellation

// 1. Backend endpoint
@GetMapping("/api/progress/{sessionId}")
public ProgressResponse getProgress(@PathVariable String sessionId) {
    return progressTracker.getProgress(sessionId);
}

// 2. Frontend hook
const useCalculationProgress = (sessionId: string) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(async () => {
            const response = await fetch(`/api/progress/${sessionId}`);
            const data = await response.json();
            setProgress(data.percent);
        }, 100);
        
        return () => clearInterval(interval);
    }, [sessionId]);
    
    return progress;
};

// 3. UI component
const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded">
        <div 
            className="bg-blue-600 h-2 rounded transition-all"
            style={{ width: `${progress}%` }}
        />
        <p className="text-sm mt-1">{progress}% complete</p>
    </div>
);
```

#### Scenario 3: Algorithm Parameter Tuning
```java
// Task: Optimize beam width for better performance/accuracy balance
// Approach: Adaptive beam width based on complexity

public class BeamSearchOptimizer {
    public int calculateOptimalBeamWidth(ItemComplexity complexity) {
        // PRESERVES ALGORITHM STRUCTURE
        // Only adjusts parameter based on complexity
        return switch (complexity) {
            case SIMPLE -> 50;   // Fewer modifiers, narrow beam
            case MEDIUM -> 100;  // Standard beam
            case COMPLEX -> 200; // More modifiers, wider beam
        };
    }
}

// Integration (ALGORITHM STRUCTURE UNCHANGED)
public Result calculate(Request request) {
    int beamWidth = optimizer.calculateOptimalBeamWidth(
        request.getComplexity()
    );
    
    // Same beam search algorithm, different parameter
    return beamSearch(request, beamWidth);
}
```

### Success Criteria

Implementation is complete when:
- ✅ All acceptance criteria met
- ✅ Tests passing (unit, integration, performance)
- ✅ Memory impact validated (<= target heap)
- ✅ Computation time verified (<= 1 minute)
- ✅ Algorithm integrity preserved
- ✅ Code quality standards met
- ✅ Documentation updated
- ✅ Ready for code review

Remember: POE2_HTC implementations must preserve the core beam search algorithm while enabling v1.0 completion through performance optimization and quality improvements. Every line of code should consider memory impact and computation time.