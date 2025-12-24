#include "items.h"
#include <string.h>
#include <stdlib.h>

// Placeholder: Will be populated from Java items data
Item ITEMS[512];
const int ITEMS_COUNT = 0;

void init_items(void) {
    // TODO: Load items from compiled data
    // This will replace the 42 Java class files
    // Example:
    // ITEMS[0] = (Item){
    //     .id = 1,
    //     .item_class = CLASS_HELMET,
    //     .rarity = RARITY_RARE,
    //     .level = 68,
    //     .item_level = 85,
    //     .name = "Saintly Chainmail",
    //     .tags = TAG_ARMOUR | TAG_STR
    // };
}

Item* get_item_by_id(uint16_t id) {
    for (int i = 0; i < ITEMS_COUNT; i++) {
        if (ITEMS[i].id == id) {
            return &ITEMS[i];
        }
    }
    return NULL;
}

Item* get_item_by_name(const char* name) {
    for (int i = 0; i < ITEMS_COUNT; i++) {
        if (strcmp(ITEMS[i].name, name) == 0) {
            return &ITEMS[i];
        }
    }
    return NULL;
}
