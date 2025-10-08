package Items.Quarterstaves;


import Item_modifiers.TwoHand_Item_modifiers.Quarterstaves_Items_modifiers.*;

import java.util.ArrayList;

public class Quarterstaff extends Quarterstaff_Item {

    public Quarterstaff() {
        
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.FIRE_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.COLD_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.LIGHTNING_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PHYSICAL_DAMAGE_PERCENT);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS);
    
    
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_MELEE_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_LEECH);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_HIT);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_ATTACK_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.CRITICAL_HIT_CHANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CRITICAL_DAMAGE_BONUS);
        Normal_allowedSuffixes.add(Modifiers_normal.HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_STUN_DURATION);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_STUN_BUILDUP);

		Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_FIRE_PENETRATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_FIRE_DAMAGE_IGNITE_MAGNITUDE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COLD_PENETRATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COLD_DAMAGE_FREEZE_BUILDUP);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_PENETRATION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_DAMAGE_SHOCK_MAGNITUDE);

        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPIRIT_RESERVATION_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ADDITIONAL_COMBO_CHANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_RECOVER_MANA_ON_EXPENDING_COMBO);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_RECOVER_LIFE_ON_EXPENDING_COMBO);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_TO_LIFE_COST);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_PHYSICAL_DAMAGE_FLAT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_FIRE_DAMAGE_FLAT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_COLD_DAMAGE_FLAT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_LIGHTNING_DAMAGE_FLAT);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_ACCURACY);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_WEAPON_GAINED_DAMAGE_FIRE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_WEAPON_GAINED_DAMAGE_COLD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        


        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_INCREASED_ATTACK_SPEED);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ALL_ATTACK_SKILL_LEVEL);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ONSLAUGHT);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CRITICAL_STRIKE_CHANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
    }
}
