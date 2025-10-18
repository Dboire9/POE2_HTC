package core.Test;


import core.Currency.*;
import core.Currency.Omens_currency.Omen;
import core.Crafting.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Items.Body_Armours.Body_Armours_dex.*;


import static core.Test.TestOrbs.applyAndShowChanges;
import static core.Test.TestOrbs.printItem;

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


		applyAndShowChanges(item, trans_greater, "Transmutation Orb → Magic");
		// printItem(item, "Full item");
		applyAndShowChanges(item, aug_greater, "Augmentation Orb");
		
		item.applyAction(item, regal_greater);
		printItem(item, "Full item");



		CraftingActionType action = CraftingActionPicker.pickRandomActionType(item);

		System.out.println("Picked action: " + action);

		Omen applyingOmen = CraftingOmenPicker.pickRandomOmen(item, Omen.getAllOmens());
		System.out.println(applyingOmen);
		item.addActiveOmen(applyingOmen);

		Crafting_Action currency = CraftingCurrencyPicker.pickRandomCurrency(item);
		System.out.println(currency);

		Crafting_Action applyingEssence = CraftingEssencePicker.pickRandomEssence();
		System.out.println(applyingEssence);
	}
	
}
