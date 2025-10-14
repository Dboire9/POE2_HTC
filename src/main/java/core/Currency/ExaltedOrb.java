package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class ExaltedOrb implements Crafting_Action {

    private double cost = 1.0;

    public enum CurrencyTier {
        BASE, GREATER, PERFECT
    }

    public final CurrencyTier tier;

    // Constructor to specify the tier
    public ExaltedOrb(CurrencyTier tier) {
        this.tier = tier;
    }

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // No free slot? Return item unchanged
        if (item.isFull()) return item;

        Item_base base = item.base;

        // Determine minimum tier level based on Exalted Orb tier
        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 35;
            case PERFECT -> minLevel = 50;
            default -> minLevel = 0;
        }

        // Use utility function to pick a weighted modifier tier above minLevel
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            base.getNormalAllowedPrefixes(),
            base.getNormalAllowedSuffixes(),
            minLevel
        );

        if (chosen == null) return item; // no eligible modifier

        // Add chosen modifier and tier to the correct slot
        Modifier mod = chosen.getModifier();
        ModifierTier modifierTier = chosen.getTier();
        if (base.getNormalAllowedPrefixes().contains(mod)) {
            item.addPrefix(mod, modifierTier);
        } else {
            item.addSuffix(mod, modifierTier);
        }

        return item;
    }

    @Override
    public double getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Exalted Orb (" + tier + ")";
    }
}
