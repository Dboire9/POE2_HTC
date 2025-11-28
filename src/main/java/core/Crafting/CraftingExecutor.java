package core.Crafting;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import core.Crafting.Probabilities.Probability;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Probabilities.Probability_Analyzer.*;
import core.Modifier_class.*;

/**
 * The {@code CraftingExecutor} class serves as the main entry point for
 * executing
 * the crafting process. It optimizes crafting paths, computes probabilities for
 * crafting outcomes, and analyzes the best crafting paths based on the given
 * parameters.
 */
public class CraftingExecutor {

	/**
	 * Executes the crafting process by optimizing crafting paths, computing
	 * probabilities, and analyzing the best crafting outcomes.
	 *
	 * @param baseItem           The base crafting item to start the crafting
	 *                           process.
	 * @param desiredMod         A list of desired modifiers to be included in the
	 *                           crafting result.
	 * @param undesiredMod       A list of undesired modifiers to be avoided in the
	 *                           crafting result.
	 * @param GLOBAL_THRESHOLD   A global threshold value used to filter crafting
	 *                           paths.
	 * @param excludedCurrencies A list of currency exclusions (maps with "currency"
	 *                           and optional "tier" keys).
	 * @return A list of {@code CandidateProbability} objects representing the
	 *         analyzed
	 *         and sorted crafting paths with their associated probabilities.
	 * @throws InterruptedException If the crafting process is interrupted.
	 * @throws ExecutionException   If an error occurs during the execution of the
	 *                              crafting algorithm.
	 */
	public static List<CandidateProbability> runCrafting(
			Crafting_Item baseItem,
			List<Modifier> desiredMod,
			List<Modifier> undesiredMod,
			double GLOBAL_THRESHOLD,
			List<Map<String, String>> excludedCurrencies) throws InterruptedException, ExecutionException {
		// Run the crafting optimizer to generate crafting candidates

		boolean AnnulmentAllowed = true;
		if (excludedCurrencies.stream().noneMatch(map -> "AnnulmentOrb".equals(map.get("currency")))) {
			AnnulmentAllowed = false;
		}
		List<Crafting_Candidate> candidates = Crafting_Algorithm.optimizeCrafting(baseItem, desiredMod, undesiredMod,
				GLOBAL_THRESHOLD, AnnulmentAllowed);

		// Compute probabilities for the generated crafting candidates
		Probability.ComputingProbability(candidates, desiredMod, baseItem, excludedCurrencies);

		// Analyze and sort the best crafting paths based on probabilities
		List<CandidateProbability> results = Probability_Analyzer.Analyze(candidates);

		return results;
	}

	/**
	 * Executes the crafting process for items that already have existing modifiers.
	 * This method adapts the crafting logic to account for modifiers already
	 * present
	 * on the item, optimizing the path to add the desired modifiers.
	 *
	 * @param baseItem                  The base crafting item with existing
	 *                                  modifiers already applied.
	 * @param desiredMod                A list of desired modifiers to be added to
	 *                                  the item.
	 * @param undesiredMod              A list of undesired modifiers to be avoided
	 *                                  in the crafting result.
	 * @param GLOBAL_THRESHOLD          A global threshold value used to filter
	 *                                  crafting paths.
	 * @param userSpecifiedExistingMods The modifiers the user specified they have
	 *                                  on the item (from frontend).
	 * @param excludedCurrencies        A list of currency exclusions (maps with
	 *                                  "currency" and optional "tier" keys).
	 * @return A list of {@code CandidateProbability} objects representing the
	 *         analyzed
	 *         and sorted crafting paths with their associated probabilities.
	 * @throws InterruptedException If the crafting process is interrupted.
	 * @throws ExecutionException   If an error occurs during the execution of the
	 *                              crafting algorithm.
	 */
	public static List<CandidateProbability> runCraftingWithExistingMods(
			Crafting_Item baseItem,
			List<Modifier> desiredMod,
			List<Modifier> undesiredMod,
			double GLOBAL_THRESHOLD,
			List<Modifier> userSpecifiedExistingMods,
			List<Map<String, String>> excludedCurrencies) throws InterruptedException, ExecutionException {

		boolean AnnulmentAllowed = true;
		if (excludedCurrencies.stream().noneMatch(map -> "AnnulmentOrb".equals(map.get("currency")))) {
			AnnulmentAllowed = false;
		}

		List<Crafting_Candidate> candidates = Crafting_Algorithm.optimizeCraftingWithExistingMods(
				baseItem,
				desiredMod,
				undesiredMod,
				GLOBAL_THRESHOLD,
				userSpecifiedExistingMods,
				AnnulmentAllowed);

		// Compute probabilities for the generated crafting candidates
		Probability.ComputingProbability(candidates, desiredMod, baseItem, excludedCurrencies);

		// Analyze and sort the best crafting paths based on probabilities
		List<CandidateProbability> results = Probability_Analyzer.Analyze(candidates);

		return results;
	}

}
