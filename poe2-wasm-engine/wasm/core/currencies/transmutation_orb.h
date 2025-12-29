#ifndef TRANSMUTATION_ORB_H
#define TRANSMUTATION_ORB_H

#include "currency_base.h"

// Transmutation Orb: Normal → Magic (1-2 mods)
// No omens for Transmutation

void transmutation_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool transmutation_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency TRANSMUTATION_ORB;

#endif // TRANSMUTATION_ORB_H
