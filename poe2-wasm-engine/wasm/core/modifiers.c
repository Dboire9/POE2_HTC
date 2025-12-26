#include "modifiers.h"
#include "modifiers_data.h"
#include "items.h"
#include <string.h>

void init_modifiers(void) {
    // Data is already compiled in modifiers_data.c
}

Modifier* get_modifier_by_source_index(ModifierSource source, uint16_t index) {
    switch (source) {
        case SOURCE_NORMAL:
            if (index < MODIFIERS_NORMAL_COUNT) return &MODIFIERS_NORMAL[index];
            break;
        case SOURCE_DESECRATED:
            if (index < MODIFIERS_DESECRATED_COUNT) return &MODIFIERS_DESECRATED[index];
            break;
        case SOURCE_ESSENCE:
            if (index < MODIFIERS_ESSENCE_COUNT) return &MODIFIERS_ESSENCE[index];
            break;
        case SOURCE_PERFECT_ESSENCE:
            if (index < MODIFIERS_PERFECT_ESSENCE_COUNT) return &MODIFIERS_PERFECT_ESSENCE[index];
            break;
    }
    return NULL;
}

bool modifier_applies_to_item(const Modifier* mod, const Item* item) {
    // Check item level against first tier requirement
    if (mod->tier_count > 0 && item->item_level < mod->tiers[0].level_req) {
        return false;
    }
    
    // Check tag compatibility
    if (mod->tags != 0 && (item->tags & mod->tags) == 0) {
        return false;
    }
    
    return true;
}

float get_modifier_probability(const Modifier* mod, const Item* item) {
    // Find highest tier accessible for this item level
    int accessible_tier = -1;
    for (int i = 0; i < mod->tier_count; i++) {
        if (item->item_level >= mod->tiers[i].level_req) {
            accessible_tier = i;
        }
    }
    
    if (accessible_tier < 0) return 0.0f;
    
    return (float)mod->tiers[accessible_tier].weight / 1000.0f;
}
