package core.Test;

import core.Currency.*;
import core.Crafting.*;
import core.Currency.Essences.*;
import core.Currency.Omens_currency.Omen;
import core.Currency.Omens_currency.OmenOfDextralCrystallisation;
import core.Currency.Omens_currency.OmenOfDextralErasure;
import core.Currency.Omens_currency.OmenOfGreaterExaltation;
import core.Currency.Omens_currency.OmenOfSinistralCrystallisation;
import core.Currency.Omens_currency.OmenOfSinistralErasure;
import core.Currency.Omens_currency.OmenOfSinistralExaltation;
import core.Currency.Omens_currency.OmenOfDextralExaltation;
import core.Items.Boots.Boots_str_dex.*;
import core.Items.Body_Armours.Body_Armours_dex.*;
import core.Modifier_class.*;
import static core.Test.TestOrbs.applyAndShowChanges;
import static core.Test.TestOrbs.printItem;

public class TestOmens {

	public static void main(String[] args) {
		// 1️⃣ Create base item
		Body_Armours_dex testItem = new Body_Armours_dex();
		Crafting_Item item = new Crafting_Item(testItem);

		// 2️⃣ Create Orbs (PERFECT tier for testing)
		TransmutationOrb trans = new TransmutationOrb(TransmutationOrb.CurrencyTier.BASE);
		AugmentationOrb aug = new AugmentationOrb(AugmentationOrb.CurrencyTier.BASE);
		RegalOrb regal = new RegalOrb(RegalOrb.CurrencyTier.BASE);
		ExaltedOrb exalt = new ExaltedOrb(ExaltedOrb.CurrencyTier.BASE);
		ChaosOrb chaos = new ChaosOrb(ChaosOrb.CurrencyTier.BASE);
		AnnulmentOrb annul = new AnnulmentOrb();
		Desecrated_currency des = new Desecrated_currency(null);

		Essence_currency perfectBody = new Essences.EssenceOfTheBody(Essence_currency.EssenceTier.PERFECT);

		Omen omenGreaterExalt = new OmenOfGreaterExaltation();
		Omen omenSinistralExalt = new OmenOfSinistralExaltation();
		Omen omenDextralExalt = new OmenOfDextralExaltation();

		Omen omenSinistralErasure = new OmenOfSinistralErasure();
		Omen omenDextralErasure = new OmenOfDextralErasure();

		Omen omendexCrystal = new OmenOfDextralCrystallisation();
		Omen omensinCrystal = new OmenOfSinistralCrystallisation();

		// Apply changes and print results
		applyAndShowChanges(item, trans, "Transmutation Orb → Magic");
		printItem(item, "Full item");
		applyAndShowChanges(item, aug, "Augmentation Orb");
		printItem(item, "Full item");

		applyAndShowChanges(item, regal, "Regal Orb → Rare");
		printItem(item, "Full item");

		// item.addActiveOmen(omenGreaterExalt);
		// item.addActiveOmen(omenDextralExalt);
		// item.applyAction(item, exalt);

		item.addActiveOmen(omendexCrystal);
		System.out.println("active omens : " + item.getActiveOmens());
		item.applyAction(item, perfectBody);
		printItem(item, "Full item");

		// // item.addActiveOmen(omenDextralExalt);
		// item.addActiveOmen(omenGreaterExalt);
		// applyAndShowChanges(item, annul, "Annul");
		// applyAndShowChanges(item, annul, "Annul");
		// printItem(item, "Full item after annul");
		// item.addActiveOmen(omenSinistralExalt);
		// System.out.println("active omens : " + item.getActiveOmens());
		// item.applyAction(item, exalt);
		// printItem(item, "Full item after redoing omens");

		// item.addActiveOmen(omenDextralErasure);
		// System.out.println("active omens chaos : " + item.getActiveOmens());
		// item.applyAction(item, chaos);
		// printItem(item, "Full item after dex erasure omens");
		// item.addActiveOmen(omenSinistralErasure);
		// item.applyAction(item, chaos);
		// printItem(item, "Full item after sin erasure omens");
	}
}