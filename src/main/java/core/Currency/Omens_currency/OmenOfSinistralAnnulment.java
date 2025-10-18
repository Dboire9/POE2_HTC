package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Action;
import core.Currency.AnnulmentOrb;

public class OmenOfSinistralAnnulment extends Omen {

    public OmenOfSinistralAnnulment() {
        this.name = "Omen of Sinistral Annulment";
		this.associatedCurrency = AnnulmentOrb.class;
        this.priority = 80;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (action instanceof AnnulmentOrb annul) {
			if (item.hasOmen(OmenOfDextralAnnulment.class)) {
				System.out.println("Cannot activate Sinistral Annulment while Dextral is active!");
				return item;
			}
            annul.setForcedType(ModType.PREFIX_ONLY);
            System.out.println("Sinistral Annulment active: only prefixes will be removed.");
        }
        return item;
    }
}
