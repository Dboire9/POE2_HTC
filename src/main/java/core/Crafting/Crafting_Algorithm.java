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

public class Crafting_Algorithm {
	public static List<Crafting_Candidate> optimizeCrafting(
        Crafting_Item baseItem,
        List<Modifier> desiredMods,
        List<Modifier> undesiredMods,
        double GLOBAL_THRESHOLD) throws InterruptedException, ExecutionException
		{

			// Initialize thread pool
			int threads = Math.max(1, Runtime.getRuntime().availableProcessors() - 2);
			ExecutorService executor = Executors.newFixedThreadPool(threads);

			// Precompute desired tag counts
			Map<String, Integer> tagCount = Heuristic_Util.CreateCountModifierTags(desiredMods);

			// Base candidate lists
			List<Crafting_Candidate> transmuteCandidates = new ArrayList<>();
			List<Crafting_Candidate> augmentCandidates = new ArrayList<>();
			List<Crafting_Candidate> baseCopies = new ArrayList<>();
			List<List<Crafting_Candidate>> allCandidateLists = new ArrayList<>();

			// Step 1: Transmutation
			TransmutationOrb transmute = new TransmutationOrb();
			transmuteCandidates = transmute.apply(baseItem, transmuteCandidates, desiredMods, tagCount, undesiredMods);
			allCandidateLists.add(new ArrayList<>(transmuteCandidates));
			copyCandidates(transmuteCandidates, baseCopies);

			// Step 2: Augmentation
			AugmentationOrb augment = new AugmentationOrb();
			transmuteCandidates = augment.apply(baseItem, transmuteCandidates, desiredMods, tagCount, undesiredMods);
			allCandidateLists.add(new ArrayList<>(transmuteCandidates));
			copyCandidates(transmuteCandidates, augmentCandidates);

			// Step 3: Apply regal and essence to base candidates
			generateCandidateLists(baseItem, baseCopies, desiredMods, tagCount, allCandidateLists, undesiredMods);
			copyCandidates(transmuteCandidates, baseCopies);
			generateCandidateLists(baseItem, augmentCandidates, desiredMods, tagCount, allCandidateLists, undesiredMods);

			// Skip first two lists (transmute and augment)
			if (allCandidateLists.size() > 2)
				allCandidateLists.subList(0, 2).clear();

			// Step 4: Iterative refinement loop
			List<List<Crafting_Candidate>> current = deepCopy(allCandidateLists);
			List<List<Crafting_Candidate>> next = new ArrayList<>();

			// Perform two initial passes
			for (int i = 0; i < 2; i++) {
				processCandidateLists(baseItem, current, desiredMods, undesiredMods, tagCount, GLOBAL_THRESHOLD,
						allCandidateLists, next, executor);
				current = deepCopy(next);
				next.clear();
			}

			// Continue processing until stabilization
			while (!current.isEmpty()) {
				processCandidateLists(baseItem, current, desiredMods, undesiredMods, tagCount, GLOBAL_THRESHOLD,
						allCandidateLists, next, executor);
				current = deepCopy(next);
				next.clear();
			}

			// Shutdown thread pool
			executor.shutdown();
			executor.awaitTermination(1, TimeUnit.MINUTES);

			// Final filtering
			return extractHighScoreCandidates(allCandidateLists, desiredMods);
	}
	
	private static void processCandidateLists(
			Crafting_Item baseItem,
			List<List<Crafting_Candidate>> currentLists,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			Map<String, Integer> tagCount,
			double globalThreshold,
			List<List<Crafting_Candidate>> masterList,
			List<List<Crafting_Candidate>> nextLists,
			ExecutorService executor) throws InterruptedException, ExecutionException {
	
		for (List<Crafting_Candidate> candidates : currentLists) {
			if (candidates.isEmpty()) continue;
	
			ComputingLastProbability.ComputingLastEventProbability(candidates, desiredMods, baseItem, globalThreshold);
			RareLoop(baseItem, candidates, desiredMods, undesiredMods, tagCount, masterList, nextLists, executor);
		}
	}
	
	private static List<Crafting_Candidate> extractHighScoreCandidates(
			List<List<Crafting_Candidate>> allCandidateLists, List<Modifier> desiredMods) {
	
		List<Crafting_Candidate> result = new ArrayList<>();
	
		for (List<Crafting_Candidate> list : allCandidateLists) {
			for (Crafting_Candidate candidate : list) {
				candidate.desecrated = false;
	
				if (candidate.score < 6000) continue;
	
				List<Modifier> current = candidate.getAllCurrentModifiers();
				if (current.size() < 6) continue;
	
				long matchCount = current.stream()
						.filter(m -> desiredMods.stream().anyMatch(d -> d.text.equals(m.text)))
						.count();
	
				if (matchCount == 6) result.add(candidate);
			}
		}
		return result;
	}
	

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

	private static void generateCandidateLists(
			Crafting_Item baseItem,
			List<Crafting_Candidate> FirstCandidateList,
			List<Modifier> desiredMods,
			Map<String, Integer> CountDesiredModifierTags,
			List<List<Crafting_Candidate>> listOfCandidateLists,
			List<Modifier> undesiredMods) {
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();

		// Not doing essences as regal can do every of them, we will check if they can
		// be essences later

		// Applying a normal RegalOrb
		RegalOrb regalOrb = new RegalOrb();
		FirstCandidateListCopy = regalOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
				undesiredMods);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	}

	private static void RareLoop(
			Crafting_Item baseItem,
			List<Crafting_Candidate> FirstCandidateList,
			List<Modifier> desiredMods,
			List<Modifier> undesiredMods,
			Map<String, Integer> CountDesiredModifierTags,
			List<List<Crafting_Candidate>> listOfCandidateLists,
			List<List<Crafting_Candidate>> listOfCandidateLists_exalt,
			ExecutorService executor) throws InterruptedException, ExecutionException {
		Callable<List<Crafting_Candidate>> task1 = () -> {
			if (!FirstCandidateList.isEmpty() && FirstCandidateList.get(0).getAllCurrentModifiers().size() < 6) {
				ExaltedOrb exalt = new ExaltedOrb();
				return exalt.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, undesiredMods);
			}
			return new ArrayList<>();
		};

		Callable<List<Crafting_Candidate>> task2 = () -> {
			// Checking if it is not already desecrated
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).desecrated
					&& FirstCandidateList.get(0).getAllCurrentModifiers().size() < 6) {
				Desecrated_currency des_currency = new Desecrated_currency();
				return des_currency.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
						undesiredMods);
			}
			return new ArrayList<>();
		};

		Callable<List<Crafting_Candidate>> task3 = () -> {
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).modifierHistory.isEmpty()) {
				ModifierEvent lastEvent = FirstCandidateList.get(0).modifierHistory
						.get(FirstCandidateList.get(0).modifierHistory.size() - 1);
				ModifierEvent lastlastEvent = FirstCandidateList.get(0).modifierHistory
						.get(FirstCandidateList.get(0).modifierHistory.size() - 2);
				if (lastEvent.type != ActionType.REMOVED && !FirstCandidateList.get(0).stopAnnul && isExaltorRegalorDes(lastEvent, lastlastEvent) ) {
					AnnulmentOrb annul = new AnnulmentOrb();
					return annul.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
							undesiredMods);
				}
			}
			return new ArrayList<>();
		};

		Callable<List<Crafting_Candidate>> task4 = () -> {
			// Like the annul we check if the last thing we applied was not a essence
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).modifierHistory.isEmpty())
			{
				ModifierEvent lastEvent = FirstCandidateList.get(0).modifierHistory.get(FirstCandidateList.get(0).modifierHistory.size() - 1);
				if (lastEvent.type != ActionType.CHANGED) {
					Essence_currency essence_currency = new Essence_currency();
					return essence_currency.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
							undesiredMods);
				}
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

	private static boolean isExaltorRegalorDes(ModifierEvent lastEvent, ModifierEvent lastlastEvent)
	{
		if (lastEvent == null || lastEvent.source == null)
			return false;

		// Only proceed if the action before was not a removal
		if (lastEvent.type == ModifierEvent.ActionType.REMOVED)
			return false;

		
		// Check if the last two were homog or regals, else it can annul an exalt that was just applied
		if (lastEvent.source instanceof RegalOrb || lastEvent.source instanceof ExaltedOrb || lastEvent.source instanceof Desecrated_currency)
			if (lastlastEvent.source instanceof RegalOrb || lastlastEvent.source instanceof ExaltedOrb || lastlastEvent.source instanceof Desecrated_currency)
				return true;

		return false;
	}

	private static void copyCandidates(List<Crafting_Candidate> source, List<Crafting_Candidate> destination) {
		for (Crafting_Candidate candidate : source) {
			destination.add(candidate.copy());
		}
	}
	
	private static List<List<Crafting_Candidate>> deepCopy(List<List<Crafting_Candidate>> original) {
		List<List<Crafting_Candidate>> copy = new ArrayList<>();
		for (List<Crafting_Candidate> inner : original) {
			copy.add(new ArrayList<>(inner));
		}
		return copy;
	}
}