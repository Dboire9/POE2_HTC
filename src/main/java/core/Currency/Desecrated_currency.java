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
 * The {@code Desecrated_currency} class represents a crafting action that applies desecrated modifiers
 * to an item. This class supports the use of omens, which influence the behavior of the crafting process.
 */
public class Desecrated_currency implements Crafting_Action {

    /**
     * A set of omens that influence the crafting action.
     */
    public Set<Omen> omens;

    /**
     * Enum representing the different types of omens available for the Desecrated Currency.
     */
    public enum Omen {
        OmenofDextralNecromancy,
        OmenofSinistralNecromancy,
        OmenoftheBlackblooded,
        OmenoftheLiege,
        OmenoftheSovereign
    }

    /**
     * Default constructor that initializes the Desecrated Currency with an empty set of omens.
     */
    public Desecrated_currency() {
        this.omens = new HashSet<>();
    }

    /**
     * Constructor that initializes the Desecrated Currency with a specific omen.
     *
     * @param omen The omen to be added to the Desecrated Currency.
     */
    public Desecrated_currency(Omen omen) {
        if (this.omens == null) {
            this.omens = new HashSet<>();
        }
        this.omens.add(omen);
    }

    /**
     * Adds an omen to the Desecrated Currency. If the omen conflicts with an existing one,
     * the conflicting omen is removed before adding the new one.
     *
     * @param omen The omen to be added.
     */
    public void addOmen(Omen omen) {
		//REDO (Maybe we should just return ?)
        // If we are adding Sinistral, remove Dextral if present
        if (omen == Omen.OmenofSinistralNecromancy && omens.contains(Omen.OmenofDextralNecromancy)) {
            omens.remove(Omen.OmenofDextralNecromancy);
        }

        // If we are adding Dextral, remove Sinistral if present
        if (omen == Omen.OmenofDextralNecromancy && omens.contains(Omen.OmenofSinistralNecromancy)) {
            omens.remove(Omen.OmenofSinistralNecromancy);
        }

        // Finally, add the new omen
        omens.add(omen);
    }

    /**
     * Applies the Desecrated Currency crafting action to a list of crafting candidates.
     * This method evaluates the affixes of each candidate and applies the desecrated modifiers,
     * potentially modifying the list of candidates.
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the desecrated modifiers.
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

        // Add allowed prefixes and suffixes if the item does not already have 3 of each
        if (item.getAllCurrentPrefixModifiers().size() != 3) {
            all_Affix_modifiers.addAll(item.base.getDesecratedAllowedPrefixes());
        }
        if (item.getAllCurrentSuffixModifiers().size() != 3) {
            all_Affix_modifiers.addAll(item.base.getDesecratedAllowedSuffixes());
        }

        // Evaluate affixes for each candidate
        for (Crafting_Candidate candidate : CandidateList) {
            // As we cannot have two desecrated mods
            if (!candidate.desecrated) {
                CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
            }
        }
        return CandidateListCopy;
    }

    /**
     * Creates a copy of the current Desecrated Currency instance.
     *
     * @return A new {@code Desecrated_currency} instance.
     */
    @Override
    public Crafting_Action copy() {
        return new Desecrated_currency();
    }

    /**
     * Retrieves the name of the crafting action.
     *
     * @return The name of the crafting action.
     */
    @Override
    public String getName() {
        return "Desecrated Currency";
    }

    /**
     * Retrieves the available omens that can be applied to the Desecrated Currency.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }
}
