package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Action;
import core.Currency.AnnulmentOrb;

public class OmenOfDextralAnnulment extends Omen {

    public OmenOfDextralAnnulment() {
        this.name = "Omen of Dextral Annulment";
        this.priority = 80;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof AnnulmentOrb annul) {
			if (item.hasOmen(OmenOfSinistralAnnulment.class)) {
				System.out.println("Cannot activate Dextral Annulment while Sinistral is active!");
				return item;
			}
            annul.setForcedType(ModType.SUFFIX_ONLY);
            System.out.println("Dextral Annulment active: only suffixes will be removed.");
        }
        return item;
    }
}
