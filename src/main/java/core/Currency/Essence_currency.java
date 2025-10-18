package core.Currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ModType; // Ensure this import is correct
import core.Currency.AugmentationOrb.CurrencyTier;
import core.Currency.Essences.Essences;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.function.Function;

public abstract class Essence_currency implements Crafting_Action {
	
	public enum EssenceTier {
		LESSER, NORMAL, GREATER, PERFECT
	}

	protected String essenceFamily; // e.g. "Body", "Mind", "Flames"
	protected EssenceTier tier;

	public Essence_currency(String essenceFamily, EssenceTier tier) {
		this.essenceFamily = essenceFamily;
		this.tier = tier;
	}

	// Default constructor
	public Essence_currency() {
		this.essenceFamily = "";
		this.tier = EssenceTier.LESSER;
	}

	public String getEssenceFamily() {
		return essenceFamily;
	}

	public EssenceTier getTier() {
		return tier;
	}

	public abstract String getName();

	private ModType forcedType = null;

	public void setForcedType(ModType type) {
		this.forcedType = type;
	}


	// For constructing the essences more easily
    private static final Map<String, Function<Essence_currency.EssenceTier, Essence_currency>> registry = new HashMap<>();

	    static {
        // Register all your essences here
        registry.put("Body", Essences.EssenceOfTheBody::new);
        registry.put("Mind", Essences.EssenceOfTheMind::new);
        registry.put("Enhancement", Essences.EssenceOfEnhancement::new);
        registry.put("Abrasion", Essences.EssenceOfAbrasion::new);
        registry.put("Flames", Essences.EssenceOfFlames::new);
        registry.put("Ice", Essences.EssenceOfIce::new);
        registry.put("Electricity", Essences.EssenceOfElectricity::new);
        registry.put("Ruin", Essences.EssenceOfRuin::new);
        registry.put("Battle", Essences.EssenceOfBattle::new);
        registry.put("Sorcery", Essences.EssenceOfSorcery::new);
        registry.put("Haste", Essences.EssenceOfHaste::new);
        registry.put("Infinite", Essences.EssenceOfInfinite::new);
        registry.put("Command", Essences.EssenceOfCommand::new);
        registry.put("Seeking", Essences.EssenceOfAlacrity::new);
        registry.put("Opulence", Essences.EssenceOfOpulence::new);
        registry.put("Grounding", Essences.EssenceOfGrounding::new);
        registry.put("Insulation", Essences.EssenceOfInsulation::new);
        registry.put("Thawing", Essences.EssenceOfThawing::new);
        // registry.put("Delirium", Essences.EssenceOfDelirium::new);
        // registry.put("Horror", Essences.EssenceOfHorror::new);
        // registry.put("Hysteria", Essences.EssenceOfHysteria::new);
        // registry.put("Sorcery", Essences.EssenceOfAbyss::new);
        // registry.put("Abyss", Essences.EssenceOfSorcery::new);

    }

	public static Essence_currency create(String essenceName, Essence_currency.EssenceTier tier) {
        Function<Essence_currency.EssenceTier, Essence_currency> constructor = registry.get(essenceName);
        if (constructor == null) {
            throw new IllegalArgumentException("Unknown essence type: " + essenceName);
        }
        return constructor.apply(tier);
    }

	
    public static Essence_currency.EssenceTier pickTierForItemLevel() {
		// If item level is always 81, we can ignore it
		Random RNG = new Random();
        int roll = RNG.nextInt(100); // 0–99

        if (roll < 10)
            return Essence_currency.EssenceTier.NORMAL;
        else if (roll < 40)
            return Essence_currency.EssenceTier.GREATER;
        else
            return Essence_currency.EssenceTier.PERFECT;
    }


	// Pick a random essence to apply for the algo

    public static String pickRandomEssenceType() {
        List<String> keys = new ArrayList<>(registry.keySet());
        return keys.get(new Random().nextInt(keys.size()));
    }


	@Override
	public Crafting_Item apply(Crafting_Item item) {
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
				&& item.rarity == Crafting_Item.ItemRarity.MAGIC) {
			for (Modifier mod : allModifiers) {
				// Retrieving all the modifiers currently on the item
				List<Modifier> currentModifiers = new ArrayList<>();
				for (Modifier m : item.currentPrefixes)
					if (m != null)
						currentModifiers.add(m);
				for (Modifier m : item.currentSuffixes)
					if (m != null)
						currentModifiers.add(m);

				// Checking if the Type is Prefix or Suffix
				boolean modIsPrefix = item.base.getEssencesAllowedPrefixes().contains(mod);

				// Check if modifier is already applied by family
				boolean alreadyApplied = currentModifiers.stream()
						.anyMatch(m -> m.family.equalsIgnoreCase(mod.family));
				if (alreadyApplied) {
					System.out.println(getName() + " (" + tier + ") is already applied to this item.");
					return item;
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
			Modifier[] targetSlots = null;
			System.out.println("Forced type already here : " + forcedType);

			// Retrieving the perfect essence
			Modifier targetMod = allModifiers.stream()
					.filter(mod -> mod.source == ModifierSource.PERFECT_ESSENCE)
					.filter(mod -> mod.tiers.stream().anyMatch(tier -> tier.name.equalsIgnoreCase(this.getName())))
					.findFirst()
					.orElse(null);

			if (targetMod == null) {
				System.out.println(
						"⚠ No applicable Perfect Essence found for item: " + item.base.getClass().getSimpleName());
				return item;
			}
			boolean modIsPrefix;
			int filledCount = 0;
			// Checking which affix is the essence and then checking if there is room to put
			// it there, if not we remove a modifier from the affix of the essence, else it
			// is random
			if (targetMod.type == ModifierType.PREFIX) {
				modIsPrefix = true;
				targetSlots = item.currentPrefixes;
				for (Modifier m : targetSlots) {
					if (m != null)
						filledCount++;
				}
			} else {
				modIsPrefix = false;
				targetSlots = item.currentSuffixes;
				for (Modifier m : targetSlots) {
					if (m != null)
						filledCount++;
				}
			}

			// Checking if there is a forced_type already applied (If an omen is active)
			if (forcedType == null) {
				if (filledCount == 3) {
					if (targetMod.type == ModifierType.PREFIX)
						forcedType = ModType.PREFIX_ONLY;
					else if (targetMod.type == ModifierType.SUFFIX)
						forcedType = ModType.SUFFIX_ONLY;
				} else
					forcedType = ModType.ANY;
			}
			// We check if the filled count is 3, if it is the case the omen is useless
			// because we know which affix it would remote, and if it was the other one it
			// would have not worked
			else {
				if (filledCount == 3) {
					System.out.println(
							"Omen either removing deterministically a modifier or the omen is not removing the affix to let space to the mod");
					return item;
				}
			}

			// Remove a mod with a forcedtype to remove (or not)
			item.removeRandomModifier(forcedType);

			// Apply the perfect essence in the first null slots of its affix
			for (int i = 0; i < targetSlots.length; i++) {
				if (targetSlots[i] == null) {
					targetSlots[i] = targetMod;
					if (modIsPrefix)
						item.currentPrefixTiers[i] = targetMod.tiers.get(0);
					else
						item.currentSuffixTiers[i] = targetMod.tiers.get(0);

					System.out.println("Applied Perfect Essence: " + targetMod.family + " ("
							+ targetMod.tiers.get(0).name + ") as "
							+ (modIsPrefix ? "prefix" : "suffix") + " to item: "
							+ item.base.getClass().getSimpleName());
					break;
				}
			}
			forcedType = null;
		}
		return item;
	}
}