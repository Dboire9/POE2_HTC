package core.Crafting;

import java.util.*;
import core.Modifier_class.*;
import core.Crafting.Utils.Heuristic_Util;
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

		// Transmuting the item
		TransmutationOrb transmutationOrb = new TransmutationOrb();
		transmutationOrb.apply(baseItem, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);

		System.out.println(CandidateList);




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


	private static void printBestOutcomes(TreeMap<Integer, List<Crafting_Item>> topItemsMap)
	{
		System.out.println("Top 20 outcomes:");
		// Iterate in descending order of keys
		for (Map.Entry<Integer, List<Crafting_Item>> entry : topItemsMap.descendingMap().entrySet()) {
			int scoreKey = entry.getKey();
		
			for (Crafting_Item item : entry.getValue()) {
				System.out.println("Score: " + scoreKey);
				System.out.println("Item modifiers:");
				for (Modifier mod : item.getAllModifiers()) {
					System.out.println("  - " + mod.text);
				}
				System.out.println(); // Empty line between items
			}
		}
	}
}