package core.Items;

import java.util.List;
import core.Modifier_class.*;

public class Item_storage_modifiers {
    public Modifier modifier;
    public Pair<Number, Number> pair;

    // Constructor
    public Item_storage_modifiers(Modifier modifier, Pair<Number, Number> pair) {
        this.modifier = modifier;
        this.pair = pair;
    }
}