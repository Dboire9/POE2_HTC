package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class TransmutationOrb implements Crafting_Action {

    private int cost = 1;

	public Crafting_Action.CurrencyTier tier;

    // Constructor to specify tier
    public TransmutationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

	public TransmutationOrb() {
        this.tier = CurrencyTier.BASE;
    }

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on NORMAL items
        if (item.rarity != Crafting_Item.ItemRarity.NORMAL || item.isFull()) return item;

        Item_base base = item.base;

        // Determine minimum tier level based on currency tier
        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 55;
            case PERFECT -> minLevel = 70;
            default -> minLevel = 0;
        }

        // Pick one weighted modifier above the minimum level
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            base.getNormalAllowedPrefixes(),
            base.getNormalAllowedSuffixes(),
            minLevel,
			""
        );

        if (chosen == null) return item;

        // Convert item to MAGIC
        item.rarity = Crafting_Item.ItemRarity.MAGIC;

        // Apply chosen modifier
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
    public int getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Orb of Transmutation (" + tier + ")";
    }
}
