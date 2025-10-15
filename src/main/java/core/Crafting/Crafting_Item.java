package core.Crafting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import core.Currency.Essence_currency;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;


public class Crafting_Item {

    public Item_base base;
    public ItemRarity rarity;
	public boolean desecrated = false;

    public enum ItemRarity {
        NORMAL, MAGIC, RARE
    }

    // Current modifiers
    public Modifier[] currentPrefixes = new Modifier[3];
    public Modifier[] currentSuffixes = new Modifier[3];

    // Store the applied tier for each modifier
    public ModifierTier[] currentPrefixTiers = new ModifierTier[3];
    public ModifierTier[] currentSuffixTiers = new ModifierTier[3];

    // Constructor
    public Crafting_Item(Item_base base) {
        this.base = base;
        this.rarity = ItemRarity.NORMAL;
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
        System.out.println("No prefix slot available!");
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
        System.out.println("No suffix slot available!");
    }

	// Remove a random modifier (prefix or suffix) from the item
	public Crafting_Item removeRandomModifier() {
		List<Modifier> existingMods = new ArrayList<>();
		for (Modifier m : currentPrefixes) if (m != null) existingMods.add(m);
		for (Modifier m : currentSuffixes) if (m != null) existingMods.add(m);

		if (existingMods.isEmpty()) return this;

		// Pick one modifier randomly to remove
		Random rng = new Random();
		Modifier toRemove = existingMods.get(rng.nextInt(existingMods.size()));

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

	public boolean supportsPerfectEssence(Essence_currency essence) {
		List<Modifier> allMods = new ArrayList<>();
		allMods.addAll(this.base.getEssencesAllowedPrefixes());
		allMods.addAll(this.base.getEssencesAllowedSuffixes());
	
		String family = essence.getEssenceFamily().toLowerCase();
	
		System.out.println("\n🔍 Checking if " + base.getClass().getSimpleName()
			+ " supports any Essence of the " + family);
	
		boolean foundNormalEssence = false;
		boolean foundPerfectEssence = false;
	
		for (Modifier mod : allMods) {
			System.out.println("  → Modifier: " + mod.text 
				+ " | Source: " + mod.source 
				+ " | Tiers: " + mod.tiers.stream().map(t -> t.name).toList());
	
			boolean matchesFamily = mod.tiers.stream()
				.anyMatch(t -> t.name.toLowerCase().contains("essence of the " + family));
	
			if (matchesFamily) {
				if (mod.source == ModifierSource.PERFECT_ESSENCE) {
					foundPerfectEssence = true;
					System.out.println("✅ Found perfect essence support: " + mod.text);
				} else {
					foundNormalEssence = true;
					System.out.println("ℹ Found normal essence support: " + mod.text);
				}
			}
		}
	
		// ✅ Improved final summary
		if (foundPerfectEssence) {
			System.out.println("✅ Item supports the Perfect Essence of the " + family);
		} else if (foundNormalEssence) {
			System.out.println("⚠ Item supports normal essences of the " + family + ", but not the Perfect one");
		} else {
			System.out.println("❌ No essence modifiers found for: " + family);
		}
	
		return foundPerfectEssence;
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

    // Debug
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(base.getClass().getSimpleName())
          .append(" [").append(rarity).append("]\nPrefixes:\n");

        for (int i = 0; i < currentPrefixes.length; i++) {
            if (currentPrefixes[i] != null) {
                sb.append(" - ").append(currentPrefixes[i].text);
                sb.append("\n");
            }
        }

        sb.append("Suffixes:\n");
        for (int i = 0; i < currentSuffixes.length; i++) {
            if (currentSuffixes[i] != null) {
                sb.append(" - ").append(currentSuffixes[i].text);
                sb.append("\n");
            }
        }

        return sb.toString();
    }
}
