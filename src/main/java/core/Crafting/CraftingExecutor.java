package core.Crafting;

import java.util.List;
import java.util.concurrent.ExecutionException;

import core.Crafting.Proba.Probability;
import core.Crafting.Proba.Probability_Analyzer;
import core.Crafting.Proba.Probability_Analyzer.*;
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
    
        // Run the crafting optimizer to generate crafting candidates
        List<Crafting_Candidate> candidates = Crafting_Algorithm.optimizeCrafting(baseItem, desiredMod, undesiredMod, GLOBAL_THRESHOLD);

        // Compute probabilities for the generated crafting candidates
        Probability.ComputingProbability(candidates, desiredMod, baseItem);

        // Analyze and sort the best crafting paths based on probabilities
        return Probability_Analyzer.Analyze(candidates);
    }

}