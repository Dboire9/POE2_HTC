package core.Crafting;

public interface Crafting_Action {

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}


    Crafting_Item apply(Crafting_Item item); // transforms the item
    int getCost();                        // relative cost of using this action
    String getName();                        // name for display
}