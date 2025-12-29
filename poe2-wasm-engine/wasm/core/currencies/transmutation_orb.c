#include "transmutation_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
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
    
    // Get all available modifiers for this item
    int prefix_count = itemPrefixCount(state->item_id, 0);
    int suffix_count = itemSuffixCount(state->item_id, 0);
    
    // Generate children: 1 prefix only, 1 suffix only, or 1 prefix + 1 suffix
    
    // Option 1: Add single prefix
    for (int i = 0; i < prefix_count; i++) {
        int mod_idx = itemPrefixIndex(state->item_id, 0, i);
        const Modifier* mod = getModifier(mod_idx);
        if (!mod) continue;
        
        // Get applicable tier for this ilvl
        int tier = getApplicableTier(mod, state->item_level);
        if (tier < 0) continue;
        
        // Create child node
        CraftingNode* child = allocate_node(pool);
        child->state = *state;
        child->state.rarity = 1;  // Magic
        child->state.prefixes[0].modifier_id = mod_idx;
        child->state.prefixes[0].tier = tier;
        child->state.prefix_count = 1;
        
        // Set parent link
        child->parent = parent;
        child->depth = parent->depth + 1;
        
        // Set event
        child->event.modifier_id = mod_idx;
        child->event.tier = tier;
        child->event.action_type = ACTION_ADDED;
        child->event.currency_name = "Transmutation Orb";
        
        // Calculate probability (simplified: 1 / total_weight)
        double total_weight = 0;
        for (int j = 0; j < prefix_count; j++) {
            int idx = itemPrefixIndex(state->item_id, 0, j);
            const Modifier* m = getModifier(idx);
            if (m) {
                int t = getApplicableTier(m, state->item_level);
                if (t >= 0) {
                    total_weight += m->tiers[t].weight;
                }
            }
        }
        child->event.probability = mod->tiers[tier].weight / total_weight;
        child->cumulative_probability = parent->cumulative_probability * child->event.probability;
        
        // Add to parent
        add_child_to_node(parent, child);
    }
    
    // Option 2: Add single suffix
    for (int i = 0; i < suffix_count; i++) {
        int mod_idx = itemSuffixIndex(state->item_id, 0, i);
        const Modifier* mod = getModifier(mod_idx);
        if (!mod) continue;
        
        int tier = getApplicableTier(mod, state->item_level);
        if (tier < 0) continue;
        
        CraftingNode* child = allocate_node(pool);
        child->state = *state;
        child->state.rarity = 1;
        child->state.suffixes[0].modifier_id = mod_idx;
        child->state.suffixes[0].tier = tier;
        child->state.suffix_count = 1;
        
        child->parent = parent;
        child->depth = parent->depth + 1;
        
        child->event.modifier_id = mod_idx;
        child->event.tier = tier;
        child->event.action_type = ACTION_ADDED;
        child->event.currency_name = "Transmutation Orb";
        
        double total_weight = 0;
        for (int j = 0; j < suffix_count; j++) {
            int idx = itemSuffixIndex(state->item_id, 0, j);
            const Modifier* m = getModifier(idx);
            if (m) {
                int t = getApplicableTier(m, state->item_level);
                if (t >= 0) {
                    total_weight += m->tiers[t].weight;
                }
            }
        }
        child->event.probability = mod->tiers[tier].weight / total_weight;
        child->cumulative_probability = parent->cumulative_probability * child->event.probability;
        
        add_child_to_node(parent, child);
    }
    
    // Option 3: Add prefix + suffix (2 mods)
    // This would create prefix_count × suffix_count children
    // For now, we'll skip this to reduce node explosion
    // Can be added later if needed
}

const Currency TRANSMUTATION_ORB = {
    .id = "transmutation",
    .name = "Orb of Transmutation",
    .available_omens = OMEN_NONE,
    .apply = transmutation_orb_apply,
    .validate = transmutation_orb_validate
};
