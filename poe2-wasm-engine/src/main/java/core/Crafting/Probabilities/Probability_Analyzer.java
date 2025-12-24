package core.Crafting.Probabilities;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Utils.ModifierEvent;

/**
 * The `Probability_Analyzer` class is responsible for analyzing crafting candidates
 * and determining the best crafting paths based on probabilities.
 */
public class Probability_Analyzer {

    /**
     * A record representing the probability analysis result for a crafting candidate.
     *
     * @param candidate The crafting candidate being analyzed.
     * @param bestPath A map representing the best crafting path with actions and their associated modifier events.
     * @param finalPercentage The final probability percentage of achieving the desired outcome.
     */
    public record CandidateProbability(
        Crafting_Candidate candidate,
        Map<Crafting_Action, ModifierEvent> bestPath,
        double finalPercentage
    ) {}

    /**
     * Analyzes a list of completed crafting paths and computes the best crafting paths
     * along with their probabilities.
     *
     * @param completedPaths A list of completed crafting candidates to analyze.
     * @return A list of `CandidateProbability` objects representing the analyzed crafting paths.
     */
    public static List<CandidateProbability> Analyze(List<Crafting_Candidate> completedPaths) {
        List<CandidateProbability> candidateProbabilities = new ArrayList<>();
    
        for (Crafting_Candidate candidate : completedPaths) {
            Map<Crafting_Action, ModifierEvent> BestPath = new LinkedHashMap<>();
    
            Map.Entry<Crafting_Action, Double> bestEventEntry = null;
            ModifierEvent bestModifierEvent = null;
            double bestPercentage = 0.0;
    
            for (ModifierEvent event : candidate.modifierHistory) {
                for (Map.Entry<Crafting_Action, Double> entry : event.source.entrySet()) {
                    double percentage = entry.getValue();
    
                    if (percentage == 2) // Temporary fix for invalid percentage values
                        entry.setValue(1.0);
    
                    if (percentage >= bestPercentage) {
                        bestPercentage = percentage;
                        bestEventEntry = entry;
                        bestModifierEvent = event;
                    }
                }
    
                if (bestEventEntry != null && bestModifierEvent != null) {
                    BestPath.put(bestEventEntry.getKey(), bestModifierEvent);
                }
    
                bestPercentage = 0;
                bestEventEntry = null;
                bestModifierEvent = null;
            }
    
            double finalPercentage = 1.0;
            for (Map.Entry<Crafting_Action, ModifierEvent> entry : BestPath.entrySet()) {
                Crafting_Action action = entry.getKey();
                ModifierEvent event = entry.getValue();
                
                // Get the probability for the specific action that was chosen as best
                Double probability = event.source.get(action);
                if (probability != null && probability != 0.0) {
                    finalPercentage *= probability;
                }
            }
            finalPercentage *= 100; // Convert to percentage
    
            candidateProbabilities.add(
                new CandidateProbability(candidate, BestPath, finalPercentage)
            );
        }
    
        // Sort candidates by their final probability in descending order
        candidateProbabilities.sort((a, b) -> Double.compare(b.finalPercentage(), a.finalPercentage()));
    
        return candidateProbabilities;
    }
    
    /**
     * A simple helper class representing a pair of two values.
     *
     * @param <F> The type of the first value.
     * @param <S> The type of the second value.
     */
    public static class Pair<F, S> {
        public F first;
        public S second;

        /**
         * Constructs a new `Pair` with the given values.
         *
         * @param first The first value.
         * @param second The second value.
         */
        public Pair(F first, S second) {
            this.first = first;
            this.second = second;
        }
    }
}
