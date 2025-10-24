package core.Crafting;

import java.util.*;
import core.Modifier_class.*;
import core.Crafting.Utils.Heuristic_Util;
import core.Currency.AugmentationOrb;
import core.Currency.Essence_currency;
import core.Currency.TransmutationOrb;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Action.CurrencyTier;

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
		CandidateList = transmutationOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);

		//Making a copy of all the candidate list to use after
		for (Crafting_Candidate candidate : CandidateList) {
			CandidateListCopy.add(candidate.copy());
		}

		
		// Second step (augmentation, or regal or essence)
		AugmentationOrb augmentationOrb = new AugmentationOrb();
		CandidateList = augmentationOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);

		listOfCandidateLists.add(CandidateList);

		List<Essence_currency> essences = Essence_currency.createEssences();
		for (Essence_currency essence : essences) {
			CandidateList = essence.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		}


		// Do a for of the crafting_candidate that are not rare to apply regal or essence

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