package core.Crafting;

import java.util.*;
import core.Modifier_class.*;
import core.Crafting.Utils.Heuristic_Util;
import core.Currency.AugmentationOrb;
import core.Currency.RegalOrb;
import core.Currency.Essence_currency;
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
		FirstCandidateList.addAll(transmutationOrb.apply(baseItem, FirstCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null));

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

		// We apply the essences and regal with and without omens to the magic bases 
		generateCandidateLists(baseItem, FirstCandidateListCopy, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);
		generateCandidateLists(baseItem, AugCandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, listOfCandidateLists);

		// Need to do regal with and wihtout omens on candidate_list for augs and we are good for the normal to rare

		// We might need to do omens




		// System.out.println(FirstCandidateList);




		for(Modifier mods : desiredMods)
			System.out.println("Desired mods" + mods.text);
		return globalBest;
	}

	public static int heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier, Map<String, Integer> CountDesiredModifierTags)
	{
		int score = 0;
		List<Modifier> PrefixCurrentMods = item.getAllCurrentPrefixModifiers();
		List<Modifier> SuffixCurrentMods = item.getAllCurrentSuffixModifiers();

		// Calculating score by checking if we have the modifiers we want
		score += Heuristic_Util.calculateAffixScore(PrefixCurrentMods, desiredModTier, CountDesiredModifierTags);
		score += Heuristic_Util.calculateAffixScore(SuffixCurrentMods, desiredModTier, CountDesiredModifierTags);

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
}