package core.Crafting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.Set;

import core.Crafting.Crafting_Action.CurrencyTier;
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
	
	// Current modifiers
	public Modifier[] currentPrefixes = new Modifier[3];
	public Modifier[] currentSuffixes = new Modifier[3];

	// Store the applied tier for each modifier
	public ModifierTier[] currentPrefixTiers = new ModifierTier[3];
	public ModifierTier[] currentSuffixTiers = new ModifierTier[3];

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


	// Adding a prefix with tier
	public List<Crafting_Item> addAffixes(List<Modifier> mod, Crafting_Item item, CurrencyTier currency_tier)
	{
		List<Crafting_Item> Items_List = new ArrayList<>();
		// Looping through all the modifiers and modifiers tiers
		for(Modifier m : mod)
		{
			for(ModifierTier mod_tiers : m.tiers)
			{
				// resetting to the item base each time
				Crafting_Item new_item = item.copy();
				if(currency_tier == CurrencyTier.BASE)
				{
					//Apllying the modifier and modifier tier
					if(m.type == ModifierType.PREFIX)
						new_item.addPrefix(m, mod_tiers);
					else
						new_item.addSuffix(m, mod_tiers);
					Items_List.add(new_item);
				}
			}
		}
		return Items_List;
	}
	
	// List<Crafting_Action> ca = new ArrayList<>();
	// Crafting_Candidate potential_candidate = new Crafting_Candidate(base, 0, ca);

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

	// Remove a random modifier from the item
	public Crafting_Item removeRandomModifier(ModType forcedType) {
		List<Modifier> candidates = new ArrayList<>();

		if (forcedType == ModType.ANY || forcedType == ModType.PREFIX_ONLY) {
			for (Modifier m : currentPrefixes)
				if (m != null)
					candidates.add(m);
		}
		if (forcedType == ModType.ANY || forcedType == ModType.SUFFIX_ONLY) {
			for (Modifier m : currentSuffixes)
				if (m != null)
					candidates.add(m);
		}

		if (candidates.isEmpty())
			return this;

		// Pick one modifier randomly to remove
		Random rng = new Random();
		Modifier toRemove = candidates.get(rng.nextInt(candidates.size()));

		// Remove from prefixes
		for (int i = 0; i < currentPrefixes.length; i++) {
			if (currentPrefixes[i] != null && currentPrefixes[i].equals(toRemove)) {
				currentPrefixes[i] = null;
				currentPrefixTiers[i] = null;
				return this;
			}
		}

		// Remove from suffixes
		for (int i = 0; i < currentSuffixes.length; i++) {
			if (currentSuffixes[i] != null && currentSuffixes[i].equals(toRemove)) {
				currentSuffixes[i] = null;
				currentSuffixTiers[i] = null;
				return this;
			}
		}

		return this;
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


	// Check if the item has all desired modifier tiers
	public static boolean isFinished(Crafting_Item item, List<ModifierTier> desiredMods) {
		if (desiredMods == null || desiredMods.isEmpty()) return false;

		int matched = 0;
		List<Modifier> currentMods = item.getAllCurrentModifiers();

		for (Modifier mod : currentMods) {
			for (ModifierTier currentTier : mod.tiers) {
				for (ModifierTier desiredTier : desiredMods) {
					// Same stat (family) name, and same or better tier level
					if (currentTier.name.equals(desiredTier.name) &&
						currentTier.level >= desiredTier.level) {
						matched++;
						break; // Prevent double counting the same desired tier
					}
				}
			}
		}

		if (matched >= desiredMods.size()) {
			return true;
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

	// -------------------------------------
	// OMEN HANDLING SECTION
	// -------------------------------------
	
	// Add a new active omen to the item.
	public void addActiveOmen(Omen omen) {

		if (hasOmen(omen.getClass())) {
			// System.out.println(omen.getName() + " is already active!");
			return;
		}

		// Prevent mutually exclusive omens
		if (omen instanceof OmenOfDextralExaltation && hasOmen(OmenOfSinistralExaltation.class)) {
			// System.out.println("Cannot activate Dextral while Sinistral is active!");
			return;
		}
		if (omen instanceof OmenOfSinistralExaltation && hasOmen(OmenOfDextralExaltation.class)) {
			// System.out.println("Cannot activate Sinistral while Dextral is active!");
			return;
		}

		activeOmens.add(omen);
	}

	// Get all active omens currently attached to this item.
	public List<Omen> getActiveOmens() {
		return activeOmens;
	}

	/**
	 * Remove omens that have been consumed.
	 */
	public void clearConsumedOmens() {
		activeOmens.removeIf(Omen::isConsumed);
		// System.out.println(activeOmens);
	}

	// Apply a crafting action to this item.
	// If omens are active, they modify the behavior of the action.
	public Crafting_Item applyOmens(Crafting_Item item, Crafting_Action action) {
		List<Omen> omens = item.getActiveOmens();
		omens.sort((o1, o2) -> Integer.compare(o2.getPriority(), o1.getPriority()));

		if (!omens.isEmpty()) {
			for (Omen omen : omens) {
				// System.out.println("Applying : " + omen);
				item = omen.applyEffect(item, action);
			}
			for (Omen omen : omens) {
				omen.consumed = true;
			}
			item.clearConsumedOmens(); // remove used omens
		}
		return item;
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

	public List<Modifier> homogeniseModifiers(List<Modifier> allowedModifiers, Modifier[] currentPrefixModifiers, Modifier[] currentSuffixModifiers) {
		Set<String> existingTags = new HashSet<>();
		List<Modifier> finalModifiers = new ArrayList<>();

		// 🔹 Gather tags from current prefixes
		for (Modifier m : currentPrefixModifiers) {
			if (m != null && m.tags != null)
				existingTags.addAll(m.tags);
		}

		// 🔹 Gather tags from current suffixes
		for (Modifier m : currentSuffixModifiers) {
			if (m != null && m.tags != null)
				existingTags.addAll(m.tags);
		}

		// If no tags corresponds, return null
		if (existingTags.isEmpty()){
			// System.out.println("⚠ No existing tags on item — homogenising skipped.");
			finalModifiers.addAll(allowedModifiers);
			return finalModifiers;
		}

		// System.out.println("existingTags" + existingTags);

		// Retrieving the modifiers with the same tags
		for (Modifier mod : allowedModifiers) {
			if (mod != null && mod.tags != null &&
				mod.tags.stream().anyMatch(existingTags::contains)) {
				finalModifiers.add(mod);
				// System.out.println("✅ Corresponding mod found: " + mod.text);
				// System.out.println("With tags" + mod.tags);
			}
		}

		
		// Remove a modifier in final modifiers if it has the same family has another
		for (Modifier current : currentPrefixModifiers) {
			if (current == null) continue;
			finalModifiers.removeIf(mod -> mod.family != null && mod.family.equals(current.family));
		}
		
		// Remove modifiers from finalModifiers that have the same family as any current suffix
		for (Modifier current : currentSuffixModifiers) {
			if (current == null) continue;
			finalModifiers.removeIf(mod -> mod.family != null && mod.family.equals(current.family));
		}
		
		if (finalModifiers.isEmpty()) {
			// System.out.println("⚠ No matching modifiers found — using all allowed ones.");
			return null;
		}

		return finalModifiers;
	}
}
