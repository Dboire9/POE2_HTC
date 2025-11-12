package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;

import core.Modifier_class.Modifier;

/**
 * The {@code AnnulmentOrb} class represents the crafting action of using an Orb of Annulment.
 * This action removes a random modifier from an item. The class also supports the use of
 * omens, which can influence the behavior of the annulment process.
 */
public class AnnulmentOrb implements Crafting_Action {

    /**
     * Enum representing the different types of omens that can be used with the Annulment Orb.
     * These omens may affect the outcome of the annulment process.
     */
    public enum Omen {
        None, // No omen applied
        OmenofSinistralAnnulment, 
        OmenofDextralAnnulment,
        OmenofLight
    }

    /**
     * The omen currently applied to the Annulment Orb.
     */
    public Omen omen;

    /**
     * Default constructor that initializes the Annulment Orb with no omen.
     */
    public AnnulmentOrb() {
        this.omen = Omen.None;
    }

    /**
     * Constructor that initializes the Annulment Orb with a specific omen.
     *
     * @param omen The omen to be applied to the Annulment Orb.
     */
    public AnnulmentOrb(Omen omen) {
        this.omen = omen;
    }

    /**
     * Creates a copy of the current Annulment Orb instance.
     *
     * @return A new {@code AnnulmentOrb} instance with the same properties.
     */
    @Override
    public Crafting_Action copy() {
        return new AnnulmentOrb();
    }

    /**
     * Retrieves the available omens that can be applied to the Annulment Orb.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }

    /**
     * Applies the Annulment Orb crafting action to a list of crafting candidates.
     * This method evaluates the affixes of each candidate and applies the annulment
     * process, potentially modifying the list of candidates.
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the annulment process.
     */
    public List<Crafting_Candidate> apply(
            Crafting_Item item,
            List<Crafting_Candidate> CandidateList,
            List<Modifier> desiredMods,
            Map<String, Integer> CountDesiredModifierTags,
            List<Modifier> undesiredMods
    ) {
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

        for (Crafting_Candidate candidate : CandidateList) {
            CandidateListCopy.addAll(
                evaluateAffixeswithAnnul(item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods)
            );

            // If the candidate has 6 or more modifiers and no new candidates were added, stop annulment
            if (candidate.getAllCurrentModifiers().size() >= 6 && CandidateListCopy.isEmpty()) {
                CandidateList.get(0).stopAnnul = true;
            }
        }
        return CandidateListCopy;
    }

    /**
     * Retrieves the name of the crafting action.
     *
     * @return The name of the crafting action, "Orb of Annulment".
     */
    @Override
    public String getName() {
        return "Orb of Annulment";
    }
}