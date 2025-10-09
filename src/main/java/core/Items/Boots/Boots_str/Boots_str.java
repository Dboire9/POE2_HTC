package core.Items.Boots.Boots_str;


import java.util.ArrayList;

import core.Item_modifiers.Boots_Item_modifiers.Boots_Normal_Item_modifiers.*;
import core.Items.*;

public class Boots_str extends Item_base {

    public Boots_str() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_LIFE);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_ARMOUR);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ARMOUR);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ARMOUR_AND_STUN);
        Normal_allowedPrefixes.add(Modifiers_normal.MOVEMENT_SPEED);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.STRENGTH);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.BASE_STUN_THRESHOLD);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_REGENERATION_PER_SECOND);
        Normal_allowedSuffixes.add(Modifiers_normal.ITEM_FOUND_RARITY_INCREASE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_SHOCK_DURATION);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_CHILL_DURATION);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_FREEZE_DURATION);
        Normal_allowedSuffixes.add(Modifiers_normal.ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE);

        Desecrated_allowedPrefixes = new ArrayList<>();
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DODGE_ROLL_DISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SLOW_POTENCY_REDUCTION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REDUCED_SELF_IGNITE_DURATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REDUCED_BLEEDING_DURATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_REDUCED_POISON_DURATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY_IF_DODGE_ROLL);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_MANA_REGENERATION_WHILE_STATIONARY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CORRUPTED_BLOOD_IMMUNITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_REDUCES_MOVEMENT_VELOCITY_PENALTY_SKILLS_WHEN_MOVING);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_MANA);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ARMOUR);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_EVASION);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_MOVEMENT_SPEED);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_SOUL_CORE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ITEM_FOUND_RARITY_INCREASE);

    }
}