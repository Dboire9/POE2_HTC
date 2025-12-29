#ifndef ESSENCE_H
#define ESSENCE_H

#include "currency_base.h"

// Essence: Forces 1 specific modifier + rerolls all others
// Can upgrade rarity (Normal → Rare directly)

typedef enum {
    ESSENCE_TIER_LESSER = 0,
    ESSENCE_TIER_NORMAL = 1,
    ESSENCE_TIER_GREATER = 2,
    ESSENCE_TIER_PERFECT = 3
} EssenceTier;

void essence_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool essence_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency ESSENCE;

#endif // ESSENCE_H
