package core.Currency;

import core.Crafting.Crafting_Item;

import java.util.List;

import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Utils.AddRandomMod;

public class AugmentationOrb implements Crafting_Action {

    private int cost = 1;

	public Crafting_Action.CurrencyTier tier;

    // Constructor to specify tier
    public AugmentationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

	// Default constructor
	public AugmentationOrb() {
		this.tier = CurrencyTier.BASE;
	}

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on MAGIC items with at least one free slot
        if (item.rarity != Crafting_Item.ItemRarity.MAGIC || item.isFull())
            return item;

        Item_base base = item.base;


		// Checking if there is already a prefix or a suffix to add the opposite type
		int prefixCount = 0;
		int suffixCount = 0;
		for (Modifier m : item.currentPrefixes) if (m != null) prefixCount++;
		for (Modifier m : item.currentSuffixes) if (m != null) suffixCount++;

		boolean addPrefix = false;
		if (prefixCount == 0 && suffixCount > 0)
		{
			addPrefix = true;
		}
		else if (suffixCount == 0 && prefixCount > 0) {
			addPrefix = false;
		}
		else
		{
			System.out.println("Item has already two modifiers for the magic rarity");
			return item;
		}

		// Filter allowed mods based on type
    	List<Modifier> allowedModifiers = addPrefix
        ? base.getNormalAllowedPrefixes()
        : base.getNormalAllowedSuffixes();

        // Determine minimum level based on currency tier
        int minLevel;
        switch (tier) {
            case GREATER -> minLevel = 55;
            case PERFECT -> minLevel = 70;
            default -> minLevel = 0;
        }

		// Select a random modifier and tier 
		ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
			item,
			addPrefix ? allowedModifiers : null,
			addPrefix ? null : allowedModifiers,
			minLevel,
			""
		);

        if (chosen == null) return item; // no eligible modifier

        // Apply the chosen modifier and tier
        Modifier mod = chosen.getModifier();
        ModifierTier tierSelected = chosen.getTier();
		if (addPrefix) {
			item.addPrefix(mod, tierSelected);
			// System.out.println("Augmentation Orb added PREFIX: " + mod.text + " (Tier " + (mod.tiers.size() - mod.tiers.indexOf(tierSelected)) + ")");
		} else {
			item.addSuffix(mod, tierSelected);
			// System.out.println("Augmentation Orb added SUFFIX: " + mod.text + " (Tier " + (mod.tiers.size() - mod.tiers.indexOf(tierSelected)) + ")");
		}

        return item;
    }

    @Override
    public int getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Orb of Augmentation (" + tier + ")";
    }
}
