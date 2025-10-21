package core.Crafting;


import core.Currency.*;
import core.Currency.Omens_currency.Omen;

import java.util.*;

public class CraftingCurrencyPicker {

    private static final Random random = new Random();

    public static Crafting_Action pickRandomCurrency(Crafting_Item item, boolean isDesecrated) {
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
					// For white (normal) items: Only transmute
					chosenClass = TransmutationOrb.class;
				}

				case MAGIC -> {
					// For blue (magic) items: augments, regals, augmentation, essence
					if(item.getAllModifiers().size() == 2)
						chosenClass = weightedPick(Map.of(
							RegalOrb.class, 20
						));
					else
						chosenClass = weightedPick(Map.of(
							AugmentationOrb.class, 80,
							RegalOrb.class, 20
						));

				}

				case RARE -> {
					if(isDesecrated)
						chosenClass = weightedPick(Map.of(
							ExaltedOrb.class, 50,
							AnnulmentOrb.class, 10,
							ChaosOrb.class, 5,
							Desecrated_currency.class, 20
						));
					else
					chosenClass = weightedPick(Map.of(
						ExaltedOrb.class, 50,
						AnnulmentOrb.class, 10,
						ChaosOrb.class, 5
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
		// Choosing what tier the currency will be
		try {
			if(chosenClass == AnnulmentOrb.class || chosenClass == Desecrated_currency.class)
				return chosenClass.getDeclaredConstructor().newInstance();
				else 
				{
					// RNG for CurrencyTier
					Crafting_Action.CurrencyTier[] tiers = Crafting_Action.CurrencyTier.values();
					Random random = new Random();
					int randomIndex = random.nextInt(tiers.length);
					Crafting_Action.CurrencyTier randomTier = tiers[randomIndex];
			
					// Construct the object based on the random tier
					if (randomTier == Crafting_Action.CurrencyTier.BASE) {
						return chosenClass.getDeclaredConstructor().newInstance();
					} else if (randomTier == Crafting_Action.CurrencyTier.GREATER) {
						return chosenClass.getConstructor(Crafting_Action.CurrencyTier.class)
						.newInstance(Crafting_Action.CurrencyTier.GREATER);
					} else if (randomTier == Crafting_Action.CurrencyTier.PERFECT) {
						return chosenClass.getConstructor(Crafting_Action.CurrencyTier.class)
							.newInstance(Crafting_Action.CurrencyTier.PERFECT);
					} else {
						throw new IllegalStateException("Unexpected CurrencyTier: " + randomTier);
					}
				}
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
