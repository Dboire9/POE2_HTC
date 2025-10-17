package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Currency.AnnulmentOrb;
import core.Modifier_class.Modifier;

public class OmenOfDesecratedAnnulment extends Omen {

    public OmenOfDesecratedAnnulment() {
        this.name = "Omen of Desecrated Annulment";
        this.priority = 1;
    }

    @Override
    public Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action) {
        if (!(action instanceof AnnulmentOrb annul)) return item;

        // Activate desecrated-only behavior
        annul.setDesecratedOnly(true);

        System.out.println("💀 Omen of Desecrated Annulment active: Only Desecrated modifiers will be removed.");
        return item;
    }

    @Override
    public String getName() {
        return "Omen of Desecrated Annulment";
    }
}
