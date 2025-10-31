// package core.Currency.Omens_currency;

// import core.Crafting.Crafting_Action;
// import core.Crafting.Crafting_Item;
// import core.Currency.AnnulmentOrb;
// import core.Currency.ChaosOrb;

// public class OmenOfDextralErasure extends Omen {

//     public OmenOfDextralErasure() {
//         this.name = "Omen of Dextral Erasure";
// 		this.associatedCurrency = ChaosOrb.class;
//         this.priority = 1; // high priority to apply before default orb behavior
//     }

//     @Override
//     public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
//         // Only modify ChaosOrbs
//         if (!(action instanceof ChaosOrb chaos)) return item;

//         // Check that Sinistral Erasure is not active
//         if (item.hasOmen(OmenOfSinistralErasure.class)) {
//             // System.out.println("Cannot activate Dextral while Sinistral is active!");
//             return item;
//         }

//         // Force the orb to remove only suffixes
//         chaos.setForcedType(Crafting_Item.ModType.SUFFIX_ONLY);
//         // System.out.println("Dextral Erasure active: removing only suffixes");

//         return item;
//     }
// }
