package core.Test;

import core.Currency.*;
import core.Currency.Essence_currency.EssenceTier;
import core.Crafting.*;
import core.Currency.Essences.*;
import core.Currency.Omens_currency.Omen;
import core.Currency.Omens_currency.OmenOfDextralCrystallisation;
import core.Currency.Omens_currency.OmenOfDextralErasure;
import core.Currency.Omens_currency.OmenOfGreaterExaltation;
import core.Currency.Omens_currency.OmenOfHomogenisingCoronation;
import core.Currency.Omens_currency.OmenOfHomogenisingExaltation;
import core.Currency.Omens_currency.OmenOfSinistralCrystallisation;
import core.Currency.Omens_currency.OmenOfSinistralErasure;
import core.Currency.Omens_currency.OmenOfSinistralExaltation;
import core.Currency.Omens_currency.OmenOfSinistralNecromancy;
import core.Currency.Omens_currency.OmenOfDextralExaltation;
import core.Currency.Omens_currency.OmenOfDextralNecromancy;
import core.Items.Boots.Boots_str_dex.*;
import core.Items.Body_Armours.Body_Armours_dex.*;
import core.Modifier_class.*;
import static core.Test.TestOrbs.applyAndShowChanges;
import static core.Test.TestOrbs.ApplyAndShowChangesDesecrate;
import static core.Test.TestOrbs.BlockAndShowChangesDesecrate;
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

		// This is giving me an error but it works
		// Essence_currency perfectBody = new Essences.EssenceOfTheBody(Essence_currency.EssenceTier.PERFECT);

		// String type = Essence_currency.pickRandomEssenceType();
		// Essence_currency essence = Essence_currency.create(type, tier);

		// System.out.println(essence);

		Omen omenGreaterExalt = new OmenOfGreaterExaltation();
		Omen omenSinistralExalt = new OmenOfSinistralExaltation();
		Omen omenDextralExalt = new OmenOfDextralExaltation();
		Omen omenHomogExalt = new OmenOfHomogenisingExaltation();

		Omen omenSinistralErasure = new OmenOfSinistralErasure();
		Omen omenDextralErasure = new OmenOfDextralErasure();

		Omen omendexCrystal = new OmenOfDextralCrystallisation();
		Omen omensinCrystal = new OmenOfSinistralCrystallisation();

		Omen omencoronation = new OmenOfHomogenisingCoronation();

		Omen omendexnecro = new OmenOfDextralNecromancy();
		Omen omensinnecro = new OmenOfSinistralNecromancy();

		// Apply changes and print results
		applyAndShowChanges(item, trans, "Transmutation Orb → Magic");
		printItem(item, "Full item");
		applyAndShowChanges(item, aug, "Augmentation Orb");
		printItem(item, "Full item");

		item.addActiveOmen(omencoronation);
		item.applyOmens(item, regal);
		System.out.println("active omens : " + item.getActiveOmens());
		applyAndShowChanges(item, regal, "Regal Orb → Rare");
		printItem(item, "Full item after regal and before exalt");
		

		item.addActiveOmen(omensinnecro);
		item.applyOmens(item, des);
		item.addActiveOmen(omendexnecro);
		item.applyOmens(item, des);
		BlockAndShowChangesDesecrate(item, des, "block");
		BlockAndShowChangesDesecrate(item, des, "block");
		printItem(item, "Full item");
		ApplyAndShowChangesDesecrate(item, des, "des apply");
		ApplyAndShowChangesDesecrate(item, des, "des apply");
		printItem(item, "Full item");
		// printItem(item, "Full item");





		item.addActiveOmen(omenHomogExalt);
		item.addActiveOmen(omenSinistralExalt);
		item.addActiveOmen(omenGreaterExalt);
		item.applyOmens(item, exalt);
		System.out.println("active omens : " + item.getActiveOmens());
		// applyAndShowChanges(item, exalt, "Exalt");
		// // item.addActiveOmen(omenDextralExalt);
		// // System.out.println("active omens : " + item.getActiveOmens());
		// printItem(item, "Full item after greater exalt omen");

		// item.applyOmens(item, exalt);
		// printItem(item, "Full item");

		// item.addActiveOmen(omendexCrystal);
		// item.applyOmens(item, perfectBody);
		// printItem(item, "Full item");

		// // item.addActiveOmen(omenDextralExalt);
		// item.addActiveOmen(omenGreaterExalt);
		// applyAndShowChanges(item, annul, "Annul");
		// applyAndShowChanges(item, annul, "Annul");
		// printItem(item, "Full item after annul");
		// item.addActiveOmen(omenSinistralExalt);
		// System.out.println("active omens : " + item.getActiveOmens());
		// item.applyOmens(item, exalt);
		// printItem(item, "Full item after redoing omens");

		// item.addActiveOmen(omenDextralErasure);
		// System.out.println("active omens chaos : " + item.getActiveOmens());
		// item.applyOmens(item, chaos);
		// printItem(item, "Full item after dex erasure omens");
		// item.addActiveOmen(omenSinistralErasure);
		// item.applyOmens(item, chaos);
		// printItem(item, "Full item after sin erasure omens");
	}
}