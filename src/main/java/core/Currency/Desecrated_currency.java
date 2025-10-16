package core.Currency;

import core.Crafting.Crafting_Item;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class Desecrated_currency {

	public enum SlotType {
		PREFIX, SUFFIX
	}

	private final String name;
	private SlotType blockedSlotType; // will be chosen during blocking

	public Desecrated_currency(String name) {
		this.name = name;
	}

	/**
	 * Step 1: Block a random slot type (prefix or suffix).
	 * This only marks the item as "partially desecrated".
	 */
	public void blockSlot(Crafting_Item item) {

		// Cannot desecrate an item that is already desecrated
		if (item.desecrated)
			return;

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

		// Determine what to block
		if (filledSuffixes >= item.currentSuffixes.length && filledPrefixes < item.currentPrefixes.length) {
			blockedSlotType = SlotType.PREFIX;
		} else if (filledPrefixes >= item.currentPrefixes.length && filledSuffixes < item.currentSuffixes.length) {
			blockedSlotType = SlotType.SUFFIX;
		} else {
			blockedSlotType = new Random().nextBoolean() ? SlotType.PREFIX : SlotType.SUFFIX;
		}

		item.desecrated = true;

		// Apply the block on prefix or on suffix
		if (blockedSlotType == SlotType.PREFIX) {
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
					return;
				}
			}
		} else {
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
					return;
				}
			}
		}

		System.out.println("Desecration begins... Blocked a " + blockedSlotType + " slot on "
				+ item.base.getClass().getSimpleName() + " (Prefixes filled: " + filledPrefixes
				+ ", Suffixes filled: " + filledSuffixes + ")");
		item.desecrated = true;
	}

	public void applyNormalDesecration(Crafting_Item item) {
		// If item is not already desecrated return
		if (!item.desecrated)
			return;

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
		System.out.println("Here in desecration");
		if (blockModifier != null) {
			System.out.println("Found a block modifier in " + blockType + " slots.");
		} else {
			System.out.println("No block modifier found on this item.");
		}

		System.out.println("☠ Desecration consumes the block modifier... transforming it!");

		// Use utility function to pick a weighted modifier tier above minLevel
		ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
				item,
				base.getNormalAllowedPrefixes(),
				base.getNormalAllowedSuffixes(),
				0,
				blocker);

		if (chosen == null)
			return; // no eligible modifier

		// Add chosen modifier and tier to the correct block slot
		Modifier mod = chosen.getModifier();
		ModifierTier modifierTier = chosen.getTier();
		if (base.getNormalAllowedPrefixes().contains(mod)) {
			item.addPrefix(mod, modifierTier);
		} else {
			item.addSuffix(mod, modifierTier);
		}
		item.desecrated = true;
	}

	public SlotType getBlockedSlotType() {
		return blockedSlotType;
	}

	public String getName() {
		return name;
	}
}
