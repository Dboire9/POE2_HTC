package core.Items;

import core.Modifier_class.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Crafting_Item {

    public ItemRarity rarity = ItemRarity.NORMAL;

    public enum ItemRarity {
        NORMAL, MAGIC, RARE, UNIQUE
    }

    // Current modifiers on the item
    public Modifier[] currentPrefixes = new Modifier[3];
    public Modifier[] currentSuffixes = new Modifier[3];

    public String getItemClass() {
        return this.getClass().getSimpleName();
    }

    public boolean isNormal() { return rarity == ItemRarity.NORMAL; }
    public boolean isMagic() { return rarity == ItemRarity.MAGIC; }
    public boolean isRare() { return rarity == ItemRarity.RARE; }
    public boolean isUnique() { return rarity == ItemRarity.UNIQUE; }

    public void addRandomModifier(List<Modifier> availablePrefixes, List<Modifier> availableSuffixes) {
        // Determine the number of free prefix/suffix slots
        int freePrefixes = 0;
        int freeSuffixes = 0;

        for (Modifier m : currentPrefixes) if (m == null) freePrefixes++;
        for (Modifier m : currentSuffixes) if (m == null) freeSuffixes++;

        if (freePrefixes == 0 && freeSuffixes == 0) {
            System.out.println("No free slots for modifiers!");
            return;
        }

        // Build weighted pool of (modifier, tier) pairs
        class WeightedEntry {
            Modifier modifier;
            ModifierTier tier;
            WeightedEntry(Modifier m, ModifierTier t) { modifier = m; tier = t; }
        }

        List<WeightedEntry> pool = new ArrayList<>();

        if (freePrefixes > 0) {
            for (Modifier mod : availablePrefixes) {
                for (ModifierTier tier : mod.tiers) {
                    pool.add(new WeightedEntry(mod, tier));
                }
            }
        }

        if (freeSuffixes > 0) {
            for (Modifier mod : availableSuffixes) {
                for (ModifierTier tier : mod.tiers) {
                    pool.add(new WeightedEntry(mod, tier));
                }
            }
        }

        if (pool.isEmpty()) return;

        // Compute total weight
        int totalWeight = 0;
        for (WeightedEntry entry : pool) totalWeight += entry.tier.weight;

        // Pick one based on weighted random
        Random rand = new Random();
        int r = rand.nextInt(totalWeight);
        WeightedEntry chosen = null;
        for (WeightedEntry entry : pool) {
            r -= entry.tier.weight;
            if (r < 0) {
                chosen = entry;
                break;
            }
        }

        if (chosen == null) return;

        // Add the chosen modifier to the correct slot
        if (availablePrefixes.contains(chosen.modifier)) {
            for (int i = 0; i < currentPrefixes.length; i++) {
                if (currentPrefixes[i] == null) {
                    currentPrefixes[i] = chosen.modifier;
                    System.out.println("Added PREFIX " + chosen.modifier.text + " Tier: " + chosen.tier.name);
                    break;
                }
            }
        } else {
            for (int i = 0; i < currentSuffixes.length; i++) {
                if (currentSuffixes[i] == null) {
                    currentSuffixes[i] = chosen.modifier;
                    System.out.println("Added SUFFIX " + chosen.modifier.text + " Tier: " + chosen.tier.name);
                    break;
                }
            }
        }
    }
}
