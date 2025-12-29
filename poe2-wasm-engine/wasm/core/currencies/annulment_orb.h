#ifndef ANNULMENT_ORB_H
#define ANNULMENT_ORB_H

#include "currency_base.h"

// Annulment Orb: Removes 1 random mod

void annulment_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool annulment_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency ANNULMENT_ORB;

#endif // ANNULMENT_ORB_H
