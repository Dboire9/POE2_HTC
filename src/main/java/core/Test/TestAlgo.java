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
import java.util.List;
import java.util.Random;

public class TestAlgo {


		public static void main (String[] args){

		Body_Armours_dex testItem = new Body_Armours_dex();
		Crafting_Item item = new Crafting_Item(testItem);


		TransmutationOrb trans_base = new TransmutationOrb(TransmutationOrb.CurrencyTier.BASE);
		TransmutationOrb trans_greater = new TransmutationOrb(TransmutationOrb.CurrencyTier.GREATER);
		TransmutationOrb trans_perfect = new TransmutationOrb(TransmutationOrb.CurrencyTier.PERFECT);

		AugmentationOrb aug_base = new AugmentationOrb(AugmentationOrb.CurrencyTier.BASE);
		AugmentationOrb aug_greater = new AugmentationOrb(AugmentationOrb.CurrencyTier.GREATER);
		AugmentationOrb aug_perfect = new AugmentationOrb(AugmentationOrb.CurrencyTier.PERFECT);

		RegalOrb regal_basic = new RegalOrb(RegalOrb.CurrencyTier.BASE);
		RegalOrb regal_greater = new RegalOrb(RegalOrb.CurrencyTier.GREATER);
		RegalOrb regal_perfect = new RegalOrb(RegalOrb.CurrencyTier.PERFECT);

		ExaltedOrb exalt_base = new ExaltedOrb(ExaltedOrb.CurrencyTier.BASE);
		ExaltedOrb exalt_greater = new ExaltedOrb(ExaltedOrb.CurrencyTier.GREATER);
		ExaltedOrb exalt_perfect = new ExaltedOrb(ExaltedOrb.CurrencyTier.PERFECT);
		
		ChaosOrb chaos_base = new ChaosOrb(ChaosOrb.CurrencyTier.BASE);
		ChaosOrb chaos_greater = new ChaosOrb(ChaosOrb.CurrencyTier.GREATER);
		ChaosOrb chaos_perfect = new ChaosOrb(ChaosOrb.CurrencyTier.PERFECT);

		AnnulmentOrb annul = new AnnulmentOrb();
		Desecrated_currency des = new Desecrated_currency(null);


		// Getting random desired modifiers tiers for test purpose
		List<Modifier> PossiblePrefixes = testItem.getNormalAllowedPrefixes();
		List<Modifier> PossibleSuffixes = testItem.getNormalAllowedSuffixes();

		List<ModifierTier> desiredMods = new ArrayList<>();
		Random random = new Random();

		// Pick up to 3 random prefix tiers
		for (int i = 0; i < 3 && !PossiblePrefixes.isEmpty(); i++) {
			Modifier mod = PossiblePrefixes.get(random.nextInt(PossiblePrefixes.size()));
			List<ModifierTier> tiers = mod.tiers;
			if (!tiers.isEmpty()) {
				int rngNumber = random.nextInt(tiers.size()); // Generate the random number
				ModifierTier chosenTier = tiers.get(rngNumber); // Use the random number to get the tier
				desiredMods.add(chosenTier);
				System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
			}
		}

		// Pick up to 3 random suffix tiers
		for (int i = 0; i < 3 && !PossibleSuffixes.isEmpty(); i++) {
			Modifier mod = PossibleSuffixes.get(random.nextInt(PossibleSuffixes.size()));
			List<ModifierTier> tiers = mod.tiers;
			if (!tiers.isEmpty()) {
				int rngNumber = random.nextInt(tiers.size()); // Generate the random number
				ModifierTier chosenTier = tiers.get(rngNumber); // Use the random number to get the tier
				desiredMods.add(chosenTier);
				System.out.println(" - " + mod.text + " (Tier " + rngNumber + ")");
			}
		}

		Crafting_Simulator.runCraftingSimulation(item, 10, desiredMods);






	}
	
}
