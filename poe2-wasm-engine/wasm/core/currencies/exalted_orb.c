// exalted_orb.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Exalted orb: Rare item (fewer than 6 affixes) -> adds 1 mod (prefix or suffix), stays RARE
ItemInstance** apply_exalt(const ItemInstance* item, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_RARE) return NULL;

    // Must have room for at least one more affix
    int total_affixes = item->prefix_count + item->suffix_count;
    if (total_affixes >= 6) return NULL;

    // Can add a prefix if under the cap
    int prefix_count = 0;
    ItemInstance** prefix_results = NULL;
    if (item->prefix_count < 3)
        prefix_results = get_all_possible_additions(item, SOURCE_NORMAL, false, &prefix_count);

    // Can add a suffix if under the cap
    int suffix_count = 0;
    ItemInstance** suffix_results = NULL;
    if (item->suffix_count < 3)
        suffix_results = get_all_possible_additions(item, SOURCE_NORMAL, true, &suffix_count);

    int total = prefix_count + suffix_count;
    if (total == 0) {
        free(prefix_results);
        free(suffix_results);
        return NULL;
    }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * total);
    if (!results) {
        for (int i = 0; i < prefix_count; i++) free_item_instance(prefix_results[i]);
        for (int i = 0; i < suffix_count; i++) free_item_instance(suffix_results[i]);
        free(prefix_results);
        free(suffix_results);
        return NULL;
    }

    int idx = 0;
    for (int i = 0; i < prefix_count; i++) {
        results[idx] = prefix_results[i];
        // rarity stays RARE — no change needed
        idx++;
    }
    for (int i = 0; i < suffix_count; i++) {
        results[idx] = suffix_results[i];
        // rarity stays RARE — no change needed
        idx++;
    }

    free(prefix_results);
    free(suffix_results);

    *out_count = total;
    return results;
}
