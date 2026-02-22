#include "desecrated.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include "../crafting/crafting_helpers.h"
#include <string.h>

// Helper to check if item already has a desecrated mod
static bool has_desecrated_mod(const ItemState* state) {
    // Check prefixes - source field directly tells us
    for (int i = 0; i < state->prefix_count; i++) {
        if (state->prefixes[i].source == SOURCE_DESECRATED) {
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        if (state->suffixes[i].source == SOURCE_DESECRATED) {
            return true;
        }
    }
    
    return false;
}

bool desecrated_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    // Must be at least Magic
    if (state->rarity == 0) {
        if (error_out) strcpy(error_out, "Desecrated Currency requires Magic or Rare item");
        return false;
    }
    
    // Can't have 6 mods already
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) {
        if (error_out) strcpy(error_out, "No open affix slots");
        return false;
    }
    
    // Can't already have a desecrated mod
    if (has_desecrated_mod(state)) {
        if (error_out) strcpy(error_out, "Item already has a desecrated modifier");
        return false;
    }
    
    return true;
}

void desecrated_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    // Validate
    if (state->rarity == 0) return;
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) return;
    if (has_desecrated_mod(state)) return;
    
    // Check omens
    bool force_prefix = (context->selected_omens & OMEN_DESECRATED_SINISTRAL_NECROMANCY) != 0;
    bool force_suffix = (context->selected_omens & OMEN_DESECRATED_DEXTRAL_NECROMANCY) != 0;
    
    if (force_prefix && force_suffix) {
        force_prefix = false;
        force_suffix = false;
    }
    
    // Get desecrated modifiers count using crafting_helpers
    int desecrated_prefix_count = get_prefix_count(state->item_id, SOURCE_DESECRATED);
    int desecrated_suffix_count = get_suffix_count(state->item_id, SOURCE_DESECRATED);
    
    // Try adding desecrated prefixes
    if (!force_suffix && state->prefix_count < 3) {
        for (int i = 0; i < desecrated_prefix_count; i++) {
            ModifierLookup* lookup = get_prefix_lookup(state->item_id, SOURCE_DESECRATED, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            // Check family not already present
            if (has_mod_family(state, mod->name)) continue;
            
            // Create child
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            // Add desecrated prefix with source and index
            child->state.prefixes[state->prefix_count].source = lookup->source;
            child->state.prefixes[state->prefix_count].index = lookup->index;
            child->state.prefixes[state->prefix_count].tier = tier;
            child->state.prefix_count = state->prefix_count + 1;
            
            // Upgrade to Rare if Magic
            if (child->state.rarity == 1) {
                child->state.rarity = 2;
            }
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Desecrated Currency";
            
            // Calculate probability
            double total_weight = calc_available_prefix_weight(state->item_id, SOURCE_DESECRATED, state, state->item_level);
            
            double type_prob = force_prefix ? 1.0 : 0.5;
            child->event.probability = (total_weight > 0) ? 
                type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Try adding desecrated suffixes
    if (!force_prefix && state->suffix_count < 3) {
        for (int i = 0; i < desecrated_suffix_count; i++) {
            ModifierLookup* lookup = get_suffix_lookup(state->item_id, SOURCE_DESECRATED, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            child->state.suffixes[state->suffix_count].source = lookup->source;
            child->state.suffixes[state->suffix_count].index = lookup->index;
            child->state.suffixes[state->suffix_count].tier = tier;
            child->state.suffix_count = state->suffix_count + 1;
            
            if (child->state.rarity == 1) {
                child->state.rarity = 2;
            }
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Desecrated Currency";
            
            double total_weight = calc_available_suffix_weight(state->item_id, SOURCE_DESECRATED, state, state->item_level);
            
            double type_prob = force_suffix ? 1.0 : 0.5;
            child->event.probability = (total_weight > 0) ? 
                type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
}

const Currency DESECRATED = {
    .id = "desecrated",
    .name = "Desecrated Currency",
    .available_omens = OMEN_DESECRATED_SINISTRAL_NECROMANCY | OMEN_DESECRATED_DEXTRAL_NECROMANCY | 
                      OMEN_DESECRATED_BLACKBLOODED | OMEN_DESECRATED_LIEGE | 
                      OMEN_DESECRATED_SOVEREIGN,
    .apply = desecrated_apply,
    .validate = desecrated_validate
};
