#ifndef MODIFIERS_H
#define MODIFIERS_H

#include <stdint.h>
#include <stdbool.h>

// Modifier types
typedef enum {
    MOD_PREFIX = 0,
    MOD_SUFFIX = 1,
    MOD_IMPLICIT = 2
} ModifierType;

// Modifier tier
typedef enum {
    TIER_1 = 1,
    TIER_2 = 2,
    TIER_3 = 3,
    TIER_4 = 4,
    TIER_5 = 5
} ModifierTier;

// Modifier structure
typedef struct {
    uint16_t id;
    uint8_t type;        // ModifierType
    uint8_t tier;        // ModifierTier
    uint16_t weight;     // Spawn weight
    uint8_t level_req;   // Required item level
    uint32_t tags;       // Required item tags (bitflags)
    char name[128];
    char description[256];
} Modifier;

// Modifiers database
extern Modifier MODIFIERS[];
extern const int MODIFIERS_COUNT;

// Initialize modifiers database
void init_modifiers(void);

// Lookup functions
Modifier* get_modifier_by_id(uint16_t id);
bool modifier_applies_to_item(const Modifier* mod, const Item* item);
float get_modifier_probability(const Modifier* mod, const Item* item);

#endif // MODIFIERS_H
