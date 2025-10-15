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
		
				List<Modifier> currentModifiers = new ArrayList<>();
				for (Modifier m : item.currentPrefixes) if (m != null) currentModifiers.add(m);
				for (Modifier m : item.currentSuffixes) if (m != null) currentModifiers.add(m);
		
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
		
				item.addModifier(matchedTier, mod, modIsPrefix);
		
				System.out.println("Applied " + getName() + " (" + tier + ") as "
					+ (modIsPrefix ? "prefix" : "suffix") + " to item: " + item.base.getClass().getSimpleName());
		
				break; // stop after applying one matching essence
			}
		}
		
		else if ((tier == EssenceTier.PERFECT) && item.rarity == Crafting_Item.ItemRarity.RARE)
		{

		}

	}
}