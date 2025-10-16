package core.Currency.Omens_currency;

import core.Crafting.*;
import core.Currency.*;

public class OmenOfGreaterExaltation extends Omen {

    public OmenOfGreaterExaltation() {
        this.name = "Omen of Greater Exaltation";
		this.priority = 0;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof ExaltedOrb exalted)) {
            // Not relevant for this omen
            return item;
        }
		// System.out.println("In greaterexalt omen");

        // Apply the exalted orb twice
		System.out.println(item.getActiveOmens());
        exalted.apply(item);
		System.out.println(item.getActiveOmens());
        exalted.apply(item);

        return item;
    }
}
