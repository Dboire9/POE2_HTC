package core.Crafting;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import core.Crafting.Utils.ModifierEvent;

public class Probability_Analyzer {

	public record CandidateProbability(
    Crafting_Candidate candidate,
    Map<Crafting_Action, Double> bestPath,
    double finalPercentage
	) {}

	public static List<CandidateProbability> Analyze(List<Crafting_Candidate> completedPaths) {
		List<CandidateProbability> candidateProbabilities = new ArrayList<>();

		for (Crafting_Candidate candidate : completedPaths) {
			Map<Crafting_Action, Double> BestPath = new LinkedHashMap<>();
			Map.Entry<Crafting_Action, Double> bestEvent = null;
			double bestPercentage = 0.0;

			for (ModifierEvent event : candidate.modifierHistory) {
				for (Map.Entry<Crafting_Action, Double> entry : event.source.entrySet())
				{
					double percentage = entry.getValue();

					if (percentage >= bestPercentage)
					{
						bestPercentage = percentage;
						bestEvent = entry;
					}
				}

				if (bestEvent != null) {
					BestPath.put(bestEvent.getKey(), bestEvent.getValue());
				}

				bestPercentage = 0;
				bestEvent = null;
			}

			double finalPercentage = 1.0;
			for (double percentage : BestPath.values()) {
				if (percentage != 0.0) {
					finalPercentage *= percentage;
				}
			}
			finalPercentage *= 100; // convert to %

			candidateProbabilities.add(new CandidateProbability(candidate, BestPath, finalPercentage));
		}

		// Sort by final percentage descending
		candidateProbabilities.sort((a, b) -> Double.compare(b.finalPercentage(), a.finalPercentage()));

		return candidateProbabilities;
	}

	// Simple helper class for pairs
	public static class Pair<F, S> {
		public F first;
		public S second;
		public Pair(F first, S second) {
			this.first = first;
			this.second = second;
		}
	}
	
}
