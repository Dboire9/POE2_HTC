package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

import java.util.List;
import java.util.ArrayList;

public class ExaltedOrb implements Crafting_Action {

    public enum ModType {
        ANY, PREFIX_ONLY, SUFFIX_ONLY
    }

    private double cost = 1.0;
	public enum CurrencyTier {
        BASE, GREATER, PERFECT
    }

    public final CurrencyTier tier;

    // Constructor to specify the tier
    public ExaltedOrb(CurrencyTier tier) {
        this.tier = tier;
    }
    private ModType forcedType = null; // default behavior

    public void setForcedType(ModType type) {
        this.forcedType = type;
    }

    public ModType getForcedType() {
        return forcedType;
    }

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        if (item.isFull()) return item;

        Item_base base = item.base;

        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 35;
            case PERFECT -> minLevel = 50;
            default -> minLevel = 0;
        }

        // Select the appropriate mod pool based on forcedType
		List<Modifier> allowedPrefixes = null;
		List<Modifier> allowedSuffixes = null;
		switch (forcedType) {
			case PREFIX_ONLY -> allowedPrefixes = base.getNormalAllowedPrefixes();
			case SUFFIX_ONLY -> allowedSuffixes = base.getNormalAllowedSuffixes();
			case ANY -> {
				allowedPrefixes = base.getNormalAllowedPrefixes();
				allowedSuffixes = base.getNormalAllowedSuffixes();
			}
		}

		String blockType;
		System.out.println("Forced type"+forcedType);
		switch (forcedType) {
			case PREFIX_ONLY -> blockType = "Block_Suffix"; // only allow prefixes
			case SUFFIX_ONLY -> blockType = "Block_Prefix"; // only allow suffixes
			default -> blockType = ""; // allow everything
		}
		
		// Call the utility function
		ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
			item,
			allowedPrefixes,
			allowedSuffixes,
			minLevel,
			blockType 
		);

        if (chosen == null) return item;

        Modifier mod = chosen.getModifier();
        ModifierTier tier = chosen.getTier();

        // Add based on forced type or default
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
        return "Exalted Orb (" + tier + ")";
    }
}
