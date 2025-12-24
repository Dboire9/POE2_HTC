package core.Currency;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;

import core.Modifier_class.Modifier;

/**
 * The {@code ExaltedOrb} class represents a crafting action that adds a random affix
 * (prefix or suffix) to an item, provided there is space for it. It supports different
 * tiers and omens that can influence the crafting process.
 */
public class ExaltedOrb implements Crafting_Action {

    /**
     * The tier of the Exalted Orb, which determines its strength.
     */
    public CurrencyTier tier;

    /**
     * The set of omens associated with this Exalted Orb.
     */
    public Set<Omen> omens;

    /**
     * Enum representing the different omens that can influence the crafting process.
     */
    public enum Omen {
        None,
        // OmenofHomogenisingExaltation,
        OmenofSinistralExaltation,
        OmenofDextralExaltation,
        OmenofGreaterExaltation
    }

    /**
     * Retrieves the available omens that can be applied to the Exalted Orb.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }

    /**
     * Creates a copy of the current Exalted Orb.
     *
     * @return A new {@code ExaltedOrb} instance with the same properties.
     */
    @Override
    public Crafting_Action copy() {
        return new ExaltedOrb(this.tier, this.omens);
    }

    /**
     * Applies the Exalted Orb crafting action to a list of crafting candidates.
     * This method adds a random affix (prefix or suffix) to the item if there is space.
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the Exalted Orb.
     */
    @Override
    public List<Crafting_Candidate> apply(
            Crafting_Item item,
            List<Crafting_Candidate> CandidateList,
            List<Modifier> desiredMods,
            Map<String, Integer> CountDesiredModifierTags,
            List<Modifier> undesiredMods
    ) {
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

        List<Modifier> all_Affix_modifiers = new ArrayList<>();

        // Add allowed prefixes if there is space
        if (item.getAllCurrentPrefixModifiers().size() != 3)
            all_Affix_modifiers.addAll(item.base.getNormalAllowedPrefixes());

        // Add allowed suffixes if there is space
        if (item.getAllCurrentSuffixModifiers().size() != 3)
            all_Affix_modifiers.addAll(item.base.getNormalAllowedSuffixes());

        // If no affixes can be added, return an empty list
        if (all_Affix_modifiers.isEmpty())
            return CandidateListCopy;

        // Evaluate affixes for each candidate
        for (Crafting_Candidate candidate : CandidateList)
            CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));

        return CandidateListCopy;
    }

    /**
     * Constructor to create an Exalted Orb with a specific tier and omen.
     *
     * @param tier The tier of the Exalted Orb.
     * @param omen The omen associated with the Exalted Orb.
     */
    public ExaltedOrb(CurrencyTier tier, Omen omen) {
        this.tier = tier;
        this.omens = new HashSet<>();
        this.omens.add(omen);
    }

    /**
     * Constructor to create an Exalted Orb with a specific tier and a set of omens.
     *
     * @param tier The tier of the Exalted Orb.
     * @param omen The set of omens associated with the Exalted Orb.
     */
    public ExaltedOrb(CurrencyTier tier, Set<Omen> omen) {
        this.tier = tier;
        this.omens = new HashSet<>();
        this.omens = omen;
    }

    /**
     * Default constructor to create an Exalted Orb with the base tier and no omens.
     */
    public ExaltedOrb() {
        this.tier = CurrencyTier.BASE;
        this.omens = new HashSet<>();
        this.omens.add(Omen.None);
    }

    /**
     * Retrieves the name of the Exalted Orb, including its tier.
     *
     * @return The name of the Exalted Orb.
     */
    @Override
    public String getName() {
        return "Exalted Orb (" + tier + ")";
    }

    /**
     * Adds an omen to the Exalted Orb. This method ensures that conflicting omens
     * (e.g., Sinistral and Dextral) cannot coexist, and removes the "None" omen
     * if a real omen is added.
     *
     * @param omen The omen to be added.
     */
    public void addOmen(Omen omen) {
        // If adding Sinistral, remove Dextral if present
		// REDO (We might just return ?)
        if (omen == Omen.OmenofSinistralExaltation && omens.contains(Omen.OmenofDextralExaltation))
            omens.remove(Omen.OmenofDextralExaltation);

        // If adding Dextral, remove Sinistral if present
        if (omen == Omen.OmenofDextralExaltation && omens.contains(Omen.OmenofSinistralExaltation))
            omens.remove(Omen.OmenofSinistralExaltation);

        // If adding a real omen (not None), remove None from the set
        if (omen != Omen.None)
            omens.remove(Omen.None);

        // Finally, add the new omen
        omens.add(omen);
    }
}
