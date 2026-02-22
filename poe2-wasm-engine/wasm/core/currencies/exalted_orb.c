#include "exalted_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include "../crafting/crafting_helpers.h"
#include <string.h>

bool exalted_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    if (state->rarity != 2) {
        if (error_out) strcpy(error_out, "Exalted Orb requires Rare item");
        return false;
    }
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) {
        if (error_out) strcpy(error_out, "No open affix slots");
        return false;
    }
    
    return true;
}

void exalted_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    if (state->rarity != 2) return;
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) return;
    
    // Check omens
    bool force_prefix = (context->selected_omens & OMEN_EXALTED_SINISTRAL) != 0;
    bool force_suffix = (context->selected_omens & OMEN_EXALTED_DEXTRAL) != 0;
    
    if (force_prefix && force_suffix) {
        force_prefix = false;
        force_suffix = false;
    }
    
    // Try adding prefixes from NORMAL source
    if (!force_suffix && state->prefix_count < 3) {
        int prefix_count = get_prefix_count(state->item_id, SOURCE_NORMAL);
        double total_weight = calc_available_prefix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
        
        for (int i = 0; i < prefix_count; i++) {
            ModifierLookup* lookup = get_prefix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            // Add prefix with source and index
            child->state.prefixes[state->prefix_count].source = lookup->source;
            child->state.prefixes[state->prefix_count].index = lookup->index;
            child->state.prefixes[state->prefix_count].tier = tier;
            child->state.prefix_count = state->prefix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Exalted Orb";
            
            double type_prob = force_prefix ? 1.0 : 0.5;
            child->event.probability = (total_weight > 0) ? 
                type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Try adding suffixes from NORMAL source
    if (!force_prefix && state->suffix_count < 3) {
        int suffix_count = get_suffix_count(state->item_id, SOURCE_NORMAL);
        double total_weight = calc_available_suffix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
        
        for (int i = 0; i < suffix_count; i++) {
            ModifierLookup* lookup = get_suffix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            // Add suffix with source and index
            child->state.suffixes[state->suffix_count].source = lookup->source;
            child->state.suffixes[state->suffix_count].index = lookup->index;
            child->state.suffixes[state->suffix_count].tier = tier;
            child->state.suffix_count = state->suffix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Exalted Orb";
            
            double type_prob = force_suffix ? 1.0 : 0.5;
            child->event.probability = (total_weight > 0) ? 
                type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
}

const Currency EXALTED_ORB = {
    .id = "exalted",
    .name = "Exalted Orb",
    .available_omens = OMEN_EXALTED_SINISTRAL | OMEN_EXALTED_DEXTRAL | OMEN_EXALTED_GREATER,
    .apply = exalted_orb_apply,
    .validate = exalted_orb_validate
};
