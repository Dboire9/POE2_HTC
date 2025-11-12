package core.Modifier_class;

import java.util.ArrayList;
import java.util.List;

/**
 * The {@code Modifier} class represents a complete modifier with multiple tiers.
 * It includes various categories, tags, and metadata to define the behavior and
 * properties of the modifier.
 */
public class Modifier {
    public String primaryCategory; // Primary category of the modifier
    public String secondaryCategory; // Secondary category of the modifier (optional)
    public String thirdCategory; // Third category of the modifier (optional)
    public String fourthCategory; // Fourth category of the modifier (optional)
    public List<ModifierTier> tiers; // List of tiers associated with the modifier
    public int chosenTier = 0; // Currently chosen tier for the modifier
    public ModifierType type; // Type of the modifier (PREFIX or SUFFIX)
    public List<String> tags; // Tags associated with the modifier
    public ModifierSource source; // Source of the modifier (e.g., NORMAL, DESECRATED, ESSENCE)
    public String family; // Family to which the modifier belongs
    public String text; // Descriptive text of the modifier
    public boolean is_desired_mod = false; // Indicates whether the modifier is desired for the algorithm

    /**
     * Enum representing the type of the modifier.
     */
    public enum ModifierType {
        PREFIX, SUFFIX
    }

    /**
     * Enum representing the source of the modifier.
     */
    public enum ModifierSource {
        NORMAL, DESECRATED, ESSENCE, PERFECT_ESSENCE
    }

    /**
     * Copy constructor to create a deep copy of an existing {@code Modifier}.
     *
     * @param other The {@code Modifier} object to copy.
     */
    public Modifier(Modifier other) {
        this.primaryCategory = other.primaryCategory;
        this.secondaryCategory = other.secondaryCategory;
        this.thirdCategory = other.thirdCategory;
        this.fourthCategory = other.fourthCategory;
        this.tiers = new ArrayList<>(other.tiers); // Deep copy of the list
        this.type = other.type;
        this.tags = new ArrayList<>(other.tags); // Deep copy of the list
        this.source = other.source;
        this.family = other.family;
        this.text = other.text;
    }

    /**
     * Constructor for a single-category modifier.
     *
     * @param primaryCategory The primary category of the modifier.
     * @param tags            The tags associated with the modifier.
     * @param tiers           The list of tiers for the modifier.
     * @param type            The type of the modifier (PREFIX or SUFFIX).
     * @param source          The source of the modifier.
     * @param family          The family of the modifier.
     * @param text            The descriptive text of the modifier.
     */
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

    /**
     * Constructor for a hybrid modifier with two categories.
     *
     * @param primaryCategory   The primary category of the modifier.
     * @param secondaryCategory The secondary category of the modifier.
     * @param tags              The tags associated with the modifier.
     * @param tiers             The list of tiers for the modifier.
     * @param type              The type of the modifier (PREFIX or SUFFIX).
     * @param source            The source of the modifier.
     * @param family            The family of the modifier.
     * @param text              The descriptive text of the modifier.
     */
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

    /**
     * Constructor for a hybrid modifier with three categories.
     *
     * @param primaryCategory   The primary category of the modifier.
     * @param secondaryCategory The secondary category of the modifier.
     * @param thirdCategory     The third category of the modifier.
     * @param tags              The tags associated with the modifier.
     * @param tiers             The list of tiers for the modifier.
     * @param type              The type of the modifier (PREFIX or SUFFIX).
     * @param source            The source of the modifier.
     * @param family            The family of the modifier.
     * @param text              The descriptive text of the modifier.
     */
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

    /**
     * Constructor for a hybrid modifier with four categories.
     *
     * @param primaryCategory   The primary category of the modifier.
     * @param secondaryCategory The secondary category of the modifier.
     * @param thirdCategory     The third category of the modifier.
     * @param fourthCategory    The fourth category of the modifier.
     * @param tags              The tags associated with the modifier.
     * @param tiers             The list of tiers for the modifier.
     * @param type              The type of the modifier (PREFIX or SUFFIX).
     * @param source            The source of the modifier.
     * @param family            The family of the modifier.
     * @param text              The descriptive text of the modifier.
     */
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

    /**
     * Copy constructor to create a {@code Modifier} copy with or without the modifier tiers.
     *
     * @param other        The {@code Modifier} object to copy.
     * @param excludeTiers If {@code true}, the tiers will not be copied.
     */
    public Modifier(Modifier other, boolean excludeTiers) {
        this.primaryCategory = other.primaryCategory;
        this.secondaryCategory = other.secondaryCategory;
        this.thirdCategory = other.thirdCategory;
        this.fourthCategory = other.fourthCategory;
        this.tiers = excludeTiers ? new ArrayList<>() : new ArrayList<>(other.tiers);
        this.type = other.type;
        this.tags = new ArrayList<>(other.tags);
        this.source = other.source;
        this.family = other.family;
        this.text = other.text;
    }
}