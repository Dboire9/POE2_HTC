package core.Currency;

import java.util.*;
import core.Crafting.Crafting_Item;
import core.Currency.ExaltedOrb.Omen;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Modifier_class.*;

/**
 * The {@code TransmutationOrb} class represents a crafting action that upgrades
 * a normal item to a magic item by adding one or two random modifiers (prefixes or suffixes).
 */
public class TransmutationOrb implements Crafting_Action {

    public Crafting_Action.CurrencyTier tier; // The tier of the Transmutation Orb

    /**
     * Creates a copy of the current Transmutation Orb.
     *
     * @return A new {@code TransmutationOrb} instance with the same properties.
     */
    @Override
    public Crafting_Action copy() {
        return new TransmutationOrb(this.tier);
    }

    /**
     * Constructor to create a Transmutation Orb with a specific tier.
     *
     * @param tier The tier of the Transmutation Orb.
     */
    public TransmutationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

    /**
     * Default constructor to create a Transmutation Orb with the base tier.
     */
    public TransmutationOrb() {
        this.tier = CurrencyTier.BASE;
    }

    /**
     * Applies the Transmutation Orb crafting action to a list of crafting candidates.
     * This method upgrades a normal item to a magic item by adding one or two random
     * modifiers (prefixes or suffixes).
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the Transmutation Orb.
     */
    @Override
    public List<Crafting_Candidate> apply(
            Crafting_Item item,
            List<Crafting_Candidate> CandidateList,
            List<Modifier> desiredMods,
            Map<String, Integer> CountDesiredModifierTags,
            List<Modifier> undesiredMods
    ) {
        // Only works on NORMAL items
        if (item.rarity != Crafting_Item.ItemRarity.NORMAL) return CandidateList;

        // Get all allowed prefixes and suffixes
        List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
        List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();

        // Evaluate affixes for prefixes and suffixes
        CreateListAndEvaluateAffixes(all_Prefix_modifiers, item, CandidateList, desiredMods, CountDesiredModifierTags, undesiredMods);
        CreateListAndEvaluateAffixes(all_Suffix_Modifiers, item, CandidateList, desiredMods, CountDesiredModifierTags, undesiredMods);

        // Convert item to MAGIC rarity
        item.rarity = Crafting_Item.ItemRarity.MAGIC;

        return CandidateList;
    }

    /**
     * Retrieves the name of the Transmutation Orb, including its tier.
     *
     * @return The name of the Transmutation Orb.
     */
    @Override
    public String getName() {
        return "Orb of Transmutation (" + tier + ")";
    }

    /**
     * Retrieves the available omens that can be applied to the Transmutation Orb.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }
}