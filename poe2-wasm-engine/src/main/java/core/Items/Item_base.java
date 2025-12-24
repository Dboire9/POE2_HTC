package core.Items;

import core.Modifier_class.*;
import java.util.List;

/**
 * The {@code Item_base} class represents the base structure of an item in the game.
 * It defines the allowed prefixes and suffixes for different crafting methods such as
 * normal crafting, desecration, and essences.
 */
public class Item_base {

	protected List<Modifier> Normal_allowedPrefixes;    // List of normal prefixes allowed for crafting.
	protected List<Modifier> Normal_allowedSuffixes;    // List of normal suffixes allowed for crafting.
	protected List<Modifier> Desecrated_allowedPrefixes; // List of desecrated prefixes allowed for crafting.
	protected List<Modifier> Desecrated_allowedSuffixes; // List of desecrated suffixes allowed for crafting.
	protected List<Modifier> Essences_allowedPrefixes;  // List of essence prefixes allowed for crafting.
	protected List<Modifier> Essences_allowedSuffixes;  // List of essence suffixes allowed for crafting.

    /**
     * Retrieves the list of prefixes allowed for normal crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed prefixes.
     */
    public List<Modifier> getNormalAllowedPrefixes() {
        return Normal_allowedPrefixes;
    }

    /**
     * Retrieves the list of suffixes allowed for normal crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed suffixes.
     */
    public List<Modifier> getNormalAllowedSuffixes() {
        return Normal_allowedSuffixes;
    }

    /**
     * Retrieves the list of prefixes allowed for desecration crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed prefixes.
     */
    public List<Modifier> getDesecratedAllowedPrefixes() {
        return Desecrated_allowedPrefixes;
    }

    /**
     * Retrieves the list of suffixes allowed for desecration crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed suffixes.
     */
    public List<Modifier> getDesecratedAllowedSuffixes() {
        return Desecrated_allowedSuffixes;
    }

    /**
     * Retrieves the list of prefixes allowed for essence crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed prefixes.
     */
    public List<Modifier> getEssencesAllowedPrefixes() {
        return Essences_allowedPrefixes;
    }

    /**
     * Retrieves the list of suffixes allowed for essence crafting.
     *
     * @return A list of {@code Modifier} objects representing the allowed suffixes.
     */
    public List<Modifier> getEssencesAllowedSuffixes() {
        return Essences_allowedSuffixes;
    }
}
