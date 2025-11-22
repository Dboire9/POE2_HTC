package core.Crafting;

import java.util.List;
import java.util.concurrent.ExecutionException;

import core.Crafting.Probabilities.Probability;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Probabilities.Probability_Analyzer.*;
import core.Modifier_class.*;

/**
 * The {@code CraftingExecutor} class serves as the main entry point for executing
 * the crafting process. It optimizes crafting paths, computes probabilities for
 * crafting outcomes, and analyzes the best crafting paths based on the given
 * parameters.
 */
public class CraftingExecutor {

    /**
     * Executes the crafting process by optimizing crafting paths, computing
     * probabilities, and analyzing the best crafting outcomes.
     *
     * @param baseItem      The base crafting item to start the crafting process.
     * @param desiredMod    A list of desired modifiers to be included in the crafting result.
     * @param undesiredMod  A list of undesired modifiers to be avoided in the crafting result.
     * @param GLOBAL_THRESHOLD A global threshold value used to filter crafting paths.
     * @return A list of {@code CandidateProbability} objects representing the analyzed
     *         and sorted crafting paths with their associated probabilities.
     * @throws InterruptedException If the crafting process is interrupted.
     * @throws ExecutionException   If an error occurs during the execution of the crafting algorithm.
     */
    public static List<CandidateProbability> runCrafting(
            Crafting_Item baseItem,
            List<Modifier> desiredMod,
            List<Modifier> undesiredMod,
            double GLOBAL_THRESHOLD
    ) throws InterruptedException, ExecutionException {
    
        core.DebugLogger.debug("[CraftingExecutor] Starting runCrafting with threshold: " + (GLOBAL_THRESHOLD * 100) + "%");
        long startTime = System.currentTimeMillis();
        
        // Run the crafting optimizer to generate crafting candidates
        List<Crafting_Candidate> candidates = Crafting_Algorithm.optimizeCrafting(baseItem, desiredMod, undesiredMod, GLOBAL_THRESHOLD);
        core.DebugLogger.debug("[CraftingExecutor] Algorithm generated " + candidates.size() + " candidates");

        // Compute probabilities for the generated crafting candidates
        long probStartTime = System.currentTimeMillis();
        Probability.ComputingProbability(candidates, desiredMod, baseItem);
        core.DebugLogger.debug("[CraftingExecutor] Probability computation completed in " + (System.currentTimeMillis() - probStartTime) + "ms");

        // Analyze and sort the best crafting paths based on probabilities
        List<CandidateProbability> results = Probability_Analyzer.Analyze(candidates);
        
        core.DebugLogger.info("[CraftingExecutor] Completed: " + results.size() + " paths analyzed (" + (System.currentTimeMillis() - startTime) + "ms total)");
        
        // Log top 3 paths for debugging
        if (!results.isEmpty()) {
            core.DebugLogger.debug("[CraftingExecutor] Top paths:");
            for (int i = 0; i < Math.min(3, results.size()); i++) {
                core.DebugLogger.debug("  #" + (i+1) + ": " + results.get(i).finalPercentage() + "%");
            }
        }
        
        return results;
    }

}
