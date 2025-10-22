package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.RegalOrb;

public class OmenOfHomogenisingCoronation extends Omen {

    public OmenOfHomogenisingCoronation() {
        this.name = "Omen of Homogenising Coronation";
        this.associatedCurrency = RegalOrb.class;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof RegalOrb regal) {
            regal.homogenising = true; // ✅ activate homogenising behavior
            // System.out.println("🌀 Homogenising Omen active: Regal Orb will add a modifier of a similar type.");
        }
        return item;
    }
}
