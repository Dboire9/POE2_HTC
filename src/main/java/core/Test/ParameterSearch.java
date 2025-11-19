package core.Test;

import core.Crafting.BeamSearchConfig;
import core.Crafting.BenchmarkSuite;
import core.Crafting.BenchmarkSuite.BenchmarkResult;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * Parameter search tool to find optimal scoring weights for the crafting algorithm.
 * 
 * Performs grid search over scoring weight combinations:
 * - Desired modifier score: 800 to 1200 (step 100)
 * - Relevant tag score: 200 to 300 (step 25)
 * 
 * For each combination, runs the full benchmark suite and measures:
 * - Success rate (how many test cases pass)
 * - Average execution time
 * - Total score quality
 * 
 * Results are written to parameter-search-results.csv for analysis.
 * 
 * USAGE:
 * java core.Test.ParameterSearch
 * 
 * EXPECTED OUTPUT:
 * - CSV file with all tested combinations
 * - Console output showing best configuration
 * - Recommendation for BeamSearchConfig defaults
 */
public class ParameterSearch {
    
    // Grid search ranges - focused search around defaults (1000/250)
    private static final int DESIRED_MOD_SCORE_MIN = 900;
    private static final int DESIRED_MOD_SCORE_MAX = 1100;
    private static final int DESIRED_MOD_SCORE_STEP = 100;
    
    private static final int RELEVANT_TAG_SCORE_MIN = 200;
    private static final int RELEVANT_TAG_SCORE_MAX = 300;
    private static final int RELEVANT_TAG_SCORE_STEP = 50;
    
    private static final String OUTPUT_FILE = "parameter-search-results.csv";
    
    public static void main(String[] args) {
        System.out.println("=" .repeat(80));
        System.out.println("CRAFTING ALGORITHM PARAMETER SEARCH");
        System.out.println("=" .repeat(80));
        System.out.println();
        System.out.println("Objective: Find optimal scoring weights for beam search algorithm");
        System.out.println("Method: Grid search over weight combinations");
        System.out.println();
        System.out.println("Search space:");
        System.out.println("  Desired modifier score: " + DESIRED_MOD_SCORE_MIN + " to " + DESIRED_MOD_SCORE_MAX + " (step " + DESIRED_MOD_SCORE_STEP + ")");
        System.out.println("  Relevant tag score: " + RELEVANT_TAG_SCORE_MIN + " to " + RELEVANT_TAG_SCORE_MAX + " (step " + RELEVANT_TAG_SCORE_STEP + ")");
        
        int totalCombinations = 
            ((DESIRED_MOD_SCORE_MAX - DESIRED_MOD_SCORE_MIN) / DESIRED_MOD_SCORE_STEP + 1) *
            ((RELEVANT_TAG_SCORE_MAX - RELEVANT_TAG_SCORE_MIN) / RELEVANT_TAG_SCORE_STEP + 1);
        
        System.out.println("  Total combinations: " + totalCombinations);
        System.out.println();
        System.out.println("Output file: " + OUTPUT_FILE);
        System.out.println();
        System.out.println("=" .repeat(80));
        System.out.println();
        
        BenchmarkSuite suite = new BenchmarkSuite();
        List<SearchResult> results = new ArrayList<>();
        
        int combinationIndex = 0;
        long startTime = System.currentTimeMillis();
        
        // Grid search loop
        for (int desiredScore = DESIRED_MOD_SCORE_MIN; desiredScore <= DESIRED_MOD_SCORE_MAX; desiredScore += DESIRED_MOD_SCORE_STEP) {
            for (int tagScore = RELEVANT_TAG_SCORE_MIN; tagScore <= RELEVANT_TAG_SCORE_MAX; tagScore += RELEVANT_TAG_SCORE_STEP) {
                combinationIndex++;
                
                System.out.println("Testing combination " + combinationIndex + "/" + totalCombinations + ": " +
                                 "desiredScore=" + desiredScore + ", tagScore=" + tagScore);
                
                // Create config with these weights
                BeamSearchConfig config = BeamSearchConfig.builder()
                    .desiredModifierScore(desiredScore)
                    .relevantTagScore(tagScore)
                    .build();
                
                // Run benchmark suite
                try {
                    BenchmarkResult benchmarkResult = suite.runAllBenchmarks(config);
                    
                    // Calculate metrics from case results
                    int passedTests = benchmarkResult.getPassCount();
                    int failedTests = benchmarkResult.getFailCount();
                    int totalTests = passedTests + failedTests;
                    double avgTime = benchmarkResult.getAverageTimeSeconds();
                    
                    // Calculate total score (sum of best scores from all cases)
                    int totalScore = benchmarkResult.getCaseResults().stream()
                        .mapToInt(BenchmarkSuite.BenchmarkCaseResult::getBestScore)
                        .sum();
                    
                    SearchResult searchResult = new SearchResult(
                        desiredScore,
                        tagScore,
                        passedTests,
                        failedTests,
                        totalTests,
                        avgTime,
                        totalScore
                    );
                    
                    results.add(searchResult);
                    
                    System.out.println("  → Pass rate: " + searchResult.getPassRate() + "%, " +
                                     "Avg time: " + String.format("%.2fs", searchResult.avgTime) + ", " +
                                     "Total score: " + searchResult.totalScore);
                    
                } catch (Exception e) {
                    System.err.println("  → ERROR: " + e.getMessage());
                    // Record failed result
                    SearchResult failedResult = new SearchResult(
                        desiredScore, tagScore, 0, 11, 11, 0, 0
                    );
                    results.add(failedResult);
                }
                
                System.out.println();
            }
        }
        
        long endTime = System.currentTimeMillis();
        double totalTimeMinutes = (endTime - startTime) / 60000.0;
        
        // Write results to CSV
        writeResultsToCSV(results);
        
        // Find best configuration
        SearchResult best = findBestConfiguration(results);
        
        // Print summary
        System.out.println("=" .repeat(80));
        System.out.println("SEARCH COMPLETE");
        System.out.println("=" .repeat(80));
        System.out.println();
        System.out.println("Total search time: " + String.format("%.1f", totalTimeMinutes) + " minutes");
        System.out.println("Results written to: " + OUTPUT_FILE);
        System.out.println();
        
        if (best != null) {
            System.out.println("BEST CONFIGURATION FOUND:");
            System.out.println("-".repeat(80));
            System.out.println("  Desired modifier score: " + best.desiredModScore);
            System.out.println("  Relevant tag score:     " + best.relevantTagScore);
            System.out.println();
            System.out.println("  Pass rate:      " + best.getPassRate() + "% (" + best.passedTests + "/" + best.totalTests + ")");
            System.out.println("  Average time:   " + String.format("%.2f", best.avgTime) + " seconds");
            System.out.println("  Total score:    " + best.totalScore);
            System.out.println("-".repeat(80));
            System.out.println();
            System.out.println("RECOMMENDATION:");
            System.out.println("  Update BeamSearchConfig defaults to:");
            System.out.println("    desiredModifierScore = " + best.desiredModScore + ";");
            System.out.println("    relevantTagScore = " + best.relevantTagScore + ";");
        } else {
            System.out.println("ERROR: No valid configurations found!");
        }
        
        System.out.println();
        System.out.println("=" .repeat(80));
    }
    
    /**
     * Writes search results to CSV file for further analysis.
     */
    private static void writeResultsToCSV(List<SearchResult> results) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(OUTPUT_FILE))) {
            // CSV header
            writer.println("desired_mod_score,relevant_tag_score,passed_tests,failed_tests,total_tests,pass_rate,avg_time_sec,total_score");
            
            // Data rows
            for (SearchResult result : results) {
                writer.println(String.format("%d,%d,%d,%d,%d,%.1f,%.3f,%d",
                    result.desiredModScore,
                    result.relevantTagScore,
                    result.passedTests,
                    result.failedTests,
                    result.totalTests,
                    result.getPassRate(),
                    result.avgTime,
                    result.totalScore
                ));
            }
            
            System.out.println("CSV file written successfully: " + OUTPUT_FILE);
        } catch (Exception e) {
            System.err.println("Failed to write CSV file: " + e.getMessage());
        }
    }
    
    /**
     * Finds the best configuration based on multiple criteria:
     * 1. Highest pass rate
     * 2. If tied, lowest average time
     * 3. If still tied, highest total score
     */
    private static SearchResult findBestConfiguration(List<SearchResult> results) {
        if (results.isEmpty()) {
            return null;
        }
        
        SearchResult best = results.get(0);
        
        for (SearchResult result : results) {
            // Primary criterion: pass rate
            if (result.getPassRate() > best.getPassRate()) {
                best = result;
            } else if (result.getPassRate() == best.getPassRate()) {
                // Secondary criterion: lower average time
                if (result.avgTime < best.avgTime) {
                    best = result;
                } else if (Math.abs(result.avgTime - best.avgTime) < 0.1) {
                    // Tertiary criterion: higher total score
                    if (result.totalScore > best.totalScore) {
                        best = result;
                    }
                }
            }
        }
        
        return best;
    }
    
    /**
     * Stores results from testing a single parameter combination.
     */
    private static class SearchResult {
        final int desiredModScore;
        final int relevantTagScore;
        final int passedTests;
        final int failedTests;
        final int totalTests;
        final double avgTime;
        final int totalScore;
        
        SearchResult(int desiredModScore, int relevantTagScore, 
                    int passedTests, int failedTests, int totalTests,
                    double avgTime, int totalScore) {
            this.desiredModScore = desiredModScore;
            this.relevantTagScore = relevantTagScore;
            this.passedTests = passedTests;
            this.failedTests = failedTests;
            this.totalTests = totalTests;
            this.avgTime = avgTime;
            this.totalScore = totalScore;
        }
        
        double getPassRate() {
            return totalTests > 0 ? (passedTests * 100.0 / totalTests) : 0;
        }
    }
}
