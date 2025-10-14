package core.Crafting;

import java.util.Arrays;

import core.Items.Item_base;
import core.Modifier_class.*;

public class Crafting_Item {

    public Item_base base;
    public ItemRarity rarity;

    public enum ItemRarity {
        NORMAL, MAGIC, RARE
    }

    // Current modifiers
    public Modifier[] currentPrefixes = new Modifier[3];
    public Modifier[] currentSuffixes = new Modifier[3];


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
                mod.tiers = Arrays.asList(tier);
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
                mod.tiers = Arrays.asList(tier);
                return;
            }
        }
        System.out.println("No suffix slot available!");
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
