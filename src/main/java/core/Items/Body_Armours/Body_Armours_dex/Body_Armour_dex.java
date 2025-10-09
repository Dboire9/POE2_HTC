package main.java.core.Items.Body_Armours.Body_Armours_dex;


import java.util.ArrayList;

import main.java.core.Item_modifiers.Body_Armours_Item_modifiers.Body_Armours_Normal_Item_modifiers.*;


public class Body_Armour_dex extends Body_Armour_dex_Item {

    public Body_Armour_dex() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_BASE_AND_PERCENT_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_THORNS_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_SPIRIT);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.BASE_STUN_THRESHOLD);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_REGENERATION_PER_SECOND);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_BLEEDING_DURATION_ON_SELF);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_POISON_DURATION_ON_SELF);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_IGNITE_DURATION_ON_SELF);
        Normal_allowedSuffixes.add(Modifiers_normal.EVASION_APPLIES_TO_DEFLECTION);

        Desecrated_allowedPrefixes = new ArrayList<>();
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SPIRIT_RESERVATION_EFFICIENCY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_RECOUPED_AS_MANA);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COMPANION_RESERVATION_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_PREVENT_DEFLECT_DAMAGE_TAKEN);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ARMOUR);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_EVASION);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_MAXIMUM_LIFE_INCREASE_PERCENT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_PHYSICAL_DAMAGE_TAKEN_AS_CHAOS);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_PHYSICAL_THORNS_DAMAGE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_RANDOM_NOTABLE_PASSIVE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
    }
}