#ifndef MODIFIERS_H
#define MODIFIERS_H

#include <stdint.h>
#include <stdbool.h>
#include "items.h"

// Modifier types
typedef enum {
    MOD_PREFIX = 0,
    MOD_SUFFIX = 1,
    MOD_IMPLICIT = 2
} ModifierType;

// Modifier sources (crafting methods)
typedef enum {
    SOURCE_NORMAL = 0,
    SOURCE_DESECRATED = 1,
    SOURCE_ESSENCE = 2,
    SOURCE_PERFECT_ESSENCE = 3
} ModifierSource;

// Value range for a tier (e.g., "Adds 2-3 to 5-7 Physical Damage")
typedef struct {
    int16_t min;
    int16_t max;
} ValueRange;

// Individual tier of a modifier
typedef struct {
    char tier_name[32];      // "Glinting", "Burnished", etc.
    uint16_t level_req;      // Required item level (support up to 65535)
    uint16_t weight;         // Spawn weight for this tier
    uint8_t value_count;     // Number of value ranges (1-4)
    ValueRange values[4];    // Up to 4 value ranges per tier
} ModifierTierData;

// Modifier structure
typedef struct {
    uint16_t id;
    uint8_t type;              // ModifierType
    uint8_t source;            // ModifierSource
    uint32_t tags;             // Required item tags (bitflags)
    char name[128];            // Modifier family/group name (e.g., "IncreasedMana", "FireResistance")
    char description[256];
    uint8_t tier_count;        // Number of tiers (1-9)
    ModifierTierData* tiers;   // Pointer to tier array
} Modifier;

// Modifiers database
// Initialize modifiers database
void init_modifiers(void);

// Lookup functions
Modifier* get_modifier_by_source_index(ModifierSource source, uint16_t index);
bool modifier_applies_to_item(const Modifier* mod, const Item* item);
float get_modifier_probability(const Modifier* mod, const Item* item);

#endif // MODIFIERS_H
