package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ChaosOrb implements Crafting_Action {

    private double cost = 1.0;

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on RARE items
        if (item.rarity != Crafting_Item.ItemRarity.RARE) return item;

        List<Modifier> existingMods = new ArrayList<>();
        for (Modifier m : item.currentPrefixes) if (m != null) existingMods.add(m);
        for (Modifier m : item.currentSuffixes) if (m != null) existingMods.add(m);

        if (existingMods.isEmpty()) return item;

        // Pick one modifier randomly to reroll
        Random rng = new Random();
        Modifier toReroll = existingMods.get(rng.nextInt(existingMods.size()));

        boolean isPrefix = false;
        for (int i = 0; i < item.currentPrefixes.length; i++) {
            if (item.currentPrefixes[i] != null && item.currentPrefixes[i].equals(toReroll)) {
                isPrefix = true;
                item.currentPrefixes[i] = null;
                break;
            }
        }
        if (!isPrefix) {
            for (int i = 0; i < item.currentSuffixes.length; i++) {
                if (item.currentSuffixes[i] != null && item.currentSuffixes[i].equals(toReroll)) {
                    item.currentSuffixes[i] = null;
                    break;
                }
            }
        }

        // Select a new modifier for the same slot using the utility function
        ModifierTierWrapper chosen = AddRandomMod.selectWeightedModifier(
            item,
            isPrefix ? item.base.getNormalAllowedPrefixes() : null,
            isPrefix ? null : item.base.getNormalAllowedSuffixes()
        );

        if (chosen == null) return item;

        // Apply the new modifier and tier
        if (isPrefix) item.addPrefix(chosen.getModifier(), chosen.getTier());
        else item.addSuffix(chosen.getModifier(), chosen.getTier());

        return item;
    }

    @Override
    public double getCost() { return cost; }

    @Override
    public String getName() { return "Chaos Orb"; }
}
