#ifndef REGAL_ORB_H
#define REGAL_ORB_H

#include "currency_base.h"

// Regal Orb: Magic → Rare + 1 mod

// Omens
#define OMEN_REGAL_SINISTRAL  (1 << 8)  // Force prefix
#define OMEN_REGAL_DEXTRAL    (1 << 9)  // Force suffix

void regal_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

bool regal_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

extern const Currency REGAL_ORB;

#endif // REGAL_ORB_H
