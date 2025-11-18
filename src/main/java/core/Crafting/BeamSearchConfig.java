package core.Crafting;

/**
 * Configuration class for beam search algorithm parameters.
 * Provides adaptive beam width based on item complexity and configurable scoring weights.
 * 
 * CRITICAL: These parameters directly affect algorithm performance and memory usage.
 * Beam width controls search space size - higher values = more thorough but slower/memory-intensive.
 * Scoring weights control how the heuristic prioritizes candidates.
 * 
 * Default values are empirically tuned, modifications should be validated with BenchmarkSuite.
 * 
 * @see ItemComplexity
 * @see core.Crafting.Crafting_Algorithm#optimizeCrafting
 */
public class BeamSearchConfig {
    /**
     * Score awarded for matching a desired modifier.
     * Default: 1000 (empirically tuned)
     */
    private int desiredModifierScore;
    
    /**
     * Score awarded for having a tag relevant to desired modifiers.
     * Default: 250 (empirically tuned)
     */
    private int relevantTagScore;
    
    /**
     * Global threshold for probability-based pruning.
     * Default: 0.001 (0.1%)
     */
    private double globalThreshold;
    
    /**
     * Creates a new config with default parameters.
     * These defaults are empirically tuned for balanced performance.
     */
    public BeamSearchConfig() {
        this.desiredModifierScore = 1000;
        this.relevantTagScore = 250;
        this.globalThreshold = 0.001;
    }
    
    /**
     * Creates a new config with custom parameters.
     * Use this for testing different parameter combinations.
     * 
     * @param desiredModifierScore Score for matching desired modifier
     * @param relevantTagScore Score for relevant tags
     * @param globalThreshold Probability threshold for pruning
     */
    public BeamSearchConfig(int desiredModifierScore, int relevantTagScore, double globalThreshold) {
        this.desiredModifierScore = desiredModifierScore;
        this.relevantTagScore = relevantTagScore;
        this.globalThreshold = globalThreshold;
    }
    
    /**
     * Calculates optimal beam width based on item complexity.
     * 
     * Beam width controls how many candidates are kept at each iteration:
     * - SIMPLE (1-2 mods): 50 - Fast, sufficient for simple cases
     * - MEDIUM (3-4 mods): 100 - Balanced performance
     * - COMPLEX (5-6 mods): 200 - Thorough search for complex scenarios
     * 
     * IMPORTANT: These values are tuned to balance:
     * - Computation time (must stay under 1 minute per constitution §II)
     * - Memory usage (must avoid heap exhaustion per constitution §II)
     * - Solution quality (must find optimal or near-optimal paths)
     * 
     * @param complexity The complexity level of the crafting scenario
     * @return Optimal beam width for the given complexity
     */
    public int calculateBeamWidth(ItemComplexity complexity) {
        return switch (complexity) {
            case SIMPLE -> 50;   // 1-2 modifiers: fast search sufficient
            case MEDIUM -> 100;  // 3-4 modifiers: balanced approach
            case COMPLEX -> 200; // 5-6 modifiers: thorough search needed
        };
    }
    
    /**
     * Gets the score awarded for matching a desired modifier.
     * 
     * @return Desired modifier score (default: 1000)
     */
    public int getDesiredModifierScore() {
        return desiredModifierScore;
    }
    
    /**
     * Sets the score awarded for matching a desired modifier.
     * Higher values make the algorithm more greedy for exact matches.
     * 
     * @param desiredModifierScore New score value (must be positive)
     * @throws IllegalArgumentException if score <= 0
     */
    public void setDesiredModifierScore(int desiredModifierScore) {
        if (desiredModifierScore <= 0) {
            throw new IllegalArgumentException("desiredModifierScore must be positive");
        }
        this.desiredModifierScore = desiredModifierScore;
    }
    
    /**
     * Gets the score awarded for having tags relevant to desired modifiers.
     * 
     * @return Relevant tag score (default: 250)
     */
    public int getRelevantTagScore() {
        return relevantTagScore;
    }
    
    /**
     * Sets the score awarded for relevant tags.
     * Higher values make the algorithm favor items with relevant tag combinations.
     * 
     * @param relevantTagScore New score value (must be positive)
     * @throws IllegalArgumentException if score <= 0
     */
    public void setRelevantTagScore(int relevantTagScore) {
        if (relevantTagScore <= 0) {
            throw new IllegalArgumentException("relevantTagScore must be positive");
        }
        this.relevantTagScore = relevantTagScore;
    }
    
    /**
     * Gets the global threshold for probability-based pruning.
     * 
     * @return Global threshold (default: 0.001 = 0.1%)
     */
    public double getGlobalThreshold() {
        return globalThreshold;
    }
    
    /**
     * Sets the global threshold for probability-based pruning.
     * Lower values prune more aggressively, higher values keep more candidates.
     * 
     * @param globalThreshold New threshold (must be between 0 and 1)
     * @throws IllegalArgumentException if threshold not in range [0, 1]
     */
    public void setGlobalThreshold(double globalThreshold) {
        if (globalThreshold < 0 || globalThreshold > 1) {
            throw new IllegalArgumentException("globalThreshold must be between 0 and 1");
        }
        this.globalThreshold = globalThreshold;
    }
    
    /**
     * Creates a builder for fluent config construction.
     * Useful for testing different parameter combinations.
     * 
     * Example:
     * <pre>
     * BeamSearchConfig config = BeamSearchConfig.builder()
     *     .desiredModifierScore(1200)
     *     .relevantTagScore(300)
     *     .build();
     * </pre>
     * 
     * @return A new config builder
     */
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Builder class for fluent BeamSearchConfig construction.
     */
    public static class Builder {
        private int desiredModifierScore = 1000;
        private int relevantTagScore = 250;
        private double globalThreshold = 0.001;
        
        public Builder desiredModifierScore(int score) {
            this.desiredModifierScore = score;
            return this;
        }
        
        public Builder relevantTagScore(int score) {
            this.relevantTagScore = score;
            return this;
        }
        
        public Builder globalThreshold(double threshold) {
            this.globalThreshold = threshold;
            return this;
        }
        
        public BeamSearchConfig build() {
            return new BeamSearchConfig(desiredModifierScore, relevantTagScore, globalThreshold);
        }
    }
    
    /**
     * Enum representing item crafting complexity levels.
     * Complexity is determined by the number of desired modifiers.
     * 
     * More modifiers = larger search space = need wider beam for good results.
     */
    public enum ItemComplexity {
        /** 1-2 desired modifiers - simple scenarios */
        SIMPLE,
        
        /** 3-4 desired modifiers - medium complexity */
        MEDIUM,
        
        /** 5-6 desired modifiers - complex scenarios */
        COMPLEX;
        
        /**
         * Determines complexity from modifier count.
         * 
         * @param modifierCount Number of desired modifiers
         * @return Appropriate complexity level
         * @throws IllegalArgumentException if modifierCount < 0
         */
        public static ItemComplexity from(int modifierCount) {
            if (modifierCount < 0) {
                throw new IllegalArgumentException("modifierCount cannot be negative");
            }
            if (modifierCount <= 2) return SIMPLE;
            if (modifierCount <= 4) return MEDIUM;
            return COMPLEX;
        }
    }
}
