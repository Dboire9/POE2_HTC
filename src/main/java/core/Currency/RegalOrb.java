package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class RegalOrb implements Crafting_Action {

    private double cost = 1.0;

    public enum CurrencyTier {
        BASE, GREATER, PERFECT
    }

    public final CurrencyTier tier;

    // Constructor to specify tier
    public RegalOrb(CurrencyTier tier) {
        this.tier = tier;
    }

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on MAGIC items that are not full
        if (item.rarity != Crafting_Item.ItemRarity.MAGIC || item.isFull()) return item;

        Item_base base = item.base;

        // Determine minimum tier level based on Regal Orb tier
        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 35;
            case PERFECT -> minLevel = 50;
            default -> minLevel = 0;
        }

        // Pick one weighted modifier above the minimum level
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            base.getNormalAllowedPrefixes(),
            base.getNormalAllowedSuffixes(),
            minLevel
        );

        if (chosen == null) return item;

        // Upgrade item to RARE
        item.rarity = Crafting_Item.ItemRarity.RARE;

        // Apply chosen modifier and tier
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
        return "Regal Orb (" + tier + ")";
    }
}
