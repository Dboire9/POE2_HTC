package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Modifier_class.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class AnnulmentOrb implements Crafting_Action {

    private double cost = 1.0;

    @Override
    public Crafting_Item apply(Crafting_Item item) {
        // Only works on MAGIC or RARE items
        if (item.rarity == Crafting_Item.ItemRarity.NORMAL) return item;

        List<Modifier> existingMods = new ArrayList<>();
        for (Modifier m : item.currentPrefixes) if (m != null) existingMods.add(m);
        for (Modifier m : item.currentSuffixes) if (m != null) existingMods.add(m);

        if (existingMods.isEmpty()) return item;

        // Pick one modifier randomly to remove
        Random rng = new Random();
        Modifier toRemove = existingMods.get(rng.nextInt(existingMods.size()));

        // Remove from prefixes
        for (int i = 0; i < item.currentPrefixes.length; i++) {
            if (item.currentPrefixes[i] != null && item.currentPrefixes[i].equals(toRemove)) {
                item.currentPrefixes[i] = null;
                item.currentPrefixTiers[i] = null;
                return item;
            }
        }

        // Remove from suffixes
        for (int i = 0; i < item.currentSuffixes.length; i++) {
            if (item.currentSuffixes[i] != null && item.currentSuffixes[i].equals(toRemove)) {
                item.currentSuffixes[i] = null;
                item.currentSuffixTiers[i] = null;
                return item;
            }
        }

        return item;
    }

    @Override
    public double getCost() { return cost; }

    @Override
    public String getName() { return "Orb of Annulment"; }
}
