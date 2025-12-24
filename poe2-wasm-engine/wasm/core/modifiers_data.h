#ifndef MODIFIERS_DATA_H
#define MODIFIERS_DATA_H

#include "modifiers.h"

// Separate arrays by source for cache optimization
#define MODIFIERS_NORMAL_COUNT 635
#define MODIFIERS_DESECRATED_COUNT 359
#define MODIFIERS_ESSENCE_COUNT 264
#define MODIFIERS_PERFECT_ESSENCE_COUNT 79

extern Modifier MODIFIERS_NORMAL[MODIFIERS_NORMAL_COUNT];
extern Modifier MODIFIERS_DESECRATED[MODIFIERS_DESECRATED_COUNT];
extern Modifier MODIFIERS_ESSENCE[MODIFIERS_ESSENCE_COUNT];
extern Modifier MODIFIERS_PERFECT_ESSENCE[MODIFIERS_PERFECT_ESSENCE_COUNT];

void init_modifiers_data(void);

// Helper to get modifier by source and index
Modifier* get_modifier(ModifierSource source, int index);

#endif
