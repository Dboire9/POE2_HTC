#include "modifiers.h"
#include "modifiers_data.h"
#include "../items/items.h"
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
