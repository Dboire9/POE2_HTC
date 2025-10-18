package core.Currency.Omens_currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;

/**
 * Base class for all Omens.
 * Omens modify the behavior of another crafting action (like an Exalted Orb)
 * and are consumed once their effect has been applied.
 */
public abstract class Omen implements Crafting_Action {

    protected String name;
    public boolean consumed = false;
	protected int priority = 0;

    public String getName() {return name;}

    public boolean isConsumed() {return consumed;}
	public int getPriority() { return priority; }

	public Crafting_Action associatedCurrency;

    /**
     * Called when the omen modifies another action (e.g., ExaltedOrb).
     */
    public abstract Crafting_Item applyEffect(Crafting_Item item, Crafting_Action action);

    /**
     * Default `apply()` implementation (since Omens are not direct item actions).
     * It can simply attach itself to the item.
     */
    @Override
    public Crafting_Item apply(Crafting_Item item) {
        item.addActiveOmen(this);
        return item;
    }

    @Override
    public int getCost() {
        return 0; // or set a specific cost if you want
    }
}
