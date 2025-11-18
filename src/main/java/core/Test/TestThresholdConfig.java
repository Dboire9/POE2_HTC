package core.Test;

import core.Crafting.ThresholdConfig;

/**
 * Unit tests for ThresholdConfig class.
 * 
 * Validates:
 * - Preset configurations (standard, fast, thorough, fixed)
 * - Parameter validation (boundary conditions, invalid combinations)
 * - Iteration logic (getThresholdForIteration, shouldContinue)
 * - Edge cases (zero step, mathematical limits)
 * - Builder pattern functionality
 */
public class TestThresholdConfig {
    
    private static int testCount = 0;
    private static int passCount = 0;
    
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("ThresholdConfig Unit Tests");
        System.out.println("========================================\n");
        
        // Run all test categories
        testPresets();
        testParameterValidation();
        testIterationLogic();
        testEdgeCases();
        testBuilder();
        
        // Print summary
        System.out.println("\n========================================");
        System.out.println("Test Summary");
        System.out.println("========================================");
        System.out.println("Total tests: " + testCount);
        System.out.println("Passed: " + passCount);
        System.out.println("Failed: " + (testCount - passCount));
        System.out.println("Pass rate: " + String.format("%.1f%%", (passCount * 100.0 / testCount)));
        
        if (passCount == testCount) {
            System.out.println("\n✅ ALL TESTS PASSED");
        } else {
            System.out.println("\n❌ SOME TESTS FAILED");
            System.exit(1);
        }
    }
    
    private static void testPresets() {
        System.out.println("--- Preset Configuration Tests ---");
        
        test("standard() preset", () -> {
            ThresholdConfig config = ThresholdConfig.standard();
            assertDoubleEquals(0.5, config.getStartThreshold());
            assertDoubleEquals(0.01, config.getStepSize());
            assertDoubleEquals(0.0, config.getMinThreshold());
            assertEquals(51, config.getMaxIterations());
        });
        
        test("fast() preset", () -> {
            ThresholdConfig config = ThresholdConfig.fast();
            assertDoubleEquals(0.3, config.getStartThreshold());
            assertDoubleEquals(0.02, config.getStepSize());
            assertEquals(16, config.getMaxIterations());
        });
        
        test("thorough() preset", () -> {
            ThresholdConfig config = ThresholdConfig.thorough();
            assertDoubleEquals(0.7, config.getStartThreshold());
            assertDoubleEquals(0.005, config.getStepSize());
            assertEquals(141, config.getMaxIterations());
        });
        
        test("fixed(0.25) preset", () -> {
            ThresholdConfig config = ThresholdConfig.fixed(0.25);
            assertDoubleEquals(0.25, config.getStartThreshold());
            assertDoubleEquals(0.25, config.getMinThreshold());
            assertEquals(1, config.getMaxIterations());
        });
    }
    
    private static void testParameterValidation() {
        System.out.println("\n--- Parameter Validation Tests ---");
        
        test("valid boundary parameters", () -> {
            new ThresholdConfig(1.0, 0.0, 0.0, 1);  // Max start, zero step
            new ThresholdConfig(0.0, 1.0, 0.0, 1);  // Zero start
            new ThresholdConfig(1.0, 0.0, 1.0, 1);  // Equal start/min
        });
        
        test("invalid startThreshold", () -> {
            assertThrows(() -> new ThresholdConfig(-0.1, 0.01, 0.0, 51));
            assertThrows(() -> new ThresholdConfig(1.1, 0.01, 0.0, 51));
        });
        
        test("invalid stepSize", () -> {
            assertThrows(() -> new ThresholdConfig(0.5, -0.01, 0.0, 51));
            assertThrows(() -> new ThresholdConfig(0.5, 1.1, 0.0, 51));
        });
        
        test("invalid minThreshold", () -> {
            assertThrows(() -> new ThresholdConfig(0.5, 0.01, -0.1, 51));
            assertThrows(() -> new ThresholdConfig(0.5, 0.01, 1.1, 51));
        });
        
        test("invalid maxIterations", () -> {
            assertThrows(() -> new ThresholdConfig(0.5, 0.01, 0.0, 0));
            assertThrows(() -> new ThresholdConfig(0.5, 0.01, 0.0, -1));
        });
        
        test("startThreshold < minThreshold", () -> {
            assertThrows(() -> new ThresholdConfig(0.2, 0.01, 0.5, 51));
        });
        
        test("insufficient maxIterations", () -> {
            // 0.5 → 0.0 in 0.01 steps needs 51 iterations, but only 10 provided
            assertThrows(() -> new ThresholdConfig(0.5, 0.01, 0.0, 10));
        });
    }
    
    private static void testIterationLogic() {
        System.out.println("\n--- Iteration Logic Tests ---");
        
        test("getThresholdForIteration countdown", () -> {
            ThresholdConfig config = ThresholdConfig.standard(); // 0.5 → 0.0 in 0.01 steps
            
            assertDoubleEquals(0.5, config.getThresholdForIteration(0));   // First
            assertDoubleEquals(0.49, config.getThresholdForIteration(1));  // Second
            assertDoubleEquals(0.25, config.getThresholdForIteration(25)); // Middle
            assertDoubleEquals(0.0, config.getThresholdForIteration(50));  // Last
        });
        
        test("getThresholdForIteration beyond max", () -> {
            ThresholdConfig config = ThresholdConfig.standard();
            assertDoubleEquals(0.0, config.getThresholdForIteration(51));  // Beyond max
            assertDoubleEquals(0.0, config.getThresholdForIteration(100)); // Far beyond
        });
        
        test("shouldContinue logic", () -> {
            ThresholdConfig config = ThresholdConfig.standard();
            
            assertTrue(config.shouldContinue(0, 0.5));   // Start
            assertTrue(config.shouldContinue(25, 0.25)); // Middle
            assertTrue(config.shouldContinue(50, 0.0));  // Last valid
            assertFalse(config.shouldContinue(51, 0.0)); // Beyond max
        });
        
        test("negative iteration throws", () -> {
            ThresholdConfig config = ThresholdConfig.standard();
            assertThrows(() -> config.getThresholdForIteration(-1));
        });
    }
    
    private static void testEdgeCases() {
        System.out.println("\n--- Edge Case Tests ---");
        
        test("zero step size (fixed threshold)", () -> {
            ThresholdConfig config = ThresholdConfig.fixed(0.5);
            
            assertDoubleEquals(0.5, config.getThresholdForIteration(0));
            assertDoubleEquals(0.5, config.getThresholdForIteration(1));
            assertTrue(config.shouldContinue(0, 0.5));
            assertFalse(config.shouldContinue(1, 0.5)); // Max 1 iteration
        });
        
        test("single iteration config", () -> {
            // Use zero step to ensure single iteration (no countdown)
            ThresholdConfig config = new ThresholdConfig(0.3, 0.0, 0.3, 1);
            
            assertDoubleEquals(0.3, config.getThresholdForIteration(0));
            assertTrue(config.shouldContinue(0, 0.3));
            assertFalse(config.shouldContinue(1, 0.3));
        });
        
        test("large countdown (1.0 → 0.0 in 0.001 steps)", () -> {
            ThresholdConfig config = new ThresholdConfig(1.0, 0.001, 0.0, 1001);
            
            assertDoubleEquals(1.0, config.getThresholdForIteration(0), 0.001);
            assertDoubleEquals(0.5, config.getThresholdForIteration(500), 0.001);
            assertDoubleEquals(0.0, config.getThresholdForIteration(1000), 0.001);
        });
    }
    
    private static void testBuilder() {
        System.out.println("\n--- Builder Pattern Tests ---");
        
        test("builder with defaults", () -> {
            ThresholdConfig config = ThresholdConfig.builder().build();
            
            assertDoubleEquals(0.5, config.getStartThreshold());
            assertDoubleEquals(0.01, config.getStepSize());
            assertDoubleEquals(0.0, config.getMinThreshold());
            assertEquals(51, config.getMaxIterations());
        });
        
        test("builder with custom values", () -> {
            ThresholdConfig config = ThresholdConfig.builder()
                .startThreshold(0.8)
                .stepSize(0.02)
                .minThreshold(0.1)
                .maxIterations(40)
                .build();
            
            assertDoubleEquals(0.8, config.getStartThreshold());
            assertDoubleEquals(0.02, config.getStepSize());
            assertDoubleEquals(0.1, config.getMinThreshold());
            assertEquals(40, config.getMaxIterations());
        });
    }
    
    // === Test Helpers ===
    
    private static void test(String name, TestCode code) {
        testCount++;
        try {
            code.run();
            passCount++;
            System.out.println("✓ " + name);
        } catch (Exception e) {
            System.out.println("✗ " + name + ": " + e.getMessage());
        }
    }
    
    private static void assertEquals(int expected, int actual) {
        if (expected != actual) {
            throw new RuntimeException("Expected " + expected + ", got " + actual);
        }
    }
    
    private static void assertDoubleEquals(double expected, double actual) {
        assertDoubleEquals(expected, actual, 0.0001);
    }
    
    private static void assertDoubleEquals(double expected, double actual, double tolerance) {
        if (Math.abs(expected - actual) > tolerance) {
            throw new RuntimeException("Expected " + expected + ", got " + actual);
        }
    }
    
    private static void assertTrue(boolean condition) {
        if (!condition) {
            throw new RuntimeException("Expected true, got false");
        }
    }
    
    private static void assertFalse(boolean condition) {
        if (condition) {
            throw new RuntimeException("Expected false, got true");
        }
    }
    
    private static void assertThrows(TestCode code) {
        try {
            code.run();
            throw new RuntimeException("Expected exception not thrown");
        } catch (IllegalArgumentException e) {
            // Expected
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Expected exception not thrown")) {
                throw e;
            }
            // Other runtime exceptions are acceptable for tests
        }
    }
    
    @FunctionalInterface
    private interface TestCode {
        void run();
    }
}
