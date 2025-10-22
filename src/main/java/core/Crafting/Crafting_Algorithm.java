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
        int maxStepsPerRun,
        int numRestarts)
	{

		Crafting_Item globalBest = baseItem.copy();
		int globalBestScore = 0;
		int minTargetScore = 0;
		
		// Retrieving the tags and counting how many we have on every modifiers
		Map<String, Integer> CountDesiredModifierTags = Heuristic_Util.CreateCountModifierTags(desiredMods);

		boolean isPerfectEssence = false;
		boolean isDesecrated = false;
		for (Modifier mods : desiredMods)
		{
			if(mods.source == Modifier.ModifierSource.PERFECT_ESSENCE)
				isPerfectEssence = true;
			if (mods.source == Modifier.ModifierSource.DESECRATED)
				isDesecrated = true;
		}
		
		// Keep the best scores
		TreeMap<Integer, List<Crafting_Item>> topItemsMap = new TreeMap<>(Collections.reverseOrder());

		// For 3 modifiers items, we target 3000 as it is 3 exact modifiers, and 20 is the most unique combinations of 3 modifiers you can make from 6 unique ones
		minTargetScore = 3000;

		//We might change the minTargetScore for desecrated or perfect essence items
		//minTargetScore = ?;

		// Start of a NEW BASE
		Crafting_Item currentItem;
		
		while (BestItems_Util.countTotalItems(topItemsMap) < 20 || topItemsMap.lastKey() < minTargetScore){
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
		}

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
}