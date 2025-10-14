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

        // 6️⃣ Display final result
        System.out.println("\nFinal item:");
        System.out.println("Rarity: " + item.rarity);
        System.out.println("Prefixes:");
        for (int i = 0; i < item.currentPrefixes.length; i++) {
            Modifier m = item.currentPrefixes[i];
            if (m != null) {
                System.out.print(" - " + m.text);
                for (ModifierTier tier : m.tiers)
                {
                    System.out.println(" - " + tier.minMax1);
                    if (tier.minMax2 != null) System.out.println(" - " + tier.minMax2);
                    if (tier.minMax3 != null)System.out.println(" - " + tier.minMax3);
                    if (tier.minMax4 != null)System.out.println(" - " + tier.minMax4);
                }
                System.out.println();
            }
        }

        System.out.println("Suffixes:");
        for (int i = 0; i < item.currentSuffixes.length; i++) {
            Modifier m = item.currentSuffixes[i];
            if (m != null) {
                System.out.print(" - " + m.text);
                for (ModifierTier tier : m.tiers)
                {
                    System.out.println(" - " + tier.minMax1);
                    if (tier.minMax2 != null) System.out.println(" - " + tier.minMax2);
                    if (tier.minMax3 != null)System.out.println(" - " + tier.minMax3);
                    if (tier.minMax4 != null)System.out.println(" - " + tier.minMax4);
                }
                System.out.println();
            }
        }
    }
}
