package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.Desecrated_currency;
import core.Currency.Desecrated_currency.guaranteedDesecratedModifier;


public class OmenOfTheSovereign extends Omen {
    public OmenOfTheSovereign() {
        this.name = "Omen of the Sovereign";
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof Desecrated_currency des)) return item;

		if (item.hasOmen(OmenOfTheBlackblooded.class) || item.hasOmen(OmenOfTheLiege.class)) {
			System.out.println("Cannot activate Blackblooded Omen while Liege or Sovereign is active!");
			return item;
		}


        des.guaranteed_des_mod = guaranteedDesecratedModifier.ULAMAN;
        System.out.println("Omen active: Next Weapon or Jewellery Desecration will guarantee an Ulaman modifier.");
        return item;
    }

    @Override
    public String getName() {
        return name;
    }
}