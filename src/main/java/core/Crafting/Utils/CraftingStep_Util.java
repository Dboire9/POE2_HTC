package core.Crafting.Utils;

import java.util.*;

import core.Crafting.*;
import core.Modifier_class.*;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Currency.AnnulmentOrb;
import core.Currency.Essence_currency;
import core.Currency.RegalOrb;
import core.Currency.Omens_currency.Omen;
import core.Crafting.Utils.CraftingStep_Util;


public class CraftingStep_Util {


    public static Crafting_Item runUntilRare(
            Crafting_Item baseItem,
            List<Modifier> desiredMods,
            List<ModifierTier> desiredModTiers,
            Map<String, Integer> CountDesiredModifierTags,
            boolean isPerfectEssence,
            boolean isDesecrated,
            Crafting_Item globalBest,
            int globalBestScore,
            TreeMap<Integer, List<Crafting_Item>> topItemsMap
    ) 
	{
        Crafting_Item currentItem = baseItem.copy();
        Crafting_Item bestCandidate = null;
        int currentBestScore = Crafting_Algorithm.heuristic(currentItem, desiredMods, desiredModTiers, CountDesiredModifierTags);
        int bestCandidateScore = currentBestScore;

        Crafting_Item testCopy = currentItem.copy();

        while (testCopy.rarity != ItemRarity.RARE) {
            CraftingActionType action = null;

            // If the magic item has an omen activated, force the simulator to use a regal next
            if (!testCopy.getActiveOmens().isEmpty()) {
                Omen firstOmen = testCopy.getActiveOmens().get(0);
                if (firstOmen.associatedCurrency == RegalOrb.class)
                    action = CraftingActionType.CURRENCY;
            }

            // Randomly choosing what we are going to do (Currency, Omen or Essence)
            if (action == null)
                action = CraftingActionPicker.pickRandomActionType(testCopy, isPerfectEssence);

            // Apply random action
            testCopy = Crafting_Algorithm.applyRandomAction(testCopy, action, isDesecrated);

            // Score the result
            int score = Crafting_Algorithm.heuristic(testCopy, desiredMods, desiredModTiers, CountDesiredModifierTags);
            if (score > bestCandidateScore) {
                bestCandidate = testCopy;
                bestCandidateScore = score;
            }

            // Accept the best improvement
            if (bestCandidate != null) {
                currentItem = bestCandidate;
                currentBestScore = bestCandidateScore;
            }

            // Track global best
            if (currentBestScore > globalBestScore) {
                globalBest = currentItem;
                globalBestScore = currentBestScore;
            }

            // Keep best 10/20 items
            BestItems_Util.addToTopItems(topItemsMap, currentBestScore, currentItem);
        }
		return currentItem;
    }








	public static Crafting_Item runUntilDone(
		Crafting_Item baseItem,
		List<Modifier> desiredMods,
		List<ModifierTier> desiredModTiers,
		Map<String, Integer> CountDesiredModifierTags,
		boolean isPerfectEssence,
		boolean isDesecrated,
		Crafting_Item globalBest,
		int globalBestScore,
		TreeMap<Integer, List<Crafting_Item>> topItemsMap
	)
	{
		Crafting_Item currentItem = baseItem.copy();
		Crafting_Item bestCandidate = null;
        int currentBestScore = Crafting_Algorithm.heuristic(currentItem, desiredMods, desiredModTiers, CountDesiredModifierTags);
        int bestCandidateScore = currentBestScore;

		Crafting_Item testCopy = currentItem.copy();

		int run = 10;
		
        for(int i = 0; i < run; i++) {
            CraftingActionType action = null;

            // If the magic item has an omen activated, force the simulator to use a regal next
            if (!testCopy.getActiveOmens().isEmpty()) {
                Omen firstOmen = testCopy.getActiveOmens().get(0);
                if (firstOmen.associatedCurrency == AnnulmentOrb.class)
                    action = CraftingActionType.CURRENCY;
				if (firstOmen.associatedCurrency == Essence_currency.class)
					action = CraftingActionType.ESSENCE;
            }

            // Randomly choosing what we are going to do (Currency, Omen or Essence)
            if (action == null)
                action = CraftingActionPicker.pickRandomActionType(testCopy, isPerfectEssence);

            // Apply random action
            testCopy = Crafting_Algorithm.applyRandomAction(testCopy, action, isDesecrated);

            // Score the result
            int score = Crafting_Algorithm.heuristic(testCopy, desiredMods, desiredModTiers, CountDesiredModifierTags);
            if (score > bestCandidateScore) {
                bestCandidate = testCopy;
                bestCandidateScore = score;
            }

            // Accept the best improvement
            if (bestCandidate != null) {
                currentItem = bestCandidate;
                currentBestScore = bestCandidateScore;
            }

            // Track global best
            if (currentBestScore > globalBestScore) {
                globalBest = currentItem;
                globalBestScore = currentBestScore;
            }

            // Keep best 10/20 items
            BestItems_Util.addToTopItems(topItemsMap, currentBestScore, currentItem);

			if(score == 6000)
				break;
        }






		return currentItem;
	}
}
