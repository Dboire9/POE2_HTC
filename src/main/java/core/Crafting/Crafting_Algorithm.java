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
			double GLOBAL_THRESHOLD) throws InterruptedException, ExecutionException {

		// Initializing the threads based on the user specs
		int threads = Math.max(1, Runtime.getRuntime().availableProcessors() - 2);
		ExecutorService thread_executor = Executors.newFixedThreadPool(threads);

		// Retrieving the tags and counting how many we have on every modifiers
		Map<String, Integer> CountDesiredModifierTags = Heuristic_Util.CreateCountModifierTags(desiredMods);

		// Creating the first List of Crafting_Candidate
		List<Crafting_Candidate> FirstCandidateList = new ArrayList<>();
		List<Crafting_Candidate> AugCandidateList = new ArrayList<>();
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();
		List<List<Crafting_Candidate>> listOfCandidateLists = new ArrayList<>();

		// Transmuting the item (first step)
		TransmutationOrb transmutationOrb = new TransmutationOrb();
		FirstCandidateList = transmutationOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, undesiredMods);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		// Making a copy of all the candidate list to use after
		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// Second step (augmentation, or regal or essence)
		AugmentationOrb augmentationOrb = new AugmentationOrb();
		FirstCandidateList = augmentationOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags,
				undesiredMods);
		// Adding the list : Transmut -> Augment
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		// Adding the list after aug to AugCandidateList
		for (Crafting_Candidate candidate : FirstCandidateList) {
			AugCandidateList.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with just transmutes
		generateCandidateLists(baseItem, FirstCandidateListCopy, desiredMods, CountDesiredModifierTags,
				listOfCandidateLists, undesiredMods);

		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with trasnmutes and aug
		generateCandidateLists(baseItem, AugCandidateList, desiredMods, CountDesiredModifierTags, listOfCandidateLists,
				undesiredMods);

		// Removing the two first lists(transmutation and transmutation/augmentation) as
		// we do not want to annul them
		listOfCandidateLists.subList(0, 2).clear();

		// Here the first steps are finished, we need to loop until the end with :
		// Exalted orb, Perfect Essences and Desecrated Mods and annuls sometimes

		List<List<Crafting_Candidate>> listOfCandidateLists_copy = new ArrayList<>();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}

		List<List<Crafting_Candidate>> listOfCandidateLists_exalt_copy = new ArrayList<>();
		for (List<Crafting_Candidate> candidates : listOfCandidateLists_copy) {
			ComputingLastProbability.ComputingLastEventProbability(candidates, desiredMods, baseItem, GLOBAL_THRESHOLD);
			RareLoop(baseItem, candidates, desiredMods, undesiredMods, CountDesiredModifierTags, listOfCandidateLists,
					listOfCandidateLists_exalt_copy, thread_executor);
			// System.out.println();
		}

		listOfCandidateLists_copy.clear();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists_exalt_copy) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}

		listOfCandidateLists_exalt_copy.clear();

		for (List<Crafting_Candidate> candidates : listOfCandidateLists_copy) {
			ComputingLastProbability.ComputingLastEventProbability(candidates, desiredMods, baseItem, GLOBAL_THRESHOLD);
			RareLoop(baseItem, candidates, desiredMods, undesiredMods, CountDesiredModifierTags, listOfCandidateLists,
					listOfCandidateLists_exalt_copy, thread_executor);
			// System.out.println();
		}

		listOfCandidateLists_copy.clear();
		listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		listOfCandidateLists_exalt_copy.clear();

		while (listOfCandidateLists_copy.size() != 0) {
			for (List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
			{
				if (!candidates.isEmpty()) {
					ComputingLastProbability.ComputingLastEventProbability(candidates, desiredMods, baseItem, GLOBAL_THRESHOLD);
					RareLoop(baseItem, candidates, desiredMods, undesiredMods, CountDesiredModifierTags,
							listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
				}
				// System.out.println();
			}

			listOfCandidateLists_copy.clear();
			listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

			listOfCandidateLists_exalt_copy.clear();
		}

		// Threads should not be utilized anymore, shutting them down
		thread_executor.shutdown();
		thread_executor.awaitTermination(1, TimeUnit.MINUTES);

		List<Crafting_Candidate> highScoreCandidates = new ArrayList<>();

		for (List<Crafting_Candidate> candidateList : listOfCandidateLists) {
			for (Crafting_Candidate candidate : candidateList) 
			{
				candidate.desecrated = false;
				if(candidate.score < 6000)
					continue;
				List<Modifier> current = candidate.getAllCurrentModifiers();
				if (current.size() >= 6) {
					int matchCount = 0;
					for (Modifier m : current) {
						for (Modifier desired_m : desiredMods) {
							if (m.text.equals(desired_m.text)) {
								matchCount++;
								break; // found a match, go to next m
							}
						}
					}
					if (matchCount == 6) {
						highScoreCandidates.add(candidate);
					}
				}
			}
		}

		// Need to implement perfect essences

		return highScoreCandidates;

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
			if (!FirstCandidateList.isEmpty()) {
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
}