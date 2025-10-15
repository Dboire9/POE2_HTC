package core.Currency;

import core.Crafting.Crafting_Item;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Currency.Essence_currency.*;

import java.util.ArrayList;
import java.util.List;

public abstract class Essence_currency {
    public enum EssenceTier { LESSER, NORMAL, GREATER, PERFECT }

    protected String essenceFamily;  // e.g. "Body", "Mind", "Flames"
    protected EssenceTier tier;

    public Essence_currency(String essenceFamily, EssenceTier tier) {
        this.essenceFamily = essenceFamily;
        this.tier = tier;
    }

    public String getEssenceFamily() {
        return essenceFamily;
    }

    public EssenceTier getTier() {
        return tier;
    }

    public abstract String getName();

    public void applyTo(Crafting_Item item) {
		List<Modifier> allModifiers = new ArrayList<>();
        allModifiers.addAll(item.base.getEssencesAllowedPrefixes());
        allModifiers.addAll(item.base.getEssencesAllowedSuffixes());

		int tierIndex = switch (tier) {
			case LESSER -> 0;
			case NORMAL -> 1;
			case GREATER -> 2;
			case PERFECT -> 3; // handle Perfect separately later
		};
		

		// Handling lesser, normal and greater essences
		if ((tier == EssenceTier.LESSER || tier == EssenceTier.NORMAL || tier == EssenceTier.GREATER)
		&& item.rarity == Crafting_Item.ItemRarity.MAGIC) 
		{
			for (Modifier mod : allModifiers) {
				// Retrieving all the modifiers currently on the item
				List<Modifier> currentModifiers = new ArrayList<>();
				for (Modifier m : item.currentPrefixes) if (m != null) currentModifiers.add(m);
				for (Modifier m : item.currentSuffixes) if (m != null) currentModifiers.add(m);
		
				// Checking if the Type is Prefix or Suffix
				boolean modIsPrefix = item.base.getEssencesAllowedPrefixes().contains(mod);
		
				// Check if modifier is already applied by family
				boolean alreadyApplied = currentModifiers.stream()
					.anyMatch(m -> m.family.equalsIgnoreCase(mod.family));
				if (alreadyApplied) {
					System.out.println(getName() + " (" + tier + ") is already applied to this item.");
					return;
				}
		
				// Safely get the tier
				ModifierTier matchedTier = null;
				if (tierIndex < mod.tiers.size()) {
					matchedTier = mod.tiers.get(tierIndex);
				} else {
					System.out.println("⚠ Modifier " + mod.text + " does not have tier " + tierIndex);
					continue;
				}
				
				// Add the essence modifier and its tier
				item.addModifier(matchedTier, mod, modIsPrefix);
				// Changing the item rarity to rare after applying the Modifier
				item.rarity = Crafting_Item.ItemRarity.RARE;
		
				System.out.println("Applied " + getName() + " (" + tier + ") as "
					+ (modIsPrefix ? "prefix" : "suffix") + " to item: " + item.base.getClass().getSimpleName());
		
				break; // stop after applying one matching essence
			}
		}

		// Handle perfect essences
		else if ((tier == EssenceTier.PERFECT) && item.rarity == Crafting_Item.ItemRarity.RARE) {
			ModifierTier chosenTier = null;
			List<Modifier> currentModifiers = new ArrayList<>();
			boolean modIsPrefix = false;
			Modifier targetMod = null;
		
			// Retrieving the modifier from the item class
			for (Modifier mod : allModifiers) {
				// Only consider PERFECT_ESSENCE modifiers
				if (mod.source != ModifierSource.PERFECT_ESSENCE) continue;
		
				// Collect currently applied modifiers
				currentModifiers.clear();
				for (Modifier m : item.currentPrefixes) if (m != null) currentModifiers.add(m);
				for (Modifier m : item.currentSuffixes) if (m != null) currentModifiers.add(m);
		
				// Skip if this family is already applied
				boolean alreadyApplied = currentModifiers.stream()
					.anyMatch(m -> m.family.equalsIgnoreCase(mod.family));
				if (alreadyApplied) continue;
		
				// Perfect essence only have one modifier tier
				chosenTier = mod.tiers.get(0);
				if (chosenTier == null) {
					System.out.println("⚠ Could not find Perfect Essence tier for family: " + mod.family);
					continue;
				}
		
				// Checking whether the perfect essence is a prefix or a suffix
				modIsPrefix = item.base.getEssencesAllowedPrefixes().contains(mod);
				targetMod = mod;
				break; // stop after finding the first applicable Perfect Essence
			}
		
			if (targetMod == null || chosenTier == null) {
				System.out.println("⚠ No applicable Perfect Essence found for item: " + item.base.getClass().getSimpleName());
				return;
			}
		
			Modifier[] targetSlots = modIsPrefix ? item.currentPrefixes : item.currentSuffixes;
		
			// Replace the modifier by the one of the item
			List<Integer> sameFamilyIndexes = new ArrayList<>();
			for (int i = 0; i < targetSlots.length; i++) {
				if (targetSlots[i] != null  && targetSlots[i].family.equalsIgnoreCase(targetMod.family)) {
					sameFamilyIndexes.add(i);
				}
			}
		

			int removeIndex;
			// Checking if we already have the modifier
			if (!sameFamilyIndexes.isEmpty()) {
				System.out.println("The Item has already a mod of this type");
				return;
			} else {
				List<Integer> allFilledIndexes = new ArrayList<>();
				for (int i = 0; i < item.currentPrefixes.length; i++) if (item.currentPrefixes[i] != null) allFilledIndexes.add(i);
				for (int i = 0; i < item.currentSuffixes.length; i++) if (item.currentSuffixes[i] != null) allFilledIndexes.add(i + item.currentPrefixes.length);
				removeIndex = allFilledIndexes.get((int) (Math.random() * allFilledIndexes.size()));
				if (removeIndex >= item.currentPrefixes.length) removeIndex -= item.currentPrefixes.length;
			}
		
			// Determine which array and actual index
			Modifier removedMod;
			if (!sameFamilyIndexes.isEmpty()) {
				removeIndex = sameFamilyIndexes.get((int) (Math.random() * sameFamilyIndexes.size()));
				removedMod = targetSlots[removeIndex];
			} else {
				// All filled slots across prefixes and suffixes
				List<Integer> allFilledIndexes = new ArrayList<>();
				for (int i = 0; i < item.currentPrefixes.length; i++) if (item.currentPrefixes[i] != null) allFilledIndexes.add(i);
				for (int i = 0; i < item.currentSuffixes.length; i++) if (item.currentSuffixes[i] != null) allFilledIndexes.add(i + item.currentPrefixes.length);

				int globalIndex = allFilledIndexes.get((int) (Math.random() * allFilledIndexes.size()));

				if (globalIndex < item.currentPrefixes.length) {
					removeIndex = globalIndex;
					removedMod = item.currentPrefixes[removeIndex];
					modIsPrefix = true;
				} else {
					removeIndex = globalIndex - item.currentPrefixes.length;
					removedMod = item.currentSuffixes[removeIndex];
					modIsPrefix = false;
				}

				targetSlots = modIsPrefix ? item.currentPrefixes : item.currentSuffixes;
			}

			// Decide which modifier to remove
			if (!sameFamilyIndexes.isEmpty()) {
				// Remove a modifier of the same family in the correct slot if the modifier type slots are full 
				removeIndex = sameFamilyIndexes.get((int) (Math.random() * sameFamilyIndexes.size()));
				removedMod = targetSlots[removeIndex];
				System.out.println("Removing modifier: " + removedMod.family + " (" + removedMod.text + ") from "
					+ (modIsPrefix ? "prefix" : "suffix") + " slot " + removeIndex);
			} else {
				// Remove a random modifier across all slots if there is open modifiers slots in the type of the modifier
				List<Integer> allFilledIndexes = new ArrayList<>();
				for (int i = 0; i < item.currentPrefixes.length; i++) if (item.currentPrefixes[i] != null) allFilledIndexes.add(i);
				for (int i = 0; i < item.currentSuffixes.length; i++) if (item.currentSuffixes[i] != null) allFilledIndexes.add(i + item.currentPrefixes.length);

				int globalIndex = allFilledIndexes.get((int) (Math.random() * allFilledIndexes.size()));

				if (globalIndex < item.currentPrefixes.length) {
					removeIndex = globalIndex;
					removedMod = item.currentPrefixes[removeIndex];
					modIsPrefix = true;
				} else {
					removeIndex = globalIndex - item.currentPrefixes.length;
					removedMod = item.currentSuffixes[removeIndex];
					modIsPrefix = false;
				}

				targetSlots = modIsPrefix ? item.currentPrefixes : item.currentSuffixes;

				System.out.println("Removing modifier: " + removedMod.family + " (" + removedMod.text + ") from "
					+ (modIsPrefix ? "prefix" : "suffix") + " slot " + removeIndex);
			}
			modIsPrefix = item.base.getEssencesAllowedPrefixes().contains(targetMod);
			// Remove the selected modifier
			targetSlots[removeIndex] = null;
			if (modIsPrefix) item.currentPrefixTiers[removeIndex] = null;
			else item.currentSuffixTiers[removeIndex] = null;
			System.out.println("\nRemoved a modifier to make space for Perfect Essence.");

			// Set the target slots according to the essence type to put it in the right slots the modifier has its type
			targetSlots = null;
			targetSlots = modIsPrefix ? item.currentPrefixes : item.currentSuffixes;

			// Apply Perfect Essence in first empty slot of correct type
			for (int i = 0; i < targetSlots.length; i++) {
				if (targetSlots[i] == null) {
					targetSlots[i] = targetMod;
					if (modIsPrefix) item.currentPrefixTiers[i] = chosenTier;
					else item.currentSuffixTiers[i] = chosenTier;

					System.out.println("Applied Perfect Essence: " + targetMod.family + " (" + chosenTier.name + ") as "
						+ (modIsPrefix ? "prefix" : "suffix") + " to item: " + item.base.getClass().getSimpleName());
					break;
				}
			}
		}
	}
}