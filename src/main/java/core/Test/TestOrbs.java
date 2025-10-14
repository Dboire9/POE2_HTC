package core.Test;

import core.Currency.*;
import core.Crafting.*;
import core.Items.Quivers.Quivers;
import core.Modifier_class.*;

public class TestOrbs {

    public static void main(String[] args) {

        // 1️⃣ Create base item
        Quivers testItem = new Quivers();
        Crafting_Item item = new Crafting_Item(testItem);

        // 2️⃣ Create Orbs (PERFECT tier for testing)
        TransmutationOrb trans = new TransmutationOrb(TransmutationOrb.CurrencyTier.PERFECT);
        AugmentationOrb aug = new AugmentationOrb(AugmentationOrb.CurrencyTier.PERFECT);
        RegalOrb regal = new RegalOrb(RegalOrb.CurrencyTier.PERFECT);
        ExaltedOrb exalt = new ExaltedOrb(ExaltedOrb.CurrencyTier.PERFECT);
        ChaosOrb chaos = new ChaosOrb(ChaosOrb.CurrencyTier.PERFECT);

        System.out.println("Starting crafting sequence...");

        // Apply each orb and show changes
        applyAndShowChanges(item, trans, "Transmutation Orb → Magic");
        applyAndShowChanges(item, aug, "Augmentation Orb");
        applyAndShowChanges(item, regal, "Regal Orb → Rare");

        while (!item.isFull()) {
            applyAndShowChanges(item, exalt, "Exalted Orb");
        }

        // Full item after initial crafting
        printItem(item, "Full item");

        // Apply Chaos Orbs
        for (int i = 1; i <= 2; i++) {
            applyAndShowChanges(item, chaos, "Chaos Orb " + i);
            printItem(item, "Full item");
        }
    }

    // -------------------
    // Apply orb and show only changed mods
    // -------------------
    private static void applyAndShowChanges(Crafting_Item item, Crafting_Action orb, String orbName) {
        Crafting_Item snapshot = cloneItem(item);
        orb.apply(item);
        printItemChanges(snapshot, item, orbName);
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
