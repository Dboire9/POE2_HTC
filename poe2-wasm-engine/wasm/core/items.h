#ifndef ITEMS_H
#define ITEMS_H

#include <stdint.h>

// Item rarity levels
typedef enum {
    RARITY_NORMAL = 0,
    RARITY_MAGIC = 1,
    RARITY_RARE = 2,
    RARITY_UNIQUE = 3
} ItemRarity;

// Item classes
typedef enum {
    CLASS_HELMET = 0,
    CLASS_BODY_ARMOUR = 1,
    CLASS_GLOVES = 2,
    CLASS_BOOTS = 3,
    CLASS_WEAPON_BOW = 4,
    CLASS_WEAPON_CROSSBOW = 5,
    CLASS_WEAPON_WAND = 6,
    CLASS_WEAPON_SCEPTRE = 7,
    CLASS_WEAPON_STAFF = 8,
    CLASS_WEAPON_QUARTERSTAFF = 9,
    CLASS_WEAPON_MACE_1H = 10,
    CLASS_WEAPON_MACE_2H = 11,
    CLASS_WEAPON_SPEAR = 12,
    CLASS_SHIELD = 13,
    CLASS_BUCKLER = 14,
    CLASS_FOCUS = 15,
    CLASS_QUIVER = 16,
    CLASS_AMULET = 17,
    CLASS_RING = 18,
    CLASS_BELT = 19
} ItemClass;

// Item structure (compact representation)
typedef struct {
    uint16_t id;
    uint8_t item_class;
    uint8_t rarity;
    uint8_t level;
    uint8_t item_level;
    char name[64];
    uint32_t tags;  // Bitflags for fast tag lookup
} Item;

// Item database
extern Item ITEMS[];
extern const int ITEMS_COUNT;

// Initialize items database (load from compiled data)
void init_items(void);

// Lookup functions
Item* get_item_by_id(uint16_t id);
Item* get_item_by_name(const char* name);

#endif // ITEMS_H
