package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item.*;
import core.Currency.RegalOrb;

public class OmenOfSinistralCoronation extends Omen {

    public OmenOfSinistralCoronation() {
        this.name = "Omen of Sinistral Coronation";
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        // Only applies to Regal Orb
        if (action instanceof RegalOrb regalOrb) {
            System.out.println("[Omen] Sinistral Coronation active → forcing PREFIX_ONLY on Regal Orb");
            regalOrb.setForcedType(ModType.PREFIX_ONLY);
        }
        return item;
    }
}
