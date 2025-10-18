package core.Currency.Omens_currency;


import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Currency.Desecrated_currency;
import core.Currency.Desecrated_currency.guaranteedDesecratedModifier;

public class OmenOfTheBlackblooded extends Omen {

    public OmenOfTheBlackblooded() {
        this.name = "Omen of the Blackblooded";
		this.associatedCurrency = new Desecrated_currency();
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof Desecrated_currency des)) 
            return item;

		if (item.hasOmen(OmenOfTheLiege.class) || item.hasOmen(OmenOfTheSovereign.class)) {
			System.out.println("Cannot activate Blackblooded Omen while Liege or Sovereign is active!");
			return item;
		}

        // Filter allowed modifiers to only Kurgal family
        des.guaranteed_des_mod = guaranteedDesecratedModifier.KURGAL;

        System.out.println("Omen active: Next Weapon or Jewellery Desecration will guarantee a Kurgal modifier.");
        return item;
    }

    @Override
    public String getName() {
        return name;
    }
}
