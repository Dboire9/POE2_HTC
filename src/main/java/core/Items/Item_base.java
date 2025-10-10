package core.Items;

import core.Modifier_class.*;
import java.util.List;

public class Item_base {
    protected List<Modifier> Normal_allowedPrefixes;
    protected List<Modifier> Normal_allowedSuffixes;
    protected List<Modifier> Desecrated_allowedPrefixes;
    protected List<Modifier> Desecrated_allowedSuffixes;
    protected List<Modifier> Essences_allowedPrefixes;
    protected List<Modifier> Essences_allowedSuffixes;

    // Used to return a class 
    public String getItemClass() {
        return this.getClass().getSimpleName();
    }
}