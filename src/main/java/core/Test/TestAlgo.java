package core.Test;


import java.util.ArrayList;
import java.util.Currency;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import core.Crafting.CraftingExecutor;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Algorithm;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Items.Amulets.Amulets;
import core.Items.Bows.Bows;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Crafting.Probability;
import core.Crafting.Probability_Analyzer;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;

public class TestAlgo {


		public static void main (String[] args){

		Bows testItem = new Bows();
		Crafting_Item item = new Crafting_Item(testItem);


		// Getting random desired modifiers tiers for test purpose
		List<Modifier> PossiblePrefixes = testItem.getNormalAllowedPrefixes();
		List<Modifier> PossibleSuffixes = testItem.getNormalAllowedSuffixes();

		// List<Modifier> PossibleEssencePrefixes = testItem.getEssencesAllowedPrefixes();
		// List<Modifier> PossibleEssenceSuffixes = testItem.getEssencesAllowedSuffixes();

		List<ModifierTier> desiredModTier = new ArrayList<>();
		List<Modifier> desiredMod = new ArrayList<>();
		List<Modifier> undesiredMod = new ArrayList<>();
		Random random = new Random();

		Set<String> usedModifiers = new HashSet<>();

		// Pick up to 3 random prefix tiers
		for (int i = 0; i < 3 && !PossiblePrefixes.isEmpty(); i++) {
			Modifier mod = PossiblePrefixes.get(random.nextInt(PossiblePrefixes.size()));
			if (usedModifiers.contains(mod.text)) {
				i--;
				continue;
			}
			desiredMod.add(mod);
			usedModifiers.add(mod.text);
			List<ModifierTier> tiers = mod.tiers;
			if (!tiers.isEmpty()) {
				int rngNumber = random.nextInt(tiers.size()); // Generate the random number
				ModifierTier chosenTier = tiers.get(rngNumber); // Use the random number to get the tier
				desiredModTier.add(chosenTier);
				mod.chosenTier = rngNumber;
				System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
			}
		}

		// Pick up to 3 random suffix tiers
		for (int i = 0; i < 3 && !PossibleSuffixes.isEmpty(); i++) {
			Modifier mod = PossibleSuffixes.get(random.nextInt(PossibleSuffixes.size()));
			if (usedModifiers.contains(mod.text)) {
				i--;
				continue;
			}
			desiredMod.add(mod);
			usedModifiers.add(mod.text);
			List<ModifierTier> tiers = mod.tiers;
			if (!tiers.isEmpty()) {
				int rngNumber = random.nextInt(tiers.size()); // Generate the random number
				ModifierTier chosenTier = tiers.get(rngNumber); // Use the random number to get the tier
				desiredModTier.add(chosenTier);
				mod.chosenTier = rngNumber;
				System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
			}
		}
		// Modifier mod = PossibleEssenceSuffixes.get(2);
		// desiredMod.add(mod);
		// List<ModifierTier> tiers = mod.tiers;
		// ModifierTier chosenTier = tiers.get(0);
		// desiredModTier.add(chosenTier);
		// mod.chosenTier = 0;
		// System.out.println(" - " + mod.text + " (Tier " + 0 + ")");

		// Try and catching if there is thread errors
		double GLOBALTHRESHOLD = 20;
		try {
			long startTime = System.nanoTime(); // start timing
			List<Probability_Analyzer.CandidateProbability> results;
			results = CraftingExecutor.runCrafting(item, desiredMod, undesiredMod, GLOBALTHRESHOLD / 100);

			while(results.isEmpty())
			{
				item.reset();
				GLOBALTHRESHOLD--;
				undesiredMod.clear();
				results = CraftingExecutor.runCrafting(item, desiredMod, undesiredMod, GLOBALTHRESHOLD / 100);
			}

			long endTime = System.nanoTime();   // end timing
			long durationInMillis = (endTime - startTime) / 1_000_000; // convert to ms

			System.out.println("optimizeCrafting executed in " + durationInMillis + " ms");
			System.out.println("End");

			for (int i = 0; i < Math.min(10, results.size()); i++) {
				Probability_Analyzer.CandidateProbability cp = results.get(i);
				System.out.println("Result #" + (i + 1) + " — Final %: " + cp.finalPercentage());
				System.out.println("Best Path:");
				int z = 0;
				for (Map.Entry<Crafting_Action, Double> entry : cp.bestPath().entrySet()) {
					Crafting_Action action = entry.getKey();
					double percentage = entry.getValue();
				
					System.out.println(cp.candidate().modifierHistory.get(z));
					System.out.println("Action: " + action);
					System.out.println("  → Percentage: " + (percentage * 100) + "%");
					
					if (action instanceof ExaltedOrb currency) {  // Java 16+ pattern matching syntax
						System.out.println("  Tier: " + currency.tier);
						if (currency.omens != null) {
							System.out.println("  Omen: " + currency.omens);
						}
					}
					if (action instanceof RegalOrb currency) {  // Java 16+ pattern matching syntax
						System.out.println("  Tier: " + currency.tier);
						if (currency.omen != null) {
							System.out.println("  Omen: " + currency.omen);
						}
					}
					if (action instanceof AnnulmentOrb currency) {  // Java 16+ pattern matching syntax
						if (currency.omen != null) {
							System.out.println("  Omen: " + currency.omen);
						}
					}
					if (action instanceof Desecrated_currency currency) {  // Java 16+ pattern matching syntax
						if (currency.omens != null) {
							System.out.println("  Omen: " + currency.omens);
						}
					}
					if (action instanceof Essence_currency currency) {  // Java 16+ pattern matching syntax
						if (currency.omen != null) {
							System.out.println("  Omen: " + currency.omen);
						}
					}
				}
				for(Modifier m : cp.candidate().getAllCurrentModifiers())
					System.out.println(m.text + "\n");
				System.out.println("-----------------------------------");
				System.out.println(GLOBALTHRESHOLD / 100);
			}

			for (Modifier mods : desiredMod)
				System.out.println("Desired mods" + mods.text);
			System.out.println("Finished");
		}
		catch (InterruptedException | ExecutionException e)
		{
			e.printStackTrace();
		}
	}
	
}
