package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Modifier_class.Modifier;

/**
 * The {@code RegalOrb} class represents a crafting action that upgrades a magic item
 * to a rare item by adding one random affix (prefix or suffix). It supports different
 * tiers and omens that can influence the crafting process.
 */
public class RegalOrb implements Crafting_Action {

    /**
     * The tier of the Regal Orb, which determines its strength.
     */
    public CurrencyTier tier;

    /**
     * The omen associated with this Regal Orb.
     */
    public Omen omen;

    /**
     * Enum representing the different omens that can influence the crafting process.
     */
    public enum Omen {
        None,
        OmenofHomogenisingCoronation
    }

    /**
     * Retrieves the available omens that can be applied to the Regal Orb.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }

    /**
     * Creates a copy of the current Regal Orb.
     *
     * @return A new {@code RegalOrb} instance with the same properties.
     */
    @Override
    public Crafting_Action copy() {
        return new RegalOrb(this.tier);
    }

    /**
     * Applies the Regal Orb crafting action to a list of crafting candidates.
     * This method upgrades a magic item to a rare item by adding one random affix
     * (prefix or suffix).
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the Regal Orb.
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

        // Add all allowed prefixes and suffixes
        all_Affix_modifiers.addAll(item.base.getNormalAllowedPrefixes());
        all_Affix_modifiers.addAll(item.base.getNormalAllowedSuffixes());

        // Evaluate affixes for each candidate
        for (Crafting_Candidate candidate : CandidateList) {
            CandidateListCopy.addAll(evaluateAffixes(
                    all_Affix_modifiers,
                    item,
                    candidate,
                    desiredMods,
                    CountDesiredModifierTags,
                    undesiredMods
            ));
        }
        return CandidateListCopy;
    }

    /**
     * Constructor to create a Regal Orb with a specific tier.
     *
     * @param tier The tier of the Regal Orb.
     */
    public RegalOrb(CurrencyTier tier) {
        this.tier = tier;
        this.omen = Omen.None;
    }

    /**
     * Constructor to create a Regal Orb with a specific tier and omen.
     *
     * @param tier The tier of the Regal Orb.
     * @param omen The omen associated with the Regal Orb.
     */
    public RegalOrb(CurrencyTier tier, Omen omen) {
        this.tier = tier;
        this.omen = omen;
    }

    /**
     * Default constructor to create a Regal Orb with the base tier and no omens.
     */
    public RegalOrb() {
        this.tier = CurrencyTier.BASE;
        this.omen = Omen.None;
    }

    /**
     * Retrieves the name of the Regal Orb, including its tier.
     *
     * @return The name of the Regal Orb.
     */
    @Override
    public String getName() {
        return "Regal Orb (" + tier + ")";
    }
}