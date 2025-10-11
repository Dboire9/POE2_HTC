package core.Items;

import java.util.List;
import core.Modifier_class.*;

public class Item_storage_modifiers {
	    // Constructor
		public Item_storage_modifiers(ModifierWithLevel prefix1, ModifierWithLevel prefix2, ModifierWithLevel prefix3,
		ModifierWithLevel suffix1, ModifierWithLevel suffix2, ModifierWithLevel suffix3) {
		this.StoredPrefix1 = prefix1;
		this.StoredPrefix2 = prefix2;
		this.StoredPrefix3 = prefix3;
		this.StoredSuffix1 = suffix1;
		this.StoredSuffix2 = suffix2;
		this.StoredSuffix3 = suffix3;
		}
    // Inner class to store Modifier and its level
    public static class ModifierWithLevel {
        public Modifier modifier;
        public int level;

        public ModifierWithLevel(Modifier modifier, int level) {
            this.modifier = modifier;
            this.level = level;
        }
    }

    // Fields to store prefixes and suffixes
    public ModifierWithLevel StoredPrefix1;
    public ModifierWithLevel StoredPrefix2;
    public ModifierWithLevel StoredPrefix3;
    public ModifierWithLevel StoredSuffix1;
    public ModifierWithLevel StoredSuffix2;
    public ModifierWithLevel StoredSuffix3;
}