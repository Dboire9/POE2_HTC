package core.Test;

import java.util.*;
import java.util.concurrent.ExecutionException;

import core.Crafting.*;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Items.Boots.Boots_int.Boots_int;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Currency.*;

/**
 * TestAlgoWithExistingMods
 * 
 * This class tests the crafting optimization algorithm for items that already have existing modifiers.
 * 
 * Scenario: Start with a RARE Boots_int that already has:
 *   - +# to maximum Energy Shield (Prefix T1)
 *   - #% increased Energy Shield (Prefix T1)
 * 
 * Target: Add these modifiers:
 *   - #% increased Movement Speed (Prefix T1)
 *   - +#% to Cold Resistance (Suffix T1)
 *   - +#% to Fire Resistance (Suffix T1)
 *   - +#% to Lightning Resistance (Suffix T1)
 */
public class TestAlgoWithExistingMods {

    public static void main(String[] args) {

        // --- ITEM SETUP SECTION ---
        System.out.println("=== TESTING CRAFTING WITH EXISTING MODIFIERS ===\n");
        
        // Create a test item (Boots_int)
        Boots_int testItem = new Boots_int();
        Crafting_Item item = new Crafting_Item(testItem);
        
        // Set item rarity to RARE (can have up to 3 prefix + 3 suffix)
        item.rarity = Crafting_Item.ItemRarity.RARE;
        System.out.println("Item Rarity: " + item.rarity);
        System.out.println("Max slots: 3 Prefix / 3 Suffix\n");

        // Get allowed modifiers for the item
        List<Modifier> possiblePrefixes = testItem.getNormalAllowedPrefixes();
        List<Modifier> possibleSuffixes = testItem.getNormalAllowedSuffixes();
        List<Modifier> possibleEssencesPrefixes = testItem.getEssencesAllowedPrefixes();
        List<Modifier> possibleEssencesSuffixes = testItem.getEssencesAllowedSuffixes();
        List<Modifier> possibleDesecratedPrefixes = testItem.getDesecratedAllowedPrefixes();
        List<Modifier> possibleDesecratedSuffixes = testItem.getDesecratedAllowedSuffixes();

        // Combine all prefixes and suffixes
        List<Modifier> allPrefixes = new ArrayList<>();
        if (possiblePrefixes != null) allPrefixes.addAll(possiblePrefixes);
        if (possibleEssencesPrefixes != null) allPrefixes.addAll(possibleEssencesPrefixes);
        if (possibleDesecratedPrefixes != null) allPrefixes.addAll(possibleDesecratedPrefixes);

        List<Modifier> allSuffixes = new ArrayList<>();
        if (possibleSuffixes != null) allSuffixes.addAll(possibleSuffixes);
        if (possibleEssencesSuffixes != null) allSuffixes.addAll(possibleEssencesSuffixes);
        if (possibleDesecratedSuffixes != null) allSuffixes.addAll(possibleDesecratedSuffixes);

        // --- EXISTING MODIFIERS SETUP ---
        List<Modifier> existingMods = new ArrayList<>();
        
        System.out.println("EXISTING MODIFIERS (already on the item):");
        
        // Existing Prefix 1: +# to maximum Energy Shield T1
        for (Modifier mod : allPrefixes) {
            if (mod.text.equals("+# to maximum Energy Shield")) {
                Modifier existing1 = mod;
                existing1.chosenTier = 0; // T1
                existingMods.add(existing1);
                
                // Apply to item
                ModifierTier tier = existing1.tiers.get(0);
                item.addPrefix(existing1, tier);
                
                System.out.println(" - [PREFIX] " + existing1.text + " (Tier 1)");
                break;
            }
        }
        
        // Existing Prefix 2: #% increased Energy Shield T1
        for (Modifier mod : allPrefixes) {
            if (mod.text.equals("#% increased Energy Shield")) {
                Modifier existing2 = mod;
                existing2.chosenTier = 0; // T1
                existingMods.add(existing2);
                
                // Apply to item
                ModifierTier tier = existing2.tiers.get(0);
                item.addPrefix(existing2, tier);
                
                System.out.println(" - [PREFIX] " + existing2.text + " (Tier 1)");
                break;
            }
        }
        
        System.out.println("\nItem now has " + item.getAllCurrentModifiers().size() + " modifiers");
        System.out.println("Available slots: 1 Prefix / 3 Suffix\n");

        // --- TARGET MODIFIERS SETUP (what we want to add) ---
        List<Modifier> desiredMods = new ArrayList<>();
        List<Modifier> undesiredMods = new ArrayList<>();
        
        System.out.println("TARGET MODIFIERS (what we want to add):");
        System.out.println("Prefixes:");
        
        // Target Prefix 1: #% increased Movement Speed T1
        for (Modifier mod : allPrefixes) {
            if (mod.text.equals("#% increased Movement Speed")) {
                mod.chosenTier = 0;
                mod.is_desired_mod = true;
                desiredMods.add(mod);
                System.out.println(" - " + mod.text + " (Tier 1)");
                break;
            }
        }
        
        System.out.println("Suffixes:");
        
        // Target Suffix 1: +#% to Cold Resistance T1
        for (Modifier mod : allSuffixes) {
            if (mod.text.equals("+#% to Cold Resistance")) {
                mod.chosenTier = 0;
                mod.is_desired_mod = true;
                desiredMods.add(mod);
                System.out.println(" - " + mod.text + " (Tier 1)");
                break;
            }
        }
        
        // Target Suffix 2: +#% to Fire Resistance T1
        for (Modifier mod : allSuffixes) {
            if (mod.text.equals("+#% to Fire Resistance")) {
                mod.chosenTier = 0;
                mod.is_desired_mod = true;
                desiredMods.add(mod);
                System.out.println(" - " + mod.text + " (Tier 1)");
                break;
            }
        }
        
        // Target Suffix 3: +#% to Lightning Resistance T1
        for (Modifier mod : allSuffixes) {
            if (mod.text.equals("+#% to Lightning Resistance")) {
                mod.chosenTier = 0;
                mod.is_desired_mod = true;
                desiredMods.add(mod);
                System.out.println(" - " + mod.text + " (Tier 1)");
                break;
            }
        }

        System.out.println("\nTotal: " + existingMods.size() + " existing + " + desiredMods.size() + " target = " + (existingMods.size() + desiredMods.size()) + " total mods");

        // --- CRAFTING EXECUTION SECTION ---
        double GLOBALTHRESHOLD = 33;

        try {
            long startTime = System.nanoTime();
            
            // Use the special method for existing mods
            List<Probability_Analyzer.CandidateProbability> results =
                    CraftingExecutor.runCraftingWithExistingMods(
                        item, 
                        desiredMods, 
                        undesiredMods, 
                        GLOBALTHRESHOLD / 100,
                        existingMods
                    );

            // Retry until we get valid results or threshold reaches zero
            while (results.isEmpty() && GLOBALTHRESHOLD > 0) {
                item.reset();
                
                // IMPORTANT: Restore rarity after reset
                item.rarity = Crafting_Item.ItemRarity.RARE;
                
                // Re-apply existing mods after reset
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
                
                results = CraftingExecutor.runCraftingWithExistingMods(
                    item, 
                    desiredMods, 
                    undesiredMods, 
                    GLOBALTHRESHOLD / 100,
                    existingMods
                );
                System.out.println("Threshold countdown: " + GLOBALTHRESHOLD);
            }

            long durationInMillis = (System.nanoTime() - startTime) / 1_000_000;
            System.out.println("\noptimizeCraftingWithExistingMods executed in " + durationInMillis + " ms\n");

            // --- RESULTS DISPLAY SECTION ---
            displayResults(results, GLOBALTHRESHOLD, desiredMods, existingMods);

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
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
                                       List<Modifier> desiredMods,
                                       List<Modifier> existingMods)
    {
        System.out.println("=== CRAFTING RESULTS ===\n");
        System.out.println("Found " + results.size() + " possible crafting paths");
        System.out.println("Threshold used: " + (threshold / 100) + "\n");
        
        for (int i = 0; i < Math.min(5, results.size()); i++) {
            Probability_Analyzer.CandidateProbability cp = results.get(i);
            System.out.println("--- Result #" + (i + 1) + " ---");
            System.out.println("Final Probability: " + cp.finalPercentage() + "%");
            System.out.println("Best Path (" + cp.bestPath().size() + " steps):");

            int z = 0;
            for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
                Crafting_Action action = entry.getKey();
                ModifierEvent event = entry.getValue();

                // Get probability directly from the event's source map
                Double probability = event.source.get(action);
                double percentage = probability != null ? probability : 0.0;

                System.out.println("\nStep " + (z + 1) + ":");
                System.out.println("  " + cp.candidate().modifierHistory.get(z));
                
                // For Perfect Essence (CHANGED), show what modifier is being replaced
                if (event.type == ModifierEvent.ActionType.CHANGED && event.changed_modifier != null) {
                    System.out.println("  ⟹ Replaces: " + event.changed_modifier.text);
                }
                
                System.out.println("  Action: " + action.getClass().getSimpleName());
                System.out.println("  Probability: " + (percentage * 100) + "%");

                // Display tier and omen details depending on the action type
                if (action instanceof ExaltedOrb currency) {
                    System.out.println("  Tier: " + currency.tier);
                    if (currency.omens != null) System.out.println("  Omens: " + currency.omens);
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

            // Print final modifiers on item
            System.out.println("\n  Final Modifiers on Item:");
            List<Modifier> finalMods = cp.candidate().getAllCurrentModifiers();
            for (Modifier m : finalMods) {
                boolean isExisting = existingMods.stream().anyMatch(em -> em.text.equals(m.text));
                boolean isTarget = desiredMods.stream().anyMatch(dm -> dm.text.equals(m.text));
                String label = isExisting ? "[EXISTING]" : (isTarget ? "[TARGET]" : "[OTHER]");
                System.out.println("    " + label + " " + m.text);
            }

            System.out.println("\n-----------------------------------\n");
        }

        // Display summary
        System.out.println("=== SUMMARY ===");
        System.out.println("Existing modifiers:");
        for (Modifier mod : existingMods)
            System.out.println("  - " + mod.text);
        
        System.out.println("\nTarget modifiers:");
        for (Modifier mod : desiredMods)
            System.out.println("  - " + mod.text);

        System.out.println("\nFinished");
    }
}
