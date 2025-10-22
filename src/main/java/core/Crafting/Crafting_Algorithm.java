package core.Crafting;

import java.util.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;
import core.Crafting.Utils.CraftingStep_Util;
import core.Crafting.Utils.Heuristic_Util;
import core.Crafting.Utils.BestItems_Util;

public class Crafting_Algorithm {
	public static Crafting_Item optimizeCrafting(
        Crafting_Item baseItem,
        List<Modifier> desiredMods,
        List<ModifierTier> desiredModTiers,
        int numRestarts)
	{

		Crafting_Item globalBest = baseItem.copy();
		int globalBestScore = 0;
		int minTargetScore = 0;
		int uniquecombinations = 0;
		
		// Retrieving the tags and counting how many we have on every modifiers
		Map<String, Integer> CountDesiredModifierTags = Heuristic_Util.CreateCountModifierTags(desiredMods);

		boolean isPerfectEssence = false;
		boolean isDesecrated = false;

		//Checking if there is a special essence or a desecrated mod
		for (Modifier mods : desiredMods)
		{
			if(mods.source == Modifier.ModifierSource.PERFECT_ESSENCE)
				isPerfectEssence = true;
			if (mods.source == Modifier.ModifierSource.DESECRATED)
				isDesecrated = true;
		}
		
		// Keep the best scores
		TreeMap<Integer, List<Crafting_Item>> topItemsMap = new TreeMap<>(Collections.reverseOrder());


		//We might change the minTargetScore for desecrated or perfect essence items
		//minTargetScore = ?;

		// Start of a NEW BASE
		Crafting_Item currentItem;

		// Looping until we have 20 bases with a minimum score to proceed with
		for(int i = 0; i < numRestarts; i++){
			currentItem = baseItem.copy(); //Taking the base of the item we want to craf
			currentItem = CraftingStep_Util.runUntilRare(
				currentItem,
				desiredMods,
				desiredModTiers,
				CountDesiredModifierTags,
				isPerfectEssence,
				isDesecrated,
				globalBest,
				globalBestScore,
				topItemsMap
			);
			// System.out.println(topItemsMap.size());
		}

		Map<Integer, List<Crafting_Item>> topItemsMapCopy = new HashMap<>();
		for (Map.Entry<Integer, List<Crafting_Item>> entry : topItemsMap.entrySet()) {
			topItemsMapCopy.put(entry.getKey(), new ArrayList<>(entry.getValue()));
}


		// For each of the best modifier base we have, try on each of them the number of restart
		for (Map.Entry<Integer, List<Crafting_Item>> entry : topItemsMapCopy.entrySet()) {
			for(Crafting_Item best_item_base : entry.getValue())
			{
				currentItem = best_item_base.copy();
				for(int i = 0; i < numRestarts; i++)
				{
					CraftingStep_Util.runUntilDone(
					best_item_base,
					desiredMods,
					desiredModTiers,
					CountDesiredModifierTags,
					isPerfectEssence,
					isDesecrated,
					globalBest,
					globalBestScore,
					topItemsMap
					);

				}
			}
		}
		
		printBestOutcomes(topItemsMap);

		for(Modifier mods : desiredMods)
			System.out.println("Desired mods" + mods.text);
		return globalBest;
	}

    public static Crafting_Item applyRandomAction(Crafting_Item item, CraftingActionType action, boolean isDesecrated) {
        switch (action) {
            case ESSENCE -> {
                Crafting_Action essence = CraftingEssencePicker.pickRandomEssence(item);
				item = item.applyOmens(item, essence); // Applying the omen for the essence
                item = essence.apply(item);
            }
            case CURRENCY -> {
                Crafting_Action currency = CraftingCurrencyPicker.pickRandomCurrency(item, isDesecrated);
                if (currency != null) {
                    item = item.applyOmens(item, currency); // Applying the omens for currency
                    item = currency.apply(item);
                }
            }
            case OMEN -> {
                Omen omen = CraftingOmenPicker.pickRandomOmen(item, Omen.getAllOmens());
				// System.out.println("Applying omen : " + omen);
                if (omen != null)
                    item = omen.apply(item);
            }
        }
        return item;
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
		for (Map.Entry<Integer, List<Crafting_Item>> entry : topItemsMap.entrySet()) {
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