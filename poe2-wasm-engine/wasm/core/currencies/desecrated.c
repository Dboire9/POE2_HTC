// desecrated.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Shared logic: adds 1 mod from the merged NORMAL+DESECRATED pool,
// filtered by min_tier_level (0=Preserved, 40=Ancient, 64=Gnawed).
// Works on any rarity that has room for a mod.
static ItemInstance** apply_desecrated_internal(const ItemInstance* item, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item) return NULL;

    // Must have room for at least one more affix
    if (item->prefix_count >= 3 && item->suffix_count >= 3) return NULL;

    // Count first pass to allocate exactly
    int prefix_count = 0, suffix_count = 0;
    ItemInstance** prefix_results = NULL;
    ItemInstance** suffix_results = NULL;

    if (item->prefix_count < 3)
        prefix_results = get_all_possible_additions_desecrated(item, false, min_tier_level, &prefix_count);

    if (item->suffix_count < 3)
        suffix_results = get_all_possible_additions_desecrated(item, true,  min_tier_level, &suffix_count);

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
    for (int i = 0; i < prefix_count; i++) results[idx++] = prefix_results[i];
    for (int i = 0; i < suffix_count; i++) results[idx++] = suffix_results[i];

    free(prefix_results);
    free(suffix_results);

    *out_count = total;
    return results;
}

// Preserved: any tier level (min = 0)
ItemInstance** apply_desecrated_preserved(const ItemInstance* item, int* out_count)
{
    return apply_desecrated_internal(item, 0, out_count);
}

// Ancient: only mods with at least one accessible tier with level_req >= 40
ItemInstance** apply_desecrated_ancient(const ItemInstance* item, int* out_count)
{
    return apply_desecrated_internal(item, 40, out_count);
}

// Gnawed: only mods with at least one accessible tier with level_req >= 64
ItemInstance** apply_desecrated_gnawed(const ItemInstance* item, int* out_count)
{
    return apply_desecrated_internal(item, 64, out_count);
}
