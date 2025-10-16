package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.*;

public class OmenOfSinistralExaltation extends Omen {

    public OmenOfSinistralExaltation() {
        this.name = "Omen of Sinistral Exaltation";
		this.priority = 1;
    }

	@Override
	public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
		if (!(action instanceof ExaltedOrb exalted)) {
			return item;
		}
	
		// Modify the ExaltedOrb behavior to only add prefixes
		exalted.setForcedType(ExaltedOrb.ModType.PREFIX_ONLY);
		System.out.println("Setting to prefix lock");
	
		// Mark this omen as consumed
		// this.consumed = true;
		return item;
	}
}