package core.Test;

import core.Crafting.Crafting_Candidate;
import core.Crafting.Utils.CandidatePool;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

/**
 * Unit tests for CandidatePool class.
 * 
 * Test coverage:
 * - Pool acquire/release mechanics
 * - Thread safety under concurrent access
 * - Maximum pool size enforcement
 * - Edge cases (null handling, invalid sizes)
 */
public class TestCandidatePool {
    
    private static int passedTests = 0;
    private static int failedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=== CandidatePool Unit Tests ===\n");
        
        // Basic functionality tests
        testAcquireFromEmptyPool();
        testReleaseAndReuse();
        testMaxPoolSizeEnforcement();
        testNullCandidateRejection();
        testInvalidPoolSizeRejection();
        
        // Thread safety tests
        testConcurrentAcquire();
        testConcurrentRelease();
        testConcurrentAcquireRelease();
        
        // Edge case tests
        testReleaseMultipleTimes();
        testPoolStatsAccuracy();
        
        // Summary
        System.out.println("\n=== Test Summary ===");
        System.out.println("Passed: " + passedTests);
        System.out.println("Failed: " + failedTests);
        System.out.println("Total:  " + (passedTests + failedTests));
        System.out.println((failedTests == 0) ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
    }
    
    /**
     * Test: Acquiring from empty pool creates new instance
     */
    private static void testAcquireFromEmptyPool() {
        try {
            CandidatePool pool = new CandidatePool(10);
            Crafting_Candidate candidate = pool.acquire();
            
            assert candidate != null : "Acquired candidate should not be null";
            assert pool.size() == 0 : "Pool should remain empty after acquire";
            
            pass("testAcquireFromEmptyPool");
        } catch (AssertionError | Exception e) {
            fail("testAcquireFromEmptyPool", e);
        }
    }
    
    /**
     * Test: Released candidate is reused on next acquire
     */
    private static void testReleaseAndReuse() {
        try {
            CandidatePool pool = new CandidatePool(10);
            Crafting_Candidate candidate1 = pool.acquire();
            pool.release(candidate1);
            
            assert pool.size() == 1 : "Pool should have 1 candidate after release";
            
            Crafting_Candidate candidate2 = pool.acquire();
            assert candidate2 == candidate1 : "Should reuse same candidate instance";
            assert pool.size() == 0 : "Pool should be empty after reacquire";
            
            pass("testReleaseAndReuse");
        } catch (AssertionError | Exception e) {
            fail("testReleaseAndReuse", e);
        }
    }
    
    /**
     * Test: Pool does not exceed maximum size
     */
    private static void testMaxPoolSizeEnforcement() {
        try {
            int maxSize = 5;
            CandidatePool pool = new CandidatePool(maxSize);
            
            // Release more candidates than max size
            for (int i = 0; i < maxSize + 3; i++) {
                pool.release(new Crafting_Candidate());
            }
            
            int finalSize = pool.size();
            assert finalSize <= maxSize : "Pool size " + finalSize + " exceeds max " + maxSize;
            
            pass("testMaxPoolSizeEnforcement");
        } catch (AssertionError | Exception e) {
            fail("testMaxPoolSizeEnforcement", e);
        }
    }
    
    /**
     * Test: Null candidates are rejected
     */
    private static void testNullCandidateRejection() {
        try {
            CandidatePool pool = new CandidatePool(10);
            boolean exceptionThrown = false;
            
            try {
                pool.release(null);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            
            assert exceptionThrown : "Should throw IllegalArgumentException for null candidate";
            pass("testNullCandidateRejection");
        } catch (AssertionError | Exception e) {
            fail("testNullCandidateRejection", e);
        }
    }
    
    /**
     * Test: Invalid pool sizes are rejected
     */
    private static void testInvalidPoolSizeRejection() {
        try {
            boolean exceptionThrown = false;
            
            try {
                new CandidatePool(0);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            
            assert exceptionThrown : "Should throw IllegalArgumentException for size 0";
            
            exceptionThrown = false;
            try {
                new CandidatePool(-10);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            
            assert exceptionThrown : "Should throw IllegalArgumentException for negative size";
            pass("testInvalidPoolSizeRejection");
        } catch (AssertionError | Exception e) {
            fail("testInvalidPoolSizeRejection", e);
        }
    }
    
    /**
     * Test: Concurrent acquire operations are thread-safe
     */
    private static void testConcurrentAcquire() {
        try {
            CandidatePool pool = new CandidatePool(1000);
            int threadCount = 10;
            int acquiresPerThread = 100;
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            List<Future<List<Crafting_Candidate>>> futures = new ArrayList<>();
            
            // Each thread acquires multiple candidates
            for (int i = 0; i < threadCount; i++) {
                futures.add(executor.submit(() -> {
                    List<Crafting_Candidate> acquired = new ArrayList<>();
                    for (int j = 0; j < acquiresPerThread; j++) {
                        acquired.add(pool.acquire());
                    }
                    return acquired;
                }));
            }
            
            // Collect all acquired candidates
            List<Crafting_Candidate> allCandidates = new ArrayList<>();
            for (Future<List<Crafting_Candidate>> future : futures) {
                allCandidates.addAll(future.get());
            }
            
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
            
            // All acquires should succeed
            assert allCandidates.size() == threadCount * acquiresPerThread : 
                "Should acquire " + (threadCount * acquiresPerThread) + " candidates";
            
            // No candidate should be null
            for (Crafting_Candidate c : allCandidates) {
                assert c != null : "All acquired candidates should be non-null";
            }
            
            pass("testConcurrentAcquire");
        } catch (AssertionError | Exception e) {
            fail("testConcurrentAcquire", e);
        }
    }
    
    /**
     * Test: Concurrent release operations are thread-safe
     */
    private static void testConcurrentRelease() {
        try {
            CandidatePool pool = new CandidatePool(1000);
            int threadCount = 10;
            int releasesPerThread = 100;
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            List<Future<Void>> futures = new ArrayList<>();
            
            // Each thread releases multiple candidates
            for (int i = 0; i < threadCount; i++) {
                futures.add(executor.submit(() -> {
                    for (int j = 0; j < releasesPerThread; j++) {
                        pool.release(new Crafting_Candidate());
                    }
                    return null;
                }));
            }
            
            // Wait for all releases to complete
            for (Future<Void> future : futures) {
                future.get();
            }
            
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
            
            // Pool size should not exceed max
            assert pool.size() <= 1000 : "Pool size should not exceed maximum";
            
            pass("testConcurrentRelease");
        } catch (AssertionError | Exception e) {
            fail("testConcurrentRelease", e);
        }
    }
    
    /**
     * Test: Mixed concurrent acquire and release operations
     */
    private static void testConcurrentAcquireRelease() {
        try {
            CandidatePool pool = new CandidatePool(500);
            int threadCount = 20;
            int operationsPerThread = 50;
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            List<Future<Void>> futures = new ArrayList<>();
            
            // Half threads acquire, half threads release
            for (int i = 0; i < threadCount; i++) {
                final boolean shouldAcquire = (i % 2 == 0);
                futures.add(executor.submit(() -> {
                    for (int j = 0; j < operationsPerThread; j++) {
                        if (shouldAcquire) {
                            Crafting_Candidate c = pool.acquire();
                            assert c != null : "Acquired candidate should not be null";
                        } else {
                            pool.release(new Crafting_Candidate());
                        }
                    }
                    return null;
                }));
            }
            
            // Wait for all operations to complete
            for (Future<Void> future : futures) {
                future.get();
            }
            
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
            
            // Pool should be in valid state
            assert pool.size() >= 0 : "Pool size should be non-negative";
            assert pool.size() <= 500 : "Pool size should not exceed maximum";
            
            pass("testConcurrentAcquireRelease");
        } catch (AssertionError | Exception e) {
            fail("testConcurrentAcquireRelease", e);
        }
    }
    
    /**
     * Test: Releasing same candidate multiple times doesn't break pool
     */
    private static void testReleaseMultipleTimes() {
        try {
            CandidatePool pool = new CandidatePool(10);
            Crafting_Candidate candidate = new Crafting_Candidate();
            
            // Release same candidate multiple times
            pool.release(candidate);
            pool.release(candidate);
            pool.release(candidate);
            
            // Pool should still work correctly
            Crafting_Candidate acquired1 = pool.acquire();
            Crafting_Candidate acquired2 = pool.acquire();
            Crafting_Candidate acquired3 = pool.acquire();
            
            assert acquired1 != null && acquired2 != null && acquired3 != null : 
                "All acquires should succeed";
            
            pass("testReleaseMultipleTimes");
        } catch (AssertionError | Exception e) {
            fail("testReleaseMultipleTimes", e);
        }
    }
    
    /**
     * Test: Pool statistics are accurate
     */
    private static void testPoolStatsAccuracy() {
        try {
            CandidatePool pool = new CandidatePool(20);
            
            assert pool.size() == 0 : "New pool should be empty";
            
            // Release 5 candidates
            for (int i = 0; i < 5; i++) {
                pool.release(new Crafting_Candidate());
            }
            assert pool.size() == 5 : "Pool should have 5 candidates";
            
            // Acquire 3 candidates
            for (int i = 0; i < 3; i++) {
                pool.acquire();
            }
            assert pool.size() == 2 : "Pool should have 2 candidates remaining";
            
            // Release 2 more
            for (int i = 0; i < 2; i++) {
                pool.release(new Crafting_Candidate());
            }
            assert pool.size() == 4 : "Pool should have 4 candidates";
            
            pass("testPoolStatsAccuracy");
        } catch (AssertionError | Exception e) {
            fail("testPoolStatsAccuracy", e);
        }
    }
    
    private static void pass(String testName) {
        System.out.println("✓ " + testName);
        passedTests++;
    }
    
    private static void fail(String testName, Throwable e) {
        System.out.println("✗ " + testName + ": " + e.getMessage());
        failedTests++;
    }
}
