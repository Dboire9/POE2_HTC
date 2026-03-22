#include "transmutation_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/crafting_helpers.h"
#include <string.h>

bool transmutation_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    if (state->rarity != 0) {
        if (error_out) strcpy(error_out, "Transmutation Orb requires Normal item");
        return false;
    }
    return true;
}

void transmutation_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    // Must be Normal rarity
    if (state->rarity != 0) return;
    
    // Transmutation adds exactly 1 mod (prefix or suffix) and becomes Magic
    // 50/50 chance of prefix vs suffix
    
    // Get all available modifiers for this item from NORMAL source
    int prefix_count = get_prefix_count(state->item_id, SOURCE_NORMAL);
    int suffix_count = get_suffix_count(state->item_id, SOURCE_NORMAL);
    double prefix_total_weight = calc_available_prefix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
    double suffix_total_weight = calc_available_suffix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
    
    // Probability of rolling prefix vs suffix (50/50 if both available)
    bool has_prefixes = (prefix_total_weight > 0);
    bool has_suffixes = (suffix_total_weight > 0);
    double prefix_type_prob = (has_prefixes && has_suffixes) ? 0.5 : (has_prefixes ? 1.0 : 0.0);
    double suffix_type_prob = (has_prefixes && has_suffixes) ? 0.5 : (has_suffixes ? 1.0 : 0.0);
    
    // Add single prefix outcomes
    if (has_prefixes) {
        for (int i = 0; i < prefix_count; i++) {
            ModifierLookup* lookup = get_prefix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 1;  // Magic
            child->state.prefixes[0].source = lookup->source;
            child->state.prefixes[0].index = lookup->index;
            child->state.prefixes[0].tier = tier;
            child->state.prefix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Transmutation Orb";
            
            // Probability = P(prefix type) × P(this mod within prefixes)
            child->event.probability = prefix_type_prob * 
                (mod->tiers[tier].weight / prefix_total_weight);
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Add single suffix outcomes
    if (has_suffixes) {
        for (int i = 0; i < suffix_count; i++) {
            ModifierLookup* lookup = get_suffix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 1;  // Magic
            child->state.suffixes[0].source = lookup->source;
            child->state.suffixes[0].index = lookup->index;
            child->state.suffixes[0].tier = tier;
            child->state.suffix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Transmutation Orb";
            
            // Probability = P(suffix type) × P(this mod within suffixes)
            child->event.probability = suffix_type_prob * 
                (mod->tiers[tier].weight / suffix_total_weight);
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
}

const Currency TRANSMUTATION_ORB = {
    .id = "transmutation",
    .name = "Orb of Transmutation",
    .available_omens = OMEN_NONE,
    .apply = transmutation_orb_apply,
    .validate = transmutation_orb_validate
};
