package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class AugmentationOrb implements Crafting_Action {

    private double cost = 1.0;

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on MAGIC items with at least one free slot
        if (item.rarity != Crafting_Item.ItemRarity.MAGIC || item.isFull())
            return item;

        Item_base base = item.base;

        // Use utility to select a weighted modifier
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            base.getNormalAllowedPrefixes(),
            base.getNormalAllowedSuffixes()
        );

        if (chosen == null) return item; // no eligible modifier

        // Apply the chosen modifier and tier
        Modifier mod = chosen.getModifier();
        ModifierTier tier = chosen.getTier();
        if (base.getNormalAllowedPrefixes().contains(mod)) {
            item.addPrefix(mod, tier);
        } else {
            item.addSuffix(mod, tier);
        }

        return item;
    }

    @Override
    public double getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Orb of Augmentation";
    }
}
