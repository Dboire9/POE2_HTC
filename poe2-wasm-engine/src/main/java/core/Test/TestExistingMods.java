package core.Test;

import java.util.*;
import java.util.concurrent.ExecutionException;

import core.Crafting.*;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Currency.*;

/**
 * TestExistingMods
 * 
 * This class tests the crafting optimization algorithm starting from an item
 * that already has existing modifiers applied.
 * 
 * Test scenario:
 * - Start with a RARE bow that has 3 existing modifiers
 * - Try to add 3 more specific modifiers to complete the item
 */
public class TestExistingMods {

	public static void main(String[] args) {

		System.out.println("=== TESTING CRAFTING WITH EXISTING MODIFIERS ===\n");

		// --- ITEM SETUP SECTION ---
		// Create a test bow
		core.Items.Bows.Bows testItem = new core.Items.Bows.Bows();
		Crafting_Item item = new Crafting_Item(testItem);
		item.level = 86; // Set item level
		item.rarity = Crafting_Item.ItemRarity.RARE; // Set to RARE

		System.out.println("Base Item: " + testItem.getClass().getSimpleName());
		System.out.println("Item Level: " + item.level);
		System.out.println("Item Rarity: " + item.rarity + "\n");

		// Get allowed modifiers
		List<Modifier> possiblePrefixes = testItem.getNormalAllowedPrefixes();
		List<Modifier> possibleSuffixes = testItem.getNormalAllowedSuffixes();

		// --- SETUP EXISTING MODIFIERS ---
		List<Modifier> existingMods = new ArrayList<>();
		System.out.println("=== EXISTING MODIFIERS (already on item) ===");

		// Existing Prefix 1: Adds # to # Physical Damage (T2)
		for (Modifier mod : possiblePrefixes) {
			if (mod.text.equals("Adds # to # Physical Damage")) {
				mod.chosenTier = 1; // T2 = index 1
				ModifierTier tier = mod.tiers.get(1);
				item.addPrefix(mod, tier);
				existingMods.add(mod);
				System.out.println("PREFIX: " + mod.text + " (T2)");
				break;
			}
		}

		// Existing Suffix 1: +# to Dexterity (T2)
		for (Modifier mod : possibleSuffixes) {
			if (mod.text.equals("+# to Dexterity")) {
				mod.chosenTier = 1; // T2 = index 1
				ModifierTier tier = mod.tiers.get(1);
				item.addSuffix(mod, tier);
				existingMods.add(mod);
				System.out.println("SUFFIX: " + mod.text + " (T2)");
				break;
			}
		}

		// Existing Suffix 2: +# to Level of all Projectile Skills (T2)
		for (Modifier mod : possibleSuffixes) {
			if (mod.text.equals("+# to Level of all Projectile Skills")) {
				mod.chosenTier = 1; // T2 = index 1
				ModifierTier tier = mod.tiers.get(1);
				item.addSuffix(mod, tier);
				existingMods.add(mod);
				System.out.println("SUFFIX: " + mod.text + " (T2)");
				break;
			}
		}

		System.out.println("\nItem now has " + item.getAllCurrentModifiers().size() + " existing modifiers\n");

		// --- SETUP DESIRED MODIFIERS (to add) ---
		List<Modifier> desiredMods = new ArrayList<>();
		List<Modifier> undesiredMods = new ArrayList<>();

		System.out.println("=== TARGET MODIFIERS (to add) ===");

		// Target Prefix 1: Adds # to # Fire Damage (T2)
		for (Modifier mod : possiblePrefixes) {
			if (mod.text.equals("Adds # to # Fire Damage")) {
				mod.chosenTier = 1; // T2 = index 1
				desiredMods.add(mod);
				System.out.println("PREFIX: " + mod.text + " (T2)");
				break;
			}
		}

		// Target Prefix 2: Adds # to # Lightning Damage (T2)
		for (Modifier mod : possiblePrefixes) {
			if (mod.text.equals("Adds # to # Lightning Damage")) {
				mod.chosenTier = 1; // T2 = index 1
				desiredMods.add(mod);
				System.out.println("PREFIX: " + mod.text + " (T2)");
				break;
			}
		}

		// Target Suffix 1: % reduced Attribute Requirements (T2)
		for (Modifier mod : possibleSuffixes) {
			if (mod.text.equals("% reduced Attribute Requirements")) {
				mod.chosenTier = 1; // T2 = index 1
				desiredMods.add(mod);
				System.out.println("SUFFIX: " + mod.text + " (T2)");
				break;
			}
		}

		System.out.println("\nTotal desired (existing + target): " + (existingMods.size() + desiredMods.size())
				+ " modifiers");
		System.out.println("  - " + existingMods.size() + " already on item");
		System.out.println("  - " + desiredMods.size() + " to add\n");

		// --- CRAFTING EXECUTION SECTION ---
		double GLOBALTHRESHOLD = 33;
		List<Map<String, String>> excludedCurrencies = new ArrayList<>();

		System.out.println("=== STARTING CRAFTING ALGORITHM ===");
		System.out.println("Initial threshold: " + GLOBALTHRESHOLD + "%\n");

		try {
			long startTime = System.nanoTime();

			// Use the existing mods crafting method
			List<Probability_Analyzer.CandidateProbability> results = CraftingExecutor.runCraftingWithExistingMods(
					item,
					desiredMods,
					undesiredMods,
					GLOBALTHRESHOLD / 100,
					existingMods,
					excludedCurrencies);

			// Retry with decreasing threshold if no results
			int retryCount = 0;
			while (results.isEmpty() && GLOBALTHRESHOLD > 0) {
				item.reset();
				// Reapply existing mods after reset
				for (Modifier existingMod : existingMods) {
					ModifierTier tier = existingMod.tiers.get(existingMod.chosenTier);
					if (existingMod.type == Modifier.ModifierType.PREFIX) {
						item.addPrefix(existingMod, tier);
					} else {
						item.addSuffix(existingMod, tier);
					}
				}

				GLOBALTHRESHOLD--;
				undesiredMods.clear();
				retryCount++;

				System.out.println("Retry #" + retryCount + " - Threshold: " + GLOBALTHRESHOLD + "%");

				results = CraftingExecutor.runCraftingWithExistingMods(
						item,
						desiredMods,
						undesiredMods,
						GLOBALTHRESHOLD / 100,
						existingMods,
						excludedCurrencies);
			}

			long durationInMillis = (System.nanoTime() - startTime) / 1_000_000;
			System.out.println("\nCrafting completed in " + durationInMillis + " ms");
			System.out.println("Final threshold used: " + GLOBALTHRESHOLD + "%");
			System.out.println("Total retries: " + retryCount);
			System.out.println("Results found: " + results.size() + "\n");

			// --- RESULTS DISPLAY SECTION ---
			if (results.isEmpty()) {
				System.out.println("❌ NO CRAFTING PATHS FOUND");
				System.out.println("\nThis indicates an issue with the algorithm:");
				System.out.println("1. Check if existing mods are being properly handled");
				System.out.println("2. Verify desiredMods includes both existing and target mods");
				System.out.println("3. Check if item state is correct after applying existing mods");
				System.out.println("4. Debug the optimizeCraftingWithExistingMods method");
			} else {
				displayResults(results, GLOBALTHRESHOLD, existingMods, desiredMods);
			}

		} catch (InterruptedException | ExecutionException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Displays the crafting results including:
	 * - Final probability
	 * - Sequence of crafting actions (path)
	 * - Modifiers obtained
	 * - Tier and Omen information when applicable
	 */
	private static void displayResults(List<Probability_Analyzer.CandidateProbability> results,
			double threshold,
			List<Modifier> existingMods,
			List<Modifier> desiredMods) {

		System.out.println("=== CRAFTING RESULTS ===\n");

		// Show top 3 results
		for (int i = 0; i < Math.min(3, results.size()); i++) {
			Probability_Analyzer.CandidateProbability cp = results.get(i);
			System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
			System.out.println("Result #" + (i + 1));
			System.out.println("Final Probability: " + String.format("%.6f%%", cp.finalPercentage()));
			System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

			System.out.println("Crafting Path:");
			int stepNum = 0;
			for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
				Crafting_Action action = entry.getKey();
				ModifierEvent event = entry.getValue();
				stepNum++;

				// Get probability directly from the event's source map
				Double probability = event.source.get(action);
				double percentage = probability != null ? probability * 100 : 0.0;

				System.out.println("\nStep " + stepNum + ":");
				System.out.println("  Action: " + action.getClass().getSimpleName());
				System.out.println("  Modifier: " + (event.modifier != null ? event.modifier.text : "N/A"));
				System.out.println("  Event Type: " + event.type);
				System.out.println("  Probability: " + String.format("%.4f%%", percentage));

				// For Perfect Essence (CHANGED), show what modifier is being replaced
				if (event.type == ModifierEvent.ActionType.CHANGED && event.changed_modifier != null) {
					System.out.println("  ⟹ Replaces: " + event.changed_modifier.text);
				}

				// Display tier and omen details depending on the action type
				if (action instanceof ExaltedOrb currency) {
					System.out.println("  Tier: " + currency.tier);
					if (currency.omens != null)
						System.out.println("  Omens: " + currency.omens);
				} else if (action instanceof RegalOrb currency) {
					System.out.println("  Tier: " + currency.tier);
					if (currency.omen != null)
						System.out.println("  Omen: " + currency.omen);
				} else if (action instanceof AnnulmentOrb currency && currency.omen != null) {
					System.out.println("  Omen: " + currency.omen);
				} else if (action instanceof Desecrated_currency currency && currency.omens != null) {
					System.out.println("  Omen: " + currency.omens);
				} else if (action instanceof Essence_currency currency && currency.omen != null) {
					System.out.println("  Omen: " + currency.omen);
				}
			}

			// Print resulting modifiers
			System.out.println("\n✓ Final Item Modifiers:");
			List<Modifier> finalMods = cp.candidate().getAllCurrentModifiers();
			for (Modifier m : finalMods) {
				boolean wasExisting = existingMods.stream().anyMatch(em -> em.text.equals(m.text));
				String tag = wasExisting ? "[EXISTING]" : "[ADDED]   ";
				System.out.println("  " + tag + " " + m.text);
			}

			System.out.println("\n");
		}

		System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		System.out.println("Summary:");
		System.out.println("  Total results found: " + results.size());
		System.out.println("  Best probability: " + String.format("%.6f%%", results.get(0).finalPercentage()));
		System.out.println("  Threshold used: " + (threshold / 100));
		System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

		System.out.println("\nFinished");
	}
}
