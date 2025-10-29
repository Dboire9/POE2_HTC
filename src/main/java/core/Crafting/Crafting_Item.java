package core.Crafting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.Set;

import core.Crafting.Crafting_Action.CurrencyTier;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Essence_currency;
import core.Currency.TransmutationOrb;
import core.Currency.Omens_currency.Omen;
import core.Currency.Omens_currency.OmenOfDextralExaltation;
import core.Currency.Omens_currency.OmenOfSinistralExaltation;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;


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

	

	// Keep a list so multiple omens can be active together
	private final List<Omen> activeOmens = new ArrayList<>();

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


	// Adding a prefix with tier
	public List<Crafting_Item> addAffixes(List<Modifier> mod, Crafting_Item item, Crafting_Action action)
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
	
	public List<Crafting_Item> removeAffixes(Crafting_Item item, Crafting_Action action)
	{
		List<Crafting_Item> Items_List = new ArrayList<>();
	
		Modifier LastMod = item.modifierHistory.get(0).modifier;
		// Loop through all current affixes on the item
		for (Modifier currentAffix : item.getAllCurrentModifiers()) {
	
			// Skip removal if the current affix is the last modifier, there is no point in removing a mod we just put on
			if (currentAffix.equals(LastMod)) {
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

	// Add the modifier passed in parameters
	public void addModifier(ModifierTier tier, Modifier parent, boolean isPrefix) {
		if (isPrefix) {
			for (int i = 0; i < currentPrefixes.length; i++) {
				if (currentPrefixes[i] == null) {
					currentPrefixes[i] = parent;
					currentPrefixTiers[i] = tier;
					return;
				}
			}
		} else {
			for (int i = 0; i < currentSuffixes.length; i++) {
				if (currentSuffixes[i] == null) {
					currentSuffixes[i] = parent;
					currentSuffixTiers[i] = tier;
					return;
				}
			}
		}
	}

	public boolean hasFamily(String family) {
		for (Modifier mod : currentPrefixes) {
			if (mod != null && mod.family.equalsIgnoreCase(family)) {
				return true;
			}
		}
		for (Modifier mod : currentSuffixes) {
			if (mod != null && mod.family.equalsIgnoreCase(family)) {
				return true;
			}
		}
		return false;
	}

	




	

	// Checking if the item has all modifiers filled
	public boolean isFull() {
		return Arrays.stream(currentPrefixes).noneMatch(m -> m == null)
				&& Arrays.stream(currentSuffixes).noneMatch(m -> m == null);
	}

	public boolean isPrefixFull() {
		return Arrays.stream(currentPrefixes).noneMatch(m -> m == null);
	}

	public boolean isSuffixFull() {
		return Arrays.stream(currentSuffixes).noneMatch(m -> m == null);
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

		if (currentPrefixes != null) {
			for (Modifier m : currentPrefixes) {
				if (m != null)
					mods.add(m);
			}
		}

		if (currentSuffixes != null) {
			for (Modifier m : currentSuffixes) {
				if (m != null)
					mods.add(m);
			}
		}

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


	// Get all active omens currently attached to this item.
	public List<Omen> getActiveOmens() {
		return activeOmens;
	}

	public boolean hasOmen(Class<? extends Omen> omenClass) {
		for (Omen o : activeOmens) {
			if (omenClass.isInstance(o))
				return true;
		}
		return false;
	}

	public List<Modifier> getAllModifiers()
	{
		List<Modifier> all = new ArrayList<>();
		all.addAll(Arrays.asList(currentPrefixes));
		all.addAll(Arrays.asList(currentSuffixes));

		return all.stream().filter(Objects::nonNull).toList();
	}



	// Homogenising handling
}
