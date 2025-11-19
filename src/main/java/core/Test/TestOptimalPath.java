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
 * TestOptimalPath
 * 
 * This test traces through the user's suggested optimal path:
 * 1. Start with bow that has "#% increased Physical Damage"
 * 2. Essence adds "Adds # to # Physical Damage" (T3) - 100%
 * 3. Perfect Essence of Electricity - 100%
 * 4. Exalted Orb #1 → adds suffix
 * 5. Exalted Orb #2 → adds suffix
 * 6. Perfect Essence with suffix omen - 100% (first)
 * 7. Perfect Essence with suffix omen - 50% (second)
 * 8. Desecrated currency - 50%
 * 
 * Expected probability: Much higher than current algorithm's path
 */
public class TestOptimalPath {

    public static void main(String[] args) {
        Bows testItem = new Bows();
        Crafting_Item item = new Crafting_Item(testItem);

        List<Modifier> possiblePrefixes = testItem.getNormalAllowedPrefixes();
        List<Modifier> possibleSuffixes = testItem.getNormalAllowedSuffixes();
        List<Modifier> possibleEssencesPrefixes = testItem.getEssencesAllowedPrefixes();
        List<Modifier> possibleEssencesSuffixes = testItem.getEssencesAllowedSuffixes();

        List<Modifier> desiredMods = new ArrayList<>();
        List<ModifierTier> desiredModTier = new ArrayList<>();

        System.out.println("=== Testing User's Optimal Path ===\n");

        // Same 6 modifiers as before
        for (Modifier mod : possiblePrefixes) {
            if (mod.text.contains("Adds") && mod.text.contains("Physical Damage")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(2)); // Tier 3
                mod.chosenTier = 2;
                System.out.println("Prefix 1: " + mod.text + " (Tier 3)");
                break;
            }
        }

        for (Modifier mod : possiblePrefixes) {
            if (mod.text.contains("% increased Physical Damage") && !mod.text.contains("Adds")) {
                desiredMods.add(mod);
                if (mod.tiers.size() >= 3) {
                    desiredModTier.add(mod.tiers.get(2));
                    mod.chosenTier = 2;
                    System.out.println("Prefix 2: " + mod.text + " (Tier 3)");
                }
                break;
            }
        }

        for (Modifier mod : possibleEssencesPrefixes) {
            if (mod.text.contains("Extra Lightning Damage")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println("Prefix 3: " + mod.text + " (Perfect Essence)");
                break;
            }
        }

        for (Modifier mod : possibleEssencesSuffixes) {
            if (mod.text.contains("Level of all Attack Skills")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println("Suffix 1: " + mod.text + " (Perfect Essence)");
                break;
            }
        }

        for (Modifier mod : possibleEssencesSuffixes) {
            if (mod.text.contains("Onslaught")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println("Suffix 2: " + mod.text + " (Perfect Essence)");
                break;
            }
        }

        for (Modifier mod : possibleSuffixes) {
            if (mod.text.contains("% increased Attack Speed") && !mod.text.contains("Companions")) {
                desiredMods.add(mod);
                desiredModTier.add(mod.tiers.get(0));
                mod.chosenTier = 0;
                System.out.println("Suffix 3: " + mod.text + " (Desecrated)");
                break;
            }
        }

        System.out.println("\n=== User's Optimal Path Logic ===");
        System.out.println("Step 1: Transmutation → Get '#% increased Physical Damage' (~probability varies)");
        System.out.println("Step 2: Essence → Add 'Adds # to # Physical Damage' T3 (100%)");
        System.out.println("Step 3: Perfect Essence of Electricity → Add 'Extra Lightning Damage' (100%)");
        System.out.println("   → Now have 3 prefixes ✓");
        System.out.println("Step 4: Exalted Orb #1 → Add random suffix (~8-20%)");
        System.out.println("Step 5: Exalted Orb #2 → Add random suffix (~8-20%)");
        System.out.println("Step 6: Perfect Essence + Suffix Omen → Replace suffix #1 with desired (100%)");
        System.out.println("Step 7: Perfect Essence + Suffix Omen → Replace suffix #2 with desired (50%)");
        System.out.println("Step 8: Desecrated → Add/replace final suffix (50%)");
        System.out.println("\nExpected probability: 0.10 * 1.0 * 1.0 * 0.15 * 0.15 * 1.0 * 0.5 * 0.5 ≈ 0.056% (5.6e-4)");
        System.out.println("This is MUCH higher than the 9.66e-24 currently found!\n");

        // Now run the algorithm and compare
        ThresholdConfig config = ThresholdConfig.standard();
        List<Modifier> undesiredMods = new ArrayList<>();

        try {
            long startTime = System.nanoTime();
            CraftingExecutor.CraftingResult result = 
                CraftingExecutor.runCrafting(item, desiredMods, undesiredMods, config);
            long durationInMillis = (System.nanoTime() - startTime) / 1_000_000;

            System.out.println("=== Algorithm's Result ===");
            System.out.println(result);
            System.out.println("Time: " + durationInMillis + " ms\n");

            if (result.foundPaths()) {
                Probability_Analyzer.CandidateProbability best = result.getPaths().get(0);
                System.out.println("Algorithm's best probability: " + best.finalPercentage());
                System.out.println("Expected optimal probability: ~5.6e-4 (0.056%)");
                
                double algorithmProb = best.finalPercentage();
                double expectedOptimalProb = 5.6e-4;
                
                if (algorithmProb < expectedOptimalProb * 0.1) {
                    System.out.println("\n⚠️  WARNING: Algorithm found suboptimal path!");
                    System.out.println("Algorithm is " + (expectedOptimalProb / algorithmProb) + "x worse than expected optimal");
                } else {
                    System.out.println("\n✓ Algorithm found near-optimal or better path");
                }
                
                System.out.println("\n=== Algorithm's Path ===");
                int stepNum = 1;
                for (Map.Entry<Crafting_Action, ModifierEvent> entry : best.bestPath().entrySet()) {
                    Crafting_Action action = entry.getKey();
                    ModifierEvent event = entry.getValue();
                    double prob = event.source.get(action) * 100;
                    
                    // Build action description with omen info
                    StringBuilder actionDesc = new StringBuilder(action.getClass().getSimpleName());
                    
                    // Add omen information if available
                    if (action instanceof ExaltedOrb) {
                        ExaltedOrb exalt = (ExaltedOrb) action;
                        if (exalt.omens != null && !exalt.omens.isEmpty() && !exalt.omens.contains(ExaltedOrb.Omen.None)) {
                            actionDesc.append(" (Omen: ").append(exalt.omens).append(")");
                        }
                    } else if (action instanceof Essence_currency) {
                        Essence_currency essence = (Essence_currency) action;
                        if (essence.omen != null && essence.omen != Essence_currency.Omen.None) {
                            actionDesc.append(" + ").append(essence.omen);
                        }
                    } else if (action instanceof Desecrated_currency) {
                        Desecrated_currency desecrated = (Desecrated_currency) action;
                        if (desecrated.omens != null && !desecrated.omens.isEmpty()) {
                            actionDesc.append(" (Omens: ").append(desecrated.omens).append(")");
                        }
                    } else if (action instanceof RegalOrb) {
                        RegalOrb regal = (RegalOrb) action;
                        if (regal.omen != null && regal.omen != RegalOrb.Omen.None) {
                            actionDesc.append(" + ").append(regal.omen);
                        }
                    } else if (action instanceof AnnulmentOrb) {
                        AnnulmentOrb annul = (AnnulmentOrb) action;
                        if (annul.omen != null && annul.omen != AnnulmentOrb.Omen.None) {
                            actionDesc.append(" + ").append(annul.omen);
                        }
                    }
                    
                    System.out.println("Step " + stepNum + ": " + actionDesc + 
                                     " → " + event.type + " (" + String.format("%.2f", prob) + "%)");
                    if (event.modifier != null) {
                        System.out.println("         Modifier: " + event.modifier.text);
                    }
                    stepNum++;
                }
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}
