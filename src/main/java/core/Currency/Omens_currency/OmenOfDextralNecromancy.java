// package core.Currency.Omens_currency;

// import core.Crafting.Crafting_Action;
// import core.Crafting.Crafting_Item;
// import core.Crafting.Crafting_Item.ModType;
// import core.Currency.Desecrated_currency;
// import core.Currency.ExaltedOrb;


// public class OmenOfDextralNecromancy extends Omen {


// 	public OmenOfDextralNecromancy() {
// 		this.name = "Omen Of Dextral Necromancy";
// 		this.associatedCurrency = Desecrated_currency.class;
// 		this.priority = 1;
// 	}
	
//     @Override
//     public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
//         // Prevent conflicting omens
// 		if (!(action instanceof Desecrated_currency des)) return item;
		
// 		// There is something wrong here that does not detect if the other omen was applied
//         if (item.hasOmen(OmenOfSinistralNecromancy.class)) {
//             // System.out.println("Cannot activate Dextral Desecration while Sinistral is active!");
//             return item;
//         }

//         // Force next desecration to only affect suffixes
//         des.setForcedType(ModType.SUFFIX_ONLY);
//         // System.out.println("Dextral Desecration active: only suffixes will be blocked next.");
// 		return item;
//     }

//     @Override
//     public String getName() {
//         return "Omen of Dextral Desecration";
//     }
// }
