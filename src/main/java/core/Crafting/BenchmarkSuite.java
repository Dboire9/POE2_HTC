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
     * Based on actual game items and modifiers from POE2.
     */
    private void initializeBenchmarkCases() {
        // SIMPLE CASES (1-2 modifiers) - Expected: < 5 seconds
        addSimpleBowCase();
        addSimpleHelmetCase();
        addSimpleRingCase();
        
        // MEDIUM CASES (3-4 modifiers) - Expected: < 20 seconds
        addMediumBowCase();
        addMediumArmorCase();
        addMediumWeaponCase();
        addMediumJewelryCase();
        
        // COMPLEX CASES (5-6 modifiers) - Expected: < 60 seconds
        addComplexBowCase();
        addComplexHelmetCase();
        addComplexBodyArmorCase();
        addComplexWeaponCase();
        
        System.out.println("BenchmarkSuite initialized with " + cases.size() + " test cases");
        System.out.println("  SIMPLE: " + countByComplexity(BeamSearchConfig.ItemComplexity.SIMPLE));
        System.out.println("  MEDIUM: " + countByComplexity(BeamSearchConfig.ItemComplexity.MEDIUM));
        System.out.println("  COMPLEX: " + countByComplexity(BeamSearchConfig.ItemComplexity.COMPLEX));
    }
    
    private int countByComplexity(BeamSearchConfig.ItemComplexity complexity) {
        return (int) cases.stream().filter(c -> c.getComplexity() == complexity).count();
    }
    
    // ==================== SIMPLE TEST CASES (1-2 mods) ====================
    
    /**
     * SIMPLE: Bow with 2 damage modifiers
     * Fast scenario testing basic prefix selection
     */
    private void addSimpleBowCase() {
        try {
            core.Items.Bows.Bows bowBase = new core.Items.Bows.Bows();
            Crafting_Item item = new Crafting_Item(bowBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            desiredMods.add(bowBase.getNormalAllowedPrefixes().get(0)); // Physical Damage Flat
            desiredMods.add(bowBase.getNormalAllowedPrefixes().get(4)); // Increased Physical Damage %
            
            cases.add(new BenchmarkCase(
                "SIMPLE: Bow - 2 Physical Damage Mods",
                BeamSearchConfig.ItemComplexity.SIMPLE,
                item,
                desiredMods,
                new ArrayList<>(),
                5.0,  // 5 seconds max
                2000  // Expected min score (2 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create simple bow case: " + e.getMessage());
        }
    }
    
    /**
     * SIMPLE: Helmet with 1 life modifier
     * Minimal complexity for baseline testing
     */
    private void addSimpleHelmetCase() {
        try {
            core.Items.Helmets.Helmets_str.Helmets_str helmetBase = new core.Items.Helmets.Helmets_str.Helmets_str();
            Crafting_Item item = new Crafting_Item(helmetBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            if (!helmetBase.getNormalAllowedPrefixes().isEmpty()) {
                desiredMods.add(helmetBase.getNormalAllowedPrefixes().get(0)); // Life
            }
            
            cases.add(new BenchmarkCase(
                "SIMPLE: Helmet - 1 Life Mod",
                BeamSearchConfig.ItemComplexity.SIMPLE,
                item,
                desiredMods,
                new ArrayList<>(),
                3.0,  // 3 seconds max
                1000  // Expected min score (1 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create simple helmet case: " + e.getMessage());
        }
    }
    
    /**
     * SIMPLE: Ring with 2 resistance modifiers
     * Testing suffix selection
     */
    private void addSimpleRingCase() {
        try {
            core.Items.Rings.Rings ringBase = new core.Items.Rings.Rings();
            Crafting_Item item = new Crafting_Item(ringBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> suffixes = ringBase.getNormalAllowedSuffixes();
            if (suffixes.size() >= 2) {
                desiredMods.add(suffixes.get(0)); // First resistance
                desiredMods.add(suffixes.get(1)); // Second resistance
            }
            
            cases.add(new BenchmarkCase(
                "SIMPLE: Ring - 2 Resistance Mods",
                BeamSearchConfig.ItemComplexity.SIMPLE,
                item,
                desiredMods,
                new ArrayList<>(),
                5.0,  // 5 seconds max
                2000  // Expected min score (2 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create simple ring case: " + e.getMessage());
        }
    }
    
    // ==================== MEDIUM TEST CASES (3-4 mods) ====================
    
    /**
     * MEDIUM: Bow with 4 modifiers (2 prefix, 2 suffix)
     * Balanced prefix/suffix selection
     */
    private void addMediumBowCase() {
        try {
            core.Items.Bows.Bows bowBase = new core.Items.Bows.Bows();
            Crafting_Item item = new Crafting_Item(bowBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            desiredMods.add(bowBase.getNormalAllowedPrefixes().get(0)); // Physical Damage Flat
            desiredMods.add(bowBase.getNormalAllowedPrefixes().get(4)); // Increased Physical Damage %
            desiredMods.add(bowBase.getNormalAllowedSuffixes().get(3)); // Life Leech
            desiredMods.add(bowBase.getNormalAllowedSuffixes().get(8)); // Attack Speed
            
            cases.add(new BenchmarkCase(
                "MEDIUM: Bow - 4 Mixed Mods (Phys + Utility)",
                BeamSearchConfig.ItemComplexity.MEDIUM,
                item,
                desiredMods,
                new ArrayList<>(),
                15.0,  // 15 seconds max
                4000   // Expected min score (4 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create medium bow case: " + e.getMessage());
        }
    }
    
    /**
     * MEDIUM: Body Armor with 3 defensive modifiers
     * Testing defense-focused crafting
     */
    private void addMediumArmorCase() {
        try {
            core.Items.Body_Armours.Body_Armours_str_int.Body_Armours_str_int armorBase = 
                new core.Items.Body_Armours.Body_Armours_str_int.Body_Armours_str_int();
            Crafting_Item item = new Crafting_Item(armorBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = armorBase.getNormalAllowedPrefixes();
            if (prefixes.size() >= 3) {
                desiredMods.add(prefixes.get(0)); // Life
                desiredMods.add(prefixes.get(1)); // Armour/ES
                desiredMods.add(prefixes.get(2)); // Defense mod
            }
            
            cases.add(new BenchmarkCase(
                "MEDIUM: Body Armor - 3 Defense Mods",
                BeamSearchConfig.ItemComplexity.MEDIUM,
                item,
                desiredMods,
                new ArrayList<>(),
                18.0,  // 18 seconds max
                3000   // Expected min score (3 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create medium armor case: " + e.getMessage());
        }
    }
    
    /**
     * MEDIUM: Weapon with 4 modifiers
     * Testing elemental damage crafting
     */
    private void addMediumWeaponCase() {
        try {
            core.Items.OneHand_Maces.OneHand_Maces weaponBase = new core.Items.OneHand_Maces.OneHand_Maces();
            Crafting_Item item = new Crafting_Item(weaponBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = weaponBase.getNormalAllowedPrefixes();
            if (prefixes.size() >= 4) {
                desiredMods.add(prefixes.get(0)); // Physical damage
                desiredMods.add(prefixes.get(1)); // Elemental damage
                desiredMods.add(prefixes.get(2)); // Another damage mod
                desiredMods.add(prefixes.get(3)); // Fourth mod
            }
            
            cases.add(new BenchmarkCase(
                "MEDIUM: Weapon - 4 Damage Mods",
                BeamSearchConfig.ItemComplexity.MEDIUM,
                item,
                desiredMods,
                new ArrayList<>(),
                20.0,  // 20 seconds max
                4000   // Expected min score (4 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create medium weapon case: " + e.getMessage());
        }
    }
    
    /**
     * MEDIUM: Jewelry with 3 modifiers
     * Testing attribute and resistance combinations
     */
    private void addMediumJewelryCase() {
        try {
            core.Items.Amulets.Amulets amuletBase = new core.Items.Amulets.Amulets();
            Crafting_Item item = new Crafting_Item(amuletBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = amuletBase.getNormalAllowedPrefixes();
            List<Modifier> suffixes = amuletBase.getNormalAllowedSuffixes();
            
            if (prefixes.size() >= 2 && suffixes.size() >= 1) {
                desiredMods.add(prefixes.get(0));  // Life or attribute
                desiredMods.add(prefixes.get(1));  // Second prefix
                desiredMods.add(suffixes.get(0));  // Resistance or attribute
            }
            
            cases.add(new BenchmarkCase(
                "MEDIUM: Amulet - 3 Utility Mods",
                BeamSearchConfig.ItemComplexity.MEDIUM,
                item,
                desiredMods,
                new ArrayList<>(),
                15.0,  // 15 seconds max
                3000   // Expected min score (3 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create medium jewelry case: " + e.getMessage());
        }
    }
    
    // ==================== COMPLEX TEST CASES (5-6 mods) ====================
    
    /**
     * COMPLEX: Bow with 6 modifiers - the ultimate test
     * This is the constitution's target scenario: < 1 minute
     */
    private void addComplexBowCase() {
        try {
            core.Items.Bows.Bows bowBase = new core.Items.Bows.Bows();
            Crafting_Item item = new Crafting_Item(bowBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = bowBase.getNormalAllowedPrefixes();
            List<Modifier> suffixes = bowBase.getNormalAllowedSuffixes();
            
            // 3 prefixes + 3 suffixes = full rare item
            if (prefixes.size() >= 3 && suffixes.size() >= 3) {
                desiredMods.add(prefixes.get(0));  // Physical Damage Flat
                desiredMods.add(prefixes.get(4));  // Increased Physical Damage %
                desiredMods.add(prefixes.get(3));  // Lightning Damage
                desiredMods.add(suffixes.get(3));  // Life Leech
                desiredMods.add(suffixes.get(4));  // Mana Leech
                desiredMods.add(suffixes.get(8));  // Attack Speed
            }
            
            cases.add(new BenchmarkCase(
                "COMPLEX: Bow - 6 Mods (Physical + Utility)",
                BeamSearchConfig.ItemComplexity.COMPLEX,
                item,
                desiredMods,
                new ArrayList<>(),
                60.0,  // 60 seconds max (constitution requirement)
                6000   // Expected min score (6 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create complex bow case: " + e.getMessage());
        }
    }
    
    /**
     * COMPLEX: Helmet with 5 modifiers
     * Defense + utility combination
     */
    private void addComplexHelmetCase() {
        try {
            core.Items.Helmets.Helmets_str_int.Helmets_str_int helmetBase = 
                new core.Items.Helmets.Helmets_str_int.Helmets_str_int();
            Crafting_Item item = new Crafting_Item(helmetBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = helmetBase.getNormalAllowedPrefixes();
            List<Modifier> suffixes = helmetBase.getNormalAllowedSuffixes();
            
            if (prefixes.size() >= 3 && suffixes.size() >= 2) {
                desiredMods.add(prefixes.get(0));  // Life
                desiredMods.add(prefixes.get(1));  // Defense
                desiredMods.add(prefixes.get(2));  // Another defense
                desiredMods.add(suffixes.get(0));  // Resistance
                desiredMods.add(suffixes.get(1));  // Another resistance
            }
            
            cases.add(new BenchmarkCase(
                "COMPLEX: Helmet - 5 Defensive Mods",
                BeamSearchConfig.ItemComplexity.COMPLEX,
                item,
                desiredMods,
                new ArrayList<>(),
                50.0,  // 50 seconds max
                5000   // Expected min score (5 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create complex helmet case: " + e.getMessage());
        }
    }
    
    /**
     * COMPLEX: Body Armor with 6 modifiers
     * Maximum defensive layers
     */
    private void addComplexBodyArmorCase() {
        try {
            core.Items.Body_Armours.Body_Armours_dex_int.Body_Armours_dex_int armorBase = 
                new core.Items.Body_Armours.Body_Armours_dex_int.Body_Armours_dex_int();
            Crafting_Item item = new Crafting_Item(armorBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = armorBase.getNormalAllowedPrefixes();
            List<Modifier> suffixes = armorBase.getNormalAllowedSuffixes();
            
            if (prefixes.size() >= 3 && suffixes.size() >= 3) {
                desiredMods.add(prefixes.get(0));  // Life
                desiredMods.add(prefixes.get(1));  // Defense type 1
                desiredMods.add(prefixes.get(2));  // Defense type 2
                desiredMods.add(suffixes.get(0));  // Resistance 1
                desiredMods.add(suffixes.get(1));  // Resistance 2
                desiredMods.add(suffixes.get(2));  // Resistance 3
            }
            
            cases.add(new BenchmarkCase(
                "COMPLEX: Body Armor - 6 Full Defense Mods",
                BeamSearchConfig.ItemComplexity.COMPLEX,
                item,
                desiredMods,
                new ArrayList<>(),
                60.0,  // 60 seconds max
                6000   // Expected min score (6 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create complex body armor case: " + e.getMessage());
        }
    }
    
    /**
     * COMPLEX: Weapon with 6 modifiers
     * Maximum offensive power
     */
    private void addComplexWeaponCase() {
        try {
            core.Items.Wands.Wands wandBase = new core.Items.Wands.Wands();
            Crafting_Item item = new Crafting_Item(wandBase);
            
            List<Modifier> desiredMods = new ArrayList<>();
            List<Modifier> prefixes = wandBase.getNormalAllowedPrefixes();
            List<Modifier> suffixes = wandBase.getNormalAllowedSuffixes();
            
            if (prefixes.size() >= 3 && suffixes.size() >= 3) {
                desiredMods.add(prefixes.get(0));  // Spell damage
                desiredMods.add(prefixes.get(1));  // Elemental damage
                desiredMods.add(prefixes.get(2));  // More damage
                desiredMods.add(suffixes.get(0));  // Crit or cast speed
                desiredMods.add(suffixes.get(1));  // Utility
                desiredMods.add(suffixes.get(2));  // More utility
            }
            
            cases.add(new BenchmarkCase(
                "COMPLEX: Wand - 6 Offensive Mods",
                BeamSearchConfig.ItemComplexity.COMPLEX,
                item,
                desiredMods,
                new ArrayList<>(),
                60.0,  // 60 seconds max
                6000   // Expected min score (6 * 1000)
            ));
        } catch (Exception e) {
            System.err.println("Failed to create complex weapon case: " + e.getMessage());
        }
    }
    
    /**
     * Runs all benchmark cases with the given configuration.    /**
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
