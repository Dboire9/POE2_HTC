package core.Crafting;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import core.Items.Item_base;
import core.Modifier_class.Modifier;

/**
 * Benchmark suite for testing crafting algorithm performance and accuracy.
 * 
 * Provides test cases covering SIMPLE, MEDIUM, and COMPLEX scenarios to validate:
 * - Algorithm parameter tuning (beam width, scoring weights)
 * - Performance targets (< 1 minute per constitution §II)
 * - Memory usage under different configurations
 * - Solution quality (path optimality)
 * 
 * USAGE:
 * <pre>
 * BenchmarkSuite suite = new BenchmarkSuite();
 * BenchmarkResult result = suite.runAllBenchmarks(new BeamSearchConfig());
 * System.out.println(result.getSummary());
 * </pre>
 * 
 * @see BeamSearchConfig
 * @see BeamSearchConfig.ItemComplexity
 */
public class BenchmarkSuite {
    
    private final List<BenchmarkCase> cases;
    
    /**
     * Creates a new benchmark suite with predefined test cases.
     */
    public BenchmarkSuite() {
        this.cases = new ArrayList<>();
        initializeBenchmarkCases();
    }
    
    /**
     * Represents a single benchmark test case.
     */
    public static class BenchmarkCase {
        private final String name;
        private final BeamSearchConfig.ItemComplexity complexity;
        private final Crafting_Item baseItem;
        private final List<Modifier> desiredMods;
        private final List<Modifier> undesiredMods;
        private final double maxAcceptableTimeSeconds;
        private final int expectedMinScore;
        
        /**
         * Creates a new benchmark case.
         * 
         * @param name Human-readable name for the test case
         * @param complexity Expected complexity level
         * @param baseItem Base item to craft
         * @param desiredMods List of desired modifiers
         * @param undesiredMods List of undesired modifiers (can be empty)
         * @param maxAcceptableTimeSeconds Maximum acceptable computation time
         * @param expectedMinScore Minimum expected score for validation
         */
        public BenchmarkCase(
                String name,
                BeamSearchConfig.ItemComplexity complexity,
                Crafting_Item baseItem,
                List<Modifier> desiredMods,
                List<Modifier> undesiredMods,
                double maxAcceptableTimeSeconds,
                int expectedMinScore) {
            this.name = name;
            this.complexity = complexity;
            this.baseItem = baseItem;
            this.desiredMods = desiredMods;
            this.undesiredMods = undesiredMods != null ? undesiredMods : new ArrayList<>();
            this.maxAcceptableTimeSeconds = maxAcceptableTimeSeconds;
            this.expectedMinScore = expectedMinScore;
        }
        
        public String getName() { return name; }
        public BeamSearchConfig.ItemComplexity getComplexity() { return complexity; }
        public Crafting_Item getBaseItem() { return baseItem; }
        public List<Modifier> getDesiredMods() { return desiredMods; }
        public List<Modifier> getUndesiredMods() { return undesiredMods; }
        public double getMaxAcceptableTimeSeconds() { return maxAcceptableTimeSeconds; }
        public int getExpectedMinScore() { return expectedMinScore; }
    }
    
    /**
     * Results from running a single benchmark case.
     */
    public static class BenchmarkCaseResult {
        private final BenchmarkCase testCase;
        private final boolean success;
        private final double elapsedSeconds;
        private final int resultCount;
        private final int bestScore;
        private final String errorMessage;
        
        public BenchmarkCaseResult(
                BenchmarkCase testCase,
                boolean success,
                double elapsedSeconds,
                int resultCount,
                int bestScore,
                String errorMessage) {
            this.testCase = testCase;
            this.success = success;
            this.elapsedSeconds = elapsedSeconds;
            this.resultCount = resultCount;
            this.bestScore = bestScore;
            this.errorMessage = errorMessage;
        }
        
        public boolean isSuccess() { return success; }
        public double getElapsedSeconds() { return elapsedSeconds; }
        public int getResultCount() { return resultCount; }
        public int getBestScore() { return bestScore; }
        public String getErrorMessage() { return errorMessage; }
        public BenchmarkCase getTestCase() { return testCase; }
        
        public boolean meetsPerformanceTarget() {
            return elapsedSeconds <= testCase.getMaxAcceptableTimeSeconds();
        }
        
        public boolean meetsQualityTarget() {
            return bestScore >= testCase.getExpectedMinScore();
        }
    }
    
    /**
     * Aggregated results from running all benchmark cases.
     */
    public static class BenchmarkResult {
        private final BeamSearchConfig config;
        private final List<BenchmarkCaseResult> caseResults;
        private final double totalTimeSeconds;
        
        public BenchmarkResult(
                BeamSearchConfig config,
                List<BenchmarkCaseResult> caseResults,
                double totalTimeSeconds) {
            this.config = config;
            this.caseResults = caseResults;
            this.totalTimeSeconds = totalTimeSeconds;
        }
        
        public BeamSearchConfig getConfig() { return config; }
        public List<BenchmarkCaseResult> getCaseResults() { return caseResults; }
        public double getTotalTimeSeconds() { return totalTimeSeconds; }
        
        public int getPassCount() {
            return (int) caseResults.stream()
                .filter(r -> r.isSuccess() && r.meetsPerformanceTarget() && r.meetsQualityTarget())
                .count();
        }
        
        public int getFailCount() {
            return caseResults.size() - getPassCount();
        }
        
        public double getAverageTimeSeconds() {
            return caseResults.stream()
                .mapToDouble(BenchmarkCaseResult::getElapsedSeconds)
                .average()
                .orElse(0.0);
        }
        
        /**
         * Generates a human-readable summary of benchmark results.
         */
        public String getSummary() {
            StringBuilder sb = new StringBuilder();
            sb.append("=".repeat(80)).append("\n");
            sb.append("BENCHMARK RESULTS\n");
            sb.append("=".repeat(80)).append("\n");
            sb.append(String.format("Configuration: desired=%d, tag=%d, threshold=%.4f\n",
                config.getDesiredModifierScore(),
                config.getRelevantTagScore(),
                config.getGlobalThreshold()));
            sb.append(String.format("Total Cases: %d | Passed: %d | Failed: %d\n",
                caseResults.size(), getPassCount(), getFailCount()));
            sb.append(String.format("Total Time: %.2f seconds | Average: %.2f seconds\n",
                totalTimeSeconds, getAverageTimeSeconds()));
            sb.append("-".repeat(80)).append("\n");
            
            for (BenchmarkCaseResult result : caseResults) {
                String status = result.isSuccess() && result.meetsPerformanceTarget() && result.meetsQualityTarget()
                    ? "✓ PASS" : "✗ FAIL";
                sb.append(String.format("%-50s %s\n", result.getTestCase().getName(), status));
                sb.append(String.format("  Complexity: %-10s | Time: %6.2fs / %6.2fs | Score: %5d / %5d\n",
                    result.getTestCase().getComplexity(),
                    result.getElapsedSeconds(),
                    result.getTestCase().getMaxAcceptableTimeSeconds(),
                    result.getBestScore(),
                    result.getTestCase().getExpectedMinScore()));
                
                if (!result.isSuccess()) {
                    sb.append(String.format("  ERROR: %s\n", result.getErrorMessage()));
                } else if (!result.meetsPerformanceTarget()) {
                    sb.append("  WARNING: Exceeded time limit\n");
                } else if (!result.meetsQualityTarget()) {
                    sb.append("  WARNING: Below quality target\n");
                }
            }
            
            sb.append("=".repeat(80)).append("\n");
            return sb.toString();
        }
    }
    
    /**
     * Initializes predefined benchmark test cases.
     * 
     * Cases are organized by complexity:
     * - SIMPLE: 1-2 desired modifiers
     * - MEDIUM: 3-4 desired modifiers  
     * - COMPLEX: 5-6 desired modifiers
     * 
     * Each case includes realistic crafting scenarios with appropriate time limits.
     */
    private void initializeBenchmarkCases() {
        // Note: These are placeholder cases. Real implementation requires actual items and modifiers.
        // TODO: Replace with concrete item bases and modifier lists from the game data
        
        // SIMPLE cases (1-2 modifiers)
        // Expected: Fast completion, < 5 seconds
        
        // MEDIUM cases (3-4 modifiers)
        // Expected: Moderate time, < 20 seconds
        
        // COMPLEX cases (5-6 modifiers)
        // Expected: Full search, < 60 seconds per constitution §II
        
        // Placeholder structure - awaiting actual item/modifier data
        System.out.println("WARNING: BenchmarkSuite initialized with placeholder cases.");
        System.out.println("TODO: Add concrete test cases with real Item_base instances and Modifier lists.");
    }
    
    /**
     * Runs all benchmark cases with the given configuration.
     * 
     * @param config BeamSearchConfig to test
     * @return Aggregated results from all cases
     */
    public BenchmarkResult runAllBenchmarks(BeamSearchConfig config) {
        if (cases.isEmpty()) {
            System.err.println("ERROR: No benchmark cases defined. Cannot run benchmarks.");
            return new BenchmarkResult(config, new ArrayList<>(), 0.0);
        }
        
        List<BenchmarkCaseResult> results = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        
        for (BenchmarkCase testCase : cases) {
            System.out.printf("Running: %s...\n", testCase.getName());
            BenchmarkCaseResult result = runSingleBenchmark(testCase, config);
            results.add(result);
            
            String status = result.isSuccess() && result.meetsPerformanceTarget() && result.meetsQualityTarget()
                ? "PASS" : "FAIL";
            System.out.printf("  Result: %s (%.2fs, score=%d)\n",
                status, result.getElapsedSeconds(), result.getBestScore());
        }
        
        long endTime = System.currentTimeMillis();
        double totalSeconds = (endTime - startTime) / 1000.0;
        
        return new BenchmarkResult(config, results, totalSeconds);
    }
    
    /**
     * Runs a single benchmark case.
     * 
     * @param testCase The test case to run
     * @param config Configuration to use
     * @return Result of the benchmark
     */
    private BenchmarkCaseResult runSingleBenchmark(BenchmarkCase testCase, BeamSearchConfig config) {
        long startTime = System.nanoTime();
        
        try {
            // Use config's global threshold, not hardcoded
            List<Crafting_Candidate> results = Crafting_Algorithm.optimizeCrafting(
                testCase.getBaseItem(),
                testCase.getDesiredMods(),
                testCase.getUndesiredMods(),
                config.getGlobalThreshold(),
                config
            );
            
            long endTime = System.nanoTime();
            double elapsedSeconds = (endTime - startTime) / 1_000_000_000.0;
            
            int bestScore = results.stream()
                .mapToInt(c -> (int) c.score)
                .max()
                .orElse(0);
            
            return new BenchmarkCaseResult(
                testCase,
                true,
                elapsedSeconds,
                results.size(),
                bestScore,
                null
            );
            
        } catch (InterruptedException | ExecutionException e) {
            long endTime = System.nanoTime();
            double elapsedSeconds = (endTime - startTime) / 1_000_000_000.0;
            
            return new BenchmarkCaseResult(
                testCase,
                false,
                elapsedSeconds,
                0,
                0,
                e.getMessage()
            );
        }
    }
    
    /**
     * Main method for running benchmarks from command line.
     * 
     * Usage: java core.Crafting.BenchmarkSuite
     */
    public static void main(String[] args) {
        System.out.println("POE2 Crafting Algorithm Benchmark Suite");
        System.out.println("Version: 1.0.0\n");
        
        BenchmarkSuite suite = new BenchmarkSuite();
        BeamSearchConfig defaultConfig = new BeamSearchConfig();
        
        System.out.println("Running benchmarks with default configuration...\n");
        BenchmarkResult result = suite.runAllBenchmarks(defaultConfig);
        
        System.out.println("\n" + result.getSummary());
        
        // Exit with appropriate code
        System.exit(result.getFailCount() > 0 ? 1 : 0);
    }
}
