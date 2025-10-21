package core.Currency.Omens_currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Currency.Desecrated_currency;
import core.Currency.Desecrated_currency.guaranteedDesecratedModifier;

public class OmenOfTheLiege extends Omen {
    public OmenOfTheLiege() {
        this.name = "Omen of the Liege";
		this.associatedCurrency = Desecrated_currency.class;
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof Desecrated_currency des) || !item.desecrated) return item;

		if (item.hasOmen(OmenOfTheBlackblooded.class) || item.hasOmen(OmenOfTheSovereign.class)) {
			System.out.println("Cannot activate Blackblooded Omen while Liege or Sovereign is active!");
			return item;
		}


        des.guaranteed_des_mod = guaranteedDesecratedModifier.AMANAMU;
        System.out.println("Omen active: Next Weapon or Jewellery Desecration will guarantee an Amanamu modifier.");
        return item;
    }

    @Override
    public String getName() {
        return name;
    }
}