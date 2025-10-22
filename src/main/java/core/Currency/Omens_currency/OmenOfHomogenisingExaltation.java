package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;

public class OmenOfHomogenisingExaltation extends Omen {

    public OmenOfHomogenisingExaltation() {
        this.name = "Omen of Homogenising Exaltation";
        this.associatedCurrency = ExaltedOrb.class; // 🟢 Link it to RegalOrb for your OmenPicker logic
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof ExaltedOrb exalt) {
            exalt.homogenising = true; // ✅ activate homogenising behavior
            // System.out.println("🌀 Homogenising Omen active: Exalted Orb will add a modifier of a similar type.");
        }
        return item;
    }
}