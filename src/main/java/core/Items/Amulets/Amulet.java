package core.Items.Amulets;


import java.util.ArrayList;

import core.Item_modifiers.Jewellery_Item_modifiers.Amulets_Item_modifiers.*;


public class Amulet extends Amulet_Item {

    public Amulet() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ARMOUR);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_EVASION);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE_PREFIX);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_SPIRIT);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_DAMAGE);
        
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
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_SPELL_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_MINION_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_MELEE_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_PROJECTILE_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_REGENERATION_PER_SECOND);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_REGENERATION_RATE);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CAST_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_HIT_CHANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS);
        Normal_allowedSuffixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE);
        Normal_allowedSuffixes.add(Modifiers_normal.DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Normal_allowedSuffixes.add(Modifiers_normal.DAMAGE_TAKEN_RECOUPED_AS_MANA);

        Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_GLOBAL_DEFENCES);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REMNANT_EFFECT);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_BODY_ARMOUR_FROM_BODY_ARMOUR);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INVOCATED_SPELL_HALF_ENERGY_CHANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_MAXIMUM_ENERGY_SHIELD_FROM_BODY_ARMOUR);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_GLORY_CHANCE_TO_NOT_CONSUME);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_EVASION_RATING_FROM_BODY_ARMOUR);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_ATTACK_DAMAGE_LOW_LIFE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_DEFLECTION_RATING);
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SKILL_EFFECT_DURATION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_REMNANT_PICKUP_RADIUS);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_AURA_MAGNITUDES);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_GLOBAL_ITEM_ATTRIBUTE_REQUIREMENTS);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_EXPOSURE_EFFECT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COOLDOWN_RECOVERY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_GLOBAL_SKILL_GEM_QUALITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MINION_COOLDOWN);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SKILL_SPEED);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HERALD_RESERVATION_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LEVEL_ALL_SKILLS);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_MANA);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_GLOBAL_DEFENCES);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_PERCENTAGE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_PERCENTAGE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_PERCENTAGE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ITEM_FOUND_RARITY_INCREASE);
    }
}