package core.Crafting;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Utils.ModifierEvent;

import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.*;
import core.Modifier_class.ModifierTier;
/**
 * Represents a crafting item with various properties such as base item, rarity,
 * modifiers, and crafting history. This class provides functionality to manage
 * and manipulate crafting items, including copying, resetting, and adding affixes.
 */
public class Crafting_Item {

    /**
     * The base item associated with this crafting item.
     */
    public Item_base base;

    /**
     * The rarity of the crafting item (e.g., NORMAL, MAGIC, RARE).
     */
    public ItemRarity rarity;

    /**
     * A flag indicating whether the item is desecrated.
     */
    public boolean desecrated = false;

    /**
     * The current score of the crafting item.
     */
    public double score;

    /**
     * The previous score of the crafting item.
     */
    public double prev_score;

	/**
	 * The level of the crafting item.
	 */
	public int level = 100;

    /**
     * The current prefix modifiers applied to the item.
     */
    public Modifier[] currentPrefixes = new Modifier[3];

    /**
     * The current suffix modifiers applied to the item.
     */
    public Modifier[] currentSuffixes = new Modifier[3];

    /**
     * The tiers of the current prefix modifiers.
     */
    public ModifierTier[] currentPrefixTiers = new ModifierTier[3];

    /**
     * The tiers of the current suffix modifiers.
     */
    public ModifierTier[] currentSuffixTiers = new ModifierTier[3];

    /**
     * The history of modifier events applied to this item.
     */
    public List<ModifierEvent> modifierHistory = new ArrayList<>();

    /**
     * Creates a deep copy of the current `Crafting_Item` instance.
     *
     * @return A new `Crafting_Item` instance that is a deep copy of the current instance.
     */
    public Crafting_Item copy() {
        Crafting_Item clone = new Crafting_Item(this.base);
        clone.rarity = this.rarity;
        clone.desecrated = this.desecrated;

        // Deep copy current prefixes
        for (int i = 0; i < currentPrefixes.length; i++) {
            if (this.currentPrefixes[i] != null) {
                clone.currentPrefixes[i] = new Modifier(this.currentPrefixes[i]); // Deep copy
            }
            if (this.currentPrefixTiers[i] != null) {
                clone.currentPrefixTiers[i] = new ModifierTier(this.currentPrefixTiers[i]); // Deep copy
            }
        }

        // Deep copy current suffixes
        for (int i = 0; i < currentSuffixes.length; i++) {
            if (this.currentSuffixes[i] != null) {
                clone.currentSuffixes[i] = new Modifier(this.currentSuffixes[i]); // Deep copy
            }
            if (this.currentSuffixTiers[i] != null) {
                clone.currentSuffixTiers[i] = new ModifierTier(this.currentSuffixTiers[i]); // Deep copy
            }
        }

        // Deep copy modifier history
        clone.modifierHistory = new ArrayList<>();
        for (ModifierEvent event : this.modifierHistory) {
            clone.modifierHistory.add(event.copy()); // Ensure ModifierEvent has a copy method
        }

		clone.level = this.level;
		return clone;
    }

    /**
     * Enum representing the rarity levels of a crafting item.
     */
    public enum ItemRarity {
        NORMAL, MAGIC, RARE
    }

    /**
     * Constructs a new `Crafting_Item` with the specified base item.
     *
     * @param base The base item associated with this crafting item.
     */
	public Crafting_Item(Item_base base) {
		this.base = base;
		this.rarity = ItemRarity.NORMAL;
		this.level = 100;
	}

	// New constructor to allow explicit level setting
	public Crafting_Item(Item_base base, int level) {
		this.base = base;
		this.rarity = ItemRarity.NORMAL;
		this.level = level;
	}

    /**
     * Default constructor for `Crafting_Item`.
     */
    public Crafting_Item() {}

    /**
     * Resets the crafting item to its default state.
     */
    public void reset() {
        this.rarity = ItemRarity.NORMAL;
        this.desecrated = false;
        this.score = 0;
        this.prev_score = 0;
    }

    /**
     * Adds affixes to the crafting item based on the provided modifiers, actions, and undesired modifiers.
     *
     * @param mod The list of modifiers to consider for adding.
     * @param item The crafting item to which affixes will be added.
     * @param action A map of crafting actions and their associated probabilities.
     * @param undesiredMods A list of modifiers that should not be added.
     * @return A list of new `Crafting_Item` instances with the added affixes.
     */
    public List<Crafting_Item> addAffixes(List<Modifier> mod, Crafting_Item item, Map<Crafting_Action, Double> action, List<Modifier> undesiredMods) {
        List<Crafting_Item> Items_List = new ArrayList<>();
        List<String> Item_family = new ArrayList<>();

        // Collect the families of all current modifiers
        for (Modifier currentAffixes : item.getAllCurrentModifiers()) {
            Item_family.add(currentAffixes.family);
        }

        // Loop through all modifiers and their lowest tiers
        for (Modifier m : mod) {
            ModifierTier lowestTier = m.tiers.get(0);

            // Check if the family is not already on the item and is not undesired
            if (!Item_family.contains(m.family) && (undesiredMods == null || !undesiredMods.contains(m))) {
                Crafting_Item new_item = item.copy();

                // Apply the modifier based on its type
                if (m.type == ModifierType.PREFIX && item.getAllCurrentPrefixModifiers().size() < 3) {
                    new_item.addPrefix(m, lowestTier);
                    new_item.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.ADDED));
                    Items_List.add(new_item);
                } else if (m.type == ModifierType.SUFFIX && item.getAllCurrentSuffixModifiers().size() < 3) {
                    new_item.addSuffix(m, lowestTier);
                    new_item.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.ADDED));
                    Items_List.add(new_item);
                }
            }
        }

        return Items_List;
    }

	/**
     * Adds perfect essence affixes to the crafting item.
     *
     * @param mod          List of modifiers to apply.
     * @param item         The crafting item to modify.
     * @param action       Map of crafting actions and their probabilities.
     * @param desiredMods  List of desired modifiers to avoid removing.
     * @return A list of crafting items with the applied perfect essence affixes.
     */
	public List<Crafting_Item> addPerfectEssenceAffixes(List<Modifier> mod, Crafting_Item item, Map<Crafting_Action, Double> action, List<Modifier> desiredMods)
	{
		List<Crafting_Item> Items_List = new ArrayList<>();
		List<String> Item_family = new ArrayList<>();
		for(Modifier currentAffixes : item.getAllCurrentModifiers())
			Item_family.add(currentAffixes.family);
		// Looping through all the modifiers and the lowest modifier tier
		for (Modifier m : mod) {
			// Take only the lowest tier
			ModifierTier lowestTier = m.tiers.get(0);
			//Check if the family is already on the item
			if(!Item_family.contains(m.family))
			{

				// If we want to apply a perfect essence that goes on a prefix but prefixes are full, we only remove and add on prefixes
				if (m.type == ModifierType.PREFIX && item.getAllCurrentPrefixModifiers().size() >= 3)
					for(int i = 0; i < 3; i++)
					{
						Modifier changed_modifier;
						if(desiredMods.contains(currentPrefixes[i]))
							continue;
						Crafting_Item new_item_copy = new Crafting_Item();
						new_item_copy = item.copy();
						if(new_item_copy.currentPrefixes[i].source == ModifierSource.DESECRATED)
							new_item_copy.desecrated = false;
						changed_modifier = new_item_copy.currentPrefixes[i];
						new_item_copy.currentPrefixes[i] = null;
						new_item_copy.currentPrefixTiers[i] = null;
						new_item_copy.addPrefix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED, changed_modifier));
						Items_List.add(new_item_copy);
					}
				else if (m.type == ModifierType.SUFFIX && item.getAllCurrentSuffixModifiers().size() >= 3)
					for(int i = 0; i < 3; i++)
					{
						Modifier changed_modifier;
						if(desiredMods.contains(currentSuffixes[i]))
							continue;
						Crafting_Item new_item_copy = new Crafting_Item();
						new_item_copy = item.copy();
						if(new_item_copy.currentSuffixes[i].source == ModifierSource.DESECRATED)
							new_item_copy.desecrated = false;
						changed_modifier = new_item_copy.currentSuffixes[i];
						new_item_copy.currentSuffixes[i] = null;
						new_item_copy.currentSuffixTiers[i] = null;
						new_item_copy.addSuffix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED, changed_modifier));
						Items_List.add(new_item_copy);
					}
				else
				{
					// We need to look for the modifier type and add the perfect essence only on it, but removing all the affixes we can
					for(int i = 0; i < 3; i++)
					{
						Modifier changed_modifier;
						if(currentPrefixes[i] == null || desiredMods.contains(currentPrefixes[i]))
							continue;
						Crafting_Item new_item_copy = new Crafting_Item();
						new_item_copy = item.copy();
						if(new_item_copy.currentPrefixes[i].source == ModifierSource.DESECRATED)
							new_item_copy.desecrated = false;
						changed_modifier = new_item_copy.currentPrefixes[i];
						new_item_copy.currentPrefixes[i] = null;
						new_item_copy.currentPrefixTiers[i] = null;
						if(m.type == ModifierType.PREFIX)
							new_item_copy.addPrefix(m, lowestTier);
						else
							new_item_copy.addSuffix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED, changed_modifier));
						Items_List.add(new_item_copy);
					}
					for(int i = 0; i < 3; i++)
					{
						Modifier changed_modifier;
						if(currentSuffixes[i] == null || desiredMods.contains(currentSuffixes[i]))
							continue;
						Crafting_Item new_item_copy = new Crafting_Item();
						new_item_copy = item.copy();
						if(new_item_copy.currentSuffixes[i].source == ModifierSource.DESECRATED)
							new_item_copy.desecrated = false;
						changed_modifier = new_item_copy.currentSuffixes[i];
						new_item_copy.currentSuffixes[i] = null;
						new_item_copy.currentSuffixTiers[i] = null;
						if(m.type == ModifierType.PREFIX)
							new_item_copy.addPrefix(m, lowestTier);
						else
							new_item_copy.addSuffix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED, changed_modifier));
						Items_List.add(new_item_copy);
					}
				}
			}
		}
		return Items_List;
	}
	
    /**
     * Removes affixes from the crafting item.
     *
     * @param item   The crafting item to modify.
     * @param action Map of crafting actions and their probabilities.
     * @return A list of crafting items with removed affixes.
     */
	public List<Crafting_Item> removeAffixes(Crafting_Item item, Map<Crafting_Action, Double> action)
	{
	
		List<Crafting_Item> Items_List = new ArrayList<>();
		if(item.score >= 6000)
			return Items_List;
	
		Modifier LastMod = item.modifierHistory.get(item.modifierHistory.size() - 1).modifier;
		// Loop through all current affixes on the item
		for (Modifier currentAffix : item.getAllCurrentModifiers()) {
	
			// Skip removal if the current affix is the last modifier, there is no point in removing a mod we just put on
			// Skip the removal of a desired mod
			if (currentAffix.text.equals(LastMod.text) || currentAffix.is_desired_mod) {
				continue;
			}
	
			// Create a copy of the item
			Crafting_Item new_item = item.copy();
	
			// Remove the modifier depending on its type
			if (currentAffix.type == ModifierType.PREFIX)
				new_item.removePrefix(currentAffix);
			else
				new_item.removeSuffix(currentAffix);
			
			if(currentAffix.source == ModifierSource.DESECRATED) // If we remove a desecrated mod, it can be appleid desecration again
				new_item.desecrated = false;
	
			// Record the removal event
			new_item.modifierHistory.add( new ModifierEvent(currentAffix, null, action, ModifierEvent.ActionType.REMOVED));
	
			// Add the modified item to the result list
			Items_List.add(new_item);
		}
		return Items_List;
	}



    /**
     * Calculates the total weight of affixes by tier and item level.
     *
     * @param Modifiers List of modifiers to calculate weight for.
     * @param ilvl      The item level to filter tiers.
     * @return The total weight of affixes.
     */
	public int get_Base_Affixes_Total_Weight_By_Tier(List<Modifier> Modifiers, int ilvl)
	{
		int total_weight = 0;

		for(Modifier m : Modifiers) {
			for(ModifierTier tiers : m.tiers) {
				if(tiers.level >= ilvl) {
					total_weight += tiers.weight;
				}
			}
		}
		
		return total_weight;
	}

    /**
     * Removes a prefix modifier from the crafting item.
     *
     * @param mod The modifier to remove.
     */
	public void removePrefix(Modifier mod) {
		for (int i = 0; i < this.currentPrefixes.length; i++) {
			if (this.currentPrefixes[i] != null && this.currentPrefixes[i].text != null && this.currentPrefixes[i].text.equals(mod.text)) {
				this.currentPrefixes[i] = null;
				this.currentPrefixTiers[i] = null; // clear the tier as well
				return;
			}
		}
		// System.out.println("Prefix not found to remove!");
	}

    /**
     * Removes a suffix modifier from the crafting item.
     *
     * @param mod The modifier to remove.
     */
	public void removeSuffix(Modifier mod) {
		for (int i = 0; i < this.currentSuffixes.length; i++) {
			if (this.currentSuffixes[i] != null && this.currentSuffixes[i].text != null && this.currentSuffixes[i].text.equals(mod.text)) {
				this.currentSuffixes[i] = null;
				this.currentSuffixTiers[i] = null; // clear the tier as well
				return;
			}
		}
		// System.out.println("Suffix not found to remove!");
	}

    /**
     * Adds a prefix modifier with a specific tier to the crafting item.
     *
     * @param mod  The modifier to add.
     * @param tier The tier of the modifier.
     */
	public void addPrefix(Modifier mod, ModifierTier tier) {
		for (int i = 0; i < this.currentPrefixes.length; i++) {
			if (currentPrefixes[i] == null) {
				this.currentPrefixes[i] = mod;
				this.currentPrefixTiers[i] = tier; // store applied tier separately
				return;
			}
		}
		// System.out.println("No prefix slot available!");
	}

    /**
     * Adds a suffix modifier with a specific tier to the crafting item.
     *
     * @param mod  The modifier to add.
     * @param tier The tier of the modifier.
     */
	public void addSuffix(Modifier mod, ModifierTier tier) {
		for (int i = 0; i < this.currentSuffixes.length; i++) {
			if (currentSuffixes[i] == null) {
				this.currentSuffixes[i] = mod;
				this.currentSuffixTiers[i] = tier; // store applied tier separately
				return;
			}
		}
		// System.out.println("No suffix slot available!");
	}

	/**
     * Retrieves all current modifiers (prefixes and suffixes).
     *
     * @return A list of all current modifiers.
     */
	public List<Modifier> getAllCurrentModifiers() {
		List<Modifier> mods = new ArrayList<>();

		mods.addAll(getAllCurrentPrefixModifiers());
		mods.addAll(getAllCurrentSuffixModifiers());

		return mods;
	}

	/**
     * Retrieves all current modifiers (prefixes).
     *
     * @return A list of all current modifiers.
     */
	public List<Modifier> getAllCurrentPrefixModifiers() {
		List<Modifier> mods = new ArrayList<>();

		if (this.currentPrefixes != null) {
			for (Modifier m : this.currentPrefixes) {
				if (m != null)
					mods.add(m);
			}
		}
		return mods;
	}


	/**
     * Retrieves all current modifiers (suffixes).
     *
     * @return A list of all current modifiers.
     */
	public List<Modifier> getAllCurrentSuffixModifiers() {
		List<Modifier> mods = new ArrayList<>();

		if (this.currentSuffixes != null) {
			for (Modifier m : this.currentSuffixes) {
				if (m != null)
					mods.add(m);
			}
		}
		return mods;
	}
}
