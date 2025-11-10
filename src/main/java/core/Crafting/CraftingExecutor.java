package core.Crafting;

import java.util.Map;
import java.util.List;
import java.util.concurrent.ExecutionException;

import core.Modifier_class.*;
import core.Crafting.Probability_Analyzer.*;

public class CraftingExecutor {

    public static List<CandidateProbability> runCrafting(
            Crafting_Item baseItem,
            List<Modifier> desiredMod,
            List<Modifier> undesiredMod
    ) throws InterruptedException, ExecutionException {

        // Run your crafting optimizer
        List<Crafting_Candidate> candidates = Crafting_Algorithm.optimizeCrafting(baseItem, desiredMod, undesiredMod);

        // Compute probabilities
        Probability.ComputingProbability(candidates, desiredMod, baseItem);

        // Analyze and sort best paths
        return Probability_Analyzer.Analyze(candidates);
    }

}