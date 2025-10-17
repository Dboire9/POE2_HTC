package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.RegalOrb;
import core.Currency.Omen_currency;

public class OmenOfHomogenisingCoronation extends Omen {

    @Override
    public String getName() {
        return "Omen of Homogenising Coronation";
    }

    @Override
    public String getDescription() {
        return "While this item is active in your inventory your next Regal Orb "
             + "will add a Modifier of the same type as an existing Modifier on the Item";
    }

    @Override
    public int getWeight() {
        return 75;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof RegalOrb regal) {
            regal.homogenising = true; // ✅ activate homogenising behavior
            System.out.println("🌀 Homogenising Omen active: Regal Orb will add a modifier of a similar type.");
        }
        return item;
    }
}
