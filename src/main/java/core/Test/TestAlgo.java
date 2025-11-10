package core.Test;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import core.Crafting.Crafting_Algorithm;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Items.Bows.Bows;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Crafting.Probability;
import core.Crafting.Probability_Analyzer;

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
		// try {
		// 	List<Crafting_Candidate> highScoreCandidates = new ArrayList<>();
		// 	long startTime = System.nanoTime(); // start timing

		// 	// highScoreCandidates = Crafting_Algorithm.optimizeCrafting(item, desiredMod, undesiredMod);

		// 	long endTime = System.nanoTime();   // end timing
		// 	long durationInMillis = (endTime - startTime) / 1_000_000; // convert to ms

			
		// 	// Calculating the sum of percentage to lead to the full 6 modifiers. Need to check for omens in some cases
		// 	Probability.ComputingProbability(highScoreCandidates, desiredMod, item);
		// 	Probability_Analyzer.Analyze(highScoreCandidates);
		// 	System.out.println("optimizeCrafting executed in " + durationInMillis + " ms");
		// 	System.out.println("End");
		// }
		// catch (InterruptedException | ExecutionException e)
		// {
		// 	e.printStackTrace();
		// }
	}
	
}
