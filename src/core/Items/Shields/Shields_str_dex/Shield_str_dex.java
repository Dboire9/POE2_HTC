package core.Items.Shields.Shields_str_dex;


import java.util.ArrayList;

import core.Item_modifiers.Off_Hand_Item_modifiers.Shields_Item_modifiers.Shields_Hybrid_Item_modifiers.*;


public class Shield_str_dex extends Shield_str_dex_Item {

    public Shield_str_dex() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_BASE_ARMOUR_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ARMOUR_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_STUN);
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_THORNS_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SHIELD_BLOCK_CHANCE);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.STRENGTH);
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.BASE_STUN_THRESHOLD);
        Normal_allowedSuffixes.add(Modifiers_normal.PHYSICAL_DAMAGE_REDUCTION);
        Normal_allowedSuffixes.add(Modifiers_normal.MAXIMUM_FIRE_RESIST);
        Normal_allowedSuffixes.add(Modifiers_normal.MAXIMUM_COLD_RESIST);
        Normal_allowedSuffixes.add(Modifiers_normal.MAXIMUM_LIGHTNING_RESIST);
        Normal_allowedSuffixes.add(Modifiers_normal.MAXIMUM_CHAOS_RESIST);
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_MAXIMUM_RESISTANCES);
        Normal_allowedSuffixes.add(Modifiers_normal.ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE);

        Desecrated_allowedPrefixes = new ArrayList<>();
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SHIELD_SKILLS_STUNNING_BREAKS_ARMOUR);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HEAVY_STUN_DECAY_RATE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ALL_MAXIMUM_RESISTANCES);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_RECOUPED_AS_MANA);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_GAIN_MANA_ON_BLOCK);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_PHYSICAL_DAMAGE_TAKEN_AS_LIGHTNING_WHILE_ACTIVE_BLOCKING);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MAXIMUM_BLOCK_CHANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_PARRIED_DEBUFF_DURATION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_PARRIED_DEBUFF_MAGNITUDE);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ARMOUR);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_EVASION);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_SHIELD_BLOCK_PERCENTAGE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
    }
}