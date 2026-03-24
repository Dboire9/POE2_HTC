#include "items.h"
#include "items_data.h"
#include <string.h>
#include <stdlib.h>

ItemInstance* init_item_instance(int item_id, int item_level, uint8_t rarity) 
{
    ItemInstance* instance = malloc(sizeof(ItemInstance));
    if (!instance) return NULL;

    instance->base_item            = &ITEMS_DB[item_id];
    instance->item_level           = item_level;
    instance->rarity               = rarity;
    instance->fractured            = false;
    instance->prefix_count         = 0;
    instance->suffix_count         = 0;
    instance->prefixes[0]          = NULL;
    instance->prefixes[1]          = NULL;
    instance->prefixes[2]          = NULL;
    instance->suffixes[0]          = NULL;
    instance->suffixes[1]          = NULL;
    instance->suffixes[2]          = NULL;
    instance->desired_prefix_tiers[0] = 0;
    instance->desired_prefix_tiers[1] = 0;
    instance->desired_prefix_tiers[2] = 0;
    instance->desired_suffix_tiers[0] = 0;
    instance->desired_suffix_tiers[1] = 0;
    instance->desired_suffix_tiers[2] = 0;

    return instance;
}

void free_item_instance(ItemInstance* instance) 
{
    free(instance);
}

Item* get_item_by_id(uint16_t id) {
    for (int i = 0; i < ITEMS_COUNT; i++) {
        if (ITEMS_DB[i].id == id) {
            return &ITEMS_DB[i];
        }
    }
    return NULL;
}

Item* get_item_by_name(const char* name) {
    for (int i = 0; i < ITEMS_COUNT; i++) {
        if (strcmp(ITEMS_DB[i].name, name) == 0) {
            return &ITEMS_DB[i];
        }
    }
    return NULL;
}
