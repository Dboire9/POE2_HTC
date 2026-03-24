 #ifndef ITEMS_H
 #define ITEMS_H

 #include <stdint.h>
 #include "modifiers.h"


struct Modifier;

// Item rarity levels
typedef enum {
    RARITY_NORMAL = 0,
    RARITY_MAGIC = 1,
    RARITY_RARE = 2,
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
    char name[64];
} Item;

// Instance of an item owned by a user, with affixes and level
typedef struct {
    const Item* base_item;
    int item_level;
    uint8_t rarity;
    const Modifier* prefixes[3];
    int desired_prefix_tiers[3]; // Store the desired tier for each prefix
	uint8_t prefix_count;
    const Modifier* suffixes[3];
    int desired_suffix_tiers[3]; // Store the desired tier for each suffix
	uint8_t suffix_count;
	bool fractured; // Whether this item instance has fractured modifiers
} ItemInstance;


// Lookup functions
Item* get_item_by_id(uint16_t id);
Item* get_item_by_name(const char* name);

// Initializing the Item Instance for beginning the crafting process

ItemInstance* init_item_instance(int item_id, int item_level, uint8_t rarity);
void free_item_instance(ItemInstance* instance);

#endif // ITEMS_H
