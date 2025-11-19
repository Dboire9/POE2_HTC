package core.Test;

import core.Crafting.BeamSearchConfig;
import core.Crafting.BeamSearchConfig.ItemComplexity;

/**
 * Unit tests for BeamSearchConfig class.
 * 
 * Test coverage:
 * - Default configuration values
 * - Custom configuration construction
 * - Beam width calculation for different complexity levels
 * - Score getters and setters with validation
 * - Threshold validation
 * - Builder pattern
 * - ItemComplexity enum logic
 * - Edge cases and invalid inputs
 */
public class TestBeamSearchConfig {
    
    private static int passedTests = 0;
    private static int failedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=== BeamSearchConfig Unit Tests ===\n");
        
        // Configuration tests
        testDefaultConfiguration();
        testCustomConfiguration();
        testBuilderPattern();
        
        // Beam width calculation tests
        testBeamWidthSimple();
        testBeamWidthMedium();
        testBeamWidthComplex();
        
        // Scoring weight tests
        testDesiredModifierScoreValidation();
        testRelevantTagScoreValidation();
        testGlobalThresholdValidation();
        
        // ItemComplexity tests
        testComplexityFromModifierCount();
        testComplexityBoundaries();
        testComplexityInvalidInput();
        
        // Edge case tests
        testScoreBoundaries();
        testThresholdBoundaries();
        
        // Summary
        System.out.println("\n=== Test Summary ===");
        System.out.println("Passed: " + passedTests);
        System.out.println("Failed: " + failedTests);
        System.out.println("Total:  " + (passedTests + failedTests));
        System.out.println((failedTests == 0) ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
    }
    
    /**
     * Test: Default configuration has correct values
     */
    private static void testDefaultConfiguration() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            assert config.getDesiredModifierScore() == 1000 : "Default desired modifier score should be 1000";
            assert config.getRelevantTagScore() == 250 : "Default relevant tag score should be 250";
            assert config.getGlobalThreshold() == 0.001 : "Default global threshold should be 0.001";
            
            pass("testDefaultConfiguration");
        } catch (AssertionError | Exception e) {
            fail("testDefaultConfiguration", e);
        }
    }
    
    /**
     * Test: Custom configuration construction
     */
    private static void testCustomConfiguration() {
        try {
            BeamSearchConfig config = new BeamSearchConfig(1200, 300, 0.005);
            
            assert config.getDesiredModifierScore() == 1200 : "Custom desired modifier score should be 1200";
            assert config.getRelevantTagScore() == 300 : "Custom relevant tag score should be 300";
            assert config.getGlobalThreshold() == 0.005 : "Custom global threshold should be 0.005";
            
            pass("testCustomConfiguration");
        } catch (AssertionError | Exception e) {
            fail("testCustomConfiguration", e);
        }
    }
    
    /**
     * Test: Builder pattern works correctly
     */
    private static void testBuilderPattern() {
        try {
            BeamSearchConfig config = BeamSearchConfig.builder()
                .desiredModifierScore(1500)
                .relevantTagScore(400)
                .globalThreshold(0.01)
                .build();
            
            assert config.getDesiredModifierScore() == 1500 : "Builder desired modifier score should be 1500";
            assert config.getRelevantTagScore() == 400 : "Builder relevant tag score should be 400";
            assert config.getGlobalThreshold() == 0.01 : "Builder global threshold should be 0.01";
            
            // Test partial builder (should use defaults for unset values)
            BeamSearchConfig partialConfig = BeamSearchConfig.builder()
                .desiredModifierScore(2000)
                .build();
            
            assert partialConfig.getDesiredModifierScore() == 2000 : "Partial builder should set desired score";
            assert partialConfig.getRelevantTagScore() == 250 : "Partial builder should use default relevant score";
            assert partialConfig.getGlobalThreshold() == 0.001 : "Partial builder should use default threshold";
            
            pass("testBuilderPattern");
        } catch (AssertionError | Exception e) {
            fail("testBuilderPattern", e);
        }
    }
    
    /**
     * Test: Beam width calculation for SIMPLE complexity
     */
    private static void testBeamWidthSimple() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            int beamWidth = config.calculateBeamWidth(ItemComplexity.SIMPLE);
            
            assert beamWidth == 50 : "SIMPLE complexity should have beam width 50, got " + beamWidth;
            
            pass("testBeamWidthSimple");
        } catch (AssertionError | Exception e) {
            fail("testBeamWidthSimple", e);
        }
    }
    
    /**
     * Test: Beam width calculation for MEDIUM complexity
     */
    private static void testBeamWidthMedium() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            int beamWidth = config.calculateBeamWidth(ItemComplexity.MEDIUM);
            
            assert beamWidth == 100 : "MEDIUM complexity should have beam width 100, got " + beamWidth;
            
            pass("testBeamWidthMedium");
        } catch (AssertionError | Exception e) {
            fail("testBeamWidthMedium", e);
        }
    }
    
    /**
     * Test: Beam width calculation for COMPLEX complexity
     */
    private static void testBeamWidthComplex() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            int beamWidth = config.calculateBeamWidth(ItemComplexity.COMPLEX);
            
            assert beamWidth == 200 : "COMPLEX complexity should have beam width 200, got " + beamWidth;
            
            pass("testBeamWidthComplex");
        } catch (AssertionError | Exception e) {
            fail("testBeamWidthComplex", e);
        }
    }
    
    /**
     * Test: Desired modifier score validation
     */
    private static void testDesiredModifierScoreValidation() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            // Valid score should work
            config.setDesiredModifierScore(2000);
            assert config.getDesiredModifierScore() == 2000 : "Should accept valid score";
            
            // Zero should throw exception
            boolean exceptionThrown = false;
            try {
                config.setDesiredModifierScore(0);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for score = 0";
            
            // Negative should throw exception
            exceptionThrown = false;
            try {
                config.setDesiredModifierScore(-100);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for negative score";
            
            pass("testDesiredModifierScoreValidation");
        } catch (AssertionError | Exception e) {
            fail("testDesiredModifierScoreValidation", e);
        }
    }
    
    /**
     * Test: Relevant tag score validation
     */
    private static void testRelevantTagScoreValidation() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            // Valid score should work
            config.setRelevantTagScore(500);
            assert config.getRelevantTagScore() == 500 : "Should accept valid score";
            
            // Zero should throw exception
            boolean exceptionThrown = false;
            try {
                config.setRelevantTagScore(0);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for score = 0";
            
            // Negative should throw exception
            exceptionThrown = false;
            try {
                config.setRelevantTagScore(-50);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for negative score";
            
            pass("testRelevantTagScoreValidation");
        } catch (AssertionError | Exception e) {
            fail("testRelevantTagScoreValidation", e);
        }
    }
    
    /**
     * Test: Global threshold validation
     */
    private static void testGlobalThresholdValidation() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            // Valid thresholds should work
            config.setGlobalThreshold(0.0);
            assert config.getGlobalThreshold() == 0.0 : "Should accept threshold = 0.0";
            
            config.setGlobalThreshold(1.0);
            assert config.getGlobalThreshold() == 1.0 : "Should accept threshold = 1.0";
            
            config.setGlobalThreshold(0.5);
            assert config.getGlobalThreshold() == 0.5 : "Should accept threshold = 0.5";
            
            // Negative threshold should throw exception
            boolean exceptionThrown = false;
            try {
                config.setGlobalThreshold(-0.1);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for threshold < 0";
            
            // Threshold > 1 should throw exception
            exceptionThrown = false;
            try {
                config.setGlobalThreshold(1.1);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for threshold > 1";
            
            pass("testGlobalThresholdValidation");
        } catch (AssertionError | Exception e) {
            fail("testGlobalThresholdValidation", e);
        }
    }
    
    /**
     * Test: ItemComplexity.from() logic
     */
    private static void testComplexityFromModifierCount() {
        try {
            assert ItemComplexity.from(0) == ItemComplexity.SIMPLE : "0 modifiers should be SIMPLE";
            assert ItemComplexity.from(1) == ItemComplexity.SIMPLE : "1 modifier should be SIMPLE";
            assert ItemComplexity.from(2) == ItemComplexity.SIMPLE : "2 modifiers should be SIMPLE";
            assert ItemComplexity.from(3) == ItemComplexity.MEDIUM : "3 modifiers should be MEDIUM";
            assert ItemComplexity.from(4) == ItemComplexity.MEDIUM : "4 modifiers should be MEDIUM";
            assert ItemComplexity.from(5) == ItemComplexity.COMPLEX : "5 modifiers should be COMPLEX";
            assert ItemComplexity.from(6) == ItemComplexity.COMPLEX : "6 modifiers should be COMPLEX";
            assert ItemComplexity.from(10) == ItemComplexity.COMPLEX : "10 modifiers should be COMPLEX";
            
            pass("testComplexityFromModifierCount");
        } catch (AssertionError | Exception e) {
            fail("testComplexityFromModifierCount", e);
        }
    }
    
    /**
     * Test: ItemComplexity boundary conditions
     */
    private static void testComplexityBoundaries() {
        try {
            // Test boundaries between SIMPLE and MEDIUM
            assert ItemComplexity.from(2) == ItemComplexity.SIMPLE : "2 is boundary of SIMPLE";
            assert ItemComplexity.from(3) == ItemComplexity.MEDIUM : "3 is start of MEDIUM";
            
            // Test boundaries between MEDIUM and COMPLEX
            assert ItemComplexity.from(4) == ItemComplexity.MEDIUM : "4 is boundary of MEDIUM";
            assert ItemComplexity.from(5) == ItemComplexity.COMPLEX : "5 is start of COMPLEX";
            
            pass("testComplexityBoundaries");
        } catch (AssertionError | Exception e) {
            fail("testComplexityBoundaries", e);
        }
    }
    
    /**
     * Test: ItemComplexity.from() rejects invalid input
     */
    private static void testComplexityInvalidInput() {
        try {
            boolean exceptionThrown = false;
            try {
                ItemComplexity.from(-1);
            } catch (IllegalArgumentException e) {
                exceptionThrown = true;
            }
            assert exceptionThrown : "Should throw exception for negative modifier count";
            
            pass("testComplexityInvalidInput");
        } catch (AssertionError | Exception e) {
            fail("testComplexityInvalidInput", e);
        }
    }
    
    /**
     * Test: Score boundaries (very large values)
     */
    private static void testScoreBoundaries() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            // Test very large scores
            config.setDesiredModifierScore(Integer.MAX_VALUE);
            assert config.getDesiredModifierScore() == Integer.MAX_VALUE : "Should accept MAX_VALUE";
            
            config.setRelevantTagScore(Integer.MAX_VALUE);
            assert config.getRelevantTagScore() == Integer.MAX_VALUE : "Should accept MAX_VALUE";
            
            // Test minimum valid scores
            config.setDesiredModifierScore(1);
            assert config.getDesiredModifierScore() == 1 : "Should accept score = 1";
            
            config.setRelevantTagScore(1);
            assert config.getRelevantTagScore() == 1 : "Should accept score = 1";
            
            pass("testScoreBoundaries");
        } catch (AssertionError | Exception e) {
            fail("testScoreBoundaries", e);
        }
    }
    
    /**
     * Test: Threshold boundaries (precise edge values)
     */
    private static void testThresholdBoundaries() {
        try {
            BeamSearchConfig config = new BeamSearchConfig();
            
            // Test very small positive values
            config.setGlobalThreshold(0.0001);
            assert config.getGlobalThreshold() == 0.0001 : "Should accept small threshold";
            
            config.setGlobalThreshold(0.9999);
            assert config.getGlobalThreshold() == 0.9999 : "Should accept near-1 threshold";
            
            // Test exact boundaries
            config.setGlobalThreshold(0.0);
            assert config.getGlobalThreshold() == 0.0 : "Should accept exact 0.0";
            
            config.setGlobalThreshold(1.0);
            assert config.getGlobalThreshold() == 1.0 : "Should accept exact 1.0";
            
            pass("testThresholdBoundaries");
        } catch (AssertionError | Exception e) {
            fail("testThresholdBoundaries", e);
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
