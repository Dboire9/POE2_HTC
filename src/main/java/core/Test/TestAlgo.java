package core.Test;

import java.util.*;
import java.util.concurrent.ExecutionException;

import core.Crafting.*;
import core.Crafting.Proba.Probability_Analyzer;
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

        // --- RANDOM MODIFIER SELECTION ---
        // Randomly select up to 3 prefixes
        selectRandomModifiers(possiblePrefixes, desiredMods, desiredModTier, usedModifiers, random);

        // Randomly select up to 3 suffixes
        selectRandomModifiers(possibleSuffixes, desiredMods, desiredModTier, usedModifiers, random);

		// desiredMods.add(possiblePrefixes.get(0));
		// desiredModTier.add(possiblePrefixes.get(0).tiers.get(0));
		// System.out.println(possiblePrefixes.get(0).text);
		// desiredMods.add(possiblePrefixes.get(4));
		// desiredModTier.add(possiblePrefixes.get(4).tiers.get(0));
		// System.out.println(possiblePrefixes.get(4).text);
		// desiredMods.add(possibleEssencesPrefixes.get(8));
		// desiredModTier.add(possibleEssencesPrefixes.get(8).tiers.get(0));
		// System.out.println(possibleEssencesPrefixes.get(8).text);
		// desiredMods.add(possibleEssencesSuffixes.get(4));
		// desiredModTier.add(possibleEssencesSuffixes.get(4).tiers.get(0));
		// System.out.println(possibleEssencesSuffixes.get(4).text);
		// desiredMods.add(possibleEssencesSuffixes.get(5));
		// desiredModTier.add(possibleEssencesSuffixes.get(5).tiers.get(0));
		// System.out.println(possibleEssencesSuffixes.get(5).text);
		// desiredMods.add(possibleSuffixes.get(9));
		// desiredModTier.add(possibleSuffixes.get(9).tiers.get(0));
		// System.out.println(possibleSuffixes.get(9).text);


        // --- CRAFTING EXECUTION SECTION ---
        double GLOBALTHRESHOLD = 50;

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
            System.out.println("Threshold used: " + (threshold / 100) + "\n");
        }

        // Display the desired modifiers summary
        for (Modifier mods : desiredMods)
            System.out.println("Desired mod: " + mods.text);

        System.out.println("Finished");
    }
}
