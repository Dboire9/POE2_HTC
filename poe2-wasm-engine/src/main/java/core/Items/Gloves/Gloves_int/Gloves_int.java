package core.Items.Gloves.Gloves_int;


import java.util.ArrayList;
import core.Items.*;
import core.Item_modifiers.Gloves_Item_modifiers.Gloves_Normal_Item_modifiers.*;


public class Gloves_int extends Item_base {

    public Gloves_int() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.FIRE_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.COLD_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.LIGHTNING_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_MELEE_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_HIT);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_ATTACK_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.CRITICAL_DAMAGE_BONUS);
        Normal_allowedSuffixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE);
        Normal_allowedSuffixes.add(Modifiers_normal.ENERGY_SHIELD_RECHARGE_RATE);

        Desecrated_allowedPrefixes = new ArrayList<>();
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DAZE_ON_HIT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ARCANE_SURGE_ON_CRIT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCREASED_CAST_SPEED_ON_FULL_LIFE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_BLEED_CHANCE_INCREASE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SKILL_SPEED_ON_FRENZY_CONSUMPTION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_INCISION_CHANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_POISON_CHANCE_INCREASE);


        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_MANA);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_ACCURACY);
        
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CRITICAL_DAMAGE_BONUS);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_SOUL_CORE);
        
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_DAMAGE_TAKEN_RECOUPED_AS_LIFE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ITEM_FOUND_RARITY_INCREASE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_GOLD_DROPPED);

    }
}
