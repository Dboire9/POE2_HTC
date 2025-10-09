package core.Items.Helmets.Helmets_str;


import java.util.ArrayList;

import core.Item_modifiers.Helmets_Item_modifiers.Helmets_Normal_Item_modifiers.*;


public class Helmet_str extends Helmet_str_Item {

    public Helmet_str() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_ARMOUR);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ARMOUR);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ARMOUR_AND_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE_PREFIX);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.STRENGTH);
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_MINION_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_REGENERATION_PER_SECOND);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_HIT_CHANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE);
        Normal_allowedSuffixes.add(Modifiers_normal.HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS);
        Normal_allowedSuffixes.add(Modifiers_normal.ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE);

        Desecrated_allowedPrefixes = new ArrayList<>();
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_GLORY_GENERATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_PRESENCE_RADIUS);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPIRIT_RESERVATION_EFFICIENCY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ELEMENTAL_DAMAGE_TAKEN_RECOUPED_AS_ENERGY_SHIELD);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIFE_COST_EFFICIENCY);


        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_MANA);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ARMOUR);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_EVASION);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LEVEL_MINION_SKILL);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ITEM_FOUND_RARITY_INCREASE);
    }
}