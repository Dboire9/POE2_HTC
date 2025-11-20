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
        List<Modifier> possibleDesecratedSuffixes = testItem.getDesecratedAllowedSuffixes();

        List<ModifierTier> desiredModTier = new ArrayList<>();
        List<Modifier> desiredMods = new ArrayList<>();
        List<Modifier> undesiredMods = new ArrayList<>();
        Random random = new Random();
        Set<String> usedModifiers = new HashSet<>();

        // --- MANUAL MODIFIER SELECTION FOR TESTING ---
        // Find and add: Adds # to # Physical Damage T3
        for (Modifier mod : possiblePrefixes) {
            if (mod.text.equals("Adds # to # Physical Damage")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(2)); // T3 = index 2
                mod.chosenTier = 2;
                System.out.println(" - " + mod.text + " (Tier 3)");
                break;
            }
        }
        
        // Find and add: #% increased Physical Damage T3
        for (Modifier mod : possiblePrefixes) {
            if (mod.text.equals("#% increased Physical Damage")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(2)); // T3 = index 2
                mod.chosenTier = 2;
                System.out.println(" - " + mod.text + " (Tier 3)");
                break;
            }
        }
        
        // Find and add: Gain #% of Damage as Extra Lightning Damage (Perfect Essence)
        for (Modifier mod : possibleEssencesPrefixes) {
            if (mod.text.equals("Gain # % of Damage as Extra Lightning Damage")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println(" - " + mod.text + " (Perfect Essence)");
                break;
            }
        }
        
        // Find and add: (20–25)% chance to gain Onslaught (Perfect Essence)
        for (Modifier mod : possibleEssencesSuffixes) {
            if (mod.text.contains("chance to gain Onslaught")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println(" - " + mod.text + " (Perfect Essence)");
                break;
            }
        }
        
        // Find and add: +4 to Level of all Attack Skills (Perfect Essence)
        for (Modifier mod : possibleEssencesSuffixes) {
            if (mod.text.equals("+# to Level of all Attack Skills")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println(" - " + mod.text + " (Perfect Essence)");
                break;
            }
        }
        
        // Find and add: #% increased Attack Speed (Desecrated)
        for (Modifier mod : possibleDesecratedSuffixes) {
            if (mod.text.equals("#% increased Attack Speed\nCompanions have #% increased Attack Speed")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println(" - " + mod.text + " (Desecrated)");
                break;
            }
        }


        // --- CRAFTING EXECUTION SECTION ---
        double GLOBALTHRESHOLD = 33;

        try {
            long startTime = System.nanoTime();
            List<Probability_Analyzer.CandidateProbability> results =
                    CraftingExecutor.runCrafting(item, desiredMods, undesiredMods, GLOBALTHRESHOLD / 100);

            // Retry until we get valid results or threshold reaches zero
            while (results.isEmpty() && GLOBALTHRESHOLD > 0) {
                item.reset();
                GLOBALTHRESHOLD--;
                undesiredMods.clear();
                results = CraftingExecutor.runCrafting(item, desiredMods, undesiredMods, GLOBALTHRESHOLD / 100);
                System.out.println("Threshold countdown: " + GLOBALTHRESHOLD);
            }

            long durationInMillis = (System.nanoTime() - startTime) / 1_000_000;
            System.out.println("optimizeCrafting executed in " + durationInMillis + " ms\n");

            // --- SEARCH FOR OPTIMAL PATH ---
            searchForOptimalPath(results);

            // --- RESULTS DISPLAY SECTION ---
            displayResults(results, GLOBALTHRESHOLD, desiredMods);

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
     * Searches through all candidates for the optimal path pattern:
     * 1. Transmute + Aug (base with physical mods)
     * 2. Essence → #% increased Physical Damage
     * 3. Perfect Essence → Extra Lightning Damage with omen (100%)
     * 4-8. Perfect Essences for remaining mods
     */
    private static void searchForOptimalPath(List<Probability_Analyzer.CandidateProbability> results) {
        System.out.println("\n=== SEARCHING FOR OPTIMAL PATH ===");
        System.out.println("Looking for the complete optimal sequence:");
        System.out.println("  1. Transmute → Physical %");
        System.out.println("  2. Aug → +1 suffix");
        System.out.println("  3. Essence → Adds Physical flat (keeps suffix)");
        System.out.println("  4. Perfect Lightning with Dextral omen (100% - removes 1 suffix)");
        System.out.println("  5. Desecrated → adds throwaway suffix");
        System.out.println("  6. Perfect Onslaught with Dextral omen (100% - removes 1 suffix)");
        System.out.println("  7. Desecrated → adds throwaway suffix");
        System.out.println("  8. Perfect +Level with Dextral omen (50% - removes 1 of 2 suffixes)");
        System.out.println("  9. Desecrated → Attack Speed (final)\n");
        
        List<Probability_Analyzer.CandidateProbability> optimalCandidates = new ArrayList<>();
        
        for (Probability_Analyzer.CandidateProbability cp : results) {
            // Track the complete sequence
            List<String> sequence = new ArrayList<>();
            boolean hasOptimalStructure = true;
            
            int stepNum = 0;
            for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
                Crafting_Action action = entry.getKey();
                ModifierEvent event = entry.getValue();
                stepNum++;
                
                if (event.modifier != null) {
                    String modText = event.modifier.text;
                    String actionType = action.getClass().getSimpleName();
                    
                    // Build sequence description
                    String step = String.format("Step %d: %s → %s", stepNum, actionType, modText);
                    if (action instanceof Essence_currency essence && essence.omen != null) {
                        step += " (Omen: " + essence.omen + ")";
                    }
                    sequence.add(step);
                }
            }
            
            // Check for the specific optimal pattern
            boolean hasPhysicalFlat = false;
            boolean hasPhysicalPercent = false;
            boolean hasLightningAfterPhysical = false;
            boolean usedThrowawayBeforeLightning = false;
            boolean hasOnslaughtAfterThrowaway = false;
            boolean hasLevelAfterThrowaway = false;
            int desecratedBeforeFinalCount = 0;
            
            for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
                Crafting_Action action = entry.getKey();
                ModifierEvent event = entry.getValue();
                
                if (event.modifier != null) {
                    String modText = event.modifier.text;
                    
                    if (modText.equals("#% increased Physical Damage")) {
                        hasPhysicalPercent = true;
                    } else if (modText.equals("Adds # to # Physical Damage")) {
                        hasPhysicalFlat = true;
                    } else if (modText.equals("Gain # % of Damage as Extra Lightning Damage")) {
                        if (hasPhysicalFlat && hasPhysicalPercent) {
                            hasLightningAfterPhysical = true;
                            // Check if Lightning was applied with 100% probability (1 suffix removed)
                            if (action instanceof Essence_currency essence) {
                                Double prob = event.source.get(action);
                                if (prob != null && prob == 1.0) {
                                    usedThrowawayBeforeLightning = true;
                                }
                            }
                        }
                    } else if (modText.contains("chance to gain Onslaught")) {
                        if (hasLightningAfterPhysical) {
                            hasOnslaughtAfterThrowaway = true;
                        }
                    } else if (modText.equals("+# to Level of all Attack Skills")) {
                        if (hasOnslaughtAfterThrowaway) {
                            hasLevelAfterThrowaway = true;
                        }
                    } else if (action instanceof Desecrated_currency) {
                        if (!modText.contains("Attack Speed")) {
                            desecratedBeforeFinalCount++;
                        }
                    }
                }
            }
            
            // Check if matches optimal pattern
            if (hasPhysicalFlat && hasPhysicalPercent && hasLightningAfterPhysical && 
                usedThrowawayBeforeLightning && hasOnslaughtAfterThrowaway && 
                hasLevelAfterThrowaway && desecratedBeforeFinalCount >= 2) {
                
                double probability = cp.finalPercentage();
                System.out.println("✓✓✓ FOUND OPTIMAL PATH! ✓✓✓");
                System.out.println("Final probability: " + probability + "% (" + String.format("%.2e", probability / 100) + ")");
                System.out.println("\nComplete sequence:");
                for (String step : sequence) {
                    System.out.println("  " + step);
                }
                System.out.println();
                
                optimalCandidates.add(cp);
            }
        }
        
        if (optimalCandidates.isEmpty()) {
            System.out.println("❌ OPTIMAL PATH NOT FOUND in " + results.size() + " results");
            System.out.println("The algorithm did not discover the strategic throwaway-modifier path.\n");
        } else {
            System.out.println("✓ Found " + optimalCandidates.size() + " candidate(s) with optimal pattern");
            System.out.println("Best probability: " + optimalCandidates.stream()
                .mapToDouble(c -> c.finalPercentage())
                .max().orElse(0) + "%\n");
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

				// Get probability directly from the event's source map
				double percentage = event.source.get(action);

				System.out.println(cp.candidate().modifierHistory.get(z));
				
				// For Perfect Essence (CHANGED), show what modifier is being replaced
				if (event.type == ModifierEvent.ActionType.CHANGED && event.changed_modifier != null) {
					System.out.println("  ⟹ Replaces: " + event.changed_modifier.text);
				}
				
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
            System.out.println("Threshold used: " + (threshold / 100) + "\n");
        }

        // Display the desired modifiers summary
        for (Modifier mods : desiredMods)
            System.out.println("Desired mod: " + mods.text);

        System.out.println("Finished");
    }
}
