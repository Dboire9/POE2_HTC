package core.Test;

import java.util.*;
import java.util.concurrent.ExecutionException;

import core.Crafting.*;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Items.Bows.Bows;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Currency.*;

/**
 * TestAlgo
 * 
 * This class tests the crafting optimization algorithm by:
 *  - Generating a random test item (e.g., a Bow)
 *  - Selecting random desired modifiers and tiers
 *  - Running the crafting optimization algorithm
 *  - Displaying the best crafting paths and their probabilities
 */
public class TestAlgo {

    public static void main(String[] args) {

        // --- ITEM SETUP SECTION ---
        // Create a test item (Bow here, but can be replaced with another item type)
        Bows testItem = new Bows();
        Crafting_Item item = new Crafting_Item(testItem);

        // Get allowed prefixes and suffixes for the item
        List<Modifier> possiblePrefixes = testItem.getNormalAllowedPrefixes();
        List<Modifier> possibleSuffixes = testItem.getNormalAllowedSuffixes();
		List<Modifier> possibleEssencesPrefixes = testItem.getEssencesAllowedPrefixes();
        List<Modifier> possibleEssencesSuffixes = testItem.getEssencesAllowedSuffixes();

        List<ModifierTier> desiredModTier = new ArrayList<>();
        List<Modifier> desiredMods = new ArrayList<>();
        List<Modifier> undesiredMods = new ArrayList<>();
        Random random = new Random();
        Set<String> usedModifiers = new HashSet<>();

        // // --- RANDOM MODIFIER SELECTION ---
        // // Randomly select up to 3 prefixes
        // selectRandomModifiers(possiblePrefixes, desiredMods, desiredModTier, usedModifiers, random);

        // // Randomly select up to 3 suffixes
        // selectRandomModifiers(possibleSuffixes, desiredMods, desiredModTier, usedModifiers, random);

		// Test case: User-specified modifiers
		// Prefixes:
		// 1. Adds # to # Physical Damage (Tier 1)
		// 2. #% increased Physical Damage (Tier 3)
		// 3. Gain # % of Damage as Extra Lightning Damage (Perfect Essence)
		
		// Find "Adds # to # Physical Damage" - Tier 1
		for (Modifier mod : possiblePrefixes) {
			if (mod.text.contains("Adds") && mod.text.contains("Physical Damage")) {
				desiredMods.add(mod);
				desiredModTier.add(mod.tiers.get(2)); // Tier 3
				mod.chosenTier = 3;
				System.out.println("Prefix 1: " + mod.text + " (Tier 3)");
				break;
			}
		}
		
		// Find "#% increased Physical Damage" - Tier 3
		for (Modifier mod : possiblePrefixes) {
			if (mod.text.contains("% increased Physical Damage") && !mod.text.contains("Adds")) {
				desiredMods.add(mod);
				if (mod.tiers.size() >= 3) {
					desiredModTier.add(mod.tiers.get(2)); // Tier 3
					mod.chosenTier = 2;
					System.out.println("Prefix 2: " + mod.text + " (Tier 3)");
				}
				break;
			}
		}
		
		// Find "Gain # % of Damage as Extra Lightning Damage" (Perfect Essence)
		for (Modifier mod : possibleEssencesPrefixes) {
			if (mod.text.contains("Extra Lightning Damage")) {
				desiredMods.add(mod);
				desiredModTier.add(mod.tiers.get(0));
				mod.chosenTier = 0;
				System.out.println("Prefix 3: " + mod.text + " (Perfect Essence)");
				break;
			}
		}
		
		// Suffixes:
		// 1. +# to Level of all Attack Skills (Perfect Essence)
		// 2. #% chance to gain Onslaught on Killing Hits with this Weapon (Perfect Essence)
		// 3. #% increased Attack Speed (Desecrated - with companion bonus)
		
		// Find "+# to Level of all Attack Skills" (Perfect Essence)
		for (Modifier mod : possibleEssencesSuffixes) {
			if (mod.text.contains("Level of all Attack Skills")) {
				desiredMods.add(mod);
				desiredModTier.add(mod.tiers.get(0));
				mod.chosenTier = 0;
				System.out.println("Suffix 1: " + mod.text + " (Perfect Essence)");
				break;
			}
		}
		
		// Find "#% chance to gain Onslaught" (Perfect Essence)
		for (Modifier mod : possibleEssencesSuffixes) {
			if (mod.text.contains("Onslaught")) {
				desiredMods.add(mod);
				desiredModTier.add(mod.tiers.get(0));
				mod.chosenTier = 0;
				System.out.println("Suffix 2: " + mod.text + " (Perfect Essence)");
				break;
			}
		}
		
		// Find "#% increased Attack Speed" - this should be from Desecrated currency
		// Note: The "Companions have" part is an additional Desecrated bonus
		for (Modifier mod : possibleSuffixes) {
			if (mod.text.contains("% increased Attack Speed") && !mod.text.contains("Companions")) {
				desiredMods.add(mod);
				desiredModTier.add(mod.tiers.get(0));
				mod.chosenTier = 0;
				System.out.println("Suffix 3: " + mod.text + " (Desecrated)");
				break;
			}
		}
		
		System.out.println("\n=== Total desired modifiers: " + desiredMods.size() + " ===\n");


        // --- CRAFTING EXECUTION SECTION ---
        // Use the formalized threshold countdown pattern (official production API)
        ThresholdConfig config = ThresholdConfig.standard(); // 50% → 0% in 1% steps

        try {
            long startTime = System.nanoTime();
            
            // Run crafting with adaptive threshold countdown
            CraftingExecutor.CraftingResult result = 
                CraftingExecutor.runCrafting(item, desiredMods, undesiredMods, config);

            long durationInMillis = (System.nanoTime() - startTime) / 1_000_000;
            
            // Display execution metadata
            System.out.println("=== Execution Metadata ===");
            System.out.println(result);
            System.out.println("optimizeCrafting executed in " + durationInMillis + " ms\n");

            // --- RESULTS DISPLAY SECTION ---
            if (result.foundPaths()) {
                displayResults(result.getPaths(), result.getSuccessfulThreshold(), desiredMods);
            } else {
                System.out.println("No viable crafting paths found after " + 
                    result.getIterationCount() + " iterations");
                System.out.println("Try:");
                System.out.println("  - Reducing number of desired modifiers");
                System.out.println("  - Allowing more flexible modifier combinations");
                System.out.println("  - Using ThresholdConfig.thorough() for exhaustive search");
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }

    /**
     * Randomly selects up to 3 modifiers (prefixes or suffixes) from the given list.
     * Ensures no duplicates using a Set of used modifier names.
     */
    private static void selectRandomModifiers(List<Modifier> possibleMods,
                                              List<Modifier> desiredMods,
                                              List<ModifierTier> desiredModTier,
                                              Set<String> usedModifiers,
                                              Random random)
	{
        for (int i = 0; i < 3 && !possibleMods.isEmpty(); i++) {
            Modifier mod = possibleMods.get(random.nextInt(possibleMods.size()));
            if (usedModifiers.contains(mod.text)) {
                i--;
                continue;
            }
            desiredMods.add(mod);
            usedModifiers.add(mod.text);

            // Pick a random tier for this modifier
            List<ModifierTier> tiers = mod.tiers;
            if (!tiers.isEmpty()) {
                int rngNumber = random.nextInt(tiers.size());
                ModifierTier chosenTier = tiers.get(rngNumber);
                desiredModTier.add(chosenTier);
                mod.chosenTier = rngNumber;
                System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
            }
        }
    }

    /**
     * Displays the crafting results including:
     *  - Final probability
     *  - Sequence of crafting actions (path)
     *  - Modifiers obtained
     *  - Tier and Omen information when applicable
     */
    private static void displayResults(List<Probability_Analyzer.CandidateProbability> results,
                                       double threshold,
                                       List<Modifier> desiredMods)
	{
        for (int i = 0; i < Math.min(1, results.size()); i++) {
            Probability_Analyzer.CandidateProbability cp = results.get(i);
            System.out.println("Result #" + (i + 1) + " — Final %: " + cp.finalPercentage());
            System.out.println("Best Path:");

            int z = 0;
			for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
				Crafting_Action action = entry.getKey();
				ModifierEvent event = entry.getValue();

				// Get probability directly from the event’s source map
				double percentage = event.source.get(action);

				System.out.println(cp.candidate().modifierHistory.get(z));
				System.out.println("Action: " + action);
				System.out.println("  → Probability: " + (percentage * 100) + "%");

				// Display tier and omen details depending on the action type
				if (action instanceof ExaltedOrb currency) {
					System.out.println("  Tier: " + currency.tier);
					if (currency.omens != null) System.out.println("  Omen: " + currency.omens);
				} else if (action instanceof RegalOrb currency) {
					System.out.println("  Tier: " + currency.tier);
					if (currency.omen != null) System.out.println("  Omen: " + currency.omen);
				} else if (action instanceof AnnulmentOrb currency && currency.omen != null) {
					System.out.println("  Omen: " + currency.omen);
				} else if (action instanceof Desecrated_currency currency && currency.omens != null) {
					System.out.println("  Omen: " + currency.omens);
				} else if (action instanceof Essence_currency currency && currency.omen != null) {
					System.out.println("  Omen: " + currency.omen);
				}

				z++;
			}

            // Print resulting modifiers
            for (Modifier m : cp.candidate().getAllCurrentModifiers())
                System.out.println(m.text);

            System.out.println("-----------------------------------");
            System.out.println("Threshold used: " + threshold + "\n");
        }

        // Display the desired modifiers summary
        for (Modifier mods : desiredMods)
            System.out.println("Desired mod: " + mods.text);

        System.out.println("Finished");
    }
}
