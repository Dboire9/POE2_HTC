package core.Crafting;

import core.Currency.*;
import core.Currency.Omens_currency.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class CraftingOmenPicker {

    private static final Random RNG = new Random();

    /**
     * Picks a random omen based on the item rarity.
     * For MAGIC items, only Regal-related omens are allowed.
     * For RARE items, any omen can be chosen.
     * For UNIQUE items, no omens are applied.
     */
    public static Omen pickRandomOmen(Crafting_Item item, List<Omen> allOmens) {
        List<Omen> possibleOmens = new ArrayList<>();
		Omen finalOmen; 

        switch (item.rarity) {
            case MAGIC -> {
                for (Omen omen : allOmens) {
                    if (omen.associatedCurrency == RegalOrb.class) {
                        possibleOmens.add(omen);
                    }
                }
            }
            case RARE -> {
                for (Omen omen : allOmens) {
                    if (omen.associatedCurrency != RegalOrb.class) {
                        possibleOmens.add(omen);
                    }
                }
			}
		}

        if (possibleOmens.isEmpty()) {
            return null; // nothing to pick
        }

		finalOmen = possibleOmens.get(RNG.nextInt(possibleOmens.size()));

        return finalOmen;
    }
}