package core.Currency.Omens_currency;

import core.Crafting.*;
import core.Currency.*;

public class OmenOfGreaterExaltation extends Omen {

    public OmenOfGreaterExaltation() {
        this.name = "Omen of Greater Exaltation";
		this.associatedCurrency = new ExaltedOrb();
		this.priority = 0;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof ExaltedOrb exalted)) {
            // Not relevant for this omen
            return item;
        }
		System.out.println("In greaterexalt omen");

		exalted.greaterexalt = true;

        return item;
    }
}
