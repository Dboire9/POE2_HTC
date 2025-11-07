package core.Crafting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import core.Crafting.Utils.ModifierEvent;

import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;
import core.Modifier_class.ModifierTier;


public class Crafting_Item {

	public Item_base base;
	public ItemRarity rarity;
	public boolean desecrated = false;
	public double score;
	public double prev_score;
	
	// Current modifiers
	public Modifier[] currentPrefixes = new Modifier[3];
	public Modifier[] currentSuffixes = new Modifier[3];

	// Store the applied tier for each modifier
	public ModifierTier[] currentPrefixTiers = new ModifierTier[3];
	public ModifierTier[] currentSuffixTiers = new ModifierTier[3];

	public List<ModifierEvent> modifierHistory = new ArrayList<>();

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

		clone.modifierHistory = new ArrayList<>();
		for (ModifierEvent event : this.modifierHistory) {
			clone.modifierHistory.add(event.copy()); // Ensure ModifierEvent has a copy method
		}

	
		return clone;
	}

	public enum ItemRarity {
		NORMAL, MAGIC, RARE
	}

	public enum ModType {
		ANY, PREFIX_ONLY, SUFFIX_ONLY
	}

	public enum CraftingActionType {
		ESSENCE,
		CURRENCY,
		OMEN
	}


	// Constructor
	public Crafting_Item(Item_base base) {
		this.base = base;
		this.rarity = ItemRarity.NORMAL;
	}

	public Crafting_Item() {};


	// Adding an affix 
	public List<Crafting_Item> addAffixes(List<Modifier> mod, Crafting_Item item, Crafting_Action action, List<Modifier> undesiredMods)
	{
		List<Crafting_Item> Items_List = new ArrayList<>();
		List<String> Item_family = new ArrayList<>();
		for(Modifier currentAffixes : item.getAllCurrentModifiers())
			Item_family.add(currentAffixes.family);
		// Looping through all the modifiers and the lowest modifier tier
		for (Modifier m : mod) {
			// Take only the lowest tier
			ModifierTier lowestTier = m.tiers.get(0);
			//Check if the family is already on the item, and if it is a mod that we don't want
			if (!Item_family.contains(m.family) && (undesiredMods == null || !undesiredMods.contains(m))) 
			{
				// Create a copy of the item
				Crafting_Item new_item = item.copy();

				// Apply the modifier with the lowest tier
				if (m.type == ModifierType.PREFIX)
					new_item.addPrefix(m, lowestTier);
				else
					new_item.addSuffix(m, lowestTier);

				// Add the new item to the list
				new_item.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.ADDED));
				Items_List.add(new_item);
			}
		}
		return Items_List;
	}
	
	// Adding a perfect essence affix
	public List<Crafting_Item> addPerfectEssenceAffixes(List<Modifier> mod, Crafting_Item item, Crafting_Action action)
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
				// Create a copy of the item
				Crafting_Item new_item = item.copy();

				// If we want to apply a perfect essence that goes on a prefix but prefixes are full, we only remove and add on prefixes
				if (m.type == ModifierType.PREFIX && item.getAllCurrentPrefixModifiers().size() >= 3)
					for(int i = 0; i < 3; i++)
					{
						new_item.addPerfectEssencePrefixOnly(m, lowestTier, i);
						new_item.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED));
						Items_List.add(new_item);
					}
				else if (m.type == ModifierType.SUFFIX && item.getAllCurrentSuffixModifiers().size() >= 3)
					for(int i = 0; i < 3; i++)
					{
						new_item.addPerfectEssenceSuffixOnly(m, lowestTier, i);
						new_item.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED));
						Items_List.add(new_item);
					}
				else
				{
					// We need to look for the modifier type and add the perfect essence only on it, but removing all the affixes we can
					for(int i = 0; i <= item.getAllCurrentPrefixModifiers().size() - 1; i++)
					{
						Crafting_Item new_item_copy = new_item.copy();
						if(currentPrefixes[i] != null && currentPrefixes[i].text != null)
						{
							new_item_copy.currentPrefixes[i] = null;
							new_item_copy.currentPrefixTiers[i] = null;
						}
						if(m.type == ModifierType.PREFIX)
							new_item_copy.addPrefix(m, lowestTier);
						else
							new_item_copy.addSuffix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED));
						Items_List.add(new_item_copy);
					}
					for(int i = 0; i <= item.getAllCurrentSuffixModifiers().size() - 1; i++)
					{
						Crafting_Item new_item_copy = new_item.copy();
						if(currentSuffixes[i] != null && currentSuffixes[i].text != null)
						{
							new_item_copy.currentSuffixes[i] = null;
							new_item_copy.currentSuffixTiers[i] = null;
						}
						if(m.type == ModifierType.PREFIX)
							new_item_copy.addPrefix(m, lowestTier);
						else
							new_item_copy.addSuffix(m, lowestTier);
						new_item_copy.modifierHistory.add(new ModifierEvent(m, lowestTier, action, ModifierEvent.ActionType.CHANGED));
						Items_List.add(new_item_copy);
					}
				}
			}
		}
		return Items_List;
	}
	
	public List<Crafting_Item> removeAffixes(Crafting_Item item, Crafting_Action action)
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
	
			// Record the removal event
			new_item.modifierHistory.add(
				new ModifierEvent(currentAffix, null, action, ModifierEvent.ActionType.REMOVED)
			);
	
			// Add the modified item to the result list
			Items_List.add(new_item);
		}
		return Items_List;
	}


	// Getting the total weight of an affix
	public int get_Base_Affix_Total_Weight(List<Modifier> Modifiers)
	{
		int total_weight = 0;

		for(Modifier m : Modifiers)
		{
			for(ModifierTier tiers : m.tiers)
				total_weight += tiers.weight;
		}
		return total_weight;
	}

	// Removing a prefix
	public void removePrefix(Modifier mod) {
		for (int i = 0; i < currentPrefixes.length; i++) {
			if (currentPrefixes[i] != null && currentPrefixes[i].text != null && currentPrefixes[i].text.equals(mod.text)) {
				currentPrefixes[i] = null;
				currentPrefixTiers[i] = null; // clear the tier as well
				return;
			}
		}
		// System.out.println("Prefix not found to remove!");
	}

	// Removing a suffix
	public void removeSuffix(Modifier mod) {
		for (int i = 0; i < currentSuffixes.length; i++) {
			if (currentSuffixes[i] != null && currentSuffixes[i].text != null && currentSuffixes[i].text.equals(mod.text)) {
				currentSuffixes[i] = null;
				currentSuffixTiers[i] = null; // clear the tier as well
				return;
			}
		}
		// System.out.println("Suffix not found to remove!");
	}

	// Adding a prefix with tier
	public void addPrefix(Modifier mod, ModifierTier tier) {
		for (int i = 0; i < currentPrefixes.length; i++) {
			if (currentPrefixes[i] == null) {
				currentPrefixes[i] = mod;
				currentPrefixTiers[i] = tier; // store applied tier separately
				return;
			}
		}
		// System.out.println("No prefix slot available!");
	}

	// Adding a suffix with tier
	public void addSuffix(Modifier mod, ModifierTier tier) {
		for (int i = 0; i < currentSuffixes.length; i++) {
			if (currentSuffixes[i] == null) {
				currentSuffixes[i] = mod;
				currentSuffixTiers[i] = tier; // store applied tier separately
				return;
			}
		}
		// System.out.println("No suffix slot available!");
	}
	
	// Replacing the mod for the perfect essence
	public void addPerfectEssencePrefixOnly(Modifier mod, ModifierTier tier, int i) {
		currentPrefixes[i] = mod;
		currentPrefixTiers[i] = tier; // store applied tier separately
		// System.out.println("No prefix slot available!");
	}
	
	public void addPerfectEssenceSuffixOnly(Modifier mod, ModifierTier tier, int i) {
				currentSuffixes[i] = mod;
				currentSuffixTiers[i] = tier;
		// System.out.println("No suffix slot available!");
	}
	
	public void addPerfectEssence(Modifier mod, ModifierTier tier) {
		for (int i = 0; i < currentSuffixes.length; i++) {
			if (currentSuffixes[i] == null) {
				currentSuffixes[i] = mod;
				currentSuffixTiers[i] = tier; // store applied tier separately
				return;
			}
		}
		// System.out.println("No suffix slot available!");
	}

	// Removing modifiers
	public void removePrefix(int index) {
		currentPrefixes[index] = null;
	}

	public void removeSuffix(int index) {
		currentSuffixes[index] = null;
	}

	public void clearModifiers() {
		Arrays.fill(currentPrefixes, null);
		Arrays.fill(currentSuffixes, null);
	}

	// Utils for getting the tags for homog omens
	public Set<String> getAllTagsFromModifiers() {
		Set<String> tags = new HashSet<>();
		for (Modifier m : this.getAllCurrentModifiers()) {
			if (m != null && m.tags != null)
				tags.addAll(m.tags);
		}
		return tags;
	}

	public List<Modifier> getAllCurrentModifiers() {
		List<Modifier> mods = new ArrayList<>();

		mods.addAll(getAllCurrentPrefixModifiers());
		mods.addAll(getAllCurrentSuffixModifiers());

		return mods;
	}

	public List<Modifier> getAllCurrentPrefixModifiers() {
		List<Modifier> mods = new ArrayList<>();

		if (currentPrefixes != null) {
			for (Modifier m : currentPrefixes) {
				if (m != null)
					mods.add(m);
			}
		}
		return mods;
	}

	public List<Modifier> getAllCurrentSuffixModifiers() {
		List<Modifier> mods = new ArrayList<>();

		if (currentSuffixes != null) {
			for (Modifier m : currentSuffixes) {
				if (m != null)
					mods.add(m);
			}
		}
		return mods;
	}
}
