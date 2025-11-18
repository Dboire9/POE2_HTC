package core.Test;

import core.Crafting.ProgressTracker;
import core.Crafting.ProgressTracker.SessionProgress;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Comprehensive test suite for ProgressTracker thread safety and functionality.
 * 
 * Tests cover:
 * - Basic progress tracking (start, increment, percent calculation)
 * - Time estimation (elapsed, remaining)
 * - Cancellation propagation
 * - Thread safety with concurrent access
 * - Edge cases (zero iterations, invalid inputs)
 * - Session lifecycle (create, update, cleanup)
 * 
 * Run with: java core.Test.TestProgressTracker
 */
public class TestProgressTracker {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    private static int failedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("PROGRESSTRACKER TEST SUITE");
        System.out.println("=".repeat(80));
        System.out.println();
        
        // Clean state before testing
        ProgressTracker.clearAllSessions();
        
        // Basic functionality tests
        testBasicProgressTracking();
        testPercentCalculation();
        testElapsedTime();
        testEstimatedRemainingTime();
        testCancellation();
        
        // Edge cases
        testInvalidSessionId();
        testInvalidTotalIterations();
        testSessionNotFound();
        testNoProgressEstimation();
        
        // Session management
        testMultipleSessions();
        testSessionLifecycle();
        testSessionReplacement();
        
        // Thread safety tests
        testConcurrentIncrement();
        testConcurrentCancellation();
        testConcurrentSessionCreation();
        
        // JSON serialization
        testJsonSerialization();
        
        // Report results
        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("TEST RESULTS");
        System.out.println("=".repeat(80));
        System.out.println("Total tests:  " + totalTests);
        System.out.println("Passed:       " + passedTests + " ✓");
        System.out.println("Failed:       " + failedTests + " ✗");
        System.out.println("Success rate: " + String.format("%.1f%%", (passedTests * 100.0 / totalTests)));
        System.out.println("=".repeat(80));
        
        if (failedTests > 0) {
            System.exit(1);
        }
    }
    
    // =====================================================================
    // BASIC FUNCTIONALITY TESTS
    // =====================================================================
    
    private static void testBasicProgressTracking() {
        String testName = "Basic progress tracking (start, increment, end)";
        try {
            ProgressTracker.startSession("test-basic", 10);
            
            SessionProgress progress = ProgressTracker.getProgress("test-basic");
            assertNotNull(progress, "Session should exist");
            assertEquals(0, progress.getCompletedIterations(), "Initial completed should be 0");
            assertEquals(10, progress.getTotalIterations(), "Total should be 10");
            
            ProgressTracker.incrementProgress("test-basic");
            assertEquals(1, progress.getCompletedIterations(), "Completed should be 1 after increment");
            
            ProgressTracker.endSession("test-basic");
            assertNull(ProgressTracker.getProgress("test-basic"), "Session should be removed");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testPercentCalculation() {
        String testName = "Percent calculation accuracy";
        try {
            ProgressTracker.startSession("test-percent", 100);
            SessionProgress progress = ProgressTracker.getProgress("test-percent");
            
            assertEquals(0.0, progress.getPercent(), 0.01, "Initial percent should be 0%");
            
            for (int i = 0; i < 50; i++) {
                progress.incrementProgress();
            }
            assertEquals(50.0, progress.getPercent(), 0.01, "50% completion");
            
            for (int i = 0; i < 25; i++) {
                progress.incrementProgress();
            }
            assertEquals(75.0, progress.getPercent(), 0.01, "75% completion");
            
            for (int i = 0; i < 25; i++) {
                progress.incrementProgress();
            }
            assertEquals(100.0, progress.getPercent(), 0.01, "100% completion");
            
            ProgressTracker.endSession("test-percent");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testElapsedTime() {
        String testName = "Elapsed time tracking";
        try {
            ProgressTracker.startSession("test-elapsed", 10);
            SessionProgress progress = ProgressTracker.getProgress("test-elapsed");
            
            long elapsed1 = progress.getElapsedMs();
            assertTrue(elapsed1 >= 0, "Elapsed time should be non-negative");
            
            Thread.sleep(100); // Wait 100ms
            
            long elapsed2 = progress.getElapsedMs();
            assertTrue(elapsed2 >= elapsed1 + 90, "Elapsed time should increase (expected ~100ms, got " + (elapsed2 - elapsed1) + "ms)");
            
            ProgressTracker.endSession("test-elapsed");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testEstimatedRemainingTime() {
        String testName = "Estimated remaining time calculation";
        try {
            ProgressTracker.startSession("test-remaining", 10);
            SessionProgress progress = ProgressTracker.getProgress("test-remaining");
            
            // No progress yet, cannot estimate
            assertEquals(-1, progress.getEstimatedRemainingMs(), "Should return -1 when no progress");
            
            progress.incrementProgress();
            Thread.sleep(10); // Simulate work
            
            long remaining = progress.getEstimatedRemainingMs();
            assertTrue(remaining > 0, "Should estimate remaining time after first iteration");
            assertTrue(remaining < 1000, "Estimated remaining should be reasonable (got " + remaining + "ms)");
            
            ProgressTracker.endSession("test-remaining");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testCancellation() {
        String testName = "Cancellation propagation";
        try {
            ProgressTracker.startSession("test-cancel", 10);
            SessionProgress progress = ProgressTracker.getProgress("test-cancel");
            
            assertFalse(progress.isCancelled(), "Should not be cancelled initially");
            
            ProgressTracker.cancelSession("test-cancel");
            assertTrue(progress.isCancelled(), "Should be cancelled after cancelSession()");
            
            // Direct call on progress object
            ProgressTracker.startSession("test-cancel-2", 10);
            SessionProgress progress2 = ProgressTracker.getProgress("test-cancel-2");
            progress2.cancel();
            assertTrue(progress2.isCancelled(), "Should be cancelled via progress.cancel()");
            
            ProgressTracker.endSession("test-cancel");
            ProgressTracker.endSession("test-cancel-2");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    // =====================================================================
    // EDGE CASE TESTS
    // =====================================================================
    
    private static void testInvalidSessionId() {
        String testName = "Invalid sessionId handling";
        try {
            boolean caught = false;
            try {
                ProgressTracker.startSession(null, 10);
            } catch (IllegalArgumentException e) {
                caught = true;
            }
            assertTrue(caught, "Should throw IllegalArgumentException for null sessionId");
            
            caught = false;
            try {
                ProgressTracker.startSession("", 10);
            } catch (IllegalArgumentException e) {
                caught = true;
            }
            assertTrue(caught, "Should throw IllegalArgumentException for empty sessionId");
            
            caught = false;
            try {
                ProgressTracker.startSession("   ", 10);
            } catch (IllegalArgumentException e) {
                caught = true;
            }
            assertTrue(caught, "Should throw IllegalArgumentException for whitespace sessionId");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testInvalidTotalIterations() {
        String testName = "Invalid totalIterations handling";
        try {
            boolean caught = false;
            try {
                ProgressTracker.startSession("test-invalid", 0);
            } catch (IllegalArgumentException e) {
                caught = true;
            }
            assertTrue(caught, "Should throw IllegalArgumentException for totalIterations = 0");
            
            caught = false;
            try {
                ProgressTracker.startSession("test-invalid", -5);
            } catch (IllegalArgumentException e) {
                caught = true;
            }
            assertTrue(caught, "Should throw IllegalArgumentException for negative totalIterations");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testSessionNotFound() {
        String testName = "Session not found error handling";
        try {
            assertNull(ProgressTracker.getProgress("nonexistent"), "Should return null for nonexistent session");
            
            boolean caught = false;
            try {
                ProgressTracker.incrementProgress("nonexistent");
            } catch (IllegalStateException e) {
                caught = true;
            }
            assertTrue(caught, "incrementProgress should throw IllegalStateException for nonexistent session");
            
            caught = false;
            try {
                ProgressTracker.cancelSession("nonexistent");
            } catch (IllegalStateException e) {
                caught = true;
            }
            assertTrue(caught, "cancelSession should throw IllegalStateException for nonexistent session");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testNoProgressEstimation() {
        String testName = "Estimation with zero progress";
        try {
            ProgressTracker.startSession("test-no-progress", 100);
            SessionProgress progress = ProgressTracker.getProgress("test-no-progress");
            
            assertEquals(-1, progress.getEstimatedRemainingMs(), "Should return -1 when no iterations completed");
            assertEquals(0.0, progress.getPercent(), 0.01, "Percent should be 0 with no progress");
            
            ProgressTracker.endSession("test-no-progress");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    // =====================================================================
    // SESSION MANAGEMENT TESTS
    // =====================================================================
    
    private static void testMultipleSessions() {
        String testName = "Multiple concurrent sessions";
        try {
            ProgressTracker.startSession("session-1", 10);
            ProgressTracker.startSession("session-2", 20);
            ProgressTracker.startSession("session-3", 30);
            
            assertEquals(3, ProgressTracker.getActiveSessionCount(), "Should have 3 active sessions");
            
            ProgressTracker.incrementProgress("session-1");
            ProgressTracker.incrementProgress("session-2");
            ProgressTracker.incrementProgress("session-2");
            
            SessionProgress s1 = ProgressTracker.getProgress("session-1");
            SessionProgress s2 = ProgressTracker.getProgress("session-2");
            SessionProgress s3 = ProgressTracker.getProgress("session-3");
            
            assertEquals(1, s1.getCompletedIterations(), "Session 1 should have 1 iteration");
            assertEquals(2, s2.getCompletedIterations(), "Session 2 should have 2 iterations");
            assertEquals(0, s3.getCompletedIterations(), "Session 3 should have 0 iterations");
            
            ProgressTracker.endSession("session-1");
            ProgressTracker.endSession("session-2");
            ProgressTracker.endSession("session-3");
            
            assertEquals(0, ProgressTracker.getActiveSessionCount(), "Should have 0 active sessions after cleanup");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testSessionLifecycle() {
        String testName = "Session lifecycle management";
        try {
            assertFalse(ProgressTracker.hasSession("lifecycle-test"), "Session should not exist initially");
            
            ProgressTracker.startSession("lifecycle-test", 10);
            assertTrue(ProgressTracker.hasSession("lifecycle-test"), "Session should exist after start");
            
            ProgressTracker.endSession("lifecycle-test");
            assertFalse(ProgressTracker.hasSession("lifecycle-test"), "Session should not exist after end");
            
            // Safe to call endSession on nonexistent session (idempotent)
            ProgressTracker.endSession("lifecycle-test");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testSessionReplacement() {
        String testName = "Session replacement on duplicate start";
        try {
            ProgressTracker.startSession("replace-test", 10);
            SessionProgress progress1 = ProgressTracker.getProgress("replace-test");
            progress1.incrementProgress();
            progress1.incrementProgress();
            
            assertEquals(2, progress1.getCompletedIterations(), "First session should have 2 iterations");
            
            // Start again with same sessionId (should replace)
            ProgressTracker.startSession("replace-test", 20);
            SessionProgress progress2 = ProgressTracker.getProgress("replace-test");
            
            assertEquals(0, progress2.getCompletedIterations(), "New session should start at 0");
            assertEquals(20, progress2.getTotalIterations(), "New session should have 20 total iterations");
            
            ProgressTracker.endSession("replace-test");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    // =====================================================================
    // THREAD SAFETY TESTS
    // =====================================================================
    
    private static void testConcurrentIncrement() {
        String testName = "Concurrent increment thread safety";
        try {
            int threadCount = 10;
            int incrementsPerThread = 100;
            int expectedTotal = threadCount * incrementsPerThread;
            
            ProgressTracker.startSession("test-concurrent", expectedTotal);
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch endLatch = new CountDownLatch(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        startLatch.await(); // Wait for all threads to be ready
                        for (int j = 0; j < incrementsPerThread; j++) {
                            ProgressTracker.incrementProgress("test-concurrent");
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        endLatch.countDown();
                    }
                });
            }
            
            startLatch.countDown(); // Start all threads simultaneously
            boolean completed = endLatch.await(5, TimeUnit.SECONDS);
            assertTrue(completed, "All threads should complete within 5 seconds");
            
            SessionProgress progress = ProgressTracker.getProgress("test-concurrent");
            assertEquals(expectedTotal, progress.getCompletedIterations(), 
                "All increments should be counted (thread safety verification)");
            
            executor.shutdown();
            ProgressTracker.endSession("test-concurrent");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testConcurrentCancellation() {
        String testName = "Concurrent cancellation thread safety";
        try {
            ProgressTracker.startSession("test-cancel-concurrent", 100);
            
            // Multiple threads try to cancel simultaneously
            ExecutorService executor = Executors.newFixedThreadPool(5);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch endLatch = new CountDownLatch(5);
            
            for (int i = 0; i < 5; i++) {
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        ProgressTracker.cancelSession("test-cancel-concurrent");
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        endLatch.countDown();
                    }
                });
            }
            
            startLatch.countDown();
            boolean completed = endLatch.await(2, TimeUnit.SECONDS);
            assertTrue(completed, "All cancellation threads should complete");
            
            SessionProgress progress = ProgressTracker.getProgress("test-cancel-concurrent");
            assertTrue(progress.isCancelled(), "Session should be cancelled");
            
            executor.shutdown();
            ProgressTracker.endSession("test-cancel-concurrent");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testConcurrentSessionCreation() {
        String testName = "Concurrent session creation thread safety";
        try {
            int threadCount = 20;
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch endLatch = new CountDownLatch(threadCount);
            AtomicInteger successCount = new AtomicInteger(0);
            
            for (int i = 0; i < threadCount; i++) {
                final int sessionIndex = i;
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        ProgressTracker.startSession("session-" + sessionIndex, 10);
                        successCount.incrementAndGet();
                    } catch (Exception e) {
                        // Should not throw exceptions
                    } finally {
                        endLatch.countDown();
                    }
                });
            }
            
            startLatch.countDown();
            boolean completed = endLatch.await(5, TimeUnit.SECONDS);
            assertTrue(completed, "All session creation threads should complete");
            assertEquals(threadCount, successCount.get(), "All sessions should be created successfully");
            assertEquals(threadCount, ProgressTracker.getActiveSessionCount(), 
                "Active session count should match created sessions");
            
            // Cleanup
            for (int i = 0; i < threadCount; i++) {
                ProgressTracker.endSession("session-" + i);
            }
            
            executor.shutdown();
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    // =====================================================================
    // JSON SERIALIZATION TEST
    // =====================================================================
    
    private static void testJsonSerialization() {
        String testName = "JSON serialization format";
        try {
            ProgressTracker.startSession("test-json", 100);
            SessionProgress progress = ProgressTracker.getProgress("test-json");
            
            for (int i = 0; i < 45; i++) {
                progress.incrementProgress();
            }
            Thread.sleep(10);
            
            String json = progress.toJson();
            assertNotNull(json, "JSON should not be null");
            assertTrue(json.contains("\"percent\""), "JSON should contain percent field");
            assertTrue(json.contains("\"elapsedMs\""), "JSON should contain elapsedMs field");
            assertTrue(json.contains("\"estimatedRemainingMs\""), "JSON should contain estimatedRemainingMs field");
            assertTrue(json.contains("\"cancelled\""), "JSON should contain cancelled field");
            assertTrue(json.contains("45.00"), "JSON should contain 45% progress");
            assertTrue(json.contains("false"), "JSON should contain cancelled=false");
            
            ProgressTracker.endSession("test-json");
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    // =====================================================================
    // ASSERTION HELPERS
    // =====================================================================
    
    private static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError("Assertion failed: " + message);
        }
    }
    
    private static void assertFalse(boolean condition, String message) {
        assertTrue(!condition, message);
    }
    
    private static void assertEquals(int expected, int actual, String message) {
        if (expected != actual) {
            throw new AssertionError(message + " (expected: " + expected + ", actual: " + actual + ")");
        }
    }
    
    private static void assertEquals(double expected, double actual, double delta, String message) {
        if (Math.abs(expected - actual) > delta) {
            throw new AssertionError(message + " (expected: " + expected + ", actual: " + actual + ", delta: " + delta + ")");
        }
    }
    
    private static void assertEquals(long expected, long actual, String message) {
        if (expected != actual) {
            throw new AssertionError(message + " (expected: " + expected + ", actual: " + actual + ")");
        }
    }
    
    private static void assertNotNull(Object obj, String message) {
        if (obj == null) {
            throw new AssertionError("Assertion failed (object is null): " + message);
        }
    }
    
    private static void assertNull(Object obj, String message) {
        if (obj != null) {
            throw new AssertionError("Assertion failed (object is not null): " + message);
        }
    }
    
    // =====================================================================
    // TEST RESULT TRACKING
    // =====================================================================
    
    private static void pass(String testName) {
        totalTests++;
        passedTests++;
        System.out.println("✓ PASS: " + testName);
    }
    
    private static void fail(String testName, Throwable e) {
        totalTests++;
        failedTests++;
        System.out.println("✗ FAIL: " + testName);
        System.out.println("  Error: " + e.getMessage());
        if (e instanceof AssertionError) {
            // Don't print stack trace for assertion failures (clean output)
        } else {
            System.out.println("  Stack trace:");
            e.printStackTrace(System.out);
        }
    }
}
