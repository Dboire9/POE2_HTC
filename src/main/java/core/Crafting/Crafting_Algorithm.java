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
import core.Currency.AnnulmentOrb;
import core.Currency.AugmentationOrb;
import core.Currency.Desecrated_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Currency.TransmutationOrb;
import core.Modifier_class.Modifier;

public class Crafting_Algorithm {
	public static Crafting_Item optimizeCrafting(
			Crafting_Item baseItem,
			List<Modifier> desiredMods
			) throws InterruptedException, ExecutionException
		{

		// Initializing the threads based on the user specs
		int threads = Math.max(1, Runtime.getRuntime().availableProcessors() - 2);
		ExecutorService thread_executor = Executors.newFixedThreadPool(threads);

		Crafting_Item globalBest = baseItem.copy();
		
		// Retrieving the tags and counting how many we have on every modifiers
		Map<String, Integer> CountDesiredModifierTags = Heuristic_Util.CreateCountModifierTags(desiredMods);

		

		// Creating the first List of Crafting_Candidate
		List<Crafting_Candidate> FirstCandidateList = new ArrayList<>();
		List<Crafting_Candidate> AugCandidateList = new ArrayList<>();
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();
		List<List<Crafting_Candidate>> listOfCandidateLists = new ArrayList<>();

		// Transmuting the item (first step)
		TransmutationOrb transmutationOrb = new TransmutationOrb();
		FirstCandidateList = transmutationOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		//Making a copy of all the candidate list to use after
		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// Second step (augmentation, or regal or essence)
		AugmentationOrb augmentationOrb = new AugmentationOrb();
		FirstCandidateList = augmentationOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
		// Adding the list : Transmut -> Augment
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		// Adding the list after aug to AugCandidateList
		for (Crafting_Candidate candidate : FirstCandidateList) {
			AugCandidateList.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with just transmutes
		generateCandidateLists(baseItem, FirstCandidateListCopy, desiredMods, CountDesiredModifierTags, listOfCandidateLists);


		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with trasnmutes and aug
		generateCandidateLists(baseItem, AugCandidateList, desiredMods, CountDesiredModifierTags, listOfCandidateLists);

		
		// Removing the two first lists(transmutation and transmutation/augmentation) as we do not want to annul them
		listOfCandidateLists.subList(0, 2).clear();


		// Here the first steps are finished, we need to loop until the end with : Exalted orb, Perfect Essences and Desecrated Mods and annuls sometimes

		List<List<Crafting_Candidate>> listOfCandidateLists_copy = new ArrayList<>();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}


		List<List<Crafting_Candidate>> listOfCandidateLists_exalt_copy = new ArrayList<>();
		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}


		// We do not annul after a desecration, we just annul after an homog

		listOfCandidateLists_copy.clear();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists_exalt_copy) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}

		listOfCandidateLists_exalt_copy.clear();

		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}


		listOfCandidateLists_copy.clear();
		listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		listOfCandidateLists_exalt_copy.clear();

		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}


		listOfCandidateLists_copy.clear();
		listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		listOfCandidateLists_exalt_copy.clear();

		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			if(!candidate_copy.isEmpty() && !candidate_copy.get(0).isFull())
				RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}

		listOfCandidateLists_copy.clear();
		listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		listOfCandidateLists_exalt_copy.clear();


		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			if(!candidate_copy.isEmpty() && !candidate_copy.get(0).isFull())
				RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}

		listOfCandidateLists_copy.clear();
		listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		listOfCandidateLists_exalt_copy.clear();


		// we doing a last loop here ? If 6 mods, apply an annul and exalt after (?)
		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			if(!candidate_copy.isEmpty() && !candidate_copy.get(0).isFull())
				RareLoop(baseItem, candidate_copy, desiredMods, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}

		// Threads should not be utilized anymore, shutting them down
		thread_executor.shutdown();
		thread_executor.awaitTermination(1, TimeUnit.MINUTES);

		List<Crafting_Candidate> highScoreCandidates = new ArrayList<>();

		for (List<Crafting_Candidate> candidateList : listOfCandidateLists) {
			for (Crafting_Candidate candidate : candidateList) {
				if (candidate.score >= 6000)
					highScoreCandidates.add(candidate);
			}
		}

		// Need to implement perfect essences

		for(Modifier mods : desiredMods)
			System.out.println("Desired mods" + mods.text);
		return globalBest;

	}

	public static double heuristic(Crafting_Item item, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags)
	{
		double score = 0;
		List<Modifier> PrefixCurrentMods = item.getAllCurrentPrefixModifiers();
		List<Modifier> SuffixCurrentMods = item.getAllCurrentSuffixModifiers();

		// Calculating score by checking if we have the modifiers we want
		score += Heuristic_Util.calculateAffixScore(PrefixCurrentMods, desiredMods, CountDesiredModifierTags);
		score += Heuristic_Util.calculateAffixScore(SuffixCurrentMods, desiredMods, CountDesiredModifierTags);

		return score;
	}




	private static void generateCandidateLists(
		Crafting_Item baseItem,
		List<Crafting_Candidate> FirstCandidateList,
		List<Modifier> desiredMods,
		Map<String, Integer> CountDesiredModifierTags,
		List<List<Crafting_Candidate>> listOfCandidateLists
	)
	{
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();

		// Not doing essences as regal can do every of them
		// Applying Essence_currency
		// Essence_currency essence = new Essence_currency();
		// List<Crafting_Candidate> temp = essence.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
		// FirstCandidateListCopy.addAll(temp);
		// listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		// FirstCandidateListCopy.clear();
	
		// Applying a normal RegalOrb
		RegalOrb regalOrb = new RegalOrb();
		FirstCandidateListCopy = regalOrb.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	}

	private static void RareLoop(
		Crafting_Item baseItem,
		List<Crafting_Candidate> FirstCandidateList,
		List<Modifier> desiredMods,
		Map<String, Integer> CountDesiredModifierTags,
		List<List<Crafting_Candidate>> listOfCandidateLists,
		List<List<Crafting_Candidate>> listOfCandidateLists_exalt,
		ExecutorService executor
	) throws InterruptedException, ExecutionException {
		Callable<List<Crafting_Candidate>> task1 = () -> {
			if(!FirstCandidateList.get(0).isFull())
			{
				ExaltedOrb exalt = new ExaltedOrb();
				return exalt.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
			}
			return new ArrayList<>();
		};
	
		Callable<List<Crafting_Candidate>> task2 = () -> {
			// Checking if it is not already desecrated
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).desecrated && !FirstCandidateList.get(0).isFull()) {
				Desecrated_currency des_currency = new Desecrated_currency();
				return des_currency.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
			}
			return new ArrayList<>();
		};
	
		Callable<List<Crafting_Candidate>> task3 = () -> {
			if (!FirstCandidateList.isEmpty() && !FirstCandidateList.get(0).modifierHistory.isEmpty()) {
				ModifierEvent lastEvent = FirstCandidateList.get(0).modifierHistory
						.get(FirstCandidateList.get(0).modifierHistory.size() - 1);
				if (isExaltorRegalorDes(lastEvent)) {
					AnnulmentOrb annul = new AnnulmentOrb();
					return annul.apply(baseItem, FirstCandidateList, desiredMods, CountDesiredModifierTags, null);
				}
			}
			return new ArrayList<>();
		};
	
		// Run all tasks concurrently
		List<Callable<List<Crafting_Candidate>>> tasks = Arrays.asList(task1, task2, task3);
		List<Future<List<Crafting_Candidate>>> results = executor.invokeAll(tasks);
	
		// Collect all results
		List<Crafting_Candidate> result1 = results.get(0).get();
		List<Crafting_Candidate> result2 = results.get(1).get();
		List<Crafting_Candidate> result3 = results.get(2).get();
	
		synchronized (listOfCandidateLists) {
			if (!result1.isEmpty()) listOfCandidateLists.add(new ArrayList<>(result1));
			if (!result2.isEmpty()) listOfCandidateLists.add(new ArrayList<>(result2));
			if (!result3.isEmpty()) listOfCandidateLists.add(new ArrayList<>(result3));
		}
	
		synchronized (listOfCandidateLists_exalt) {
			if (!result1.isEmpty()) listOfCandidateLists_exalt.add(new ArrayList<>(result1));
			if (!result2.isEmpty()) listOfCandidateLists_exalt.add(new ArrayList<>(result2));
			if (!result3.isEmpty()) listOfCandidateLists_exalt.add(new ArrayList<>(result3));
		}
	}

	private static boolean isExaltorRegalorDes(ModifierEvent lastEvent)
	{
		if (lastEvent == null || lastEvent.source == null)
			return false;

		// Only proceed if the action before was not a removal
		if (lastEvent.type == ModifierEvent.ActionType.REMOVED)
			return false;

		// Check RegalOrb and if it was homog
		if (lastEvent.source instanceof RegalOrb || lastEvent.source instanceof ExaltedOrb || lastEvent.source instanceof Desecrated_currency) {
			return true;
		}

		return false;
	}

	// Check if the item has all desired modifier tiers
	public static boolean isFinished(Crafting_Candidate item, List<Modifier> desiredMods) {
		if (desiredMods == null || desiredMods.isEmpty()) return false;

		int matched = 0;
		List<Modifier> currentMods = item.getAllCurrentModifiers();

		for (Modifier mod : currentMods) {
			for (Modifier desiredMod : desiredMods) {
				if (mod.family.equals(desiredMod.family)) {
					matched++;
					break; // Prevent double counting the same desired tier
				}
			}
		}

		if (matched >= desiredMods.size()) {
			return true;
		}

		return false;
	}
}