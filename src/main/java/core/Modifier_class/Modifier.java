package core.Modifier_class;

import java.util.List;

// Class representing a complete modifier with multiple tiers
public class Modifier {
	public String primaryCategory;
	public String secondaryCategory;
	public String thirdCategory;
	public String fourthCategory;
	public List<ModifierTier> tiers;
	public ModifierType type;
	public List<String> tags;
	public ModifierSource source;
	public String family;
	public String text;

	public enum ModifierType {
		PREFIX, SUFFIX
	}

	public enum ModifierSource {
		NORMAL, DESECRATED, ESSENCE
	}

	// Constructor for a single-category modifier
	public Modifier(String primaryCategory, List<String> tags, List<ModifierTier> tiers, ModifierType type,
			ModifierSource source, String family, String text) {
		this.primaryCategory = primaryCategory;
		this.secondaryCategory = "";
		this.thirdCategory = "";
		this.fourthCategory = "";
		this.tags = tags;
		this.tiers = tiers;
		this.type = type;
		this.source = source;
		this.family = family;
		this.text = text;
	}

	// Constructor for a hybrid modifier with two categories
	public Modifier(String primaryCategory, String secondaryCategory, List<String> tags, List<ModifierTier> tiers,
			ModifierType type, ModifierSource source, String family, String text) {
		this.primaryCategory = primaryCategory;
		this.secondaryCategory = secondaryCategory;
		this.thirdCategory = "";
		this.fourthCategory = "";
		this.tags = tags;
		this.tiers = tiers;
		this.type = type;
		this.source = source;
		this.family = family;
		this.text = text;
	}

	// Constructor for a hybrid modifier with two categories and another stat
	public Modifier(String primaryCategory, String secondaryCategory, String thirdCategory, List<String> tags,
			List<ModifierTier> tiers, ModifierType type, ModifierSource source, String family, String text) {
		this.primaryCategory = primaryCategory;
		this.secondaryCategory = secondaryCategory;
		this.thirdCategory = thirdCategory;
		this.fourthCategory = "";
		this.tags = tags;
		this.tiers = tiers;
		this.type = type;
		this.source = source;
		this.family = family;
		this.text = text;
	}

	// Constructor for two hybrids modifiers on item
	public Modifier(String primaryCategory, String secondaryCategory, String thirdCategory, String fourthCategory,
			List<String> tags, List<ModifierTier> tiers, ModifierType type, ModifierSource source, String family,
			String text) {
		this.primaryCategory = primaryCategory;
		this.secondaryCategory = secondaryCategory;
		this.thirdCategory = thirdCategory;
		this.fourthCategory = fourthCategory;
		this.tags = tags;
		this.tiers = tiers;
		this.type = type;
		this.source = source;
		this.family = family;
		this.text = text;
	}

}
