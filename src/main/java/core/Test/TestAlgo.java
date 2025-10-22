package core.Test;


import core.Currency.*;
import core.Currency.Omens_currency.Omen;
import core.Crafting.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Items.Body_Armours.Body_Armours_dex.*;
import core.Modifier_class.*;


import static core.Test.TestOrbs.applyAndShowChanges;
import static core.Test.TestOrbs.printItem;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class TestAlgo {


		public static void main (String[] args){

		Body_Armours_dex testItem = new Body_Armours_dex();
		Crafting_Item item = new Crafting_Item(testItem);


		// Getting random desired modifiers tiers for test purpose
		List<Modifier> PossiblePrefixes = testItem.getNormalAllowedPrefixes();
		List<Modifier> PossibleSuffixes = testItem.getNormalAllowedSuffixes();

		List<ModifierTier> desiredModTier = new ArrayList<>();
		List<Modifier> desiredMod = new ArrayList<>();
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
				System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
			}
		}

		Crafting_Algorithm.optimizeCrafting(item, desiredMod, desiredModTier);
	}
	
}
