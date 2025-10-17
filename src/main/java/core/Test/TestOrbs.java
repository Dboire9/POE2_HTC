package core.Test;

import core.Currency.*;
import core.Currency.Essence_currency.EssenceTier;
import core.Crafting.*;
import core.Currency.Essences.*;
import core.Items.Boots.Boots_str_dex.*;
import core.Items.Body_Armours.Body_Armours_dex.*;
import core.Modifier_class.*;

public class TestOrbs {

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

		// 3️⃣ Create Perfect Essences
		Essences essences = new Essences(); // Create an instance of Essences
		Essences.EssenceOfTheBody body = new Essences.EssenceOfTheBody(EssenceTier.GREATER);
		Essences.EssenceOfTheMind mind = new Essences.EssenceOfTheMind(EssenceTier.PERFECT);
		Essences.EssenceOfEnhancement enhance = new Essences.EssenceOfEnhancement(EssenceTier.LESSER);
		// Essence_currency perfectMind = new
		// Essences.EssenceOfTheMind(Essence_currency.EssenceTier.PERFECT);
		// Essence_currency perfectFlames = new
		// Essences.EssenceOfFlames(Essence_currency.EssenceTier.PERFECT);
		// Essence_currency perfectEnhancement = new
		// Essences.EssenceOfEnhancement(Essence_currency.EssenceTier.PERFECT);

		System.out.println("Starting crafting and essence sequence...");

		// Apply each orb and show changes
		applyAndShowChanges(item, trans, "Transmutation Orb → Magic");
		printItem(item, "Full item");
		applyAndShowChanges(item, aug, "Augmentation Orb");
		printItem(item, "Full item");
		applyAndShowChanges(item, regal, "Regal Orb → Rare");
		printItem(item, "Full item");
		applyAndShowChanges(item, exalt, "Exalt");
		printItem(item, "Full item");
		// applyAndShowChanges(item, exalt, "Exalt");
		// printItem(item, "Full item");
		// applyAndShowChanges(item, exalt, "Exalt");
		// printItem(item, "Full item");
		BlockAndShowChangesDesecrate(item, des, "block");
		printItem(item, "Full item");
		ApplyAndShowChangesDesecrate(item, des, "des apply");
		printItem(item, "Full item");

		// Apply Perfect Essences
		// applyAndShowChangesEssences(item, perfectBody, "Perfect Essence of the Body");
		// applyPerfectEssenceIfSupported(item, perfectMind, "Perfect Essence of the
		// Mind");
		// applyPerfectEssenceIfSupported(item, perfectFlames, "Perfect Essence of the
		// Flames");
		// applyAndShowChangesEssences(item, perfectSeeking, "Perfect Essence of
		// Seeking");
		// printItem(item, "Full item");

		// Apply Orb of Annulment
		// applyAndShowChanges(item, annul, "Orb of Annulment");
		// printItem(item, "Full item after Annulment");

		// while (!item.isFull()) {
		// applyAndShowChanges(item, exalt, "Exalted Orb");
		// }

		// Full item after initial crafting
		// printItem(item, "Full item");

		// Apply Chaos Orbs
		// for (int i = 1; i <= 2; i++) {
		// applyAndShowChanges(item, chaos, "Chaos Orb " + i);
		// printItem(item, "Full item");
		// }
	}

	// -------------------
	// Apply orb/essence and show only changed mods
	// -------------------
	public static void applyAndShowChanges(Crafting_Item item, Crafting_Action orb, String orbName) {
		Crafting_Item snapshot = cloneItem(item);
		orb.apply(item);
		printItemChanges(snapshot, item, orbName);
		// printItem(item, "Full item after " + orbName);
		return;
	}

	public static void applyAndShowChangesEssences(Crafting_Item item, Essence_currency essence, String essenceName) {
		Crafting_Item snapshot = cloneItem(item);
		// System.out.println("here");
		essence.apply(item);
		printItemChanges(snapshot, item, essenceName);
		printItem(item, "Full item after " + essenceName);
	}

	public static void BlockAndShowChangesDesecrate(Crafting_Item item, Desecrated_currency des, String desString) {
		Crafting_Item snapshot = cloneItem(item);
		// System.out.println("here");
		des.blockSlot(item);
		printItemChanges(snapshot, item, desString);
		// printItem(item, "Full item after " + desString);
	}

	public static void ApplyAndShowChangesDesecrate(Crafting_Item item, Desecrated_currency des, String desString) {
		Crafting_Item snapshot = cloneItem(item);
		// System.out.println("here");
		des.apply(item);
		printItemChanges(snapshot, item, desString);
		// printItem(item, "Full item after " + desString);
	}

	// -------------------
	// Print full item
	// -------------------
	public static void printItem(Crafting_Item item, String title) {
		System.out.println("\n" + title + ":");
		System.out.println("Rarity: " + item.rarity);

		System.out.println("Prefixes:");
		for (int i = 0; i < item.currentPrefixes.length; i++) {
			Modifier m = item.currentPrefixes[i];
			ModifierTier t = item.currentPrefixTiers[i];
			if (m != null && t != null) {
				int tierNumber = m.tiers.size() - m.tiers.indexOf(t);
				System.out.println("Tier " + tierNumber + ": +"
						+ t.minMax1.first().intValue() + "-"
						+ t.minMax1.second().intValue() + " to " + m.text);
			}
		}

		System.out.println("Suffixes:");
		for (int i = 0; i < item.currentSuffixes.length; i++) {
			Modifier m = item.currentSuffixes[i];
			ModifierTier t = item.currentSuffixTiers[i];
			if (m != null && t != null) {
				int tierNumber = m.tiers.size() - m.tiers.indexOf(t);
				System.out.println("Tier " + tierNumber + ": +"
						+ t.minMax1.first().intValue() + "-"
						+ t.minMax1.second().intValue() + " to " + m.text);
			}
		}
	}

	// -------------------
	// Print only changed mods
	// -------------------
	public static void printItemChanges(Crafting_Item oldItem, Crafting_Item newItem, String title) {
		System.out.println("\n" + title + " (changed mods):");

		System.out.println("Prefixes changed:");
		for (int i = 0; i < newItem.currentPrefixes.length; i++) {
			Modifier oldMod = oldItem.currentPrefixes[i];
			Modifier newMod = newItem.currentPrefixes[i];
			if (oldMod != newMod && newMod != null) {
				ModifierTier t = newItem.currentPrefixTiers[i];
				int tierNumber = newMod.tiers.size() - newMod.tiers.indexOf(t);
				System.out.println("Tier " + tierNumber + ": +"
						+ t.minMax1.first().intValue() + "-"
						+ t.minMax1.second().intValue() + " to " + newMod.text);
			}
		}

		System.out.println("Suffixes changed:");
		for (int i = 0; i < newItem.currentSuffixes.length; i++) {
			Modifier oldMod = oldItem.currentSuffixes[i];
			Modifier newMod = newItem.currentSuffixes[i];
			if (oldMod != newMod && newMod != null) {
				ModifierTier t = newItem.currentSuffixTiers[i];
				int tierNumber = newMod.tiers.size() - newMod.tiers.indexOf(t);
				System.out.println("Tier " + tierNumber + ": +"
						+ t.minMax1.first().intValue() + "-"
						+ t.minMax1.second().intValue() + " to " + newMod.text);
			}
		}
	}

	// -------------------
	// Clone item helper
	// -------------------
	public static Crafting_Item cloneItem(Crafting_Item item) {
		Crafting_Item clone = new Crafting_Item(item.base);
		clone.rarity = item.rarity;

		for (int i = 0; i < item.currentPrefixes.length; i++) {
			clone.currentPrefixes[i] = item.currentPrefixes[i];
			clone.currentPrefixTiers[i] = item.currentPrefixTiers[i];
		}

		for (int i = 0; i < item.currentSuffixes.length; i++) {
			clone.currentSuffixes[i] = item.currentSuffixes[i];
			clone.currentSuffixTiers[i] = item.currentSuffixTiers[i];
		}

		return clone;
	}
}
