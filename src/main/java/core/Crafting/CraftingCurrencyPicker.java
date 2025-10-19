package core.Crafting;


import core.Currency.*;
import core.Currency.Omens_currency.Omen;

import java.util.*;

public class CraftingCurrencyPicker {

    private static final Random random = new Random();

    // 🎲 Register available currencies here
    private static final List<Class<? extends Crafting_Action>> currencyPool = List.of(
        TransmutationOrb.class,
        AugmentationOrb.class,
        RegalOrb.class,
        ExaltedOrb.class,
        ChaosOrb.class,
        AnnulmentOrb.class
    );

    /**
     * Pick a random currency depending on item rarity and context.
     */
    public static Crafting_Action pickRandomCurrency(Crafting_Item item) {
        Class<? extends Crafting_Action> chosenClass = null;


		// 🧿 1️⃣ Check for active omens first
		if (!item.getActiveOmens().isEmpty()) {
			Omen activeOmen = item.getActiveOmens().get(0); // You can pick the first or choose by priority

			if (activeOmen.associatedCurrency != null) {
				System.out.println("🧿 Active omen detected: " + activeOmen.getName());
				System.out.println("💰 Using associated currency: " + activeOmen.associatedCurrency.getSimpleName());
				chosenClass = activeOmen.associatedCurrency;
			}
		}


		if (chosenClass == null)
		{

			switch (item.rarity) {
				case NORMAL -> {
					// For white (normal) items: Only transmute for now
					chosenClass = weightedPick(Map.of(
						TransmutationOrb.class, 50
					));
				}

				case MAGIC -> {
					// For blue (magic) items: augments, regals, augmentation, essence
					chosenClass = weightedPick(Map.of(
						AugmentationOrb.class, 50,
						RegalOrb.class, 20,
						Essence_currency.class, 20
					));
				}

				case RARE -> {
					// For yellow (rare) items: exalt, annul, chaos
					chosenClass = weightedPick(Map.of(
						ExaltedOrb.class, 50,
						AnnulmentOrb.class, 10,
						ChaosOrb.class, 30,
						Essence_currency.class, 20,
						Desecrated_currency.class, 20
					));
				}
			}
		}

		
		if (chosenClass == Essence_currency.class) {
			// Create a random essence using your existing helper
			String randomType = Essence_currency.pickRandomEssenceType(item);
			Essence_currency.EssenceTier randomTier = Essence_currency.pickTierForItemLevel();
			return Essence_currency.create(randomType, randomTier);
		}
		try {
			return chosenClass.getDeclaredConstructor().newInstance();
		} catch (Exception e) {
			System.err.println("⚠️ Cannot instantiate the class: " + chosenClass.getName());
			e.printStackTrace();
			return null;
		}
	}
		

    /**
     * Weighted random selection helper.
     */
    private static <T> Class<? extends T> weightedPick(Map<Class<? extends T>, Integer> weights) {
        int total = weights.values().stream().mapToInt(Integer::intValue).sum();
        int roll = random.nextInt(total);
        int sum = 0;

        for (Map.Entry<Class<? extends T>, Integer> entry : weights.entrySet()) {
            sum += entry.getValue();
            if (roll < sum)
                return entry.getKey();
        }
        return null;
    }
}
