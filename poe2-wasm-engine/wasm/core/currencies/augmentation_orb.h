#ifndef AUGMENTATION_ORB_H
#define AUGMENTATION_ORB_H

#include "currency_base.h"

// Augmentation Orb: Magic → Magic + 1 mod (if has 1 mod, adds 1 more)

void augmentation_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool augmentation_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency AUGMENTATION_ORB;

#endif // AUGMENTATION_ORB_H
