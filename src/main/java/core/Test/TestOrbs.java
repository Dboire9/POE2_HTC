package core.Test;

import core.Currency.*;
import core.Crafting.Crafting_Item;
import core.Items.Amulets.Amulets;
import core.Modifier_class.*;

public class TestOrbs {
    public static void main(String[] args) {

        // 1️⃣ Create base item
        Amulets testItem = new Amulets();
        Crafting_Item item = new Crafting_Item(testItem);

        // Orbs
        TransmutationOrb trans = new TransmutationOrb();
        AugmentationOrb aug = new AugmentationOrb();
        RegalOrb regal = new RegalOrb();
        ExaltedOrb exalt = new ExaltedOrb();
        ChaosOrb chaos = new ChaosOrb();

        System.out.println("Starting crafting sequence...");

        // 2️⃣ Make it Magic if Normal
        if (item.rarity == Crafting_Item.ItemRarity.NORMAL) {
            trans.apply(item);
            System.out.println("Applied Transmutation Orb → Magic");
        }

        // 3️⃣ Add second mod with Augmentation
        aug.apply(item);
        System.out.println("Applied Augmentation Orb");

        // 4️⃣ Upgrade to Rare with Regal Orb
        regal.apply(item);
        System.out.println("Applied Regal Orb → Rare");

        // 5️⃣ Fill remaining slots with Exalted Orbs
        while (!item.isFull()) {
            exalt.apply(item);
            System.out.println("Applied Exalted Orb");
        }

        // 6️⃣ Display full item
        printItem(item, "Full item");

        // 7️⃣ Apply Chaos Orbs
        for (int i = 1; i <= 2; i++) {
            chaos.apply(item);
            printItem(item, "After Chaos Orb " + i);
        }
    }

    // Helper method to print item details
    private static void printItem(Crafting_Item item, String title) {
        System.out.println("\n" + title + ":");
        System.out.println("Rarity: " + item.rarity);

        System.out.println("Prefixes:");
        for (Modifier m : item.currentPrefixes) {
            if (m != null) {
                System.out.println(" - " + m.text);
                for (ModifierTier tier : m.tiers) {
                    System.out.println("   Tier minMax1: " + tier.minMax1);
                    if (tier.minMax2 != null) System.out.println("   Tier minMax2: " + tier.minMax2);
                    if (tier.minMax3 != null) System.out.println("   Tier minMax3: " + tier.minMax3);
                    if (tier.minMax4 != null) System.out.println("   Tier minMax4: " + tier.minMax4);
                }
            }
        }

        System.out.println("Suffixes:");
        for (Modifier m : item.currentSuffixes) {
            if (m != null) {
                System.out.println(" - " + m.text);
                for (ModifierTier tier : m.tiers) {
                    System.out.println("   Tier minMax1: " + tier.minMax1);
                    if (tier.minMax2 != null) System.out.println("   Tier minMax2: " + tier.minMax2);
                    if (tier.minMax3 != null) System.out.println("   Tier minMax3: " + tier.minMax3);
                    if (tier.minMax4 != null) System.out.println("   Tier minMax4: " + tier.minMax4);
                }
            }
        }
    }
}
