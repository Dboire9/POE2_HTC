package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Currency.ExaltedOrb;

public class OmenOfDextralExaltation extends Omen {

    public OmenOfDextralExaltation() {
        this.name = "Omen of Dextral Exaltation";
        this.priority = 1; // high priority so it applies before GreaterExaltation
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof ExaltedOrb exalted)) {
            return item;
        }

		if (item.hasOmen(OmenOfSinistralExaltation.class)) {
			System.out.println("Cannot activate Dextral while Sinistral is active!");
			return item;
		}

        // Force the orb to only add suffixes
        exalted.setForcedType(ModType.SUFFIX_ONLY);
        System.out.println("Setting to suffix lock");

        // Mark this omen as consumed
        this.consumed = true;
        return item;
    }
}
