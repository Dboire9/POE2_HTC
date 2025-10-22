package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ModType;
import core.Currency.ChaosOrb;
import core.Currency.Desecrated_currency;


public class OmenOfSinistralNecromancy extends Omen {


	public OmenOfSinistralNecromancy() {
		this.name = "Omen Of Sinistral Necromancy";
		this.associatedCurrency = Desecrated_currency.class;
		this.priority = 1;
	}

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        // Prevent conflicting omen
		if (!(action instanceof Desecrated_currency des)) return item;
		
		// There is something wrong here that does not detect if the other omen was applied
        if (item.hasOmen(OmenOfDextralNecromancy.class)) {
            // System.out.println("Cannot activate Sinistral Desecration while Dextral is active!");
            return item;
        }

        // Force next desecration to only affect prefixes
        des.setForcedType(ModType.PREFIX_ONLY);
        // System.out.println("Sinistral Desecration active: only prefixes will be blocked next.");
		return item;
    }

    @Override
    public String getName() {
        return "Omen of Sinistral Desecration";
    }
}
