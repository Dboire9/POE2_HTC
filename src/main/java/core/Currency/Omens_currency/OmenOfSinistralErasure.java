package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.ChaosOrb;

public class OmenOfSinistralErasure extends Omen {

    public OmenOfSinistralErasure() {
        this.name = "Omen of Sinistral Erasure";
		this.associatedCurrency = ChaosOrb.class;
        this.priority = 1; // high priority to apply before default orb behavior
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        // Only modify ChaosOrbs
        if (!(action instanceof ChaosOrb chaos)) return item;

        // Check that Dextral Erasure is not active
        if (item.hasOmen(OmenOfDextralErasure.class)) {
            System.out.println("Cannot activate Sinistral while Dextral is active!");
            return item;
        }

        // Force the orb to remove only prefixes
        chaos.setForcedType(Crafting_Item.ModType.PREFIX_ONLY);
        System.out.println("Sinistral Erasure active: removing only prefixes");

        return item;
    }
}
