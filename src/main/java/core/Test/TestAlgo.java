package core.Test;


import core.Currency.*;
import core.Crafting.*;
import core.Crafting.Crafting_Item.CraftingActionType;
import core.Items.Body_Armours.Body_Armours_dex.*;

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

		CraftingActionType action = CraftingActionPicker.pickRandomActionType(item);

		System.out.println("Picked action: " + action);
	}
	
}
