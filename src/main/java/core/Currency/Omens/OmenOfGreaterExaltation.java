package core.Currency.Omens;

import core.Crafting.*;
import core.Currency.*;

public class OmenOfGreaterExaltation extends Omen {

    public OmenOfGreaterExaltation() {
        this.name = "Omen of Greater Exaltation";
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof ExaltedOrb exalted)) {
            // Not relevant for this omen
            return item;
        }
		System.out.println("In greaterexalt omen");

        // Apply the exalted orb twice
        exalted.apply(item);
        exalted.apply(item);

        // Consume the omen
        this.consumed = true;
        return item;
    }
}
