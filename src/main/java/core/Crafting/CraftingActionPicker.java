package core.Crafting;

import java.util.EnumMap;
import java.util.Map;
import java.util.Random;

import core.Crafting.Crafting_Item.*;

public class CraftingActionPicker {

    private static final Random RNG = new Random();

    public static CraftingActionType pickRandomActionType(Crafting_Item item, boolean isPerfectEssence) {
        Map<CraftingActionType, Integer> weights = new EnumMap<>(CraftingActionType.class);

        // Adjust weights based on item rarity (can be tuned a bit)
        switch (item.rarity) {
			case NORMAL -> {
				weights.put(CraftingActionType.ESSENCE, 0);
                weights.put(CraftingActionType.OMEN, 0);
                weights.put(CraftingActionType.CURRENCY, 100);  // Always use currency when normal item (always transmut)
			}
            case MAGIC -> {
                weights.put(CraftingActionType.ESSENCE, 15);
                weights.put(CraftingActionType.OMEN, 25);
                weights.put(CraftingActionType.CURRENCY, 60);
            }
            case RARE -> {
				if(isPerfectEssence)
                	weights.put(CraftingActionType.ESSENCE, 10);   // good
                weights.put(CraftingActionType.OMEN, 40);      // very good
                weights.put(CraftingActionType.CURRENCY, 60);  // still always useful
            }
        }


		// Choosing what we should do next depending on the weighted entries
		int totalWeight = weights.values().stream().mapToInt(Integer::intValue).sum();
		int roll = RNG.nextInt(totalWeight);
		int cumulative = 0;

		for (Map.Entry<CraftingActionType, Integer> entry : weights.entrySet()) {
			cumulative += entry.getValue();
			if (roll < cumulative) {
				// System.out.println(entry.getKey());
				return entry.getKey();
			}
		}

		return CraftingActionType.CURRENCY; // fallback
	}
}