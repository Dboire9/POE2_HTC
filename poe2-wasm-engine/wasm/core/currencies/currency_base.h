#ifndef CURRENCY_BASE_H
#define CURRENCY_BASE_H

#include "../crafting/crafting_types.h"

// Forward declarations
typedef struct NodePool NodePool;

// Currency function type
// Generates children nodes for a given parent by applying the currency
typedef void (*ApplyCurrencyFunc)(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
);

// Validation function type
typedef bool (*ValidateCurrencyFunc)(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
);

// Currency definition
typedef struct {
    const char* id;
    const char* name;
    uint32_t available_omens;
    ApplyCurrencyFunc apply;
    ValidateCurrencyFunc validate;
} Currency;

// Omen bitflags (shared across currencies)
#define OMEN_NONE                    0

// Exalted Orb omens
#define OMEN_EXALTED_SINISTRAL      (1 << 0)  // Force prefix
#define OMEN_EXALTED_DEXTRAL        (1 << 1)  // Force suffix
#define OMEN_EXALTED_GREATER        (1 << 2)

// Annulment Orb omens
#define OMEN_ANNULMENT_SINISTRAL    (1 << 3)  // Remove prefix
#define OMEN_ANNULMENT_DEXTRAL      (1 << 4)  // Remove suffix
#define OMEN_ANNULMENT_LIGHT        (1 << 5)

// Essence omens
#define OMEN_ESSENCE_SINISTRAL_CRYSTALLISATION   (1 << 6)  // Force prefix
#define OMEN_ESSENCE_DEXTRAL_CRYSTALLISATION     (1 << 7)  // Force suffix

// Regal omens
#define OMEN_REGAL_SINISTRAL        (1 << 8)  // Force prefix
#define OMEN_REGAL_DEXTRAL          (1 << 9)  // Force suffix

// Desecrated omens
#define OMEN_DESECRATED_DEXTRAL_NECROMANCY   (1 << 10)  // Force suffix
#define OMEN_DESECRATED_SINISTRAL_NECROMANCY (1 << 11)  // Force prefix
#define OMEN_DESECRATED_BLACKBLOODED         (1 << 12)
#define OMEN_DESECRATED_LIEGE                (1 << 13)
#define OMEN_DESECRATED_SOVEREIGN            (1 << 14)

// Currency tier
typedef enum {
    TIER_BASE = 0,
    TIER_GREATER = 1,
    TIER_PERFECT = 2
} CurrencyTier;

#endif // CURRENCY_BASE_H
