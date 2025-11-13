package core.Modifier_class;

/**
 * Represents a tier for a modifier, which can have up to four value ranges (min-max pairs)
 * and associated stats. This class supports single-value, two-value, three-value, and 
 * four-value modifiers.
 */
public class ModifierTier {
    public String name; // Name of the modifier tier
    public int level; // Level of the modifier tier
    public int weight; // Weight of the modifier tier, used for balancing
    public Pair<Number, Number> minMax1; // First min-max range
    public Pair<Number, Number> minMax2; // Second min-max range (optional) 
    public Pair<Number, Number> minMax3; // Third min-max range (optional)
    public Pair<Number, Number> minMax4; // Fourth min-max range (optional)
    public String stat1; // First stat associated with the modifier (optional)
    public String stat2; // Second stat associated with the modifier (optional)
    public String stat3; // Third stat associated with the modifier (optional)
    public String stat4; // Fourth stat associated with the modifier (optional)

    /**
     * Copy constructor. Creates a new ModifierTier object by copying the fields
     * from another ModifierTier instance.
     *
     * @param other The ModifierTier instance to copy from.
     */
    public ModifierTier(ModifierTier other) {
        this.name = other.name;
        this.level = other.level;
        this.weight = other.weight;
        this.minMax1 = other.minMax1; // Assuming Pair is immutable, direct copy is fine
        this.minMax2 = other.minMax2; // Assuming Pair is immutable, direct copy is fine
        this.minMax3 = other.minMax3; // Assuming Pair is immutable, direct copy is fine
        this.minMax4 = other.minMax4; // Assuming Pair is immutable, direct copy is fine
        this.stat1 = other.stat1;
        this.stat2 = other.stat2;
        this.stat3 = other.stat3;
        this.stat4 = other.stat4;
    }

    /**
     * Constructor for single-value modifiers (percent or flat).
     *
     * @param name    The name of the modifier tier.
     * @param level   The level of the modifier tier.
     * @param weight  The weight of the modifier tier.
     * @param minMax1 The first min-max range.
     */
    public ModifierTier(String name, int level, int weight, Pair<Number, Number> minMax1) {
        this.name = name;
        this.level = level;
        this.weight = weight;
        this.minMax1 = minMax1;
        this.minMax2 = null;
        this.minMax3 = null;
        this.minMax4 = null;
        this.stat1 = "";
        this.stat2 = "";
        this.stat3 = "";
        this.stat4 = "";
    }

    /**
     * Constructor for two-value flat modifiers.
     *
     * @param name    The name of the modifier tier.
     * @param level   The level of the modifier tier.
     * @param weight  The weight of the modifier tier.
     * @param minMax1 The first min-max range.
     * @param minMax2 The second min-max range.
     * @param stat1   The first stat associated with the modifier.
     * @param stat2   The second stat associated with the modifier.
     */
    public ModifierTier(String name, int level, int weight, Pair<Number, Number> minMax1, Pair<Number, Number> minMax2,
            String stat1, String stat2) {
        this.name = name;
        this.level = level;
        this.weight = weight;
        this.minMax1 = minMax1;
        this.minMax2 = minMax2;
        this.minMax3 = null;
        this.minMax4 = null;
        this.stat1 = stat1;
        this.stat2 = stat2;
        this.stat3 = "";
        this.stat4 = "";
    }

    /**
     * Constructor for three-value modifiers.
     *
     * @param name    The name of the modifier tier.
     * @param level   The level of the modifier tier.
     * @param weight  The weight of the modifier tier.
     * @param minMax1 The first min-max range.
     * @param minMax2 The second min-max range.
     * @param minMax3 The third min-max range.
     * @param stat1   The first stat associated with the modifier.
     * @param stat2   The second stat associated with the modifier.
     * @param stat3   The third stat associated with the modifier.
     */
    public ModifierTier(String name, int level, int weight, Pair<Number, Number> minMax1, Pair<Number, Number> minMax2,
            Pair<Number, Number> minMax3, String stat1, String stat2, String stat3) {
        this.name = name;
        this.level = level;
        this.weight = weight;
        this.minMax1 = minMax1;
        this.minMax2 = minMax2;
        this.minMax3 = minMax3;
        this.minMax4 = null;
        this.stat1 = stat1;
        this.stat2 = stat2;
        this.stat3 = stat3;
        this.stat4 = "";
    }

    /**
     * Constructor for four-value modifiers.
     *
     * @param name    The name of the modifier tier.
     * @param level   The level of the modifier tier.
     * @param weight  The weight of the modifier tier.
     * @param minMax1 The first min-max range.
     * @param minMax2 The second min-max range.
     * @param minMax3 The third min-max range.
     * @param minMax4 The fourth min-max range.
     * @param stat1   The first stat associated with the modifier.
     * @param stat2   The second stat associated with the modifier.
     * @param stat3   The third stat associated with the modifier.
     * @param stat4   The fourth stat associated with the modifier.
     */
    public ModifierTier(String name, int level, int weight, Pair<Number, Number> minMax1, Pair<Number, Number> minMax2,
            Pair<Number, Number> minMax3, Pair<Number, Number> minMax4, String stat1, String stat2, String stat3,
            String stat4) {
        this.name = name;
        this.level = level;
        this.weight = weight;
        this.minMax1 = minMax1;
        this.minMax2 = minMax2;
        this.minMax3 = minMax3;
        this.minMax4 = minMax4;
        this.stat1 = stat1;
        this.stat2 = stat2;
        this.stat3 = stat3;
        this.stat4 = stat4;
    }
}
