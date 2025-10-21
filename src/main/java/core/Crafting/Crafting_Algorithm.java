package core.Crafting;

import java.util.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.RegalOrb;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;

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
		
		Map<String, Integer> CountModifierTags = CreateCountModifierTags(desiredMods);
		System.out.println(CountModifierTags);

		boolean isPerfectEssence = false;
		boolean isDesecrated = false;
		for (Modifier mods : desiredMods)
		{
			if(mods.source == Modifier.ModifierSource.PERFECT_ESSENCE)
				isPerfectEssence = true;
			if (mods.source == Modifier.ModifierSource.DESECRATED)
				isDesecrated = true;
		}
		

		// Start of a NEW BASE
		for (int run = 1; run <= numRestarts; run++) {
			Crafting_Item currentItem;
			currentItem = baseItem.copy(); //Taking the base of the item we want to craft
			int currentBestScore = heuristic(currentItem, desiredMods, desiredModTiers);

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
				int score = heuristic(testCopy, desiredMods, desiredModTiers);
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
			}

		}

		System.out.println("🔥 global best (score: " + globalBestScore + ")");
		System.out.println("\n🏁 Best item after " + numRestarts + " runs: " + globalBest);
			for(Modifier mods : desiredMods)
			{
				System.out.println("Desired mods" + mods.text);
			}
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

	// Getting all the tags of all the modifiers, and counting how many of them there are
	private static Map<String, Integer> CreateCountModifierTags (List<Modifier> desiredMods)
	{
		Map<String, Integer> CountModifierTags = new HashMap<>();

		for(Modifier mods : desiredMods)
			for(String Modtags : mods.tags)
				if (!Modtags.isEmpty())
                	CountModifierTags.put(Modtags, CountModifierTags.getOrDefault(Modtags, 0) + 1);

		return CountModifierTags;
	}


	private static int heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier)
	{
		int score = 0;
		List<Modifier> PrefixCurrentMods = item.getAllCurrentPrefixModifiers();
		List<Modifier> SuffixCurrentMods = item.getAllCurrentSuffixModifiers();

		// Calculating score by checking if we have the modifiers we want
		score += calculateAffixScore(PrefixCurrentMods, desiredModTier);
		score += calculateAffixScore(SuffixCurrentMods, desiredModTier);


		return score;
	}

	public static int calculateAffixScore(List<Modifier> AffixCurrentMods, List<ModifierTier> desiredModTier) {
		int score = 0;
		int matched_modifiers = 0;
		int affix_slots = 0;
	
		// Checking the prefix modifiers
		for (Modifier mods : AffixCurrentMods) {
			boolean matched = false;
			for (ModifierTier currentTier : mods.tiers) {
				for (ModifierTier desiredTier : desiredModTier) {
					// If the family is the same and the tier is the same or above
					if (currentTier.name.equals(desiredTier.name) &&
						currentTier.level >= desiredTier.level) {
						matched = true;
						matched_modifiers++;
						break;
					}
				}
				// If it is a match, break to move on
				if (matched) break;
			}
			affix_slots++;
		}
	
		// If matched modifiers are equal to the slots in the item, add score, so 6000 is the goal to reach
		if (matched_modifiers == affix_slots) {
			score += 1000 * matched_modifiers;
		}
		// Multiplicative point loss for the number of prefix slots and non-matched modifiers
		else if (matched_modifiers < affix_slots) {
			score -= 1000 * (3 - affix_slots);
		}
	
		return score;
	}
}