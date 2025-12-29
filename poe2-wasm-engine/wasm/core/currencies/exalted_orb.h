#ifndef EXALTED_ORB_H
#define EXALTED_ORB_H

#include "currency_base.h"

// Exalted Orb: Adds 1 random mod to Rare item

void exalted_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool exalted_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency EXALTED_ORB;

#endif // EXALTED_ORB_H
