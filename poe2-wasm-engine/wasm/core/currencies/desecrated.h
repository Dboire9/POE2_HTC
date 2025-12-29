#ifndef DESECRATED_H
#define DESECRATED_H

#include "currency_base.h"

// Desecrated Currency: Adds 1 desecrated modifier (special mods from desecrated pool)
// Can only have 1 desecrated mod per item

// Desecrated omens are defined in currency_base.h
// OMEN_DESECRATED_DEXTRAL_NECROMANCY
// OMEN_DESECRATED_SINISTRAL_NECROMANCY
// OMEN_DESECRATED_BLACKBLOODED
// OMEN_DESECRATED_LIEGE
// OMEN_DESECRATED_SOVEREIGN

void desecrated_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool desecrated_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency DESECRATED;

#endif // DESECRATED_H
