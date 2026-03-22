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
    // Non-perfect essences: require Magic item (like augmentation, but becomes rare)
    // Perfect essences: require Rare item (replaces a mod of same slot type)
    // For now, we handle non-perfect essences only (source = SOURCE_ESSENCE)
    // Perfect essences use SOURCE_PERFECT_ESSENCE
    
    // Non-perfect essences work on Magic items with 0 or 1 mods
    if (state->rarity != 1) {
        if (error_out) strcpy(error_out, "Non-perfect Essence requires Magic item");
        return false;
    }
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 2) {
        if (error_out) strcpy(error_out, "Non-perfect Essence requires item with fewer than 2 mods");
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
    
    // Non-perfect essence: applied on Magic item with 0 or 1 mods
    // Adds 1 guaranteed essence mod, item becomes Rare
    if (state->rarity != 1) return;
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 2) return;
    
    // Get essence modifiers (source = SOURCE_ESSENCE)
    int essence_prefix_count = get_prefix_count(state->item_id, SOURCE_ESSENCE);
    int essence_suffix_count = get_suffix_count(state->item_id, SOURCE_ESSENCE);
    
    // Try adding each essence prefix (if prefix slot available)
    if (state->prefix_count < 3) {
        for (int i = 0; i < essence_prefix_count; i++) {
            ModifierLookup* lookup = get_prefix_lookup(state->item_id, SOURCE_ESSENCE, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            // Check family not already present
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 2;  // Becomes Rare
            
            // Add essence prefix
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
            child->event.currency_name = "Essence";
            
            // Essence guarantees this specific mod — probability is 1.0 for the forced mod
            // (user chooses which essence to use)
            child->event.probability = 1.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Try adding each essence suffix (if suffix slot available)
    if (state->suffix_count < 3) {
        for (int i = 0; i < essence_suffix_count; i++) {
            ModifierLookup* lookup = get_suffix_lookup(state->item_id, SOURCE_ESSENCE, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 2;  // Becomes Rare
            
            // Add essence suffix
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
            child->event.currency_name = "Essence";
            
            child->event.probability = 1.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
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
