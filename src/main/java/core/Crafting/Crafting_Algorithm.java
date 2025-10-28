package core.Crafting;

import java.util.*;
import core.Modifier_class.*;
import core.Crafting.Utils.Heuristic_Util;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.AugmentationOrb;
import core.Currency.RegalOrb;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.TransmutationOrb;
import core.Currency.Omens_currency.*;

public class Crafting_Algorithm {
	public static Crafting_Item optimizeCrafting(
        Crafting_Item baseItem,
        List<Modifier> desiredMods,
        List<ModifierTier> desiredModTiers
		)
	{

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

		RareLoop(baseItem, AugCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);


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
		Omen regalhomog = new OmenOfHomogenisingCoronation();
		RegalOrb homogregalOrb = new RegalOrb(regalhomog);
		FirstCandidateListCopy = homogregalOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, regalhomog);
		listOfCandidateLists.add(new ArrayList<>(FirstCandidateListCopy));
		FirstCandidateListCopy.clear();
	}

	private static void RareLoop(
		Crafting_Item baseItem,
		List<Crafting_Candidate> FirstCandidateList,
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