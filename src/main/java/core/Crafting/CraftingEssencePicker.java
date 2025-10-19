package core.Crafting;

import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.Essence_currency;
import core.Currency.Essence_currency.EssenceTier;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class CraftingEssencePicker {

    /**
     * Picks a random essence based on the available essence registry.
     * @return A randomly generated Essence_currency.
     */
    public static Essence_currency pickRandomEssence(Crafting_Item item) {

		// Select the tier
		Essence_currency.EssenceTier tier = EssenceTier.PERFECT;
        if(item.rarity != ItemRarity.RARE)
        	tier = pickRandomTier();

        // 🎲 Pick a random essence type
		String essenceType = Essence_currency.pickRandomEssenceType(item);
		


        // 🧩 Create the essence using your registry
        return Essence_currency.create(essenceType, tier);
    }

	// Pick a random tier that is not perfect
	private static Essence_currency.EssenceTier pickRandomTier() {
		Essence_currency.EssenceTier[] allTiers = Essence_currency.EssenceTier.values();
		List<Essence_currency.EssenceTier> filteredTiers = Arrays.stream(allTiers)
			.filter(tier -> !tier.name().equalsIgnoreCase("perfect")) // Exclude "perfect"
			.toList();
		return filteredTiers.get(new Random().nextInt(filteredTiers.size()));
	}

    /**
     * Picks a random tier weighted toward higher tiers for high item levels.
     * (You can expand this if you want more realism later)
     */
    public static Essence_currency.EssenceTier pickTierForItemLevel(int itemLevel) {
        if (itemLevel >= 75) {
            // Higher chance for greater/perfect
            int roll = new Random().nextInt(100);
            if (roll < 50) return Essence_currency.EssenceTier.GREATER;
            else return Essence_currency.EssenceTier.PERFECT;
        } else if (itemLevel >= 50) {
            return Essence_currency.EssenceTier.NORMAL;
        } else {
            return Essence_currency.EssenceTier.LESSER;
        }
    }
}
