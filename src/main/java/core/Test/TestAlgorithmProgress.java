package core.Test;

import core.Crafting.Crafting_Algorithm;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.ProgressTracker;
import core.Crafting.BeamSearchConfig;
import core.Crafting.CancelledException;
import core.Crafting.ProgressTracker.SessionProgress;
import core.Items.Item_base;
import core.Modifier_class.Modifier;

import java.util.ArrayList;
import java.util.List;

/**
 * Test for ProgressTracker integration with Crafting_Algorithm.
 * 
 * Verifies:
 * - Progress tracking during crafting computation
 * - Cancellation propagation (throws CancelledException)
 * - Session cleanup (endSession in finally block)
 * - Backward compatibility (sessionId = null)
 * 
 * Run with: java core.Test.TestAlgorithmProgress
 */
public class TestAlgorithmProgress {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    private static int failedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("CRAFTING ALGORITHM PROGRESS TRACKING TEST");
        System.out.println("=".repeat(80));
        System.out.println();
        
        testProgressTrackingDuringCrafting();
        testCancellationPropagation();
        testSessionCleanup();
        testBackwardCompatibility();
        
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
    
    private static void testProgressTrackingDuringCrafting() {
        String testName = "Progress tracking during crafting computation";
        try {
            // Create a simple test item
            Item_base base = createTestItem();
            Crafting_Item item = new Crafting_Item(base);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> undesiredMods = new ArrayList<>();
            
            // Add a simple desired modifier (if available)
            if (!base.getNormalAllowedPrefixes().isEmpty()) {
                desiredMods.add(base.getNormalAllowedPrefixes().get(0));
            }
            
            String sessionId = "test-progress-" + System.currentTimeMillis();
            
            // Start crafting in a separate thread so we can monitor progress
            Thread craftingThread = new Thread(() -> {
                try {
                    Crafting_Algorithm.optimizeCrafting(item, desiredMods, undesiredMods, 0.001, 
                                                       new BeamSearchConfig(), sessionId);
                } catch (Exception e) {
                    // Expected to complete or be cancelled
                }
            });
            
            craftingThread.start();
            
            // Wait a bit and check progress
            Thread.sleep(100);
            
            SessionProgress progress = ProgressTracker.getProgress(sessionId);
            if (progress != null) {
                double percent = progress.getPercent();
                long elapsed = progress.getElapsedMs();
                
                assertTrue(percent >= 0 && percent <= 100, 
                          "Progress percent should be 0-100, got " + percent);
                assertTrue(elapsed >= 0, "Elapsed time should be non-negative");
                
                System.out.println("  Progress: " + String.format("%.1f%%", percent) + 
                                 ", Elapsed: " + elapsed + "ms");
            }
            
            // Wait for completion
            craftingThread.join(5000);
            
            // Session should be cleaned up
            assertNull(ProgressTracker.getProgress(sessionId), 
                      "Session should be cleaned up after completion");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testCancellationPropagation() {
        String testName = "Cancellation propagation (throws CancelledException)";
        try {
            Item_base base = createTestItem();
            Crafting_Item item = new Crafting_Item(base);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> undesiredMods = new ArrayList<>();
            
            if (!base.getNormalAllowedPrefixes().isEmpty()) {
                desiredMods.add(base.getNormalAllowedPrefixes().get(0));
            }
            
            String sessionId = "test-cancel-" + System.currentTimeMillis();
            
            // Start crafting in a separate thread
            final boolean[] cancelledExceptionThrown = {false};
            Thread craftingThread = new Thread(() -> {
                try {
                    Crafting_Algorithm.optimizeCrafting(item, desiredMods, undesiredMods, 0.001, 
                                                       new BeamSearchConfig(), sessionId);
                } catch (CancelledException e) {
                    cancelledExceptionThrown[0] = true;
                } catch (Exception e) {
                    // Other exceptions should not occur
                }
            });
            
            craftingThread.start();
            
            // Wait a bit, then try to cancel
            Thread.sleep(50);
            
            // Check if session still exists before trying to cancel
            if (ProgressTracker.hasSession(sessionId)) {
                ProgressTracker.cancelSession(sessionId);
                
                // Wait for thread to finish
                craftingThread.join(2000);
                
                assertTrue(cancelledExceptionThrown[0], 
                          "CancelledException should be thrown when cancelled");
                
                // Session should be cleaned up even after cancellation
                assertNull(ProgressTracker.getProgress(sessionId), 
                          "Session should be cleaned up after cancellation");
            } else {
                // Computation completed too fast to test cancellation
                System.out.println("  (Computation completed before cancellation test - skipping cancellation check)");
                
                // Wait for thread to finish
                craftingThread.join(1000);
                
                // Session should still be cleaned up
                assertNull(ProgressTracker.getProgress(sessionId), 
                          "Session should be cleaned up after completion");
            }
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testSessionCleanup() {
        String testName = "Session cleanup (endSession in finally block)";
        try {
            Item_base base = createTestItem();
            Crafting_Item item = new Crafting_Item(base);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> undesiredMods = new ArrayList<>();
            
            String sessionId = "test-cleanup-" + System.currentTimeMillis();
            
            // Run crafting (may succeed or fail, doesn't matter)
            try {
                Crafting_Algorithm.optimizeCrafting(item, desiredMods, undesiredMods, 0.001, 
                                                   new BeamSearchConfig(), sessionId);
            } catch (Exception e) {
                // Don't care about the result
            }
            
            // Session should always be cleaned up due to finally block
            assertNull(ProgressTracker.getProgress(sessionId), 
                      "Session should be cleaned up via finally block");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static void testBackwardCompatibility() {
        String testName = "Backward compatibility (sessionId = null)";
        try {
            Item_base base = createTestItem();
            Crafting_Item item = new Crafting_Item(base);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> undesiredMods = new ArrayList<>();
            
            // Call without sessionId (backward compatibility)
            List<Crafting_Candidate> result = Crafting_Algorithm.optimizeCrafting(
                item, desiredMods, undesiredMods, 0.001);
            
            // Should complete without errors
            assertNotNull(result, "Result should not be null");
            
            // Also test with config but no sessionId
            result = Crafting_Algorithm.optimizeCrafting(
                item, desiredMods, undesiredMods, 0.001, new BeamSearchConfig());
            
            assertNotNull(result, "Result with config should not be null");
            
            pass(testName);
        } catch (Exception e) {
            fail(testName, e);
        }
    }
    
    private static Item_base createTestItem() {
        try {
            // Try to load a simple item for testing (Helmets_str as a common choice)
            String className = "core.Items.Helmets.Helmets_str.Helmets_str";
            Class<?> itemClass = Class.forName(className);
            return (Item_base) itemClass.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            System.err.println("Could not load test item: " + e.getMessage());
            System.err.println("Tests may not run correctly without a valid item.");
            System.exit(1);
            return null;
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
    
    private static void assertNull(Object obj, String message) {
        if (obj != null) {
            throw new AssertionError("Assertion failed (object is not null): " + message);
        }
    }
    
    private static void assertNotNull(Object obj, String message) {
        if (obj == null) {
            throw new AssertionError("Assertion failed (object is null): " + message);
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
