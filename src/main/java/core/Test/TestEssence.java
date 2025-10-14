package core.Test;

import core.Currency.Essence_currency;
import core.Currency.Essence_currency.EssenceTier;
import core.Currency.TransmutationOrb;
import core.Currency.Essences.*;
import core.Crafting.*;
import core.Items.Boots.Boots_dex.Boots_dex;
import core.Modifier_class.*;

public class TestEssence {

    public static void main(String[] args) {

        // 1️⃣ Create base item (Boots)
        Boots_dex testItem = new Boots_dex();
        Crafting_Item item = new Crafting_Item(testItem);

        System.out.println("Starting essence application sequence on Boots...");

        // 2️⃣ Create Essences
        Essence_currency lesserMind = new EssenceOfTheBody(EssenceTier.LESSER);
        Essence_currency normalMind = new EssenceOfTheBody(EssenceTier.NORMAL);
        Essence_currency greaterMind = new EssenceOfTheBody(EssenceTier.GREATER);

		TransmutationOrb trans = new TransmutationOrb(TransmutationOrb.CurrencyTier.BASE);

        // 3️⃣ Apply Essences to the item
		trans.apply(item);
        applyAndShowChanges(item, lesserMind, "Lesser Essence of the Mind");
        applyAndShowChanges(item, normalMind, "Essence of the Mind");
        applyAndShowChanges(item, greaterMind, "Greater Essence of the Mind");

        // 4️⃣ Print final item
        printItem(item, "Final Boots after all Mind Essences");
    }

    // -------------------
    // Apply essence and show only changed mods
    // -------------------
    private static void applyAndShowChanges(Crafting_Item item, Essence_currency essence, String essenceName) {
        Crafting_Item snapshot = cloneItem(item);
        essence.applyTo(item);
        printItemChanges(snapshot, item, essenceName);
    }

    // -------------------
    // Print full item
    // -------------------
    private static void printItem(Crafting_Item item, String title) {
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
    // Print only changed mods between old and new item
    // -------------------
    private static void printItemChanges(Crafting_Item oldItem, Crafting_Item newItem, String title) {
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
    private static Crafting_Item cloneItem(Crafting_Item item) {
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
