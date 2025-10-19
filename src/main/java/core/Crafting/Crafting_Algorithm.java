package core.Crafting;

import java.util.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;

public class Crafting_Algorithm {

	public static Crafting_Item optimizeCrafting(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, int maxSteps) {
		int bestScore = heuristic(item, desiredMods, desiredModTiers);
		System.out.println("🧠 Starting optimized crafting with initial score: " + bestScore);

		for (int step = 1; step <= maxSteps; step++) {
			Crafting_Item bestCandidate = null;
			int bestCandidateScore = bestScore;

			// Try N random possible actions
			for (int i = 0; i < 10000; i++) {
				Crafting_Item testCopy = item.copy();

				// Pick a random action (ESSENCE / CURRENCY / OMEN)
				CraftingActionType action = CraftingActionPicker.pickRandomActionType(testCopy);

				switch (action) {
					case ESSENCE -> {
						Crafting_Action essence = CraftingEssencePicker.pickRandomEssence(testCopy);
						// System.out.println("💎 Testing essence: " + essence.getName());
						testCopy = essence.apply(testCopy);
					}
					case CURRENCY -> {
						Crafting_Action currency = CraftingCurrencyPicker.pickRandomCurrency(testCopy);
						if (currency != null) {
							// System.out.println("💰 Testing currency: " + currency.getName());
							testCopy.applyAction(testCopy, currency);
							testCopy = currency.apply(testCopy);
						}
					}
					case OMEN -> {
						Omen omen = CraftingOmenPicker.pickRandomOmen(testCopy, Omen.getAllOmens());
						if (omen != null) {
							// System.out.println("🧿 Testing omen: " + omen.getName());
							omen.apply(testCopy);
						}
					}
				}

				// Evaluate result
				int score = heuristic(testCopy, desiredMods, desiredModTiers);
				if (score > bestCandidateScore) {
					bestCandidate = testCopy;
					bestCandidateScore = score;
				}
			}

			// No improvement? stop
			if (bestCandidate == null) {
				System.out.println("⚖️ No better state found, stopping early.");
				break;
			}

			// Accept improvement
			item = bestCandidate;
			bestScore = bestCandidateScore;
			System.out.println("Step " + step + " | New best score: " + bestScore);

			// Stop if finished
			if (Crafting_Item.isFinished(item, desiredModTiers)) {
				System.out.println("🏁 Desired modifiers reached!");
				break;
			}
		}

		System.out.println("✅ Final optimized item: " + item);
		for (Modifier mods : desiredMods) {
			System.out.println("Desired mods and tiers:");
			System.out.println("Modifier: " + mods.text); // Assuming Modifier has a 'name' field
		
			// for (ModifierTier tier : desiredModTiers) {
			// 	System.out.println("  Tier Name: " + tier.name + ", Level: " + tier.level);
			// }
		}
		return item;
	}

	/**
	 * Heuristic: assign high points for exact or higher-tier matches,
	 * medium for tag matches, and penalties for irrelevant modifiers.
	 */
	private static int heuristic(Crafting_Item item, List<Modifier> desiredMods, List<ModifierTier> desiredModTier) {
		int score = 0;
		List<Modifier> currentMods = item.getAllCurrentModifiers();

		for (Modifier mod : currentMods) {
			boolean matched = false;

			// 🎯 Exact tier match
			for (ModifierTier currentTier : mod.tiers) {
				for (ModifierTier desiredTier : desiredModTier) {
					if (currentTier.name.equals(desiredTier.name) &&
						currentTier.level >= desiredTier.level) {
						score += 100;
						matched = true;
						break;
					}
				}
			}

			// 🏷️ Tag match
			for (Modifier desired : desiredMods) {
				if (mod.tags != null && desired.tags != null) {
					for (String tag : mod.tags) {
						if (desired.tags.contains(tag)) {
							score += 50;
							break;
						}
					}
				}
			}

			// ❌ Penalty for useless mods
			if (!matched)
				score -= 50;
		}

		return score;
	}
}
