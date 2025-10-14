package core.Utils;

import core.Crafting.Crafting_Item;
import core.Items.Item_base;
import core.Modifier_class.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class AddRandomMod {

    public static ModifierTierWrapper selectWeightedModifier(Crafting_Item item, List<Modifier> allowedPrefixes, List<Modifier> allowedSuffixes) {
        Item_base base = item.base;
        List<Modifier> possibleMods = new ArrayList<>();

        // Collect allowed prefixes not already present
        if (!item.isPrefixFull() && allowedPrefixes != null) {
            for (Modifier m : allowedPrefixes) {
                boolean alreadyHas = false;
                for (Modifier existing : item.currentPrefixes) {
                    if (existing != null && existing.text.equals(m.text)) {
                        alreadyHas = true;
                        break;
                    }
                }
                if (!alreadyHas) possibleMods.add(m);
            }
        }

        // Collect allowed suffixes not already present
        if (!item.isSuffixFull() && allowedSuffixes != null) {
            for (Modifier m : allowedSuffixes) {
                boolean alreadyHas = false;
                for (Modifier existing : item.currentSuffixes) {
                    if (existing != null && existing.text.equals(m.text)) {
                        alreadyHas = true;
                        break;
                    }
                }
                if (!alreadyHas) possibleMods.add(m);
            }
        }

        if (possibleMods.isEmpty()) return null;

        // Flatten all tiers into weighted list
        List<WeightedItem<ModifierTierWrapper>> weightedTiers = new ArrayList<>();
        for (Modifier mod : possibleMods) {
            if (mod.tiers == null) continue;
            for (ModifierTier tier : mod.tiers) {
                weightedTiers.add(new WeightedItem<>(new ModifierTierWrapper(mod, tier), tier.weight));
            }
        }

        if (weightedTiers.isEmpty()) return null;

        // Weighted RNG selection
        int totalWeight = weightedTiers.stream().mapToInt(WeightedItem::getWeight).sum();
        Random rng = new Random();
        int r = rng.nextInt(totalWeight);
        int sum = 0;
        for (WeightedItem<ModifierTierWrapper> wi : weightedTiers) {
            sum += wi.getWeight();
            if (r < sum) return wi.getItem();
        }

        return null;
    }
}
