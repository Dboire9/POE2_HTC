# POE2_HTC v1.0 Completion - Technical Plan

**Feature**: Complete POE2_HTC to production-ready v1.0 release  
**Specification**: [spec.md](./spec.md)  
**Status**: Planning Complete, Ready for Implementation

## Architecture Overview

### Current Architecture (ESTABLISHED - MUST PRESERVE)

```
┌─────────────────────────────────────────────────────────┐
│  Frontend Layer (Electron + React + TypeScript)        │
│  ├── Electron Main Process (electron/main.ts)          │
│  ├── React UI Components (src/components/)             │
│  │   ├── CraftingSimulator.tsx                         │
│  │   ├── ItemSelector.tsx                              │
│  │   ├── CurrencySelector.tsx                          │
│  │   ├── ModifierSelector.tsx                          │
│  │   ├── Results.tsx                                   │
│  │   └── ui/ (shadcn/ui components)                    │
│  └── Custom Hooks (src/hooks/)                         │
│      └── useApi.ts                                     │
├─────────────────────────────────────────────────────────┤
│  IPC Layer (HTTP)                                       │
│  └── fetch('http://localhost:8080/api/*')              │
├─────────────────────────────────────────────────────────┤
│  Backend Layer (Java + Maven)                          │
│  ├── Core Algorithm (src/main/java/core/)              │
│  │   ├── Crafting/                                     │
│  │   │   ├── Crafting_Algorithm.java (PRESERVE)       │
│  │   │   ├── Crafting_Candidate.java                  │
│  │   │   ├── Crafting_Item.java                       │
│  │   │   ├── CraftingExecutor.java                    │
│  │   │   └── Probabilities/ + Utils/                  │
│  │   ├── Currency/ (7 currency types)                 │
│  │   ├── Items/ (14 item types)                       │
│  │   └── Modifier_class/ (modifier system)            │
│  ├── Server (ServerMain.java - HTTP server)           │
│  └── GUI (Optional JavaFX - not used in Electron)     │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack (ESTABLISHED)

**Frontend:**
- **Framework**: Electron 32+ (desktop app)
- **UI Library**: React 19 with TypeScript (strict mode)
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4+
- **Build Tool**: Vite 7+ with esbuild
- **State Management**: React hooks (useState, useEffect, useRef)

**Backend:**
- **Language**: Java 21+ (production), Java 17 (dev minimum)
- **Build Tool**: Maven 3.8+
- **Concurrency**: ExecutorService with thread pool
- **JSON**: Gson 2.10.1
- **HTTP Server**: Custom implementation (ServerMain.java)

**IPC:**
- **Protocol**: HTTP REST
- **Base URL**: http://localhost:8080
- **Endpoints**: `/api/calculate`, `/api/progress/{sessionId}`, `/api/cancel/{sessionId}`

## Implementation Plan

### Phase 1: Memory Optimization (P1 - IMMEDIATE)

**Goal**: Eliminate heap space exhaustion failures  
**Constitutional Alignment**: [Constitution §II - Performance First]

#### 1.1 Object Pooling for Crafting_Candidate

**Problem**: Beam search creates thousands of Crafting_Candidate objects, causing GC pressure

**Solution**: Implement CandidatePool for object reuse

**Architecture**:
```java
// New class: src/main/java/core/Crafting/Utils/CandidatePool.java
package core.Crafting.Utils;

import java.util.concurrent.ConcurrentLinkedQueue;
import core.Crafting.Crafting_Candidate;

public class CandidatePool {
    private final ConcurrentLinkedQueue<Crafting_Candidate> pool;
    private final int maxPoolSize;
    
    public CandidatePool(int maxPoolSize) {
        this.pool = new ConcurrentLinkedQueue<>();
        this.maxPoolSize = maxPoolSize;
    }
    
    public Crafting_Candidate acquire() {
        Crafting_Candidate candidate = pool.poll();
        if (candidate != null) {
            return candidate;
        }
        // Pool empty, create new instance
        return new Crafting_Candidate();
    }
    
    public void release(Crafting_Candidate candidate) {
        if (pool.size() < maxPoolSize) {
            candidate.reset(); // Clear data
            pool.offer(candidate);
        }
        // If pool full, let GC handle it
    }
    
    public int size() {
        return pool.size();
    }
}
```

**Integration Points**:
- Modify `Crafting_Algorithm.optimizeCrafting()` to use pool
- Add `reset()` method to `Crafting_Candidate.java`
- Initialize pool with size 50,000 (empirically tested)

**Testing**:
- Unit test: `CandidatePoolTest.java` (acquire, release, thread safety)
- Memory test: Measure heap before/after with JMX
- Integration test: Complex scenario (6 modifiers) without OOM

**Expected Impact**: 50-70% reduction in object allocation rate

#### 1.2 Streaming Data Structures

**Problem**: Large candidate lists consume excessive memory

**Solution**: Use iterators and streaming where possible

**Changes**:
```java
// Before: Store all candidates in memory
List<Crafting_Candidate> allCandidates = new ArrayList<>();
for (Crafting_Candidate c : candidates) {
    allCandidates.add(processCandidate(c));
}

// After: Stream and filter
Stream<Crafting_Candidate> candidateStream = candidates.stream()
    .map(this::processCandidate)
    .filter(c -> c.getScore() > threshold);
```

**Integration Points**:
- `Crafting_Algorithm.processCandidateLists()`
- `Crafting_Algorithm.deepCopy()` - replace with lazy copy
- Currency `apply()` methods - use streams

**Testing**:
- Memory test: Compare heap usage streaming vs list
- Performance test: Ensure no regression in computation time

**Expected Impact**: 30-40% reduction in peak memory usage

#### 1.3 Memory Monitoring & Limits

**Problem**: No visibility into heap usage during computation

**Solution**: Add memory tracking and graceful degradation

**Architecture**:
```java
// New class: src/main/java/core/Crafting/Utils/MemoryMonitor.java
public class MemoryMonitor {
    private static final Runtime runtime = Runtime.getRuntime();
    private static final double MEMORY_WARNING_THRESHOLD = 0.85; // 85%
    private static final double MEMORY_CRITICAL_THRESHOLD = 0.95; // 95%
    
    public static MemoryStatus checkMemory() {
        long maxMemory = runtime.maxMemory();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        double usageRatio = (double) usedMemory / maxMemory;
        
        if (usageRatio > MEMORY_CRITICAL_THRESHOLD) {
            return MemoryStatus.CRITICAL;
        } else if (usageRatio > MEMORY_WARNING_THRESHOLD) {
            return MemoryStatus.WARNING;
        }
        return MemoryStatus.OK;
    }
    
    public enum MemoryStatus { OK, WARNING, CRITICAL }
}
```

**Integration Points**:
- Check memory in beam search loop
- Warn user at WARNING level
- Abort gracefully at CRITICAL level

**Testing**:
- Unit test: Memory threshold detection
- Integration test: Graceful degradation behavior

### Phase 2: Algorithm Parameter Optimization (P1)

**Goal**: Tune beam width and scoring weights for optimal performance/accuracy  
**Constitutional Alignment**: [Constitution §I - Algorithm Integrity]

#### 2.1 Adaptive Beam Width

**Problem**: Fixed beam width inefficient for different complexities

**Solution**: Dynamic beam width based on item complexity

**Architecture**:
```java
// New class: src/main/java/core/Crafting/BeamSearchConfig.java
package core.Crafting;

public class BeamSearchConfig {
    // Scoring weights (tunable)
    private int desiredModifierScore = 1000;
    private int relevantTagScore = 250;
    
    // Beam width calculation
    public int calculateBeamWidth(ItemComplexity complexity) {
        return switch (complexity) {
            case SIMPLE -> 50;   // 1-2 modifiers
            case MEDIUM -> 100;  // 3-4 modifiers
            case COMPLEX -> 200; // 5-6 modifiers
        };
    }
    
    public enum ItemComplexity {
        SIMPLE, MEDIUM, COMPLEX;
        
        public static ItemComplexity from(int modifierCount) {
            if (modifierCount <= 2) return SIMPLE;
            if (modifierCount <= 4) return MEDIUM;
            return COMPLEX;
        }
    }
    
    // Getters/setters for scoring weights
    public int getDesiredModifierScore() { return desiredModifierScore; }
    public void setDesiredModifierScore(int score) { this.desiredModifierScore = score; }
    
    public int getRelevantTagScore() { return relevantTagScore; }
    public void setRelevantTagScore(int score) { this.relevantTagScore = score; }
}
```

**Integration Points**:
- Modify `Crafting_Algorithm.optimizeCrafting()` signature to accept config
- Calculate complexity from `desiredMods.size()`
- Pass beam width to beam search iterations

**Testing**:
- Unit test: Complexity calculation
- Performance test: Compare fixed vs adaptive beam width
- Accuracy test: Validate results match with known test cases

**Expected Impact**: 20-30% reduction in computation time for simple items

#### 2.2 Scoring Weight Optimization

**Problem**: Current weights (1000/250) not empirically validated

**Solution**: Automated parameter search with benchmark suite

**Approach**:
1. Create benchmark suite with known optimal paths
2. Grid search: test weight combinations
3. Measure accuracy (path quality) vs speed
4. Select optimal weights

**Benchmark Format**:
```java
// New class: src/test/java/core/Crafting/BenchmarkSuite.java
public class BenchmarkSuite {
    private List<BenchmarkCase> cases;
    
    static class BenchmarkCase {
        Crafting_Item baseItem;
        List<Modifier> desiredMods;
        List<Crafting_Action> expectedOptimalPath;
        double maxAcceptableTime; // seconds
    }
    
    public BenchmarkResult runBenchmark(BeamSearchConfig config) {
        // Run all cases, measure time and accuracy
    }
}
```

**Testing**:
- Create 10-20 benchmark cases (simple, medium, complex)
- Automated parameter search script
- Document optimal weights in ADR

**Expected Impact**: 10-15% improvement in path quality

### Phase 3: Progress Tracking & Cancellation (P1)

**Goal**: Real-time feedback and instant cancellation  
**Constitutional Alignment**: [Constitution §II - Performance First]

#### 3.1 Backend Progress Tracking

**Architecture**:
```java
// New class: src/main/java/core/Crafting/ProgressTracker.java
package core.Crafting;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;

public class ProgressTracker {
    private static final Map<String, SessionProgress> sessions = new ConcurrentHashMap<>();
    
    public static class SessionProgress {
        private final AtomicInteger currentIteration = new AtomicInteger(0);
        private final int totalIterations;
        private final AtomicBoolean cancelled = new AtomicBoolean(false);
        private final long startTime;
        
        public SessionProgress(int totalIterations) {
            this.totalIterations = totalIterations;
            this.startTime = System.currentTimeMillis();
        }
        
        public void incrementProgress() {
            currentIteration.incrementAndGet();
        }
        
        public double getPercentComplete() {
            return (double) currentIteration.get() / totalIterations * 100;
        }
        
        public long getElapsedMs() {
            return System.currentTimeMillis() - startTime;
        }
        
        public long getEstimatedRemainingMs() {
            int current = currentIteration.get();
            if (current == 0) return -1;
            long elapsed = getElapsedMs();
            double rate = (double) elapsed / current;
            return (long) (rate * (totalIterations - current));
        }
        
        public void cancel() {
            cancelled.set(true);
        }
        
        public boolean isCancelled() {
            return cancelled.get();
        }
    }
    
    public static void startSession(String sessionId, int totalIterations) {
        sessions.put(sessionId, new SessionProgress(totalIterations));
    }
    
    public static SessionProgress getProgress(String sessionId) {
        return sessions.get(sessionId);
    }
    
    public static void endSession(String sessionId) {
        sessions.remove(sessionId);
    }
}
```

**HTTP Endpoints** (ServerMain.java):
```java
// GET /api/progress/{sessionId}
// Returns: { "percent": 45.2, "elapsedMs": 12000, "estimatedRemainingMs": 14500 }

// POST /api/cancel/{sessionId}
// Returns: { "success": true }
```

**Integration Points**:
- Modify `Crafting_Algorithm.optimizeCrafting()` to accept sessionId
- Call `progressTracker.incrementProgress()` in beam search loop
- Check `progressTracker.isCancelled()` every iteration

**Testing**:
- Unit test: ProgressTracker thread safety
- Integration test: Progress updates during computation
- Integration test: Cancellation propagation

#### 3.2 Frontend Progress Hook

**Architecture**:
```typescript
// File: src/hooks/useCalculationProgress.ts
import { useState, useEffect } from 'react';

interface ProgressData {
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export function useCalculationProgress(sessionId: string | null) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!sessionId) {
      setProgress(null);
      return;
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/progress/${sessionId}`);
        if (!response.ok) throw new Error('Progress fetch failed');
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err as Error);
        clearInterval(interval);
      }
    }, 100); // Poll every 100ms
    
    return () => clearInterval(interval);
  }, [sessionId]);
  
  return { progress, error };
}
```

**UI Component**:
```typescript
// File: src/components/ProgressBar.tsx
interface ProgressBarProps {
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  onCancel: () => void;
}

export function ProgressBar({ percent, elapsedMs, estimatedRemainingMs, onCancel }: ProgressBarProps) {
  const formatTime = (ms: number) => {
    if (ms < 0) return '--';
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{percent.toFixed(1)}% complete</span>
        <span>ETA: {formatTime(estimatedRemainingMs)}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <Button onClick={onCancel} variant="destructive" size="sm" className="w-full">
        Cancel Calculation
      </Button>
    </div>
  );
}
```

**Integration Points**:
- Modify `CraftingSimulator.tsx` to use hooks
- Generate unique sessionId (UUID)
- Pass sessionId to backend in calculation request

### Phase 4: Frontend State Management (P2)

**Goal**: Proper state management with TypeScript strict mode  
**Constitutional Alignment**: [Constitution §III - Code Quality]

#### 4.1 Crafting State Hook

**Architecture**:
```typescript
// File: src/hooks/useCraftingSimulator.ts
import { useState, useRef } from 'react';

interface CraftingState {
  isCalculating: boolean;
  sessionId: string | null;
  results: CraftingResult | null;
  error: CraftingError | null;
}

interface CraftingRequest {
  itemId: string;
  desiredModifiers: string[];
  undesiredModifiers: string[];
  iterations: number;
}

interface CraftingResult {
  path: CraftingAction[];
  probability: number;
  averageSteps: number;
}

interface CraftingError {
  type: 'HeapSpaceError' | 'TimeoutError' | 'NetworkError' | 'UnknownError';
  message: string;
  suggestions: string[];
}

export function useCraftingSimulator() {
  const [state, setState] = useState<CraftingState>({
    isCalculating: false,
    sessionId: null,
    results: null,
    error: null,
  });
  
  const cancelRef = useRef<AbortController>();
  
  const calculate = async (request: CraftingRequest) => {
    const sessionId = crypto.randomUUID();
    cancelRef.current = new AbortController();
    
    setState(s => ({ 
      ...s, 
      isCalculating: true, 
      sessionId,
      error: null 
    }));
    
    try {
      const response = await fetch('http://localhost:8080/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, sessionId }),
        signal: cancelRef.current.signal,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Calculation failed');
      }
      
      const results = await response.json();
      setState(s => ({ ...s, isCalculating: false, results, sessionId: null }));
    } catch (err) {
      const craftingError = mapError(err);
      setState(s => ({ ...s, isCalculating: false, error: craftingError, sessionId: null }));
    }
  };
  
  const cancel = async () => {
    if (!state.sessionId) return;
    
    cancelRef.current?.abort();
    
    try {
      await fetch(`http://localhost:8080/api/cancel/${state.sessionId}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Cancel request failed:', err);
    }
    
    setState(s => ({ ...s, isCalculating: false, sessionId: null }));
  };
  
  return { state, calculate, cancel };
}

function mapError(err: unknown): CraftingError {
  if (err instanceof Error) {
    if (err.message.includes('OutOfMemoryError')) {
      return {
        type: 'HeapSpaceError',
        message: 'Calculation too complex',
        suggestions: [
          'Try reducing the number of desired modifiers',
          'Simplify the item requirements',
          'Increase the Java heap size (-Xmx flag)',
        ],
      };
    }
    if (err.message.includes('timeout')) {
      return {
        type: 'TimeoutError',
        message: 'Calculation timed out',
        suggestions: [
          'Adjust your requirements to be less complex',
          'Try a simpler item type',
        ],
      };
    }
  }
  
  return {
    type: 'UnknownError',
    message: err instanceof Error ? err.message : 'Unknown error occurred',
    suggestions: ['Check the console for more details', 'Try restarting the application'],
  };
}
```

**Integration Points**:
- Refactor `CraftingSimulator.tsx` to use hook
- Remove inline state management
- Add error display component

**Testing**:
- Unit test: State transitions
- Integration test: Full calculation flow
- Error handling test: All error types

### Phase 5: Testing & Quality Assurance (P1/P2)

**Goal**: Comprehensive test coverage  
**Constitutional Alignment**: [Constitution §IV - Testing Standards]

#### 5.1 Unit Tests

**Test Structure**:
```
src/test/java/core/
├── Crafting/
│   ├── CandidatePoolTest.java (P1)
│   ├── BeamSearchConfigTest.java (P1)
│   ├── ProgressTrackerTest.java (P1)
│   └── MemoryMonitorTest.java (P1)
├── Currency/
│   ├── TransmutationOrbTest.java (P2)
│   ├── AugmentationOrbTest.java (P2)
│   └── ... (other currencies)
└── Utils/
    └── Heuristic_UtilTest.java (P1)
```

**Example Test**:
```java
// CandidatePoolTest.java
@Test
public void testAcquireRelease() {
    CandidatePool pool = new CandidatePool(10);
    
    Crafting_Candidate c1 = pool.acquire();
    assertNotNull(c1);
    
    pool.release(c1);
    assertEquals(1, pool.size());
    
    Crafting_Candidate c2 = pool.acquire();
    assertSame(c1, c2); // Should reuse same instance
}

@Test
public void testThreadSafety() throws Exception {
    CandidatePool pool = new CandidatePool(100);
    ExecutorService executor = Executors.newFixedThreadPool(10);
    
    List<Future<?>> futures = new ArrayList<>();
    for (int i = 0; i < 100; i++) {
        futures.add(executor.submit(() -> {
            Crafting_Candidate c = pool.acquire();
            // Simulate work
            pool.release(c);
        }));
    }
    
    for (Future<?> f : futures) {
        f.get(); // Wait for all threads
    }
    
    // No exceptions = thread safe
}
```

#### 5.2 Memory Tests

**Test Suite**:
```java
// MemoryOptimizationTest.java
public class MemoryOptimizationTest {
    @Test
    public void testHeapUsageBeforeAfter() {
        Runtime runtime = Runtime.getRuntime();
        
        // Baseline
        runtime.gc();
        long beforeHeap = runtime.totalMemory() - runtime.freeMemory();
        
        // Run complex calculation
        Crafting_Item item = createComplexItem();
        List<Modifier> desired = createSixModifiers();
        Crafting_Algorithm.optimizeCrafting(item, desired, List.of(), 0.5);
        
        // Measure
        runtime.gc();
        long afterHeap = runtime.totalMemory() - runtime.freeMemory();
        long heapIncrease = afterHeap - beforeHeap;
        
        // Assert: <2GB increase for complex scenario
        assertTrue(heapIncrease < 2_000_000_000L, 
            "Heap increased by " + (heapIncrease / 1_000_000) + "MB");
    }
    
    @Test
    public void testNoOutOfMemoryError() {
        // This should complete without OOM
        Crafting_Item item = createWorstCaseItem();
        List<Modifier> desired = createSixModifiers();
        
        assertDoesNotThrow(() -> {
            Crafting_Algorithm.optimizeCrafting(item, desired, List.of(), 0.5);
        });
    }
}
```

#### 5.3 Performance Benchmarks

**Benchmark Suite**:
```java
// PerformanceBenchmarkTest.java
@Test
public void benchmarkSimpleItem() {
    Crafting_Item item = createSimpleItem();
    List<Modifier> desired = List.of(createModifier("Life"));
    
    long start = System.currentTimeMillis();
    Crafting_Algorithm.optimizeCrafting(item, desired, List.of(), 0.5);
    long duration = System.currentTimeMillis() - start;
    
    assertTrue(duration < 5_000, "Simple item took " + duration + "ms (expected <5s)");
}

@Test
public void benchmarkComplexItem() {
    Crafting_Item item = createComplexItem();
    List<Modifier> desired = createSixModifiers();
    
    long start = System.currentTimeMillis();
    Crafting_Algorithm.optimizeCrafting(item, desired, List.of(), 0.5);
    long duration = System.currentTimeMillis() - start;
    
    assertTrue(duration < 60_000, "Complex item took " + duration + "ms (expected <60s)");
}
```

### Phase 6: Documentation (P3)

**Goal**: Comprehensive technical and user documentation  
**Constitutional Alignment**: [Constitution - Development Workflow]

#### 6.1 Algorithm Documentation

**Document Structure**:
```markdown
# Beam Search Algorithm Design

## Mathematical Foundation

### Beam Search Overview
Beam search is a heuristic search algorithm that explores a graph by expanding the most promising nodes in a limited set (beam).

**Notation:**
- `B`: Beam width (number of candidates to keep)
- `S(c)`: Score function for candidate `c`
- `H(c)`: Heuristic function estimating completion cost
- `C`: Set of current candidates
- `N(c)`: Neighbors/successors of candidate `c`

**Algorithm:**
```
1. Initialize: C = {initial_state}
2. While not done:
   a. Expand: C' = ⋃_{c ∈ C} N(c)
   b. Score: S(c') = desired_score + heuristic_score
   c. Prune: C = top_B(C', S)
3. Return: best candidate in C
```

### Scoring Function
... [detailed formulas]

### Heuristic Design
... [tag-based heuristics]

## Implementation Details
... [Java code explanation]
```

**Deliverables**:
- `docs/algorithm-design.md`
- `docs/architecture-decisions/`
  - `ADR-001-beam-search-algorithm.md`
  - `ADR-002-object-pooling.md`
  - `ADR-003-http-ipc.md`

#### 6.2 API Documentation

**Generated from Code**:
- JavaDoc → `target/site/apidocs/`
- TSDoc → `docs/api/frontend/`

**Manual Documentation**:
- `docs/api/rest-api.md` (HTTP endpoints)
- `docs/api/ipc-protocol.md` (request/response formats)

#### 6.3 User Documentation

**Updates**:
- `README.md` - Add v1.0 features, updated screenshots
- `CONTRIBUTING.md` - Development workflow, testing guidelines
- `docs/setup.md` - Platform-specific setup instructions
- `docs/troubleshooting.md` - Common issues and solutions

## Constitutional Compliance Verification

### Algorithm Integrity ✅
- ✅ Core beam search structure preserved
- ✅ Only parameters optimized (beam width, scoring weights)
- ✅ Algorithmic equivalence maintained
- ✅ All changes documented in ADRs

### Performance First ✅
- ✅ Memory optimization (object pooling, streaming)
- ✅ <1 minute target (adaptive beam width)
- ✅ Progress tracking (real-time updates)
- ✅ Cancellation mechanism (instant abort)

### Code Quality ✅
- ✅ Frontend/backend separation maintained
- ✅ TypeScript strict mode (no 'any' types)
- ✅ React best practices (custom hooks)
- ✅ Thread safety (concurrent data structures)

### Testing Standards ✅
- ✅ Unit tests (core components)
- ✅ Memory tests (heap validation)
- ✅ Integration tests (IPC communication)
- ✅ Performance benchmarks (computation time)

### User Experience ✅
- ✅ Dark mode interface
- ✅ Real-time feedback (progress bars)
- ✅ Instant cancellation
- ✅ User-friendly error messages

## Risk Management

### Memory Optimization Risks
- **Risk**: Object pooling insufficient
- **Mitigation**: Multiple strategies (pooling + streaming + monitoring)
- **Fallback**: Reduce beam width dynamically at memory warnings

### Performance Risks
- **Risk**: Adaptive beam width doesn't meet <1min target
- **Mitigation**: Empirical testing, fallback to fixed narrower beam
- **Monitoring**: Performance benchmarks in CI pipeline

### Quality Risks
- **Risk**: Refactoring introduces regressions
- **Mitigation**: Comprehensive test suite, incremental changes
- **Verification**: Regression tests for existing functionality

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create tasks.md** breaking down into 2-4 hour tasks
3. **Create checklists** for quality validation
4. **Begin Phase 1** (Memory Optimization) implementation
5. **Track progress** and update plan as needed

## References

- [Specification](./spec.md)
- [Task Breakdown](./tasks.md)
- [Constitution](../../memory/constitution.md)
- [Implementation Patterns](../../../.github/prompts/speckit.implement.prompt.md)
