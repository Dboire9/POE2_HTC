package core.Crafting;

import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.Essence_currency;
import core.Currency.Essence_currency.EssenceTier;
import core.Items.Item_base;
import core.Items.Body_Armours.Body_Armours_dex.Body_Armours_dex;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;

import java.util.ArrayList;
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
		String essenceType = "";
		Essence_currency.EssenceTier tier = EssenceTier.PERFECT;
        if(item.rarity != ItemRarity.RARE)
		{
        	tier = pickRandomTier();
			// 🎲 Pick a random essence type
			essenceType = Essence_currency.pickRandomEssenceType(item);
		}
		else
		{
			// Retrieving the base and the essences, and searching for perfect essences
			Item_base testItemClass = item.base;
			List<Modifier>EssencePrefix = testItemClass.getEssencesAllowedPrefixes();
			List<Modifier>EssenceSuffix = testItemClass.getEssencesAllowedSuffixes();

			List<Modifier> perfectEssenceModifiers = new ArrayList<>();

			for (Modifier modifier : EssencePrefix) {
				if (modifier.source == ModifierSource.PERFECT_ESSENCE) {
					perfectEssenceModifiers.add(modifier);
				}
			}

			// Loop through suffixes
			for (Modifier modifier : EssenceSuffix) {
				if (modifier.source == ModifierSource.PERFECT_ESSENCE) {
					perfectEssenceModifiers.add(modifier);
				}
			}

			// Will always take a perfect essence that is on the item
			essenceType = Essence_currency.pickRandomPerfectEssenceType(perfectEssenceModifiers);
		}

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
}
