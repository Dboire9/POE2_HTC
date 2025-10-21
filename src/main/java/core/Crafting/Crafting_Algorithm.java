package core.Crafting;

import java.util.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.RegalOrb;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;
import core.Crafting.Utils.BestItems_Util;
import core.Crafting.Utils.Heuristic_Util;

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

		// Start of a NEW BASE
		for (int run = 1; run <= numRestarts; run++) {
			Crafting_Item currentItem;
			currentItem = baseItem.copy(); //Taking the base of the item we want to craft
			int currentBestScore = heuristic(currentItem, desiredMods, desiredModTiers, CountDesiredModifierTags);

			Crafting_Item bestCandidate = null;
			int bestCandidateScore = currentBestScore;


			// Test random possible actions until the item becomes rare
			Crafting_Item testCopy = currentItem.copy(); // Resetting to the original modifiers it was just before this step

			// Doing steps until the Item become RARE
			while (testCopy.rarity != ItemRarity.RARE) 
			{
				CraftingActionType action = null;
				//If the magic item has an omen activated, force the simulator to use the related currency
				if (!testCopy.getActiveOmens().isEmpty()) {
					Omen firstOmen = testCopy.getActiveOmens().get(0);
					if (firstOmen.associatedCurrency == RegalOrb.class)
						action = CraftingActionType.CURRENCY;
					else
						action = CraftingActionType.ESSENCE;
					
				}
				// Randomly choosing what we are going to do (Currency, Omen or Essence)
				if(action == null)
					action = CraftingActionPicker.pickRandomActionType(testCopy, isPerfectEssence);

				testCopy = applyRandomAction(testCopy, action, isDesecrated);

				// Score the result
				int score = heuristic(testCopy, desiredMods, desiredModTiers, CountDesiredModifierTags);
				if (score > bestCandidateScore) {
					bestCandidate = testCopy;
					bestCandidateScore = score;
				}

				// Accept the best improvement
				if (bestCandidate != null) {
					currentItem = bestCandidate;
					currentBestScore = bestCandidateScore;
					// System.out.println("Step " + step + " | Score: " + currentBestScore);
				}

				if (currentBestScore > globalBestScore) {
					globalBest = currentItem;
					globalBestScore = currentBestScore;
				}

				BestItems_Util.addToTopItems(topItemsMap, currentBestScore, currentItem);
			}

		}

		System.out.println("🔥 Top 10 outcomes:");
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

    private static Crafting_Item applyRandomAction(Crafting_Item item, CraftingActionType action, boolean isDesecrated) {
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

	private static int heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier, Map<String, Integer> CountDesiredModifierTags)
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