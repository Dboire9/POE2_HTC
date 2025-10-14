package core.Crafting;

public interface Crafting_Action {
    Crafting_Item apply(Crafting_Item item); // transforms the item
    double getCost();                        // relative cost of using this action
    String getName();                        // name for display
}