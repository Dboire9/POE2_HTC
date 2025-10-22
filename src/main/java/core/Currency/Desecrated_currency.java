package core.Currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Crafting.Crafting_Item.ModType;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

import java.util.List;
import java.util.Random;

public class Desecrated_currency implements Crafting_Action{

	public enum SlotType {
		PREFIX, SUFFIX
	}

	public enum guaranteedDesecratedModifier {
		KURGAL, AMANAMU, ULAMAN, ANY
	}

	public guaranteedDesecratedModifier guaranteed_des_mod = guaranteedDesecratedModifier.ANY;

	private int cost = 1;


	private ModType forcedType = ModType.ANY; // default behavior

	public void setForcedType(ModType type) {
		this.forcedType = type;
	}

	public ModType getForcedType() {
		return forcedType;
	}

	private final String name;
	private SlotType blockedSlotType; // will be chosen during blocking

	public Desecrated_currency(String name) {
		this.name = name;
	}

	// Default constructor
	public Desecrated_currency() {
		this.name = "";
	}

	@Override
	public int getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Desecrated currency";
	}

	/**
	 * Step 1: Block a random slot type (prefix or suffix).
	 * This only marks the item as "partially desecrated".
	 */
	public void blockSlot(Crafting_Item item) {

		// Cannot desecrate an item that is already desecrated
		if (item.desecrated || item.rarity != ItemRarity.RARE)
		{
			// System.out.println("Item already desecrated or not rare");
			return;
		}

		int filledPrefixes = 0;
		int filledSuffixes = 0;

		// Count filled prefix and suffix slots
		for (int i = 0; i < item.currentPrefixes.length; i++) {
			if (item.currentPrefixes[i] != null)
				filledPrefixes++;
		}
		for (int i = 0; i < item.currentSuffixes.length; i++) {
			if (item.currentSuffixes[i] != null)
				filledSuffixes++;
		}

		if(forcedType == ModType.ANY)
		{
			if(filledPrefixes == 3 && filledSuffixes < 3)
				forcedType = ModType.SUFFIX_ONLY;
			else if (filledPrefixes < 3 && filledSuffixes == 3)
				forcedType = ModType.PREFIX_ONLY;
			else
			forcedType = new Random().nextBoolean() ? ModType.PREFIX_ONLY : ModType.SUFFIX_ONLY;
		}

		item.desecrated = true;

		// Apply the block on prefix or on suffix
		if (forcedType == ModType.PREFIX_ONLY) {
			Modifier block_modifier = new Modifier(
					"block",
					List.of("block"),
					List.of(
							new ModifierTier("of Block", 65, 1, new Pair<>(0, 0))),
					Modifier.ModifierType.PREFIX,
					Modifier.ModifierSource.DESECRATED,
					"block",
					"block");

			for (int i = 0; i < item.currentPrefixes.length; i++) {
				if (item.currentPrefixes[i] == null) {
					item.currentPrefixes[i] = block_modifier;
					item.currentPrefixTiers[i] = block_modifier.tiers.get(0);
					// System.out.println("Blocked a prefix");
					return;
				}
			}
		} 
		else 
		{
			Modifier block_modifier = new Modifier(
					"block",
					List.of("block"),
					List.of(
							new ModifierTier("of Block", 65, 1, new Pair<>(0, 0))),
					Modifier.ModifierType.SUFFIX,
					Modifier.ModifierSource.DESECRATED,
					"block",
					"block");

			for (int i = 0; i < item.currentSuffixes.length; i++) {
				if (item.currentSuffixes[i] == null) {
					item.currentSuffixes[i] = block_modifier;
					item.currentSuffixTiers[i] = block_modifier.tiers.get(0);
					// System.out.println("Blocked a suffix");
					return;
				}
			}
		}
	}

	@Override
	public Crafting_Item apply(Crafting_Item item) {
		// If item is not already desecrated return
		if (!item.desecrated)
		{
			// System.out.println("Item is not desecrated");
			return item;
		}

		Item_base base = item.base;

		Modifier blockModifier = null;
		Modifier.ModifierType blockType = null;

		String blocker = "";

		// Search in prefix slots
		for (int i = 0; i < item.currentPrefixes.length; i++) {
			Modifier m = item.currentPrefixes[i];
			if (m != null && "block".equalsIgnoreCase(m.family)) {
				blockModifier = m;
				blockType = Modifier.ModifierType.PREFIX;
				blocker = "Block_Suffix";
				item.currentPrefixes[i] = null;
				break;
			}
		}

		// If not found, search in suffix slots
		if (blockModifier == null) {
			for (int i = 0; i < item.currentSuffixes.length; i++) {
				Modifier m = item.currentSuffixes[i];
				if (m != null && "block".equalsIgnoreCase(m.family)) {
					blockModifier = m;
					blockType = Modifier.ModifierType.SUFFIX;
					blocker = "Block_Prefix";
					item.currentSuffixes[i] = null;
					break;
				}
			}
		}
		// System.out.println("Here in desecration");
		if (blockModifier != null) {
			// System.out.println("Found a block modifier in " + blockType + " slots.");
		} else {
			// System.out.println("No block modifier found on this item.");
		}

		// System.out.println("☠ Desecration consumes the block modifier... transforming it!");


		List<Modifier> allowedPrefixes = null;
		List<Modifier> allowedSuffixes = null;
		ModifierTierWrapper chosen = null;
		switch (guaranteed_des_mod) {
			case KURGAL -> {
				for (Modifier m : base.getDesecratedAllowedPrefixes()) if (m.family.equals("kurgal_mod")) allowedPrefixes.add(m);
				for (Modifier m : base.getDesecratedAllowedSuffixes()) if (m.family.equals("kurgal_mod")) allowedSuffixes.add(m);
			}
			case AMANAMU -> {
				for (Modifier m : base.getDesecratedAllowedPrefixes()) if (m.family.equals("amanamu_mod")) allowedPrefixes.add(m);
				for (Modifier m : base.getDesecratedAllowedSuffixes()) if (m.family.equals("amanamu_mod")) allowedSuffixes.add(m);
			}
			case ULAMAN -> {
				for (Modifier m : base.getDesecratedAllowedPrefixes()) if (m.family.equals("ulaman_mod")) allowedPrefixes.add(m);
				for (Modifier m : base.getDesecratedAllowedSuffixes()) if (m.family.equals("ulaman_mod")) allowedSuffixes.add(m);
			}
			default -> {
				allowedPrefixes = base.getDesecratedAllowedPrefixes();
				allowedSuffixes = base.getDesecratedAllowedSuffixes();
			}
		}
		// Use utility function to pick a weighted modifier tier above minLevel
		chosen = AddRandomMod.selectWeightedModifier(
				item,
				allowedPrefixes,
				allowedSuffixes,
				0,
				blocker);


		if (chosen == null)
			return item; // no eligible modifier

		// Add chosen modifier and tier to the correct block slot
		Modifier mod = chosen.getModifier();
		ModifierTier modifierTier = chosen.getTier();
		if (base.getNormalAllowedPrefixes().contains(mod)) {
			item.addPrefix(mod, modifierTier);
		} else {
			item.addSuffix(mod, modifierTier);
		}
		item.desecrated = true;
		return item;
	}

	public SlotType getBlockedSlotType() {
		return blockedSlotType;
	}
}
