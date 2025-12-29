#include "desecrated.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include <string.h>

// Helper to check if item already has a desecrated mod
static bool has_desecrated_mod(const ItemState* state) {
    // Check prefixes
    for (int i = 0; i < state->prefix_count; i++) {
        const Modifier* mod = getModifier(state->prefixes[i].modifier_id);
        if (mod && mod->source == 3) {  // 3 = DESECRATED source
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        const Modifier* mod = getModifier(state->suffixes[i].modifier_id);
        if (mod && mod->source == 3) {
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
    
    // Get desecrated modifiers (source = 3 for desecrated)
    int desecrated_prefix_count = itemPrefixCount(state->item_id, 3);
    int desecrated_suffix_count = itemSuffixCount(state->item_id, 3);
    
    // Try adding desecrated prefixes
    if (!force_suffix && state->prefix_count < 3) {
        for (int i = 0; i < desecrated_prefix_count; i++) {
            int mod_idx = itemPrefixIndex(state->item_id, 3, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            // Check family not already present
            if (has_modifier_family(state, mod->family)) continue;
            
            // Create child
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            // Add desecrated prefix
            child->state.prefixes[state->prefix_count].modifier_id = mod_idx;
            child->state.prefixes[state->prefix_count].tier = tier;
            child->state.prefix_count = state->prefix_count + 1;
            
            // Upgrade to Rare if Magic
            if (child->state.rarity == 1) {
                child->state.rarity = 2;
            }
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Desecrated Currency";
            
            // Calculate probability
            double total_weight = 0;
            for (int j = 0; j < desecrated_prefix_count; j++) {
                int idx = itemPrefixIndex(state->item_id, 3, j);
                const Modifier* m = getModifier(idx);
                if (m && !has_modifier_family(state, m->family)) {
                    int t = getApplicableTier(m, state->item_level);
                    if (t >= 0) {
                        total_weight += m->tiers[t].weight;
                    }
                }
            }
            
            double type_prob = force_prefix ? 1.0 : 0.5;
            child->event.probability = type_prob * (mod->tiers[tier].weight / total_weight);
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Try adding desecrated suffixes
    if (!force_prefix && state->suffix_count < 3) {
        for (int i = 0; i < desecrated_suffix_count; i++) {
            int mod_idx = itemSuffixIndex(state->item_id, 3, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            if (has_modifier_family(state, mod->family)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            child->state.suffixes[state->suffix_count].modifier_id = mod_idx;
            child->state.suffixes[state->suffix_count].tier = tier;
            child->state.suffix_count = state->suffix_count + 1;
            
            if (child->state.rarity == 1) {
                child->state.rarity = 2;
            }
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Desecrated Currency";
            
            double total_weight = 0;
            for (int j = 0; j < desecrated_suffix_count; j++) {
                int idx = itemSuffixIndex(state->item_id, 3, j);
                const Modifier* m = getModifier(idx);
                if (m && !has_modifier_family(state, m->family)) {
                    int t = getApplicableTier(m, state->item_level);
                    if (t >= 0) {
                        total_weight += m->tiers[t].weight;
                    }
                }
            }
            
            double type_prob = force_suffix ? 1.0 : 0.5;
            child->event.probability = type_prob * (mod->tiers[tier].weight / total_weight);
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
