#include "regal_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include <string.h>

bool regal_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    if (state->rarity != 1) {
        if (error_out) strcpy(error_out, "Regal Orb requires Magic item");
        return false;
    }
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) {
        if (error_out) strcpy(error_out, "Item already has maximum modifiers");
        return false;
    }
    
    return true;
}

void regal_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    if (state->rarity != 1) return;
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 6) return;
    
    // Check omens
    bool force_prefix = (context->selected_omens & OMEN_REGAL_SINISTRAL) != 0;
    bool force_suffix = (context->selected_omens & OMEN_REGAL_DEXTRAL) != 0;
    
    // If both omens selected, ignore both (conflicting)
    if (force_prefix && force_suffix) {
        force_prefix = false;
        force_suffix = false;
    }
    
    // Try adding prefixes
    if (!force_suffix && state->prefix_count < 3) {
        int prefix_count = itemPrefixCount(state->item_id, 0);
        
        for (int i = 0; i < prefix_count; i++) {
            int mod_idx = itemPrefixIndex(state->item_id, 0, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            if (has_modifier_family(state, mod->family)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 2;  // Rare
            
            // Add new prefix
            child->state.prefixes[state->prefix_count].modifier_id = mod_idx;
            child->state.prefixes[state->prefix_count].tier = tier;
            child->state.prefix_count = state->prefix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Regal Orb";
            
            // Calculate probability
            double total_weight = 0;
            int valid_count = 0;
            
            // Count valid prefixes
            for (int j = 0; j < prefix_count; j++) {
                int idx = itemPrefixIndex(state->item_id, 0, j);
                const Modifier* m = getModifier(idx);
                if (m && !has_modifier_family(state, m->family)) {
                    int t = getApplicableTier(m, state->item_level);
                    if (t >= 0) {
                        total_weight += m->tiers[t].weight;
                        valid_count++;
                    }
                }
            }
            
            // If force_suffix, reduce probability
            double type_prob = force_prefix ? 1.0 : 0.5;  // 50/50 prefix/suffix normally
            child->event.probability = type_prob * (mod->tiers[tier].weight / total_weight);
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Try adding suffixes
    if (!force_prefix && state->suffix_count < 3) {
        int suffix_count = itemSuffixCount(state->item_id, 0);
        
        for (int i = 0; i < suffix_count; i++) {
            int mod_idx = itemSuffixIndex(state->item_id, 0, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            if (has_modifier_family(state, mod->family)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.rarity = 2;
            
            child->state.suffixes[state->suffix_count].modifier_id = mod_idx;
            child->state.suffixes[state->suffix_count].tier = tier;
            child->state.suffix_count = state->suffix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Regal Orb";
            
            double total_weight = 0;
            for (int j = 0; j < suffix_count; j++) {
                int idx = itemSuffixIndex(state->item_id, 0, j);
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

const Currency REGAL_ORB = {
    .id = "regal",
    .name = "Regal Orb",
    .available_omens = OMEN_REGAL_SINISTRAL | OMEN_REGAL_DEXTRAL,
    .apply = regal_orb_apply,
    .validate = regal_orb_validate
};
