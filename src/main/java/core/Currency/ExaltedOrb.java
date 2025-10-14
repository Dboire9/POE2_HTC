package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.WeightedItem;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ExaltedOrb implements Crafting_Action {

    private double cost = 1.0;

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // No free slot? Return item unchanged
        if (item.isFull()) return item;

        Item_base base = item.base;
        List<Modifier> possibleMods = new ArrayList<>();

		// Collect allowed prefixes not already present
		if (!item.isPrefixFull() && base.getNormalAllowedPrefixes() != null) {
			for (Modifier m : base.getNormalAllowedPrefixes()) {
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
		if (!item.isSuffixFull() && base.getNormalAllowedSuffixes() != null) {
			for (Modifier m : base.getNormalAllowedSuffixes()) {
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

        if (possibleMods.isEmpty()) return item;

        // ✅ Flatten all tiers into weighted list
        List<WeightedItem<ModifierTierWrapper>> weightedTiers = new ArrayList<>();
        for (Modifier mod : possibleMods) {
            if (mod.tiers == null) continue;
            for (ModifierTier tier : mod.tiers) {
                weightedTiers.add(new WeightedItem<>(new ModifierTierWrapper(mod, tier), tier.weight));
            }
        }

        if (weightedTiers.isEmpty()) return item; // no valid tier data

        // ✅ Weighted RNG selection
        int totalWeight = weightedTiers.stream().mapToInt(WeightedItem::getWeight).sum();
        Random rng = new Random();
        int r = rng.nextInt(totalWeight);
        ModifierTierWrapper chosen = null;
        int sum = 0;
        for (WeightedItem<ModifierTierWrapper> wi : weightedTiers) {
            sum += wi.getWeight();
            if (r < sum) {
                chosen = wi.getItem();
                break;
            }
        }

        if (chosen == null) return item; // safety check

        // ✅ Add chosen modifier and tier to the item
        Modifier mod = chosen.getModifier();
        ModifierTier tier = chosen.getTier();

        if (base.getNormalAllowedPrefixes().contains(mod)) {
            item.addPrefix(mod, tier);
        } else {
            item.addSuffix(mod, tier);
        }

        return item;
    }

    @Override
    public double getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Exalted Orb";
    }
}
