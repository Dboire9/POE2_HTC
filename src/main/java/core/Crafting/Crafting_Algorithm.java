package core.Crafting;

import java.util.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;

public class Crafting_Algorithm {
	public static Crafting_Item optimizeCrafting(
        Crafting_Item baseItem,
        List<Modifier> desiredMods,
        List<ModifierTier> desiredModTiers,
        int maxStepsPerRun,
        int numRestarts) {

    Crafting_Item globalBest = baseItem.copy();
    int globalBestScore = 0;

	boolean isPerfectEssence = false;
	boolean isDesecrated = false;
	for (Modifier mods : desiredMods)
	{
		if(mods.source == Modifier.ModifierSource.PERFECT_ESSENCE)
			isPerfectEssence = true;
		if (mods.source == Modifier.ModifierSource.DESECRATED)
			isDesecrated = true;
	}

    System.out.println("🧠 Starting multi-run optimization...");
    System.out.println("Initial heuristic score: " + globalBestScore);

    // 🔁 Repeat the whole crafting simulation multiple times (different random paths)
    for (int run = 1; run <= numRestarts; run++) {
        Crafting_Item currentItem;
		currentItem = baseItem.copy();
        int currentBestScore = heuristic(currentItem, desiredMods, desiredModTiers);

        System.out.println("\n Run " + run + " started | Score: " + currentBestScore);

        // 🔄 Each run simulates multiple crafting steps
        for (int step = 1; step <= maxStepsPerRun; step++) {
            Crafting_Item bestCandidate = null;
            int bestCandidateScore = currentBestScore;

			// As the normal and magic steps are small, reduce the steps for optimization
			int N = 30;
			if(currentItem.rarity == ItemRarity.NORMAL)
			{
				N = 1;
			}
			if(currentItem.rarity == ItemRarity.MAGIC)
			{
				N = 5;
			}
            // Test N random possible actions this step
            for (int i = 0; i < N; i++) {
                Crafting_Item testCopy = currentItem.copy();

                // Random crafting action
                CraftingActionType action = CraftingActionPicker.pickRandomActionType(testCopy, isPerfectEssence);
				// System.out.println("  ➤ Run " + run + " | Step " + step + " | Action: " + action);
                testCopy = applyRandomAction(testCopy, action, isDesecrated);

                // Score the result
                int score = heuristic(testCopy, desiredMods, desiredModTiers);
                if (score > bestCandidateScore) {
                    bestCandidate = testCopy;
                    bestCandidateScore = score;
                }
            }

            // ✅ Accept the best improvement
            if (bestCandidate != null) {
                currentItem = bestCandidate;
                currentBestScore = bestCandidateScore;
                System.out.println("Step " + step + " | Score: " + currentBestScore);
            }

            // 🏁 Check if goal reached
            if (Crafting_Item.isFinished(currentItem, desiredModTiers)) {
                System.out.println("✅ Finished item found at step " + step + "!");
                break;
            }
        }

        // 🔝 Compare this run with the global best
        if (currentBestScore > globalBestScore) {
            globalBest = currentItem;
            globalBestScore = currentBestScore;
            System.out.println("🔥 New global best found (score: " + globalBestScore + ")");
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
                item = essence.apply(item);
            }
            case CURRENCY -> {
                Crafting_Action currency = CraftingCurrencyPicker.pickRandomCurrency(item, isDesecrated);
                if (currency != null) {
                    item.applyAction(item, currency);
                    item = currency.apply(item);
                }
            }
            case OMEN -> {
                Omen omen = CraftingOmenPicker.pickRandomOmen(item, Omen.getAllOmens());
                if (omen != null)
                    omen.apply(item);
            }
        }
        return item;
    }


	private static int heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier)
	{
		int score = 0;
		List<Modifier> PrefixCurrentMods = item.getAllCurrentPrefixModifiers();
		List<Modifier> SuffixCurrentMods = item.getAllCurrentSuffixModifiers();
		List<Modifier> AllCurrentMods = item.getAllCurrentModifiers();

		// Calculating score by checking if we have the modifiers we want
		score += calculateAffixScore(PrefixCurrentMods, desiredModTier);
		score += calculateAffixScore(SuffixCurrentMods, desiredModTier);

		// Adding score if a modifier has same tags as one we are searching for
		score += calculateTagsScore(AllCurrentMods, desiredMods);

		return score;
	}

	private static int calculateTagsScore(List<Modifier> AffixCurrentMods, List<Modifier> desiredMods)
	{
		int score = 0;
		Set<String> usedTags = new HashSet<>();
		int commonTags = 0;
		int freeAffixslots = 6;

		for(Modifier currentmods: AffixCurrentMods)
		{
			for(Modifier desiredmods : desiredMods)
			{
				// Count how many tags they share
				for (String tag : currentmods.tags)
				{
					if (desiredmods.tags.contains(tag) && !usedTags.contains(tag))
						commonTags++;
						usedTags.add(tag);
				}
			}
			freeAffixslots--;
		}
		if(commonTags > 0)
			score += 300 * (commonTags * freeAffixslots);
		else
			score -= 1000;

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
						score += 500;
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
	
		// If matched modifiers are equal to the slots in the item, add score
		if (matched_modifiers == affix_slots) {
			score += 500 * (matched_modifiers + affix_slots);
		}
		// Multiplicative point loss for the number of prefix slots and non-matched modifiers
		else if (matched_modifiers < affix_slots) {
			score -= 100 * (affix_slots + (3 - matched_modifiers));
		}
	
		return score;
	}
}