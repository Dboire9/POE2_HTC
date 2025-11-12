package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Currency.ExaltedOrb.Omen;
import core.Modifier_class.Modifier;

/**
 * The {@code AugmentationOrb} class represents the crafting action of using an Orb of Augmentation.
 * This action adds a random modifier to a magic item. The class also supports different currency tiers
 * and omens that can influence the behavior of the augmentation process.
 */
public class AugmentationOrb implements Crafting_Action {

    /**
     * The tier of the currency, which can affect the behavior of the crafting action.
     */
    public Crafting_Action.CurrencyTier tier;

    /**
     * Creates a copy of the current Augmentation Orb instance.
     *
     * @return A new {@code AugmentationOrb} instance with the same properties.
     */
    @Override
    public Crafting_Action copy() {
        return new AugmentationOrb(this.tier);
    }

    /**
     * Applies the Augmentation Orb crafting action to a list of crafting candidates.
     * This method evaluates the affixes of each candidate and applies the augmentation
     * process, potentially modifying the list of candidates.
     *
     * @param item                     The crafting item being modified.
     * @param CandidateList            The list of current crafting candidates.
     * @param desiredMods              The list of desired modifiers to retain.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods            The list of undesired modifiers to remove.
     * @return A new list of crafting candidates after applying the augmentation process.
     */
    public List<Crafting_Candidate> apply(
            Crafting_Item item,
            List<Crafting_Candidate> CandidateList,
            List<Modifier> desiredMods,
            Map<String, Integer> CountDesiredModifierTags,
            List<Modifier> undesiredMods
    ) {
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

        // Retrieve all allowed prefix and suffix modifiers for the item
        List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
        List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();

        // Evaluate affixes with augmentation for each candidate
        for (Crafting_Candidate candidate : CandidateList) {
            CandidateListCopy.addAll(evaluateAffixeswithAug(all_Prefix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
            CandidateListCopy.addAll(evaluateAffixeswithAug(all_Suffix_Modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
        }

        // Convert the item's rarity to MAGIC
        item.rarity = Crafting_Item.ItemRarity.MAGIC;

        return CandidateListCopy;
    }

    /**
     * Constructor to create an Augmentation Orb with a specific currency tier.
     *
     * @param tier The currency tier to be applied to the Augmentation Orb.
     */
    public AugmentationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

    /**
     * Default constructor that initializes the Augmentation Orb with the base currency tier.
     */
    public AugmentationOrb() {
        this.tier = CurrencyTier.BASE;
    }

    /**
     * Retrieves the name of the crafting action.
     *
     * @return The name of the crafting action, including the currency tier.
     */
    @Override
    public String getName() {
        return "Orb of Augmentation (" + tier + ")";
    }

    /**
     * Retrieves the available omens that can be applied to the Augmentation Orb.
     *
     * @return An array of available omens.
     */
    @Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }
}