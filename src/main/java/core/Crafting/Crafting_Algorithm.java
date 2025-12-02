package core.Crafting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import core.Crafting.Probabilities.ComputingLastProbability;
import core.Crafting.Probabilities.Probability;
import core.Crafting.Utils.Heuristic_Util;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;
import core.Currency.AnnulmentOrb;
import core.Currency.AugmentationOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Currency.TransmutationOrb;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

/**
 * The Crafting_Algorithm class provides methods to optimize crafting
 * processes for a given base item and desired/undesired modifiers.
 */
public class Crafting_Algorithm {

	/**
	 * Optimizes the crafting process for a given base item and desired/undesired
	 * modifiers.
	 *
	 * @param baseItem         The base item to be crafted.
	 * @param desiredMods      A list of desired modifiers to aim for.
	 * @param undesiredMods    A list of undesired modifiers to avoid.
	 * @param GLOBAL_THRESHOLD The global threshold for crafting optimization.
	 * @return A list of optimized crafting candidates.
	 * @throws InterruptedException If the thread execution is interrupted.
	 * @throws ExecutionException   If an error occurs during thread execution.
	 */
	public static List<Crafting_Candidate> optimizeCrafting(
			Crafting_Item baseItem,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			double GLOBAL_THRESHOLD,
			boolean AnnulmentAllowed,
			List<Map<String, String>> excludedCurrencies) throws InterruptedException, ExecutionException {
		// Initialize thread pool - limit to 2 threads to avoid CPU overload on 2-core systems
		int threads = Math.min(2, Runtime.getRuntime().availableProcessors());
		ExecutorService executor = Executors.newFixedThreadPool(threads);

		// Precompute desired tag counts
		Map<String, Integer> tagCount = Heuristic_Util.CreateCountModifierTags(desiredMods);

		List<Crafting_Candidate> transmuteCandidates = new ArrayList<>();
		// Base candidate lists
		List<Crafting_Candidate> augmentCandidates = new ArrayList<>();
		List<Crafting_Candidate> baseCopies = new ArrayList<>();
		List<List<Crafting_Candidate>> allCandidateLists = new ArrayList<>();

		// Base item has existing modifiers
		if (baseItem.getAllCurrentModifiers().size() == 0 && baseItem.rarity != Crafting_Item.ItemRarity.RARE) {
			// Step 1: Transmutation
			TransmutationOrb transmute = new TransmutationOrb();
			transmuteCandidates = transmute.apply(baseItem, transmuteCandidates, desiredMods, tagCount, undesiredMods);
			allCandidateLists.add(new ArrayList<>(transmuteCandidates));
			copyCandidates(transmuteCandidates, baseCopies);
			Probability.ComputingProbability(transmuteCandidates, desiredMods, baseItem, excludedCurrencies);

			// Step 2: Augmentation
			AugmentationOrb augment = new AugmentationOrb();
			transmuteCandidates = augment.apply(baseItem, transmuteCandidates, desiredMods, tagCount, undesiredMods);
			allCandidateLists.add(new ArrayList<>(transmuteCandidates));
			copyCandidates(transmuteCandidates, augmentCandidates);
			Probability.ComputingProbability(augmentCandidates, desiredMods, baseItem, excludedCurrencies);

			// Step 3: Apply regal and essence to base candidates
			generateCandidateLists(baseItem, baseCopies, desiredMods, tagCount, allCandidateLists, undesiredMods);
			copyCandidates(transmuteCandidates, baseCopies);
			generateCandidateLists(baseItem, augmentCandidates, desiredMods, tagCount, allCandidateLists,
					undesiredMods);

			// Skip first two lists (transmute and augment)
			if (allCandidateLists.size() > 2)
				allCandidateLists.subList(0, 2).clear();
		} else {
			// Item already has existing modifiers (from user selection)
			// Initialize with a single candidate representing the current item state

			// Calculate initial score: only count existing mods that are ALSO desired mods
			double initialScore = 0;
			List<Modifier> currentMods = baseItem.getAllCurrentModifiers();

			// Use the same scoring logic as the heuristic function
			for (Modifier currentMod : currentMods) {
				for (Modifier desiredMod : desiredMods) {
					if (currentMod.text.equals(desiredMod.text)) {
						// This existing mod matches a desired mod
						initialScore += 1000; // Standard score per matching desired mod
						break;
					}
				}
			}

			// Create initial candidate with a dummy action (just for initialization)
			ExaltedOrb dummyAction = new ExaltedOrb();
			Crafting_Candidate initialCandidate = new Crafting_Candidate(baseItem, initialScore, dummyAction);

			// Clear the dummy action from the candidate's actions list
			initialCandidate.actions.clear();

			// Add to candidate lists so the algorithm can start processing
			transmuteCandidates.add(initialCandidate);
			allCandidateLists.add(new ArrayList<>(Arrays.asList(initialCandidate)));
		} // Step 4: Iterative refinement loop
		List<List<Crafting_Candidate>> current = deepCopy(allCandidateLists);
		List<List<Crafting_Candidate>> next = new ArrayList<>();

		// Perform two initial passes
		for (int i = 0; i < 2; i++) {
			processCandidateLists(baseItem, current, desiredMods, undesiredMods, tagCount, GLOBAL_THRESHOLD,
					allCandidateLists, next, executor, AnnulmentAllowed, excludedCurrencies);
			current.clear(); // Clear old lists to free memory
			current = deepCopy(next);
			next.clear();
		}

		// Continue processing until we do not find anymore candidates
		int iterationCount = 0;
		int maxIterations = 100; // Safety limit to prevent infinite loops
		while (!current.isEmpty() && iterationCount < maxIterations) {
			iterationCount++;
			processCandidateLists(baseItem, current, desiredMods, undesiredMods, tagCount, GLOBAL_THRESHOLD,
					allCandidateLists, next, executor, AnnulmentAllowed, excludedCurrencies);
			current.clear(); // Clear old lists to free memory
			current = deepCopy(next);
			next.clear();
		}

		// Shutdown thread pool
		executor.shutdown();
		executor.awaitTermination(1, TimeUnit.MINUTES);

		// Clear temporary lists to free memory
		transmuteCandidates.clear();
		augmentCandidates.clear();
		baseCopies.clear();
		current.clear();
		next.clear();

		// Final filtering
		List<Crafting_Candidate> finalCandidates = extractHighScoreCandidates(allCandidateLists, desiredMods);
		
		// Clear all candidate lists after extraction to free memory
		allCandidateLists.clear();
		
		return finalCandidates;
	}

	/**
	 * Optimizes the crafting process for items that already have existing
	 * modifiers.
	 * 
	 * @param baseItem                  The base item with existing modifiers
	 *                                  already applied.
	 * @param desiredMods               A list of desired modifiers to add to the
	 *                                  item.
	 * @param undesiredMods             A list of undesired modifiers to avoid.
	 * @param GLOBAL_THRESHOLD          The global threshold for crafting
	 *                                  optimization.
	 * @param userSpecifiedExistingMods The modifiers the user said they have on the
	 *                                  item (from frontend).
	 * @return A list of optimized crafting candidates.
	 * @throws InterruptedException If the thread execution is interrupted.
	 * @throws ExecutionException   If an error occurs during thread execution.
	 */
	public static List<Crafting_Candidate> optimizeCraftingWithExistingMods(
			Crafting_Item baseItem,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			double GLOBAL_THRESHOLD,
			List<Modifier> userSpecifiedExistingMods,
			boolean AnnulmentAllowed,
			List<Map<String, String>> excludedCurrencies) throws InterruptedException, ExecutionException {

		// DO NOT modify baseItem here! ServerMain already applied the existing mods.
		// We just need to add them to desiredMods so the algorithm knows to keep them.

		// Add user-specified existing mods to desiredMods so algorithm treats them as
		// required
		if(desiredMods.size() != 6)
			for (Modifier mod : userSpecifiedExistingMods) {
				desiredMods.add(mod);
			}

		return optimizeCrafting(baseItem, desiredMods, undesiredMods, GLOBAL_THRESHOLD, AnnulmentAllowed, excludedCurrencies);
	}

	/**
	 * Processes candidate lists to refine crafting results.
	 *
	 * @param baseItem        The base item being crafted.
	 * @param currentLists    The current lists of crafting candidates.
	 * @param desiredMods     The desired modifiers.
	 * @param undesiredMods   The undesired modifiers.
	 * @param tagCount        The precomputed tag counts for desired modifiers.
	 * @param globalThreshold The global threshold for crafting optimization.
	 * @param masterList      The master list of all candidates.
	 * @param nextLists       The next iteration of candidate lists.
	 * @param executor        The thread pool executor.
	 * @throws InterruptedException If the thread execution is interrupted.
	 * @throws ExecutionException   If an error occurs during thread execution.
	 */
	private static void processCandidateLists(
			Crafting_Item baseItem,
			List<List<Crafting_Candidate>> currentLists,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			Map<String, Integer> tagCount,
			double globalThreshold,
			List<List<Crafting_Candidate>> masterList,
			List<List<Crafting_Candidate>> nextLists,
			ExecutorService executor,
			boolean AnnulmentAllowed,
			List<Map<String, String>> excludedCurrencies) throws InterruptedException, ExecutionException {

		for (List<Crafting_Candidate> candidates : currentLists) {
			if (candidates.isEmpty())
				continue;

		ComputingLastProbability.ComputingLastEventProbability(candidates, desiredMods, baseItem, globalThreshold);

		Probability.ComputingProbability(candidates, desiredMods, baseItem, excludedCurrencies);
		
		if(!candidates.isEmpty())
{			int targetScore = candidates.get(0).getAllCurrentModifiers().size() * 1000;			// For 6-mod crafting, keep more candidates to ensure paths can be completed
				// Keep all candidates with >= 50% of target score, plus top candidates by score
				int minScore = (int)(targetScore * 0.5);
				int keepCount = desiredMods.size() >= 6 ? 30 : 20; // Keep more for 6-mod
				
				List<Crafting_Candidate> filteredCandidates = candidates.stream()
						.filter(c -> c.score >= minScore)
						.sorted((c1, c2) -> {
							// Primary sort by score (higher is better)
							int scoreCompare = Double.compare(c2.score, c1.score);
							if (scoreCompare != 0) return scoreCompare;
							// Secondary sort by percentage if scores are equal
							return Double.compare(c2.percentage, c1.percentage);
						})
						.limit(keepCount)
						.collect(java.util.stream.Collectors.toList());
				
				RareLoop(baseItem, filteredCandidates, desiredMods, undesiredMods, tagCount, masterList, nextLists, executor,
						AnnulmentAllowed);}
		}
	}

	/**
	 * Extracts high-score crafting candidates from all candidate lists.
	 *
	 * @param allCandidateLists The list of all crafting candidates.
	 * @param desiredMods       The desired modifiers.
	 * @return A list of high-score crafting candidates.
	 */
	private static List<Crafting_Candidate> extractHighScoreCandidates(
			List<List<Crafting_Candidate>> allCandidateLists, List<Modifier> desiredMods) {

		List<Crafting_Candidate> result = new ArrayList<>();
		
		// Calculate minimum score based on number of desired mods (1000 points per mod)
		int minScore = desiredMods.size() * 1000;
		
		for (List<Crafting_Candidate> list : allCandidateLists) {
			for (Crafting_Candidate candidate : list) {
				candidate.desecrated = false;

				if (candidate.score != minScore) {
					continue;
				}

				List<Modifier> current = candidate.getAllCurrentModifiers();
				// Removed check for current.size() < 6 to allow fewer mods
				
				long matchCount = current.stream()
						.filter(m -> desiredMods.stream().anyMatch(d -> d.text.equals(m.text)))
						.count();
				
				// Accept if all desired mods are matched (not necessarily 6)
				if (matchCount == desiredMods.size()) {
					result.add(candidate);
				}
			}
		}

		// Sort for deterministic ordering
		result.sort((c1, c2) -> {
			int scoreCompare = Double.compare(c2.score, c1.score);
			if (scoreCompare != 0)
				return scoreCompare;

			// Secondary sort by history size for consistency
			return Integer.compare(c1.modifierHistory.size(), c2.modifierHistory.size());
		});

		return result;
	}

	/**
	 * Calculates the heuristic score for a crafting item based on desired and
	 * undesired modifiers.
	 *
	 * @param item                     The crafting item being evaluated.
	 * @param desiredMods              A list of desired modifiers.
	 * @param CountDesiredModifierTags A map of desired modifier tags and their
	 *                                 counts.
	 * @param undesiredMods            A list of undesired modifiers.
	 * @return The heuristic score for the crafting item.
	 */
	public static double heuristic(Crafting_Item item, List<Modifier> desiredMods,
			Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
		double score = 0;
		double scorePrefix = 0;
		double scoreSuffix = 0;
		List<Modifier> PrefixCurrentMods = item.getAllCurrentPrefixModifiers();
		List<Modifier> SuffixCurrentMods = item.getAllCurrentSuffixModifiers();

		ModifierEvent lastEvent = item.modifierHistory.get(item.modifierHistory.size() - 1);

		// Calculating score by checking if we have the modifiers we want
		scorePrefix += Heuristic_Util.calculateAffixScore(PrefixCurrentMods, desiredMods, CountDesiredModifierTags);
		// We want to put the last ADDED modifier in the list
		// It will only add modifiers from the first batch of transmutes, becauses when
		// the score goes up it will never go back to 0.
		// It is okay because we throw tags that are not desired or never will have
		// common tags with the ones we want (It may be a flaw?)
		if (lastEvent.modifier.type == ModifierType.PREFIX
				&& lastEvent.type == ModifierEvent.ActionType.ADDED
				&& scorePrefix == 0
				&& (undesiredMods == null || !undesiredMods.contains(lastEvent.modifier)))
			undesiredMods.add(lastEvent.modifier);

		// Handle SUFFIX
		scoreSuffix += Heuristic_Util.calculateAffixScore(SuffixCurrentMods, desiredMods, CountDesiredModifierTags);

		if (lastEvent.modifier.type == ModifierType.SUFFIX
				&& lastEvent.type == ModifierEvent.ActionType.ADDED
				&& scoreSuffix == 0
				&& (undesiredMods == null || !undesiredMods.contains(lastEvent.modifier)))
			undesiredMods.add(lastEvent.modifier);

		score += scorePrefix + scoreSuffix;

		return score;
	}

	/**
	 * Generates candidate lists for crafting by applying a RegalOrb to the base
	 * item.
	 *
	 * @param baseItem                 The base crafting item.
	 * @param FirstCandidateList       The initial list of crafting candidates.
	 * @param desiredMods              A list of desired modifiers.
	 * @param CountDesiredModifierTags A map of desired modifier tags and their
	 *                                 counts.
	 * @param listOfCandidateLists     A list to store generated candidate lists.
	 * @param undesiredMods            A list of undesired modifiers.
	 */
	private static void generateCandidateLists(
			Crafting_Item baseItem,
			List<Crafting_Candidate> FirstCandidateList,
			List<Modifier> desiredMods,
			Map<String, Integer> CountDesiredModifierTags,
			List<List<Crafting_Candidate>> listOfCandidateLists,
			List<Modifier> undesiredMods) {
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();

		// Applying a normal RegalOrb
		RegalOrb regalOrb = new RegalOrb();
		FirstCandidateListCopy = regalOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
				undesiredMods);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	}

	/**
	 * Executes a crafting loop for rare items, applying various crafting orbs
	 * concurrently.
	 *
	 * @param baseItem                   The base crafting item.
	 * @param FirstCandidateList         The initial list of crafting candidates.
	 * @param desiredMods                A list of desired modifiers.
	 * @param undesiredMods              A list of undesired modifiers.
	 * @param CountDesiredModifierTags   A map of desired modifier tags and their
	 *                                   counts.
	 * @param listOfCandidateLists       A list to store generated candidate lists.
	 * @param listOfCandidateLists_exalt A list to store exalted candidate lists.
	 * @param executor                   The executor service for running tasks
	 *                                   concurrently.
	 * @throws InterruptedException If the thread is interrupted while waiting for
	 *                              tasks to complete.
	 * @throws ExecutionException   If a task execution throws an exception.
	 */
	private static void RareLoop(
			Crafting_Item baseItem,
			List<Crafting_Candidate> FirstCandidateList,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			Map<String, Integer> CountDesiredModifierTags,
			List<List<Crafting_Candidate>> listOfCandidateLists,
			List<List<Crafting_Candidate>> listOfCandidateLists_exalt,
			ExecutorService executor,
			boolean AnnulmentAllowed) throws InterruptedException, ExecutionException {
		// Task 1: Apply an Exalted Orb if the first candidate has less than 6 modifiers
		Callable<List<Crafting_Candidate>> task1 = () -> {
			if (!FirstCandidateList.isEmpty() && FirstCandidateList.get(0).getAllCurrentModifiers().size() < 6) {
				ExaltedOrb exalt = new ExaltedOrb();
				return exalt.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, undesiredMods);
			}
			return new ArrayList<>();
		};

		// Task 2: Apply Desecrated Currency if the first candidate is not desecrated
		// and has less than 6 modifiers
		Callable<List<Crafting_Candidate>> task2 = () -> {
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).desecrated
					&& FirstCandidateList.get(0).getAllCurrentModifiers().size() < 6) {
				Desecrated_currency des_currency = new Desecrated_currency();
				return des_currency.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
						undesiredMods);
			}
			return new ArrayList<>();
		};

		// Task 3: Apply an Annulment Orb if the last two modifier events meet specific
		// conditions (The last two actions were ADDED)
		Callable<List<Crafting_Candidate>> task3 = () -> {
			// We need to REDO this section it is so ugly
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).modifierHistory.isEmpty()
					&& AnnulmentAllowed) {
				int historySize = FirstCandidateList.get(0).modifierHistory.size();
				// Need at least 2 events in history to check last two
				if (historySize >= 2) {
					ModifierEvent lastEvent = FirstCandidateList.get(0).modifierHistory
							.get(historySize - 1);
					ModifierEvent lastlastEvent = FirstCandidateList.get(0).modifierHistory
							.get(historySize - 2);
					if (lastEvent.type != ActionType.REMOVED && !FirstCandidateList.get(0).stopAnnul
							&& isExaltorRegalorDes(lastEvent, lastlastEvent)) {
						AnnulmentOrb annul = new AnnulmentOrb();
						return annul.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
								undesiredMods);
					}
				}
			}
			return new ArrayList<>();
		};

		// Task 4: Apply Essence Currency
		Callable<List<Crafting_Candidate>> task4 = () -> {
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).modifierHistory.isEmpty() && FirstCandidateList.get(0).getAllCurrentModifiers().size() > 2) {
				// ModifierEvent lastEvent =
				// FirstCandidateList.get(0).modifierHistory.get(FirstCandidateList.get(0).modifierHistory.size()
				// - 1);
				Essence_currency essence_currency = new Essence_currency();
				return essence_currency.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
						undesiredMods);
			}
			return new ArrayList<>();
		};

		// Run all tasks concurrently
		List<Callable<List<Crafting_Candidate>>> tasks = Arrays.asList(task1, task2, task3, task4);
		List<Future<List<Crafting_Candidate>>> results = executor.invokeAll(tasks);

		// Collect all results
		List<Crafting_Candidate> result1 = results.get(0).get();
		List<Crafting_Candidate> result2 = results.get(1).get();
		List<Crafting_Candidate> result3 = results.get(2).get();
		List<Crafting_Candidate> result4 = results.get(3).get();

		synchronized (listOfCandidateLists) {
			if (!result1.isEmpty())
				listOfCandidateLists.add(new ArrayList<>(result1));
			if (!result2.isEmpty())
				listOfCandidateLists.add(new ArrayList<>(result2));
			if (!result3.isEmpty())
				listOfCandidateLists.add(new ArrayList<>(result3));
			if (!result4.isEmpty())
				listOfCandidateLists.add(new ArrayList<>(result4));
		}

		synchronized (listOfCandidateLists_exalt) {
			if (!result1.isEmpty())
				listOfCandidateLists_exalt.add(new ArrayList<>(result1));
			if (!result2.isEmpty())
				listOfCandidateLists_exalt.add(new ArrayList<>(result2));
			if (!result3.isEmpty())
				listOfCandidateLists_exalt.add(new ArrayList<>(result3));
			if (!result4.isEmpty())
				listOfCandidateLists_exalt.add(new ArrayList<>(result4));
		}
	}

	/**
	 * Checks if the last two modifier events were applied by specific crafting orbs
	 * (Regal, Exalted, or Desecrated).
	 * This ensures that an Annulment Orb is not applied immediately after an
	 * Exalted Orb, Regal Orb, or Desecrated Currency.
	 *
	 * @param lastEvent     The most recent modifier event.
	 * @param lastlastEvent The second most recent modifier event.
	 * @return true if both events were applied by RegalOrb, ExaltedOrb, or
	 *         Desecrated_currency; false otherwise.
	 */
	private static boolean isExaltorRegalorDes(ModifierEvent lastEvent, ModifierEvent lastlastEvent) {

		// TO REDO
		if (lastEvent == null || lastEvent.source == null || lastlastEvent == null || lastlastEvent.source == null)
			return false;

		// Only proceed if the action before was not a removal
		if (lastEvent.type == ModifierEvent.ActionType.REMOVED)
			return false;

		// Check if the last two were homog or regals, else it can annul an exalt that
		// was just applied
		if (lastEvent.source instanceof RegalOrb || lastEvent.source instanceof ExaltedOrb
				|| lastEvent.source instanceof Desecrated_currency)
			if (lastlastEvent.source instanceof RegalOrb || lastlastEvent.source instanceof ExaltedOrb
					|| lastlastEvent.source instanceof Desecrated_currency)
				return true;

		return false;
	}

	/**
	 * Copies a list of crafting candidates from the source list to the destination
	 * list.
	 * Each candidate is deep-copied to ensure no shared references between the two
	 * lists.
	 *
	 * @param source      The source list of crafting candidates.
	 * @param destination The destination list where the copied candidates will be
	 *                    added.
	 */
	private static void copyCandidates(List<Crafting_Candidate> source, List<Crafting_Candidate> destination) {
		for (Crafting_Candidate candidate : source) {
			destination.add(candidate.copy());
		}
	}

	/**
	 * Creates a deep copy of a list of lists of crafting candidates.
	 * Each inner list and its elements are copied to ensure no shared references
	 * with the original structure.
	 *
	 * @param original The original list of lists of crafting candidates to be
	 *                 copied.
	 * @return A new list of lists containing deep copies of the original crafting
	 *         candidates.
	 */
	private static List<List<Crafting_Candidate>> deepCopy(List<List<Crafting_Candidate>> original) {
		List<List<Crafting_Candidate>> copy = new ArrayList<>();
		for (List<Crafting_Candidate> inner : original) {
			copy.add(new ArrayList<>(inner));
		}
		return copy;
	}
}
