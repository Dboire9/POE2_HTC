package core.Modifier_class;

// Tier for a modifier
public class ModifierTier {
	public String name;
	public int level;
	public int weight;
	public Pair<Number, Number> minMax1;
	public Pair<Number, Number> minMax2;
	public Pair<Number, Number> minMax3;
	public Pair<Number, Number> minMax4;
	public String stat1; // optional, for hybrid
	public String stat2; // optional, for hybrid
	public String stat3; // optional, for third stat with hybrid
	public String stat4; // optional, for double hybrid

	// Copy constructor
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

	// Single-value mods (percent or flat)
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

	// Two-value flat mods
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

	// Three-value mods
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

	// Four-value mods
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