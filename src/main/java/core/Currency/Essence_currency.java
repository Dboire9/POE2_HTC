package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Utils.ModifierEvent;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;

/**
 * The {@code Essence_currency} class represents a crafting action that applies essence modifiers
 * to an item. Essences are categorized into different tiers and families, and they can be used
 * to modify items in specific ways.
 */
public class Essence_currency implements Crafting_Action {

    /**
     * Enum representing the different tiers of essences.
     */
    public enum EssenceTier {
        LESSER, NORMAL, GREATER, PERFECT
    }

    /**
     * Enum representing the different omens that can influence the crafting process.
     */
    public enum Omen {
        None,
        OmenofSinistralCrystallisation,
        OmenofDextralCrystallisation
    }

    /**
     * The omen associated with this essence currency.
     */
    public Omen omen;

    /**
     * The family of the essence, which determines its type.
     */
    protected String essenceFamily;

    /**
     * The tier of the essence, which determines its strength.
     */
    protected ModifierTier tier;

    /**
     * Default constructor that initializes an empty essence currency.
     */
    public Essence_currency() {
        super();
    }

    /**
     * Constructor that initializes an essence currency with a specific family and tier.
     *
     * @param essenceFamily The family of the essence.
     * @param tier          The tier of the essence.
     */
    public Essence_currency(String essenceFamily, ModifierTier tier) {
        this.essenceFamily = essenceFamily;
        this.tier = tier;
    }

    /**
     * Constructor that initializes an essence currency with a specific omen.
     *
     * @param omen The omen to be associated with the essence currency.
     */
    public Essence_currency(Omen omen) {
        this.omen = omen;
    }

    /**
     * Creates a copy of the current essence currency.
     *
     * @return A new {@code Essence_currency} instance with the same properties.
     */
    @Override
    public Essence_currency copy() {
        return new Essence_currency(this.essenceFamily, this.tier);
    }

    /**
     * Retrieves the name of the essence currency, including its family and tier.
     *
     * @return The name of the essence currency.
     */
    public String getName() {
        return "Essence of " + essenceFamily + " (" + tier + ")";
    }

    /**
     * Retrieves the available omens that can be applied to the essence currency.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }

    /**
     * Applies the perfect essence crafting action to a list of crafting candidates.
     * This method evaluates the affixes of each candidate and applies the essence modifiers,
     * potentially modifying the list of candidates.
	 * This function is for Perfect Essences only.
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the perfect essence modifiers.
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

        ModifierEvent lastEvent = CandidateList.get(0).modifierHistory.get(CandidateList.get(0).modifierHistory.size() - 1);

        List<Modifier> allEssences = new ArrayList<>();
        List<Modifier> perfectEssences = new ArrayList<>();

        allEssences.addAll(item.base.getEssencesAllowedPrefixes());
        allEssences.addAll(item.base.getEssencesAllowedSuffixes());

        for (Modifier m : allEssences) {
            for (ModifierTier tier : m.tiers) {
                if (tier.name.contains("Perfect") && m != lastEvent.modifier) {
                    // We can reapply perfect essences but not the same as just before
                    Modifier modCopy = new Modifier(m);
                    modCopy.tiers = List.of(tier);
                    perfectEssences.add(modCopy);
                }
            }
        }

        for (Crafting_Candidate candidate : CandidateList) {
            CandidateListCopy.addAll(evaluateAffixes(perfectEssences, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
        }

        return CandidateListCopy;
    }
}