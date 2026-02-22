#include "essence.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include "../crafting/crafting_helpers.h"
#include <string.h>

bool essence_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    // Essence can be used on any rarity
    if (!context->essence_type) {
        if (error_out) strcpy(error_out, "Must specify essence type");
        return false;
    }
    return true;
}

void essence_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    if (!context->essence_type) return;
    
    // Check omens
    bool force_prefix = (context->selected_omens & OMEN_ESSENCE_SINISTRAL_CRYSTALLISATION) != 0;
    bool force_suffix = (context->selected_omens & OMEN_ESSENCE_DEXTRAL_CRYSTALLISATION) != 0;
    
    if (force_prefix && force_suffix) {
        force_prefix = false;
        force_suffix = false;
    }
    
    // Essence forces ONE specific modifier from essence pool
    // Then rerolls all other mods randomly
    
    // Get essence modifiers (source = 2 for essence)
    int essence_prefix_count = get_prefix_count(state->item_id, SOURCE_ESSENCE);
    int essence_suffix_count = get_suffix_count(state->item_id, SOURCE_ESSENCE);
    
    // Try forcing each essence prefix
    if (!force_suffix) {
        for (int forced_idx = 0; forced_idx < essence_prefix_count; forced_idx++) {
            ModifierLookup* forced_lookup = get_prefix_lookup(state->item_id, SOURCE_ESSENCE, forced_idx);
            if (!forced_lookup) continue;
            
            const Modifier* forced_mod = get_mod_from_lookup(forced_lookup);
            if (!forced_mod) continue;
            
            int forced_tier = get_applicable_tier_with_limit(forced_mod, state->item_level, forced_lookup->max_tier_index);
            if (forced_tier < 0) continue;
            
            // Get normal mods for reroll
            int normal_prefix_count = get_prefix_count(state->item_id, SOURCE_NORMAL);
            int normal_suffix_count = get_suffix_count(state->item_id, SOURCE_NORMAL);
            
            // Generate sample outcomes (not exhaustive)
            for (int i = 0; i < normal_prefix_count && i < 5; i++) {
                ModifierLookup* reroll_prefix_lookup = get_prefix_lookup(state->item_id, SOURCE_NORMAL, i);
                if (!reroll_prefix_lookup) continue;
                
                const Modifier* reroll_prefix = get_mod_from_lookup(reroll_prefix_lookup);
                if (!reroll_prefix) continue;
                
                int reroll_tier = get_applicable_tier_with_limit(reroll_prefix, state->item_level, reroll_prefix_lookup->max_tier_index);
                if (reroll_tier < 0) continue;
                
                // Check family conflicts
                if (strcmp(forced_mod->name, reroll_prefix->name) == 0) continue;
                
                for (int j = 0; j < normal_suffix_count && j < 5; j++) {
                    ModifierLookup* reroll_suffix_lookup = get_suffix_lookup(state->item_id, SOURCE_NORMAL, j);
                    if (!reroll_suffix_lookup) continue;
                    
                    const Modifier* reroll_suffix = get_mod_from_lookup(reroll_suffix_lookup);
                    if (!reroll_suffix) continue;
                    
                    int suffix_tier = get_applicable_tier_with_limit(reroll_suffix, state->item_level, reroll_suffix_lookup->max_tier_index);
                    if (suffix_tier < 0) continue;
                    
                    // Check family conflicts
                    if (strcmp(forced_mod->name, reroll_suffix->name) == 0) continue;
                    if (strcmp(reroll_prefix->name, reroll_suffix->name) == 0) continue;
                    
                    // Create child with forced essence + 2 rerolled mods
                    CraftingNode* child = allocate_node(pool);
                    child->state.item_id = state->item_id;
                    child->state.item_level = state->item_level;
                    child->state.rarity = 2;  // Rare
                    
                    // Forced essence prefix
                    child->state.prefixes[0].source = forced_lookup->source;
                    child->state.prefixes[0].index = forced_lookup->index;
                    child->state.prefixes[0].tier = forced_tier;
                    
                    // Rerolled prefix
                    child->state.prefixes[1].source = reroll_prefix_lookup->source;
                    child->state.prefixes[1].index = reroll_prefix_lookup->index;
                    child->state.prefixes[1].tier = reroll_tier;
                    child->state.prefix_count = 2;
                    
                    // Rerolled suffix
                    child->state.suffixes[0].source = reroll_suffix_lookup->source;
                    child->state.suffixes[0].index = reroll_suffix_lookup->index;
                    child->state.suffixes[0].tier = suffix_tier;
                    child->state.suffix_count = 1;
                    
                    child->parent = parent;
                    child->depth = parent->depth + 1;
                    
                    child->event.modifier_source = forced_lookup->source;
                    child->event.modifier_index = forced_lookup->index;
                    child->event.tier = forced_tier;
                    child->event.action_type = ACTION_REROLLED;
                    child->event.currency_name = "Essence";
                    
                    // Probability calculation (simplified)
                    double forced_weight = forced_mod->tiers[forced_tier].weight;
                    double total_essence_weight = 100.0;  // Simplified
                    
                    double reroll_prefix_weight = reroll_prefix->tiers[reroll_tier].weight;
                    double reroll_suffix_weight = reroll_suffix->tiers[suffix_tier].weight;
                    double total_normal_weight = 1000.0;  // Simplified
                    
                    child->event.probability = 
                        (forced_weight / total_essence_weight) *
                        (reroll_prefix_weight / total_normal_weight) *
                        (reroll_suffix_weight / total_normal_weight);
                    
                    child->cumulative_probability = parent->cumulative_probability * child->event.probability;
                    
                    add_child_to_node(parent, child);
                }
            }
        }
    }
    
    // Try forcing each essence suffix
    if (!force_prefix) {
        for (int forced_idx = 0; forced_idx < essence_suffix_count; forced_idx++) {
            ModifierLookup* forced_lookup = get_suffix_lookup(state->item_id, SOURCE_ESSENCE, forced_idx);
            if (!forced_lookup) continue;
            
            const Modifier* forced_mod = get_mod_from_lookup(forced_lookup);
            if (!forced_mod) continue;
            
            int forced_tier = get_applicable_tier_with_limit(forced_mod, state->item_level, forced_lookup->max_tier_index);
            if (forced_tier < 0) continue;
            
            int normal_prefix_count = get_prefix_count(state->item_id, SOURCE_NORMAL);
            
            // Generate sample outcomes
            for (int i = 0; i < normal_prefix_count && i < 5; i++) {
                ModifierLookup* reroll_prefix_lookup = get_prefix_lookup(state->item_id, SOURCE_NORMAL, i);
                if (!reroll_prefix_lookup) continue;
                
                const Modifier* reroll_prefix = get_mod_from_lookup(reroll_prefix_lookup);
                if (!reroll_prefix) continue;
                
                int reroll_tier = get_applicable_tier_with_limit(reroll_prefix, state->item_level, reroll_prefix_lookup->max_tier_index);
                if (reroll_tier < 0) continue;
                
                if (strcmp(forced_mod->name, reroll_prefix->name) == 0) continue;
                
                CraftingNode* child = allocate_node(pool);
                child->state.item_id = state->item_id;
                child->state.item_level = state->item_level;
                child->state.rarity = 2;
                
                // Rerolled prefix
                child->state.prefixes[0].source = reroll_prefix_lookup->source;
                child->state.prefixes[0].index = reroll_prefix_lookup->index;
                child->state.prefixes[0].tier = reroll_tier;
                child->state.prefix_count = 1;
                
                // Forced essence suffix
                child->state.suffixes[0].source = forced_lookup->source;
                child->state.suffixes[0].index = forced_lookup->index;
                child->state.suffixes[0].tier = forced_tier;
                child->state.suffix_count = 1;
                
                child->parent = parent;
                child->depth = parent->depth + 1;
                
                child->event.modifier_source = forced_lookup->source;
                child->event.modifier_index = forced_lookup->index;
                child->event.tier = forced_tier;
                child->event.action_type = ACTION_REROLLED;
                child->event.currency_name = "Essence";
                
                double forced_weight = forced_mod->tiers[forced_tier].weight;
                double reroll_weight = reroll_prefix->tiers[reroll_tier].weight;
                
                child->event.probability = (forced_weight / 100.0) * (reroll_weight / 1000.0);
                child->cumulative_probability = parent->cumulative_probability * child->event.probability;
                
                add_child_to_node(parent, child);
            }
        }
    }
}

const Currency ESSENCE = {
    .id = "essence",
    .name = "Essence",
    .available_omens = OMEN_ESSENCE_SINISTRAL_CRYSTALLISATION | OMEN_ESSENCE_DEXTRAL_CRYSTALLISATION,
    .apply = essence_apply,
    .validate = essence_validate
};
