package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Currency.ExaltedOrb;

public class OmenOfHomogenisingExaltation extends Omen {

    @Override
    public String getName() {
        return "Omen of Homogenising Coronation";
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof ExaltedOrb exalt) {
            exalt.homogenising = true; // ✅ activate homogenising behavior
            System.out.println("🌀 Homogenising Omen active: Exalted Orb will add a modifier of a similar type.");
        }
        return item;
    }
}