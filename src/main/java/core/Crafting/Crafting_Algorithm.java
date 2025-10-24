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
		List<Crafting_Candidate> CandidateList = new ArrayList<>();
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		List<List<Crafting_Candidate>> listOfCandidateLists = new ArrayList<>();

		// Transmuting the item (first step)
		TransmutationOrb transmutationOrb = new TransmutationOrb();
		CandidateList.addAll(transmutationOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null));

		//Making a copy of all the candidate list to use after
		for (Crafting_Candidate candidate : CandidateList) {
			CandidateListCopy.add(candidate.copy());
		}

		// Second step (augmentation, or regal or essence)
		AugmentationOrb augmentationOrb = new AugmentationOrb();
		CandidateList = augmentationOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		// Adding the list : Transmut -> Augment
		listOfCandidateLists.add(new ArrayList<>(CandidateList));

		CandidateList.clear();
		// Candidate list here gets the list after the transmute
		for (Crafting_Candidate candidate : CandidateListCopy) {
			CandidateList.add(candidate.copy());
		}
		CandidateListCopy.clear();

		Essence_currency essence = new Essence_currency();
		List<Crafting_Candidate> temp = essence.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		CandidateListCopy.addAll(temp);
		// Adding the list : Transmut -> Essences
		listOfCandidateLists.add(new ArrayList<>(CandidateListCopy));

		CandidateListCopy.clear();

		// Applying a normal RegalOrb
		RegalOrb regalOrb = new RegalOrb();
		CandidateListCopy = regalOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, null);
		listOfCandidateLists.add(new ArrayList<>(CandidateListCopy));


		Omen regalhomog = new OmenOfHomogenisingCoronation();
		RegalOrb homogregalOrb = new RegalOrb(regalhomog);
		CandidateListCopy = homogregalOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags, regalhomog);
		listOfCandidateLists.add(new ArrayList<>(CandidateListCopy));


		
		CandidateListCopy.clear();
		
		// CURRENTLY NOT DOING OMENS OR CURRENCY TIER WE WILL DO IT AT THE END WHEN CALCULATING PROBABILITIES

		// We might need to do omens




		// System.out.println(CandidateList);




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

}