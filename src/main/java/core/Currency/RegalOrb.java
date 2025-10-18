package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ModType;

import java.util.ArrayList;
import java.util.List;

import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

public class RegalOrb implements Crafting_Action {
	
	private int cost = 1;
	
	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}
	
	public boolean homogenising = false;

	public final CurrencyTier tier;

	// Constructor to specify tier
	public RegalOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// default constructor
	public RegalOrb() {
		this.tier = CurrencyTier.BASE; // or whichever tier makes sense as default
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
		// Only works on MAGIC items that are not full
		if (item.rarity != Crafting_Item.ItemRarity.MAGIC || item.isFull())
			return item;

		Item_base base = item.base;

		// Determine minimum tier level based on Regal Orb tier
		int minLevel;
		switch (tier) {
			case GREATER -> minLevel = 35;
			case PERFECT -> minLevel = 50;
			default -> minLevel = 0;
		}


		List<Modifier> finalPrefixes = new ArrayList<>();
		List<Modifier> finalSuffixes = new ArrayList<>();

		if(homogenising)
		{
			System.out.println("Homog active");
			System.out.println("Prefix");
			finalPrefixes = item.homogeniseModifiers(base.getNormalAllowedPrefixes(), item.currentPrefixes, item.currentSuffixes);
			System.out.println("Suffix");
			finalSuffixes = item.homogeniseModifiers(base.getNormalAllowedSuffixes(), item.currentSuffixes, item.currentPrefixes);
		}

		if(finalPrefixes.isEmpty() && finalSuffixes.isEmpty())
		{
			finalPrefixes = base.getNormalAllowedPrefixes();
			finalSuffixes = base.getNormalAllowedSuffixes();
		}

		// Pick one weighted modifier above the minimum level
		ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
				item,
				finalPrefixes,
				finalSuffixes,
				minLevel,
				"");

		if (chosen == null)
			return item;

		// Upgrade item to RARE
		item.rarity = Crafting_Item.ItemRarity.RARE;
		this.homogenising = false;

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
	public int getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Regal Orb (" + tier + ")";
	}
}
