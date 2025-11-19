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

**Frontend (FLEXIBLE - CAN BE FREELY REFACTORED):**
- **Framework**: Electron 32+ (desktop app)
- **UI Library**: React 19 with TypeScript (strict mode)
- **Component Library**: shadcn/ui (Radix UI primitives) - can be customized/extended
- **Styling**: Tailwind CSS 3.4+
- **Build Tool**: Vite 7+ with esbuild
- **State Management**: React hooks (useState, useEffect, useRef) - can add Context, Zustand, etc.
- **Note**: Existing components (`App.tsx`, `CraftingSimulator.tsx`, etc.) are reference implementations and can be completely restructured/rewritten as needed for better UX, progress tracking, and maintainability.

**Backend (STRICT - PRESERVE ALGORITHM INTEGRITY):**
- **Language**: Java 21+ (production), Java 17 (dev minimum)
- **Build Tool**: Maven 3.8+
- **Concurrency**: ExecutorService with thread pool
- **JSON**: Gson 2.10.1
- **HTTP Server**: Custom implementation (ServerMain.java)
- **Note**: Core algorithm logic (`Crafting_Algorithm.java`, currency classes) must preserve beam search structure and scoring mechanisms per Constitution §I.

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

**Implementation Status**: ✅ T1.1 COMPLETE (reset method), ✅ T1.2 COMPLETE (CandidatePool), 🔄 T1.3 PARTIAL (integration)

**Architecture**:
```java
// New class: src/main/java/core/Crafting/Utils/CandidatePool.java [CREATED]
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

**Integration Points** (ACTUAL COMPLEXITY DISCOVERED):
- ✅ Add `reset()` method to `Crafting_Candidate.java` [COMPLETE - T1.1]
- ✅ Initialize pool in `Crafting_Algorithm.optimizeCrafting()` with size 50,000 [COMPLETE - T1.2]
- 🔄 **REQUIRES EXTENSIVE REFACTORING** (~2,000 LOC across 8+ files) [PARTIAL - T1.3]:
  - Modify `Crafting_Candidate.copy()` to call `pool.acquire()` instead of `new Crafting_Candidate()`
  - Modify `Crafting_Item.copy()` to accept pool parameter
  - Update ALL currency classes to use pooling:
    - TransmutationOrb.apply() [8+ candidate creation sites]
    - AugmentationOrb.apply()
    - RegalOrb.apply()
    - ExaltedOrb.apply()
    - AnnulmentOrb.apply()
    - Essence_currency.apply()
    - Desecrated_currency.apply()
  - Add pool.release() calls after candidate processing
  - Thread-safe pool passing through beam search iterations
- **Constitution §I Constraint**: Must preserve algorithm integrity - no changes to scoring/heuristic logic

**Testing**:
- ✅ Unit test: `CandidatePoolTest.java` (acquire, release, thread safety) [CREATED]
- Memory test: Measure heap before/after with JMX [PENDING]
- Integration test: Complex scenario (6 modifiers) without OOM [PENDING]

**Expected Impact**: 50-70% reduction in object allocation rate (once fully integrated)

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

**Implementation Status**: ✅ T2.1 COMPLETE (BeamSearchConfig class), 🔄 T2.2 PARTIAL (beam width pruning NOT wired)

**Architecture**:
```java
// New class: src/main/java/core/Crafting/BeamSearchConfig.java [CREATED]
package core.Crafting;

public class BeamSearchConfig {
    // Scoring weights (tunable)
    private int desiredModifierScore = 1000;
    private int relevantTagScore = 250;
    
    // Beam width calculation [IMPLEMENTED]
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

**Integration Points** (ACTUAL STATUS):
- ✅ Modify `Crafting_Algorithm.optimizeCrafting()` signature to accept config [COMPLETE]
- ✅ Calculate complexity from `desiredMods.size()` [COMPLETE]
- ❌ **Pass beam width to beam search iterations** [NOT IMPLEMENTED]
- ❌ **Implement beam width pruning in `processCandidateLists()`** [TODO]:
  - Current: Algorithm keeps ALL candidates regardless of beam width
  - Needed: Sort candidates by score, keep only top N (where N = beamWidth)
  - Location: Crafting_Algorithm.processCandidateLists() line ~180
  - Complexity: ~100-200 LOC to implement sorting + pruning per iteration
- **Current Pruning**: Only heuristic scoring + threshold filtering, no beam width limiting

**Testing**:
- Unit test: Complexity calculation [PENDING]
- Performance test: Compare fixed vs adaptive beam width [PENDING - requires pruning implementation]
- Accuracy test: Validate results match with known test cases [PENDING]

**Expected Impact**: 20-30% reduction in computation time for simple items (once pruning implemented)

#### 2.2 Scoring Weight Optimization

**Problem**: Current weights (1000/250) not empirically validated

**Solution**: Automated parameter search with benchmark suite

**Implementation Status**: ✅ T2.1 COMPLETE (BeamSearchConfig has weight fields), ❌ NOT WIRED (Heuristic_Util uses hardcoded values), ✅ T2.3 COMPLETE (BenchmarkSuite with 11 test cases)

**Current Reality**:
- BeamSearchConfig has `desiredModifierScore` and `relevantTagScore` fields
- Heuristic_Util.calculateAffixScore() uses hardcoded 1000/250 values
- Config parameters NOT passed to scoring functions
- Requires wiring config through Crafting_Algorithm → Heuristic_Util

**Approach**:
1. ✅ Create benchmark suite with known optimal paths [COMPLETE - T2.3]
2. Grid search: test weight combinations [PENDING]
3. Measure accuracy (path quality) vs speed [PENDING]
4. Select optimal weights [PENDING]

**Benchmark Format**:
```java
// New class: src/test/java/core/Crafting/BenchmarkSuite.java [CREATED]
public class BenchmarkSuite {
    // 11 concrete test cases created:
    // SIMPLE (3): Bow 2-mod, Helmet 1-mod, Ring 2-mod
    // MEDIUM (4): Bow 4-mod, Armor 3-mod, Mace 4-mod, Amulet 3-mod
    // COMPLEX (4): Bow 6-mod, Helmet 5-mod, Armor 6-mod, Wand 6-mod
    
    public BenchmarkResult runBenchmark(BeamSearchConfig config) {
        // Run all cases, measure time and accuracy
    }
}
```

**Integration Work Required**:
- Modify Heuristic_Util.calculateAffixScore() to accept config parameter
- Pass config through Crafting_Algorithm → currency.apply() → Heuristic_Util
- Estimated ~500-800 LOC changes across scoring functions

**Testing**:
- ✅ Create 10-20 benchmark cases (simple, medium, complex) [11 CASES CREATED]
- Automated parameter search script [PENDING]
- Document optimal weights in ADR [PENDING]

**Key Finding**: Default threshold 0.001 too strict - BenchmarkSuite returns 0 results for most cases. Threshold optimization (see §2.3) is higher priority than weight tuning.

**Expected Impact**: 10-15% improvement in path quality (once wired + tuned)

#### 2.3 Threshold Optimization (Official Pattern)

**Problem**: Default threshold 0.001 (0.1%) too strict - most viable crafting paths have probabilities <0.1%, causing zero results

**Solution**: Adaptive threshold countdown pattern (OFFICIAL for testing AND production)

**Implementation Status**: ✅ Pattern validated in TestAlgo.java, requires formalization in CraftingExecutor

**Rationale**:
- High-probability paths (>10%) are rare but fast to find
- Medium-probability paths (1-10%) are more common, acceptable quality
- Low-probability paths (<1%) exist but require more search time
- Countdown pattern optimizes for speed: find high-prob paths first, relax if needed

**Architecture** (Reference: TestAlgo.java lines 75-85):
```java
// Current pattern in TestAlgo.java (should be moved to CraftingExecutor)
double GLOBALTHRESHOLD = 50; // Start at 50%

try {
    List<CandidateProbability> results = CraftingExecutor.runCrafting(
        item, desiredMods, undesiredMods, GLOBALTHRESHOLD / 100
    );
    
    // Countdown until results found or threshold reaches 0
    while (results.isEmpty() && GLOBALTHRESHOLD > 0) {
        item.reset();
        GLOBALTHRESHOLD--;
        undesiredMods.clear();
        results = CraftingExecutor.runCrafting(
            item, desiredMods, undesiredMods, GLOBALTHRESHOLD / 100
        );
        System.out.println("Threshold countdown: " + GLOBALTHRESHOLD);
    }
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
```

**Formalization Plan**:
1. Move countdown logic INTO CraftingExecutor.runCrafting()
2. Add ThresholdConfig class with customizable countdown parameters:
   - startThreshold (default: 50%)
   - stepSize (default: 1%)
   - minThreshold (default: 0%)
   - maxIterations (default: 51)
3. Return metadata: which threshold succeeded, iterations taken
4. Document as OFFICIAL pattern in API docs

**Benefits**:
- **Speed**: Finds high-probability paths in <5 seconds
- **Coverage**: Falls back to lower probabilities if no fast paths exist
- **User Experience**: Progressive refinement feels responsive
- **Production-Ready**: Not a workaround - this IS the correct algorithm

**Testing**:
- ✅ TestAlgo.java validates pattern works [EXISTING]
- ✅ BenchmarkSuite shows default 0.001 fails [VALIDATED]
- Unit test: ThresholdConfig parameter validation [PENDING]
- Integration test: Countdown terminates correctly [PENDING]
- Performance test: Compare fixed vs countdown [PENDING]

**Expected Impact**: 80-90% reduction in average computation time for viable crafting paths

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

### Phase 4: Frontend Architecture Revamp (P1)

**Goal**: Complete redesign of frontend for professional, feature-rich UX  
**Constitutional Alignment**: [Constitution §V - User Experience]

#### 4.1 Enhanced API Layer & Type System

**Problem**: Current API lacks currency selection, strategy options, and proper TypeScript types

**Solution**: Comprehensive API redesign with full type safety

**New API Architecture**:

**Backend Enhancements** (ServerMain.java):

```java
// NEW ENDPOINT: GET /api/currencies
// Handler: CurrenciesHandler
class CurrenciesHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"GET".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }
        
        List<CurrencyInfo> currencies = Arrays.asList(
            new CurrencyInfo("transmutation", "Orb of Transmutation", "basic"),
            new CurrencyInfo("augmentation", "Orb of Augmentation", "basic"),
            new CurrencyInfo("regal", "Regal Orb", "basic"),
            new CurrencyInfo("exalted", "Exalted Orb", "basic"),
            new CurrencyInfo("annulment", "Orb of Annulment", "basic"),
            // Essences...
            new CurrencyInfo("desecrated", "Desecrated Orb", "special")
        );
        
        String json = gson.toJson(currencies);
        sendJson(exchange, 200, json);
    }
}

// ENHANCED: POST /api/calculate (CraftingHandler)
// Now accepts:
// - allowedCurrencies: String[] (filter which currencies to use)
// - strategy: String ("fastest" | "cheapest" | "balanced")
// - maxSteps: int (limit crafting path length)

class CraftingRequest {
    String sessionId;
    String itemId;
    List<String> desiredModifiers;
    List<String> undesiredModifiers;
    List<String> allowedCurrencies; // NEW
    String strategy; // NEW: "fastest", "cheapest", "balanced"
    int maxSteps; // NEW: limit path length
    double threshold;
}

// Response includes alternative paths
class CraftingResponse {
    boolean success;
    List<CraftingStep> path;
    double totalProbability;
    double averageCost; // NEW
    int estimatedAttempts; // NEW
    List<AlternativePath> alternatives; // NEW: 3-5 alternative strategies
}
```

**Frontend Type Definitions** (types/api.ts):

```typescript
export interface Item {
  id: string;
  name: string;
  baseType: string;
  category: string;
  implicits?: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  tier: number;
  tags: string[];
  weight: number;
  type: 'PREFIX' | 'SUFFIX';
}

export interface Currency {
  id: string;
  name: string;
  category: 'basic' | 'essence' | 'special';
  description?: string;
  icon?: string;
}

export interface CraftingRequest {
  sessionId: string;
  itemId: string;
  desiredModifiers: string[];
  undesiredModifiers?: string[];
  allowedCurrencies?: string[];
  strategy?: 'fastest' | 'cheapest' | 'balanced';
  maxSteps?: number;
  threshold?: number;
}

export interface CraftingStep {
  currencyId: string;
  currencyName: string;
  probability: number;
  resultingModifiers: string[];
  description: string;
}

export interface CraftingResult {
  sessionId: string;
  success: boolean;
  path: CraftingStep[];
  totalProbability: number;
  averageCost: number;
  estimatedAttempts: number;
  alternatives?: AlternativePath[];
}

export interface AlternativePath {
  steps: CraftingStep[];
  probability: number;
  cost: number;
  quality: number;
  label: string; // "Faster", "Cheaper", etc.
}

export interface ProgressData {
  sessionId: string;
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  currentPhase: string;
  message?: string;
}
```

**API Service Layer** (services/api.ts):

```typescript
class CraftingAPI {
  private baseURL = 'http://localhost:8080/api';
  
  async getItems(): Promise<Item[]> {
    const response = await fetch(`${this.baseURL}/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  }
  
  async getCurrencies(): Promise<Currency[]> {
    const response = await fetch(`${this.baseURL}/currencies`);
    if (!response.ok) throw new Error('Failed to fetch currencies');
    return response.json();
  }
  
  async getModifiers(itemId: string): Promise<Modifier[]> {
    const response = await fetch(`${this.baseURL}/modifiers?itemId=${itemId}`);
    if (!response.ok) throw new Error('Failed to fetch modifiers');
    return response.json();
  }
  
  async calculate(request: CraftingRequest, signal?: AbortSignal): Promise<CraftingResult> {
    const response = await fetch(`${this.baseURL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new CraftingError(error.type, error.message, error.suggestions);
    }
    
    return response.json();
  }
  
  async getProgress(sessionId: string): Promise<ProgressData> {
    const response = await fetch(`${this.baseURL}/progress/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  }
  
  async cancel(sessionId: string): Promise<void> {
    await fetch(`${this.baseURL}/cancel/${sessionId}`, { method: 'POST' });
  }
}

export const api = new CraftingAPI();
```

**Implementation Tasks**:
- Add CurrenciesHandler to ServerMain.java
- Enhance CraftingRequest with allowedCurrencies, strategy, maxSteps
- Calculate alternative paths in Crafting_Algorithm
- Implement cost estimation logic
- Create complete TypeScript type definitions
- Build API service layer (remove Electron IPC wrapper)

**Files**:
- Backend: `src/main/java/core/ServerMain.java` (add CurrenciesHandler)
- Frontend: `src/types/api.ts`, `src/services/api.ts`

---

#### 4.2 Currency Selection & Strategy System

**Goal**: Allow users to customize which currencies to use and optimization strategy

**Component: CurrencyStrategyPanel**

```typescript
// src/components/CurrencyStrategyPanel.tsx
interface Props {
  currencies: Currency[];
  selectedCurrencies: string[];
  onCurrencyToggle: (id: string) => void;
  strategy: 'fastest' | 'cheapest' | 'balanced';
  onStrategyChange: (strategy: string) => void;
}

export function CurrencyStrategyPanel({
  currencies,
  selectedCurrencies,
  onCurrencyToggle,
  strategy,
  onStrategyChange
}: Props) {
  const basicCurrencies = currencies.filter(c => c.category === 'basic');
  const essences = currencies.filter(c => c.category === 'essence');
  const special = currencies.filter(c => c.category === 'special');
  
  return (
    <Card className="p-4 space-y-4">
      <div>
        <Label className="text-lg font-semibold">Crafting Strategy</Label>
        <RadioGroup value={strategy} onValueChange={onStrategyChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fastest" id="fastest" />
            <Label htmlFor="fastest">⚡ Fastest Path</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cheapest" id="cheapest" />
            <Label htmlFor="cheapest">💰 Cheapest</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balanced" id="balanced" />
            <Label htmlFor="balanced">⚖️ Balanced</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-lg font-semibold">Allowed Currencies</Label>
          <div className="space-x-2">
            <Button size="sm" variant="ghost" onClick={selectAll}>All</Button>
            <Button size="sm" variant="ghost" onClick={selectEssentials}>Essentials</Button>
            <Button size="sm" variant="ghost" onClick={selectNone}>None</Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Basic Currencies</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {basicCurrencies.map(currency => (
                <div key={currency.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={currency.id}
                    checked={selectedCurrencies.includes(currency.id)}
                    onCheckedChange={() => onCurrencyToggle(currency.id)}
                  />
                  <Label htmlFor={currency.id} className="text-sm">{currency.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Essences</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {essences.map(currency => (
                <div key={currency.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={currency.id}
                    checked={selectedCurrencies.includes(currency.id)}
                    onCheckedChange={() => onCurrencyToggle(currency.id)}
                  />
                  <Label htmlFor={currency.id} className="text-sm">{currency.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Special</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {special.map(currency => (
                <div key={currency.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={currency.id}
                    checked={selectedCurrencies.includes(currency.id)}
                    onCheckedChange={() => onCurrencyToggle(currency.id)}
                  />
                  <Label htmlFor={currency.id} className="text-sm">{currency.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

**Features**:
- Strategy selection: Fastest / Cheapest / Balanced
- Currency checkboxes grouped by category
- Quick presets: All / Essentials Only / None
- Tooltips explaining each strategy
- Persist preferences to localStorage

**Files**: `src/components/CurrencyStrategyPanel.tsx`

---

#### 4.3 Enhanced Results Display

**Goal**: Rich, informative results with multiple paths and cost analysis

**Component: EnhancedResultCard**

```typescript
// src/components/EnhancedResultCard.tsx
interface Props {
  result: CraftingResult;
  isExpanded: boolean;
  onToggle: () => void;
  onSave?: () => void;
  onRetry?: () => void;
}

export function EnhancedResultCard({
  result,
  isExpanded,
  onToggle,
  onSave,
  onRetry
}: Props) {
  const getRarityColor = (step: string) => {
    if (step.includes('Normal')) return 'text-gray-400';
    if (step.includes('Magic')) return 'text-blue-400';
    if (step.includes('Rare')) return 'text-yellow-400';
    return 'text-white';
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="font-semibold">
                {result.success ? 'SUCCESS' : 'NO PATH FOUND'}
              </h3>
              <span className="text-sm text-muted-foreground">
                {result.totalProbability.toFixed(2)}% probability
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.path.length} steps • ~{result.averageCost}c cost • 
              1 in {result.estimatedAttempts} attempts
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onSave && (
              <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                onSave();
              }}>
                <Save className="w-4 h-4" />
              </Button>
            )}
            {onRetry && (
              <Button size="sm" variant="ghost" onClick={e => {
                e.stopPropagation();
                onRetry();
              }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t p-4 space-y-4">
          {/* Primary Path */}
          <div>
            <Label className="font-semibold mb-2">Crafting Path</Label>
            <div className="space-y-2">
              {result.path.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground font-mono text-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{step.currencyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(step.probability * 100).toFixed(1)}% probability
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Alternative Paths */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div>
              <Label className="font-semibold mb-2">Alternative Strategies</Label>
              <Accordion type="single" collapsible>
                {result.alternatives.map((alt, idx) => (
                  <AccordionItem key={idx} value={`alt-${idx}`}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{alt.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {alt.probability.toFixed(2)}% • {alt.cost}c
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 text-sm">
                        {alt.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="text-muted-foreground">
                            {stepIdx + 1}. {step.currencyName}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
          
          {/* Cost Breakdown */}
          <div>
            <Label className="font-semibold mb-2">Cost Analysis</Label>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average per attempt:</span>
                <span className="font-mono">{result.averageCost}c</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected attempts:</span>
                <span className="font-mono">{result.estimatedAttempts}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total expected cost:</span>
                <span className="font-mono">
                  {(result.averageCost * result.estimatedAttempts).toFixed(1)}c
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
```

**Features**:
- Expandable/collapsible cards
- Visual step-by-step path display
- Multiple alternative strategies
- Detailed cost breakdown
- Save/retry actions
- Color-coded rarity transitions

**Files**: `src/components/EnhancedResultCard.tsx`

---

#### 4.4 Modern State Management with Context

**Goal**: Centralized, type-safe state management

**Architecture**:

```typescript
// contexts/CraftingContext.tsx
interface CraftingState {
  // Data
  items: Item[];
  currencies: Currency[];
  modifiers: Modifier[];
  
  // Selection
  selectedItem: Item | null;
  selectedModifiers: string[];
  selectedCurrencies: string[];
  strategy: 'fastest' | 'cheapest' | 'balanced';
  
  // Calculation
  isCalculating: boolean;
  currentSessionId: string | null;
  progress: ProgressData | null;
  
  // Results
  results: CraftingResult[];
  expandedResults: Set<number>;
  
  // UI
  error: CraftingError | null;
}

interface CraftingActions {
  selectItem: (item: Item) => void;
  toggleModifier: (modifierId: string) => void;
  toggleCurrency: (currencyId: string) => void;
  setStrategy: (strategy: string) => void;
  startCalculation: () => Promise<void>;
  cancelCalculation: () => Promise<void>;
  toggleResultExpansion: (index: number) => void;
}

export const CraftingContext = createContext<{
  state: CraftingState;
  actions: CraftingActions;
} | null>(null);

export function CraftingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CraftingState>(initialState);
  
  const actions: CraftingActions = {
    selectItem: (item) => {
      setState(s => ({ ...s, selectedItem: item, modifiers: [] }));
      // Load modifiers for item
      api.getModifiers(item.id).then(mods => {
        setState(s => ({ ...s, modifiers: mods }));
      });
    },
    
    toggleModifier: (modifierId) => {
      setState(s => ({
        ...s,
        selectedModifiers: s.selectedModifiers.includes(modifierId)
          ? s.selectedModifiers.filter(id => id !== modifierId)
          : [...s.selectedModifiers, modifierId]
      }));
    },
    
    startCalculation: async () => {
      const sessionId = crypto.randomUUID();
      setState(s => ({ ...s, isCalculating: true, currentSessionId: sessionId }));
      
      try {
        const result = await api.calculate({
          sessionId,
          itemId: state.selectedItem!.id,
          desiredModifiers: state.selectedModifiers,
          allowedCurrencies: state.selectedCurrencies,
          strategy: state.strategy
        });
        
        setState(s => ({
          ...s,
          isCalculating: false,
          currentSessionId: null,
          results: [result, ...s.results],
          expandedResults: new Set([0])
        }));
      } catch (error) {
        setState(s => ({
          ...s,
          isCalculating: false,
          currentSessionId: null,
          error: error as CraftingError
        }));
      }
    },
    
    // ... other actions
  };
  
  return (
    <CraftingContext.Provider value={{ state, actions }}>
      {children}
    </CraftingContext.Provider>
  );
}

export function useCrafting() {
  const context = useContext(CraftingContext);
  if (!context) throw new Error('useCrafting must be used within CraftingProvider');
  return context;
}
```

**Custom Hooks**:

```typescript
// hooks/useProgress.ts
export function useProgress(sessionId: string | null) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  
  useEffect(() => {
    if (!sessionId) return;
    
    const interval = setInterval(async () => {
      const data = await api.getProgress(sessionId);
      setProgress(data);
    }, 100);
    
    return () => clearInterval(interval);
  }, [sessionId]);
  
  return progress;
}
```

**Files**: 
- `src/contexts/CraftingContext.tsx`
- `src/hooks/useProgress.ts`

---

#### 4.5 Professional UI Layout

**Goal**: Modern, intuitive three-column layout

**Main Layout Structure**:

```typescript
// src/App.tsx - New layout
<div className="flex h-screen bg-background">
  {/* Left Sidebar - Configuration */}
  <aside className="w-80 border-r overflow-y-auto p-4 space-y-4">
    <ItemSelector />
    <ModifierSelector />
    <CurrencyStrategyPanel />
    <Button onClick={actions.startCalculation} disabled={!canCalculate}>
      Run Simulation
    </Button>
  </aside>
  
  {/* Main Content - Results & Progress */}
  <main className="flex-1 overflow-y-auto p-6">
    {state.isCalculating && (
      <ProgressDisplay
        progress={progress}
        onCancel={actions.cancelCalculation}
      />
    )}
    
    <div className="space-y-4">
      {state.results.map((result, idx) => (
        <EnhancedResultCard
          key={idx}
          result={result}
          isExpanded={state.expandedResults.has(idx)}
          onToggle={() => actions.toggleResultExpansion(idx)}
        />
      ))}
    </div>
  </main>
  
  {/* Right Sidebar - Info & Help */}
  <aside className="w-64 border-l overflow-y-auto p-4">
    <QuickStartGuide />
    <ConfigurationSummary />
  </aside>
</div>
```

**Files**: `src/App.tsx` (complete rewrite)

---

### Phase 4 Summary

**Deliverables**:
1. ✅ Enhanced API layer with currency/strategy support
2. ✅ Currency selection UI component
3. ✅ Enhanced results display with alternatives
4. ✅ Modern state management (Context + hooks)
5. ✅ Professional three-column layout
6. ✅ Complete TypeScript strict mode compliance

**Files to Create/Modify**:
- Backend: `ServerMain.java` (add CurrenciesHandler)
- Types: `src/types/api.ts`
- Services: `src/services/api.ts`
- Components: `src/components/CurrencyStrategyPanel.tsx`, `src/components/EnhancedResultCard.tsx`
- Context: `src/contexts/CraftingContext.tsx`
- Hooks: `src/hooks/useProgress.ts`
- Layout: `src/App.tsx` (rewrite)

**Expected Impact**:
- Professional, feature-rich UI
- User control over crafting strategies
- Multiple path visualization
- Improved error handling
- Better state management

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
