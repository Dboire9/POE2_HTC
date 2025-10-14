package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class AugmentationOrb implements Crafting_Action {

    private double cost = 1.0;

    public enum CurrencyTier {
        BASE, GREATER, PERFECT
    }

    public final CurrencyTier tier;

    // Constructor to specify tier
    public AugmentationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on MAGIC items with at least one free slot
        if (item.rarity != Crafting_Item.ItemRarity.MAGIC || item.isFull())
            return item;

        Item_base base = item.base;

        // Determine minimum level based on currency tier
        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 55;
            case PERFECT -> minLevel = 70;
            default -> minLevel = 0;
        }

        // Use utility to select a weighted modifier, filtering by minLevel
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            base.getNormalAllowedPrefixes(),
            base.getNormalAllowedSuffixes(),
            minLevel // only include tiers >= minLevel
        );

        if (chosen == null) return item; // no eligible modifier

        // Apply the chosen modifier and tier
        Modifier mod = chosen.getModifier();
        ModifierTier tierSelected = chosen.getTier();
        if (base.getNormalAllowedPrefixes().contains(mod)) {
            item.addPrefix(mod, tierSelected);
        } else {
            item.addSuffix(mod, tierSelected);
        }

        return item;
    }

    @Override
    public double getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Orb of Augmentation (" + tier + ")";
    }
}
