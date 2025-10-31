// package core.Currency.Omens_currency;

// import core.Crafting.Crafting_Action;
// import core.Crafting.Crafting_Item;
// import core.Crafting.Crafting_Item.*;
// import core.Currency.*;

// public class OmenOfSinistralExaltation extends Omen {

// 	public OmenOfSinistralExaltation() {
// 		this.name = "Omen of Sinistral Exaltation";
// 		this.associatedCurrency = ExaltedOrb.class;
// 		this.priority = 1;
// 	}

// 	@Override
// 	public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
// 		if (!(action instanceof ExaltedOrb exalted)) {
// 			return item;
// 		}

// 		if (item.hasOmen(OmenOfDextralExaltation.class)) {
// 			// System.out.println("Cannot activate Sinistral while Dextral is active!");
// 			return item;
// 		}

// 		// Modify the ExaltedOrb behavior to only add prefixes
// 		exalted.setForcedType(ModType.PREFIX_ONLY);

// 		return item;
// 	}
// }