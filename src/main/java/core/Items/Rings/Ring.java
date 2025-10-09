package core.Items.Rings;


import java.util.ArrayList;

import core.Item_modifiers.Jewellery_Item_modifiers.Rings_Item_modifiers.*;


public class Ring extends Ring_Item {

    public Ring() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.FIRE_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.COLD_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.LIGHTNING_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE_PREFIX);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_FIRE_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_COLD_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_LIGHTNING_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_CHAOS_DAMAGE);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.STRENGTH);
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_ATTRIBUTES);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_RESISTANCES);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_REGENERATION_PER_SECOND);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_REGENERATION_RATE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CAST_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE);
        Normal_allowedSuffixes.add(Modifiers_normal.HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS);

        Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REMNANT_EFFECT);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_IGNITE_MAGNITUDE_IF_ENDURANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_FREEZE_BUILDUP_IF_POWER);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SHOCK_MAGNITUDE_IF_FRENZY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_ATTACK_DAMAGE_LOW_LIFE);
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SKILL_EFFECT_DURATION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_REMNANT_PICKUP_RADIUS);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIFE_LEECH_AMOUNT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COOLDOWN_RECOVERY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_EXPOSURE_EFFECT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_LEECH_AMOUNT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SKILL_SPEED);


        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_MANA);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_MAXIMUM_MANA_INCREASE_PERCENT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_MANA_REGENERATION);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ITEM_FOUND_RARITY_INCREASE);

    }
}