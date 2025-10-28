package core.Crafting;

import java.util.*;
import java.util.concurrent.*;
import core.Modifier_class.*;
import core.Crafting.Utils.Heuristic_Util;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.*;
import core.Currency.Omens_currency.*;

public class Crafting_Algorithm {
	public static Crafting_Item optimizeCrafting(
			Crafting_Item baseItem,
			List<Modifier> desiredMods,
			List<ModifierTier> desiredModTiers
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
		FirstCandidateList = transmutationOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		//Making a copy of all the candidate list to use after
		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// Second step (augmentation, or regal or essence)
		AugmentationOrb augmentationOrb = new AugmentationOrb();
		FirstCandidateList = augmentationOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		// Adding the list : Transmut -> Augment
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateList));

		// Adding the list after aug to AugCandidateList
		for (Crafting_Candidate candidate : FirstCandidateList) {
			AugCandidateList.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with just transmutes
		generateCandidateLists(baseItem, FirstCandidateListCopy, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);


		for (Crafting_Candidate candidate : FirstCandidateList) {
			FirstCandidateListCopy.add(candidate.copy());
		}

		// We apply the essences and regal to the bases with trasnmutes and aug
		generateCandidateLists(baseItem, AugCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);

		CheckingAndApplyingAnnul(baseItem, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);
		// Here the first steps are finished, we need to loop until the end with : Exalted orb, Perfect Essences and Desecrated Mods

		// Removing the two first lists(transmutation and transmutation/augmentation)
		listOfCandidateLists.subList(0, 2).clear();
		List<List<Crafting_Candidate>> listOfCandidateLists_copy = new ArrayList<>();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}


		List<List<Crafting_Candidate>> listOfCandidateLists_exalt_copy = new ArrayList<>();
		for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		{
			List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
			RareLoop(baseItem, candidate_copy, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		}

		listOfCandidateLists_copy.clear();
		for (List<Crafting_Candidate> innerList : listOfCandidateLists_exalt_copy) {
			List<Crafting_Candidate> newInnerList = new ArrayList<>(innerList);
			listOfCandidateLists_copy.add(newInnerList);
		}

		// listOfCandidateLists_exalt_copy.clear();

		// for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		// {
		// 	List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
		// 	RareLoop(baseItem, candidate_copy, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		// }

		// listOfCandidateLists_copy.clear();
		// listOfCandidateLists_copy = new ArrayList<>(listOfCandidateLists_exalt_copy);

		// listOfCandidateLists_exalt_copy.clear();

		// for(List<Crafting_Candidate> candidates : listOfCandidateLists_copy)
		// {
		// 	List<Crafting_Candidate> candidate_copy = new ArrayList<>(candidates);
		// 	RareLoop(baseItem, candidate_copy, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists, listOfCandidateLists_exalt_copy, thread_executor);
		// }

		// Threads should not be utilized anymore, shutting them down
		thread_executor.shutdown();
		thread_executor.awaitTermination(1, TimeUnit.MINUTES);

		List<Crafting_Candidate> highScoreCandidates = new ArrayList<>();

		for (List<Crafting_Candidate> candidateList : listOfCandidateLists) {
			for (Crafting_Candidate candidate : candidateList) {
				if (candidate.score >= 6000) { // or >= 6000 if you want threshold
					highScoreCandidates.add(candidate);
				}
			}
		}




		// Now we need to take all these 6 magic bases and finish them
		// We have exalted orbs with omens, Desecration, annuls, perfect essences
		// Annuls has 6 omens (one in synergy with desecrated currency), exalt has 4 omens, but we can apply 3 at a time, essence has 2

		// For annuls. do we only annuls modifiers with a tag that was matching but is too much anymore ? And only after homog ? 
		// If las action was homog, and 

		// For annuls omens, if we erase a tag modifier, score up ?
		


		// (?)System where the item is 6000 points at the begiining, if modifier is a good modifier do not change points, if it is a good tag modifier remove only 800, if it is a 1 good tag modifier, remove 900
		// Do we try every base and then see if the omen could have done that ? 



		// System.out.println(FirstCandidateList);




		for(Modifier mods : desiredMods)
			System.out.println("Desired mods" + mods.text);
		return globalBest;

	}

	public static double heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier, Map<String, Integer> CountDesiredModifierTags)
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
		List<ModifierTier> desiredModTiers,
		Map<String, Integer> CountDesiredModifierTags,
		List<List<Crafting_Candidate>> listOfCandidateLists
	)
	{
		// Applying Essence_currency
		Essence_currency essence = new Essence_currency();
		List<Crafting_Candidate> FirstCandidateListCopy = new ArrayList<>();
		List<Crafting_Candidate> temp = essence.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		FirstCandidateListCopy.addAll(temp);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	
		// Applying a normal RegalOrb
		RegalOrb regalOrb = new RegalOrb();
		FirstCandidateListCopy = regalOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	
		// Applying RegalOrb with OmenOfHomogenisingCoronation
		Omen regal_homog = new OmenOfHomogenisingCoronation();
		RegalOrb homogregalOrb = new RegalOrb(regal_homog);
		FirstCandidateListCopy = homogregalOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, regal_homog);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	}

	private static void RareLoop(
		Crafting_Item baseItem,
		List<Crafting_Candidate> FirstCandidateList,
		List<Modifier> desiredMods,
		List<ModifierTier> desiredModTiers,
		Map<String, Integer> CountDesiredModifierTags,
		List<List<Crafting_Candidate>> listOfCandidateLists,
		List<List<Crafting_Candidate>> listOfCandidateLists_exalt,
		ExecutorService executor
	) throws InterruptedException, ExecutionException {
		
		Callable<List<Crafting_Candidate>> task1 = () -> {
			ExaltedOrb exalt = new ExaltedOrb();
			return exalt.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		};
	
		Callable<List<Crafting_Candidate>> task2 = () -> {
			Omen exalt_homog = new OmenOfHomogenisingExaltation();
			ExaltedOrb exalthomogOrb = new ExaltedOrb(exalt_homog);
			return exalthomogOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, exalt_homog);
		};

		Callable<List<Crafting_Candidate>> task3 = () -> {
			Desecrated_currency des_currency = new Desecrated_currency();
			return des_currency.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		};
	
		List<Callable<List<Crafting_Candidate>>> tasks = Arrays.asList(task1, task2, task3);
		List<Future<List<Crafting_Candidate>>> results = executor.invokeAll(tasks);
	
		List<Crafting_Candidate> result1 = results.get(0).get();
		List<Crafting_Candidate> result2 = results.get(1).get();
		List<Crafting_Candidate> result3 = results.get(2).get();
	
		synchronized (listOfCandidateLists) {
			listOfCandidateLists.add(new ArrayList<>(result1));
			listOfCandidateLists.add(new ArrayList<>(result2));
			listOfCandidateLists.add(new ArrayList<>(result3));
		}
	
		synchronized (listOfCandidateLists_exalt) {
			listOfCandidateLists_exalt.add(new ArrayList<>(result1));
			listOfCandidateLists_exalt.add(new ArrayList<>(result2));
			listOfCandidateLists_exalt.add(new ArrayList<>(result3));
		}
	}

	

	private static void CheckingAndApplyingAnnul(
		Crafting_Item baseItem,
		List<Modifier> desiredMods,
		List<ModifierTier> desiredModTiers,
		Map<String, Integer> CountDesiredModifierTags,
		List<List<Crafting_Candidate>> listOfCandidateLists
	)
	{
		List<List<Crafting_Candidate>> copy = new ArrayList<>(listOfCandidateLists);
		List<Crafting_Candidate> newList = new ArrayList<>();
		for (List<Crafting_Candidate> candidateList : copy) {
				if (!candidateList.get(0).modifierHistory.isEmpty()) {
					ModifierEvent lastEvent = candidateList.get(0).modifierHistory.get(candidateList.get(0).modifierHistory.size() - 1);

					if(hasHomogenisingRemoval(lastEvent))
					{
						// Apply AnnulmentOrb
						AnnulmentOrb annul = new AnnulmentOrb();
						List<Crafting_Candidate> temp = annul.apply(
							baseItem,
							candidateList,
							desiredMods,
							desiredModTiers,
							CountDesiredModifierTags,
							null
						);
						newList.addAll(temp);

						// Copy results into a new list
					}
				}
				if(!newList.isEmpty())
				{
					listOfCandidateLists.add(new ArrayList<>(newList));
					newList.clear();
				}
			}
	}

	private static boolean hasHomogenisingRemoval(ModifierEvent lastEvent)
	{
		if (lastEvent == null || lastEvent.source == null)
			return false;

		// Only proceed if the action before was not a removal
		if (lastEvent.type == ModifierEvent.ActionType.REMOVED)
			return false;

		// Check RegalOrb and if it was homog
		if (lastEvent.source instanceof RegalOrb regal) {
			return regal.Omens.stream()
				.anyMatch(o -> o instanceof OmenOfHomogenisingCoronation);
		}

		// Check ExaltedOrb and if it was homog
		if (lastEvent.source instanceof ExaltedOrb exalted) {
			return exalted.Omens.stream()
				.anyMatch(o -> o instanceof OmenOfHomogenisingCoronation);
		}

		return false;
	}
}