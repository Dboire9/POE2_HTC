#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

ItemInstance** apply_augmentation(const ItemInstance* item, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_MAGIC) return NULL;

    // Can have 0 or 1 affix total (annulment can leave a magic item with 0 mods)
    int total = item->prefix_count + item->suffix_count;
    if (total > 1) return NULL;

    if (total == 1) {
        // Has exactly one mod: add the missing affix type
        bool add_suffix = item->prefix_count == 1;
        int result_count = 0;
        ItemInstance** results = get_all_possible_additions(item, SOURCE_NORMAL, add_suffix, &result_count);
        *out_count = result_count;
        return results;
    }

    // 0 mods: can add either a prefix or a suffix
    int prefix_count = 0, suffix_count = 0;
    ItemInstance** prefix_results = get_all_possible_additions(item, SOURCE_NORMAL, false, &prefix_count);
    ItemInstance** suffix_results = get_all_possible_additions(item, SOURCE_NORMAL, true,  &suffix_count);

    int combined = prefix_count + suffix_count;
    if (combined == 0) {
        free(prefix_results);
        free(suffix_results);
        return NULL;
    }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * combined);
    if (!results) {
        for (int i = 0; i < prefix_count; i++) free_item_instance(prefix_results[i]);
        for (int i = 0; i < suffix_count; i++) free_item_instance(suffix_results[i]);
        free(prefix_results);
        free(suffix_results);
        return NULL;
    }

    int idx = 0;
    for (int i = 0; i < prefix_count; i++) results[idx++] = prefix_results[i];
    for (int i = 0; i < suffix_count; i++) results[idx++] = suffix_results[i];

    free(prefix_results);
    free(suffix_results);

    *out_count = combined;
    return results;
}