package core.Currency;

import core.Crafting.Crafting_Item;
import core.Modifier_class.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class Desecrated_currency {

    public enum SlotType { PREFIX, SUFFIX }

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
		int filledPrefixes = 0;
		int filledSuffixes = 0;
	
		// Count filled prefix and suffix slots
		for (int i = 0; i < item.currentPrefixes.length; i++) {
			if (item.currentPrefixes[i] != null) filledPrefixes++;
		}
		for (int i = 0; i < item.currentSuffixes.length; i++) {
			if (item.currentSuffixes[i] != null) filledSuffixes++;
		}
	
		// Determine what to block
		if (filledSuffixes >= item.currentSuffixes.length && filledPrefixes < item.currentPrefixes.length) {
			blockedSlotType = SlotType.PREFIX;
		} 
		else if (filledPrefixes >= item.currentPrefixes.length && filledSuffixes < item.currentSuffixes.length) {
			blockedSlotType = SlotType.SUFFIX;
		} 
		else {
			blockedSlotType = new Random().nextBoolean() ? SlotType.PREFIX : SlotType.SUFFIX;
		}
	
		// Apply the block
		if (blockedSlotType == SlotType.PREFIX)
		{
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
					return;
				}
			}
		}
	
		System.out.println("💀 Desecration begins... Blocked a " + blockedSlotType + " slot on " 
			+ item.base.getClass().getSimpleName() + " (Prefixes filled: " + filledPrefixes 
			+ ", Suffixes filled: " + filledSuffixes + ")");
	}
	

    /**
     * Step 2: Apply the desecrated modifier once the slot is blocked.
     * This could either roll a normal modifier or a "desecrated" special one.
     */
    public void applyDesecration(Crafting_Item item) {
        if (blockedSlotType == null) {
            System.out.println("⚠ Cannot apply desecration — no slot blocked yet!");
            return;
        }

        System.out.println("☠ Finalizing desecration on " + item.base.getClass().getSimpleName()
            + " (" + blockedSlotType + " slot)...");

        boolean isDesecratedMod = new Random().nextDouble() < 0.3; // 30% chance for a desecrated mod
        String modType = isDesecratedMod ? "Desecrated modifier" : "Normal modifier";

        // Here you would later pick a modifier from the right pool depending on the blocked slot type
        System.out.println("→ Applied " + modType + " to " + blockedSlotType + " slot.");
    }

    public SlotType getBlockedSlotType() {
        return blockedSlotType;
    }

    public String getName() {
        return name;
    }
}
