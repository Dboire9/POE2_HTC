package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

import java.util.List;
import java.util.ArrayList;

public class ExaltedOrb implements Crafting_Action {

	private int cost = 1;

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}

	public final CurrencyTier tier;

	public boolean homogenising = false;
	public boolean greaterexalt = false;

	// Constructor to specify the tier
	public ExaltedOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public ExaltedOrb() {
		this.tier = CurrencyTier.BASE;
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
		if (item.isFull())
			return item;

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

		// Remove already applied prefixes
		if(allowedPrefixes != null)
		{
			for (Modifier m : item.currentPrefixes) {
				if (m != null) {
					allowedPrefixes.remove(m);
				}
			}
		}

		// Remove already applied suffixes
		if(allowedSuffixes != null)
		{
			for (Modifier m : item.currentSuffixes) {
				if (m != null) {
					allowedSuffixes.remove(m);
				}
			}
		}

		String blockType;
		// System.out.println("Forced type" + forcedType);
		switch (forcedType) {
			case PREFIX_ONLY -> blockType = "Block_Suffix"; // only allow prefixes
			case SUFFIX_ONLY -> blockType = "Block_Prefix"; // only allow suffixes
			default -> blockType = ""; // allow everything
		}

		if (homogenising) {
			System.out.println("Homogenising Exalted Orb active!");
			allowedPrefixes = item.homogeniseModifiers(
				base.getNormalAllowedPrefixes(),
				item.currentPrefixes,
				item.currentSuffixes
			);
			allowedSuffixes = item.homogeniseModifiers(
				base.getNormalAllowedSuffixes(),
				item.currentPrefixes,
				item.currentSuffixes
			);
			// If we don't find any tags, return all modifiers
			if(allowedPrefixes == null)
				allowedPrefixes = base.getNormalAllowedPrefixes();
			if(allowedSuffixes == null)
				allowedSuffixes = base.getNormalAllowedPrefixes();
		}

		// Call the utility function
		ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
				item,
				allowedPrefixes,
				allowedSuffixes,
				minLevel,
				blockType);

		if (chosen == null)
			return item;

		Modifier mod = chosen.getModifier();
		ModifierTier tier = chosen.getTier();

		// System.out.println("Adding : " + chosen.getModifier().text);

		// Add based on forced type or default and remove it for the greater exalt to not try to reapply it 
		if (base.getNormalAllowedPrefixes().contains(mod)) {
			item.addPrefix(mod, tier);
			allowedPrefixes.remove(mod);
		} else {
			item.addSuffix(mod, tier);
			allowedSuffixes.remove(mod);
		}

		// Re applying with the same options the exalt
		if(greaterexalt){
				chosen = null;
				mod = null;
				tier = null;

				// If we had removed the last modifier with the homog, we allow all the modifiers
				if(allowedPrefixes.isEmpty())
					allowedPrefixes = base.getNormalAllowedPrefixes();
				if(allowedSuffixes.isEmpty())
					allowedSuffixes = base.getNormalAllowedSuffixes();
				// Call the utility function
				chosen = AddRandomMod.selectWeightedModifier(
					item,
					allowedPrefixes,
					allowedSuffixes,
					minLevel,
					blockType);

			if (chosen == null)
				return item;

			mod = chosen.getModifier();
			tier = chosen.getTier();

			// System.out.println("Adding : " + chosen.getModifier().text);

			// Add based on forced type or default
			if (base.getNormalAllowedPrefixes().contains(mod)) {
				item.addPrefix(mod, tier);
			} else {
				item.addSuffix(mod, tier);
			}
			greaterexalt = false;
		}

		return item;
	}

	@Override
	public int getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Exalted Orb (" + tier + ")";
	}
}
