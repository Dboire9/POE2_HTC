#ifndef MODIFIERS_DATA_H
#define MODIFIERS_DATA_H

#include "modifiers.h"

// Separate arrays by source for cache optimization
#define MODIFIERS_NORMAL_COUNT 635
#define MODIFIERS_DESECRATED_COUNT 359
#define MODIFIERS_ESSENCE_COUNT 264
#define MODIFIERS_PERFECT_ESSENCE_COUNT 79

extern Modifier* MODIFIERS_NORMAL;
extern Modifier* MODIFIERS_DESECRATED;
extern Modifier* MODIFIERS_ESSENCE;
extern Modifier* MODIFIERS_PERFECT_ESSENCE;

Modifier* init_normal_modifiers_data(void);
Modifier* init_desecrated_modifiers_data(void);
Modifier* init_essence_modifiers_data(void);
Modifier* init_perfect_essence_modifiers_data(void);

// Helper to get modifier by source and index
Modifier* get_modifier(ModifierSource source, int index);

ModifierTierData* init_tiers(ModifierSource source, uint16_t mod_id, uint8_t tier_count);

#endif
