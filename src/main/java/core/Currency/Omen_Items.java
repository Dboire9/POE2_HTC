package core.Currency;

import core.Currency.Currency_Items;

public abstract class Omen_Items {
    protected String name;

    public Omen_Items(String name) { this.name = name; }

    public String getName() { return name; }

    // Return true if this omen affects the given currency
    public abstract boolean affects(Currency_Items currency);

    // Optional modifiers the omen can provide
    public int getMaxPrefixes() { return -1; } // -1 means no change
    public int getMaxSuffixes() { return -1; }
    public boolean forceOnlyPrefixes() { return false; }
    public boolean forceOnlySuffixes() { return false; }
    public boolean removeTwoModifiers() { return false; }
}