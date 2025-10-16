package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Currency.Essence_currency;

public class OmenOfDextralCrystallisation extends Omen {

	public OmenOfDextralCrystallisation() {
		this.name = "Omen of Dextral Crystallisation";
		this.priority = 75;
	}

	@Override
	public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
		// Only applies to Perfect or Corrupted Essences
		if (action instanceof Essence_currency essence) {
			// Prevent activating if Sinistral Crystallisation is already active
			if (item.hasOmen(OmenOfSinistralCrystallisation.class)) {
				System.out.println("Cannot activate Dextral Crystallisation while Sinistral is active!");
				return item;
			}

			// Restrict essence removal/applying to SUFFIX only
			essence.setForcedType(ModType.SUFFIX_ONLY);
			System.out.println("Dextral Crystallisation active: only suffixes will be affected.");
		}
		return item;
	}
}
