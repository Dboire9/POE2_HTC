package core.Currency;

import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class ChaosOrb implements Crafting_Action {

	private int cost = 1;

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}

	public final CurrencyTier tier;

	// Constructor to specify the tier
	public ChaosOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	private ModType forcedType = ModType.ANY; // default behavior

	public void setForcedType(ModType type) {
		this.forcedType = type;
	}

	public ModType getForcedType() {
		return forcedType;
	}

	@Override
	public Crafting_Item apply(Crafting_Item item) {
		// Only works on RARE items
		if (item.rarity == Crafting_Item.ItemRarity.NORMAL)
			return item;

		Item_base base = item.base;

		// Removing a random modifier (like orb of annul)
		item.removeRandomModifier(forcedType);

		// Determine minimum tier level based on Chaos Orb tier
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
				minLevel,
				"");

		if (chosen == null)
			return item; // no eligible modifier

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
	public int getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Chaos Orb (" + tier + ")";
	}
}
