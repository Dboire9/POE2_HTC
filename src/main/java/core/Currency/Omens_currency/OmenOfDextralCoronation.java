package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item.*;
import core.Currency.RegalOrb;


public class OmenOfDextralCoronation extends Omen {

    public OmenOfDextralCoronation() {
        this.name = "Omen of Dextral Coronation";
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        // Only applies to Regal Orb
        if (action instanceof RegalOrb regalOrb) {
            System.out.println("[Omen] Dextral Coronation active → forcing SUFFIX_ONLY on Regal Orb");
            regalOrb.setForcedType(ModType.SUFFIX_ONLY);
        }
        return item;
    }
}
