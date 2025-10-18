package core.Crafting;

import core.Currency.Essence_currency;
import java.util.Random;

public class CraftingEssencePicker {

    /**
     * Picks a random essence based on the available essence registry.
     * @return A randomly generated Essence_currency.
     */
    public static Essence_currency pickRandomEssence() {
        // 🎲 Pick a random essence type
        String essenceType = Essence_currency.pickRandomEssenceType();

        // 🎲 Pick a random tier (you can later make this depend on item level)
        Essence_currency.EssenceTier tier = pickRandomTier();

        // 🧩 Create the essence using your registry
        return Essence_currency.create(essenceType, tier);
    }

    /**
     * Picks a random tier (equal probability for now).
     */
    private static Essence_currency.EssenceTier pickRandomTier() {
        Essence_currency.EssenceTier[] tiers = Essence_currency.EssenceTier.values();
        return tiers[new Random().nextInt(tiers.length)];
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
