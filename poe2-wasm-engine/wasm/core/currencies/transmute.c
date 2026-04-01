// transmute.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

ItemInstance** apply_transmute(const ItemInstance* item, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_NORMAL) return NULL;

    int prefix_count = 0, suffix_count = 0;

    ItemInstance** prefixes = get_all_possible_additions(item, SOURCE_NORMAL, false, &prefix_count);
    ItemInstance** suffixes = get_all_possible_additions(item, SOURCE_NORMAL, true,  &suffix_count);

    int total = prefix_count + suffix_count;
    if (total == 0) {
        free(prefixes);
        free(suffixes);
        return NULL;
    }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * total);
    if (!results) {
        for (int i = 0; i < prefix_count; i++) free_item_instance(prefixes[i]);
        for (int i = 0; i < suffix_count; i++) free_item_instance(suffixes[i]);
        free(prefixes);
        free(suffixes);
        return NULL;
    }

    int idx = 0;
    for (int i = 0; i < prefix_count; i++) {
        results[idx] = prefixes[i];
        results[idx]->rarity = RARITY_MAGIC;
        idx++;
    }
    for (int i = 0; i < suffix_count; i++) {
        results[idx] = suffixes[i];
        results[idx]->rarity = RARITY_MAGIC;
        idx++;
    }

    free(prefixes);
    free(suffixes);

    *out_count = total;
    return results;
}