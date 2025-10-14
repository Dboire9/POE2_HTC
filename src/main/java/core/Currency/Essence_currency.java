package core.Currency;


import core.Crafting.Crafting_Item;
import core.Items.*;
import core.Modifier_class.*;
import java.util.List;
import java.util.Map;

public abstract class Essence_currency {
    protected final String guaranteedModifier;
    protected final EssenceTier tier;

	public abstract String getName();

	public enum EssenceTier {
		LESSER,
		NORMAL,
		GREATER,
		PERFECT; // optional if you plan to support perfect essences later
	
		public int getIndex() {
			return switch (this) {
				case LESSER -> 0;
				case NORMAL -> 1;
				case GREATER -> 2;
				case PERFECT -> 3;
			};
		}
	}

    public Essence_currency(String guaranteedModifier, EssenceTier tier) {
        this.guaranteedModifier = guaranteedModifier;
        this.tier = tier;
    }

	public void applyTo(Crafting_Item item) {

		if (tier == EssenceTier.PERFECT && item.rarity != Crafting_Item.ItemRarity.RARE) {
			System.out.println("Perfect essence can only be applied to Rare items.");
			return;
		} else if ((tier == EssenceTier.LESSER || tier == EssenceTier.NORMAL || tier == EssenceTier.GREATER)
				&& item.rarity != Crafting_Item.ItemRarity.MAGIC) {
			System.out.println(tier + " essence can only be applied to Magic items.");
			return;
		}
	
		// Step 1: decide which list to check (prefix or suffix)
		List<Modifier> possiblePrefixModifiers = item.base.getEssencesAllowedPrefixes();
		List<Modifier> possibleSuffixModifiers = item.base.getEssencesAllowedSuffixes();
	
		// Step 2: find the modifier matching the essence
		Modifier targetModifier = null;
		boolean isPrefix = false;
	
		for (Modifier m : possiblePrefixModifiers) {
			if (m.text.equals(guaranteedModifier)) {
				targetModifier = m;
				isPrefix = true;
				break;
			}
		}
	
		if (targetModifier == null) {
			for (Modifier m : possibleSuffixModifiers) {
				if (m.text.equals(guaranteedModifier)) {
					targetModifier = m;
					isPrefix = false;
					break;
				}
			}
		}
	
		if (targetModifier == null) {
			System.out.println("No essence modifier found for: " + guaranteedModifier);
			return;
		}
	
		// Step 4: pick the correct tier from the target Modifier
		int index = Math.min(tier.getIndex(), targetModifier.tiers.size() - 1);
		ModifierTier chosenTier = targetModifier.tiers.get(index);
	
		// Step 5: apply deterministically
		item.addModifier(chosenTier, targetModifier, isPrefix);
		item.rarity = Crafting_Item.ItemRarity.RARE;
	
		System.out.println("Applied " + getName() + " (" + tier + ") to item: " + guaranteedModifier);
	}
	
}