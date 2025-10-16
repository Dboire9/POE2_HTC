package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Currency.Essence_currency;

public class OmenOfSinistralCrystallisation extends Omen {

	public OmenOfSinistralCrystallisation() {
		this.name = "Omen of Sinistral Crystallisation";
		this.priority = 75;
	}

	@Override
	public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
		// Only applies to Perfect or Corrupted Essences
		if (action instanceof Essence_currency essence) {
			// Prevent activating if Dextral Crystallisation is already active
			if (item.hasOmen(OmenOfDextralCrystallisation.class)) {
				System.out.println("Cannot activate Sinistral Crystallisation while Dextral is active!");
				return item;
			}

			// Restrict essence removal/applying to PREFIX only
			essence.setForcedType(ModType.PREFIX_ONLY);
			System.out.println("Sinistral Crystallisation active: only prefixes will be affected.");
		}
		return item;
	}
}
